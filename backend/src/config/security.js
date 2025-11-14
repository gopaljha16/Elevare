/**
 * Security configuration and validation
 */

const crypto = require('crypto');

class SecurityConfig {
  constructor() {
    this.requiredEnvVars = [
      'JWT_SECRET',
      'DATABASE_URL',
      'GEMINI_API_KEYS', // Changed from GEMINI_API_KEY to GEMINI_API_KEYS
    ];

    this.optionalEnvVars = [
      'REDIS_HOST',
      'REDIS_PORT',
      'REDIS_PASSWORD',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
    ];
  }

  /**
   * Validate environment variables
   * @returns {Object} - Validation result
   */
  validateEnvironment() {
    console.log('🔒 Validating security configuration...');
    
    const missing = [];
    const warnings = [];
    
    // Check required variables
    for (const varName of this.requiredEnvVars) {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    }

    // Check JWT secret strength
    if (process.env.JWT_SECRET) {
      const entropy = this.calculateEntropy(process.env.JWT_SECRET);
      if (entropy < 4) {
        warnings.push('JWT_SECRET has low entropy - consider using a more random secret');
      }
    }

    // Check if using default/weak secrets
    const weakSecrets = ['secret', 'password', '123456', 'admin'];
    if (process.env.JWT_SECRET && weakSecrets.some(weak => process.env.JWT_SECRET.toLowerCase().includes(weak))) {
      warnings.push('JWT_SECRET appears to contain common weak patterns');
    }

    const valid = missing.length === 0;

    if (!valid) {
      console.error('❌ Security configuration validation failed');
      console.error('- Missing required environment variable:', missing.join(', '));
    }

    if (warnings.length > 0) {
      console.warn('⚠️ Security configuration warnings:');
      warnings.forEach(warning => console.warn(`- ${warning}`));
    }

    if (valid && warnings.length === 0) {
      console.log('✅ Security configuration validated successfully');
    }

    return {
      valid,
      missing,
      warnings
    };
  }

  /**
   * Calculate entropy of a string (measure of randomness)
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
   * Validate request headers for security issues
   * @param {Object} headers - Request headers
   * @returns {Object} - Validation result
   */
  validateRequestHeaders(headers) {
    const issues = [];

    // Check for suspicious user agents
    const userAgent = headers['user-agent'] || '';
    const suspiciousAgents = ['sqlmap', 'nikto', 'nmap', 'masscan'];
    if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
      issues.push('Suspicious user agent detected');
    }

    // Check for missing security headers in response
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection'
    ];

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Get security headers to add to responses
   * @returns {Object} - Security headers
   */
  getSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'",
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }

  /**
   * Generate a secure random token
   * @param {number} length - Token length in bytes
   * @returns {string} - Random token
   */
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash a value using SHA-256
   * @param {string} value - Value to hash
   * @returns {string} - Hashed value
   */
  hashValue(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  /**
   * Sanitize user input to prevent XSS
   * @param {string} input - User input
   * @returns {string} - Sanitized input
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Check if IP is rate limited
   * @param {string} ip - IP address
   * @param {number} maxRequests - Max requests per window
   * @param {number} windowMs - Time window in milliseconds
   * @returns {boolean} - Whether IP is rate limited
   */
  isRateLimited(ip, maxRequests = 100, windowMs = 15 * 60 * 1000) {
    // This is a simple in-memory implementation
    // In production, use Redis for distributed rate limiting
    if (!this.rateLimitStore) {
      this.rateLimitStore = new Map();
    }

    const now = Date.now();
    const key = `${ip}:${Math.floor(now / windowMs)}`;
    
    const current = this.rateLimitStore.get(key) || 0;
    
    if (current >= maxRequests) {
      return true;
    }

    this.rateLimitStore.set(key, current + 1);

    // Clean up old entries
    for (const [k] of this.rateLimitStore.entries()) {
      const [, timestamp] = k.split(':');
      if (now - parseInt(timestamp) * windowMs > windowMs * 2) {
        this.rateLimitStore.delete(k);
      }
    }

    return false;
  }
}

// Create singleton instance
const securityConfig = new SecurityConfig();

module.exports = {
  securityConfig,
  SecurityConfig
};
