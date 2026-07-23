const express = require('express');
const router = express.Router();
const { getLeverage } = require('../config/leverage');

// GET /api/leverage/:symbol
// Returns both CNC and MIS multipliers for a symbol so the app can
// show live margin as the user types quantity, without duplicating
// the Nifty 50 classification list on the frontend.
router.get('/:symbol', (req, res) => {
  const { symbol } = req.params;

  res.json({
    symbol,
    cnc: getLeverage(symbol, 'CNC'),
    mis: getLeverage(symbol, 'MIS'),
  });
});

module.exports = router;