import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user data from AsyncStorage on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@user');
        const storedToken = await AsyncStorage.getItem('access_token');
        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          const normalizedUser = {
            ...parsedUser,
            user_id: parsedUser.user_id || parsedUser.id,
            customer_id: parsedUser.customer_id || parsedUser.user_id || parsedUser.id,
            email: parsedUser.email,
          };
          if (!normalizedUser.customer_id) {
            console.warn('No customer_id found in stored user data:', normalizedUser);
            setError('Invalid user data: Missing customer_id');
            await logout();
            return;
          }
          if (normalizedUser.email) {
            await AsyncStorage.setItem('customerEmail', normalizedUser.email);
          }
          setUser(normalizedUser);
          console.log('Loaded user from storage:', normalizedUser);
        } else {
          console.log('No stored user or token found');
        }
      } catch (error) {
        console.error('Failed to load user data from AsyncStorage:', error.message);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, []);

  // Login function
  const login = async (userData) => {
    if (!userData.accessToken || !userData.refreshToken) {
      console.error('Login failed: Missing accessToken or refreshToken', userData);
      setError('Invalid login data');
      throw new Error('Invalid login data');
    }
    const normalizedUserData = {
      ...userData,
      user_id: userData.user_id || userData.id || userData.customer_id,
      customer_id: userData.customer_id || userData.user_id || userData.id,
      email: userData.email,
    };
    if (!normalizedUserData.customer_id) {
      console.error('Login failed: No customer_id, user_id, or id provided', userData);
      setError('Customer ID is required');
      throw new Error('Customer ID is required. Please contact support.');
    }
    try {
      setUser(normalizedUserData);
      await AsyncStorage.setItem('@user', JSON.stringify(normalizedUserData));
      await AsyncStorage.setItem('access_token', normalizedUserData.accessToken);
      if (normalizedUserData.email) {
        await AsyncStorage.setItem('customerEmail', normalizedUserData.email);
      }
      console.log('User data and access_token stored successfully');
      setError(null);
    } catch (error) {
      console.error('Failed to store user data in AsyncStorage:', error.message);
      setError('Failed to save login data');
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    console.log('Logging out user');
    setUser(null);
    setError(null);
    try {
      await AsyncStorage.multiRemove(['@user', 'access_token', '@wallet', 'customerEmail']);
      console.log('User, access_token, wallet, and customerEmail data cleared from AsyncStorage');
    } catch (error) {
      console.error('Failed to remove user data from AsyncStorage:', error.message);
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@user');
      if (!storedUser) {
        console.error('No stored user data found for token refresh');
        setError('No user data available for token refresh');
        return null;
      }
      const parsedUser = JSON.parse(storedUser);
      const { refreshToken } = parsedUser;
      if (!refreshToken) {
        console.error('No refresh token available');
        setError('No refresh token available');
        await logout();
        return null;
      }
      console.log('Attempting to refresh token');
      const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }
      const { access } = await response.json();
      const updatedUser = {
        ...parsedUser,
        accessToken: access,
        user_id: parsedUser.user_id || parsedUser.id,
        customer_id: parsedUser.customer_id || parsedUser.user_id || parsedUser.id,
        email: parsedUser.email,
      };
      setUser(updatedUser);
      await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
      await AsyncStorage.setItem('access_token', access);
      if (updatedUser.email) {
        await AsyncStorage.setItem('customerEmail', updatedUser.email);
      }
      console.log('Token refreshed and user data updated:', access);
      setError(null);
      return access;
    } catch (error) {
      console.error('Token refresh error:', error.message);
      setError('Token refresh failed');
      await logout();
      return null;
    }
  };

  // Update wallet PIN function
  const updateWalletPin = async (pin) => {
    if (!user) {
      console.error('Cannot update wallet PIN: No user logged in');
      setError('No user logged in');
      return;
    }
    const updatedUser = { ...user, walletPin: pin };
    setUser(updatedUser);
    try {
      await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
      await AsyncStorage.setItem('@wallet', JSON.stringify({ walletPin: pin }));
      console.log('Wallet PIN updated successfully');
      setError(null);
    } catch (error) {
      console.error('Failed to update wallet PIN in AsyncStorage:', error.message);
      setError('Failed to update wallet PIN');
    }
  };

  const isLoggedIn = !!user;
  const accessToken = user?.accessToken || null;
  const customerId = user?.customer_id || null;

  useEffect(() => {
    console.log('Current accessToken:', accessToken);
    console.log('Current customerId:', customerId);
  }, [accessToken, customerId]);

  const value = {
    user,
    isLoggedIn,
    accessToken,
    customerId,
    refreshToken,
    login,
    logout,
    updateWalletPin,
    error,
  };

  return isLoading ? (
    <div>Loading...</div> // Placeholder while loading
  ) : (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;