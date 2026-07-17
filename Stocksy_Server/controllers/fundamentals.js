const { client: redis } = require("../config/redis");

const ingestFundamentals = async (req, res) => {
  try {
    const snapshot = req.body;

    await redis.set("fundamentals:ALL", JSON.stringify(snapshot));

    console.log(`✅ Cached ${Object.keys(snapshot.stocks).length} stocks`);
    res.json({
      success: true,
      stocks: Object.keys(snapshot.stocks).length,
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

        const snapshot = await redis.get(
            "fundamentals:ALL"
        );

        if (!snapshot) {
            return res.status(404).json({
                message: "Fundamentals cache not loaded"
            });
        }

        const parsed = JSON.parse(snapshot);

        const stock =
            parsed.stocks[symbol];

        if (!stock) {
            return res.status(404).json({
                message: "Stock not found"
            });
        }

        return res.json(stock);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: err.message
        });

    }
};

module.exports = {
  ingestFundamentals,
  getFundamentals,
};
