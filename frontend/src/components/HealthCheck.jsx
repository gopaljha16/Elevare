import React, { useState, useEffect } from 'react';
import apiClient from '../utils/api';

const HealthCheck = () => {
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      setError(null);
      const response = await apiClient.checkHealth();
      setHealth(response);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return '#4CAF50'; // Green
      case 'disconnected':
        return '#FF9800'; // Orange
      case 'error':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Gray
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return '✅';
      case 'disconnected':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  if (isLoading) {
    return (
      <div className="health-check loading">
        <span>Checking system health...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="health-check error">
        <span>❌ System health check failed: {error}</span>
        <button onClick={checkHealth} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="health-check">
      <div className="health-header">
        <h3>System Status</h3>
        <button onClick={checkHealth} className="refresh-button">
          🔄 Refresh
        </button>
      </div>
      
      <div className="health-status">
        <div className="status-item">
          <span className="status-label">Server:</span>
          <span 
            className="status-value"
            style={{ color: health?.status === 'OK' ? '#4CAF50' : '#F44336' }}
          >
            {health?.status === 'OK' ? '✅ Online' : '❌ Offline'}
          </span>
        </div>

        {health?.services && (
          <>
            <div className="status-item">
              <span className="status-label">Database:</span>
              <span 
                className="status-value"
                style={{ color: getStatusColor(health.services.database) }}
              >
                {getStatusIcon(health.services.database)} {health.services.database}
              </span>
            </div>

            <div className="status-item">
              <span className="status-label">Redis Cache:</span>
              <span 
                className="status-value"
                style={{ color: getStatusColor(health.services.redis) }}
              >
                {getStatusIcon(health.services.redis)} {health.services.redis}
              </span>
            </div>
          </>
        )}

        {health?.timestamp && (
          <div className="status-item">
            <span className="status-label">Last Check:</span>
            <span className="status-value">
              {new Date(health.timestamp).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <div className="health-info">
        <p className="info-text">
          {health?.services?.redis === 'connected' 
            ? '🚀 Redis is connected - Enhanced session management and logout features are active!'
            : '⚠️ Redis is not connected - Basic functionality available, but some features may be limited.'
          }
        </p>
      </div>
    </div>
  );
};

export default HealthCheck;