import api from "./api";

export async function placeOrder(payload) {
  const response = await api.post("/orders", payload);
  return response.data;
}

/**
 * Fetch the logged-in user's open positions and wallet balances.
 * GET /api/orders/portfolio
 * Returns: { positions: Array, wallets: Array }
 */
export async function fetchPortfolio() {
  const response = await api.get("/portfolio");
  return response.data;
}