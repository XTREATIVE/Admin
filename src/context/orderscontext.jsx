// src/context/orderscontext.jsx
import React, { createContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

export const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const { isAuthenticated, authenticatedFetch, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toAddressMap, setToAddressMap] = useState({});
  const [hasInitialized, setHasInitialized] = useState(false);

  const fetchOrders = useCallback(async (showLoading = true) => {
    // Don't fetch if not authenticated
    if (!isAuthenticated || authLoading) {
      setOrders([]);
      setToAddressMap({});
      setError(null);
      setLoading(false);
      setHasInitialized(true);
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      const response = await authenticatedFetch("https://api-xtreative.onrender.com/orders/list/");
      
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);

      // Map item IDs to to_address
      const addressMap = {};
      if (Array.isArray(data)) {
        data.forEach((order) => {
          if (order && Array.isArray(order.items)) {
            order.items.forEach((item) => {
              if (item && item.id != null) {
                addressMap[item.id] = order.to_address || "";
              }
            });
          }
        });
      }
      setToAddressMap(addressMap);
      
    } catch (err) {
      console.error("Orders fetch error:", err);
      setError(err.message || "Failed to load orders");
      setOrders([]);
      setToAddressMap({});
    } finally {
      setLoading(false);
      setHasInitialized(true);
    }
  }, [isAuthenticated, authLoading, authenticatedFetch]);

  useEffect(() => {
    // Initialize when auth state is ready
    if (!authLoading) {
      if (isAuthenticated) {
        fetchOrders(true);
      } else {
        // Not authenticated, set initialized state
        setOrders([]);
        setToAddressMap({});
        setError(null);
        setLoading(false);
        setHasInitialized(true);
      }
    }

    // Listen for auth changes
    const handleAuthChange = (event) => {
      if (event.detail?.type === "login") {
        fetchOrders(true);
      } else if (event.detail?.type === "logout") {
        setOrders([]);
        setToAddressMap({});
        setError(null);
        setLoading(false);
        setHasInitialized(true);
      }
    };

    window.addEventListener("authChanged", handleAuthChange);

    // Polling interval for data refresh (only when authenticated)
    const interval = setInterval(() => {
      if (isAuthenticated && hasInitialized && !authLoading) {
        fetchOrders(false); // Silent refresh
      }
    }, 60000); // Poll every 60 seconds

    return () => {
      clearInterval(interval);
      window.removeEventListener("authChanged", handleAuthChange);
    };
  }, [isAuthenticated, authLoading, fetchOrders, hasInitialized]);

  const contextValue = {
    orders,
    loading,
    error,
    toAddressMap,
    refreshOrders: () => fetchOrders(true),
    hasInitialized
  };

  return (
    <OrdersContext.Provider value={contextValue}>
      {children}
    </OrdersContext.Provider>
  );
};