import { createClient, RedisClientType } from 'redis';

let client: RedisClientType | null = null;
let isConnected = false;
let connectionAttempted = false;

function createRedisClient(): RedisClientType {
  const redisClient = createClient({
    url: 'redis://localhost:6379',
    socket: {
      reconnectStrategy: false // Don't auto-reconnect, we'll handle it manually
    }
  });

  redisClient.on('error', (err) => {
    if (isConnected) {
      console.log('[Redis] Connection lost:', err.message);
    }
    isConnected = false;
  });

  redisClient.on('connect', () => {
    console.log('[Redis] Connected successfully');
    isConnected = true;
  });

  return redisClient as RedisClientType;
}

async function getRedisClient(): Promise<RedisClientType | null> {
  if (isConnected && client) {
    return client;
  }

  // Only attempt connection once to avoid spam
  if (connectionAttempted) {
    return null;
  }

  connectionAttempted = true;
  client = createRedisClient();

  try {
    await client.connect();
    return client;
  } catch (err: any) {
    console.log('[Redis] Not available - running in demo mode (no session persistence)');
    client = null;
    return null;
  }
}

function isRedisConnected(): boolean {
  return isConnected;
}

// Initialize connection attempt (non-blocking)
getRedisClient().catch(() => {});

export { getRedisClient, isRedisConnected };
