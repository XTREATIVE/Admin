// src/context/claimscontext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { OrdersContext } from "./orderscontext";

export const ClaimsContext = createContext();

export const ClaimsProvider = ({ children }) => {
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const ordersContext = useContext(OrdersContext);

  const fetchClaimsData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      const token = localStorage.getItem("authToken");
      if (!token) {
        // No token -> reset state, no error
        setClaims([]);
        setError(null);
        setIsLoading(false);
        setHasInitialized(true);
        return;
      }

      if (!ordersContext) {
        setError("Orders data not available");
        setIsLoading(false);
        return;
      }

      const { orders, loading: ordersLoading, error: ordersError, toAddressMap, hasInitialized: ordersInitialized } = ordersContext;

      // Wait for orders to be initialized
      if (!ordersInitialized) {
        setIsLoading(true);
        return;
      }

      if (ordersError) {
        setError(`Orders error: ${ordersError}`);
        setIsLoading(false);
        return;
      }

      if (ordersLoading && !orders?.length) {
        // Still loading orders and no cached data
        setIsLoading(true);
        return;
      }

      // Build maps from orders (handle empty orders gracefully)
      const itemMap = {};
      const subtotalMap = {};
      const quantityMap = {};
      const productIdMap = {};

      if (Array.isArray(orders)) {
        orders.forEach((order) => {
          if (order && Array.isArray(order.items)) {
            order.items.forEach((item) => {
              if (!item || item.id == null) return;
              itemMap[item.id] = item.product_name || `Item ${item.id}`;
              subtotalMap[item.id] = item.subtotal || 0;
              quantityMap[item.id] = item.quantity || 1;
              productIdMap[item.id] = item.product;
            });
          }
        });
      }

      // Parallel fetch requests
      const [productsRes, customersRes, claimsRes] = await Promise.all([
        fetch("https://api-xtreative.onrender.com/products/listing/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("https://api-xtreative.onrender.com/customers/list/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("https://api-xtreative.onrender.com/returns/list/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
      ]);

      // Check for auth errors
      if (productsRes.status === 401 || customersRes.status === 401 || claimsRes.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        window.dispatchEvent(new CustomEvent("authChanged", { 
          detail: { type: "logout" } 
        }));
        setClaims([]);
        setError("Session expired. Please log in again.");
        setIsLoading(false);
        return;
      }

      if (!productsRes.ok) throw new Error(`Failed to fetch products: ${productsRes.status}`);
      if (!customersRes.ok) throw new Error(`Failed to fetch customers: ${customersRes.status}`);
      if (!claimsRes.ok) throw new Error(`Failed to fetch claims: ${claimsRes.status}`);

      const [productsData, customersData, claimsData] = await Promise.all([
        productsRes.json(),
        customersRes.json(),
        claimsRes.json()
      ]);

      // Build maps
      const imageMap = {};
      if (Array.isArray(productsData)) {
        productsData.forEach((p) => {
          if (p && p.id) {
            imageMap[p.id] = p.product_image_url || null;
          }
        });
      }

      const customerMap = {};
      if (Array.isArray(customersData)) {
        customersData.forEach((c) => {
          if (c && c.id) {
            customerMap[c.id] = c.username || `Customer ${c.id}`;
          }
        });
      }

      // Transform claims
      const transformedClaims = Array.isArray(claimsData) ? claimsData.map((item) => {
        if (!item) return null;

        const deliveryAddress =
          toAddressMap?.[item.order_item] && toAddressMap[item.order_item].trim() !== ""
            ? toAddressMap[item.order_item]
            : "Pioneer Mall, Burton Street, Kampala, Uganda";

        return {
          name: customerMap[item.customer] || `Customer ${item.customer}`,
          order_item: item.order_item,
          product_name: itemMap[item.order_item] || `Item ${item.order_item}`,
          reason: item.reason || "No reason provided",
          time: item.created_at ? new Date(item.created_at).toLocaleString() : "Unknown time",
          created_at: item.created_at,
          status: item.status || "pending",
          type: (item.status || "").toLowerCase() === "approved" ? "refund" : "claim",
          giftPrice: subtotalMap[item.order_item] || "N/A",
          quantity: quantityMap[item.order_item] || 1,
          image: imageMap[productIdMap[item.order_item]] || null,
          deliveryAddress,
        };
      }).filter(Boolean) : []; // Filter out null items

      setClaims(transformedClaims);
    } catch (err) {
      console.error("Claims fetch error:", err);
      setError(err.message || "Failed to load claims");
    } finally {
      setIsLoading(false);
      setHasInitialized(true);
    }
  }, [ordersContext]);

  useEffect(() => {
    const handleAuthChange = (event) => {
      if (event.detail?.type === "login") {
        // User just logged in, wait a bit for orders to load first
        setTimeout(() => {
          fetchClaimsData(true);
        }, 500);
      } else if (event.detail?.type === "logout") {
        // User logged out, reset state
        setClaims([]);
        setError(null);
        setIsLoading(false);
        setHasInitialized(true);
      }
    };

    window.addEventListener("authChanged", handleAuthChange);

    return () => {
      window.removeEventListener("authChanged", handleAuthChange);
    };
  }, [fetchClaimsData]);

  // Fetch claims when orders context changes
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token && ordersContext?.hasInitialized) {
      fetchClaimsData(!hasInitialized);
    } else if (!token) {
      setIsLoading(false);
      setHasInitialized(true);
    }
  }, [ordersContext, fetchClaimsData, hasInitialized]);

  const contextValue = {
    claims,
    isLoading,
    error,
    refreshClaims: () => fetchClaimsData(true),
    hasInitialized
  };

  return (
    <ClaimsContext.Provider value={contextValue}>
      {children}
    </ClaimsContext.Provider>
  );
};