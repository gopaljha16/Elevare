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
  const mongoose = require('mongoose');
  const { redisClient } = require('../config/redis');
  
  const health = monitoring.getHealthStatus();
  const metrics = monitoring.getMetrics();
  
  // Check database connection status
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 
                   mongoose.connection.readyState === 2 ? 'connecting' :
                   mongoose.connection.readyState === 3 ? 'disconnecting' : 'disconnected';
  
  // Check Redis connection status
  const redisStatus = redisClient && (redisClient.isReady || redisClient.isOpen) ? 'connected' : 
                      redisClient && redisClient.isMock ? 'mock' : 'disconnected';
  
  // Check API keys
  const apiKeysValid = !!(process.env.GEMINI_API_KEYS && 
                          process.env.GOOGLE_CLIENT_ID && 
                          process.env.GOOGLE_CLIENT_SECRET &&
                          process.env.JWT_SECRET);
  
  // Determine overall health status
  const isHealthy = dbStatus === 'connected' && apiKeysValid;
  
  const response = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: health.uptime,
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: dbStatus,
      databaseName: mongoose.connection.name || 'unknown',
      redis: redisStatus,
      apiKeys: apiKeysValid ? 'valid' : 'invalid',
      ai: metrics.ai.requests > 0 ? 'active' : 'idle'
    },
    config: {
      frontendUrl: process.env.FRONTEND_URL || 'not set',
      corsOrigins: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://elevare-seven.vercel.app',
        process.env.FRONTEND_URL
      ].filter(Boolean),
      nodeEnv: process.env.NODE_ENV || 'development'
    },
    health: {
      issues: health.issues,
      metrics: health.metrics
    },
    errors: []
  };
  
  // Add specific error messages
  if (dbStatus !== 'connected') {
    response.errors.push(`Database is ${dbStatus}`);
  }
  if (!apiKeysValid) {
    response.errors.push('One or more API keys are missing');
  }
  
  // Log health check request
  console.log(`[Health Check] Status: ${response.status}, DB: ${dbStatus}, Redis: ${redisStatus}, API Keys: ${apiKeysValid ? 'valid' : 'invalid'}`);
  
  // Return 503 if there are critical issues
  const statusCode = isHealthy ? 200 : 503;
  
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