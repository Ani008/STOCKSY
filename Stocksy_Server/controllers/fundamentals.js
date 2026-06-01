const { client: redis } = require("../config/redis");
const pool = require("../config/postgres");

const ingestFundamentals = async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({
        message: "Invalid fundamentals payload",
      });
    }

    for (const stock of data) {
      const { symbol, metrics, financials, profile, shareholding } = stock;

      // PostgreSQL UPSERT
      await pool.query(
        `
        INSERT INTO stock_fundamentals (
          symbol,
          pe_ratio,
          pb_ratio,
          dividend_yield,
          market_cap,
          eps,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())

        ON CONFLICT (symbol)
        DO UPDATE SET
          pe_ratio = EXCLUDED.pe_ratio,
          pb_ratio = EXCLUDED.pb_ratio,
          dividend_yield = EXCLUDED.dividend_yield,
          market_cap = EXCLUDED.market_cap,
          eps = EXCLUDED.eps,
          updated_at = NOW()
        `,
        [
          symbol,
          metrics.pe_ratio,
          metrics.pb_ratio,
          metrics.dividend_yield,
          metrics.market_cap,
          metrics.eps,
        ],
      );

      // Redis Cache
      await redis.set(
        `fundamentals:${symbol}`,
        JSON.stringify({
          metrics,
          financials,
          profile,
          shareholding,
        }),
        "EX",
        60 * 60 * 24,
      );

      console.log(`✅ Synced ${symbol}`);
    }

    res.status(200).json({
      message: "Fundamentals synced successfully",
    });
  } catch (error) {
    console.error("[FUNDAMENTALS ERROR]", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const getFundamentals = async (req, res) => {
  try {
    const { symbol } = req.params;

    // 1. Check Redis first
    const cached = await redis.get(`fundamentals:${symbol}`);
    

    if (cached) {
      console.log(JSON.parse(cached));

      return res.json(JSON.parse(cached));
    }

    // 2. Fallback PostgreSQL
    const result = await pool.query(
      `
      SELECT *
      FROM stock_fundamentals
      WHERE symbol = $1
      `,
      [symbol],
    );

    if (!result.rows.length) {
      return res.status(404).json({
        message: "Fundamentals not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  ingestFundamentals,
  getFundamentals,
};
