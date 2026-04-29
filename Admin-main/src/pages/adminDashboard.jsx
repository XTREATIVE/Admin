import React, { useState, useMemo, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  format,
  parseISO,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
} from "date-fns";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Activity,
  Wallet,
  CreditCard,
  MessageCircle,
  ChevronDown,
  RotateCcw,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

import Sidebar from "../components/sidebar";
import Header from "../components/header";
import RecentTransactions from "../components/transactions";

import { UserContext } from "../context/usercontext";
import { ClaimsContext } from "../context/claimscontext";
import { OrdersContext } from "../context/orderscontext";

import {
  getTransactions,
  getAdminPayouts,
  getLoansList,
  getVendorsList,
  getCustomersList,
} from "../api.js";

const AdminDashboard = () => {
  const today = useMemo(() => new Date(), []);

  const [range, setRange] = useState("today");
  const [customDate, setCustomDate] = useState(format(today, "yyyy-MM-dd"));

  // Data States
  const [revenueData] = useState([
    { date: "2025-01", revenue: 4000 },
    { date: "2025-02", revenue: 3000 },
    { date: "2025-03", revenue: 5000 },
    { date: "2025-04", revenue: 7000 },
    { date: "2025-05", revenue: 6000 },
    { date: "2025-06", revenue: 8000 },
    { date: "2025-07", revenue: 6500 },
    { date: "2025-08", revenue: 7200 },
    { date: "2025-09", revenue: 7800 },
    { date: "2025-10", revenue: 8200 },
    { date: "2025-11", revenue: 9000 },
    { date: "2025-12", revenue: 9500 },
  ]);

  const [salesData] = useState([
    { date: "2025-01", salesVolume: 10000 },
    { date: "2025-02", salesVolume: 8000 },
    { date: "2025-03", salesVolume: 12000 },
    { date: "2025-04", salesVolume: 18000 },
    { date: "2025-05", salesVolume: 13000 },
    { date: "2025-06", salesVolume: 17000 },
    { date: "2025-07", salesVolume: 16000 },
    { date: "2025-08", salesVolume: 18000 },
    { date: "2025-09", salesVolume: 19000 },
    { date: "2025-10", salesVolume: 20000 },
    { date: "2025-11", salesVolume: 21000 },
    { date: "2025-12", salesVolume: 22000 },
  ]);

  const [transactions, setTransactions] = useState([]);
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [loans, setLoans] = useState([]);
  const [totalVendors, setTotalVendors] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactionError, setTransactionError] = useState(null);
  const [transactionDebug, setTransactionDebug] = useState(null);

  // Contexts
  const { users = [], loadingUsers } = useContext(UserContext);
  const { claims = [], isLoading: loadingClaims } = useContext(ClaimsContext);
  const { orders = [], loading: loadingOrders } = useContext(OrdersContext);

  // ── Fetch All Dashboard Data ──────────────────────────────────────────────
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      setTransactionError(null);
      setTransactionDebug(null);

      try {
        const results = await Promise.allSettled([
          getTransactions(),
          getAdminPayouts(),
          getLoansList(),
          getVendorsList(),
          getCustomersList(),
        ]);

        // ── Transactions ──────────────────────────────────────────────────
        if (results[0].status === "fulfilled") {
          const raw = results[0].value;

          // Log the full raw response so we can see its shape
          console.log("📦 Raw transactions response:", raw);

          // Handle every possible shape the API might return
          let txData = [];
          if (Array.isArray(raw)) {
            txData = raw;
          } else if (raw && typeof raw === "object") {
            // Paginated: { results: [...] }
            if (Array.isArray(raw.results)) txData = raw.results;
            // Nested: { data: [...] }
            else if (Array.isArray(raw.data)) txData = raw.data;
            // Nested: { transactions: [...] }
            else if (Array.isArray(raw.transactions)) txData = raw.transactions;
            else {
              // Unknown shape — show it in the debug banner
              console.warn("⚠️ Unexpected transactions shape:", raw);
              setTransactionDebug(
                `Unexpected API shape. Keys: ${Object.keys(raw).join(", ")}`
              );
            }
          }

          console.log(`✅ Transactions parsed: ${txData.length} records`);
          setTransactions(txData);

          if (txData.length === 0 && !transactionDebug) {
            setTransactionDebug("API returned 0 transactions for this account.");
          }
        } else {
          const reason = results[0].reason;
          console.error("❌ getTransactions failed:", reason);
          setTransactionError(
            reason?.message || "Failed to load transactions. Check your connection."
          );
          setTransactions([]);
        }

        // ── Pending Payouts ───────────────────────────────────────────────
        if (results[1].status === "fulfilled") {
          const data = results[1].value;
          setPendingPayouts(Array.isArray(data) ? data : data?.results || []);
        } else {
          setPendingPayouts([]);
        }

        // ── Loans ─────────────────────────────────────────────────────────
        if (results[2].status === "fulfilled") {
          const data = results[2].value;
          setLoans(Array.isArray(data) ? data : data?.results || []);
        } else {
          setLoans([]);
        }

        // ── Vendors ───────────────────────────────────────────────────────
        if (results[3].status === "fulfilled") {
          const data = results[3].value;
          setTotalVendors(data.count ?? data.results?.length ?? 0);
        }

        // ── Customers ─────────────────────────────────────────────────────
        if (results[4].status === "fulfilled") {
          const data = results[4].value;
          setTotalCustomers(data.count ?? data.results?.length ?? 0);
        }
      } catch (err) {
        console.error("Critical dashboard error:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ── Date Helpers ──────────────────────────────────────────────────────────
  const parseDateSafe = (value) => {
    if (!value) return null;
    try {
      let date;
      if (value instanceof Date) date = value;
      else if (typeof value === "string") date = parseISO(value);
      else date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  const inRange = (dateValue) => {
    const parsed = parseDateSafe(dateValue);
    if (!parsed) return false;
    switch (range) {
      case "today":     return isSameDay(parsed, today);
      case "thisWeek":  return isSameWeek(parsed, today, { weekStartsOn: 1 });
      case "thisMonth": return isSameMonth(parsed, today);
      case "thisYear":  return isSameYear(parsed, today);
      case "custom":    return isSameDay(parsed, parseISO(customDate));
      default:          return true;
    }
  };

  const formattedDate = useMemo(() => {
    switch (range) {
      case "today":     return format(today, "MMMM d, yyyy");
      case "thisWeek":  return "This Week";
      case "thisMonth": return format(today, "MMMM yyyy");
      case "thisYear":  return format(today, "yyyy");
      case "custom":    return format(parseISO(customDate), "MMMM d, yyyy");
      default:          return "Today";
    }
  }, [range, customDate, today]);

  // ── Filtered Data ─────────────────────────────────────────────────────────
  const filteredTransactions = useMemo(
    () => transactions.filter((t) => inRange(t.created_at || t.timestamp || t.date)),
    [transactions, range, customDate]
  );

  const filteredOrders = useMemo(
    () => orders.filter((o) => inRange(o.created_at)),
    [orders, range, customDate]
  );

  const filteredLoans = useMemo(
    () => loans.filter((l) => inRange(l.created_at || l.applied_at)),
    [loans, range, customDate]
  );

  const filteredPendingPayouts = useMemo(
    () => pendingPayouts.filter((p) => inRange(p.settlement_date || p.created_at)),
    [pendingPayouts, range, customDate]
  );

  const filteredClaims = useMemo(
    () => claims.filter((c) => inRange(c.created_at)),
    [claims, range, customDate]
  );

  // ── Calculations ──────────────────────────────────────────────────────────
  const totalSalesThisPeriod = useMemo(
    () => filteredOrders.reduce((sum, o) => sum + Number(o.total_price || 0), 0),
    [filteredOrders]
  );

  const totalRevenueThisPeriod = useMemo(
    () => filteredTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0),
    [filteredTransactions]
  );

  const pendingPayoutsCount  = filteredPendingPayouts.length;
  const loanApplicationsCount = filteredLoans.length;
  const pendingReturnsCount  = filteredClaims.filter(
    (c) => ["requested", "pending"].includes(c.status?.toLowerCase())
  ).length;

  const newVendors = useMemo(() => {
    if (loadingUsers || !users.length) return 0;
    return users.filter((u) => u.role === "Vendor" && inRange(u.date_joined)).length;
  }, [users, loadingUsers, range, customDate]);

  const newCustomers = useMemo(() => {
    if (loadingUsers || !users.length) return 0;
    return users.filter((u) => u.role === "Customer" && inRange(u.date_joined)).length;
  }, [users, loadingUsers, range, customDate]);

  // ── Dashboard Cards ───────────────────────────────────────────────────────
  const dashboardCards = [
    { title: "New Vendors",          value: newVendors.toLocaleString(),                    icon: TrendingUp, gradient: "from-indigo-500 to-blue-500",   iconBg: "from-indigo-100 to-blue-100",   iconColor: "text-indigo-600",  change: "+12%"  },
    { title: "New Customers",        value: newCustomers.toLocaleString(),                  icon: TrendingUp, gradient: "from-pink-500 to-rose-500",     iconBg: "from-pink-100 to-rose-100",     iconColor: "text-pink-600",    change: "+18%"  },
    { title: "Total Sales",          value: `UGX ${totalSalesThisPeriod.toLocaleString()}`, icon: DollarSign, gradient: "from-violet-500 to-purple-500",  iconBg: "from-violet-100 to-purple-100", iconColor: "text-violet-600",  change: "+12.5%"},
    { title: "Total Orders",         value: filteredOrders.length.toString(),               icon: Activity,   gradient: "from-green-500 to-emerald-500",  iconBg: "from-green-100 to-emerald-100", iconColor: "text-green-600",   change: "+8.2%" },
    { title: "Earnings This Period", value: `UGX ${totalRevenueThisPeriod.toLocaleString()}`, icon: DollarSign, gradient: "from-orange-500 to-amber-500", iconBg: "from-orange-100 to-amber-100", iconColor: "text-orange-600",  change: "+15.3%"},
    { title: "Pending Payouts",      value: pendingPayoutsCount.toString(),                 icon: Wallet,     gradient: "from-red-500 to-pink-500",       iconBg: "from-red-100 to-pink-100",      iconColor: "text-red-600"                       },
    { title: "Loan Applications",    value: loanApplicationsCount.toString(),               icon: CreditCard, gradient: "from-purple-500 to-indigo-500",  iconBg: "from-purple-100 to-indigo-100", iconColor: "text-purple-600"                    },
    { title: "Pending Returns",      value: pendingReturnsCount.toString(),                 icon: RotateCcw,  gradient: "from-orange-500 to-red-500",     iconBg: "from-orange-100 to-red-100",    iconColor: "text-orange-600"                    },
  ];

  const dummyNotifications = [
    { title: "New vendor registered",    time: "5 mins ago"  },
    { title: "Customer placed an order", time: "10 mins ago" },
    { title: "New loan application",     time: "30 mins ago" },
  ];

  // ── Loading / Error screens ───────────────────────────────────────────────
  if (loading || loadingOrders) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-xl font-medium text-gray-700">Loading dashboard data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl font-medium text-red-600 mb-4">Error loading dashboard</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen font-poppins flex flex-col bg-gray-50">
      <Header
        notifications={dummyNotifications}
        currentDate={formattedDate}
        range={range}
        onRangeChange={setRange}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ml-[80px]">
          <div className="p-8">

            {/* ── Page Header ── */}
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                  Welcome back, Admin! 👋
                </h1>
                <p className="text-gray-600">
                  Here's what's happening with your platform for{" "}
                  <strong>{formattedDate}</strong>.
                </p>
              </div>

              <div className="relative">
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="appearance-none bg-white border-2 border-blue-500 rounded-lg px-6 py-3 pr-10 text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-lg"
                >
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                  <option value="thisYear">This Year</option>
                  <option value="custom">Custom Date</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 pointer-events-none" />
              </div>
            </div>

            {/* ── Custom Date Picker ── */}
            {range === "custom" && (
              <div className="mb-6 flex justify-end">
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="border-2 border-blue-500 rounded-lg px-4 py-2 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* ── Dashboard Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
              {dashboardCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div key={idx} className="relative group">
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${card.gradient} rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500`} />
                    <div className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${card.iconBg}`}>
                          <Icon className={`w-6 h-6 ${card.iconColor}`} />
                        </div>
                        {card.change && (
                          <div className="flex items-center gap-1 px-3 py-1 bg-green-50 rounded-full text-xs font-bold text-green-600">
                            <TrendingUp className="w-3.5 h-3.5" /> {card.change}
                          </div>
                        )}
                      </div>
                      <h3 className="text-gray-600 text-sm font-semibold mb-1">{card.title}</h3>
                      <p className="text-3xl font-extrabold text-gray-900 mb-1">{card.value}</p>
                      {card.title.includes("Earnings") && (
                        <p className="text-xs text-gray-500">for {formattedDate}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Charts ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 border border-gray-200/50">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Monthly Sales Volume</h2>
                <p className="text-gray-500 text-sm mb-6">Track your sales performance</p>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tickFormatter={(tick) => tick.split("-")[1]} stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip formatter={(v) => `UGX ${Number(v).toLocaleString()}`} />
                    <Bar dataKey="salesVolume" fill="#f97316" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 border border-gray-200/50">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Monthly Revenue</h2>
                <p className="text-gray-500 text-sm mb-6">Revenue performance overview</p>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tickFormatter={(tick) => tick.split("-")[1]} stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip formatter={(v) => `UGX ${Number(v).toLocaleString()}`} />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fill="#3b82f6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Recent Transactions ── */}
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 border border-gray-200/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recent Transactions</h2>
                <Link
                  to="/transactions"
                  className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* ── Hard error (API failed) ── */}
              {transactionError && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 mb-4">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">{transactionError}</p>
                    <p className="text-xs mt-1 text-red-500">
                      Check your network connection or auth token and{" "}
                      <button
                        onClick={() => window.location.reload()}
                        className="underline font-semibold"
                      >
                        retry
                      </button>
                      .
                    </p>
                  </div>
                </div>
              )}

              {/* ── Soft debug notice (wrong shape / empty) ── */}
              {!transactionError && transactionDebug && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 mb-4">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{transactionDebug}</p>
                </div>
              )}

              {/* ── Transactions list or empty state ── */}
              {!transactionError && transactions.length > 0 ? (
                filteredTransactions.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    <RecentTransactions transactions={filteredTransactions} />
                  </div>
                ) : (
                  // Transactions exist but none match the current date filter
                  <div className="text-center py-12 text-gray-500">
                    <p className="font-medium">No transactions for <strong>{formattedDate}</strong></p>
                    <p className="text-sm mt-1">
                      There are <strong>{transactions.length}</strong> total transactions — try{" "}
                      <button
                        onClick={() => setRange("thisYear")}
                        className="text-blue-600 underline font-semibold"
                      >
                        This Year
                      </button>{" "}
                      or{" "}
                      <Link to="/transactions" className="text-blue-600 underline font-semibold">
                        view all
                      </Link>
                      .
                    </p>
                  </div>
                )
              ) : !transactionError ? (
                // API returned nothing at all
                <div className="text-center py-12 text-gray-400">
                  <p className="font-medium">No transactions found on this account.</p>
                  <p className="text-sm mt-1">Transactions will appear here once payments are processed.</p>
                </div>
              ) : null}
            </div>

          </div>

          {/* ── Floating Support Button ── */}
          <div className="fixed bottom-8 right-8 z-50">
            <Link
              to="/support"
              className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-2xl hover:shadow-orange-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
              title="Support Tickets"
            >
              <MessageCircle className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;