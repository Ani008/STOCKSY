import api from "./api";

/**
 * GET /api/market/status
 * Weekend + NSE/BSE-holiday aware market status.
 * Returns:
 *   { isOpen: true,  reason: null, nextOpen: null }
 *   { isOpen: false, reason: { type, label }, nextOpen: { isoDate, time, iso, dateLabel, timeLabel } }
 */
export async function fetchMarketStatus() {
  const response = await api.get("/market/status");
  return response.data;
}