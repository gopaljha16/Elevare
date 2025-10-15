import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

/**
 * Generic Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    this.setState({
      error,
      errorInfo
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // Log error to monitoring service (if available)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    try {
      // In a real application, you would send this to your error tracking service
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: localStorage.getItem('userId') || 'anonymous',
        errorId: this.state.errorId
      };

      // Example: Send to error tracking service
      // errorTrackingService.captureException(errorReport);
      
      console.error('Error Report:', errorReport);
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { fallback: CustomFallback, showDetails = false } = this.props;
      
      // Use custom fallback if provided
      if (CustomFallback) {
        return (
          <CustomFallback
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
            errorId={this.state.errorId}
          />
        );
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <Card className="max-w-md w-full p-6 text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
            </p>

            {this.state.errorId && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Error ID: {this.state.errorId}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleRetry}
                className="flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>

            {showDetails && process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * AI Analysis Error Boundary
 * Specialized error boundary for AI analysis components
 */
export const AIAnalysisErrorBoundary = ({ children }) => {
  const AIAnalysisFallback = ({ error, onRetry, errorId }) => (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <h3 className="font-medium text-red-800 dark:text-red-200">
          AI Analysis Error
        </h3>
      </div>
      
      <p className="text-red-700 dark:text-red-300 text-sm mb-4">
        The AI analysis feature is temporarily unavailable. This might be due to high demand or a temporary service issue.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          size="sm"
          onClick={onRetry}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Analysis
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </Button>
      </div>
      
      {errorId && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-3">
          Error ID: {errorId}
        </p>
      )}
    </div>
  );

  return (
    <ErrorBoundary fallback={AIAnalysisFallback}>
      {children}
    </ErrorBoundary>
  );
};

/**
 * Resume Builder Error Boundary
 * Specialized error boundary for resume builder components
 */
export const ResumeBuilderErrorBoundary = ({ children }) => {
  const ResumeBuilderFallback = ({ error, onRetry, errorId }) => (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <AlertTriangle className="h-5 w-5 text-yellow-500" />
        <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
          Resume Builder Error
        </h3>
      </div>
      
      <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-4">
        There was an issue with the resume builder. Your data has been saved automatically. Please try refreshing the page.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          size="sm"
          onClick={onRetry}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            // Save current state before refresh
            const currentData = localStorage.getItem('resumeBuilderState');
            if (currentData) {
              localStorage.setItem('resumeBuilderBackup', currentData);
            }
            window.location.reload();
          }}
        >
          Refresh & Restore
        </Button>
      </div>
      
      {errorId && (
        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-3">
          Error ID: {errorId}
        </p>
      )}
    </div>
  );

  return (
    <ErrorBoundary fallback={ResumeBuilderFallback}>
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;