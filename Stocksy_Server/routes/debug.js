const express = require('express');
const router = express.Router();
const { runSquareOff } = require('../services/squareOffService');
const logger = require('../utils/logger');

// POST /api/debug/square-off
// Manually triggers the MIS auto square-off job — for testing only,
// so you don't have to wait until 3:20pm IST every time you want to
// verify it works. Remove this route (or keep the NODE_ENV guard)
// before this app is ever exposed to real users — nobody should be
// able to force-close every user's intraday positions on demand.
router.post('/square-off', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  try {
    logger.info('[DEBUG] Manual square-off triggered via API');
    const result = await runSquareOff();
    res.json({ triggered: true, ...result });
  } catch (err) {
    logger.error(`[DEBUG] Manual square-off failed: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;