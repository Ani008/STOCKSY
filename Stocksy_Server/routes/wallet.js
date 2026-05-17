const express = require('express');
const router = express.Router();
const { getWallets, createWallet, updateWallet, deleteWallet,} = require('../controllers/wallet');
const { protect } = require('../middleware/auth'); // JWT guard — already exists in your project

// Both routes are protected — user must be logged in
router.get('/', protect, getWallets);
router.post('/', protect, createWallet);
router.put('/:walletId', protect, updateWallet);
router.delete('/:walletId', protect, deleteWallet);

module.exports = router;
