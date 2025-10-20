/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

// Create Auth Context
const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check if user is authenticated
  const checkAuthStatus = async () => {
    try {
      const response = await authAPI.checkAuth();
      
      if (response.data.isLoggedIn) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Sync with localStorage for compatibility
        localStorage.setItem('isLoggedIn', 'true');
        if (response.data.user) {
          localStorage.setItem('userName', response.data.user.name);
          localStorage.setItem('userEmail', response.data.user.email);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        
        // Clear localStorage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear localStorage on error
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Sync with localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', response.data.user.name);
        localStorage.setItem('userEmail', response.data.user.email);
        
        return { success: true, user: response.data.user };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  // Signup function
  const signup = async (name, email, password) => {
    try {
      const response = await authAPI.signup({ name, email, password });
      
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Sync with localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', response.data.user.name);
        localStorage.setItem('userEmail', response.data.user.email);
        
        return { success: true, user: response.data.user };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed';
      return { success: false, message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state regardless of API success
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear localStorage
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      
      // Redirect to home
      window.location.href = '/';
    }
  };

  // Get current user (force refresh from server)
  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response.data.user;
      }
      
      return null;
    } catch (error) {
      console.error('Refresh user error:', error);
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    refreshUser,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;