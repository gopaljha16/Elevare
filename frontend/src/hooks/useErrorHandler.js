import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Comprehensive error handling hook
 * Provides consistent error handling across the application
 */
export const useErrorHandler = () => {
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Clear specific error by key
   */
  const clearError = useCallback((key) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  }, []);

  /**
   * Set error for specific key
   */
  const setError = useCallback((key, error) => {
    setErrors(prev => ({
      ...prev,
      [key]: error
    }));
  }, []);

  /**
   * Handle API errors with user-friendly messages
   */
  const handleApiError = useCallback((error, context = 'operation') => {
    console.error(`API Error in ${context}:`, error);

    let userMessage = 'An unexpected error occurred. Please try again.';
    let errorCode = 'UNKNOWN_ERROR';
    let shouldRetry = true;

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      errorCode = data?.error?.errorCode || `HTTP_${status}`;

      switch (status) {
        case 400:
          userMessage = data?.error?.message || 'Invalid request. Please check your input.';
          shouldRetry = false;
          break;
        case 401:
          userMessage = 'Your session has expired. Please log in again.';
          shouldRetry = false;
          // Redirect to login
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          break;
        case 403:
          userMessage = 'You don\'t have permission to perform this action.';
          shouldRetry = false;
          break;
        case 404:
          userMessage = 'The requested resource was not found.';
          shouldRetry = false;
          break;
        case 429:
          const retryAfter = data?.retryAfter || '15 minutes';
          userMessage = `Too many requests. Please try again after ${retryAfter}.`;
          shouldRetry = true;
          break;
        case 500:
          userMessage = 'Server error. Our team has been notified.';
          shouldRetry = true;
          break;
        case 503:
          userMessage = 'Service temporarily unavailable. Please try again later.';
          shouldRetry = true;
          break;
        default:
          userMessage = data?.error?.message || `Server error (${status}). Please try again.`;
      }
    } else if (error.request) {
      // Network error
      userMessage = 'Network error. Please check your connection and try again.';
      errorCode = 'NETWORK_ERROR';
      shouldRetry = true;
    } else {
      // Other error
      userMessage = error.message || 'An unexpected error occurred.';
      errorCode = 'CLIENT_ERROR';
      shouldRetry = false;
    }

    const errorInfo = {
      message: userMessage,
      code: errorCode,
      shouldRetry,
      timestamp: new Date().toISOString(),
      context
    };

    // Show toast notification
    toast.error(userMessage, {
      duration: shouldRetry ? 6000 : 4000,
      id: `error-${context}-${errorCode}`
    });

    return errorInfo;
  }, []);

  /**
   * Handle AI service specific errors
   */
  const handleAIError = useCallback((error, operation = 'AI analysis') => {
    console.error(`AI Service Error in ${operation}:`, error);

    let userMessage = 'AI service is temporarily unavailable. Please try again later.';
    let shouldRetry = true;

    if (error.response?.status === 429) {
      userMessage = 'AI service rate limit reached. Please wait a few minutes before trying again.';
    } else if (error.response?.status === 503) {
      userMessage = 'AI service is currently overloaded. Please try again in a few minutes.';
    } else if (error.message?.includes('quota')) {
      userMessage = 'AI service quota exceeded. Please try again later.';
      shouldRetry = false;
    }

    const errorInfo = {
      message: userMessage,
      code: 'AI_SERVICE_ERROR',
      shouldRetry,
      timestamp: new Date().toISOString(),
      context: operation
    };

    toast.error(userMessage, {
      duration: 8000,
      id: `ai-error-${operation}`
    });

    return errorInfo;
  }, []);

  /**
   * Handle validation errors
   */
  const handleValidationError = useCallback((validationErrors, context = 'form') => {
    const formattedErrors = {};

    if (Array.isArray(validationErrors)) {
      validationErrors.forEach(error => {
        if (error.field) {
          formattedErrors[error.field] = error.message;
        }
      });
    } else if (typeof validationErrors === 'object') {
      Object.entries(validationErrors).forEach(([field, message]) => {
        formattedErrors[field] = message;
      });
    }

    setErrors(prev => ({
      ...prev,
      ...formattedErrors
    }));

    // Show general validation error toast
    toast.error('Please correct the highlighted fields and try again.', {
      id: `validation-${context}`
    });

    return formattedErrors;
  }, []);

  /**
   * Async operation wrapper with error handling
   */
  const withErrorHandling = useCallback(async (
    operation,
    {
      context = 'operation',
      showLoading = true,
      showSuccess = false,
      successMessage = 'Operation completed successfully',
      onError = null,
      onSuccess = null
    } = {}
  ) => {
    if (showLoading) setIsLoading(true);
    clearError(context);

    try {
      const result = await operation();
      
      if (showSuccess) {
        toast.success(successMessage, {
          id: `success-${context}`
        });
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      let errorInfo;
      
      if (context.includes('ai') || context.includes('analysis')) {
        errorInfo = handleAIError(error, context);
      } else {
        errorInfo = handleApiError(error, context);
      }
      
      setError(context, errorInfo);
      
      if (onError) {
        onError(errorInfo);
      }
      
      throw errorInfo; // Re-throw for component handling
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [handleApiError, handleAIError, clearError, setError]);

  /**
   * Retry operation with exponential backoff
   */
  const retryOperation = useCallback(async (
    operation,
    {
      maxRetries = 3,
      baseDelay = 1000,
      context = 'retry-operation'
    } = {}
  ) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Don't retry on client errors (4xx)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          break;
        }
        
        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.log(`Retrying ${context} (attempt ${attempt + 1}/${maxRetries}) after ${delay}ms`);
      }
    }
    
    throw lastError;
  }, []);

  /**
   * Get user-friendly error message
   */
  const getErrorMessage = useCallback((key) => {
    const error = errors[key];
    return error?.message || null;
  }, [errors]);

  /**
   * Check if specific error exists
   */
  const hasError = useCallback((key) => {
    return Boolean(errors[key]);
  }, [errors]);

  /**
   * Check if any errors exist
   */
  const hasAnyError = useCallback(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  return {
    errors,
    isLoading,
    clearErrors,
    clearError,
    setError,
    handleApiError,
    handleAIError,
    handleValidationError,
    withErrorHandling,
    retryOperation,
    getErrorMessage,
    hasError,
    hasAnyError
  };
};

/**
 * Error recovery utilities
 */
export const errorRecoveryUtils = {
  /**
   * Save current state for recovery
   */
  saveStateForRecovery: (key, state) => {
    try {
      localStorage.setItem(`recovery_${key}`, JSON.stringify({
        state,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to save recovery state:', error);
    }
  },

  /**
   * Recover saved state
   */
  recoverState: (key, maxAge = 24 * 60 * 60 * 1000) => { // 24 hours default
    try {
      const saved = localStorage.getItem(`recovery_${key}`);
      if (!saved) return null;

      const { state, timestamp } = JSON.parse(saved);
      
      // Check if state is not too old
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(`recovery_${key}`);
        return null;
      }

      return state;
    } catch (error) {
      console.warn('Failed to recover state:', error);
      return null;
    }
  },

  /**
   * Clear recovery state
   */
  clearRecoveryState: (key) => {
    try {
      localStorage.removeItem(`recovery_${key}`);
    } catch (error) {
      console.warn('Failed to clear recovery state:', error);
    }
  }
};

export default useErrorHandler;