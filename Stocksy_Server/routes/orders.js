/**
 * routes/orders.js
 * All OMS routes — mount in server.js:
 *   app.use('/api', require('./routes/orders'));
 */

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  createOrder,
  listOrders,
  cancelOrderHandler,
  getPortfolio,
  getPositionsHandler,
  getTradesHandler,
  orderController,
} = require('../controllers/orderController');


// ── Orders ────────────────────────────────────────────────────────────────────
// POST   /api/orders          — place a new order
// GET    /api/orders          — list orders (with filters)
// DELETE /api/orders/:id      — cancel an open/pending order
router.post  ('/orders',     protect, createOrder);
router.get   ('/orders',     protect, listOrders);
router.delete('/orders/:id', protect, cancelOrderHandler);

// ── Portfolio ─────────────────────────────────────────────────────────────────
// GET /api/portfolio           — full portfolio summary (all wallets)
// GET /api/positions           — open positions (optionally filtered by wallet_id)
// GET /api/trades              — trade history
router.get('/portfolio',  protect, getPortfolio);
router.get('/positions',  protect, getPositionsHandler);
router.get('/trades',     protect, getTradesHandler);

module.exports = router;
