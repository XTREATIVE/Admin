// src/context/orderscontext.jsx
import React, { createContext, useState, useEffect, useCallback } from "react";

export const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toAddressMap, setToAddressMap] = useState({});
  const [hasInitialized, setHasInitialized] = useState(false);

  const fetchOrders = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      
      const token = localStorage.getItem("authToken");

      // If no token, reset state and don't show error
      if (!token) {
        setOrders([]);
        setToAddressMap({});
        setError(null);
        setLoading(false);
        return;
      }

      const res = await fetch("https://api-xtreative.onrender.com/orders/list/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          // Clear invalid tokens
          localStorage.removeItem("authToken");
          localStorage.removeItem("refreshToken");
          
          // Dispatch logout event
          window.dispatchEvent(new CustomEvent("authChanged", { 
            detail: { type: "logout" } 
          }));
          
          setOrders([]);
          setToAddressMap({});
          setError("Session expired. Please log in again.");
          setLoading(false);
          return;
        }
        throw new Error(`Failed to fetch orders: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
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
    } finally {
      setLoading(false);
      setHasInitialized(true);
    }
  }, []);

  useEffect(() => {
    const handleAuthChange = (event) => {
      if (event.detail?.type === "login") {
        // User just logged in, fetch orders
        fetchOrders(true);
      } else if (event.detail?.type === "logout") {
        // User logged out, reset state
        setOrders([]);
        setToAddressMap({});
        setError(null);
        setLoading(false);
        setHasInitialized(true);
      }
    };

    const handleStorageChange = () => {
      const token = localStorage.getItem("authToken");
      if (token && !hasInitialized) {
        // Token exists and we haven't initialized yet
        fetchOrders(true);
      } else if (!token && hasInitialized) {
        // Token removed, reset state
        setOrders([]);
        setToAddressMap({});
        setError(null);
        setLoading(false);
      }
    };

    // Initial load check
    const token = localStorage.getItem("authToken");
    if (token) {
      fetchOrders(true);
    } else {
      setLoading(false);
      setHasInitialized(true);
    }

    // Set up event listeners
    window.addEventListener("authChanged", handleAuthChange);
    window.addEventListener("storage", handleStorageChange);

    // Polling interval for data refresh (only when authenticated)
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("authToken");
      if (currentToken && hasInitialized) {
        fetchOrders(false); // Silent refresh
      }
    }, 60000); // Poll every 60 seconds

    return () => {
      clearInterval(interval);
      window.removeEventListener("authChanged", handleAuthChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [fetchOrders, hasInitialized]);

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