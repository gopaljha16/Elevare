import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { 
  performanceMonitor, 
  monitorMemoryUsage, 
  generatePerformanceReport 
} from '../../utils/performance.jsx';

/**
 * PerformanceDashboard Component
 * Development tool for monitoring application performance
 */
const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState({});
  const [memoryUsage, setMemoryUsage] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Update metrics
  const updateMetrics = useCallback(() => {
    setMetrics(performanceMonitor.getMetrics());
    setMemoryUsage(monitorMemoryUsage());
  }, []);

  // Auto-refresh metrics
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, updateMetrics]);

  // Initial load
  useEffect(() => {
    updateMetrics();
  }, [updateMetrics]);

  // Generate and download report
  const handleGenerateReport = useCallback(() => {
    const report = generatePerformanceReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Clear metrics
  const handleClearMetrics = useCallback(() => {
    performanceMonitor.clear();
    updateMetrics();
  }, [updateMetrics]);

  // Don't render in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          className="bg-white dark:bg-gray-800 shadow-lg"
        >
          📊 Perf
        </Button>
      </div>

      {/* Dashboard */}
      {isVisible && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Performance Dashboard
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                  >
                    {autoRefresh ? '⏸️ Pause' : '▶️ Resume'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateReport}
                  >
                    📄 Report
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearMetrics}
                  >
                    🗑️ Clear
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsVisible(false)}
                  >
                    ✕
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Memory Usage */}
                {memoryUsage && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Memory Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Used</span>
                            <span>{memoryUsage.used} MB</span>
                          </div>
                          <Progress 
                            value={(memoryUsage.used / memoryUsage.limit) * 100} 
                            className="h-2"
                          />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Total: {memoryUsage.total} MB / Limit: {memoryUsage.limit} MB
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Render Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Render Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(metrics)
                        .filter(([key]) => key.includes('render'))
                        .slice(0, 5)
                        .map(([key, metric]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="truncate">{key.split('.').pop()}</span>
                            <Badge 
                              variant={metric.duration > 16 ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {metric.duration?.toFixed(1)}ms
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Component Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Component Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(metrics)
                        .filter(([key]) => !key.includes('render'))
                        .slice(0, 5)
                        .map(([key, metric]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="truncate">{key}</span>
                            <Badge 
                              variant="secondary"
                              className="text-xs"
                            >
                              {metric.duration?.toFixed(1)}ms
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Tips */}
                <Card className="md:col-span-2 lg:col-span-3">
                  <CardHeader>
                    <CardTitle className="text-sm">Performance Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">
                          ✅ Good Performance
                        </h4>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                          <li>• Render times &lt; 16ms</li>
                          <li>• Memory usage &lt; 50MB</li>
                          <li>• Minimal re-renders</li>
                          <li>• Efficient memoization</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">
                          ⚠️ Performance Issues
                        </h4>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                          <li>• Render times &gt; 16ms</li>
                          <li>• Memory usage &gt; 100MB</li>
                          <li>• Frequent re-renders</li>
                          <li>• Large bundle sizes</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PerformanceDashboard;