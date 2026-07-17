import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/env";


export default function useFundamentals(symbol) {
  const [fundamentals, setFundamentals] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;

    const fetchFundamentals = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE_URL}/fundamentals/${symbol}`)

        const data = await response.json();

        console.log("FUNDAMENTALS API RESPONSE:", data);

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch fundamentals");
        }

        setFundamentals(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setFundamentals(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFundamentals();
  }, [symbol]);

  return {
    fundamentals,
    loading,
    error,
  };
}
