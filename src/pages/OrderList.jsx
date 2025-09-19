// src/pages/OrderList.jsx
import React, { useState, useMemo, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  format,
  parseISO,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
  isWithinInterval,
} from "date-fns";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import OrderTable from "../components/orderlist_table";
import RecentClaims from "../components/RecentClaims";
import ClaimsModal from "../modals/returnClaims";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { OrdersContext } from "../context/orderscontext";
import { ClaimsContext } from "../context/claimscontext";

export default function OrderList() {
  const navigate = useNavigate();
  const { orders, loading: ordersLoading, error: ordersError, hasInitialized: ordersInitialized } = useContext(OrdersContext);
  const { claims, isLoading: claimsLoading, error: claimsError, hasInitialized: claimsInitialized } = useContext(ClaimsContext);

  // ——— Authentication check ———
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // ——— Date selector state ———
  const today = useMemo(() => new Date(), []);
  const [range, setRange] = useState("all");
  const [customDate, setCustomDate] = useState(today);
  const [customRangeStart, setCustomRangeStart] = useState(today);
  const [customRangeEnd, setCustomRangeEnd] = useState(today);

  // ——— Return graph selector state ———
  const [returnRange, setReturnRange] = useState("thisMonth");

  // ——— Claims modal ———
  const [isModalOpen, setIsModalOpen] = useState(false);

  // formatted label for header
  const formattedDate = useMemo(() => {
    switch (range) {
      case "today": return format(today, "do MMMM, yyyy");
      case "thisWeek": return "This Week";
      case "thisMonth": return "This Month";
      case "thisYear": return "This Year";
      case "custom": return format(customDate, "do MMMM, yyyy");
      case "customRange": return `${format(customRangeStart, "dd/MM/yyyy")} — ${format(customRangeEnd, "dd/MM/yyyy")}`;
      case "all":
      default: return "All Time";
    }
  }, [range, today, customDate, customRangeStart, customRangeEnd]);

  // helper to test if date is in selected range
  const inRange = (dateObj) => {
    switch (range) {
      case "today": return isSameDay(dateObj, today);
      case "thisWeek": return isSameWeek(dateObj, today, { weekStartsOn: 1 });
      case "thisMonth": return isSameMonth(dateObj, today);
      case "thisYear": return isSameYear(dateObj, today);
      case "custom": return isSameDay(dateObj, customDate);
      case "customRange": return isWithinInterval(dateObj, { start: customRangeStart, end: customRangeEnd });
      case "all": return true;
      default: return false;
    }
  };

  // ——— Authentication state handling ———
  const isInitializing = (!ordersInitialized || !claimsInitialized) && !ordersError && !claimsError;
  const isLoadingData = (ordersLoading || claimsLoading) && (ordersInitialized && claimsInitialized);

  // ——— Early return for loading states ———
  if (isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center font-poppins">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  if (ordersError || claimsError) {
    const errorMessage = ordersError || claimsError;
    
    // If it's an auth error, don't show the error page
    if (errorMessage.includes("Session expired") || errorMessage.includes("Please log in")) {
      return null; // Let the auth redirect handle this
    }

    return (
      <div className="h-screen flex items-center justify-center font-poppins">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ——— Filter orders & claims ———
  const filteredOrders = orders.filter((o) => {
    if (!o || !o.created_at) return false;
    try {
      const parsed = parseISO(o.created_at);
      const dateObj = isNaN(parsed) ? new Date(o.created_at) : parsed;
      return !isNaN(dateObj) && inRange(dateObj);
    } catch {
      return false;
    }
  });

  const filteredClaims = claims.filter((c) => {
    if (!c || !c.created_at) return false;
    try {
      const parsed = parseISO(c.created_at);
      const dateObj = isNaN(parsed) ? new Date(c.created_at) : parsed;
      return !isNaN(dateObj) && inRange(dateObj);
    } catch {
      return false;
    }
  });

  // ——— Compute summary stats ———
  const pendingOrders = filteredOrders.filter((o) => o?.status?.toLowerCase() === "pending").length;
  const processingOrders = filteredOrders.filter((o) => o?.status?.toLowerCase() === "processing").length;
  const shippedOrders = filteredOrders.filter((o) => o?.status?.toLowerCase() === "shipped").length;
  const deliveredOrders = filteredOrders.filter((o) => o?.status?.toLowerCase() === "delivered").length;
  const cancelledOrders = filteredOrders.filter((o) => ["cancelled","canceled"].includes(o?.status?.toLowerCase() || "")).length;
  const totalSales = filteredOrders.reduce((sum, o) => sum + (Number(o?.total_price) || 0), 0);

  const summaryData = [
    { title: "Total Orders", value: filteredOrders.length, icon: "📝" },
    { title: "Pending Orders", value: pendingOrders, icon: "⏳" },
    { title: "Processing", value: processingOrders, icon: "🔄" },
    { title: "Shipped", value: shippedOrders, icon: "🚚" },
    { title: "Delivered", value: deliveredOrders, icon: "✅" },
    { title: "Cancelled", value: cancelledOrders, icon: "❌" },
    { title: "Total Sales", value: `UGX ${totalSales.toLocaleString()}`, icon: "💰" },
    { title: "Returns", value: filteredClaims.length, icon: "↩️" },
  ];

  // ——— Return Rate Data ———
  const returnRateData = filteredOrders.map((order) => {
    if (!order) return null;
    const deliveredCount = order.status?.toLowerCase() === "delivered" ? 1 : 0;
    const claimsCount = filteredClaims.filter(c => c?.order_item === order.id).length;
    const rate = deliveredCount > 0 ? (claimsCount / deliveredCount) * 100 : 0;
    return { date: order.created_at, rate: Number(rate.toFixed(2)) };
  }).filter(Boolean);

  const filteredReturnRateData = returnRateData.filter((d) => {
    if (!d?.date) return false;
    try {
      const dt = parseISO(d.date);
      if (isNaN(dt)) return false;
      switch (returnRange) {
        case "today": return isSameDay(dt, today);
        case "thisMonth": return isSameMonth(dt, today);
        case "thisYear": return isSameYear(dt, today);
        default: return true;
      }
    } catch {
      return false;
    }
  });

  // ——— Render ———
  return (
    <div className="h-screen font-poppins relative">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 p-5 bg-gray-100 ml-[80px]">
          {/* Loading indicator for data refresh */}
          {isLoadingData && (
            <div className="fixed top-20 right-5 bg-blue-100 border border-blue-300 rounded-lg p-3 shadow-lg z-50">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-blue-700 text-sm">Refreshing data...</span>
              </div>
            </div>
          )}

          {/* Date Controls */}
          <div className="w-full rounded p-4 flex items-center justify-between -mt-5">
            <div className="flex items-center space-x-2 text-[10px]">
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="py-1 px-2 rounded border border-gray-300 focus:outline-none"
              >
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="thisYear">This Year</option>
                <option value="custom">Custom Date</option>
                <option value="customRange">Custom Range</option>
                <option value="all">All Time</option>
              </select>
              {range === "custom" && (
                <input
                  type="date"
                  className="py-1 px-2 rounded border border-gray-300 focus:outline-none"
                  value={format(customDate, "yyyy-MM-dd")}
                  onChange={(e) => setCustomDate(new Date(e.target.value))}
                />
              )}
              {range === "customRange" && (
                <>
                  <input
                    type="date"
                    className="py-1 px-2 rounded border border-gray-300 focus:outline-none"
                    value={format(customRangeStart, "yyyy-MM-dd")}
                    onChange={(e) => setCustomRangeStart(new Date(e.target.value))}
                  />
                  <span>to</span>
                  <input
                    type="date"
                    className="py-1 px-2 rounded border border-gray-300 focus:outline-none"
                    value={format(customRangeEnd, "yyyy-MM-dd")}
                    onChange={(e) => setCustomRangeEnd(new Date(e.target.value))}
                  />
                </>
              )}
            </div>
            <div className="text-[12px] text-gray-700 font-medium">{formattedDate}</div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {summaryData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-lg transition">
                <div className="flex flex-col">
                  <h3 className="text-[11px] font-semibold text-gray-700">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.value}</p>
                </div>
                <div className="text-lg">{item.icon}</div>
              </div>
            ))}
          </div>

          {/* Graphs & Order List */}
          <div className="flex gap-2 min-h-[300px]">
            {/* Left */}
            <div className="flex flex-col gap-2 w-1/3">
              <div className="p-5 bg-white rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[11px] font-semibold text-gray-700">Return Rate</h3>
                  <select
                    value={returnRange}
                    onChange={(e) => setReturnRange(e.target.value)}
                    className="text-[10px] border border-gray-300 rounded px-1 py-0.5"
                  >
                    <option value="today">Today</option>
                    <option value="thisMonth">This Month</option>
                    <option value="thisYear">This Year</option>
                  </select>
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={filteredReturnRateData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 8 }} />
                    <YAxis domain={[0, "dataMax + 10"]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 8 }} />
                    <Tooltip formatter={(val) => `${val}%`} labelFormatter={(lbl) => `Date: ${lbl}`} contentStyle={{ fontSize: "10px" }} itemStyle={{ fontSize: "10px" }} />
                    <Line type="monotone" dataKey="rate" stroke="#8884d8" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <RecentClaims onViewAll={() => setIsModalOpen(true)} />
            </div>

            {/* Right */}
            <div className="w-2/3">
              <div className="p-4 bg-white rounded-lg shadow h-full">
                <h3 className="text-[11px] font-semibold text-gray-700 mb-2">Order List</h3>
                <OrderTable orders={filteredOrders} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Claims Modal */}
      {isModalOpen && <ClaimsModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}