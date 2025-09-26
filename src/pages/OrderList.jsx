import React, { useState, useMemo, useContext } from "react";
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
import { useNavigate } from "react-router-dom";

export default function OrderList() {
  const navigate = useNavigate();
  const { orders } = useContext(OrdersContext);
  const { claims } = useContext(ClaimsContext);

  // ——— Date selector state ———
  const today = useMemo(() => new Date(), []);
  const [range, setRange] = useState("today");
  const [customDate, setCustomDate] = useState(today);
  const [customRangeStart, setCustomRangeStart] = useState(today);
  const [customRangeEnd, setCustomRangeEnd] = useState(today);

  // ——— Return graph selector state ———
  const [returnRange, setReturnRange] = useState("thisMonth");

  // ——— Claims modal ———
  const [isModalOpen, setIsModalOpen] = useState(false);

  // formatted label for header — always show today's date
  const formattedDate = useMemo(
    () => format(today, "do MMMM, yyyy"),
    [today]
  );

  // helper to test if date is in selected range
  const inRange = (dateObj) => {
    switch (range) {
      case "today":
        return isSameDay(dateObj, today);
      case "thisWeek":
        return isSameWeek(dateObj, today, { weekStartsOn: 1 });
      case "thisMonth":
        return isSameMonth(dateObj, today);
      case "thisYear":
        return isSameYear(dateObj, today);
      case "custom":
        return isSameDay(dateObj, customDate);
      case "customRange":
        return isWithinInterval(dateObj, {
          start: customRangeStart,
          end: customRangeEnd,
        });
      default:
        return false;
    }
  };

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

  // compute summary stats
  const pendingOrders = filteredOrders.filter((o) => o.status.toLowerCase() === "pending").length;
  const processingOrders = filteredOrders.filter((o) => o.status.toLowerCase() === "processing").length;
  const shippedOrders = filteredOrders.filter((o) => o.status.toLowerCase() === "shipped").length;
  const deliveredOrders = filteredOrders.filter((o) => o.status.toLowerCase() === "delivered").length;
  const cancelledOrders = filteredOrders.filter((o) =>
    ["cancelled", "canceled"].includes(o.status.toLowerCase())
  ).length;
  const totalSales = filteredOrders.reduce((sum, o) => sum + Number(o.total_price), 0);

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
                <OrderTable orders={filteredOrders} onRowClick={(id) => navigate(`/orders/${id}`)} />
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