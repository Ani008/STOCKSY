import { useEffect, useState } from 'react';

const API_BASE =
  'http://192.168.43.192:5000/api';

// const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function useFundamentals(
  symbol
) {
  const [fundamentals, setFundamentals] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  useEffect(() => {
    if (!symbol) return;

    const fetchFundamentals = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE}/fundamentals/${symbol}`
        );

        const data =
          await response.json();

        console.log("FUNDAMENTALS API RESPONSE:",JSON.stringify(data, null, 2));

        setFundamentals(data);
      } catch (err) {
        setError(err.message);
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