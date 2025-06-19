import Redis from 'ioredis';
import { config } from './config.js';

const redis = new Redis(config.redisUrl, {
  tls: {}
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export default redis;
