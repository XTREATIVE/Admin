// components/OrderHistory.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";

export default function OrderHistory({ orderHistory }) {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(orderHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = orderHistory.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  // Helper functions for status color (unchanged from your original logic)
  const getStatusTextColor = (status) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === "delivered") {
      return "text-green-500";
    } else if (normalizedStatus === "pending") {
      return "text-yellow-500";
    } else if (normalizedStatus === "cancelled") {
      return "text-red-500";
    } else if (normalizedStatus === "returned") {
      return "text-gray-500";
    } else {
      return "text-gray-800";
    }
  };

  const getStatusCircleColor = (status) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === "delivered") {
      return "bg-green-500";
    } else if (normalizedStatus === "pending") {
      return "bg-orange-300";
    } else if (normalizedStatus === "cancelled") {
      return "bg-red-500";
    } else if (normalizedStatus === "returned") {
      return "bg-gray-500";
    } else {
      return "bg-gray-800";
    }
  };

  return (
    <div className="overflow-x-auto bg-white p-4 rounded shadow mb-4">
      <h2 className="text-sm font-semibold mb-2">Order History</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#f1f1f1]">
            <th className="text-[11px] p-2.5 text-left font-semibold">Order ID</th>
            <th className="text-[11px] p-2.5 text-left font-semibold">Date</th>
            <th className="text-[11px] p-2.5 text-left font-semibold">Customer</th>
            <th className="text-[11px] p-2.5 text-left font-semibold">Quantity</th>
            <th className="text-[11px] p-2.5 text-left font-semibold">Status</th>
           
          </tr>
        </thead>
        <tbody className="text-[10px] divide-y divide-gray-100">
          {currentPageData.map(({ id, date, customer, quantity, status }) => {
            // Remove the leading '#' (if any) for use in the order details URL.
            const cleanId = id.toString().replace(/^#/, "");
            return (
              <tr key={id} className="hover:bg-gray-50">
                <td className="p-2.5">{id}</td>
                <td className="p-2.5">{date}</td>
                <td className="p-2.5">{customer}</td>
                <td className="p-2.5">{quantity}</td>
                <td className="p-2.5">
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full ${getStatusCircleColor(status)}`}></span>
                    <span className={`ml-2 ${getStatusTextColor(status)}`}>{status}</span>
                  </div>
                </td>
                
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-end items-center mt-4 space-x-2 text-[11px] text-gray-600">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className={`px-3 py-1 border rounded ${
            currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
          }`}
        >
          Previous
        </button>
        <div className="flex items-center space-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={`px-3 py-1 border rounded-lg hover:bg-gray-50 ${
                currentPage === page ? "bg-[#f9622c] text-white" : "border-gray-300"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          onClick={handleNextPage}
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
}
