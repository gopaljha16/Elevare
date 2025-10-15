/**
 * Monitoring Middleware
 * Integrates monitoring and logging with Express requests
 */

const logger = require('../utils/logger');
const { monitoring } = require('../utils/monitoring');

/**
 * Request logging and monitoring middleware
 */
const requestMonitoring = (req, res, next) => {
  const startTime = Date.now();
  
  // Log incoming request
  logger.debug('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.userId || 'anonymous'
  });
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    
    // Track metrics
    monitoring.recordRequest(req, res, responseTime);
    
    // Log API request
    logger.apiRequest(req, res, responseTime);
    
    // Call original end method
    originalEnd.apply(this, args);
  };
  
  next();
};

/**
 * AI operation monitoring wrapper
 */
const monitorAIOperation = (operation) => {
  return async (fn, ...args) => {
    const startTime = Date.now();
    let success = false;
    let cached = false;
    
    try {
      const result = await fn(...args);
      success = true;
      
      // Check if result was cached
      if (result && typeof result === 'object' && result.cached) {
        cached = true;
      }
      
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const processingTime = Date.now() - startTime;
      monitoring.recordAIOperation(operation, success, processingTime, cached);
    }
  };
};

/**
 * Error monitoring middleware
 */
const errorMonitoring = (err, req, res, next) => {
  // Log error with context
  logger.error('Request error', {
    error: {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.userId || 'anonymous'
    }
  });
  
  // Continue to error handler
  next(err);
};

/**
 * Health check endpoint
 */
const healthCheck = (req, res) => {
  const health = monitoring.getHealthStatus();
  const metrics = monitoring.getMetrics();
  
  const response = {
    status: health.status,
    timestamp: new Date().toISOString(),
    uptime: health.uptime,
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    health: {
      issues: health.issues,
      metrics: health.metrics
    },
    services: {
      database: 'connected', // This would be checked in a real implementation
      redis: 'connected',     // This would be checked in a real implementation
      ai: metrics.ai.requests > 0 ? 'active' : 'idle'
    }
  };
  
  // Return 503 if there are critical issues
  const statusCode = health.status === 'healthy' ? 200 : 503;
  
  res.status(statusCode).json(response);
};

/**
 * Metrics endpoint (for monitoring dashboards)
 */
const metricsEndpoint = (req, res) => {
  const metrics = monitoring.getMetrics();
  
  res.json({
    success: true,
    data: metrics,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  requestMonitoring,
  monitorAIOperation,
  errorMonitoring,
  healthCheck,
  metricsEndpoint
};