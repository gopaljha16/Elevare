const logger = require('../utils/logger');

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode, errorCode = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errorCode = errorCode;
    this.details = details;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Specific error classes for different types of errors
 */
class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded', retryAfter = null) {
    super(message, 429, 'RATE_LIMIT_ERROR', { retryAfter });
  }
}

class ExternalServiceError extends AppError {
  constructor(service, message = 'External service error') {
    super(message, 503, 'EXTERNAL_SERVICE_ERROR', { service });
  }
}

/**
 * Async error handler wrapper
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Enhanced error categorization
 */
const categorizeError = (err) => {
  // Database errors
  if (err.name === 'CastError') {
    return new NotFoundError('Invalid resource ID format');
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return new ValidationError(`${field} already exists`, { field, value: err.keyValue[field] });
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message,
      value: val.value
    }));
    return new ValidationError('Validation failed', { errors });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return new AuthenticationError('Token expired');
  }

  // AI service errors
  if (err.message?.includes('AI service')) {
    return new ExternalServiceError('gemini', err.message);
  }

  // Redis errors
  if (err.message?.includes('Redis')) {
    return new ExternalServiceError('redis', 'Cache service temporarily unavailable');
  }

  return err;
};

/**
 * Generate error response based on environment
 */
const generateErrorResponse = (err, req) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const response = {
    success: false,
    error: {
      message: err.message,
      statusCode: err.statusCode,
      errorCode: err.errorCode,
      timestamp: err.timestamp || new Date().toISOString()
    }
  };

  // Add additional details in development
  if (isDevelopment) {
    response.error.stack = err.stack;
    response.error.details = err.details;
  } else {
    // Only include details if they're safe for production
    if (err.details && err.isOperational) {
      response.error.details = err.details;
    }
  }

  // Add retry information for rate limiting
  if (err.errorCode === 'RATE_LIMIT_ERROR' && err.details?.retryAfter) {
    response.retryAfter = err.details.retryAfter;
  }

  return response;
};

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Categorize and enhance the error
  const categorizedError = categorizeError(err);

  // Log the error with context
  const logLevel = categorizedError.statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel]('Request error occurred', {
    error: categorizedError,
    req,
    errorCode: categorizedError.errorCode,
    statusCode: categorizedError.statusCode
  });

  // Log security-related errors
  if (categorizedError.statusCode === 401 || categorizedError.statusCode === 403) {
    logger.security('Authentication/Authorization failure', {
      error: categorizedError.message,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    }, req);
  }

  // Generate appropriate response
  const errorResponse = generateErrorResponse(categorizedError, req);

  // Set appropriate headers
  res.status(categorizedError.statusCode || 500);

  if (categorizedError.errorCode === 'RATE_LIMIT_ERROR' && categorizedError.details?.retryAfter) {
    res.set('Retry-After', categorizedError.details.retryAfter);
  }

  res.json(errorResponse);
};

/**
 * 404 handler for unmatched routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`);

  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  next(error);
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  ExternalServiceError,
  asyncHandler,
  errorHandler,
  notFoundHandler
};