import { useEffect, useRef, useState } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
// For local dev: your machine's LAN IP so Expo on your phone can reach it.
// Find it with: ipconfig (Windows) / ifconfig (Mac/Linux)
// NEVER use "localhost" here — your phone is a different device.
const WS_URL = "ws://172.16.108.60:5000"; // ← Replace with your machine's LAN IP

/**
 * useMarketData — Custom hook that connects to Stocksy WebSocket server
 * and returns live market prices.
 *
 * Returns:
 *   prices  object   — e.g. { "NSE_INDEX|Nifty 50": { ltp: 23892.4, cp: 24173.05 } }
 *   isConnected boolean
 *   error   string | null
 *
 * Usage:
 *   const { prices, isConnected } = useMarketData();
 *   const nifty = prices["NSE_INDEX|Nifty 50"];
 */
const useMarketData = () => {
  const [prices, setPrices] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  const connect = () => {
    // Clean up any existing connection before reconnecting
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] Connected to Stocksy server");
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        // Only handle MARKET_DATA messages (per backend docs, Section 6.2)
        if (msg.type !== "MARKET_DATA") return;

        // msg.data shape: { "NSE_INDEX|Nifty 50": { ltpc: { ltp, ltt, cp } } }
        // Flatten to: { "NSE_INDEX|Nifty 50": { ltp, cp } } for easy consumption
        const flattened = {};
        for (const [key, val] of Object.entries(msg.data)) {
          if (val?.ltpc) {
            flattened[key] = {
              ltp: val.ltpc.ltp,
              cp: val.ltpc.cp,
              ltt: val.ltpc.ltt,
            };
          }
        }

        setPrices(flattened);
      } catch (e) {
        console.warn("[WS] Failed to parse message:", e);
      }
    };

    ws.onerror = (e) => {
      console.error("[WS] Error:", e.message);
      setError("WebSocket error — is the server running?");
    };

    ws.onclose = () => {
      console.log("[WS] Disconnected. Reconnecting in 3s...");
      setIsConnected(false);
      // Auto-reconnect after 3 seconds
      reconnectTimer.current = setTimeout(connect, 3000);
    };
  };

  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        // Prevent the onclose reconnect loop when we intentionally unmount
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { prices, isConnected, error };
};

export default useMarketData;