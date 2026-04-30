const WebSocket = require('ws');
const redisClient = require('./redisService');
const INSTRUMENTS = require('../config/instruments');  // ADD THIS

function initWebSocket(server) {
    const wss = new WebSocket.Server({ server });
    console.log('WebSocket server ready');

    wss.on('connection', (ws) => {
        console.log('React Native client connected');

        const interval = setInterval(async () => {
            try {
                const keys = await redisClient.keys('stock:*');

                if (keys.length === 0) {
                    ws.send(JSON.stringify({
                        error: 'No data in Redis yet. Is Python running?'
                    }));
                    return;
                }

                const stockData = {};

                for (const key of keys) {
                    const value = await redisClient.get(key);
                    if (value) {
                        const instrumentKey = key.replace('stock:', '');
                        const meta = INSTRUMENTS[instrumentKey]; // ADD THIS

                        stockData[instrumentKey] = {
                            ...JSON.parse(value),
                            symbol: meta?.symbol || instrumentKey,   // ADD THIS
                            name: meta?.name || instrumentKey,       // ADD THIS
                            sector: meta?.sector || "Unknown",       // ADD THIS
                        };
                    }
                }

                ws.send(JSON.stringify({
                    type: 'MARKET_DATA',
                    timestamp: Date.now(),
                    data: stockData
                }));

            } catch (err) {
                console.error('Error fetching from Redis:', err);
            }
        }, 1000);

        ws.on('close', () => {
            console.log('React Native client disconnected');
            clearInterval(interval);
        });

        ws.on('error', (err) => {
            console.error('WebSocket error:', err);
            clearInterval(interval);
        });
    });

    return wss;
}

module.exports = { initWebSocket };