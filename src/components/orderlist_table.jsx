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
  if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
  const hours = Math.floor(diffMs / msPerHour);
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
  return "Just now";
};

const OrderTable = () => {
  const { orders, loading, error } = useContext(OrdersContext);
  const { getUsernameById, loading: loadingUsers, error: userError } =
    useContext(UserContext);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(orders.length / pageSize);
  const OFFSET = 1000;

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return orders.slice(start, start + pageSize);
  }, [orders, currentPage]);

  if (loading || loadingUsers) return <div className="text-center p-4 text-gray-600 text-[11px]">Loading orders…</div>;
  if (error) return <div className="text-center p-4 text-red-600 text-[11px]">Error: {error}</div>;
  if (userError) return <div className="text-center p-4 text-red-600 text-[11px]">Error: {userError}</div>;

  const headers = [
    "Order ID", "Date Created", "Customer", "Duration", "Total", "Items", "Order Status", "Action"
  ];

  const renderRows = () =>
    paginated.map((order) => {
      const cleanId = `ORD${order.id + OFFSET}`;
      const date = new Date(order.created_at).toLocaleDateString("en-GB");
      const duration = getDuration(order.created_at);
      const total = `UGX ${Number(order.total_price).toLocaleString()}`;
      const username = getUsernameById(order.customer);

      return (
        <tr key={order.id} className="border-t hover:bg-gray-50 text-[10px] text-gray-700" >
          {[
            cleanId,
            date,
            username,
            duration,
            total,
            order.items.length,
            <span key="status" className={`inline-block px-2 py-1 rounded-full text-[9px] ${getOrderStatusColor(order.status)}`}>{order.status}</span>,
            <Link key="view" to={`/order/${order.id + OFFSET}`} className="px-2 py-1 hover:underline text-gray-600"><FaEye className="inline-block" /></Link>
          ].map((val, idx) => (
            <td key={idx} className={`px-4 py-2 ${idx < headers.length - 1 ? 'border-r border-gray-200' : ''}`}>{val}</td>
          ))}
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
                <th key={h} className={`px-4 py-2 text-left font-medium ${i < headers.length - 1 ? 'border-r border-gray-200' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-center space-x-4 text-[11px]">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 disabled:opacity-50">Previous</button>
        <span>{currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1 disabled:opacity-50">Next</button>
      </div>
    </div>
  );
};

export default OrderTable;