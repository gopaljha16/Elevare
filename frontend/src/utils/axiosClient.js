import axios from "axios";
import config from "../config/environment";

const axiosClient = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and errors
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const timestamp = new Date().toISOString();

    // Enhanced error logging
    console.group(`%c❌ API Request Failed [${timestamp}]`, 'color: #f44336; font-weight: bold');
    console.log(`%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'color: #f44336');
    
    if (error.config) {
      console.log(`🔗 URL: %c${error.config.url}`, 'color: #FF9800');
      console.log(`📤 Method: %c${error.config.method?.toUpperCase()}`, 'color: #FF9800');
      console.log(`📡 Base URL: %c${error.config.baseURL}`, 'color: #FF9800');
    }
    
    if (error.response) {
      console.log(`📊 Status: %c${error.response.status} ${error.response.statusText}`, 'color: #f44336; font-weight: bold');
      console.log(`📝 Response Data:`, error.response.data);
    } else if (error.request) {
      console.log(`%c🌐 Network Error - No Response Received`, 'color: #f44336; font-weight: bold');
      console.log(`   This usually means:`);
      console.log(`   1. Backend server is down or unreachable`);
      console.log(`   2. CORS is blocking the request`);
      console.log(`   3. Invalid API URL configuration`);
      console.log(`   4. Network connectivity issues`);
      console.log(`\n   Current API URL: %c${config.apiUrl}`, 'color: #FF9800; font-weight: bold');
    } else {
      console.log(`⚠️  Error: %c${error.message}`, 'color: #f44336');
    }
    
    console.log(`%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'color: #f44336');
    console.groupEnd();

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