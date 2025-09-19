// src/pages/OrderList.jsx
import { useState, useMemo, useContext } from "react";
import {
  format,
  parseISO,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
  isWithinInterval,
  isValid,
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
  // safe reads from contexts, provide fallbacks so page renders even while data loads
  const ordersContext = useContext(OrdersContext) || {};
  const claimsContext = useContext(ClaimsContext) || {};

  const { orders: ctxOrders = [], loading: ordersLoading = false, error: ordersError = null } = ordersContext;
  const { claims: ctxClaims = [], isLoading: claimsLoading = false, error: claimsError = null } = claimsContext;

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
      case "today":
        return format(today, "do MMMM, yyyy");
      case "thisWeek":
        return "This Week";
      case "thisMonth":
        return "This Month";
      case "thisYear":
        return "This Year";
      case "custom":
        return format(customDate, "do MMMM, yyyy");
      case "customRange":
        return `${format(customRangeStart, "dd/MM/yyyy")} — ${format(customRangeEnd, "dd/MM/yyyy")}`;
      case "all":
      default:
        return "All Time";
    }
  }, [range, today, customDate, customRangeStart, customRangeEnd]);

  // helper: robust date parse (returns JS Date or null)
  const safeParseDate = (maybeDate) => {
    if (!maybeDate) return null;
    // if it's already a Date
    if (maybeDate instanceof Date && isValid(maybeDate)) return maybeDate;
    // try parseISO then fallback to new Date
    try {
      const parsed = parseISO(maybeDate);
      if (isValid(parsed)) return parsed;
    } catch {
      // ignore parse errors, fall back to Date constructor below
    }
    const fallback = new Date(maybeDate);
    return isValid(fallback) ? fallback : null;
  };

  // helper to test if date is in selected range
  const inRange = (dateObj) => {
    if (!dateObj) return false;
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
        // guard against invalid intervals
        if (!customRangeStart || !customRangeEnd) return false;
        return isWithinInterval(dateObj, { start: customRangeStart, end: customRangeEnd });
      case "all":
      default:
        return true;
    }
  };

  // ——— Do not block rendering when loading. Use empty arrays while loading so components render immediately.
  const orders = Array.isArray(ctxOrders) ? ctxOrders : [];
  const claims = Array.isArray(ctxClaims) ? ctxClaims : [];

  // ——— Filter orders & claims ———
  const filteredOrders = orders.filter((o) => {
    // guard: ensure created_at or createdAt or date field is used
    const raw = o.created_at ?? o.createdAt ?? o.date ?? null;
    const dateObj = safeParseDate(raw);
    // if date is missing, keep in 'all' but exclude for date-specific ranges
    return dateObj ? inRange(dateObj) : range === "all";
  });

  const filteredClaims = claims.filter((c) => {
    const raw = c.created_at ?? c.createdAt ?? c.date ?? null;
    const dateObj = safeParseDate(raw);
    return dateObj ? inRange(dateObj) : range === "all";
  });

  // ——— Compute summary stats ———
  const safeLower = (s = "") => (typeof s === "string" ? s.toLowerCase() : "");
  const pendingOrders = filteredOrders.filter((o) => safeLower(o.status) === "pending").length;
  const processingOrders = filteredOrders.filter((o) => safeLower(o.status) === "processing").length;
  const shippedOrders = filteredOrders.filter((o) => safeLower(o.status) === "shipped").length;
  const deliveredOrders = filteredOrders.filter((o) => safeLower(o.status) === "delivered").length;
  const cancelledOrders = filteredOrders.filter((o) => ["cancelled", "canceled"].includes(safeLower(o.status))).length;

  const totalSales = filteredOrders.reduce((sum, o) => {
    const num = Number(o.total_price ?? o.total ?? 0);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

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
    const deliveredCount = safeLower(order.status) === "delivered" ? 1 : 0;
    // claims might reference order id via order_item or orderId
    const claimsCount = filteredClaims.filter((c) => {
      // compare numeric or string ids safely
      const orderId = order.id ?? order._id ?? order.order_id;
      const claimRef = c.order_item ?? c.orderId ?? c.order_id;
      if (orderId == null || claimRef == null) return false;
      return String(orderId) === String(claimRef);
    }).length;
    const rate = deliveredCount > 0 ? (claimsCount / deliveredCount) * 100 : 0;
    return { date: order.created_at ?? order.createdAt ?? order.date ?? "", rate: Number(rate.toFixed(2)) };
  });

  const filteredReturnRateData = returnRateData.filter((d) => {
    const dt = safeParseDate(d.date);
    if (!dt) return false;
    switch (returnRange) {
      case "today":
        return isSameDay(dt, today);
      case "thisMonth":
        return isSameMonth(dt, today);
      case "thisYear":
        return isSameYear(dt, today);
      default:
        return true;
    }
  });

  // ——— Render ———
  return (
    <div className="h-screen font-poppins relative">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 p-5 bg-gray-100 ml-[80px]">
          {/* In-page loading / error strip */}
          <div className="mb-3">
            { (ordersLoading || claimsLoading) && (
              <div className="text-xs text-gray-600">Loading data — showing what's available...</div>
            )}
            { (ordersError || claimsError) && (
              <div className="text-xs text-red-600">
                {ordersError || claimsError}
              </div>
            )}
          </div>

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

                {/* The OrderTable receives filteredOrders (possibly empty) so it renders immediately */}
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
