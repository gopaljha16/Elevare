import React from 'react';
import { cn } from '../../utils/cn';

const CircularProgress = ({
  value = 0,
  size = 120,
  strokeWidth = 6,
  className = '',
  showValue = true,
  color = 'blue'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const getColor = () => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStrokeColor = () => {
    if (value >= 80) return 'stroke-green-500';
    if (value >= 60) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn("transition-all duration-1000 ease-out", getStrokeColor())}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={cn("text-3xl font-bold", getColor())}>
              {Math.round(value)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              ATS Score
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CircularProgress;