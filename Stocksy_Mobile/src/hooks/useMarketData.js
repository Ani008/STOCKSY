// src/hooks/useMarketData.js
//
// ══════════════════════════════════════════════════════════════════════════════
// WHY PRICES WEREN'T UPDATING IN THE APP — React side bugs
// ══════════════════════════════════════════════════════════════════════════════
//
// BUG 1 — Mutating state instead of replacing it
//   A common pattern that silently kills React re-renders:
//     setPrices(prev => { prev[key] = newVal; return prev; })  ← WRONG
//   React uses reference equality. If you mutate `prev` and return the same
//   object reference, React sees no change and skips the re-render entirely.
//   FIX: Always spread into a new object: { ...prev, [key]: newVal }
//
// BUG 2 — WebSocket created inside useEffect with no cleanup
//   If the component remounts (navigation, hot reload), a second WebSocket
//   opens while the first is still alive. Two sockets = duplicate messages,
//   or the old one dies and the new one never triggers a re-render.
//   FIX: Proper cleanup in useEffect return function.
//
// BUG 3 — Reconnect timer not cleared on unmount
//   If reconnect fires after unmount, it calls setState on an unmounted
//   component → memory leak + "Can't perform a React state update" warning.
//   FIX: Track reconnect timer ref and clear on cleanup.
//
// BUG 4 — WS_URL as localhost
//   React Native on a physical device cannot reach localhost — it resolves
//   to the device itself, not your Mac/PC. Must be LAN IP.
//   FIX: Use your machine's LAN IP. See config below.
//
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';

// ── CONFIG — change this to your machine's LAN IP ────────────────────────────
// Find it with: ifconfig | grep "inet " (Mac/Linux) or ipconfig (Windows)
// Must be your local network IP, e.g. 192.168.1.42
// NEVER use 'localhost' or '127.0.0.1' on a physical device
const WS_URL = 'ws://192.168.10.170:5000'; // ← UPDATE THIS
// const WS_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const RECONNECT_DELAY_MS = 3000;

export default function useMarketData() {
  const [prices, setPrices] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Refs so cleanup functions always have access to latest values
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  const connect = useCallback(() => {
    // Don't reconnect if already open
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    // Clean up any existing socket before creating new one
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      wsRef.current.close();
    }

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) return;
        console.log('[useMarketData] Connected to Stocksy WebSocket');
        setIsConnected(true);
        setError(null);
        // Clear any pending reconnect timer
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        try {
          const msg = JSON.parse(event.data);

          if (msg.error) {
            setError(msg.error);
            return;
          }

          if (msg.type === 'MARKET_DATA' && msg.data) {
            // ── THE KEY FIX: spread into NEW object so React detects the change
            // Do NOT do: setPrices(prev => { prev[k] = ...; return prev })
            // That mutates the same reference → React skips the re-render
            setPrices(prev => {
              const updated = { ...prev };
              for (const [instrumentKey, feedData] of Object.entries(msg.data)) {
                // Flatten ltpc for easy access: prices["NSE_INDEX|Nifty 50"].ltp
                const ltpc = feedData.ltpc || {};
                updated[instrumentKey] = {
                  ltp: parseFloat(ltpc.ltp) || 0,
                  cp: parseFloat(ltpc.cp) || 0,
                  ltt: ltpc.ltt || null,
                  symbol: feedData.symbol || instrumentKey,
                  name: feedData.name || instrumentKey,
                  sector: feedData.sector || 'Equity',
                  _ts: msg.timestamp, // include timestamp so even same-price ticks trigger re-render
                };
              }
              return updated;
            });
            setError(null);
          }
        } catch (parseErr) {
          console.warn('[useMarketData] Failed to parse message:', parseErr);
        }
      };

      ws.onerror = (err) => {
        if (!isMountedRef.current) return;
        console.warn('[useMarketData] WebSocket error:', err.message || err);
        setError('Connection error');
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        if (!isMountedRef.current) return;
        console.log(`[useMarketData] Disconnected (code ${event.code}). Reconnecting in ${RECONNECT_DELAY_MS}ms...`);
        setIsConnected(false);
        // Schedule reconnect
        reconnectTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) connect();
        }, RECONNECT_DELAY_MS);
      };
    } catch (err) {
      console.error('[useMarketData] Failed to create WebSocket:', err);
      setError('Failed to connect');
      // Retry after delay
      reconnectTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) connect();
      }, RECONNECT_DELAY_MS);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      // Full cleanup on unmount — prevents memory leaks and ghost sockets
      isMountedRef.current = false;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      if (wsRef.current) {
        // Remove handlers before closing so onclose doesn't trigger reconnect
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { prices, isConnected, error };
}