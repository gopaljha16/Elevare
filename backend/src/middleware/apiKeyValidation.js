const { securityConfig } = require('../config/security');
const { AppError } = require('./errorHandler');

/**
 * API key validation and management middleware
 */

/**
 * Validate API keys in requests
 */
const validateAPIKeys = (req, res, next) => {
  // Skip validation for health checks and public endpoints
  const publicEndpoints = ['/health', '/api/auth/login', '/api/auth/register'];
  if (publicEndpoints.includes(req.path)) {
    return next();
  }

  // Validate request headers for security issues
  const headerValidation = securityConfig.validateRequestHeaders(req.headers);
  if (!headerValidation.valid) {
    console.warn('Security warning in request headers:', headerValidation.issues);
  }

  // Add security headers to response
  const securityHeaders = securityConfig.getSecurityHeaders();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.set(key, value);
  });

  next();
};

/**
 * API usage tracking middleware
 */
const trackAPIUsage = (req, res, next) => {
  // Track API usage for rate limiting and monitoring
  const apiUsage = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    endpoint: req.path,
    method: req.method,
    userId: req.userId || null
  };

  // Store usage data (in production, this would go to a proper logging service)
  if (process.env.NODE_ENV === 'development') {
    console.log('API Usage:', apiUsage);
  }

  // Add usage tracking to request for later middleware
  req.apiUsage = apiUsage;

  next();
};

/**
 * Gemini API key validation and rotation
 */
class GeminiAPIKeyManager {
  constructor() {
    // Support both GEMINI_API_KEY (singular) and GEMINI_API_KEYS (plural)
    const apiKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
    this.keys = apiKeys.split(',').map(key => key.trim()).filter(Boolean);
    this.currentKeyIndex = 0;
    this.currentKey = this.keys[0] || '';
    this.keyRotationInterval = 24 * 60 * 60 * 1000; // 24 hours
    this.lastRotation = Date.now();
    this.usageCount = 0;
    this.dailyLimit = parseInt(process.env.AI_RATE_LIMIT_PER_DAY) || 100;
    this.hourlyLimit = parseInt(process.env.AI_RATE_LIMIT_PER_HOUR) || 20;
    this.usageHistory = new Map();
  }

  /**
   * Get current API key
   * @returns {string} - Current API key
   */
  getCurrentKey() {
    return this.currentKey;
  }

  /**
   * Check if API key needs rotation
   * @returns {boolean} - Whether key needs rotation
   */
  needsRotation() {
    const timeSinceRotation = Date.now() - this.lastRotation;
    return timeSinceRotation > this.keyRotationInterval;
  }

  /**
   * Rotate API key (placeholder - in production this would integrate with key management service)
   * @returns {Promise<boolean>} - Success status
   */
  async rotateKey() {
    // In production, this would:
    // 1. Generate new key from Google Cloud Console API
    // 2. Update environment variables
    // 3. Notify monitoring systems
    // 4. Update key in secure storage
    
    console.log('API key rotation would occur here in production');
    this.lastRotation = Date.now();
    return true;
  }

  /**
   * Track API usage
   * @param {string} userId - User ID making the request
   * @returns {boolean} - Whether request is within limits
   */
  trackUsage(userId = 'anonymous') {
    const now = Date.now();
    const hourKey = Math.floor(now / (60 * 60 * 1000)); // Current hour
    const dayKey = Math.floor(now / (24 * 60 * 60 * 1000)); // Current day

    // Initialize usage tracking for user
    if (!this.usageHistory.has(userId)) {
      this.usageHistory.set(userId, {
        hourly: new Map(),
        daily: new Map()
      });
    }

    const userUsage = this.usageHistory.get(userId);

    // Track hourly usage
    const hourlyCount = userUsage.hourly.get(hourKey) || 0;
    if (hourlyCount >= this.hourlyLimit) {
      return false; // Hourly limit exceeded
    }
    userUsage.hourly.set(hourKey, hourlyCount + 1);

    // Track daily usage
    const dailyCount = userUsage.daily.get(dayKey) || 0;
    if (dailyCount >= this.dailyLimit) {
      return false; // Daily limit exceeded
    }
    userUsage.daily.set(dayKey, dailyCount + 1);

    // Clean up old usage data (keep only last 7 days)
    this.cleanupUsageHistory(userId);

    this.usageCount++;
    return true;
  }

  /**
   * Clean up old usage history
   * @param {string} userId - User ID
   */
  cleanupUsageHistory(userId) {
    const userUsage = this.usageHistory.get(userId);
    if (!userUsage) return;

    const now = Date.now();
    const sevenDaysAgo = Math.floor((now - 7 * 24 * 60 * 60 * 1000) / (24 * 60 * 60 * 1000));
    const oneDayAgo = Math.floor((now - 24 * 60 * 60 * 1000) / (60 * 60 * 1000));

    // Clean up daily usage older than 7 days
    for (const [dayKey] of userUsage.daily.entries()) {
      if (dayKey < sevenDaysAgo) {
        userUsage.daily.delete(dayKey);
      }
    }

    // Clean up hourly usage older than 1 day
    for (const [hourKey] of userUsage.hourly.entries()) {
      if (hourKey < oneDayAgo) {
        userUsage.hourly.delete(hourKey);
      }
    }
  }

  /**
   * Get usage statistics
   * @param {string} userId - User ID
   * @returns {Object} - Usage statistics
   */
  getUsageStats(userId = 'anonymous') {
    const userUsage = this.usageHistory.get(userId);
    if (!userUsage) {
      return {
        hourlyUsage: 0,
        dailyUsage: 0,
        hourlyLimit: this.hourlyLimit,
        dailyLimit: this.dailyLimit
      };
    }

    const now = Date.now();
    const currentHour = Math.floor(now / (60 * 60 * 1000));
    const currentDay = Math.floor(now / (24 * 60 * 60 * 1000));

    return {
      hourlyUsage: userUsage.hourly.get(currentHour) || 0,
      dailyUsage: userUsage.daily.get(currentDay) || 0,
      hourlyLimit: this.hourlyLimit,
      dailyLimit: this.dailyLimit,
      totalUsage: this.usageCount
    };
  }

  /**
   * Check API key health
   * @returns {Promise<Object>} - Health status
   */
  async checkHealth() {
    try {
      // Test API key validity
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(this.currentKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const startTime = Date.now();
      const result = await model.generateContent('Test');
      const response = await result.response;
      const responseTime = Date.now() - startTime;
      
      if (response.text()) {
        return {
          status: 'healthy',
          responseTime,
          keyAge: Date.now() - this.lastRotation,
          needsRotation: this.needsRotation(),
          usageCount: this.usageCount
        };
      }
      
      throw new Error('Invalid response from API');
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        keyAge: Date.now() - this.lastRotation,
        needsRotation: true
      };
    }
  }
}

// Create singleton instance
const geminiKeyManager = new GeminiAPIKeyManager();

/**
 * Middleware to check Gemini API usage limits
 */
const checkGeminiUsage = (req, res, next) => {
  // Only apply to AI analysis endpoints
  if (!req.path.includes('/analyze')) {
    return next();
  }

  const userId = req.userId || req.ip;
  const canUse = geminiKeyManager.trackUsage(userId);

  if (!canUse) {
    const stats = geminiKeyManager.getUsageStats(userId);
    return res.status(429).json({
      success: false,
      message: 'AI analysis rate limit exceeded',
      limits: {
        hourly: `${stats.hourlyUsage}/${stats.hourlyLimit}`,
        daily: `${stats.dailyUsage}/${stats.dailyLimit}`
      },
      retryAfter: '1 hour'
    });
  }

  // Add usage stats to response headers
  const stats = geminiKeyManager.getUsageStats(userId);
  res.set({
    'X-AI-Hourly-Usage': `${stats.hourlyUsage}/${stats.hourlyLimit}`,
    'X-AI-Daily-Usage': `${stats.dailyUsage}/${stats.dailyLimit}`
  });

  next();
};

/**
 * Environment validation middleware
 */
const validateEnvironment = (req, res, next) => {
  // Only run validation once on startup
  if (!validateEnvironment.hasRun) {
    const validation = securityConfig.validateEnvironment();
    
    if (!validation.valid && process.env.NODE_ENV === 'production') {
      console.error('❌ Security validation failed in production');
      process.exit(1);
    }
    
    validateEnvironment.hasRun = true;
  }
  
  next();
};

/**
 * Security monitoring middleware
 */
const securityMonitoring = (req, res, next) => {
  // Monitor for suspicious activity
  const suspiciousPatterns = [
    /\.\./,  // Path traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /javascript:/i,  // JavaScript injection
    /eval\(/i,  // Code injection
  ];

  const requestData = JSON.stringify({
    url: req.url,
    body: req.body,
    query: req.query,
    headers: req.headers
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      console.warn(`🚨 Suspicious request detected from ${req.ip}: ${pattern}`);
      
      // In production, this would trigger alerts and potentially block the IP
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          message: 'Request blocked for security reasons'
        });
      }
      break;
    }
  }

  next();
};

module.exports = {
  validateAPIKeys,
  trackAPIUsage,
  checkGeminiUsage,
  validateEnvironment,
  securityMonitoring,
  geminiKeyManager,
  GeminiAPIKeyManager
};