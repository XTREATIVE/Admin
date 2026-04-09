import React, { useState, useMemo, useContext } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaCar, FaCheckCircle } from "react-icons/fa";
import { UserContext } from "../context/usercontext";
import { OrdersContext } from "../context/orderscontext";

const BASE_URL = "https://xtreativeapi.onrender.com";
const OFFSET = 1000;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
});

// API Calls
const apiMarkSent = (id) =>
  fetch(`${BASE_URL}/orders/${id}/mark-sent/`, {
    method: "POST",
    headers: authHeaders()
  });

const apiConfirmWarehouse = (id) =>
  fetch(`${BASE_URL}/orders/${id}/confirm-warehouse/`, {
    method: "POST",
    headers: authHeaders()
  });

const apiMarkDelivered = (id) =>
  fetch(`${BASE_URL}/orders/${id}/status/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status: "delivered" }),
  });

// Advance Configuration
// FIX: "processing" now maps to Mark Delivered — backend returns "Processing"
// after confirm-warehouse, so the next logical step is Delivered, not Mark Sent
const ADVANCE = {
  "pending":             { label: "Mark Sent",          color: "bg-yellow-600 hover:bg-yellow-700", apiFn: apiMarkSent },
  "processing":          { label: "Mark Delivered",      color: "bg-teal-600 hover:bg-teal-700",    apiFn: apiMarkDelivered },
  "packaging":           { label: "Mark Sent",           color: "bg-amber-600 hover:bg-amber-700",  apiFn: apiMarkSent },
  "sent to warehouse":   { label: "Confirm Warehouse",   color: "bg-blue-600 hover:bg-blue-700",    apiFn: apiConfirmWarehouse },
  "warehouse confirmed": { label: "Mark Delivered",      color: "bg-teal-600 hover:bg-teal-700",    apiFn: apiMarkDelivered },
  "confirmed warehouse": { label: "Mark Delivered",      color: "bg-teal-600 hover:bg-teal-700",    apiFn: apiMarkDelivered },
};

const getDuration = (isoDateString) => {
  const diffMs = Date.now() - new Date(isoDateString).getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
  const hours = Math.floor(diffMs / 3600000);
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
  return "Just now";
};

const getOrderStatusClasses = (status) => {
  const s = status.toLowerCase();
  switch (s) {
    case "pending":            return "bg-yellow-100 text-yellow-800";
    case "processing":         return "bg-green-100 text-green-800"; // FIX: matches confirmed-warehouse visual
    case "packaging":          return "bg-amber-100 text-amber-800";
    case "sent to warehouse":  return "bg-gray-100 text-yellow-700";
    case "warehouse confirmed":
    case "confirmed warehouse":return "bg-blue-100 text-blue-800";
    case "delivered":
    case "completed":          return "bg-teal-100 text-teal-800";
    case "canceled":
    case "cancelled":          return "bg-red-100 text-red-800";
    default:                   return "bg-gray-100 text-gray-800";
  }
};

const capitalize = (str) =>
  str.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

const OrderTable = () => {
  const { orders, loading, error, refreshOrders } = useContext(OrdersContext);
  const { getUsernameById } = useContext(UserContext);

  const [currentPage, setCurrentPage] = useState(1);
  const [busy, setBusy] = useState({});
  const pageSize = 15;

  const totalPages = Math.ceil(orders.length / pageSize);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return orders.slice(start, start + pageSize);
  }, [orders, currentPage]);

  const handleAdvance = async (orderId, rawStatus) => {
    const config = ADVANCE[rawStatus];
    if (!config) return;

    setBusy(prev => ({ ...prev, [orderId]: true }));

    try {
      const res = await config.apiFn(orderId);
      if (res.ok) {
        refreshOrders?.();
      } else {
        const body = await res.json().catch(() => ({}));
        alert(`Failed to update order #${orderId + OFFSET}. ${body?.detail || "Please try again."}`);
      }
    } catch (e) {
      alert("Network error. Please check your connection.");
    } finally {
      setBusy(prev => ({ ...prev, [orderId]: false }));
    }
  };

  if (loading)
    return <div className="text-center p-4 text-gray-600 text-[11px]">Loading orders…</div>;
  if (error)
    return <div className="text-center p-4 text-red-600 text-[11px]">Error: {error}</div>;

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-50 text-gray-700 text-[11px]">
            <tr>
              {["Order ID", "Date Created", "Customer", "Duration", "Total", "Items", "Order Status", "Action"].map((h, i) => (
                <th key={h} className={`px-4 py-2 text-left font-medium ${i < 7 ? "border-r border-gray-200" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((order) => {
              const rawStatus = order.status.toLowerCase();
              const config = ADVANCE[rawStatus];
              const isDelivered = ["delivered", "completed"].includes(rawStatus);
              const isCancelled = ["canceled", "cancelled"].includes(rawStatus);

              return (
                <tr key={order.id} className="border-t hover:bg-gray-50 text-[10px] text-gray-700">
                  <td className="px-4 py-2 border-r border-gray-200 font-medium">ORD{order.id + OFFSET}</td>
                  <td className="px-4 py-2 border-r border-gray-200">
                    {new Date(order.created_at).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200">{getUsernameById(order.customer)}</td>
                  <td className="px-4 py-2 border-r border-gray-200">{getDuration(order.created_at)}</td>
                  <td className="px-4 py-2 border-r border-gray-200">
                    UGX {Number(order.total_price || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200">{order.items?.length || 0}</td>
                  <td className="px-4 py-2 border-r border-gray-200">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-medium ${getOrderStatusClasses(order.status)}`}>
                      {rawStatus === "sent to warehouse" ? (
                        <><FaCar className="mr-1" />Sent to WH</>
                      ) : (
                        capitalize(order.status)
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex items-center gap-3">
                    <Link
                      to={`/order/${order.id + OFFSET}`}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <FaEye size={16} />
                    </Link>

                    {config && !isCancelled && !isDelivered && (
                      <button
                        onClick={() => handleAdvance(order.id, rawStatus)}
                        disabled={busy[order.id]}
                        className={`flex items-center gap-1 px-3 py-1 text-white text-[9px] rounded font-medium disabled:opacity-60 transition-all ${config.color}`}
                      >
                        <FaCheckCircle />
                        {busy[order.id] ? "Updating…" : config.label}
                      </button>
                    )}

                    {isDelivered && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-700 rounded text-[9px] font-medium">
                        <FaCheckCircle /> Delivered
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-center space-x-6 text-[11px]">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 disabled:opacity-50 hover:bg-gray-100 rounded"
        >
          Previous
        </button>
        <span className="font-medium">Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 disabled:opacity-50 hover:bg-gray-100 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OrderTable;