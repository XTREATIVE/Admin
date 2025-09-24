// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    initializeAuth();

    // Listen for storage changes (other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'authToken') {
        if (e.newValue) {
          setToken(e.newValue);
          setIsAuthenticated(true);
        } else {
          setToken(null);
          setIsAuthenticated(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (accessToken, refreshToken) => {
    localStorage.setItem('authToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    setToken(accessToken);
    setIsAuthenticated(true);
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('authChanged', { 
      detail: { type: 'login', token: accessToken } 
    }));
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setIsAuthenticated(false);
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('authChanged', { 
      detail: { type: 'logout' } 
    }));
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        logout();
        return false;
      }

      const response = await fetch('https://api-xtreative.onrender.com/accounts/admin/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access) {
          localStorage.setItem('authToken', data.access);
          setToken(data.access);
          setIsAuthenticated(true);
          return true;
        }
      }

      logout();
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  const authenticatedFetch = async (url, options = {}) => {
    if (!token) {
      throw new Error('No authentication token');
    }

    const authOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, authOptions);

      if (response.status === 401) {
        // Try to refresh token
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          // Retry with new token
          authOptions.headers.Authorization = `Bearer ${localStorage.getItem('authToken')}`;
          return await fetch(url, authOptions);
        } else {
          logout();
          throw new Error('Authentication failed');
        }
      }

      return response;
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    token,
    login,
    logout,
    refreshToken,
    authenticatedFetch,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};