import api from "./api";

/**
 * GET /api/leverage/:symbol
 * Returns: { symbol, cnc: 1, mis: 5 | 2.5 }
 */
export async function fetchLeverage(symbol) {
  const response = await api.get(`/leverage/${symbol}`);
  return response.data;
}