require('dotenv').config();
const { createClient } = require('redis');

const redis = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

redis.connect();

module.exports = redis;