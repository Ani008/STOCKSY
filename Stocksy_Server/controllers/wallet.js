const {findFinancialUserByMongoId,} = require('../repositories/userRepository');

const {getWalletsByUserId, createWallet: createWalletRepo, updateWalletName, deleteWallet: deleteWalletRepo,} = require('../repositories/walletRepository');

const getWallets = async (req, res) => {
  try {
    // Mongo user id from JWT auth middleware
    const mongoUserId = req.user._id.toString();

    // Find matching PostgreSQL financial user
    const financialUser =
      await findFinancialUserByMongoId(mongoUserId);

    if (!financialUser) {
      return res.status(404).json({
        message: 'Financial user not found',
      });
    }

    // Fetch wallets from PostgreSQL
    const wallets = await getWalletsByUserId(financialUser.id);

    res.status(200).json({
      demoBalance: Number(financialUser.demo_balance),
      wallets,
    });
  } catch (error) {
    console.error('[GET WALLETS ERROR]', error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const createWallet = async (req, res) => {
  const { name, amount } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      message: 'Wallet name is required',
    });
  }

  const parsedAmount = Number(amount);

  if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({
      message: 'Valid wallet amount required',
    });
  }

  try {
    // Mongo user id from JWT
    const mongoUserId = req.user._id.toString();

    // Find PostgreSQL financial user
    const financialUser =
      await findFinancialUserByMongoId(mongoUserId);

    if (!financialUser) {
      return res.status(404).json({
        message: 'Financial user not found',
      });
    }

    // Balance validation
    if (parsedAmount > financialUser.demo_balance) {
      return res.status(400).json({
        message: 'Insufficient demo balance',
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
    console.error('[CREATE WALLET ERROR]', error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const updateWallet = async (req, res) => {
  const { walletId } = req.params;
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      message: 'Wallet name is required',
    });
  }

  try {
    const mongoUserId = req.user._id.toString();

    const financialUser =
      await findFinancialUserByMongoId(mongoUserId);

    if (!financialUser) {
      return res.status(404).json({
        message: 'Financial user not found',
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
      });
    }

    res.status(200).json({
      message: 'Wallet updated successfully',
      wallet: updatedWallet,
    });
  } catch (error) {
    console.error('[UPDATE WALLET ERROR]', error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteWallet = async (req, res) => {
  const { walletId } = req.params;

  try {
    const mongoUserId = req.user._id.toString();

    const financialUser =
      await findFinancialUserByMongoId(mongoUserId);

    if (!financialUser) {
      return res.status(404).json({
        message: 'Financial user not found',
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
    console.error('[DELETE WALLET ERROR]', error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getWallets,
  createWallet,
  updateWallet,
  deleteWallet,
};