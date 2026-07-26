const express = require('express');
const router = express.Router();
const { getWallets, createWallet, updateWallet, deleteWallet,} = require('../controllers/wallet');
const { getTransactions } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth'); // JWT guard — already exists in your project

// All routes are protected — user must be logged in
router.get('/', protect, getWallets);
router.get('/transactions', protect, getTransactions); // must stay above /:walletId
router.post('/', protect, createWallet);
router.put('/:walletId', protect, updateWallet);
router.delete('/:walletId', protect, deleteWallet);

module.exports = router;