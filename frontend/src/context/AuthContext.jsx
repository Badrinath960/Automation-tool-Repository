import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('atr_token'));
  const [loading, setLoading] = useState(true);

  // Function to load user profile if token exists
  const loadUser = async (authToken) => {
    try {
      const response = await authApi.getMe();
      if (response && response.success) {
        setUser(response.data);
      } else {
        // Handle unexpected success=false response
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user profiles:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Run on mount to check token validity
  useEffect(() => {
    const storedToken = localStorage.getItem('atr_token');
    if (storedToken) {
      setToken(storedToken);
      loadUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Login action
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authApi.login(email, password);
      if (response && response.success && response.data) {
        const { access_token } = response.data;
        localStorage.setItem('atr_token', access_token);
        setToken(access_token);
        
        // Fetch full user profile details immediately after login
        // Axios interceptor will automatically attach the new token
        const meResponse = await authApi.getMe();
        if (meResponse && meResponse.success) {
          setUser(meResponse.data);
          return meResponse.data;
        }
      }
      throw new Error('Authentication failed');
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register action
  const register = async (email, password, fullName) => {
    setLoading(true);
    try {
      const response = await authApi.register(email, password, fullName);
      if (response && response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout action
  const logout = () => {
    localStorage.removeItem('atr_token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
