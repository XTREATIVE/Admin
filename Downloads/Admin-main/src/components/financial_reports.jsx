import React, { useState, useMemo, useContext, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Archive,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { PayoutsContext } from "../context/payoutscontext";

const ITEMS_PER_PAGE = 20;
const TABS = [
  { key: "upcoming", label: "Upcoming Payouts" },
  { key: "pending", label: "Pending Payouts" },
  { key: "history", label: "Payout History" },
  { key: "refunds", label: "Refunds/Cancelled Payouts" },
  { key: "summary", label: "Summary & Payout Leaderboard" },
];

export default function FinancialReports({ isGeneratingPDF, searchTerm, onTabChange }) {
  const { blocks, loading, error } = useContext(PayoutsContext);
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [currentPage, setCurrentPage] = useState(1);

  // Notify parent of tab change
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setCurrentPage(1); // Reset page when switching tabs
    if (onTabChange) {
      onTabChange(tabKey);
    }
  };

  // Filter payouts by tab and searchTerm
  const filtered = useMemo(() => {
    let result = [...blocks];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((b) =>
        b.id.toLowerCase().includes(term) ||
        b.date.toLowerCase().includes(term) ||
        b.time.toLowerCase().includes(term) ||
        b.vendor.toLowerCase().includes(term) ||
        b.orderid.toLowerCase().includes(term) ||
        b.status.toLowerCase().includes(term)
      );
    }
    switch (activeTab) {
      case "upcoming":
        return result.filter((b) => b.status === "Upcoming");
      case "pending":
        return result.filter((b) => b.status === "Pending");
      case "history":
        return result.filter((b) => b.status === "Paid");
      case "refunds":
        return result.filter((b) => ["Refunded", "Cancelled"].includes(b.status));
      default:
        return result;
    }
  }, [activeTab, blocks, searchTerm]);

  // Summary & leaderboard aggregates
  const summary = useMemo(() => {
    const totalSales = filtered.reduce((sum, b) => sum + (b.sales || 0), 0);
    const totalCommission = filtered.reduce((sum, b) => sum + (b.commissionAmount || 0), 0);
    const payoutsMade = filtered.filter((b) => b.status === "Paid").length;
    const inventoryValue = filtered.reduce((sum, b) => sum + (b.inventoryValue || 0), 0);
    const pendingPayouts = filtered
      .filter((b) => b.status === "Pending" || b.status === "Upcoming")
      .reduce((sum, b) => sum + (b.netPayout || 0), 0);
    const refunds = filtered
      .filter((b) => ["Refunded", "Cancelled"].includes(b.status))
      .reduce((sum, b) => sum + (b.netPayout || 0), 0);

    const byVendor = {};
    filtered.forEach((b) => {
      byVendor[b.vendor] = (byVendor[b.vendor] || 0) + (b.netPayout || 0);
    });
    const leaderboard = Object.entries(byVendor)
      .map(([vendor, amt]) => ({ vendor, amt }))
      .sort((a, b) => b.amt - a.amt)
      .slice(0, 5);

    return {
      totalSales,
      totalCommission,
      payoutsMade,
      inventoryValue,
      pendingPayouts,
      refunds,
      leaderboard,
    };
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Debugging effect to log isGeneratingPDF state
  useEffect(() => {
    console.log("isGeneratingPDF:", isGeneratingPDF);
  }, [isGeneratingPDF]);

  if (loading) return <p className="p-4 text-[11px]">Loading...</p>;
  if (error) return <p className="p-4 text-red-600 text-[11px]">Error: {error}</p>;

  return (
    <div className="flex flex-col h-full">
      {!isGeneratingPDF && (
        <div className="flex bg-gray-50 border-b text-[11px]">
          {TABS.map((tab) => (
            <div
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
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
      )}

      {/* Content */}
      <div className="p-6 flex-1 overflow-auto">
        {activeTab === "summary" ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="border rounded bg-white p-4 flex items-center">
                <CreditCard size={20} className="mr-2" />
                <div>
                  <p className="text-[11px] text-gray-500">Total Sales</p>
                  <p className="font-semibold">UGX {summary.totalSales.toLocaleString()}</p>
                </div>
              </div>
              <div className="border rounded bg-white p-4 flex items-center">
                <Archive size={20} className="mr-2" />
                <div>
                  <p className="text-[11px] text-gray-500">Commission Earned</p>
                  <p className="font-semibold">
                    UGX {summary.totalCommission.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="border rounded bg-white p-4 flex items-center">
                <CreditCard size={20} className="mr-2" />
                <div>
                  <p className="text-[11px] text-gray-500">Payouts Made</p>
                  <p className="font-semibold">{summary.payoutsMade}</p>
                </div>
              </div>
              <div className="border rounded bg-white p-4 flex items-center">
                <Archive size={20} className="mr-2" />
                <div>
                  <p className="text-[11px] text-gray-500">Inventory Value</p>
                  <p className="font-semibold">
                    UGX {summary.inventoryValue.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="border rounded bg-white p-4 flex items-center">
                <CreditCard size={20} className="mr-2" />
                <div>
                  <p className="text-[11px] text-gray-500">Pending Payouts</p>
                  <p className="font-semibold">
                    UGX {summary.pendingPayouts.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="border rounded bg-white p-4 flex items-center">
                <Archive size={20} className="mr-2" />
                <div>
                  <p className="text-[11px] text-gray-500">Refunds</p>
                  <p className="font-semibold">
                    UGX {summary.refunds.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Leaderboard Chart */}
            <div className="h-64 bg-white rounded p-4">
              <h3 className="text-[12px] mb-2 font-medium">
                Top 5 Net Payouts by Vendor
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summary.leaderboard}
                  margin={{ top: 20, right: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="vendor" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip formatter={(amt) => `UGX ${amt.toLocaleString()}`} />
                  <Bar dataKey="amt" name="Net Payout" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="overflow-x-auto bg-white rounded">
            <table className="min-w-full table-auto border-collapse text-[10px]">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  {[
                    "ID",
                    "Date",
                    "Time",
                    "Vendor",
                    "Order ID",
                    "Sales",
                    "Commission",
                    "Net Payout",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2 text-left font-medium border-r border-gray-200"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((b) => (
                  <tr key={b.id} className="border-t hover:bg-gray-100">
                    {[b.id, b.date, b.time, b.vendor, b.orderid, b.sales, b.commissionAmount, b.netPayout].map(
                      (c, i) => (
                        <td
                          key={i}
                          className="px-4 py-2 border-r border-gray-200"
                        >
                          {c}
                        </td>
                      )
                    )}
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-[9px] ${
                          b.status === "Paid" || b.status === "Upcoming"
                            ? "bg-green-100 text-green-900"
                            : b.status === "Pending"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-center space-x-4 py-2 text-[11px]">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}