import React, { useState, useMemo, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaCar } from "react-icons/fa";
import { UserContext } from "../context/usercontext";
import { OrdersContext } from "../context/orderscontext";

// Map statuses to bg/text colors using yellow ↔ orange ↔ green blends
const getOrderStatusClasses = (status) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "processing":
      return "bg-orange-100 text-orange-800";
    case "packaging":
      return "bg-amber-100 text-amber-800";
    case "shipped":
      return "bg-green-100 text-green-800";
    case "sent to warehouse":
      return "bg-gray-100 text-yellow-700";
    case "completed":
      return "bg-emerald-100 text-emerald-800";
    case "delivered":
      return "bg-teal-100 text-teal-800";
    case "canceled":
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Capitalize the first letter of each word
const capitalize = (str) =>
  str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

// Compute time since creation (using fixed current date: September 22, 2025)
const getDuration = (isoDateString) => {
  const then = new Date(isoDateString).getTime();
  const now = new Date("2025-09-22").getTime(); // Fixed current date
  const diffMs = now - then;

  const msPerDay = 1000 * 60 * 60 * 24;
  const msPerHour = 1000 * 60 * 60;

  const days = Math.floor(diffMs / msPerDay);
  if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
  const hours = Math.floor(diffMs / msPerHour);
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
  return "Just now";
};

// Base API endpoint pattern
const API_STATUS_ENDPOINT = "https://api-xtreative.onrender.com/orders/{order_id}/status/";

const OrderTable = () => {
  const { orders, loading, error, refreshOrders } = useContext(OrdersContext);
  const { getUsernameById, loading: loadingUsers, error: userError } = useContext(UserContext);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;
  const totalPages = Math.ceil(orders.length / pageSize);
  const OFFSET = 1000;

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return orders.slice(start, start + pageSize);
  }, [orders, currentPage]);

  // Synchronize status with API
  useEffect(() => {
    const syncStatuses = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      for (const order of orders) {
        const origId = order.id;
        const currentStepStatus = ["paid", "confirmed", "processing", "delivering", "delivered"][
          Math.min(order.currentStep || 0, 4)
        ];

        if (order.status.toLowerCase() !== currentStepStatus) {
          const endpoint = API_STATUS_ENDPOINT.replace("{order_id}", origId);
          try {
            const res = await fetch(endpoint, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ status: currentStepStatus }),
            });
            if (res.ok) {
              refreshOrders?.();
            } else {
              console.error("Failed to update status for order", origId);
            }
          } catch (e) {
            console.error("Network error", e);
          }
        }
      }
    };
    syncStatuses();
  }, [orders, refreshOrders]);

  if (loading || loadingUsers)
    return (
      <div className="text-center p-4 text-gray-600 text-[11px]">
        Loading orders…
      </div>
    );
  if (error)
    return (
      <div className="text-center p-4 text-red-600 text-[11px]">
        Error: {error}
      </div>
    );
  if (userError)
    return (
      <div className="text-center p-4 text-red-600 text-[11px]">
        Error: {userError}
      </div>
    );

  const headers = [
    "Order ID",
    "Date Created",
    "Customer",
    "Duration",
    "Total",
    "Items",
    "Order Status",
    "Action",
  ];

  const renderRows = () =>
    paginated.map((order) => {
      const cleanId = `ORD${order.id + OFFSET}`;
      const date = new Date(order.created_at).toLocaleDateString("en-GB");
      const duration = getDuration(order.created_at);
      const total = `UGX ${Number(order.total_price).toLocaleString()}`;
      const username = getUsernameById(order.customer);
      const rawStatus = order.status.toLowerCase();
      const statusClasses = getOrderStatusClasses(order.status);

      const statusContent =
        rawStatus === "sent to warehouse" ? (
          <>
            <FaCar className="inline-block text-yellow-700 mr-1" />
            Sent to WH
          </>
        ) : (
          capitalize(rawStatus)
        );

      return (
        <tr
          key={order.id}
          className="border-t hover:bg-gray-50 text-[10px] text-gray-700"
        >
          <td className="px-4 py-2 border-r border-gray-200">{cleanId}</td>
          <td className="px-4 py-2 border-r border-gray-200">{date}</td>
          <td className="px-4 py-2 border-r border-gray-200">{username}</td>
          <td className="px-4 py-2 border-r border-gray-200">{duration}</td>
          <td className="px-4 py-2 border-r border-gray-200">{total}</td>
          <td className="px-4 py-2 border-r border-gray-200">
            {order.items.length}
          </td>
          <td className="px-4 py-2 border-r border-gray-200">
            <span
              className={`inline-block px-2 py-1 rounded-full text-[9px] ${statusClasses}`}
            >
              {statusContent}
            </span>
          </td>
          <td className="px-4 py-2">
            <Link
              to={`/order/${order.id + OFFSET}`}
              className="px-2 py-1 hover:underline text-gray-600"
            >
              <FaEye className="inline-block" />
            </Link>
          </td>
        </tr>
      );
    });

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto bg-white rounded">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-50 text-gray-700 text-[11px]">
            <tr>
              {headers.map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-2 text-left font-medium ${
                    i < headers.length - 1 ? "border-r border-gray-200" : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-center space-x-4 text-[11px]">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="p-1 disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="p-1 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OrderTable;