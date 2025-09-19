import React, { createContext, useState, useEffect } from "react";

export const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toAddressMap, setToAddressMap] = useState({});

  const fetchOrders = async () => { <div className=""></div>
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");

      // If no token yet, don't treat as an error — wait for login.
      if (!token) {
        setOrders([]);
        setToAddressMap({});
        setLoading(false);
        return;
      }

      const res = await fetch("https://api-xtreative.onrender.com/orders/list/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle auth failure explicitly
      if (!res.ok) {
        if (res.status === 401) {
          // Clear invalid tokens and surface friendly message
          localStorage.removeItem("authToken");
          localStorage.removeItem("refreshToken");
          setOrders([]);
          setToAddressMap({});
          setError("Authentication failed. Please log in.");
          setLoading(false);
          return;
        }
        throw new Error(`Server responded ${res.status}`);
      }

      const data = await res.json();
      setOrders(data);

      // Map item IDs to to_address
      const addressMap = data.reduce((map, order) => {
        (order.items || []).forEach((item) => {
          if (item && item.id != null) map[item.id] = order.to_address;
        });
        return map;
      }, {});
      setToAddressMap(addressMap);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  // Fetch only when authToken exists
  useEffect(() => {
    const handleTokenChange = () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        fetchOrders();
      } else {
        // No token -> not loading (prevents infinite loading in consumers)
        setLoading(false);
        setOrders([]); // optional: ensure consumers see empty list
        setToAddressMap({});
        setError(null);
      }
    };

    handleTokenChange(); // call on mount in case token exists
    window.addEventListener("storage", handleTokenChange); // detect token changes from other tabs
    window.addEventListener("authChanged", handleTokenChange); // detect same-tab login events

    const interval = setInterval(() => {
      if (localStorage.getItem("authToken")) fetchOrders();
    }, 60000); // polling every 60s

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleTokenChange);
      window.removeEventListener("authChanged", handleTokenChange);
    };
  }, []);

  return (
    <OrdersContext.Provider
      value={{ orders, loading, error, toAddressMap, refreshOrders: fetchOrders }}
    >
      {children}
    </OrdersContext.Provider>
  );
};