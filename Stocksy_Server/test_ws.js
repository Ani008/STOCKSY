const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:5000');

ws.on('open', () => {
    console.log('Connected to Stocksy Server!');
});

ws.on('message', (data) => {
    const parsed = JSON.parse(data);
    console.log('Received:', JSON.stringify(parsed, null, 2));
});

ws.on('error', (err) => {
    console.error('Error:', err);
});