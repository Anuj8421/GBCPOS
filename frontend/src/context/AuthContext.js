import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMethod, setAuthMethod] = useState(null); // 'jwt' or 'google'

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('auth_token');
    const method = localStorage.getItem('auth_method');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setAuthMethod(method);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_method', 'jwt');
      localStorage.setItem('user_data', JSON.stringify(response.user));
      setUser(response.user);
      setAuthMethod('jwt');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async (googleData) => {
    try {
      const response = await authService.googleLogin(googleData);
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_method', 'google');
      localStorage.setItem('user_data', JSON.stringify(response.user));
      setUser(response.user);
      setAuthMethod('google');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_method', 'jwt');
      localStorage.setItem('user_data', JSON.stringify(response.user));
      setUser(response.user);
      setAuthMethod('jwt');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_method');
    localStorage.removeItem('user_data');
    setUser(null);
    setAuthMethod(null);
  };

  const value = {
    user,
    authMethod,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};