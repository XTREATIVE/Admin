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
import RecentTransactions from "../components/transactions";
import { UserContext } from "../context/usercontext";

// Dummy data for the entire year (Revenue)
const monthlyRevenueData = [
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
];

// Dummy data for the entire year (Sales)
const monthlySalesData = [
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
];

// Generate realistic daily data for a given month
const generateDailyData = (yearMonth, key) => {
  const [year, month] = yearMonth.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const daily = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const monthlyVal =
      key === "revenue"
        ? monthlyRevenueData.find((d) => d.date === yearMonth)?.revenue || 0
        : monthlySalesData.find((d) => d.date === yearMonth)?.salesVolume || 0;
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

export default function AnalyticsCharts({
  formattedDate,
  vendorStats = {},
  revenueData,
  salesData,
  range,
  customDate,
}) {
  const today = useMemo(() => new Date(), []);
  const [selectedMonth, setSelectedMonth] = useState("All");

  // Pull users from context
  const { users, loadingUsers, error: errorUsers } = useContext(UserContext);

  const allRevenue = revenueData || monthlyRevenueData;
  const allSales = salesData || monthlySalesData;

  // Helper to check if a date falls in the selected range
  const inRange = (date) => {
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

  // Compute New Vendors (role === "Vendor" && joined in range)
  const newVendors = useMemo(() => {
    if (loadingUsers || errorUsers) return 0;
    return users.filter(
      (u) => u.role === "Vendor" && inRange(parseISO(u.date_joined))
    ).length;
  }, [users, loadingUsers, errorUsers, range, customDate]);

  // Prepare chart data based on selection
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

  // Format XAxis labels
  const formatXAxis = (tick) => {
    if (selectedMonth === "All") {
      const monthMap = {
        "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
        "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
        "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
      };
      const month = tick.split("-")[1];
      return monthMap[month] || tick;
    }
    return tick.split("-")[2]; // day of month
  };

  const vendorCards = [
    { label: "New Vendors", value: newVendors },
    { label: "Loan Applications", value: vendorStats.applications || 0 },
    { label: "Pending Payouts", value: vendorStats.pendingPayouts || 0 },
    { label: "Upcoming Payout", value: vendorStats.loanRequests || 0 },
  ];

  return (
    <div className="font-poppins text-[10px]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {/* Sales Chart */}
        <div className="bg-white rounded shadow p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-500 text-[12px]">
                {selectedMonth === "All"
                  ? "Monthly Sales Volume"
                  : "Daily Sales Volume"}
              </h3>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border rounded p-1 text-[10px]"
              >
                <option value="All">All Months</option>
                {allSales.map((d) => (
                  <option key={d.date} value={d.date}>
                    {d.date}
                  </option>
                ))}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 10 }}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar
                  dataKey="salesVolume"
                  fill="#f9622c"
                  name="Sales"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Chart */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-500 text-[12px]">
                {selectedMonth === "All"
                  ? "Monthly Revenue"
                  : "Daily Revenue"}
              </h3>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border rounded p-1 text-[10px]"
              >
                <option value="All">All Months</option>
                {allRevenue.map((d) => (
                  <option key={d.date} value={d.date}>
                    {d.date}
                  </option>
                ))}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 10 }}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#280300"
                  fill="#f9622c"
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendor Cards & Transactions */}
        <div>
          <div className="grid grid-cols-2 gap-2">
            {vendorCards.map((item) => (
              <div
                key={item.label}
                className="bg-white rounded shadow p-4 h-28 flex flex-col justify-center items-center"
              >
                <p className="text-[#280300] font-bold text-[18px]">
                  {item.value}
                </p>
                <p className="text-[13px] font-semibold text-gray-500">
                  {item.label}
                </p>
                <p className="text-[10px] text-green-700">
                  for {formattedDate}
                </p>
              </div>
            ))}
          </div>
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}
