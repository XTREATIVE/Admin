// OrderTable.js
import React, { useState, useMemo, useContext } from "react";
import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { UserContext } from "../context/usercontext";
import { OrdersContext } from "../context/orderscontext";

const getOrderStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "border border-[#28a745] bg-transparent text-[#28a745]";
    case "processing":
      return "border border-yellow-500 bg-transparent text-yellow-500";
    case "packaging":
      return "border border-orange-500 bg-transparent text-orange-500";
    case "pending":
      return "border border-yellow-500 bg-transparent text-yellow-500";
    case "canceled":
    case "cancelled":
      return "border border-red-600 bg-transparent text-red-600";
    case "delivered":
      return "border border-green-300 bg-transparent text-green-500";
    default:
      return "bg-[#e2e3e5] text-[#383d41]";
  }
};

const getDuration = (isoDateString) => {
  const then = new Date(isoDateString).getTime();
  const now = Date.now();
  const diffMs = now - then;

  const msPerDay = 1000 * 60 * 60 * 24;
  const msPerHour = 1000 * 60 * 60;

  const days = Math.floor(diffMs / msPerDay);
  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""}`;
  }

  const hours = Math.floor(diffMs / msPerHour);
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }

  return "Just now";
};

const OrderTable = () => {
  const { orders, loading, error } = useContext(OrdersContext);
  const { getUsernameById, loading: loadingUsers, error: userError } = useContext(UserContext);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(orders.length / pageSize);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return orders.slice(start, start + pageSize);
  }, [orders, currentPage]);

  const handlePrevious = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  if (loading || loadingUsers) {
    return (
      <div className="text-center text-[11px] p-4 text-gray-600">
        Loading orders…
      </div>
    );
  }

  if (error || userError) {
    return (
      <div className="text-center text-[11px] p-4 text-red-600">
        {error ? `Error fetching orders: ${error}` : `Error fetching users: ${userError}`}
      </div>
    );
  }

  const OFFSET = 1000;

  return (
    <div className="overflow-x-auto bg-white rounded shadow border border-gray-200">
      <div className="px-4 py-2 border-b text-sm font-semibold">All Orders</div>
      <table className="min-w-full table-auto">
        <thead className="bg-gray-50 text-[11px] text-gray-700">
          <tr>
            {[
              "Order ID",
              "Date Created",
              "Customer",
              "Duration",
              "Total",
              "Items",
              "Order Status",
              "Action",
            ].map((label, idx, arr) => (
              <th
                key={label}
                className={`px-4 py-2 text-left font-medium ${
                  idx !== arr.length - 1 ? "border-r border-gray-200" : ""
                }`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[10px]">
          {paginatedOrders.map((order) => {
            const cleanId = `ORD${order.id + OFFSET}`;
            const maskedIdForURL = order.id + OFFSET;
            const formattedDate = new Date(order.created_at).toLocaleDateString("en-GB");
            const duration = getDuration(order.created_at);
            const total = `UGX ${Number(order.total_price).toLocaleString()}`;
            const itemsCount = order.items.length;
            const username = getUsernameById(order.customer);

            return (
              <tr key={order.id} className="border-t hover:bg-gray-100">
                <td className="px-4 py-2 border-r border-gray-200">{cleanId}</td>
                <td className="px-4 py-2 border-r border-gray-200">{formattedDate}</td>
                <td className="px-4 py-2 border-r border-gray-200">{username}</td>
                <td className="px-4 py-2 border-r border-gray-200">{duration}</td>
                <td className="px-4 py-2 border-r border-gray-200">{total}</td>
                <td className="px-4 py-2 border-r border-gray-200">{itemsCount}</td>
                <td className="px-4 py-2 border-r border-gray-200">
                  <span
                    className={`py-1 px-2 rounded-md text-[9px] inline-block ${getOrderStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <Link
                    to={`/order/${maskedIdForURL}`}
                    className="p-[5px] hover:bg-gray-100 rounded text-gray-600"
                    title="View Order Details"
                  >
                    <FaEye className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="border-t bg-white px-4 py-2 flex items-center justify-end space-x-2 text-[11px] text-gray-600">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="px-2 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded border ${
              currentPage === i + 1
                ? "bg-[#f9622c] text-white border-[#f9622c]"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-2 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OrderTable;
