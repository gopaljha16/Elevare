/**
 * Monitoring and Alerting System
 * Tracks application health, performance, and errors
 */

const logger = require('./logger');

class MonitoringService {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0
      },
      ai: {
        totalAnalyses: 0,
        successfulAnalyses: 0,
        failedAnalyses: 0,
        averageProcessingTime: 0,
        cacheHitRate: 0
      },
      errors: {
        total: 0,
        byType: {},
        byEndpoint: {}
      },
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        lastHealthCheck: new Date()
      }
    };

    this.alerts = {
      errorRate: { threshold: 0.1, enabled: true }, // 10% error rate
      responseTime: { threshold: 5000, enabled: true }, // 5 seconds
      memoryUsage: { threshold: 0.9, enabled: true }, // 90% memory usage
      aiFailureRate: { threshold: 0.2, enabled: true } // 20% AI failure rate
    };

    this.requestTimes = [];
    this.aiProcessingTimes = [];
    this.maxStoredTimes = 1000; // Keep last 1000 measurements

    // Start periodic health checks
    this.startHealthChecks();
  }

  /**
   * Record API request metrics
   */
  recordRequest(req, res, responseTime) {
    this.metrics.requests.total++;
    
    if (res.statusCode >= 200 && res.statusCode < 400) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
    }

    // Update response time metrics
    this.requestTimes.push(responseTime);
    if (this.requestTimes.length > this.maxStoredTimes) {
      this.requestTimes.shift();
    }
    
    this.metrics.requests.averageResponseTime = 
      this.requestTimes.reduce((sum, time) => sum + time, 0) / this.requestTimes.length;

    // Check for alerts
    this.checkResponseTimeAlert(responseTime);
    this.checkErrorRateAlert();

    // Log slow requests
    if (responseTime > 3000) {
      logger.warn('Slow API request detected', {
        method: req.method,
        url: req.originalUrl,
        responseTime,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent')
      });
    }
  }

  /**
   * Record AI operation metrics
   */
  recordAIOperation(operation, success, processingTime, cached = false) {
    this.metrics.ai.totalAnalyses++;
    
    if (success) {
      this.metrics.ai.successfulAnalyses++;
    } else {
      this.metrics.ai.failedAnalyses++;
    }

    // Update processing time metrics
    if (processingTime > 0) {
      this.aiProcessingTimes.push(processingTime);
      if (this.aiProcessingTimes.length > this.maxStoredTimes) {
        this.aiProcessingTimes.shift();
      }
      
      this.metrics.ai.averageProcessingTime = 
        this.aiProcessingTimes.reduce((sum, time) => sum + time, 0) / this.aiProcessingTimes.length;
    }

    // Update cache hit rate
    if (cached) {
      this.metrics.ai.cacheHits = (this.metrics.ai.cacheHits || 0) + 1;
    }
    
    this.metrics.ai.cacheHitRate = 
      (this.metrics.ai.cacheHits || 0) / this.metrics.ai.totalAnalyses;

    // Check AI failure rate alert
    this.checkAIFailureRateAlert();

    // Log AI operation
    logger.aiOperation(operation, {
      success,
      processingTime,
      cached,
      totalAnalyses: this.metrics.ai.totalAnalyses,
      successRate: this.metrics.ai.successfulAnalyses / this.metrics.ai.totalAnalyses
    });
  }

  /**
   * Record error occurrence
   */
  recordError(error, context = 'unknown') {
    this.metrics.errors.total++;
    
    const errorType = error.constructor.name || 'UnknownError';
    this.metrics.errors.byType[errorType] = (this.metrics.errors.byType[errorType] || 0) + 1;
    this.metrics.errors.byEndpoint[context] = (this.metrics.errors.byEndpoint[context] || 0) + 1;

    // Log error with context
    logger.error('Error recorded by monitoring', {
      errorType,
      context,
      message: error.message,
      totalErrors: this.metrics.errors.total
    });
  }

  /**
   * Check response time alert
   */
  checkResponseTimeAlert(responseTime) {
    if (!this.alerts.responseTime.enabled) return;

    if (responseTime > this.alerts.responseTime.threshold) {
      this.triggerAlert('response_time', {
        responseTime,
        threshold: this.alerts.responseTime.threshold,
        severity: 'warning'
      });
    }
  }

  /**
   * Check error rate alert
   */
  checkErrorRateAlert() {
    if (!this.alerts.errorRate.enabled) return;

    const errorRate = this.metrics.requests.failed / this.metrics.requests.total;
    
    if (errorRate > this.alerts.errorRate.threshold) {
      this.triggerAlert('error_rate', {
        errorRate,
        threshold: this.alerts.errorRate.threshold,
        totalRequests: this.metrics.requests.total,
        failedRequests: this.metrics.requests.failed,
        severity: 'critical'
      });
    }
  }

  /**
   * Check AI failure rate alert
   */
  checkAIFailureRateAlert() {
    if (!this.alerts.aiFailureRate.enabled) return;

    const failureRate = this.metrics.ai.failedAnalyses / this.metrics.ai.totalAnalyses;
    
    if (failureRate > this.alerts.aiFailureRate.threshold) {
      this.triggerAlert('ai_failure_rate', {
        failureRate,
        threshold: this.alerts.aiFailureRate.threshold,
        totalAnalyses: this.metrics.ai.totalAnalyses,
        failedAnalyses: this.metrics.ai.failedAnalyses,
        severity: 'warning'
      });
    }
  }

  /**
   * Check memory usage alert
   */
  checkMemoryUsageAlert() {
    if (!this.alerts.memoryUsage.enabled) return;

    const memUsage = process.memoryUsage();
    const usedMemoryRatio = memUsage.heapUsed / memUsage.heapTotal;
    
    if (usedMemoryRatio > this.alerts.memoryUsage.threshold) {
      this.triggerAlert('memory_usage', {
        usedMemoryRatio,
        threshold: this.alerts.memoryUsage.threshold,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        severity: 'critical'
      });
    }
  }

  /**
   * Trigger alert
   */
  triggerAlert(alertType, data) {
    const alert = {
      type: alertType,
      timestamp: new Date().toISOString(),
      severity: data.severity || 'warning',
      data
    };

    // Log alert
    logger.warn(`Alert triggered: ${alertType}`, alert);

    // In production, you would send this to your alerting system
    // Examples: PagerDuty, Slack, email, etc.
    this.sendAlert(alert);
  }

  /**
   * Send alert to external systems
   */
  async sendAlert(alert) {
    try {
      // Example: Send to Slack webhook
      if (process.env.SLACK_WEBHOOK_URL) {
        await this.sendSlackAlert(alert);
      }

      // Example: Send email alert
      if (process.env.ALERT_EMAIL) {
        await this.sendEmailAlert(alert);
      }

      // Log that alert was sent
      logger.info('Alert sent successfully', {
        alertType: alert.type,
        severity: alert.severity
      });
    } catch (error) {
      logger.error('Failed to send alert', {
        alertType: alert.type,
        error: error.message
      });
    }
  }

  /**
   * Send Slack alert (example implementation)
   */
  async sendSlackAlert(alert) {
    // This is a placeholder - implement actual Slack integration
    const message = {
      text: `🚨 Alert: ${alert.type}`,
      attachments: [{
        color: alert.severity === 'critical' ? 'danger' : 'warning',
        fields: Object.entries(alert.data).map(([key, value]) => ({
          title: key,
          value: typeof value === 'number' ? value.toFixed(2) : value,
          short: true
        }))
      }]
    };

    // In real implementation, send to Slack webhook
    console.log('Slack alert would be sent:', message);
  }

  /**
   * Send email alert (example implementation)
   */
  async sendEmailAlert(alert) {
    // This is a placeholder - implement actual email integration
    const emailContent = {
      to: process.env.ALERT_EMAIL,
      subject: `JobSphere Alert: ${alert.type}`,
      body: `
        Alert Type: ${alert.type}
        Severity: ${alert.severity}
        Timestamp: ${alert.timestamp}
        
        Details:
        ${JSON.stringify(alert.data, null, 2)}
      `
    };

    // In real implementation, send email
    console.log('Email alert would be sent:', emailContent);
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      system: {
        ...this.metrics.system,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        lastHealthCheck: new Date()
      }
    };
  }

  /**
   * Get health status
   */
  getHealthStatus() {
    const metrics = this.getMetrics();
    const errorRate = metrics.requests.total > 0 ? 
      metrics.requests.failed / metrics.requests.total : 0;
    const aiFailureRate = metrics.ai.totalAnalyses > 0 ? 
      metrics.ai.failedAnalyses / metrics.ai.totalAnalyses : 0;
    
    const memUsage = process.memoryUsage();
    const memoryUsageRatio = memUsage.heapUsed / memUsage.heapTotal;

    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        api: {
          status: errorRate < this.alerts.errorRate.threshold ? 'healthy' : 'unhealthy',
          errorRate,
          totalRequests: metrics.requests.total,
          averageResponseTime: metrics.requests.averageResponseTime
        },
        ai: {
          status: aiFailureRate < this.alerts.aiFailureRate.threshold ? 'healthy' : 'unhealthy',
          failureRate: aiFailureRate,
          totalAnalyses: metrics.ai.totalAnalyses,
          averageProcessingTime: metrics.ai.averageProcessingTime,
          cacheHitRate: metrics.ai.cacheHitRate
        },
        memory: {
          status: memoryUsageRatio < this.alerts.memoryUsage.threshold ? 'healthy' : 'unhealthy',
          usageRatio: memoryUsageRatio,
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal
        }
      }
    };

    // Overall status
    const unhealthyChecks = Object.values(status.checks).filter(check => check.status === 'unhealthy');
    if (unhealthyChecks.length > 0) {
      status.status = 'unhealthy';
    }

    return status;
  }

  /**
   * Start periodic health checks
   */
  startHealthChecks() {
    // Check memory usage every 5 minutes
    setInterval(() => {
      this.checkMemoryUsageAlert();
    }, 5 * 60 * 1000);

    // Log metrics every 15 minutes
    setInterval(() => {
      const metrics = this.getMetrics();
      logger.info('Periodic metrics report', {
        category: 'metrics',
        ...metrics
      });
    }, 15 * 60 * 1000);
  }

  /**
   * Reset metrics (for testing or maintenance)
   */
  resetMetrics() {
    this.metrics = {
      requests: { total: 0, successful: 0, failed: 0, averageResponseTime: 0 },
      ai: { totalAnalyses: 0, successfulAnalyses: 0, failedAnalyses: 0, averageProcessingTime: 0, cacheHitRate: 0 },
      errors: { total: 0, byType: {}, byEndpoint: {} },
      system: { uptime: process.uptime(), memoryUsage: process.memoryUsage(), lastHealthCheck: new Date() }
    };
    
    this.requestTimes = [];
    this.aiProcessingTimes = [];
    
    logger.info('Metrics reset');
  }
}

// Create singleton instance
const monitoring = new MonitoringService();

/**
 * Express middleware for request monitoring
 */
const requestMonitoringMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    monitoring.recordRequest(req, res, responseTime);
    originalEnd.apply(this, args);
  };
  
  next();
};

module.exports = {
  monitoring,
  requestMonitoringMiddleware
};