/**
 * Comprehensive theme configuration for Elevare
 * Provides consistent styling across all components
 */

export const theme = {
  // Color palette
  colors: {
    // Primary colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // Secondary colors (Purple)
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87',
    },
    
    // Success colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    
    // Warning colors
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    
    // Error colors
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    
    // Neutral colors
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    
    // AI/Analysis specific colors
    ai: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    }
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  // Spacing
  spacing: {
    px: '1px',
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
  },
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  
  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },
  
  // Animations
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
  
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Component-specific themes
  components: {
    button: {
      variants: {
        primary: {
          bg: 'primary.600',
          color: 'white',
          hover: 'primary.700',
          active: 'primary.800',
        },
        secondary: {
          bg: 'secondary.600',
          color: 'white',
          hover: 'secondary.700',
          active: 'secondary.800',
        },
        success: {
          bg: 'success.600',
          color: 'white',
          hover: 'success.700',
          active: 'success.800',
        },
        warning: {
          bg: 'warning.600',
          color: 'white',
          hover: 'warning.700',
          active: 'warning.800',
        },
        error: {
          bg: 'error.600',
          color: 'white',
          hover: 'error.700',
          active: 'error.800',
        },
        outline: {
          bg: 'transparent',
          color: 'gray.700',
          border: 'gray.300',
          hover: 'gray.50',
        },
        ghost: {
          bg: 'transparent',
          color: 'gray.700',
          hover: 'gray.100',
        },
        gradient: {
          bg: 'linear-gradient(135deg, primary.600, secondary.600)',
          color: 'white',
          hover: 'linear-gradient(135deg, primary.700, secondary.700)',
        },
      },
      sizes: {
        sm: {
          px: '3',
          py: '1.5',
          fontSize: 'sm',
        },
        md: {
          px: '4',
          py: '2',
          fontSize: 'base',
        },
        lg: {
          px: '6',
          py: '3',
          fontSize: 'lg',
        },
      },
    },
    
    card: {
      variants: {
        default: {
          bg: 'white',
          border: 'gray.200',
          shadow: 'base',
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.8)',
          border: 'rgba(255, 255, 255, 0.2)',
          shadow: 'glass',
          backdrop: 'blur(12px)',
        },
        elevated: {
          bg: 'white',
          border: 'gray.200',
          shadow: 'lg',
        },
      },
    },
    
    input: {
      variants: {
        default: {
          bg: 'white',
          border: 'gray.300',
          focus: 'primary.500',
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.8)',
          border: 'rgba(255, 255, 255, 0.2)',
          focus: 'primary.500',
          backdrop: 'blur(12px)',
        },
      },
    },
    
    badge: {
      variants: {
        default: {
          bg: 'primary.100',
          color: 'primary.800',
        },
        secondary: {
          bg: 'secondary.100',
          color: 'secondary.800',
        },
        success: {
          bg: 'success.100',
          color: 'success.800',
        },
        warning: {
          bg: 'warning.100',
          color: 'warning.800',
        },
        error: {
          bg: 'error.100',
          color: 'error.800',
        },
        outline: {
          bg: 'transparent',
          color: 'gray.700',
          border: 'gray.300',
        },
      },
    },
  },
  
  // Dark mode overrides
  dark: {
    colors: {
      background: 'gray.900',
      surface: 'gray.800',
      text: {
        primary: 'gray.100',
        secondary: 'gray.300',
        muted: 'gray.400',
      },
    },
    components: {
      card: {
        variants: {
          default: {
            bg: 'gray.800',
            border: 'gray.700',
          },
          glass: {
            bg: 'rgba(31, 41, 55, 0.8)',
            border: 'rgba(75, 85, 99, 0.2)',
          },
        },
      },
      input: {
        variants: {
          default: {
            bg: 'gray.800',
            border: 'gray.600',
            color: 'gray.100',
          },
          glass: {
            bg: 'rgba(31, 41, 55, 0.8)',
            border: 'rgba(75, 85, 99, 0.2)',
            color: 'gray.100',
          },
        },
      },
    },
  },
};

// Utility functions for theme usage
export const getColor = (colorPath, theme) => {
  const keys = colorPath.split('.');
  let value = theme.colors;
  
  for (const key of keys) {
    value = value[key];
    if (!value) return colorPath; // Return original if not found
  }
  
  return value;
};

export const getSpacing = (size, theme) => {
  return theme.spacing[size] || size;
};

export const getFontSize = (size, theme) => {
  return theme.typography.fontSize[size] || size;
};

export const getShadow = (size, theme) => {
  return theme.boxShadow[size] || size;
};

// CSS custom properties generator
export const generateCSSVariables = (theme) => {
  const cssVars = {};
  
  // Generate color variables
  Object.entries(theme.colors).forEach(([colorName, colorValues]) => {
    if (typeof colorValues === 'object') {
      Object.entries(colorValues).forEach(([shade, value]) => {
        cssVars[`--color-${colorName}-${shade}`] = value;
      });
    } else {
      cssVars[`--color-${colorName}`] = colorValues;
    }
  });
  
  // Generate spacing variables
  Object.entries(theme.spacing).forEach(([size, value]) => {
    cssVars[`--spacing-${size}`] = value;
  });
  
  // Generate typography variables
  Object.entries(theme.typography.fontSize).forEach(([size, value]) => {
    cssVars[`--font-size-${size}`] = value;
  });
  
  return cssVars;
};

export default theme;