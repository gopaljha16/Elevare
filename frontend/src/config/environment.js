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

/**
 * Helper function to get the full API endpoint URL
 * In development: returns relative path to use Vite proxy
 * In production: returns full backend URL
 * 
 * @param {string} path - API path (e.g., '/auth/google', '/user/profile')
 * @returns {string} - Full URL or relative path based on environment
 */
const getApiEndpoint = (path) => {
  // Remove leading slash if present to normalize
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  
  if (isDevelopment) {
    // In development, use relative path to leverage Vite proxy
    const endpoint = `/api/${normalizedPath}`;
    console.log(`🔧 [DEV] API Endpoint: ${endpoint} (using Vite proxy)`);
    return endpoint;
  } else {
    // In production, use full backend URL
    const endpoint = `${getBackendUrl()}/api/${normalizedPath}`;
    console.log(`🚀 [PROD] API Endpoint: ${endpoint}`);
    return endpoint;
  }
};

export const config = {
  isDevelopment,
  isProduction,
  apiUrl: getApiUrl(),
  backendUrl: getBackendUrl(),
  frontendUrl: getFrontendUrl(),
  getApiEndpoint,
};

// Log environment detection on module load
console.log(`🌍 Environment detected: ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'}`);
console.log(`📡 API Base URL: ${getApiUrl()}`);
console.log(`🖥️  Backend URL: ${getBackendUrl()}`);
console.log(`🌐 Frontend URL: ${getFrontendUrl()}`);

export default config;
