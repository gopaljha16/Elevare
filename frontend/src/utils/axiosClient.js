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
      console.error('❌ Network error:', error.message);
      // Network error - no response from server
      error.message = 'Unable to connect to server. Please check your internet connection.';
    } else if (error.response.status >= 500) {
      console.error('❌ Server error:', error.response.status);
      error.message = 'Server error. Please try again later.';
    }

    return Promise.reject(error);
  }
);

export default axiosClient;