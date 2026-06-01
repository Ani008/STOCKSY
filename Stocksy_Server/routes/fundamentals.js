const express = require('express');

const router = express.Router();

const {
  ingestFundamentals,
  getFundamentals,
} = require('../controllers/fundamentals');

router.get('/:symbol',getFundamentals);
router.post('/', ingestFundamentals);


module.exports = router;