import React, { useState, useMemo, useContext } from "react";
import {
  format,
  parseISO,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
} from "date-fns";
import { motion } from "framer-motion";
import StatsCard from "../components/Cards";
import AnalyticsCharts from "../components/2cardgrid";
import { OrdersContext } from "../context/orderscontext";
import { UserContext } from "../context/usercontext";

const cardAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, type: "spring", stiffness: 120 },
  }),
};

export default function StatsCardsGrid() {
  const today = useMemo(() => new Date(), []);
  const [range, setRange] = useState("today");
  const [customDate, setCustomDate] = useState(today);

  // Orders context
  const { orders, loading: loadingOrders, error: errorOrders } = useContext(OrdersContext);
  // Users context
  const { users, loading: loadingUsers, error: errorUsers } = useContext(UserContext);

  // label for cards
  const rangeLabel = useMemo(() => {
    switch (range) {
      case "today":
        return "Today";
      case "thisWeek":
        return "This Week";
      case "thisMonth":
        return "This Month";
      case "thisYear":
        return "This Year";
      case "custom":
        return format(customDate, "do MMMM, yyyy");
      default:
        return "";
    }
  }, [range, customDate]);

  // helper: does this date fall in the selected range?
  const inRange = (date) => {
    switch (range) {
      case "today":
        return isSameDay(date, today);
      case "thisWeek":
        // week starting Monday
        return isSameWeek(date, today, { weekStartsOn: 1 });
      case "thisMonth":
        return isSameMonth(date, today);
      case "thisYear":
        return isSameYear(date, today);
      case "custom":
        return isSameDay(date, customDate);
      default:
        return false;
    }
  };

  // Orders in range
  const ordersInRange = useMemo(
    () =>
      orders.filter((o) => {
        const parsed = parseISO(o.created_at);
        const dateObj = isNaN(parsed) ? new Date(o.created_at) : parsed;
        return inRange(dateObj);
      }),
    [orders, range, today, customDate]
  );

  // Delivered orders in range
  const deliveredOrders = useMemo(
    () => ordersInRange.filter((o) => o.status?.toLowerCase() === "delivered"),
    [ordersInRange]
  );

  // New customers = only users with role "Customer" who joined in range
  const newCustomers = useMemo(
    () =>
      users.filter((u) => {
        if (u.role !== "Customer" || !u.date_joined) return false;
        const dt = parseISO(u.date_joined);
        return inRange(isNaN(dt) ? new Date(u.date_joined) : dt);
      }).length,
    [users, range, today, customDate]
  );

  // Totals
  const totalOrders = ordersInRange.length;
  const totalSales = deliveredOrders.reduce(
    (sum, o) => sum + parseFloat(o.total_price || "0"),
    0
  );

  // Stats array
  const statsData = [
    {
      title: "Total Sales",
      value: `UGX ${totalSales.toLocaleString()}`,
      timeframe: `for ${rangeLabel}`,
    },
    {
      title: "Orders",
      value: totalOrders,
      timeframe: `for ${rangeLabel}`,
    },
    {
      title: "New Customers",
      value: newCustomers,
      timeframe: `for ${rangeLabel}`,
    },
    {
      title: "Total Earnings",
      value: `UGX ${162000}`,
      timeframe: `for ${rangeLabel}`,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="w-full bg-gray-100 flex items-center justify-between px-4 py-1">
        <div className="flex items-center space-x-2 text-[10px]">
          <select
            className="py-1 px-2 rounded border border-gray-300 focus:outline-none"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="thisYear">This Year</option>
            <option value="custom">Custom Date</option>
          </select>
          {range === "custom" && (
            <input
              type="date"
              className="py-1 px-2 focus:outline-none"
              value={customDate.toISOString().slice(0, 10)}
              onChange={(e) => setCustomDate(new Date(e.target.value))}
            />
          )}
        </div>
        <div className="text-[12px] text-gray-700">
          {format(today, "do MMMM, yyyy")}
        </div>
      </div>

      {/* Body */}
      <div className="p-2">
        {(loadingOrders || loadingUsers) && <p className="text-[11px]">Loading data...</p>}
        {errorOrders && <p className="text-red-500 text-[11px]">Orders error: {errorOrders}</p>}
        {errorUsers && <p className="text-red-500 text-[11px]">Users error: {errorUsers}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, idx) => (
            <motion.div
              key={idx}
              custom={idx}
              initial="hidden"
              animate="visible"
              variants={cardAnimation}
              className="transform hover:scale-105"
            >
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="-mt-3 p-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <AnalyticsCharts
            formattedDate={rangeLabel}
            vendorStats={{}}
            range={range}
            customDate={customDate.toISOString()}
            revenueData={null}
            salesData={null}
          />
        </motion.div>
      </div>
    </div>
  );
}
