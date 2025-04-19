// components/OrderHistory.jsx

import React, { useState } from "react";

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

  const getStatusTextColor = (status) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === "delivered") return "text-green-600";
    if (normalizedStatus === "pending") return "text-yellow-600";
    if (normalizedStatus === "cancelled") return "text-red-600";
    if (normalizedStatus === "returned") return "text-gray-500";
    return "text-gray-800";
  };

  const getStatusCircleColor = (status) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === "delivered") return "bg-green-500";
    if (normalizedStatus === "pending") return "bg-yellow-400";
    if (normalizedStatus === "cancelled") return "bg-red-500";
    if (normalizedStatus === "returned") return "bg-gray-500";
    return "bg-gray-800";
  };

  const headers = ["Order ID", "Date", "Customer", "Quantity", "Status"];
  const totalColumns = headers.length;

  return (
    <div className="overflow-x-auto bg-white rounded shadow border border-gray-200">
      <div className="px-4 py-2 border-b text-sm font-semibold">Order History</div>
      <table className="min-w-full table-auto">
        <thead className="bg-gray-50 text-gray-700 text-[11px]">
          <tr>
            {headers.map((h, i) => (
              <th
                key={h}
                className={`px-4 py-2 text-left font-medium ${
                  i !== totalColumns - 1 ? "border-r border-gray-200" : ""
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[10px]">
          {currentPageData.map(({ id, date, customer, quantity, status }) => (
            <tr key={id} className="border-t hover:bg-gray-100">
              <td className="px-4 py-2 border-r border-gray-200">{id}</td>
              <td className="px-4 py-2 border-r border-gray-200">{date}</td>
              <td className="px-4 py-2 border-r border-gray-200">{customer}</td>
              <td className="px-4 py-2 border-r border-gray-200">{quantity}</td>
              <td className="px-4 py-2">
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full ${getStatusCircleColor(status)}`} />
                  <span className={`ml-2 ${getStatusTextColor(status)}`}>{status}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="border-t bg-white px-4 py-2 flex items-center justify-end space-x-2 text-[11px] text-gray-600">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="px-2 py-1 rounded border disabled:opacity-50 hover:bg-gray-50"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageClick(page)}
            className={`px-3 py-1 rounded border ${
              currentPage === page
                ? "bg-[#f9622c] text-white border-[#f9622c]"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-2 py-1 rounded border disabled:opacity-50 hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
