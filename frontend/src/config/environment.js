// Environment configuration
const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';

// Get environment variables with fallbacks
const getApiUrl = () => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback based on environment
  if (isProduction) {
    return 'https://elevare-hvtr.onrender.com/api';
  }
  
  return 'http://localhost:5000/api';
};

const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  if (isProduction) {
    return 'https://elevare-hvtr.onrender.com';
  }
  
  return 'http://localhost:5000';
};

const getFrontendUrl = () => {
  if (import.meta.env.VITE_FRONTEND_URL) {
    return import.meta.env.VITE_FRONTEND_URL;
  }
  
  if (isProduction) {
    return 'https://elevare-seven.vercel.app';
  }
  
  return 'http://localhost:5173';
};

export const config = {
  isDevelopment,
  isProduction,
  apiUrl: getApiUrl(),
  backendUrl: getBackendUrl(),
  frontendUrl: getFrontendUrl(),
};

export default config;
