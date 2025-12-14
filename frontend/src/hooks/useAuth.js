import { useState, useEffect, useCallback } from 'react';
import apiClient from '../utils/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        apiClient.clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.login(credentials);
      
      if (response.success) {
        const { user: userData } = response.data;
        setUser(userData);
        setIsAuthenticated(true);
        return response;
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.register(userData);
      
      if (response.success) {
        const { user: newUser } = response.data;
        setUser(newUser);
        setIsAuthenticated(true);
        return response;
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if server request fails
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, []);

  // Logout from all devices
  const logoutAllDevices = useCallback(async () => {
    try {
      setIsLoading(true);
      await apiClient.logoutAllDevices();
    } catch (error) {
      console.error('Logout all devices error:', error);
      // Continue with logout even if server request fails
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (profileData) => {
    try {
      setError(null);
      const response = await apiClient.updateProfile(profileData);
      
      if (response.success) {
        const { user: updatedUser } = response.data;
        setUser(updatedUser);
        return response;
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (passwordData) => {
    try {
      setError(null);
      const response = await apiClient.changePassword(passwordData);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Get user stats
  const getUserStats = useCallback(async () => {
    try {
      setError(null);
      const response = await apiClient.getUserStats();
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Refresh user profile
  const refreshProfile = useCallback(async () => {
    try {
      if (!isAuthenticated) return;
      
      const response = await apiClient.getProfile();
      if (response.success) {
        const { user: userData } = response.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      // If profile fetch fails, user might be logged out
      if (error.message.includes('401') || error.message.includes('token')) {
        setUser(null);
        setIsAuthenticated(false);
        apiClient.clearAuth();
      }
    }
  }, [isAuthenticated]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get token from localStorage
  const getToken = useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    token: localStorage.getItem('token'), // Expose token directly
    
    // Actions
    login,
    register,
    logout,
    logoutAllDevices,
    updateProfile,
    changePassword,
    getUserStats,
    refreshProfile,
    clearError,
    getToken, // Also expose getToken function for fresh token
  };
};

export default useAuth;