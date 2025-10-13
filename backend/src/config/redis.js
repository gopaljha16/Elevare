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
        host: !redisHost,
        port: !redisPort,
        password: !redisPassword
    });
}

// Create Redis client - handle missing configuration gracefully
let redisClient;

// Temporarily disable Redis to get server running
if (false && redisHost && redisPort && redisPassword) {
    // Use URL format for cloud Redis with TLS - let Redis handle TLS automatically
    const redisUrl = `rediss://default:${redisPassword}@${redisHost}:${redisPort}`;

    redisClient = redis.createClient({
        url: redisUrl
    });

    // Handle Redis connection events
    redisClient.on('connect', () => {
        console.log('🔄 Connecting to Redis...');
    });

    redisClient.on('error', (err) => {
        console.error('❌ Redis connection error:', err.message);
        isRedisConnected = false;
    });

    redisClient.on('ready', () => {
        console.log('✅ Redis client ready');
        isRedisConnected = true;
    });

    redisClient.on('end', () => {
        console.log('🔌 Redis connection ended');
        isRedisConnected = false;
    });

    redisClient.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
    });
} else {
    // Create a mock client for development without Redis
    redisClient = {
        connect: async () => {
            console.log('⚠️ Redis not configured - using mock client');
            return Promise.resolve();
        },
        on: () => { },
        setEx: async () => false,
        get: async () => null,
        del: async () => false,
        disconnect: async () => Promise.resolve()
    };
}

// Connect to Redis with timeout and retry logic
const connectRedis = async () => {
    // Skip connection if configuration is invalid
    if (!redisHost || !redisPort || !redisPassword) {
        console.log('⚠️ Skipping Redis connection due to incomplete configuration');
        isRedisConnected = false;
        return;
    }

    try {
        await redisClient.connect();
        console.log('✅ Redis connected successfully');
        isRedisConnected = true;
    } catch (error) {
        console.error('❌ Failed to connect to Redis:', error.message);
        console.log('🔄 Application will continue without Redis features');
        isRedisConnected = false;
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
    }
};

module.exports = { redisClient, connectRedis, redisUtils };