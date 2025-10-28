const { redisUtils } = require('../config/redis');

// Middleware to handle Redis operations gracefully
const withRedisErrorHandling = (redisOperation) => {
  return async (...args) => {
    try {
      return await redisOperation(...args);
    } catch (error) {
      console.error('Redis operation failed:', error.message);
      // Return default values based on operation type
      if (redisOperation.name === 'isTokenBlacklisted') {
        return false; // If Redis is down, don't block valid tokens
      }
      if (redisOperation.name === 'getUserSession') {
        return null;
      }
      return false; // For set operations, return false to indicate failure
    }
  };
};

// Wrap Redis utilities with error handling
const safeRedisUtils = {
  blacklistToken: withRedisErrorHandling(redisUtils.blacklistToken),
  isTokenBlacklisted: withRedisErrorHandling(redisUtils.isTokenBlacklisted),
  setUserSession: withRedisErrorHandling(redisUtils.setUserSession),
  getUserSession: withRedisErrorHandling(redisUtils.getUserSession),
  deleteUserSession: withRedisErrorHandling(redisUtils.deleteUserSession),
  setRefreshToken: withRedisErrorHandling(redisUtils.setRefreshToken),
  getRefreshToken: withRedisErrorHandling(redisUtils.getRefreshToken),
  deleteRefreshToken: withRedisErrorHandling(redisUtils.deleteRefreshToken),
  setMagicLinkToken: withRedisErrorHandling(redisUtils.setMagicLinkToken),
  getMagicLinkToken: withRedisErrorHandling(redisUtils.getMagicLinkToken),
  deleteMagicLinkToken: withRedisErrorHandling(redisUtils.deleteMagicLinkToken),
};

// Middleware to check Redis health
const checkRedisHealth = async (req, res, next) => {
  try {
    // Simple Redis health check
    await redisUtils.setUserSession('health-check', { test: true }, 1);
    await redisUtils.deleteUserSession('health-check');
    req.redisHealthy = true;
  } catch (error) {
    console.warn('Redis health check failed:', error.message);
    req.redisHealthy = false;
  }
  next();
};

module.exports = {
  safeRedisUtils,
  checkRedisHealth,
  withRedisErrorHandling,
};