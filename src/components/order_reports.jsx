import React, { useState, useMemo, useContext } from "react";
import { FaCar } from "react-icons/fa";
import { OrdersContext } from "../context/orderscontext";

<<<<<<< HEAD
// Utility: get "st"/"nd"/"rd"/"th" suffix for dates
function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

// Utility: format JS Date → "4th April 2025"
function formatDate(dateObj) {
  const day = dateObj.getDate();
  const ordinal = getOrdinalSuffix(day);
  const month = dateObj.toLocaleString("en-GB", { month: "long" });
  const year = dateObj.getFullYear();
  return `${day}${ordinal} ${month} ${year}`;
}

=======
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
// Map statuses to bg/text colors
const getOrderStatusClasses = (status) => {
  switch (status.toLowerCase()) {
    case "pending": return "bg-yellow-100 text-yellow-800";
    case "processing": return "bg-orange-100 text-orange-800";
    case "packaging": return "bg-amber-100 text-amber-800";
    case "shipped": return "bg-green-100 text-green-800";
    case "sent to warehouse": return "bg-gray-100 text-yellow-700";
    case "completed": return "bg-emerald-100 text-emerald-800";
    case "delivered": return "bg-teal-100 text-teal-800";
    case "canceled": case "cancelled": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

// Capitalize words
const capitalize = (str) =>
  str.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

// Duration since date (with "ago")
const getDuration = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return "Just now";
};

const TABS = [
  { key: "pending", label: "Pending Orders" },
  { key: "warehouse", label: "Orders At Warehouse" },
  { key: "delivered", label: "Delivered Orders" },
  { key: "returns", label: "Returns" },
];

export default function OrderReports({ hideTabsWhenGeneratingPDF = false }) {
  const { orders, loading, error } = useContext(OrdersContext);
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const OFFSET = 1000;

  const filtered = useMemo(() => {
    switch (activeTab) {
      case "pending":
        return orders.filter(o => o.status.toLowerCase() === "pending");
      case "warehouse":
        return orders.filter(o => o.status.toLowerCase() === "sent to warehouse");
      case "delivered":
        return orders.filter(o => o.status.toLowerCase() === "delivered");
      case "returns":
        return orders.filter(o => o.status.toLowerCase() === "returned");
      default:
        return [];
    }
  }, [activeTab, orders]);

  if (loading)
    return <p className="p-4 text-[11px]">Loading...</p>;
  if (error)
    return <p className="p-4 text-red-600 text-[11px]">Error: {error}</p>;

  const renderTable = () => {
    const headers = [
      "Order ID",
      "Date Created",
      "Customer",
      "Duration",
      "Total (UGX)",
      "Items Count",
      "Order Status",
    ];

    return (
      <div className="overflow-x-auto bg-white rounded">
        <table className="min-w-full table-auto border-collapse text-[10px]">
          <thead className="bg-gray-50">
            <tr>
              {headers.map(h => (
                <th key={h} className="px-4 py-2 border-r text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => {
              const id = `ORD${o.id + OFFSET}`;
<<<<<<< HEAD
              const date = formatDate(new Date(o.created_at));
=======
              const date = new Date(o.created_at).toLocaleDateString("en-GB");
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
              const duration = getDuration(o.created_at);
              const total = `UGX ${Number(o.total_price).toLocaleString()}`;
              const items = o.items.length;
              const statusCls = getOrderStatusClasses(o.status);
              const statusContent =
                o.status.toLowerCase() === "sent to warehouse" ? (
                  <>
                    <FaCar className="inline mr-1 text-yellow-700" />
                    Sent to WH
                  </>
                ) : (
                  capitalize(o.status)
                );

              return (
                <tr key={o.id} className="hover:bg-gray-100 border-b border-gray-200">
                  {[id, date, o.customer, duration, total, items].map((c, i) => (
                    <td key={i} className="px-4 py-2 border-r">
                      {c}
                    </td>
                  ))}
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-[9px] ${statusCls}`}
                    >
                      {statusContent}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {!hideTabsWhenGeneratingPDF && (
        <div className="flex bg-gray-50 border-b text-[11px]">
          {TABS.map(t => (
            <div
              key={t.key}
              onClick={() => {
                setActiveTab(t.key);
              }}
              className={`flex-1 py-2 text-center cursor-pointer ${
                activeTab === t.key
                  ? "bg-white border-t border-l border-r text-gray-800"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {t.label}
            </div>
          ))}
        </div>
      )}
      <div className="p-6 flex-1 overflow-auto">
        {renderTable()}
      </div>
    </div>
  );
}