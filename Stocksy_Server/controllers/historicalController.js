const redisClient = require('../services/redisService');

/**
 * GET /api/historical/:instrumentKey/:range
 *
 * Reads pre-fetched OHLC candle data from Redis.
 * Python historical_fetcher.py populates this data on a schedule.
 *
 * Params:
 *   instrumentKey — URL-encoded instrument key e.g. NSE_EQ%7CINE002A01018
 *   range         — 1D | 1W | 1M | 3M | 1Y
 */
const getHistoricalData = async (req, res) => {
    try {
        const { instrumentKey, range } = req.params;

        // Decode URL-encoded instrument key
        const decodedKey = decodeURIComponent(instrumentKey);

        const validRanges = ['1D', '1W', '1M', '3M', '1Y'];
        if (!validRanges.includes(range)) {
            return res.status(400).json({ error: 'Invalid range. Use 1D, 1W, 1M, 3M or 1Y' });
        }

        const redisKey = `hist:${decodedKey}:${range}`;
        const cached = await redisClient.get(redisKey);

        if (!cached) {
            return res.status(404).json({
                error: 'No historical data yet',
                message: 'Python historical_fetcher.py may still be running its first cycle'
            });
        }

        const candles = JSON.parse(cached);

        return res.status(200).json({
            instrumentKey: decodedKey,
            range,
            count: candles.length,
            candles,
        });

    } catch (err) {
        console.error('Historical data error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { getHistoricalData };