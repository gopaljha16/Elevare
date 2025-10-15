import React, { createContext, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { theme, generateCSSVariables } from '../styles/theme';

const ThemeContext = createContext(null);

/**
 * ThemeProvider Component
 * Provides theme configuration and dark mode support throughout the app
 */
export const ThemeProvider = ({ children }) => {
  const isDarkMode = useSelector(state => state.theme?.isDarkMode || false);

  // Apply CSS variables to document root
  useEffect(() => {
    const root = document.documentElement;
    const cssVars = generateCSSVariables(theme);
    
    // Apply base theme variables
    Object.entries(cssVars).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    
    // Apply dark mode class
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Apply dark mode specific variables
    if (isDarkMode && theme.dark) {
      // Apply dark mode color overrides
      if (theme.dark.colors) {
        Object.entries(theme.dark.colors).forEach(([key, value]) => {
          if (typeof value === 'string') {
            root.style.setProperty(`--color-${key}`, value);
          } else if (typeof value === 'object') {
            Object.entries(value).forEach(([subKey, subValue]) => {
              root.style.setProperty(`--color-${key}-${subKey}`, subValue);
            });
          }
        });
      }
    }
  }, [isDarkMode]);

  const themeValue = {
    theme,
    isDarkMode,
    colors: theme.colors,
    spacing: theme.spacing,
    typography: theme.typography,
    components: theme.components,
    
    // Utility functions
    getColor: (colorPath) => {
      const keys = colorPath.split('.');
      let value = theme.colors;
      
      for (const key of keys) {
        value = value[key];
        if (!value) return colorPath;
      }
      
      return value;
    },
    
    getSpacing: (size) => theme.spacing[size] || size,
    getFontSize: (size) => theme.typography.fontSize[size] || size,
    getShadow: (size) => theme.boxShadow[size] || size,
    
    // Component variant helpers
    getButtonVariant: (variant = 'primary') => theme.components.button.variants[variant],
    getCardVariant: (variant = 'default') => theme.components.card.variants[variant],
    getInputVariant: (variant = 'default') => theme.components.input.variants[variant],
    getBadgeVariant: (variant = 'default') => theme.components.badge.variants[variant],
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

/**
 * Hook for responsive design
 */
export const useResponsive = () => {
  const [screenSize, setScreenSize] = React.useState('lg');
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(true);

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      
      if (width < 640) {
        setScreenSize('sm');
        setIsMobile(true);
        setIsTablet(false);
        setIsDesktop(false);
      } else if (width < 768) {
        setScreenSize('sm');
        setIsMobile(true);
        setIsTablet(false);
        setIsDesktop(false);
      } else if (width < 1024) {
        setScreenSize('md');
        setIsMobile(false);
        setIsTablet(true);
        setIsDesktop(false);
      } else if (width < 1280) {
        setScreenSize('lg');
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      } else {
        setScreenSize('xl');
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return {
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
    breakpoints: theme.breakpoints,
  };
};

/**
 * Hook for theme-aware animations
 */
export const useAnimations = () => {
  const { theme } = useTheme();
  
  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  };
  
  const slideUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };
  
  const slideDown = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3 }
  };
  
  const slideLeft = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
  };
  
  const slideRight = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3 }
  };
  
  const scale = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.3 }
  };
  
  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  return {
    fadeIn,
    slideUp,
    slideDown,
    slideLeft,
    slideRight,
    scale,
    stagger,
    duration: theme.animation.duration,
    easing: theme.animation.easing,
  };
};

/**
 * Hook for consistent spacing
 */
export const useSpacing = () => {
  const { getSpacing } = useTheme();
  
  return {
    xs: getSpacing('1'),
    sm: getSpacing('2'),
    md: getSpacing('4'),
    lg: getSpacing('6'),
    xl: getSpacing('8'),
    '2xl': getSpacing('12'),
    '3xl': getSpacing('16'),
    getSpacing,
  };
};

/**
 * Hook for consistent colors
 */
export const useColors = () => {
  const { getColor, isDarkMode } = useTheme();
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return getColor('success.500');
      case 'warning': return getColor('warning.500');
      case 'error': return getColor('error.500');
      case 'info': return getColor('primary.500');
      default: return getColor('gray.500');
    }
  };
  
  const getScoreColor = (score) => {
    if (score >= 90) return getColor('success.500');
    if (score >= 75) return getColor('warning.500');
    if (score >= 60) return getColor('warning.600');
    return getColor('error.500');
  };
  
  const getAIColor = (variant = 'primary') => {
    switch (variant) {
      case 'primary': return getColor('ai.500');
      case 'secondary': return getColor('secondary.500');
      case 'accent': return getColor('ai.600');
      default: return getColor('ai.500');
    }
  };
  
  return {
    primary: getColor('primary.500'),
    secondary: getColor('secondary.500'),
    success: getColor('success.500'),
    warning: getColor('warning.500'),
    error: getColor('error.500'),
    gray: getColor('gray.500'),
    ai: getColor('ai.500'),
    
    // Text colors
    text: {
      primary: isDarkMode ? getColor('gray.100') : getColor('gray.900'),
      secondary: isDarkMode ? getColor('gray.300') : getColor('gray.600'),
      muted: isDarkMode ? getColor('gray.400') : getColor('gray.500'),
    },
    
    // Background colors
    background: {
      primary: isDarkMode ? getColor('gray.900') : getColor('gray.50'),
      secondary: isDarkMode ? getColor('gray.800') : getColor('white'),
      accent: isDarkMode ? getColor('gray.700') : getColor('gray.100'),
    },
    
    // Border colors
    border: {
      primary: isDarkMode ? getColor('gray.700') : getColor('gray.200'),
      secondary: isDarkMode ? getColor('gray.600') : getColor('gray.300'),
    },
    
    // Utility functions
    getColor,
    getStatusColor,
    getScoreColor,
    getAIColor,
  };
};

export default ThemeProvider;