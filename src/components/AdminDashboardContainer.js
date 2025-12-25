import React, { useEffect, useState } from "react";
import { authFetch } from "../api"; // adjust path if needed
import AdminDashboard from "./AdminDashboard";

/**
 * Build monthly revenue & sales from raw purchase transactions.
 * Each transaction should have: amount, timestamp/created_at.
 */
const buildMonthlyRevenueAndSales = (transactions) => {
  const map = {};

  transactions.forEach((t) => {
    const ts = t.created_at || t.timestamp || t.date;
    if (!ts) return;

    const date = new Date(ts);
    if (isNaN(date.getTime())) return;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const ym = `${year}-${month}`;

    if (!map[ym]) {
      map[ym] = { revenue: 0, salesVolume: 0 };
    }

    const amount = Number(t.amount || 0);
    map[ym].revenue += amount;
    map[ym].salesVolume += 1;
  });

  const months = Object.keys(map).sort();

  const monthlyRevenueData = months.map((ym) => ({
    date: ym,
    revenue: map[ym].revenue,
    month: new Date(`${ym}-01`).toLocaleString("default", {
      month: "short",
    }),
  }));

  const monthlySalesData = months.map((ym) => ({
    date: ym,
    salesVolume: map[ym].salesVolume,
    month: new Date(`${ym}-01`).toLocaleString("default", {
      month: "short",
    }),
  }));

  return { monthlyRevenueData, monthlySalesData };
};

const AdminDashboardContainer = () => {
  const [transactions, setTransactions] = useState([]);
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [loans, setLoans] = useState([]);

  const [revenueData, setRevenueData] = useState([]);
  const [salesData, setSalesData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Transactions → raw list (for daily stats) + monthly aggregates (for graphs)
        const txData = await authFetch(
          "/payments/transactions/?transaction_type=purchase"
        );
        const txList = Array.isArray(txData) ? txData : txData.results || [];
        setTransactions(txList);

        const { monthlyRevenueData, monthlySalesData } =
          buildMonthlyRevenueAndSales(txList);
        setRevenueData(monthlyRevenueData);
        setSalesData(monthlySalesData);

        // 2) Payouts → we keep the full pending list (we'll filter by date in the dashboard)
        const payoutsData = await authFetch("/admins/payouts/");
        setPendingPayouts(payoutsData.pending_payouts || []);

        // 3) Loans → keep full list (we'll filter by date/status in the dashboard)
        const loansData = await authFetch("/loan_app/loans/list/");
        setLoans(loansData.loans || []);

        setLoading(false);
      } catch (e) {
        console.error("Error loading dashboard data:", e);
        setError(e.message || "Failed to load dashboard data");
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <AdminDashboard
      transactions={transactions}
      pendingPayouts={pendingPayouts}
      loans={loans}
      revenueData={revenueData}
      salesData={salesData}
    />
  );
};

export default AdminDashboardContainer;