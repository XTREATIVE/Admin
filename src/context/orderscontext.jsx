import React, { createContext, useState, useEffect } from "react";

export const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toAddressMap, setToAddressMap] = useState({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");
      if (!token) {
        // no token -> don't throw; stop loading so consumers don't stay stuck
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
          // optional: clear tokens on unauthorized
          localStorage.removeItem("authToken");
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

    const interval = setInterval(() => {
      if (localStorage.getItem("authToken")) fetchOrders();
    }, 60000); // polling every 60s

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleTokenChange);
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
