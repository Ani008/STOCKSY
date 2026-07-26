import api from "./api";

/**
 * Fetch the logged-in user's transaction feed — wallet creation/deletion
 * plus stock buy/sell fills, newest first.
 * GET /api/wallet/transactions?limit=
 *
 * Returns: Array<{
 *   id, type, title, direction: 'credit' | 'debit',
 *   amount, balanceAfter, walletName, symbol, note, createdAt
 * }>
 */
export const fetchTransactions = async (limit) => {
  const response = await api.get("/wallet/transactions", {
    params: limit ? { limit } : {},
  });
  return response.data.transactions;
};