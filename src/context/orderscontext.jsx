import React, { createContext, useState, useEffect } from "react";
import { authFetch } from "../api.js";

export const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toAddressMap, setToAddressMap] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await authFetch("/orders/list/");
        setOrders(data);

        // Create a map of item ID to to_address
        const addressMap = data.reduce((map, order) => {
          order.items.forEach((item) => {
            map[item.id] = order.to_address;
          });
          return map;
        }, {});
        setToAddressMap(addressMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <OrdersContext.Provider value={{ orders, loading, error, toAddressMap }}>
      {children}
    </OrdersContext.Provider>
  );
};