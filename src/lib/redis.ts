import Redis from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

// Shared Redis connection for BullMQ and queue operations
export const redisConnection = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null, // BullMQ requirement
  enableReadyCheck: false,
});

redisConnection.on('error', (err) => {
  console.error('[Redis Error]:', err.message);
});

redisConnection.on('connect', () => {
  console.log(`[Redis Connected] ${REDIS_HOST}:${REDIS_PORT}`);
});
