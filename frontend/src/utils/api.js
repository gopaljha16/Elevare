import axiosClient from './axiosClient';

// API utility class using axios
class ApiClient {
  // Auth endpoints
  async login(credentials) {
    try {
      const response = await axiosClient.post('/auth/login', credentials);
      
      // Store tokens and user data
      if (response.data.success) {
        const { token, refreshToken, user } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return response.data;
    } catch (error) {
      // Handle validation errors from backend
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map(err => err.message).join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async register(userData) {
    try {
      const response = await axiosClient.post('/auth/register', userData);
      
      // Store tokens and user data
      if (response.data.success) {
        const { token, refreshToken, user } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return response.data;
    } catch (error) {
      // Handle validation errors from backend
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map(err => err.message).join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async getProfile() {
    try {
      const response = await axiosClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  }

  async updateProfile(userData) {
    try {
      const response = await axiosClient.put('/auth/profile', userData);
      
      // Update stored user data
      if (response.data.success) {
        const { user } = response.data.data;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await axiosClient.post('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  }

  async logout() {
    try {
      const response = await axiosClient.post('/auth/logout');
      
      // Clear stored data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      return response.data;
    } catch (error) {
      // Even if logout fails on server, clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  }

  // New: Logout from all devices
  async logoutAllDevices() {
    try {
      const response = await axiosClient.post('/auth/logout-all');
      
      // Clear stored data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      return response.data;
    } catch (error) {
      // Even if logout fails on server, clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      throw new Error(error.response?.data?.message || 'Logout from all devices failed');
    }
  }

  async refreshToken(refreshToken) {
    try {
      const response = await axiosClient.post('/auth/refresh-token', { refreshToken });
      
      // Update stored tokens
      if (response.data.success) {
        const { token: newToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      
      return response.data;
    } catch (error) {
      // Clear tokens if refresh fails
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  }

  async getUserStats() {
    try {
      const response = await axiosClient.get('/auth/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get user stats');
    }
  }

  // Utility methods
  isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // Health check
  async checkHealth() {
    try {
      const response = await axiosClient.get('/health');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Health check failed');
    }
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;

// Export individual methods for convenience
export const {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  logoutAllDevices,
  refreshToken,
  getUserStats,
  isAuthenticated,
  getCurrentUser,
  getToken,
  getRefreshToken,
  clearAuth,
  checkHealth,
} = apiClient;