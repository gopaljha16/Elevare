import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useTheme, useAnimations } from '../ThemeProvider';

/**
 * ThemedCard Component
 * Enhanced card component with consistent theming and glass morphism effects
 */
const ThemedCard = React.forwardRef(({
  variant = 'default',
  children,
  className,
  animate = true,
  hover = true,
  padding = 'md',
  ...props
}, ref) => {
  const { getCardVariant } = useTheme();
  const { scale } = useAnimations();
  
  const variantStyles = getCardVariant(variant);
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  const baseClasses = cn(
    // Base styles
    'rounded-xl border transition-all duration-300',
    
    // Padding
    paddingStyles[padding],
    
    // Variant-specific styles
    variant === 'default' && 'bg-white border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700',
    variant === 'glass' && 'bg-white/80 border-white/20 shadow-lg backdrop-blur-sm dark:bg-gray-800/80 dark:border-gray-700/20',
    variant === 'elevated' && 'bg-white border-gray-200 shadow-lg dark:bg-gray-800 dark:border-gray-700',
    variant === 'gradient' && 'bg-gradient-to-br from-white via-blue-50 to-purple-50 border-white/20 shadow-lg dark:from-gray-800 dark:via-blue-900/20 dark:to-purple-900/20',
    
    // Hover effects
    hover && 'hover:shadow-xl hover:-translate-y-1',
    
    // Custom className
    className
  );

  const CardComponent = animate ? motion.div : 'div';
  const animationProps = animate ? {
    whileHover: hover ? { y: -4, scale: 1.02 } : {},
    ...scale
  } : {};

  return (
    <CardComponent
      ref={ref}
      className={baseClasses}
      {...animationProps}
      {...props}
    >
      {children}
    </CardComponent>
  );
});

/**
 * ThemedCardHeader Component
 */
const ThemedCardHeader = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('mb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
});

/**
 * ThemedCardTitle Component
 */
const ThemedCardTitle = React.forwardRef(({
  children,
  className,
  size = 'lg',
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'text-base font-semibold',
    md: 'text-lg font-semibold',
    lg: 'text-xl font-bold',
    xl: 'text-2xl font-bold',
  };

  return (
    <h3
      ref={ref}
      className={cn(
        'text-gray-900 dark:text-white mb-2',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
});

/**
 * ThemedCardContent Component
 */
const ThemedCardContent = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('text-gray-600 dark:text-gray-300', className)}
      {...props}
    >
      {children}
    </div>
  );
});

/**
 * ThemedCardFooter Component
 */
const ThemedCardFooter = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('mt-4 pt-4 border-t border-gray-200 dark:border-gray-700', className)}
      {...props}
    >
      {children}
    </div>
  );
});

ThemedCard.displayName = 'ThemedCard';
ThemedCardHeader.displayName = 'ThemedCardHeader';
ThemedCardTitle.displayName = 'ThemedCardTitle';
ThemedCardContent.displayName = 'ThemedCardContent';
ThemedCardFooter.displayName = 'ThemedCardFooter';

export {
  ThemedCard,
  ThemedCardHeader,
  ThemedCardTitle,
  ThemedCardContent,
  ThemedCardFooter,
};

export default ThemedCard;