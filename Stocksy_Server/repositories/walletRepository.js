const { pool } = require("../config/postgres");
const { invalidateTransactionsCache } = require("../utils/transactionsCache");

const getWalletsByUserId = async (userId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM wallets
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
    [userId],
  );

  return result.rows;
};

const createWallet = async ({ userId, name, amount }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock user row
    const userResult = await client.query(
      `
      SELECT *
      FROM users
      WHERE id = $1
      FOR UPDATE
      `,
      [userId],
    );

    const user = userResult.rows[0];

    if (!user) {
      throw new Error("Financial user not found");
    }

    // Balance validation
    if (Number(amount) > Number(user.demo_balance)) {
      throw new Error("Insufficient demo balance");
    }

    // Deduct balance
    const updatedBalance = Number(user.demo_balance) - Number(amount);

    await client.query(
      `
      UPDATE users
      SET demo_balance = $1
      WHERE id = $2
      `,
      [updatedBalance, userId],
    );

    // Create wallet
    const walletResult = await client.query(
      `
INSERT INTO wallets (
  user_id,
  name,
  balance,
  initial_balance
)
VALUES ($1, $2, $3, $3)
      RETURNING *
      `,
      [userId, name, amount],
    );

    // Ledger entry — money moved out of demo balance into this wallet
    await client.query(
      `
      INSERT INTO account_transactions
      (
        user_id,
        type,
        amount,
        balance_after,
        wallet_name,
        note
      )
      VALUES ($1, 'wallet_created', $2, $3, $4, $5)
      `,
      [
        userId,
        amount,
        updatedBalance,
        name,
        `Created wallet "${name}"`,
      ],
    );

    await client.query("COMMIT");

    // Cache was populated before this write happened — drop it so the
    // next read reflects the wallet_created transaction we just added.
    await invalidateTransactionsCache(userId);

    return {
      wallet: walletResult.rows[0],
      demoBalance: updatedBalance,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const updateWalletName = async ({ walletId, userId, name }) => {
  const result = await pool.query(
    `
    UPDATE wallets
    SET name = $1
    WHERE id = $2
    AND user_id = $3
    RETURNING *
    `,
    [name, walletId, userId],
  );

  return result.rows[0];
};

const deleteWallet = async ({ walletId, userId }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock wallet row
    const walletResult = await client.query(
      `
      SELECT *
      FROM wallets
      WHERE id = $1
      AND user_id = $2
      FOR UPDATE
      `,
      [walletId, userId],
    );

    const wallet = walletResult.rows[0];

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    // Refund wallet balance back to demo balance
    const refundResult = await client.query(
      `
      UPDATE users
      SET demo_balance = demo_balance + $1
      WHERE id = $2
      RETURNING demo_balance
      `,
      [wallet.balance, userId],
    );

    // Ledger entry — money refunded back into demo balance.
    // Stored against user_id (not wallet_id) so it survives the delete below.
    await client.query(
      `
      INSERT INTO account_transactions
      (
        user_id,
        type,
        amount,
        balance_after,
        wallet_name,
        note
      )
      VALUES ($1, 'wallet_deleted', $2, $3, $4, $5)
      `,
      [
        userId,
        wallet.balance,
        refundResult.rows[0].demo_balance,
        wallet.name,
        `Deleted wallet "${wallet.name}" — refunded`,
      ],
    );

    // Delete wallet
    await client.query(
      `
      DELETE FROM wallets
      WHERE id = $1
      `,
      [walletId],
    );

    await client.query("COMMIT");

    // Same reasoning as create — the wallet_deleted transaction we just
    // wrote won't show up in a stale cached list otherwise.
    await invalidateTransactionsCache(userId);

    return wallet;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  getWalletsByUserId,
  createWallet,
  updateWalletName,
  deleteWallet,
};