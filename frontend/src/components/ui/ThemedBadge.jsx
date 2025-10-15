import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useTheme, useColors } from '../ThemeProvider';

/**
 * ThemedBadge Component
 * Enhanced badge component with consistent theming and animations
 */
const ThemedBadge = React.forwardRef(({
  variant = 'default',
  size = 'md',
  children,
  className,
  animate = true,
  icon,
  iconPosition = 'left',
  removable = false,
  onRemove,
  ...props
}, ref) => {
  const { getBadgeVariant } = useTheme();
  const { getStatusColor, getScoreColor } = useColors();
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const baseClasses = cn(
    // Base styles
    'inline-flex items-center font-medium rounded-full',
    'transition-all duration-200 ease-in-out',
    
    // Size styles
    sizeStyles[size],
    
    // Variant-specific styles
    variant === 'default' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    variant === 'secondary' && 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    variant === 'success' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    variant === 'warning' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    variant === 'error' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    variant === 'outline' && 'border border-gray-300 text-gray-700 bg-transparent dark:border-gray-600 dark:text-gray-300',
    variant === 'glass' && 'bg-white/20 text-gray-800 backdrop-blur-sm border border-white/30 dark:bg-gray-800/20 dark:text-gray-200',
    
    // Custom className
    className
  );

  const BadgeComponent = animate ? motion.span : 'span';
  const animationProps = animate ? {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2 }
  } : {};

  return (
    <BadgeComponent
      ref={ref}
      className={baseClasses}
      {...animationProps}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="mr-1">{icon}</span>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && (
        <span className="ml-1">{icon}</span>
      )}
      
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
          type="button"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </BadgeComponent>
  );
});

/**
 * ScoreBadge Component
 * Specialized badge for displaying scores with color coding
 */
export const ScoreBadge = React.forwardRef(({
  score,
  maxScore = 100,
  showProgress = false,
  label,
  className,
  ...props
}, ref) => {
  const { getScoreColor } = useColors();
  
  const percentage = (score / maxScore) * 100;
  const variant = percentage >= 90 ? 'success' : 
                 percentage >= 75 ? 'warning' : 
                 percentage >= 60 ? 'warning' : 'error';

  return (
    <div className="flex items-center gap-2">
      <ThemedBadge
        ref={ref}
        variant={variant}
        className={className}
        {...props}
      >
        {label && <span className="mr-1">{label}:</span>}
        {score}{maxScore === 100 ? '%' : `/${maxScore}`}
      </ThemedBadge>
      
      {showProgress && (
        <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-current transition-all duration-300"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: getScoreColor(percentage)
            }}
          />
        </div>
      )}
    </div>
  );
});

/**
 * StatusBadge Component
 * Specialized badge for displaying status with appropriate colors
 */
export const StatusBadge = React.forwardRef(({
  status,
  className,
  ...props
}, ref) => {
  const getVariantFromStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'published':
      case 'completed':
      case 'success':
        return 'success';
      case 'draft':
      case 'pending':
      case 'in-progress':
        return 'warning';
      case 'inactive':
      case 'failed':
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <ThemedBadge
      ref={ref}
      variant={getVariantFromStatus(status)}
      className={className}
      {...props}
    >
      {status}
    </ThemedBadge>
  );
});

/**
 * AIBadge Component
 * Specialized badge for AI-related features
 */
export const AIBadge = React.forwardRef(({
  children,
  className,
  glowing = false,
  ...props
}, ref) => {
  return (
    <ThemedBadge
      ref={ref}
      variant="secondary"
      className={cn(
        'bg-gradient-to-r from-purple-500 to-blue-500 text-white',
        glowing && 'animate-pulse shadow-lg shadow-purple-500/25',
        className
      )}
      icon={<span className="text-xs">✨</span>}
      {...props}
    >
      {children}
    </ThemedBadge>
  );
});

ThemedBadge.displayName = 'ThemedBadge';
ScoreBadge.displayName = 'ScoreBadge';
StatusBadge.displayName = 'StatusBadge';
AIBadge.displayName = 'AIBadge';

export default ThemedBadge;