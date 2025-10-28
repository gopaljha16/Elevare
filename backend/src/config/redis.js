const redis = require("redis");

// Track Redis connection status
let isRedisConnected = false;

// Debug environment variables
console.log('Redis Environment Variables:');
console.log('REDIS_HOST:', process.env.REDIS_HOST);
console.log('REDIS_PORT:', process.env.REDIS_PORT);
console.log('REDIS_PASSWORD:', process.env.REDIS_PASSWORD ? '[SET]' : '[NOT SET]');

// Validate and parse Redis configuration
const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : null;
const redisPassword = process.env.REDIS_PASSWORD;

if (!redisHost || !redisPort || !redisPassword) {
    console.warn('⚠️ Redis configuration incomplete. Redis features will be disabled.');
    console.warn('Missing:', {
        port: !redisPort,
        password: !redisPassword
    });
}

// Create Redis client - handle missing configuration gracefully
let redisClient;

// Create a mock Redis client for development
const createMockRedisClient = () => {
    console.warn('⚠️ Using mock Redis client - Redis features will be limited');
    return {
        connect: async () => {
            console.log('🔌 Using mock Redis client - no actual connection');
            isRedisConnected = true;
            return Promise.resolve();
        },
        on: (event, callback) => {
            if (event === 'ready') {
                setTimeout(() => callback(), 100);
            }
        },
        setEx: (key, ttl, value) => {
            console.log(`[Mock Redis] SETEX ${key} ${ttl} ${value}`);
            return Promise.resolve('OK');
        },
        get: (key) => {
            console.log(`[Mock Redis] GET ${key}`);
            return Promise.resolve(null);
        },
        del: (key) => {
            console.log(`[Mock Redis] DEL ${key}`);
            return Promise.resolve(1);
        },
        disconnect: () => {
            console.log('🔌 Disconnected from mock Redis');
            isRedisConnected = false;
            return Promise.resolve();
        },
        isReady: true,
        isOpen: true
    };
};

// Check if we should use a real Redis connection
const useRealRedis = process.env.NODE_ENV === 'production' && redisHost && redisPort && redisPassword;

if (useRealRedis) {
    try {
        // Use URL format for cloud Redis with TLS - let Redis handle TLS automatically
        const redisUrl = `rediss://default:${redisPassword}@${redisHost}:${redisPort}`;

        redisClient = redis.createClient({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        console.error('❌ Max Redis reconnection attempts reached. Using mock client.');
                        redisClient = createMockRedisClient();
                        return false;
                    }
                    // Reconnect after 1 second
                    return 1000;
                }
            }
        });

        // Handle Redis connection events
        redisClient.on('connect', () => {
            console.log('🔄 Connecting to Redis...');
        });

        redisClient.on('error', (err) => {
            console.error('❌ Redis connection error:', err.message);
            isRedisConnected = false;
            // Fall back to mock client on error
            if (!redisClient.isMock) {
                console.log('🔄 Falling back to mock Redis client');
                redisClient = createMockRedisClient();
            }
        });

        redisClient.on('ready', () => {
            console.log('✅ Redis client ready');
            isRedisConnected = true;
        });
    } catch (error) {
        console.error('❌ Failed to create Redis client:', error.message);
        redisClient = createMockRedisClient();
    }
} else {
    redisClient = createMockRedisClient();
}

// Connect to Redis with timeout and retry logic
const connectRedis = async () => {
    if (!redisClient) {
        redisClient = createMockRedisClient();
    }

    try {
        await redisClient.connect();
        return redisClient;
    } catch (error) {
        console.error('❌ Failed to connect to Redis:', error.message);
        // Fall back to mock client
        redisClient = createMockRedisClient();
        await redisClient.connect();
        return redisClient;
    }
};

// Redis utility functions with fallback for when Redis is not available
const redisUtils = {
    // Set token in blacklist with expiration
    blacklistToken: async (token, expiresIn = 3600) => {
        if (!isRedisConnected) return false;
        try {
            await redisClient.setEx(`blacklist:${token}`, expiresIn, 'true');
            return true;
        } catch (error) {
            console.error('Error blacklisting token:', error);
            return false;
        }
    },

    // Check if token is blacklisted
    isTokenBlacklisted: async (token) => {
        if (!isRedisConnected) return false;
        try {
            const result = await redisClient.get(`blacklist:${token}`);
            return result === 'true';
        } catch (error) {
            console.error('Error checking blacklisted token:', error);
            return false;
        }
    },

    // Store user session
    setUserSession: async (userId, sessionData, expiresIn = 86400) => {
        if (!isRedisConnected) return false;
        try {
            await redisClient.setEx(`session:${userId}`, expiresIn, JSON.stringify(sessionData));
            return true;
        } catch (error) {
            console.error('Error setting user session:', error);
            return false;
        }
    },

    // Get user session
    getUserSession: async (userId) => {
        if (!isRedisConnected) return null;
        try {
            const session = await redisClient.get(`session:${userId}`);
            return session ? JSON.parse(session) : null;
        } catch (error) {
            console.error('Error getting user session:', error);
            return null;
        }
    },

    // Delete user session
    deleteUserSession: async (userId) => {
        if (!isRedisConnected) return false;
        try {
            await redisClient.del(`session:${userId}`);
            return true;
        } catch (error) {
            console.error('Error deleting user session:', error);
            return false;
        }
    },

    // Store refresh token
    setRefreshToken: async (userId, refreshToken, expiresIn = 2592000) => {
        if (!isRedisConnected) return false;
        try {
            await redisClient.setEx(`refresh:${userId}`, expiresIn, refreshToken);
            return true;
        } catch (error) {
            console.error('Error storing refresh token:', error);
            return false;
        }
    },

    // Get refresh token
    getRefreshToken: async (userId) => {
        if (!isRedisConnected) return null;
        try {
            return await redisClient.get(`refresh:${userId}`);
        } catch (error) {
            console.error('Error getting refresh token:', error);
            return null;
        }
    },

    // Delete refresh token
    deleteRefreshToken: async (userId) => {
        if (!isRedisConnected) return false;
        try {
            await redisClient.del(`refresh:${userId}`);
            return true;
        } catch (error) {
            console.error('Error deleting refresh token:', error);
            return false;
        }
    },

    // Store magic link token
    setMagicLinkToken: async (email, token, expiresIn = 900) => {
        if (!isRedisConnected) return false;
        try {
            await redisClient.setEx(`magic:${email}`, expiresIn, token);
            return true;
        } catch (error) {
            console.error('Error storing magic link token:', error);
            return false;
        }
    },

    // Get magic link token
    getMagicLinkToken: async (email) => {
        if (!isRedisConnected) return null;
        try {
            return await redisClient.get(`magic:${email}`);
        } catch (error) {
            console.error('Error getting magic link token:', error);
            return null;
        }
    },

    // Delete magic link token
    deleteMagicLinkToken: async (email) => {
        if (!isRedisConnected) return false;
        try {
            await redisClient.del(`magic:${email}`);
            return true;
        } catch (error) {
            console.error('Error deleting magic link token:', error);
            return false;
        }
    }
};

// Export the redisClient, connectRedis function, and redisUtils
module.exports = { redisClient, connectRedis, redisUtils };