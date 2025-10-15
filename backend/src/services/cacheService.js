const { safeRedisUtils } = require('../middleware/redis');
const crypto = require('crypto');

/**
 * Enhanced caching service with multiple strategies
 */
class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
    
    // Memory cache cleanup interval (every 5 minutes)
    setInterval(() => this.cleanupMemoryCache(), 5 * 60 * 1000);
  }

  /**
   * Generate cache key from data
   * @param {string} prefix - Cache key prefix
   * @param {any} data - Data to generate key from
   * @returns {string} - Cache key
   */
  generateKey(prefix, data) {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const hash = crypto.createHash('md5').update(dataString).digest('hex');
    return `${prefix}:${hash}`;
  }

  /**
   * Get cached data with fallback strategy
   * @param {string} key - Cache key
   * @param {Object} options - Cache options
   * @returns {Promise<any>} - Cached data or null
   */
  async get(key, options = {}) {
    const { useMemory = true, useRedis = true } = options;
    
    try {
      // Try memory cache first (fastest)
      if (useMemory) {
        const memoryResult = this.getFromMemory(key);
        if (memoryResult !== null) {
          this.cacheStats.hits++;
          return memoryResult;
        }
      }
      
      // Try Redis cache
      if (useRedis) {
        const redisResult = await this.getFromRedis(key);
        if (redisResult !== null) {
          // Store in memory cache for faster future access
          if (useMemory) {
            this.setInMemory(key, redisResult, options.memoryTTL || 300);
          }
          this.cacheStats.hits++;
          return redisResult;
        }
      }
      
      this.cacheStats.misses++;
      return null;
      
    } catch (error) {
      console.error('Cache get error:', error);
      this.cacheStats.misses++;
      return null;
    }
  }

  /**
   * Set cached data with multiple storage strategies
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {Object} options - Cache options
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, data, options = {}) {
    const { 
      memoryTTL = 300,    // 5 minutes
      redisTTL = 3600,    // 1 hour
      useMemory = true, 
      useRedis = true 
    } = options;
    
    try {
      let success = false;
      
      // Store in memory cache
      if (useMemory) {
        this.setInMemory(key, data, memoryTTL);
        success = true;
      }
      
      // Store in Redis cache
      if (useRedis) {
        const redisSuccess = await this.setInRedis(key, data, redisTTL);
        success = success || redisSuccess;
      }
      
      if (success) {
        this.cacheStats.sets++;
      }
      
      return success;
      
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete cached data
   * @param {string} key - Cache key
   * @param {Object} options - Delete options
   * @returns {Promise<boolean>} - Success status
   */
  async delete(key, options = {}) {
    const { useMemory = true, useRedis = true } = options;
    
    try {
      let success = false;
      
      // Delete from memory cache
      if (useMemory) {
        success = this.memoryCache.delete(key) || success;
      }
      
      // Delete from Redis cache
      if (useRedis) {
        const redisSuccess = await this.deleteFromRedis(key);
        success = success || redisSuccess;
      }
      
      if (success) {
        this.cacheStats.deletes++;
      }
      
      return success;
      
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Get data from memory cache
   * @param {string} key - Cache key
   * @returns {any} - Cached data or null
   */
  getFromMemory(key) {
    const cached = this.memoryCache.get(key);
    if (!cached) return null;
    
    // Check expiration
    if (Date.now() > cached.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Set data in memory cache
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in seconds
   */
  setInMemory(key, data, ttl) {
    this.memoryCache.set(key, {
      data,
      expiresAt: Date.now() + (ttl * 1000)
    });
    
    // Limit memory cache size
    if (this.memoryCache.size > 1000) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }
  }

  /**
   * Get data from Redis cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Cached data or null
   */
  async getFromRedis(key) {
    try {
      const cached = await safeRedisUtils.getUserSession(key);
      return cached;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * Set data in Redis cache
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} - Success status
   */
  async setInRedis(key, data, ttl) {
    try {
      return await safeRedisUtils.setUserSession(key, data, ttl);
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  /**
   * Delete data from Redis cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Success status
   */
  async deleteFromRedis(key) {
    try {
      return await safeRedisUtils.deleteUserSession(key);
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  /**
   * Cache with automatic refresh
   * @param {string} key - Cache key
   * @param {Function} dataProvider - Function to get fresh data
   * @param {Object} options - Cache options
   * @returns {Promise<any>} - Cached or fresh data
   */
  async getOrSet(key, dataProvider, options = {}) {
    const { refreshThreshold = 0.8 } = options;
    
    // Try to get cached data
    let cached = await this.get(key, options);
    
    if (cached !== null) {
      // Check if we should refresh in background
      const cacheAge = this.getCacheAge(key);
      const maxAge = options.redisTTL || 3600;
      
      if (cacheAge / maxAge > refreshThreshold) {
        // Refresh in background
        this.refreshInBackground(key, dataProvider, options);
      }
      
      return cached;
    }
    
    // Get fresh data
    try {
      const freshData = await dataProvider();
      await this.set(key, freshData, options);
      return freshData;
    } catch (error) {
      console.error('Data provider error:', error);
      throw error;
    }
  }

  /**
   * Refresh cache in background
   * @param {string} key - Cache key
   * @param {Function} dataProvider - Function to get fresh data
   * @param {Object} options - Cache options
   */
  async refreshInBackground(key, dataProvider, options) {
    try {
      const freshData = await dataProvider();
      await this.set(key, freshData, options);
    } catch (error) {
      console.error('Background refresh error:', error);
    }
  }

  /**
   * Get cache age in seconds
   * @param {string} key - Cache key
   * @returns {number} - Cache age in seconds
   */
  getCacheAge(key) {
    const cached = this.memoryCache.get(key);
    if (!cached) return Infinity;
    
    return (Date.now() - (cached.expiresAt - (300 * 1000))) / 1000;
  }

  /**
   * Cleanup expired memory cache entries
   */
  cleanupMemoryCache() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, cached] of this.memoryCache.entries()) {
      if (now > cached.expiresAt) {
        this.memoryCache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired cache entries`);
    }
  }

  /**
   * Clear all caches
   * @returns {Promise<void>}
   */
  async clear() {
    this.memoryCache.clear();
    // Note: We don't clear all Redis keys as they might be shared
    console.log('Memory cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  getStats() {
    return {
      ...this.cacheStats,
      memorySize: this.memoryCache.size,
      hitRate: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) || 0
    };
  }

  /**
   * Warm up cache with predefined data
   * @param {Array} warmupData - Array of {key, data, options} objects
   * @returns {Promise<void>}
   */
  async warmup(warmupData) {
    console.log(`Warming up cache with ${warmupData.length} entries...`);
    
    const promises = warmupData.map(({ key, data, options }) => 
      this.set(key, data, options)
    );
    
    await Promise.all(promises);
    console.log('Cache warmup completed');
  }
}

// Create singleton instance
const cacheService = new CacheService();

/**
 * Cache decorator for functions
 * @param {string} keyPrefix - Cache key prefix
 * @param {Object} options - Cache options
 * @returns {Function} - Decorator function
 */
const cached = (keyPrefix, options = {}) => {
  return (target, propertyName, descriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
      const key = cacheService.generateKey(keyPrefix, args);
      
      return cacheService.getOrSet(
        key,
        () => originalMethod.apply(this, args),
        options
      );
    };
    
    return descriptor;
  };
};

module.exports = {
  cacheService,
  cached
};