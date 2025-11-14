import axios from "axios";
import config from "../config/environment";

const axiosClient = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

// Request counter for tracking
let requestCounter = 0;

// Request interceptor to add auth token and log requests
axiosClient.interceptors.request.use(
  (requestConfig) => {
    requestCounter++;
    const requestId = `REQ-${requestCounter}`;
    const timestamp = new Date().toISOString();
    
    // Add request ID to config for tracking
    requestConfig.requestId = requestId;
    requestConfig.requestTimestamp = timestamp;
    
    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log authentication requests in detail
    if (requestConfig.url?.includes('/auth/')) {
      console.log(`\n%c[${timestamp}] [${requestId}] 🔐 AUTH REQUEST`, 'color: #2196F3; font-weight: bold');
      console.log(`   Method: %c${requestConfig.method?.toUpperCase()}`, 'color: #FF9800');
      console.log(`   URL: %c${requestConfig.baseURL}${requestConfig.url}`, 'color: #FF9800');
      console.log(`   Origin: %c${window.location.origin}`, 'color: #9C27B0');
      console.log(`   Credentials: %c${requestConfig.withCredentials ? 'Included' : 'Not included'}`, requestConfig.withCredentials ? 'color: #4CAF50' : 'color: #f44336');
      console.log(`   Authorization: %c${requestConfig.headers.Authorization ? 'Present' : 'Not present'}`, requestConfig.headers.Authorization ? 'color: #4CAF50' : 'color: #FF9800');
      console.log(`   Content-Type: %c${requestConfig.headers['Content-Type']}`, 'color: #FF9800');
      if (requestConfig.data) {
        console.log(`   Payload:`, requestConfig.data);
      }
    }
    
    return requestConfig;
  },
  (error) => {
    console.error('%c❌ Request Interceptor Error', 'color: #f44336; font-weight: bold', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and errors
axiosClient.interceptors.response.use(
  (response) => {
    // Log successful auth responses
    if (response.config?.url?.includes('/auth/')) {
      const requestId = response.config.requestId || 'UNKNOWN';
      const timestamp = new Date().toISOString();
      console.log(`\n%c[${timestamp}] [${requestId}] ✅ AUTH RESPONSE SUCCESS`, 'color: #4CAF50; font-weight: bold');
      console.log(`   Status: %c${response.status} ${response.statusText}`, 'color: #4CAF50');
      console.log(`   URL: %c${response.config.url}`, 'color: #FF9800');
      console.log(`   Response:`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const timestamp = new Date().toISOString();
    const requestId = originalRequest?.requestId || 'UNKNOWN';

    // Enhanced error logging with request ID
    console.log(`\n%c╔════════════════════════════════════════════════════════════════╗`, 'color: #f44336; font-weight: bold');
    console.log(`%c║  ❌ API REQUEST FAILED [${requestId}]`, 'color: #f44336; font-weight: bold');
    console.log(`%c╚════════════════════════════════════════════════════════════════╝`, 'color: #f44336; font-weight: bold');
    console.log(`%cTimestamp: ${timestamp}`, 'color: #FF9800');
    
    if (error.config) {
      console.log(`\n%c📤 Request Details:`, 'color: #2196F3; font-weight: bold');
      console.log(`   Method: %c${error.config.method?.toUpperCase()}`, 'color: #FF9800');
      console.log(`   URL: %c${error.config.baseURL}${error.config.url}`, 'color: #FF9800');
      console.log(`   Origin: %c${window.location.origin}`, 'color: #9C27B0');
      console.log(`   Credentials: %c${error.config.withCredentials ? 'Included' : 'Not included'}`, error.config.withCredentials ? 'color: #4CAF50' : 'color: #f44336');
    }
    
    if (error.response) {
      console.log(`\n%c📥 Response Details:`, 'color: #2196F3; font-weight: bold');
      console.log(`   Status: %c${error.response.status} ${error.response.statusText}`, 'color: #f44336; font-weight: bold');
      console.log(`   Headers:`, error.response.headers);
      console.log(`   Data:`, error.response.data);
      
      // Check for CORS-related headers
      const corsHeaders = {
        'access-control-allow-origin': error.response.headers['access-control-allow-origin'],
        'access-control-allow-credentials': error.response.headers['access-control-allow-credentials'],
      };
      console.log(`\n%c🔐 CORS Headers:`, 'color: #2196F3; font-weight: bold');
      console.log(`   Allow-Origin: %c${corsHeaders['access-control-allow-origin'] || '❌ NOT SET'}`, corsHeaders['access-control-allow-origin'] ? 'color: #4CAF50' : 'color: #f44336');
      console.log(`   Allow-Credentials: %c${corsHeaders['access-control-allow-credentials'] || '❌ NOT SET'}`, corsHeaders['access-control-allow-credentials'] ? 'color: #4CAF50' : 'color: #f44336');
      
    } else if (error.request) {
      console.log(`\n%c🌐 Network Error - No Response Received`, 'color: #f44336; font-weight: bold');
      console.log(`\n%c🔍 Possible Causes:`, 'color: #FF9800; font-weight: bold');
      console.log(`   1. %cBackend server is down or unreachable`, 'color: #FF9800');
      console.log(`   2. %cCORS is blocking the request (check browser console for CORS errors)`, 'color: #FF9800');
      console.log(`   3. %cInvalid API URL configuration`, 'color: #FF9800');
      console.log(`   4. %cNetwork connectivity issues`, 'color: #FF9800');
      console.log(`\n%c📡 Configuration:`, 'color: #2196F3; font-weight: bold');
      console.log(`   API URL: %c${config.apiUrl}`, 'color: #9C27B0; font-weight: bold');
      console.log(`   Backend URL: %c${config.backendUrl}`, 'color: #9C27B0; font-weight: bold');
      console.log(`   Frontend Origin: %c${window.location.origin}`, 'color: #9C27B0; font-weight: bold');
    } else {
      console.log(`\n%c⚠️  Error Message:`, 'color: #FF9800; font-weight: bold');
      console.log(`   ${error.message}`);
    }
    
    console.log(`\n%c💡 Troubleshooting Steps:`, 'color: #2196F3; font-weight: bold');
    console.log(`   1. Check backend health: %c${config.backendUrl}/health`, 'color: #9C27B0');
    console.log(`   2. Open Network tab and look for CORS errors`);
    console.log(`   3. Verify backend allows origin: %c${window.location.origin}`, 'color: #9C27B0');
    console.log(`   4. Check Vercel environment variables are set`);
    console.log(`   5. Check Render environment variables are set`);
    
    console.log(`%c════════════════════════════════════════════════════════════════\n`, 'color: #f44336; font-weight: bold');

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          console.log('🔄 Attempting to refresh token...');
          const response = await axios.post(
            `${config.apiUrl}/auth/refresh-token`,
            { refreshToken }
          );

          const { token: newToken, refreshToken: newRefreshToken } = response.data.data;
          
          console.log('✅ Token refreshed successfully');
          
          // Update stored tokens
          localStorage.setItem('token', newToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Update the authorization header and retry the request
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          console.error('❌ Token refresh failed:', refreshError.message);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/login?error=session_expired';
          }
          
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('\n💡 Troubleshooting Steps:');
      console.error('   1. Check if backend is running: ' + config.backendUrl + '/health');
      console.error('   2. Verify CORS configuration allows your frontend origin');
      console.error('   3. Check browser console for CORS errors');
      console.error('   4. Verify environment variables are set correctly');
      
      // Network error - no response from server
      error.message = 'Unable to connect to server. Please check your internet connection.';
    } else if (error.response.status >= 500) {
      console.error('❌ Server error:', error.response.status);
      error.message = 'Server error. Please try again later.';
    } else if (error.response.status === 403) {
      console.error('❌ CORS or Permission error');
      console.error('   Check if your origin is allowed in backend CORS configuration');
    }

    return Promise.reject(error);
  }
);

export default axiosClient;