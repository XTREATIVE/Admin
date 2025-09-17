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
      if (!token) throw new Error("No auth token found. Please log in.");

      const res = await fetch("https://api-xtreative.onrender.com/orders/list/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Server responded ${res.status}`);

      const data = await res.json();
      setOrders(data);

      // Map order_item.id → to_address
      const addressMap = {};
      data.forEach(order => {
        (order.items || []).forEach(item => {
          if (item && item.id != null) addressMap[item.id] = order.to_address;
        });
      });
      setToAddressMap(addressMap);

    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, []);

  return (
    <OrdersContext.Provider
      value={{ orders, loading, error, toAddressMap, refreshOrders: fetchOrders }}
    >
      {children}
    </OrdersContext.Provider>
  );
};