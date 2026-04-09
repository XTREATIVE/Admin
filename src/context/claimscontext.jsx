import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { OrdersContext } from "./orderscontext";
import { authFetch } from "../api";   // Adjust import path as needed

export const ClaimsContext = createContext();

export const ClaimsProvider = ({ children }) => {
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const ordersContext = useContext(OrdersContext);

  const fetchClaims = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { orders, loading: ordersLoading, error: ordersError, toAddressMap } = ordersContext || {};

      if (ordersError) throw new Error(`Orders error: ${ordersError}`);
      if (ordersLoading) return;

      // Build maps
      const itemMap = {}, subtotalMap = {}, quantityMap = {}, productIdMap = {};
      orders?.forEach((order) => {
        order.items?.forEach((item) => {
          itemMap[item.id] = item.product_name;
          subtotalMap[item.id] = item.subtotal;
          quantityMap[item.id] = item.quantity;
          productIdMap[item.id] = item.product;
        });
      });

      const [productsData, customersData, claimsData] = await Promise.all([
        authFetch("/products/listing/").catch(() => []),
        authFetch("/customers/list/").catch(() => []),
        authFetch("/returns/list/").catch((err) => { throw err; }),
      ]);

      const imageMap = productsData.reduce((map, p) => { map[p.id] = p.product_image_url; return map; }, {});
      const customerMap = customersData.reduce((map, c) => { 
        map[c.id] = c.username || `Customer ${c.id}`; 
        return map; 
      }, {});

      const transformedClaims = claimsData.map((item) => ({
        id: item.id,
        name: customerMap[item.customer] || `Customer ${item.customer}`,
        order_item: item.order_item,
        product_name: itemMap[item.order_item] || `Item ${item.order_item}`,
        reason: item.reason || "No reason provided",
        time: new Date(item.created_at).toLocaleString(),
        created_at: item.created_at,
        status: item.status || "requested",
        type: (item.status || "").toLowerCase() === "approved" ? "refund" : "claim",
        giftPrice: subtotalMap[item.order_item] || "N/A",
        quantity: quantityMap[item.order_item] || 1,
        image: imageMap[productIdMap[item.order_item]] || null,
        deliveryAddress: toAddressMap?.[item.order_item]?.trim() || "Pioneer Mall, Burton Street, Kampala, Uganda",
      }));

      setClaims(transformedClaims);
    } catch (err) {
      console.error("Fetch claims error:", err);
      setError(err.message || "Failed to load claims");
    } finally {
      setIsLoading(false);
    }
  }, [ordersContext]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  // Improved approve with better error detail
  const approveClaim = async (returnId) => {
    try {
      setError(null);

      // Try without body first (most common for simple status actions)
      await authFetch(`/returns/approve/${returnId}/`, { 
        method: "PATCH" 
      });

      setClaims((prev) =>
        prev.map((c) => c.id === returnId ? { ...c, status: "approved", type: "refund" } : c)
      );
    } catch (err) {
      console.error("Approve failed:", err);
      let msg = err.message || "Failed to approve claim";

      // Extract detailed validation error from DRF 400
      if (err.message.includes("400") && err.response?.data) {
        const data = err.response.data;
        msg = data.detail || 
              (typeof data === "object" ? Object.entries(data).map(([k,v]) => `${k}: ${v}`).join(", ") : msg);
      } else if (err.message.includes("400")) {
        msg = "Bad Request: Check if the claim can still be approved (maybe already processed).";
      }

      setError(msg);
      throw err;
    }
  };

  const rejectClaim = async (returnId) => {
    try {
      setError(null);

      await authFetch(`/returns/api/returns/${returnId}/reject/`, { 
        method: "PATCH" 
      });

      setClaims((prev) =>
        prev.map((c) => c.id === returnId ? { ...c, status: "rejected", type: "claim" } : c)
      );
    } catch (err) {
      console.error("Reject failed:", err);
      let msg = err.message || "Failed to reject claim";

      if (err.message.includes("400") && err.response?.data) {
        const data = err.response.data;
        msg = data.detail || 
              (typeof data === "object" ? Object.entries(data).map(([k,v]) => `${k}: ${v}`).join(", ") : msg);
      } else if (err.message.includes("400")) {
        msg = "Bad Request: The server rejected the reject action.";
      }

      setError(msg);
      throw err;
    }
  };

  return (
    <ClaimsContext.Provider
      value={{
        claims,
        isLoading,
        error,
        approveClaim,
        rejectClaim,
        retryFetch: fetchClaims,
      }}
    >
      {children}
    </ClaimsContext.Provider>
  );
};