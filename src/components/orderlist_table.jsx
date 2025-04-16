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
  // Consume orders from OrdersContext
  const { orders, loading, error } = useContext(OrdersContext);
  // Consume customer details from UserContext
  const { getUsernameById, loading: loadingUsers, error: userError } =
    useContext(UserContext);

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
  if (error) {
    return (
      <div className="text-center text-[11px] p-4 text-red-600">
        Error fetching orders: {error}
      </div>
    );
  }
  if (userError) {
    return (
      <div className="text-center text-[11px] p-4 text-red-600">
        Error fetching users: {userError}
      </div>
    );
  }

  const OFFSET = 1000;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
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
            ].map((label) => (
              <th
                key={label}
                className="text-[11px] p-2.5 text-left font-semibold bg-[#f1f1f1]"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[10px] divide-y divide-gray-100">
          {paginatedOrders.map((order) => {
            const cleanId = `ORD${order.id + OFFSET}`;
            const maskedIdForURL = order.id + OFFSET;
            const formattedDate = new Date(order.created_at).toLocaleDateString("en-GB");
            const duration = getDuration(order.created_at);
            const total = `UGX ${Number(order.total_price).toLocaleString()}`;
            const itemsCount = order.items.length;
            const username = getUsernameById(order.customer);

            return (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-2.5">{cleanId}</td>
                <td className="p-2.5">{formattedDate}</td>
                <td className="p-2.5">{username}</td>
                <td className="p-2.5">{duration}</td>
                <td className="p-2.5">{total}</td>
                <td className="p-2.5">{itemsCount}</td>
                <td className="p-2.5">
                  <span
                    className={`py-1 px-2 rounded-md text-[9px] inline-block ${getOrderStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-2.5 flex items-center space-x-1">
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
      <div className="flex justify-end items-center mt-4 space-x-2 text-[11px] text-gray-600">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`px-3 py-1 border rounded ${
            currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
          }`}
        >
          Previous
        </button>
        <div className="flex items-center space-x-1">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`px-3 py-1 border rounded-lg hover:bg-gray-50 ${
                currentPage === i + 1 ? "bg-[#f9622c] text-white" : "border-gray-300"
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 border rounded ${
            currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OrderTable;
