const WebSocket = require('ws');
const redisClient = require('./redisService');

function initWebSocket(server) {
    const wss = new WebSocket.Server({ server });
    
    console.log('WebSocket server ready');

    wss.on('connection', (ws) => {
        console.log('React Native client connected');

        // Send data every second to this client
        const interval = setInterval(async () => {
            try {
                // Fetch all stock keys from Redis
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
                        // key is "stock:NSE_INDEX|Nifty 50"
                        // we clean it to just "NSE_INDEX|Nifty 50"
                        const instrumentName = key.replace('stock:', '');
                        stockData[instrumentName] = JSON.parse(value);
                    }
                }

                // Send to React Native
                ws.send(JSON.stringify({
                    type: 'MARKET_DATA',
                    timestamp: Date.now(),
                    data: stockData
                }));

            } catch (err) {
                console.error('Error fetching from Redis:', err);
            }
        }, 1000); // every 1 second

        // Clean up when client disconnects
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