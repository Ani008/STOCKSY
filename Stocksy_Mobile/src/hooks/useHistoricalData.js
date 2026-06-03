import { useState, useEffect } from "react";

// Your Node server — same base URL as your auth API
const API_BASE = "http://192.168.43.192:5000/api"; // ← same IP as useMarketData
// const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function useHistoricalData(instrumentKey, range = "1M") {
    const [candles, setCandles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!instrumentKey) return;
        let cancelled = false;

        const fetchCandles = async () => {
            setLoading(true);
            setError(null);

            try {
                // URL-encode the instrument key — it contains | which breaks URLs
                const encodedKey = encodeURIComponent(instrumentKey);
                const url = `${API_BASE}/historical/${encodedKey}/${range}`;

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const json = await response.json();
                if (!cancelled) setCandles(json.candles ?? []);

            } catch (err) {
                if (!cancelled) {
                    console.error("Historical fetch error:", err);
                    setError(err.message);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchCandles();
        return () => { cancelled = true; };

    }, [instrumentKey, range]);

    return { candles, loading, error };
}