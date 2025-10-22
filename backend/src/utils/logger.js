/**
 * Comprehensive Logging System
 * Provides structured logging without exposing sensitive data
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.environment = process.env.NODE_ENV || 'development';
    this.enableFileLogging = process.env.ENABLE_FILE_LOGGING === 'true';
    this.logDirectory = process.env.LOG_DIRECTORY || 'logs';
    
    // Create logs directory if it doesn't exist
    if (this.enableFileLogging) {
      this.ensureLogDirectory();
    }
    
    // Log levels (higher number = more verbose)
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    
    this.currentLevel = this.levels[this.logLevel] || this.levels.info;
  }

  /**
   * Ensure log directory exists
   * @private
   */
  ensureLogDirectory() {
    try {
      const logPath = path.join(process.cwd(), this.logDirectory);
      if (!fs.existsSync(logPath)) {
        fs.mkdirSync(logPath, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to create log directory:', error.message);
      this.enableFileLogging = false;
    }
  }

  /**
   * Sanitize data to remove sensitive information
   * @param {any} data - Data to sanitize
   * @param {Set} visited - Set to track visited objects (prevent circular references)
   * @returns {any} Sanitized data
   * @private
   */
  sanitizeData(data, visited = new Set()) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }
    
    // Prevent circular references
    if (visited.has(data)) {
      return '[Circular Reference]';
    }
    visited.add(data);
    
    const sensitiveKeys = [
      'password', 'token', 'apikey', 'api_key', 'secret', 'auth',
      'authorization', 'cookie', 'session', 'jwt', 'bearer',
      'gemini_api_key', 'redis_password', 'database_url'
    ];
    
    const sanitized = Array.isArray(data) ? [] : {};
    
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeData(value, visited);
      } else {
        sanitized[key] = value;
      }
    }
    
    visited.delete(data);
    return sanitized;
  }

  /**
   * Format log entry
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   * @returns {Object} Formatted log entry
   * @private
   */
  formatLogEntry(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const sanitizedMeta = this.sanitizeData(meta);
    
    return {
      timestamp,
      level: level.toUpperCase(),
      message,
      environment: this.environment,
      ...sanitizedMeta
    };
  }

  /**
   * Write log to console and optionally to file
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   * @private
   */
  writeLog(level, message, meta = {}) {
    if (this.levels[level] > this.currentLevel) {
      return; // Skip if log level is too verbose
    }
    
    const logEntry = this.formatLogEntry(level, message, meta);
    
    // Console output with colors
    const colors = {
      error: '\x1b[31m', // Red
      warn: '\x1b[33m',  // Yellow
      info: '\x1b[36m',  // Cyan
      debug: '\x1b[90m'  // Gray
    };
    
    const resetColor = '\x1b[0m';
    const color = colors[level] || '';
    
    console.log(`${color}[${logEntry.timestamp}] ${logEntry.level}: ${logEntry.message}${resetColor}`);
    
    if (Object.keys(meta).length > 0) {
      console.log(`${color}${JSON.stringify(logEntry, null, 2)}${resetColor}`);
    }
    
    // File output (if enabled)
    if (this.enableFileLogging) {
      this.writeToFile(level, logEntry);
    }
  }

  /**
   * Write log entry to file
   * @param {string} level - Log level
   * @param {Object} logEntry - Formatted log entry
   * @private
   */
  writeToFile(level, logEntry) {
    try {
      const date = new Date().toISOString().split('T')[0];
      const filename = `${date}-${level}.log`;
      const filepath = path.join(process.cwd(), this.logDirectory, filename);
      
      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(filepath, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Object} meta - Additional metadata
   */
  error(message, meta = {}) {
    this.writeLog('error', message, meta);
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {Object} meta - Additional metadata
   */
  warn(message, meta = {}) {
    this.writeLog('warn', message, meta);
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {Object} meta - Additional metadata
   */
  info(message, meta = {}) {
    this.writeLog('info', message, meta);
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {Object} meta - Additional metadata
   */
  debug(message, meta = {}) {
    this.writeLog('debug', message, meta);
  }

  /**
   * Log AI service operations
   * @param {string} operation - AI operation type
   * @param {Object} meta - Operation metadata
   */
  aiOperation(operation, meta = {}) {
    this.info(`AI Operation: ${operation}`, {
      category: 'ai_service',
      operation,
      ...meta
    });
  }

  /**
   * Log API requests
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {number} duration - Request duration in ms
   */
  apiRequest(req, res, duration) {
    const meta = {
      category: 'api_request',
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.userId || 'anonymous'
    };
    
    if (res.statusCode >= 400) {
      this.warn(`API Request Failed: ${req.method} ${req.originalUrl}`, meta);
    } else {
      this.info(`API Request: ${req.method} ${req.originalUrl}`, meta);
    }
  }

  /**
   * Log database operations
   * @param {string} operation - Database operation
   * @param {Object} meta - Operation metadata
   */
  dbOperation(operation, meta = {}) {
    this.debug(`Database Operation: ${operation}`, {
      category: 'database',
      operation,
      ...meta
    });
  }

  /**
   * Log cache operations
   * @param {string} operation - Cache operation
   * @param {Object} meta - Operation metadata
   */
  cacheOperation(operation, meta = {}) {
    this.debug(`Cache Operation: ${operation}`, {
      category: 'cache',
      operation,
      ...meta
    });
  }

  /**
   * Log authentication events
   * @param {string} event - Auth event type
   * @param {Object} meta - Event metadata
   */
  authEvent(event, meta = {}) {
    this.info(`Auth Event: ${event}`, {
      category: 'authentication',
      event,
      ...meta
    });
  }

  /**
   * Log security events
   * @param {string} event - Security event type
   * @param {Object} meta - Event metadata
   */
  securityEvent(event, meta = {}) {
    this.warn(`Security Event: ${event}`, {
      category: 'security',
      event,
      ...meta
    });
  }

  /**
   * Log performance metrics
   * @param {string} metric - Metric name
   * @param {number} value - Metric value
   * @param {Object} meta - Additional metadata
   */
  performance(metric, value, meta = {}) {
    this.info(`Performance Metric: ${metric}`, {
      category: 'performance',
      metric,
      value,
      ...meta
    });
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;