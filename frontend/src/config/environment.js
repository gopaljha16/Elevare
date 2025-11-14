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

// Enhanced startup logging with production debugging information
console.log('\n%c╔════════════════════════════════════════════════════════════════╗', 'color: #4CAF50; font-weight: bold');
console.log('%c║           🌍 FRONTEND ENVIRONMENT CONFIGURATION                ║', 'color: #4CAF50; font-weight: bold');
console.log('%c╚════════════════════════════════════════════════════════════════╝', 'color: #4CAF50; font-weight: bold');

console.log('\n%c📋 Build Information:', 'color: #2196F3; font-weight: bold');
console.log(`   Environment: %c${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'}`, 'color: #FF9800; font-weight: bold');
console.log(`   Mode: %c${import.meta.env.MODE}`, 'color: #FF9800');
console.log(`   Build Time: %c${new Date().toISOString()}`, 'color: #FF9800');

console.log('\n%c🌐 URL Configuration:', 'color: #2196F3; font-weight: bold');
console.log(`   API Base URL: %c${getApiUrl()}`, 'color: #FF9800; font-weight: bold');
console.log(`   Backend URL: %c${getBackendUrl()}`, 'color: #FF9800; font-weight: bold');
console.log(`   Frontend URL: %c${getFrontendUrl()}`, 'color: #FF9800; font-weight: bold');

console.log('\n%c📦 Environment Variables Status:', 'color: #2196F3; font-weight: bold');
const viteApiUrl = import.meta.env.VITE_API_URL;
const viteBackendUrl = import.meta.env.VITE_BACKEND_URL;
const viteFrontendUrl = import.meta.env.VITE_FRONTEND_URL;

console.log(`   VITE_API_URL: ${viteApiUrl ? `%c✅ Set (${viteApiUrl})` : '%c❌ Not Set (using fallback)'}`, viteApiUrl ? 'color: #4CAF50' : 'color: #f44336');
console.log(`   VITE_BACKEND_URL: ${viteBackendUrl ? `%c✅ Set (${viteBackendUrl})` : '%c❌ Not Set (using fallback)'}`, viteBackendUrl ? 'color: #4CAF50' : 'color: #f44336');
console.log(`   VITE_FRONTEND_URL: ${viteFrontendUrl ? `%c✅ Set (${viteFrontendUrl})` : '%c❌ Not Set (using fallback)'}`, viteFrontendUrl ? 'color: #4CAF50' : 'color: #f44336');

console.log('\n%c🔍 Actual Values Being Used:', 'color: #2196F3; font-weight: bold');
console.log(`   API URL: %c${getApiUrl()}`, 'color: #9C27B0; font-weight: bold');
console.log(`   Backend URL: %c${getBackendUrl()}`, 'color: #9C27B0; font-weight: bold');
console.log(`   Frontend URL: %c${getFrontendUrl()}`, 'color: #9C27B0; font-weight: bold');

// Production-specific warnings
if (isProduction) {
  console.log('\n%c⚠️  Production Environment Checks:', 'color: #FF9800; font-weight: bold');
  
  const warnings = [];
  if (!viteApiUrl) {
    warnings.push('VITE_API_URL not set - using hardcoded fallback');
  }
  if (!viteBackendUrl) {
    warnings.push('VITE_BACKEND_URL not set - using hardcoded fallback');
  }
  if (!viteFrontendUrl) {
    warnings.push('VITE_FRONTEND_URL not set - using hardcoded fallback');
  }
  
  if (warnings.length > 0) {
    warnings.forEach(warning => {
      console.warn(`   ⚠️  ${warning}`);
    });
    console.log('\n%c💡 Fix: Set environment variables in Vercel dashboard:', 'color: #2196F3');
    console.log('   1. Go to Vercel project settings');
    console.log('   2. Navigate to Environment Variables');
    console.log('   3. Add VITE_API_URL, VITE_BACKEND_URL, VITE_FRONTEND_URL');
    console.log('   4. Redeploy the application');
  } else {
    console.log('   %c✅ All environment variables are properly set', 'color: #4CAF50; font-weight: bold');
  }
}

console.log('\n%c🔐 CORS & Authentication:', 'color: #2196F3; font-weight: bold');
console.log('   Credentials: %cEnabled (cookies & auth headers will be sent)', 'color: #4CAF50');
console.log('   Origin: %c' + window.location.origin, 'color: #9C27B0');
console.log('   Expected Backend Origin: %c' + getBackendUrl(), 'color: #9C27B0');

console.log('\n%c💡 Debugging Tips:', 'color: #2196F3; font-weight: bold');
console.log('   • All API requests will be logged below');
console.log('   • Check Network tab for CORS errors');
console.log('   • Verify backend allows origin: ' + window.location.origin);
console.log('   • Check that backend is running: ' + getBackendUrl() + '/health');

console.log('\n%c════════════════════════════════════════════════════════════════', 'color: #4CAF50; font-weight: bold');
console.log('%c✅ Frontend initialized and ready', 'color: #4CAF50; font-weight: bold');
console.log('%c════════════════════════════════════════════════════════════════\n', 'color: #4CAF50; font-weight: bold');

export default config;
