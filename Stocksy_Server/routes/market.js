const express = require('express');
const router = express.Router();
const { getMarketStatus } = require('../services/marketCalendarService');

// GET /api/market/status
// Weekend + NSE/BSE-holiday aware market status. Lets the frontend show
// the "market is closed" message box proactively on the buy order screen
// — rather than only finding out after the user taps "Place Buy Order"
// and the request bounces off MARKET_CLOSED.
//
// Response when closed:
// {
//   isOpen: false,
//   reason: { type: 'WEEKEND'|'HOLIDAY'|'BEFORE_HOURS'|'AFTER_HOURS', label: string },
//   nextOpen: { isoDate, time, iso, dateLabel, timeLabel }
// }
// Response when open:
// { isOpen: true, reason: null, nextOpen: null }
router.get('/status', (req, res) => {
  res.json(getMarketStatus());
});

module.exports = router;