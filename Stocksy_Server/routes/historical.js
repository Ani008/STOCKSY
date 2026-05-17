const express = require('express');
const router = express.Router();
const { getHistoricalData } = require('../controllers/historicalController');

// GET /api/historical/:instrumentKey/:range
// instrumentKey must be URL-encoded — e.g. NSE_EQ%7CINE002A01018
router.get('/:instrumentKey/:range', getHistoricalData);

module.exports = router;