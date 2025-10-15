const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Secure API key management and validation
 */
class SecurityConfig {
  constructor() {
    this.requiredEnvVars = [
      'JWT_SECRET',
      'DATABASE_URL',
      'GEMINI_API_KEY'
    ];
    
    this.optionalEnvVars = [
      'REDIS_HOST',
      'REDIS_PORT',
      'REDIS_PASSWORD',
      'FRONTEND_URL'
    ];
    
    this.apiKeyPatterns = {
      GEMINI_API_KEY: /^AIza[0-9A-Za-z-_]{35}$/,
      JWT_SECRET: /^[A-Za-z0-9+/=]{64,}$/
    };
  }

  /**
   * Validate all environment variables on startup
   * @returns {Object} - Validation result
   */
  validateEnvironment() {
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      summary: {}
    };

    console.log('🔒 Validating security configuration...');

    // Check required environment variables
    for (const envVar of this.requiredEnvVars) {
      const value = process.env[envVar];
      
      if (!value) {
        results.valid = false;
        results.errors.push(`Missing required environment variable: ${envVar}`);
        results.summary[envVar] = 'MISSING';
      } else if (this.apiKeyPatterns[envVar] && !this.apiKeyPatterns[envVar].test(value)) {
        results.valid = false;
        results.errors.push(`Invalid format for ${envVar}`);
        results.summary[envVar] = 'INVALID_FORMAT';
      } else {
        results.summary[envVar] = 'VALID';
      }
    }

    // Check optional environment variables
    for (const envVar of this.optionalEnvVars) {
      const value = process.env[envVar];
      
      if (!value) {
        results.warnings.push(`Optional environment variable not set: ${envVar}`);
        results.summary[envVar] = 'NOT_SET';
      } else {
        results.summary[envVar] = 'SET';
      }
    }

    // Validate specific configurations
    this.validateJWTSecret(results);
    this.validateGeminiAPIKey(results);
    this.validateDatabaseURL(results);
    this.validateRedisConfig(results);

    // Log results
    if (results.valid) {
      console.log('✅ Security configuration validation passed');
    } else {
      console.error('❌ Security configuration validation failed');
      results.errors.forEach(error => console.error(`  - ${error}`));
    }

    if (results.warnings.length > 0) {
      console.warn('⚠️ Security configuration warnings:');
      results.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }

    return results;
  }

  /**
   * Validate JWT secret strength
   * @param {Object} results - Validation results object
   */
  validateJWTSecret(results) {
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) return;

    // Check minimum length
    if (jwtSecret.length < 32) {
      results.errors.push('JWT_SECRET should be at least 32 characters long');
      results.valid = false;
    }

    // Check entropy (randomness)
    const entropy = this.calculateEntropy(jwtSecret);
    if (entropy < 4.0) {
      results.warnings.push('JWT_SECRET has low entropy - consider using a more random secret');
    }

    // Check for common weak patterns
    const weakPatterns = [
      /^(secret|password|key|token)/i,
      /^(123|abc|test)/i,
      /(.)\1{3,}/  // Repeated characters
    ];

    for (const pattern of weakPatterns) {
      if (pattern.test(jwtSecret)) {
        results.warnings.push('JWT_SECRET appears to use a weak pattern');
        break;
      }
    }
  }

  /**
   * Validate Gemini API key format and test connection
   * @param {Object} results - Validation results object
   */
  async validateGeminiAPIKey(results) {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) return;

    // Format validation
    if (!this.apiKeyPatterns.GEMINI_API_KEY.test(apiKey)) {
      results.errors.push('GEMINI_API_KEY has invalid format');
      results.valid = false;
      return;
    }

    // Test API key validity (optional - only in development)
    if (process.env.NODE_ENV === 'development') {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        // Test with a simple prompt
        const result = await model.generateContent('Test');
        const response = await result.response;
        
        if (response.text()) {
          console.log('✅ Gemini API key validation successful');
        }
      } catch (error) {
        results.warnings.push(`Gemini API key test failed: ${error.message}`);
      }
    }
  }

  /**
   * Validate database URL format and connection
   * @param {Object} results - Validation results object
   */
  validateDatabaseURL(results) {
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) return;

    // Basic MongoDB URL format validation
    const mongoUrlPattern = /^mongodb(\+srv)?:\/\/.+/;
    if (!mongoUrlPattern.test(dbUrl)) {
      results.errors.push('DATABASE_URL has invalid MongoDB URL format');
      results.valid = false;
    }

    // Check for credentials in URL
    if (dbUrl.includes('@') && !dbUrl.includes('localhost')) {
      // Production database with credentials - good
    } else if (!dbUrl.includes('localhost')) {
      results.warnings.push('DATABASE_URL appears to be missing authentication credentials');
    }
  }

  /**
   * Validate Redis configuration
   * @param {Object} results - Validation results object
   */
  validateRedisConfig(results) {
    const redisHost = process.env.REDIS_HOST;
    const redisPort = process.env.REDIS_PORT;
    const redisPassword = process.env.REDIS_PASSWORD;

    if (redisHost || redisPort || redisPassword) {
      // If any Redis config is provided, check completeness
      if (!redisHost) {
        results.warnings.push('REDIS_HOST not set but other Redis config found');
      }
      if (!redisPort) {
        results.warnings.push('REDIS_PORT not set but other Redis config found');
      }
      if (!redisPassword) {
        results.warnings.push('REDIS_PASSWORD not set - Redis will be unsecured');
      }

      // Validate port number
      if (redisPort && (isNaN(redisPort) || redisPort < 1 || redisPort > 65535)) {
        results.errors.push('REDIS_PORT must be a valid port number (1-65535)');
        results.valid = false;
      }
    }
  }

  /**
   * Calculate entropy of a string
   * @param {string} str - String to analyze
   * @returns {number} - Entropy value
   */
  calculateEntropy(str) {
    const freq = {};
    for (const char of str) {
      freq[char] = (freq[char] || 0) + 1;
    }

    let entropy = 0;
    const len = str.length;
    
    for (const count of Object.values(freq)) {
      const p = count / len;
      entropy -= p * Math.log2(p);
    }

    return entropy;
  }

  /**
   * Generate secure random string for secrets
   * @param {number} length - Length of the string
   * @returns {string} - Secure random string
   */
  generateSecureSecret(length = 64) {
    return crypto.randomBytes(length).toString('base64');
  }

  /**
   * Encrypt sensitive data
   * @param {string} text - Text to encrypt
   * @param {string} key - Encryption key
   * @returns {string} - Encrypted text
   */
  encrypt(text, key = process.env.JWT_SECRET) {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   * @param {string} encryptedText - Encrypted text
   * @param {string} key - Decryption key
   * @returns {string} - Decrypted text
   */
  decrypt(encryptedText, key = process.env.JWT_SECRET) {
    const algorithm = 'aes-256-gcm';
    const parts = encryptedText.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Validate request headers for security
   * @param {Object} headers - Request headers
   * @returns {Object} - Validation result
   */
  validateRequestHeaders(headers) {
    const issues = [];

    // Check for sensitive information in headers
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /key/i,
      /token/i
    ];

    for (const [key, value] of Object.entries(headers)) {
      if (key.toLowerCase() !== 'authorization') {
        for (const pattern of sensitivePatterns) {
          if (pattern.test(key) || pattern.test(value)) {
            issues.push(`Potentially sensitive information in header: ${key}`);
          }
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Rate limiting configuration
   * @returns {Object} - Rate limiting config
   */
  getRateLimitConfig() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return {
      // General API rate limiting
      general: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: isDevelopment ? 200 : 100,
        message: 'Too many requests from this IP, please try again later.'
      },
      
      // AI analysis rate limiting (more restrictive)
      aiAnalysis: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: isDevelopment ? 20 : 10,
        message: 'Too many AI analysis requests, please try again later.'
      },
      
      // Authentication rate limiting
      auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: isDevelopment ? 10 : 5,
        message: 'Too many authentication attempts, please try again later.'
      }
    };
  }

  /**
   * Security headers configuration
   * @returns {Object} - Security headers
   */
  getSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:;"
    };
  }

  /**
   * Create security report
   * @returns {Object} - Security report
   */
  generateSecurityReport() {
    const validation = this.validateEnvironment();
    const rateLimits = this.getRateLimitConfig();
    const headers = this.getSecurityHeaders();

    return {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      validation,
      rateLimiting: {
        enabled: true,
        configs: Object.keys(rateLimits)
      },
      securityHeaders: {
        enabled: true,
        count: Object.keys(headers).length
      },
      recommendations: this.getSecurityRecommendations(validation)
    };
  }

  /**
   * Get security recommendations based on validation results
   * @param {Object} validation - Validation results
   * @returns {Array} - Security recommendations
   */
  getSecurityRecommendations(validation) {
    const recommendations = [];

    if (!validation.valid) {
      recommendations.push('Fix all environment variable validation errors before deploying to production');
    }

    if (validation.warnings.length > 0) {
      recommendations.push('Address security warnings to improve overall security posture');
    }

    if (process.env.NODE_ENV === 'production') {
      recommendations.push('Ensure all API keys are rotated regularly');
      recommendations.push('Monitor API usage and set up alerts for unusual activity');
      recommendations.push('Implement API key rotation strategy');
    }

    if (!process.env.REDIS_PASSWORD) {
      recommendations.push('Set up Redis authentication for production use');
    }

    return recommendations;
  }
}

// Create singleton instance
const securityConfig = new SecurityConfig();

module.exports = {
  securityConfig,
  SecurityConfig
};