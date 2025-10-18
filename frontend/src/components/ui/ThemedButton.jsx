import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useTheme, useAnimations } from '../ThemeProvider';

/**
 * ThemedButton Component
 * Enhanced button component with consistent theming and animations
 */
const ThemedButton = React.forwardRef(({
  variant = 'primary',
  size = 'md',
  children,
  className,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  animate = true,
  onClick,
  ...props
}, ref) => {
  const { getButtonVariant } = useTheme();
  const { scale } = useAnimations();
  
  const variantStyles = getButtonVariant(variant);
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const baseClasses = cn(
    // Base styles
    'inline-flex items-center justify-center font-medium rounded-lg',
    'border border-transparent',
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-95',
    
    // Size styles
    sizeStyles[size],
    
    // Width
    fullWidth && 'w-full',
    
    // Variant-specific styles
    variant === 'primary' && 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    variant === 'secondary' && 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500',
    variant === 'success' && 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    variant === 'warning' && 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500',
    variant === 'error' && 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    variant === 'outline' && 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    variant === 'ghost' && 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800',
    variant === 'gradient' && 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white focus:ring-blue-500',
    
    // Custom className
    className
  );

  const ButtonComponent = animate ? motion.button : 'button';
  const animationProps = animate ? {
    whileHover: { scale: disabled ? 1 : 1.02 },
    whileTap: { scale: disabled ? 1 : 0.98 },
    ...scale
  } : {};

  return (
    <ButtonComponent
      ref={ref}
      className={baseClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...animationProps}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && !loading && (
        <span className="ml-2">{icon}</span>
      )}
    </ButtonComponent>
  );
});

ThemedButton.displayName = 'ThemedButton';

export default ThemedButton;