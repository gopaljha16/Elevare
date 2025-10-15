const { AppError } = require('../middleware/errorHandler');

/**
 * AI Service Configuration Management
 * Handles secure API key management, validation, and environment configuration
 */
class AIConfig {
  constructor() {
    this.config = {
      gemini: {
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        rateLimits: {
          perDay: parseInt(process.env.AI_RATE_LIMIT_PER_DAY) || 100,
          perHour: parseInt(process.env.AI_RATE_LIMIT_PER_HOUR) || 20,
          perMinute: parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE) || 5
        },
        timeout: parseInt(process.env.AI_REQUEST_TIMEOUT) || 30000, // 30 seconds
        retryAttempts: parseInt(process.env.AI_RETRY_ATTEMPTS) || 3,
        retryDelay: parseInt(process.env.AI_RETRY_DELAY) || 1000 // 1 second
      },
      security: {
        enableKeyRotation: process.env.ENABLE_API_KEY_ROTATION === 'true',
        keyRotationInterval: parseInt(process.env.KEY_ROTATION_INTERVAL) || 86400000, // 24 hours
        enableRequestLogging: process.env.ENABLE_AI_REQUEST_LOGGING === 'true',
        logLevel: process.env.AI_LOG_LEVEL || 'error'
      },
      environment: process.env.NODE_ENV || 'development'
    };

    this.isValidated = false;
    this.lastValidation = null;
    this.validationErrors = [];
  }

  /**
   * Validate all AI configuration on application startup
   * @returns {boolean} True if configuration is valid
   */
  validateConfiguration() {
    this.validationErrors = [];
    
    try {
      // Validate Gemini API configuration
      this._validateGeminiConfig();
      
      // Validate rate limiting configuration
      this._validateRateLimits();
      
      // Validate security settings
      this._validateSecurityConfig();
      
      // Validate environment-specific settings
      this._validateEnvironmentConfig();
      
      this.isValidated = true;
      this.lastValidation = new Date();
      
      console.log('✅ AI Configuration validation successful');
      this._logConfigurationSummary();
      
      return true;
      
    } catch (error) {
      this.isValidated = false;
      console.error('❌ AI Configuration validation failed:', error.message);
      console.error('Validation errors:', this.validationErrors);
      
      if (this.config.environment === 'production') {
        throw new AppError('AI service configuration is invalid', 500);
      }
      
      return false;
    }
  }

  /**
   * Validate Gemini API configuration
   * @private
   */
  _validateGeminiConfig() {
    const { gemini } = this.config;
    
    // Validate API key
    if (!gemini.apiKey) {
      this.validationErrors.push('GEMINI_API_KEY is required');
      throw new Error('Gemini API key is missing');
    }
    
    if (typeof gemini.apiKey !== 'string' || gemini.apiKey.length < 20) {
      this.validationErrors.push('GEMINI_API_KEY appears to be invalid (too short)');
      throw new Error('Gemini API key appears to be invalid');
    }
    
    // Validate API key format (basic check)
    if (!gemini.apiKey.startsWith('AIza')) {
      this.validationErrors.push('GEMINI_API_KEY does not match expected format');
      console.warn('⚠️ Gemini API key does not match expected format');
    }
    
    // Validate model name
    const validModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    if (!validModels.includes(gemini.model)) {
      this.validationErrors.push(`Invalid GEMINI_MODEL: ${gemini.model}`);
      console.warn(`⚠️ Unknown Gemini model: ${gemini.model}`);
    }
    
    // Validate timeout
    if (gemini.timeout < 5000 || gemini.timeout > 120000) {
      this.validationErrors.push('AI_REQUEST_TIMEOUT should be between 5000ms and 120000ms');
      console.warn('⚠️ AI request timeout is outside recommended range');
    }
  }

  /**
   * Validate rate limiting configuration
   * @private
   */
  _validateRateLimits() {
    const { rateLimits } = this.config.gemini;
    
    if (rateLimits.perMinute > rateLimits.perHour) {
      this.validationErrors.push('Per-minute rate limit cannot exceed per-hour limit');
      throw new Error('Invalid rate limit configuration');
    }
    
    if (rateLimits.perHour > rateLimits.perDay) {
      this.validationErrors.push('Per-hour rate limit cannot exceed per-day limit');
      throw new Error('Invalid rate limit configuration');
    }
    
    // Warn about potentially low limits
    if (rateLimits.perDay < 50 && this.config.environment === 'production') {
      console.warn('⚠️ Daily rate limit is quite low for production environment');
    }
  }

  /**
   * Validate security configuration
   * @private
   */
  _validateSecurityConfig() {
    const { security } = this.config;
    
    // Validate key rotation settings
    if (security.enableKeyRotation && security.keyRotationInterval < 3600000) {
      this.validationErrors.push('Key rotation interval should be at least 1 hour');
      console.warn('⚠️ Key rotation interval is very short');
    }
    
    // Validate log level
    const validLogLevels = ['error', 'warn', 'info', 'debug'];
    if (!validLogLevels.includes(security.logLevel)) {
      this.validationErrors.push(`Invalid AI_LOG_LEVEL: ${security.logLevel}`);
      console.warn(`⚠️ Invalid log level: ${security.logLevel}, using 'error'`);
      this.config.security.logLevel = 'error';
    }
  }

  /**
   * Validate environment-specific configuration
   * @private
   */
  _validateEnvironmentConfig() {
    const { environment } = this.config;
    
    if (environment === 'production') {
      // Production-specific validations
      if (this.config.security.enableRequestLogging) {
        console.warn('⚠️ AI request logging is enabled in production - consider disabling for performance');
      }
      
      if (this.config.security.logLevel === 'debug') {
        console.warn('⚠️ Debug logging is enabled in production - consider using error or warn level');
      }
    }
    
    if (environment === 'development') {
      // Development-specific warnings
      if (!this.config.security.enableRequestLogging) {
        console.log('💡 Consider enabling AI request logging in development for debugging');
      }
    }
  }

  /**
   * Log configuration summary (without sensitive data)
   * @private
   */
  _logConfigurationSummary() {
    const summary = {
      model: this.config.gemini.model,
      rateLimits: this.config.gemini.rateLimits,
      timeout: this.config.gemini.timeout,
      retryAttempts: this.config.gemini.retryAttempts,
      environment: this.config.environment,
      keyRotationEnabled: this.config.security.enableKeyRotation,
      requestLoggingEnabled: this.config.security.enableRequestLogging,
      logLevel: this.config.security.logLevel
    };
    
    console.log('🔧 AI Configuration Summary:', JSON.stringify(summary, null, 2));
  }

  /**
   * Get sanitized configuration for use in services
   * @returns {Object} Configuration object without sensitive data
   */
  getConfig() {
    if (!this.isValidated) {
      throw new Error('Configuration must be validated before use');
    }
    
    return {
      ...this.config,
      gemini: {
        ...this.config.gemini,
        apiKey: this._maskApiKey(this.config.gemini.apiKey)
      }
    };
  }

  /**
   * Get the actual API key (for internal service use only)
   * @returns {string} The actual API key
   */
  getApiKey() {
    if (!this.isValidated) {
      throw new Error('Configuration must be validated before accessing API key');
    }
    
    return this.config.gemini.apiKey;
  }

  /**
   * Check if configuration is valid and not expired
   * @returns {boolean} True if configuration is valid
   */
  isConfigurationValid() {
    if (!this.isValidated || !this.lastValidation) {
      return false;
    }
    
    // Re-validate every hour
    const oneHour = 60 * 60 * 1000;
    const isExpired = (Date.now() - this.lastValidation.getTime()) > oneHour;
    
    if (isExpired) {
      console.log('🔄 AI configuration validation expired, re-validating...');
      return this.validateConfiguration();
    }
    
    return true;
  }

  /**
   * Mask API key for logging purposes
   * @param {string} apiKey - The API key to mask
   * @returns {string} Masked API key
   * @private
   */
  _maskApiKey(apiKey) {
    if (!apiKey || apiKey.length < 8) {
      return '***INVALID***';
    }
    
    return apiKey.substring(0, 4) + '*'.repeat(apiKey.length - 8) + apiKey.substring(apiKey.length - 4);
  }

  /**
   * Get rate limit configuration for a specific time period
   * @param {string} period - 'minute', 'hour', or 'day'
   * @returns {number} Rate limit for the specified period
   */
  getRateLimit(period) {
    if (!this.isValidated) {
      throw new Error('Configuration must be validated before accessing rate limits');
    }
    
    const rateLimits = this.config.gemini.rateLimits;
    
    switch (period) {
      case 'minute':
        return rateLimits.perMinute;
      case 'hour':
        return rateLimits.perHour;
      case 'day':
        return rateLimits.perDay;
      default:
        throw new Error(`Invalid rate limit period: ${period}`);
    }
  }

  /**
   * Get retry configuration
   * @returns {Object} Retry configuration
   */
  getRetryConfig() {
    if (!this.isValidated) {
      throw new Error('Configuration must be validated before accessing retry config');
    }
    
    return {
      attempts: this.config.gemini.retryAttempts,
      delay: this.config.gemini.retryDelay,
      timeout: this.config.gemini.timeout
    };
  }

  /**
   * Check if request logging is enabled
   * @returns {boolean} True if request logging is enabled
   */
  isRequestLoggingEnabled() {
    return this.config.security.enableRequestLogging;
  }

  /**
   * Get current log level
   * @returns {string} Current log level
   */
  getLogLevel() {
    return this.config.security.logLevel;
  }
}

// Create singleton instance
const aiConfig = new AIConfig();

module.exports = aiConfig;