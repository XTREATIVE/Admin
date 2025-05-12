import React, { useState, useMemo, useContext } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { OrdersContext } from "../context/orderscontext";
import { CurrencyContext } from "../context/CurrencyContext";

const ITEMS_PER_PAGE = 20;
const TABS = [
  { key: "pending", label: "Pending Orders" },
  { key: "warehouse", label: "Products At Warehouse" },
  { key: "delivered", label: "Delivered Orders" },
  { key: "returns", label: "Returns" },
];

export default function OrderReports() {
  const { orders, products, loading: loadingOrders, error: errorOrders } = useContext(OrdersContext);
  const { currency, loading: loadingCurrency, error: errorCurrency } = useContext(CurrencyContext);
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on tab
  const filtered = useMemo(() => {
    switch (activeTab) {
      case "pending":
        return orders.filter(o => o.status === "Pending");
      case "warehouse":
        return products.filter(p => p.location === "Warehouse");
      case "delivered":
        return orders.filter(o => o.status === "Delivered");
      case "returns":
        return orders.filter(o => o.status === "Returned");
      default:
        return [];
    }
  }, [activeTab, orders, products]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Combine loading and error states
  if (loadingOrders || loadingCurrency) {
    return <p className="p-4 text-[11px]">Loading...</p>;
  }
  if (errorOrders || errorCurrency) {
    return (
      <div className="p-4 text-red-600 text-[11px]">
        {errorOrders && <p>Orders error: {errorOrders}</p>}
        {errorCurrency && <p>Currency error: {errorCurrency}</p>}
      </div>
    );
  }

  // Render table headers and rows dynamically
  const renderTable = () => {
    let headers = [];
    let rows = [];

    if (activeTab === "warehouse") {
      headers = ["Product ID", "Name", "SKU", "Quantity", "Location"];
      rows = pageData.map(p => [p.id, p.name, p.sku, p.quantity, p.location]);
    } else {
      headers = ["Order ID", "Date", "Customer", `Total (${currency})`, "Status"];
      rows = pageData.map(o => [
        o.id,
        o.date,
        o.customer,
        `${o.total.toLocaleString()} ${currency}`,
        o.status,
      ]);
    }

    return (
      <div className="overflow-x-auto bg-white rounded">
        <table className="min-w-full table-auto border-collapse text-[10px]">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              {headers.map(h => (
                <th key={h} className="px-4 py-2 text-left font-medium border-r border-gray-200">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t hover:bg-gray-100">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2 border-r border-gray-200">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center space-x-4 py-2 text-[11px]">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>
          <span>{currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex bg-gray-50 border-b text-[11px]">
        {TABS.map(tab => (
          <div
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
            className={`flex-1 py-2 text-center cursor-pointer ${
              activeTab === tab.key
                ? "bg-white border-t border-l border-r text-gray-800"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </div>
        ))}
      </div>

      <div className="p-6 flex-1 overflow-auto">
        {renderTable()}
      </div>
    </div>
  );
}