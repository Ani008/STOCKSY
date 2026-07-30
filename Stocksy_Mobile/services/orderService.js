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

/**
 * Fetch every order the user has ever placed (not just fills/transactions),
 * newest first. Backs the Profile > Orders screen.
 * GET /api/orders
 * Each row includes `product_type`: 'CNC' (delivery) | 'MIS' (intraday) —
 * same split used for Delivery/Intraday on the Dashboard's asset card.
 */
export async function fetchOrders(limit = 100) {
  const response = await api.get("/orders", { params: { limit } });
  return response.data.orders;
}