// src/utils/authUtils.js
const API_BASE_URL = "https://api-xtreative.onrender.com";

/**
 * Checks if the current token is valid and refreshes it if necessary
 * @returns {Promise<string|null>} Returns valid token or null if auth failed
 */
export const ensureValidToken = async () => {
  const token = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!token) {
    return null;
  }

  // Check if token is expired by trying a simple API call
  try {
    const testResponse = await fetch(`${API_BASE_URL}/accounts/admin/profile/`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (testResponse.ok) {
      return token; // Token is still valid
    }

    if (testResponse.status === 401 && refreshToken) {
      // Token expired, try to refresh
      return await refreshAuthToken();
    }

    // Token invalid and no refresh available
    clearAuthTokens();
    return null;
  } catch (error) {
    console.error("Token validation error:", error);
    return token; // Assume token is valid if network error
  }
};

/**
 * Refreshes the authentication token using the refresh token
 * @returns {Promise<string|null>} Returns new token or null if refresh failed
 */
export const refreshAuthToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  
  if (!refreshToken) {
    clearAuthTokens();
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/accounts/admin/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        refresh: refreshToken
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.access) {
        localStorage.setItem("authToken", data.access);
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent("authChanged", { 
          detail: { type: "tokenRefreshed", token: data.access } 
        }));
        
        return data.access;
      }
    }

    // Refresh failed
    clearAuthTokens();
    window.dispatchEvent(new CustomEvent("authChanged", { 
      detail: { type: "logout" } 
    }));
    return null;
  } catch (error) {
    console.error("Token refresh error:", error);
    clearAuthTokens();
    return null;
  }
};

/**
 * Clears all authentication tokens from localStorage
 */
export const clearAuthTokens = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
};

/**
 * Makes an authenticated API request with automatic token refresh
 * @param {string} url - The API endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export const authenticatedFetch = async (url, options = {}) => {
  const token = await ensureValidToken();
  
  if (!token) {
    // No valid token available, redirect to login
    window.dispatchEvent(new CustomEvent("authChanged", { 
      detail: { type: "logout" } 
    }));
    throw new Error("No valid authentication token");
  }

  const authOptions = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers
    }
  };

  const response = await fetch(url, authOptions);

  // If still unauthorized after token refresh attempt, logout user
  if (response.status === 401) {
    clearAuthTokens();
    window.dispatchEvent(new CustomEvent("authChanged", { 
      detail: { type: "logout" } 
    }));
    throw new Error("Authentication failed");
  }

  return response;
};

/**
 * Checks if user is currently authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem("authToken");
};

/**
 * Gets the current authentication token
 * @returns {string|null} Current token or null
 */
export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};