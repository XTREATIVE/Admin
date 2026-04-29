import React, { useEffect, useState, useMemo } from "react";
import { authFetch } from "../api";
import AdminDashboard from "./AdminDashboard";

/**
 * Build monthly revenue & sales from raw purchase transactions.
 * Handles null created_at by falling back to settlement_date
 */
const buildMonthlyRevenueAndSales = (transactions) => {
  const map = {};

  transactions.forEach((t) => {
    // Priority: created_at → settlement_date → timestamp → date
    const ts = t.created_at || t.settlement_date || t.timestamp || t.date;
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
    month: new Date(`${ym}-01`).toLocaleString("default", { month: "short" }),
    year: ym.split("-")[0],
  }));

  const monthlySalesData = months.map((ym) => ({
    date: ym,
    salesVolume: map[ym].salesVolume,
    month: new Date(`${ym}-01`).toLocaleString("default", { month: "short" }),
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
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch Purchase Transactions
        const txResponse = await authFetch("/payments/transactions/?transaction_type=purchase");
        const txList = Array.isArray(txResponse) ? txResponse : txResponse?.results || [];
        setTransactions(txList);

        // Build monthly data
        const { monthlyRevenueData, monthlySalesData } = buildMonthlyRevenueAndSales(txList);
        setRevenueData(monthlyRevenueData);
        setSalesData(monthlySalesData);

        // Fetch Pending Payouts
        const payoutsResponse = await authFetch("/admins/payouts/");
        setPendingPayouts(payoutsResponse?.pending_payouts || []);

        // Fetch Loans
        const loansResponse = await authFetch("/loan_app/loans/list/");
        setLoans(loansResponse?.loans || []);

      } catch (err) {
        console.error("Dashboard data load failed:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const totalRevenue = useMemo(() => {
    return transactions
      .filter(t => ["settled", "successful", "completed"].includes(t.settlement_status?.toLowerCase() || t.status?.toLowerCase()))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [transactions]);

  const thisMonthRevenue = useMemo(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    
    return revenueData
      .filter(item => item.date === currentMonth)
      .reduce((sum, item) => sum + item.revenue, 0);
  }, [revenueData]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">Error Loading Dashboard</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
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
      totalRevenue={totalRevenue}
      thisMonthRevenue={thisMonthRevenue}
    />
  );
};

export default AdminDashboardContainer;