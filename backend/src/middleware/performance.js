const compression = require('compression');
const { performance } = require('perf_hooks');

/**
 * Performance monitoring middleware
 * Tracks request timing and performance metrics
 */
const performanceMonitoring = (req, res, next) => {
  const startTime = performance.now();
  const startMemory = process.memoryUsage();
  
  // Add request ID for tracking
  req.requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Override res.json to capture response time
  const originalJson = res.json;
  res.json = function(data) {
    const endTime = performance.now();
    const endMemory = process.memoryUsage();
    const duration = endTime - startTime;
    
    // Add performance headers
    res.set({
      'X-Response-Time': `${duration.toFixed(2)}ms`,
      'X-Request-ID': req.requestId,
      'X-Memory-Usage': `${(endMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`
    });
    
    // Log slow requests (> 1000ms)
    if (duration > 1000) {
      console.warn(`Slow request detected: ${req.method} ${req.path} - ${duration.toFixed(2)}ms`);
    }
    
    // Log memory usage if significant increase
    const memoryIncrease = endMemory.heapUsed - startMemory.heapUsed;
    if (memoryIncrease > 10 * 1024 * 1024) { // 10MB
      console.warn(`High memory usage: ${req.method} ${req.path} - ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB increase`);
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Request batching middleware
 * Handles multiple requests in a single batch
 */
const requestBatching = (req, res, next) => {
  // Check if this is a batch request
  if (req.path === '/api/batch' && req.method === 'POST') {
    const { requests } = req.body;
    
    if (!Array.isArray(requests)) {
      return res.status(400).json({
        success: false,
        message: 'Batch requests must be an array'
      });
    }
    
    // Process batch requests
    const batchPromises = requests.map(async (batchReq, index) => {
      try {
        // Simulate individual request processing
        // In a real implementation, you'd route these through your app
        const response = await processBatchRequest(batchReq);
        return {
          index,
          success: true,
          data: response
        };
      } catch (error) {
        return {
          index,
          success: false,
          error: error.message
        };
      }
    });
    
    Promise.all(batchPromises)
      .then(results => {
        res.json({
          success: true,
          results
        });
      })
      .catch(error => {
        res.status(500).json({
          success: false,
          message: 'Batch processing failed',
          error: error.message
        });
      });
    
    return;
  }
  
  next();
};

/**
 * Process individual batch request
 * @param {Object} request - Batch request object
 * @returns {Promise} - Request result
 */
async function processBatchRequest(request) {
  // This is a simplified implementation
  // In practice, you'd route this through your actual endpoints
  const { method, path, body, headers } = request;
  
  // Simulate processing based on path
  switch (path) {
    case '/api/resumes/analyze':
      // Simulate AI analysis
      return { analysis: 'batch-processed', score: 85 };
    default:
      throw new Error(`Unsupported batch endpoint: ${path}`);
  }
}

/**
 * Response compression middleware
 * Compresses responses to reduce bandwidth
 */
const responseCompression = compression({
  // Compress responses larger than 1KB
  threshold: 1024,
  // Compression level (1-9, 6 is default)
  level: 6,
  // Only compress these content types
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
});

/**
 * API response caching middleware
 * Caches GET responses for specified duration
 */
const apiCaching = (duration = 300) => { // 5 minutes default
  const cache = new Map();
  
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    const cacheKey = `${req.path}?${JSON.stringify(req.query)}`;
    const cached = cache.get(cacheKey);
    
    // Return cached response if valid
    if (cached && Date.now() - cached.timestamp < duration * 1000) {
      res.set('X-Cache', 'HIT');
      return res.json(cached.data);
    }
    
    // Override res.json to cache response
    const originalJson = res.json;
    res.json = function(data) {
      // Cache successful responses
      if (res.statusCode === 200) {
        cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        
        // Limit cache size
        if (cache.size > 1000) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
      }
      
      res.set('X-Cache', 'MISS');
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Database query optimization middleware
 * Adds query performance monitoring
 */
const queryOptimization = (req, res, next) => {
  // Track database queries
  const originalQuery = req.query;
  req.queryMetrics = {
    count: 0,
    totalTime: 0,
    queries: []
  };
  
  // Add query tracking (this would integrate with your ORM/database layer)
  req.trackQuery = (queryName, duration) => {
    req.queryMetrics.count++;
    req.queryMetrics.totalTime += duration;
    req.queryMetrics.queries.push({
      name: queryName,
      duration,
      timestamp: Date.now()
    });
    
    // Warn about slow queries
    if (duration > 100) {
      console.warn(`Slow query detected: ${queryName} - ${duration}ms`);
    }
  };
  
  // Add metrics to response headers
  res.on('finish', () => {
    if (req.queryMetrics.count > 0) {
      res.set({
        'X-Query-Count': req.queryMetrics.count.toString(),
        'X-Query-Time': `${req.queryMetrics.totalTime.toFixed(2)}ms`
      });
    }
  });
  
  next();
};

/**
 * Memory usage monitoring
 */
const memoryMonitoring = (req, res, next) => {
  const memoryUsage = process.memoryUsage();
  const memoryUsageMB = {
    rss: Math.round(memoryUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    external: Math.round(memoryUsage.external / 1024 / 1024)
  };
  
  // Warn if memory usage is high
  if (memoryUsageMB.heapUsed > 500) { // 500MB
    console.warn(`High memory usage detected: ${memoryUsageMB.heapUsed}MB heap used`);
  }
  
  // Add memory info to response headers (in development)
  if (process.env.NODE_ENV === 'development') {
    res.set('X-Memory-Heap-Used', `${memoryUsageMB.heapUsed}MB`);
  }
  
  next();
};

/**
 * Request size limiting
 */
const requestSizeLimiting = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    const maxSizeBytes = parseSize(maxSize);
    
    if (contentLength > maxSizeBytes) {
      return res.status(413).json({
        success: false,
        message: `Request too large. Maximum size is ${maxSize}`,
        received: `${Math.round(contentLength / 1024 / 1024)}MB`
      });
    }
    
    next();
  };
};

/**
 * Parse size string to bytes
 * @param {string} size - Size string (e.g., '10mb', '1gb')
 * @returns {number} - Size in bytes
 */
function parseSize(size) {
  const units = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024
  };
  
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)(b|kb|mb|gb)$/);
  if (!match) return 0;
  
  const [, value, unit] = match;
  return parseFloat(value) * units[unit];
}

/**
 * Health check endpoint with performance metrics
 */
const healthCheck = (req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
    },
    cpu: process.cpuUsage(),
    version: process.version,
    platform: process.platform
  };
  
  res.json(health);
};

module.exports = {
  performanceMonitoring,
  requestBatching,
  responseCompression,
  apiCaching,
  queryOptimization,
  memoryMonitoring,
  requestSizeLimiting,
  healthCheck
};