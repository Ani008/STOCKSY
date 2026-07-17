const { placeOrder, cancelOrder, getOrders } = require('../services/orderService');
const { getPositions, getPortfolioSummary, getTrades } = require('../services/positionService');
const { ValidationError, InsufficientFundsError, MarketClosedError } = require('../utils/errors');
const logger = require('../utils/logger');

// ── POST /api/orders ──────────────────────────────────────────────────────────
async function createOrder(req, res) {
  try {
    const userId = req.user.id; // set by protect() middleware
    const { wallet_id, ...orderPayload } = req.body;

    if (!wallet_id) return res.status(400).json({ message: 'wallet_id is required' });

    const order = await placeOrder(userId, wallet_id, orderPayload);
    return res.status(201).json({
      message: 'Order placed successfully',
      order: sanitiseOrder(order),
    });
  } catch (err) {
    return handleOrderError(res, err);
  }
}

// ── GET /api/orders ───────────────────────────────────────────────────────────
async function listOrders(req, res) {
  try {
    const userId = req.user.id;
    const { wallet_id, status, limit = 20, offset = 0 } = req.query;
    const orders = await getOrders(userId, { walletId: wallet_id, status, limit: +limit, offset: +offset });
    return res.json({ orders });
  } catch (err) {
    logger.error(`listOrders error: ${err.message}`);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

// ── DELETE /api/orders/:id ────────────────────────────────────────────────────
async function cancelOrderHandler(req, res) {
  try {
    const result = await cancelOrder(req.user.id, req.params.id);
    return res.json(result);
  } catch (err) {
    return handleOrderError(res, err);
  }
}

// ── GET /api/portfolio ────────────────────────────────────────────────────────
async function getPortfolio(req, res) {
  try {
    const summary = await getPortfolioSummary(req.user.id);
    return res.json(summary);
  } catch (err) {
    logger.error(`getPortfolio error: ${err.message}`);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

// ── GET /api/positions ────────────────────────────────────────────────────────
async function getPositionsHandler(req, res) {
  try {
    const { wallet_id } = req.query;
    const positions = await getPositions(req.user.id, wallet_id);
    return res.json({ positions });
  } catch (err) {
    logger.error(`getPositions error: ${err.message}`);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

// ── GET /api/trades ───────────────────────────────────────────────────────────
async function getTradesHandler(req, res) {
  try {
    const { wallet_id, instrument_key, limit = 20, offset = 0 } = req.query;
    const trades = await getTrades(req.user.id, {
      walletId: wallet_id, instrumentKey: instrument_key,
      limit: +limit, offset: +offset
    });
    return res.json({ trades });
  } catch (err) {
    logger.error(`getTrades error: ${err.message}`);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function sanitiseOrder(order) {
  // Strip internal fields from API response
  const { metadata, ...rest } = order;
  return rest;
}

function handleOrderError(res, err) {
  if (err instanceof ValidationError)
    return res.status(400).json({ message: err.message });
  if (err instanceof InsufficientFundsError)
    return res.status(422).json({ message: err.message, code: 'INSUFFICIENT_FUNDS' });
  if (err instanceof MarketClosedError)
    return res.status(422).json({ message: 'Market is closed', code: 'MARKET_CLOSED' });
  logger.error(`Unhandled order error: ${err.message}`);
  return res.status(500).json({ message: 'Something went wrong' });
}

module.exports = {
  createOrder,
  listOrders,
  cancelOrderHandler,
  getPortfolio,
  getPositionsHandler,
  getTradesHandler,
};
