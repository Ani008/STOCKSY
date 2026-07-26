const {getWalletsByUserId, createWallet: createWalletRepo, updateWalletName, deleteWallet: deleteWalletRepo,} = require('../repositories/walletRepository');
const { sendError } = require('../utils/errors');
const logger = require('../utils/logger');

const getWallets = async (req, res) => {
  try {
    const financialUser = req.user;

    if (!financialUser) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        severity: 'error',
      });
    }

    // Fetch wallets from PostgreSQL
    const wallets = await getWalletsByUserId(financialUser.id);

    res.status(200).json({
      demoBalance: Number(financialUser.demo_balance),
      wallets,
    });
  } catch (error) {
    logger.error(`[GET WALLETS] ${error.message}`);
    return sendError(res, error, logger);
  }
};

const createWallet = async (req, res) => {
  const { name, amount } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      message: 'Wallet name is required',
      code: 'VALIDATION_ERROR',
      severity: 'error',
    });
  }

  const parsedAmount = Number(amount);

  if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({
      message: 'A valid wallet amount is required',
      code: 'VALIDATION_ERROR',
      severity: 'error',
    });
  }

  try {
    const financialUser = req.user;

    if (!financialUser) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        severity: 'error',
      });
    }

    // Balance validation
    if (parsedAmount > financialUser.demo_balance) {
      return res.status(400).json({
        message: 'Insufficient demo balance to create this wallet',
        code: 'INSUFFICIENT_FUNDS',
        severity: 'error',
      });
    }

    // Create wallet in PostgreSQL
    const walletResult = await createWalletRepo({
      userId: financialUser.id,
      name: name.trim(),
      amount: parsedAmount,
    });

    // Fetch updated wallets
    const updatedWallets =
      await getWalletsByUserId(financialUser.id);

    res.status(201).json({
      message: 'Wallet created successfully',
      demoBalance: Number(walletResult.demoBalance),
      wallets: updatedWallets,
    });
  } catch (error) {
    logger.error(`[CREATE WALLET] ${error.message}`);
    return sendError(res, error, logger);
  }
};

const updateWallet = async (req, res) => {
  const { walletId } = req.params;
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      message: 'Wallet name is required',
      code: 'VALIDATION_ERROR',
      severity: 'error',
    });
  }

  try {
    const financialUser = req.user;

    if (!financialUser) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        severity: 'error',
      });
    }

    const updatedWallet =
      await updateWalletName({
        walletId,
        userId: financialUser.id,
        name: name.trim(),
      });

    if (!updatedWallet) {
      return res.status(404).json({
        message: 'Wallet not found',
        code: 'WALLET_NOT_FOUND',
        severity: 'error',
      });
    }

    res.status(200).json({
      message: 'Wallet updated successfully',
      wallet: updatedWallet,
    });
  } catch (error) {
    logger.error(`[UPDATE WALLET] ${error.message}`);
    return sendError(res, error, logger);
  }
};

const deleteWallet = async (req, res) => {
  const { walletId } = req.params;

  try {
    const financialUser = req.user;

    if (!financialUser) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        severity: 'error',
      });
    }

    await deleteWalletRepo({
      walletId,
      userId: financialUser.id,
    });

    const updatedWallets =
      await getWalletsByUserId(financialUser.id);

    res.status(200).json({
      message: 'Wallet deleted successfully',
      wallets: updatedWallets,
    });
  } catch (error) {
    logger.error(`[DELETE WALLET] ${error.message}`);
    return sendError(res, error, logger);
  }
};

module.exports = {
  getWallets,
  createWallet,
  updateWallet,
  deleteWallet,
};