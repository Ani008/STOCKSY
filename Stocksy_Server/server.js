require('dotenv').config();
const express = require('express');
const { connectRedis } = require('./config/redis');
const { initWebSocket } = require('./services/websocketService');

const { client: redisClient } = require('./config/redis');


const app = express();

const startServer = async () => {
    try {
        // 1. Connect to Redis first
        await connectRedis();

        // 2. Start the WebSocket listener
        // Make sure your ACCESS_TOKEN is in your .env
        await initWebSocket(process.env.UPSTOX_ACCESS_TOKEN);

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Stocksy Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("❌ Failed to start server:", err);
    }
};


app.get('/test-redis', async (req, res) => {
    // Manually set a dummy price
    await redisClient.set("NSE_EQ|INE002A01018", "2950.50");
    
    // Try to get it back
    const price = await redisClient.get("NSE_EQ|INE002A01018");
    res.json({ message: "Redis is working!", savedPrice: price });
});

startServer();