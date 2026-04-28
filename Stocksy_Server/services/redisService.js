const { createClient } = require('redis');
require('dotenv').config();

const client = createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        tls: false  // same as your python, no SSL
    },
    password: process.env.REDIS_PASSWORD
});

client.on('error', (err) => console.error('Redis error:', err));
client.on('connect', () => console.log('Redis connected successfully!'));

// Connect immediately
client.connect();

module.exports = client;