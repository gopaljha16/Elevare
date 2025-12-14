import React from 'react';
import { cn } from '../../utils/cn';

const LoadingOverlay = ({ 
  isVisible = false, 
  message = 'Loading...', 
  className = '',
  size = 'md' 
}) => {
  if (!isVisible) return null;

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center",
      "bg-gradient-to-br from-[#1a1b3a]/95 via-[#2d1b69]/95 to-[#1a1b3a]/95",
      "backdrop-blur-sm",
      className
    )}>
      <div className="text-center space-y-6">
        {/* Loading Spinner */}
        <div className="flex justify-center">
          <div className={cn(
            "border-4 border-gray-600 border-t-transparent rounded-full animate-spin",
            sizeClasses[size]
          )}></div>
        </div>
        
        {/* Loading Message */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">
            {message}
          </h3>
          <p className="text-gray-300 text-sm">
            Please wait while we process your request...
          </p>
        </div>
      </div>
    </div>
  );
};

// Simple spinner component for inline use
export const Spinner = ({ 
  size = 'md', 
  className = '',
  color = 'white' 
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4'
  };

  const colorClasses = {
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent',
    purple: 'border-purple-500 border-t-transparent',
    blue: 'border-blue-500 border-t-transparent'
  };

  return (
    <div className={cn(
      "rounded-full animate-spin",
      sizeClasses[size],
      colorClasses[color],
      className
    )}></div>
  );
};

export default LoadingOverlay;