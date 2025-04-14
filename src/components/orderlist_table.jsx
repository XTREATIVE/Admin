import React from "react";
import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";

const dummyOrders = [
  {
    id: "#456754",
    createdAt: "3-06-2024",
    customer: "Jung S. Ayala",
    duration: "3 days",
    total: "UGX 98700",
    items: 2,
    orderStatus: "Packaging",
  },
  {
    id: "#578246",
    createdAt: "23-07-2024",
    customer: "David A. Arnold",
    duration: "1 day",
    total: "UGX 147800",
    items: 5,
    orderStatus: "Completed",
  },
  {
    id: "#348930",
    createdAt: "23-08-2024",
    customer: "Cecilie D. Gordon",
    duration: "4 days",
    total: "UGX 72000",
    items: 4,
    orderStatus: "Cancelled",
  },
  {
    id: "#391367",
    createdAt: "23-09-2024",
    customer: "William Moreno",
    duration: "5 days",
    total: "UGX 190900",
    items: 6,
    orderStatus: "Completed",
  },
];

const OrderTable = () => {
  const currentPage = 1;
  const totalPages = 3;

  const handlePrevious = () => {
    console.log("Previous Page");
  };

  const handleNext = () => {
    console.log("Next Page");
  };

  const getOrderStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "border border-[#28a745] bg-transparent text-[#28a745]";
      case "processing":
        return "border border-yellow-500 bg-transparent text-yellow-500";
      case "packaging":
        return "border border-orange-500 bg-transparent text-orange-500";
      case "canceled":
      case "cancelled":
        return "border border-red-600 bg-transparent text-red-600";
      default:
        return "bg-[#e2e3e5] text-[#383d41]";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-[11px] p-2.5 text-left font-semibold bg-[#f1f1f1]">Order ID</th>
            <th className="text-[11px] p-2.5 text-left font-semibold bg-[#f1f1f1]">Date Created</th>
            <th className="text-[11px] p-2.5 text-left font-semibold bg-[#f1f1f1]">Customer</th>
            <th className="text-[11px] p-2.5 text-left font-semibold bg-[#f1f1f1]">Duration</th>
            <th className="text-[11px] p-2.5 text-left font-semibold bg-[#f1f1f1]">Total</th>
            <th className="text-[11px] p-2.5 text-left font-semibold bg-[#f1f1f1]">Items</th>
            <th className="text-[11px] p-2.5 text-left font-semibold bg-[#f1f1f1]">Order Status</th>
            <th className="text-[11px] p-2.5 text-left font-semibold bg-[#f1f1f1]">Action</th>
          </tr>
        </thead>
        <tbody className="text-[10px] divide-y divide-gray-100">
          {dummyOrders.map((order, idx) => {
            // strip out the leading '#' so the URL is /order/583488
            const cleanId = order.id.replace(/^#/, "");
            return (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="p-2.5">{order.id}</td>
                <td className="p-2.5">{order.createdAt}</td>
                <td className="p-2.5">{order.customer}</td>
                <td className="p-2.5">{order.duration}</td>
                <td className="p-2.5">{order.total}</td>
                <td className="p-2.5">{order.items}</td>
                <td className="p-2.5">
                  <span
                    className={`py-1 px-2 rounded-md text-[9px] inline-block ${getOrderStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                </td>
                <td className="p-2.5 flex items-center space-x-1">
                  <Link
                    to={`/order/${cleanId}`}
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
              onClick={() => console.log(`Go to page ${i + 1}`)}
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
