import api from "./api"; // Your existing Axios instance from services/api.js

/**
 * Fetch the logged-in user's demo balance and all wallets.
 * GET /api/wallet
 * Returns: { demoBalance: number, wallets: Array<{ _id, name, balance, createdAt }> }
 */
export const fetchWallets = async () => {
  const response = await api.get("/wallet");
  return response.data;
};

/**
 * Create a new sub-wallet (deducted from demoBalance).
 * POST /api/wallet
 * Body: { name: string, amount: number }
 * Returns: { message, demoBalance: number, wallets: Array }
 */
export const createWallet = async ({ name, amount }) => {
  const response = await api.post("/wallet", { name, amount });
  return response.data;
};

export const updateWallet = async ({ walletId, name }) => {
  const response = await api.put(`/wallet/${walletId}`, { name });

  return response.data;
};

export const deleteWallet = async (walletId) => {
  const response = await api.delete(`/wallet/${walletId}`);

  return response.data;
};
