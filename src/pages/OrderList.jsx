import React, { useState, useMemo, useContext, useEffect } from "react";
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
import { DateContext } from "../context/datecontext";

export default function OrderList() {
   const { orders: contextOrders, loading: ordersLoading } = useContext(OrdersContext);
   const { claims: contextClaims, isLoading: claimsLoading } = useContext(ClaimsContext);
   const { range, setRange, customDate, setCustomDate, customRangeStart, setCustomRangeStart, customRangeEnd, setCustomRangeEnd, inRange, today } = useContext(DateContext);

   const [orders, setOrders] = useState([]);
   const [claims, setClaims] = useState([]);
   const [localLoading, setLocalLoading] = useState(false);

  // NEW: State for all-time totals (like AdminDashboard)
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSalesAmount, setTotalSalesAmount] = useState(0);

  const API_BASE_URL = "https://api-xtreative.onrender.com";

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || localStorage.getItem('token');
  };

  // Helper function for API calls with authentication
  const fetchWithAuth = async (url) => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  // Fetch data directly if context is empty
  const fetchDataIfNeeded = async () => {
    // Use context data if available
    if (contextOrders && contextOrders.length > 0) {
      setOrders(contextOrders);
    }
    if (contextClaims && contextClaims.length > 0) {
      setClaims(contextClaims);
    }

    // If context is still loading or empty, fetch directly
    if ((ordersLoading || !contextOrders || contextOrders.length === 0) ||
        (claimsLoading || !contextClaims || contextClaims.length === 0)) {
      setLocalLoading(true);
      try {
        const [ordersData, claimsData] = await Promise.all([
          fetchWithAuth(`${API_BASE_URL}/orders/list/`),
          fetchWithAuth(`${API_BASE_URL}/returns/list/`)
        ]);

        const ordersResult = Array.isArray(ordersData) ? ordersData : (ordersData?.results || []);
        const claimsResult = Array.isArray(claimsData) ? claimsData : (claimsData?.results || []);

        setOrders(ordersResult);
        setClaims(claimsResult);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to context data
        setOrders(contextOrders || []);
        setClaims(contextClaims || []);
      } finally {
        setLocalLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDataIfNeeded();
  }, [contextOrders, contextClaims, ordersLoading, claimsLoading]);

  // NEW: Calculate all-time totals from ALL orders (like AdminDashboard)
  useEffect(() => {
    if (orders.length > 0) {
      setTotalOrders(orders.length);
      const totalSales = orders.reduce((sum, order) => 
        sum + (Number(order.total_price) || 0), 0
      );
      setTotalSalesAmount(totalSales);
    } else {
      setTotalOrders(0);
      setTotalSalesAmount(0);
    }
  }, [orders]);

  // ——— Return graph selector state ———
  const [returnRange, setReturnRange] = useState("thisMonth");

  // ——— Claims modal ———
  const [isModalOpen, setIsModalOpen] = useState(false);

  // formatted label for header — always show today's date
  const formattedDate = useMemo(
    () => format(today, "do MMMM, yyyy"),
    [today]
  );

  // filter orders by created_at according to range
  const filteredOrders = useMemo(
    () =>
      orders.filter((o) => {
        const parsed = parseISO(o.created_at);
        const dateObj = isNaN(parsed) ? new Date(o.created_at) : parsed;
        return inRange(dateObj);
      }),
    [orders, range, today, customDate, customRangeStart, customRangeEnd]
  );

  // filter claims by created_at according to range
  const filteredClaims = useMemo(
    () =>
      claims.filter((c) => {
        const parsed = parseISO(c.created_at);
        const dateObj = isNaN(parsed) ? new Date(c.created_at) : parsed;
        return inRange(dateObj);
      }),
    [claims, range, today, customDate, customRangeStart, customRangeEnd]
  );

  // compute summary stats for FILTERED period
  const pendingOrders = filteredOrders.filter((o) => o.status.toLowerCase() === "pending").length;
  const processingOrders = filteredOrders.filter((o) => o.status.toLowerCase() === "processing").length;
  const shippedOrders = filteredOrders.filter((o) => o.status.toLowerCase() === "shipped").length;
  const deliveredOrders = filteredOrders.filter((o) => o.status.toLowerCase() === "delivered").length;
  const cancelledOrders = filteredOrders.filter((o) =>
    ["cancelled", "canceled"].includes(o.status.toLowerCase())
  ).length;
  
  // Calculate sales for FILTERED period
  const totalSalesThisPeriod = useMemo(
    () => filteredOrders.reduce((sum, o) => sum + Number(o.total_price || 0), 0),
    [filteredOrders]
  );

  // UPDATED: Enhanced summary data with both all-time and period stats
  const summaryData = [
    { 
      title: "Total Orders (All Time)", 
      value: totalOrders.toLocaleString(), 
      icon: "📝",
      periodLabel: "This Period",
      periodValue: filteredOrders.length.toLocaleString()
    },
    { 
      title: "Total Sales (All Time)", 
      value: `UGX ${totalSalesAmount.toLocaleString()}`, 
      icon: "💰",
      periodLabel: "This Period",
      periodValue: `UGX ${totalSalesThisPeriod.toLocaleString()}`
    },
    { 
      title: "Pending Orders", 
      value: pendingOrders, 
      icon: "⏳" 
    },
    { 
      title: "Processing", 
      value: processingOrders, 
      icon: "🔄" 
    },
    { 
      title: "Shipped", 
      value: shippedOrders, 
      icon: "🚚" 
    },
    { 
      title: "Delivered", 
      value: deliveredOrders, 
      icon: "✅" 
    },
    { 
      title: "Cancelled", 
      value: cancelledOrders, 
      icon: "❌" 
    },
    { 
      title: "Returns", 
      value: filteredClaims.length, 
      icon: "↩️" 
    },
  ];

  // Aggregate claims and delivered orders by date for return rate calculation
  const returnRateData = useMemo(() => {
    // Aggregate claims by date
    const claimCounts = claims.reduce((acc, claim) => {
      const date = format(parseISO(claim.created_at), "yyyy-MM-dd");
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Aggregate delivered orders by date
    const deliveredOrderCounts = orders.reduce((acc, order) => {
      if (order.status.toLowerCase() === "delivered") {
        const date = format(parseISO(order.created_at), "yyyy-MM-dd");
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {});

    // Calculate return rate for each date
    return Object.keys({ ...claimCounts, ...deliveredOrderCounts }).map((date) => {
      const claimsOnDate = claimCounts[date] || 0;
      const deliveredOrdersOnDate = deliveredOrderCounts[date] || 0;
      const rate = deliveredOrdersOnDate > 0 ? (claimsOnDate / deliveredOrdersOnDate) * 100 : 0;
      return {
        date,
        rate: Number(rate.toFixed(2)), // Round to 2 decimal places
      };
    }).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
  }, [claims, orders]);

  // filter return rate data by returnRange
  const filteredReturnRateData = returnRateData.filter((d) => {
    const dt = parseISO(d.date);
    switch (returnRange) {
      case "today":
        return format(dt, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
      case "thisMonth":
        return isSameMonth(dt, today);
      case "thisYear":
        return isSameYear(dt, today);
      default:
        return true;
    }
  });

  return (
    <div className="h-screen font-poppins relative">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 p-5 bg-gray-100 ml-[80px]">
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

          {/* UPDATED: Summary Cards with period breakdown */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {summaryData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-lg transition">
                <div className="flex flex-col w-full">
                  <h3 className="text-[11px] font-semibold text-gray-700">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.value}</p>
                  
                  {/* NEW: Show period breakdown for all-time totals */}
                  {item.periodLabel && item.periodValue && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-[9px] text-gray-400">{item.periodLabel}:</p>
                      <p className="text-[10px] font-semibold text-blue-600">{item.periodValue}</p>
                    </div>
                  )}
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
                    <Tooltip
                      formatter={(val) => `${val}%`}
                      labelFormatter={(lbl) => `Date: ${lbl}`}
                      contentStyle={{ fontSize: "10px" }}
                      itemStyle={{ fontSize: "10px" }}
                    />
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
      {isModalOpen && (
        <ClaimsModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}