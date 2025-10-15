import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimations, useResponsive } from '../ThemeProvider';

/**
 * AnimatedContainer Component
 * Provides consistent animations across the application
 */
const AnimatedContainer = ({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = 0.3,
  stagger = false,
  className,
  ...props
}) => {
  const animations = useAnimations();
  const { isMobile } = useResponsive();
  
  // Reduce animations on mobile for better performance
  const shouldAnimate = !isMobile || animation === 'fadeIn';
  
  const getAnimation = () => {
    if (!shouldAnimate) return { initial: {}, animate: {}, exit: {} };
    
    const baseAnimation = animations[animation] || animations.fadeIn;
    
    return {
      ...baseAnimation,
      transition: {
        ...baseAnimation.transition,
        duration,
        delay,
      }
    };
  };

  const containerProps = stagger ? {
    initial: "initial",
    animate: "animate",
    exit: "exit",
    variants: {
      initial: {},
      animate: {
        transition: {
          staggerChildren: 0.1,
          delayChildren: delay,
        }
      },
      exit: {}
    }
  } : getAnimation();

  return (
    <motion.div
      className={className}
      {...containerProps}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * AnimatedList Component
 * Provides staggered animations for list items
 */
export const AnimatedList = ({
  children,
  animation = 'slideUp',
  staggerDelay = 0.1,
  className,
  ...props
}) => {
  const animations = useAnimations();
  
  const listVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay,
      }
    }
  };

  const itemVariants = animations[animation] || animations.slideUp;

  return (
    <motion.div
      className={className}
      variants={listVariants}
      initial="initial"
      animate="animate"
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

/**
 * AnimatedGrid Component
 * Provides staggered animations for grid layouts
 */
export const AnimatedGrid = ({
  children,
  columns = 3,
  animation = 'scale',
  staggerDelay = 0.1,
  className,
  ...props
}) => {
  const animations = useAnimations();
  const { isMobile, isTablet } = useResponsive();
  
  // Adjust columns based on screen size
  const responsiveColumns = isMobile ? 1 : isTablet ? 2 : columns;
  
  const gridVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay,
      }
    }
  };

  const itemVariants = animations[animation] || animations.scale;

  return (
    <motion.div
      className={`grid gap-6 ${className}`}
      style={{ gridTemplateColumns: `repeat(${responsiveColumns}, 1fr)` }}
      variants={gridVariants}
      initial="initial"
      animate="animate"
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

/**
 * PageTransition Component
 * Provides page-level transitions
 */
export const PageTransition = ({
  children,
  className,
  ...props
}) => {
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: 'easeIn',
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * SlidePanel Component
 * Provides slide-in/out animations for panels
 */
export const SlidePanel = ({
  children,
  isOpen,
  direction = 'right',
  className,
  ...props
}) => {
  const getSlideVariants = () => {
    const directions = {
      left: { x: '-100%' },
      right: { x: '100%' },
      up: { y: '-100%' },
      down: { y: '100%' },
    };

    return {
      closed: {
        ...directions[direction],
        opacity: 0,
      },
      open: {
        x: 0,
        y: 0,
        opacity: 1,
        transition: {
          type: 'spring',
          damping: 20,
          stiffness: 300,
        }
      }
    };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={className}
          variants={getSlideVariants()}
          initial="closed"
          animate="open"
          exit="closed"
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * FadeTransition Component
 * Simple fade in/out transition
 */
export const FadeTransition = ({
  children,
  show,
  duration = 0.3,
  className,
  ...props
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={className}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration }}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * ScaleTransition Component
 * Scale in/out transition with optional backdrop
 */
export const ScaleTransition = ({
  children,
  show,
  backdrop = false,
  className,
  ...props
}) => {
  const scaleVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300,
      }
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {backdrop && (
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            />
          )}
          <motion.div
            className={className}
            variants={scaleVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            {...props}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * LoadingAnimation Component
 * Consistent loading animations
 */
export const LoadingAnimation = ({
  type = 'spinner',
  size = 'md',
  color = 'primary',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'border-blue-500',
    secondary: 'border-purple-500',
    success: 'border-green-500',
    warning: 'border-yellow-500',
    error: 'border-red-500',
  };

  if (type === 'spinner') {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div className={`w-full h-full border-2 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`} />
      </div>
    );
  }

  if (type === 'dots') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 bg-current rounded-full ${colorClasses[color].replace('border-', 'text-')}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <motion.div
        className={`${sizeClasses[size]} bg-current rounded-full ${colorClasses[color].replace('border-', 'text-')} ${className}`}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      />
    );
  }

  return null;
};

export default AnimatedContainer;