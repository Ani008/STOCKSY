const { pool } = require("../config/postgres");

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

    await client.query("COMMIT");

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
    await client.query(
      `
      UPDATE users
      SET demo_balance = demo_balance + $1
      WHERE id = $2
      `,
      [wallet.balance, userId],
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
