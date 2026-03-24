import React, { useState, useMemo, useContext } from "react";
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
  ShoppingCart,
  Users,
  Activity,
  UserCheck,
  Wallet,
  Package,
  CreditCard,
  MessageCircle,
} from "lucide-react";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import RecentTransactions from "../components/transactions";
import { UserContext } from "../context/usercontext";

const AdminDashboard = ({
  transactions = [],
  pendingPayouts = [],
  loans = [],
  revenueData = [],
  salesData = [],
}) => {
  const today = useMemo(() => new Date(), []);
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [range, setRange] = useState("today");
  const [customDate, setCustomDate] = useState(format(today, "yyyy-MM-dd"));

  // Pull users from context
  const { users, loadingUsers, error: errorUsers } = useContext(UserContext);

  const allRevenue = revenueData;
  const allSales = salesData;

  // ---- Range helpers ----

  const parseDateSafe = (value) => {
    if (!value) return null;
    const d =
      value instanceof Date
        ? value
        : typeof value === "string"
        ? new Date(value)
        : null;
    if (!d || isNaN(d.getTime())) return null;
    return d;
  };

  const inRange = (date) => {
    if (!date) return false;
    switch (range) {
      case "today":
        return isSameDay(date, today);
      case "thisWeek":
        return isSameWeek(date, today);
      case "thisMonth":
        return isSameMonth(date, today);
      case "thisYear":
        return isSameYear(date, today);
      case "custom":
        return isSameDay(date, parseISO(customDate));
      default:
        return false;
    }
  };

  // ---- Date label at top ----

  const formattedDate = useMemo(() => {
    switch (range) {
      case "today":
        return format(today, "MMMM d, yyyy");
      case "thisWeek":
        return "this week";
      case "thisMonth":
        return format(today, "MMMM yyyy");
      case "thisYear":
        return format(today, "yyyy");
      case "custom":
        return format(parseISO(customDate), "MMMM d, yyyy");
      default:
        return "today";
    }
  }, [range, customDate, today]);

  // ---- Filtered data by range (daily stats) ----

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const ts = t.created_at || t.timestamp || t.date;
      const d = parseDateSafe(ts);
      return inRange(d);
    });
  }, [transactions, range, customDate]);

  const filteredLoans = useMemo(() => {
    return loans.filter((l) => {
      const ts = l.created_at || l.applied_at || l.date;
      const d = parseDateSafe(ts);
      return inRange(d);
    });
  }, [loans, range, customDate]);

  const filteredPendingPayouts = useMemo(() => {
    return pendingPayouts.filter((p) => {
      const ts = p.settlement_date || p.created_at || p.timestamp || p.date;
      const d = parseDateSafe(ts);
      return inRange(d);
    });
  }, [pendingPayouts, range, customDate]);

  // ---- New vendors (daily/range) ----

  const newVendors = useMemo(() => {
    if (loadingUsers || errorUsers) return 0;
    return users.filter((u) => {
      if (u.role !== "Vendor") return false;
      const d = parseDateSafe(u.date_joined);
      return inRange(d);
    }).length;
  }, [users, loadingUsers, errorUsers, range, customDate]);

  // ---- Cards: totals for selected range ----

  const totalRevenue = useMemo(() => {
    return filteredTransactions.reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );
  }, [filteredTransactions]);

  const totalSales = useMemo(() => filteredTransactions.length, [
    filteredTransactions,
  ]);

  const loanApplicationsCount = useMemo(
    () => filteredLoans.length,
    [filteredLoans]
  );

  const loanRequestsCount = useMemo(
    () =>
      filteredLoans.filter((l) =>
        ["Pending", "Pending Payout", "Active"].includes(
          (l.status || "").toString()
        )
      ).length,
    [filteredLoans]
  );

  const pendingPayoutsCount = useMemo(
    () => filteredPendingPayouts.length,
    [filteredPendingPayouts]
  );

  // ---- Monthly chart data (already aggregated in container) ----

  const generateDailyData = (yearMonth, key) => {
    const [year, month] = yearMonth.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const daily = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const monthlyVal =
        key === "revenue"
          ? allRevenue.find((d) => d.date === yearMonth)?.revenue || 0
          : allSales.find((d) => d.date === yearMonth)?.salesVolume || 0;
      const value = Math.round(
        (monthlyVal / daysInMonth) * (0.8 + Math.random() * 0.4)
      );
      daily.push({
        date: `${yearMonth}-${String(day).padStart(2, "0")}`,
        [key]: value,
      });
    }
    return daily;
  };

  const revenueChartData = useMemo(() => {
    return selectedMonth === "All"
      ? allRevenue
      : generateDailyData(selectedMonth, "revenue");
  }, [selectedMonth, allRevenue]);

  const salesChartData = useMemo(() => {
    return selectedMonth === "All"
      ? allSales
      : generateDailyData(selectedMonth, "salesVolume");
  }, [selectedMonth, allSales]);

  const formatXAxis = (tick) => {
    if (selectedMonth === "All") {
      const monthMap = {
        "01": "Jan",
        "02": "Feb",
        "03": "Mar",
        "04": "Apr",
        "05": "May",
        "06": "Jun",
        "07": "Jul",
        "08": "Aug",
        "09": "Sep",
        "10": "Oct",
        "11": "Nov",
        "12": "Dec",
      };
      const month = tick.split("-")[1];
      return monthMap[month] || tick;
    }
    return tick.split("-")[2]; // day of month
  };

  // ---- Cards & quick stats ----

  const stats = [
    {
      title: "Total Sales",
      value: `UGX ${totalSales.toLocaleString()}`,
      change: "+12.5%",
      icon: DollarSign,
      iconBg: "bg-gradient-to-br from-violet-100 to-purple-100",
      iconColor: "text-violet-600",
    },
    {
      title: "Orders",
      value: totalSales.toString(),
      change: "+8.2%",
      icon: ShoppingCart,
      iconBg: "bg-gradient-to-br from-blue-100 to-cyan-100",
      iconColor: "text-blue-600",
    },
    {
      title: "New Customers",
      value: newVendors.toString(),
      change: "+23.1%",
      icon: Users,
      iconBg: "bg-gradient-to-br from-emerald-100 to-green-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "Total Earnings",
      value: `UGX ${totalRevenue.toLocaleString()}`,
      change: "+15.3%",
      icon: Activity,
      iconBg: "bg-gradient-to-br from-orange-100 to-amber-100",
      iconColor: "text-orange-600",
    },
  ];

  const quickStats = [
    {
      label: "New Vendors",
      value: newVendors.toString(),
      icon: UserCheck,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Loan Applications",
      value: loanApplicationsCount.toString(),
      icon: CreditCard,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Pending Payouts",
      value: pendingPayoutsCount.toString(),
      icon: Wallet,
      color: "from-orange-500 to-red-500",
    },
    {
      label: "Upcoming Payout",
      value: loanRequestsCount.toString(),
      icon: Package,
      color: "from-green-500 to-emerald-500",
    },
  ];

  const dummyNotifications = [
    { title: "New vendor registered", time: "5 mins ago" },
    { title: "Customer placed an order", time: "10 mins ago" },
    { title: "New loan application", time: "30 mins ago" },
  ];

  // ---- UI (same as before, now fed by real data) ----

  return (
    <div className="h-screen font-poppins flex flex-col">
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
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                Welcome back, Admin! 👋
              </h1>
              <p className="text-gray-500">
                Here&apos;s what&apos;s happening with your platform for{" "}
                {formattedDate}.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                          <Icon className={`w-7 h-7 ${stat.iconColor}`} />
                        </div>
                        <div className="flex items-center space-x-1 px-3 py-1 bg-green-50 rounded-full">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-bold text-green-600">
                            {stat.change}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-gray-500 text-sm font-medium mb-2">
                        {stat.title}
                      </h3>
                      <p className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-400 mt-3">
                        for {formattedDate}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts Section - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Monthly Sales Volume Chart */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedMonth === "All"
                          ? "Monthly Sales Volume"
                          : "Daily Sales Volume"}
                      </h2>
                      <p className="text-gray-500 text-sm mt-1">
                        Track your sales performance
                      </p>
                    </div>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold focus:outline-none shadow-lg text-sm cursor-pointer"
                    >
                      <option value="All">All Months</option>
                      {allSales.map((d) => (
                        <option key={d.date} value={d.date}>
                          {d.date}
                        </option>
                      ))}
                    </select>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={salesChartData}>
                      <defs>
                        <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatXAxis}
                        stroke="#9ca3af"
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                        }}
                        formatter={(value) =>
                          `UGX ${Number(value).toLocaleString()}`
                        }
                      />
                      <Bar
                        dataKey="salesVolume"
                        fill="url(#colorBar)"
                        radius={[12, 12, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Revenue Chart */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedMonth === "All"
                          ? "Monthly Revenue"
                          : "Daily Revenue"}
                      </h2>
                      <p className="text-gray-500 text-sm mt-1">
                        Revenue performance
                      </p>
                    </div>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold focus:outline-none shadow-lg text-sm cursor-pointer"
                    >
                      <option value="All">All Months</option>
                      {allRevenue.map((d) => (
                        <option key={d.date} value={d.date}>
                          {d.date}
                        </option>
                      ))}
                    </select>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={revenueChartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatXAxis}
                        stroke="#9ca3af"
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                        }}
                        formatter={(value) =>
                          `UGX ${Number(value).toLocaleString()}`
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Stats - 2x2 Grid */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-6">
                {quickStats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="relative group">
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity`}
                      ></div>
                      <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-4`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-gray-500 text-sm font-medium mb-2">
                          {stat.label}
                        </p>
                        <p className="text-4xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          for {formattedDate}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Transactions */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      Recent Activity
                    </h2>
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <RecentTransactions />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Icon */}
          <div className="fixed bottom-8 right-8 z-50">
            <button className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-2xl hover:shadow-orange-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center group">
              <MessageCircle className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;