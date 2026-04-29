import React, { useState, useRef, useEffect, useMemo, useContext } from 'react';
import {
  Archive, Clock, RefreshCw, Eye, EyeOff, Lock,
  DollarSign, TrendingUp, AlertCircle,
} from 'lucide-react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  format, parseISO, isSameMonth, isSameYear,
  endOfMonth, eachMonthOfInterval, startOfYear,
} from 'date-fns';
import { OrdersContext } from '../context/orderscontext';
import { ClaimsContext } from '../context/claimscontext';
import { DateContext } from '../context/datecontext';
import { getProductStock } from '../api.js';

const BASE_URL = 'https://xtreativeapi.onrender.com';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('authToken')}`,
});

// Status Groups
const SETTLED = ['settled', 'completed', 'paid'];
const PENDING = ['pending payout', 'pending', 'processing'];
const REFUND = ['approved', 'completed', 'refunded'];

// Correct Resolvers based on your API
const getGross = (p) => parseFloat(p.sale_amount || p.amount || p.gross_amount || 0);
const getCommission = (p) => parseFloat(p.commission_amount || 0);
const getNetPayout = (p) => parseFloat(p.final_vendor_amount || 0);
const getCommissionRate = (p) => parseFloat(p.commission_percentage || 18.0);

const getStatus = (p) => (p.status || p.settlement_status || '').toLowerCase().trim();

const parseDate = (str) => {
  if (!str) return null;
  try {
    const d = parseISO(str);
    return isNaN(d.getTime()) ? new Date(str) : d;
  } catch {
    return new Date(str);
  }
};

const fmt = (n) => Math.round(parseFloat(n || 0)).toLocaleString('en-US');

// Load all payouts
const loadAllPayouts = async () => {
  const [r1, r2] = await Promise.allSettled([
    fetch(`${BASE_URL}/admins/payouts/`, { headers: getAuthHeaders() }),
    fetch(`${BASE_URL}/payments/payouts/`, { headers: getAuthHeaders() }),
  ]);

  const extract = async (result) => {
    if (result.status !== 'fulfilled' || !result.value.ok) return [];
    const data = await result.value.json();
    return Array.isArray(data) ? data : (data?.results ?? []);
  };

  const [a, b] = await Promise.all([extract(r1), extract(r2)]);
  const map = new Map();
  [...a, ...b].forEach((p) => {
    if (p?.id != null) map.set(String(p.id), p);
  });
  return [...map.values()];
};

const FinanceOverview = () => {
  const { orders: contextOrders, loading: ordersLoading } = useContext(OrdersContext);
  const { claims: contextClaims, isLoading: claimsLoading } = useContext(ClaimsContext);
  const { range, setRange, customDate, setCustomDate, rangeLabel, inRange, today } =
    useContext(DateContext);

  // UI States
  const [showAmount, setShowAmount] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [pinError, setPinError] = useState('');
  const [apiError, setApiError] = useState('');
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  const [chartView, setChartView] = useState('both');
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const payoutsTableRef = useRef(null);

  // Data
  const [allPayouts, setAllPayouts] = useState([]);
  const [inventoryValue, setInventoryValue] = useState(0);
  const [monthlyTrends, setMonthlyTrends] = useState([]);

  // Sales Calculations
  const totalSalesAllTime = useMemo(() =>
    (contextOrders || []).reduce((s, o) => s + parseFloat(o.total_price || o.amount || 0), 0),
    [contextOrders]
  );

  const totalSalesThisPeriod = useMemo(() => {
    return (contextOrders || []).filter((o) => inRange(o.created_at || o.date))
      .reduce((s, o) => s + parseFloat(o.total_price || o.amount || 0), 0);
  }, [contextOrders, inRange]);

  // Period Payout Stats - Fixed
  const periodPayoutStats = useMemo(() => {
    const period = allPayouts.filter((p) => {
      const d = parseDate(p.date || p.created_at);
      return d && inRange(d);
    });

    const settledAmt = period
      .filter((p) => SETTLED.includes(getStatus(p)))
      .reduce((s, p) => s + getGross(p), 0);

    const pendingAmt = period
      .filter((p) => PENDING.includes(getStatus(p)))
      .reduce((s, p) => s + getGross(p), 0);

    const commissionAmt = period.reduce((s, p) => {
      return s + (getCommission(p) || getGross(p) * getCommissionRate(p) / 100);
    }, 0);

    return { settled: settledAmt, pending: pendingAmt, commission: commissionAmt };
  }, [allPayouts, inRange]);

  // Refunds
  const refundsTotal = useMemo(() =>
    (contextClaims || [])
      .filter((r) => inRange(r.created_at || r.date) && REFUND.includes((r.status || '').toLowerCase()))
      .reduce((s, r) => s + parseFloat(r.refund_amount || r.amount || 0), 0),
    [contextClaims, inRange]
  );

  // Table Data
  const tablePayouts = useMemo(() =>
    statusFilter === 'all'
      ? allPayouts
      : allPayouts.filter((p) => getStatus(p) === statusFilter.toLowerCase()),
    [allPayouts, statusFilter]
  );

  const uniqueStatuses = useMemo(() =>
    [...new Set(allPayouts.map((p) => getStatus(p)).filter(Boolean))].sort(),
    [allPayouts]
  );

  // Load Data
  const loadPayouts = async () => {
    try {
      const data = await loadAllPayouts();
      console.log('Payouts loaded:', data.length, 'Sample:', data[0]);
      setAllPayouts(data);
    } catch (e) {
      console.error('Payout fetch error:', e);
      setAllPayouts([]);
    }
  };

  const loadInventory = async () => {
    try {
      const raw = await getProductStock();
      const arr = Array.isArray(raw) ? raw : (raw?.results ?? []);
      setInventoryValue(arr.reduce((s, i) => {
        const price = parseFloat(i.price || i.selling_price || i.unit_price || 0);
        const qty = parseInt(i.quantity || i.stock_quantity || i.stock || 0, 10);
        return s + price * qty;
      }, 0));
    } catch {
      setInventoryValue(0);
    }
  };

  const buildTrends = (payouts, claims) => {
    const months = eachMonthOfInterval({ start: startOfYear(today), end: endOfMonth(today) });
    setMonthlyTrends(months.map((month) => {
      const mp = payouts.filter((p) => {
        const d = parseDate(p.date || p.created_at);
        return d && isSameMonth(d, month) && isSameYear(d, month) && SETTLED.includes(getStatus(p));
      });

      const commission = mp.reduce((s, p) =>
        s + (getCommission(p) || getGross(p) * getCommissionRate(p) / 100), 0
      );

      const mr = (claims || []).filter((r) => {
        const d = parseDate(r.created_at || r.date);
        return d && isSameMonth(d, month) && isSameYear(d, month) && REFUND.includes((r.status || '').toLowerCase());
      });

      const refunds = mr.reduce((s, r) => s + parseFloat(r.refund_amount || r.amount || 0), 0);

      return {
        month: format(month, 'MMM'),
        commission: Math.round(commission),
        refunds: Math.round(refunds)
      };
    }));
  };

  useEffect(() => {
    const run = async () => {
      setDataLoading(true);
      await Promise.all([loadPayouts(), loadInventory()]);
      setDataLoading(false);
    };
    run();
  }, []);

  useEffect(() => {
    if (allPayouts.length > 0 || contextClaims) {
      buildTrends(allPayouts, contextClaims || []);
    }
  }, [allPayouts, contextClaims]);

  // Distribution Data
  const distributionData = useMemo(() => [
    { name: 'Sales', value: totalSalesThisPeriod, color: '#f97316' },
    { name: 'Commission', value: periodPayoutStats.commission, color: '#10b981' },
    { name: 'Payouts', value: periodPayoutStats.settled, color: '#3b82f6' },
    { name: 'Refunds', value: refundsTotal, color: '#ef4444' },
  ].filter((d) => d.value > 0), [totalSalesThisPeriod, periodPayoutStats, refundsTotal]);

  const totalRevenue = useMemo(() =>
    distributionData.reduce((s, d) => s + d.value, 0), [distributionData]
  );

  // PIN Handlers
  const handleEyeClick = () => {
    if (showAmount) { setShowAmount(false); return; }
    setModalOpen(true); setPinError(''); setApiError('');
    setPinDigits(['', '', '', '']);
    setTimeout(() => inputRefs[0].current?.focus(), 0);
  };

  const handleDigitChange = (idx, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const d = [...pinDigits]; d[idx] = value; setPinDigits(d);
    if (value && idx < 3) inputRefs[idx + 1].current?.focus();
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    const pin = pinDigits.join('');
    if (pin.length !== 4) {
      setPinError('Please enter a 4-digit PIN.');
      return;
    }
    setLoading(true); setPinError(''); setApiError('');
    try {
      const res = await fetch(`${BASE_URL}/wallets/business-wallet/balance/`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ pin }),
      });
      if (!res.ok) throw new Error(res.status === 401 ? 'Incorrect PIN' : 'Failed');
      const { balance: bal } = await res.json();
      setBalance(`UGX ${parseFloat(bal).toLocaleString()}`);
      setShowAmount(true); setModalOpen(false);
    } catch (err) {
      setPinError('Incorrect PIN or invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToPayouts = () =>
    payoutsTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { font-family: 'Outfit', sans-serif; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .stat-card { transition: all .3s cubic-bezier(.4,0,.2,1); background: white; border: 1px solid #e5e7eb; }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0,0,0,.1); border-color: #d1d5db; }
        .stat-card:hover .stat-icon { transform: scale(1.1); }
        .stat-icon { transition: transform .3s ease; }
        .btn-primary { transition: all .2s ease; background: linear-gradient(135deg,#f97316,#ea580c); box-shadow: 0 4px 6px -1px rgba(249,115,22,.3); }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(249,115,22,.4); }
        .modal-overlay { animation: fadeIn .2s ease; }
        .modal-content { animation: slideUp .3s cubic-bezier(.4,0,.2,1); }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .pin-input { transition: all .2s ease; }
        .pin-input:focus { border-color:#f97316; box-shadow:0 0 0 3px rgba(249,115,22,.1); transform:scale(1.05); }
        .table-row { transition: background-color .15s ease; }
        .table-row:hover { background-color:#f9fafb; }
        .loading-pulse { animation: pulse 2s cubic-bezier(.4,0,.6,1) infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .chart-toggle { position:relative; transition:all .2s ease; }
        .chart-toggle::after { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; background:linear-gradient(90deg,#f97316,#ea580c); transform:scaleX(0); transition:transform .2s ease; }
        .chart-toggle.active::after { transform:scaleX(1); }
        .status-badge { display:inline-flex; align-items:center; font-weight:500; letter-spacing:.025em; }
      `}</style>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Finance Overview</h1>
              <p className="text-slate-600 text-lg">Comprehensive financial analytics and insights</p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={scrollToPayouts} className="btn-primary px-6 py-3 text-white rounded-xl font-semibold text-sm flex items-center gap-2">
                <DollarSign className="w-5 h-5" /> Finance Payouts
              </button>
              <div className="text-right">
                <div className="text-sm text-slate-500 mb-1">Current Date</div>
                <div className="text-lg font-semibold text-slate-900 mono">{format(today, 'do MMMM, yyyy')}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Time Period</label>
                <select value={range} onChange={(e) => setRange(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-slate-900 font-medium">
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                  <option value="thisYear">This Year</option>
                  <option value="custom">Custom Date</option>
                </select>
              </div>
              {range === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Date</label>
                  <input type="date" value={format(customDate, 'yyyy-MM-dd')}
                    onChange={(e) => setCustomDate(new Date(e.target.value))}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white mono" />
                </div>
              )}
              <div className="flex-1 flex items-end">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-3 rounded-xl border border-orange-200">
                  <p className="text-sm text-orange-700 font-medium">
                    Summary cards: <span className="font-bold">{rangeLabel}</span>
                    <span className="ml-2 opacity-70">· Payouts table: all records</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Banner */}
        {(dataLoading || ordersLoading || claimsLoading) && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="w-6 h-6 text-blue-600 loading-pulse" />
              <div>
                <div className="font-semibold text-blue-900 mb-1">Loading Financial Data</div>
                <div className="text-sm text-blue-700">Fetching latest information...</div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Admin Wallet */}
          <div className="stat-card rounded-2xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-3 rounded-xl stat-icon">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Admin Wallet</h3>
              </div>
              <button onClick={handleEyeClick} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                {showAmount ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-2xl font-bold text-slate-900 mono mb-6">
              {showAmount && balance ? balance : '••••••••••'}
            </p>
            <div className="mb-4 pb-4 border-b border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Total Sales (All Time)</p>
              <p className="text-xl font-bold text-slate-900 mono">
                {ordersLoading ? 'Loading...' : `UGX ${Math.round(totalSalesAllTime).toLocaleString()}`}
              </p>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-orange-700 font-medium mb-1">{rangeLabel} Sales</p>
                  <p className="text-lg font-bold text-orange-600 mono">
                    {ordersLoading ? 'Loading...' : `UGX ${Math.round(totalSalesThisPeriod).toLocaleString()}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-700 font-medium mb-1">Commission</p>
                  <p className="text-lg font-bold text-green-600 mono">
                    {dataLoading ? 'Loading...' : `UGX ${Math.round(periodPayoutStats.commission).toLocaleString()}`}
                  </p>
                  <p className="text-xs text-green-600 mt-1">18% rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Settled & Pending */}
          <div className="space-y-6">
            <div className="stat-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-100 p-2.5 rounded-xl stat-icon">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Settled Payouts ({rangeLabel})
                </h3>
              </div>
              <p className="text-2xl font-bold text-slate-900 mono">
                {dataLoading ? 'Loading...' : `UGX ${Math.round(periodPayoutStats.settled).toLocaleString()}`}
              </p>
            </div>
            <div className="stat-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-amber-100 p-2.5 rounded-xl stat-icon">
                  <RefreshCw className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Pending Payouts ({rangeLabel})
                </h3>
              </div>
              <p className="text-2xl font-bold text-slate-900 mono">
                {dataLoading ? 'Loading...' : `UGX ${Math.round(periodPayoutStats.pending).toLocaleString()}`}
              </p>
            </div>
          </div>

          {/* Inventory & Refunds */}
          <div className="space-y-6">
            <div className="stat-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-100 p-2.5 rounded-xl stat-icon">
                  <Archive className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Inventory Value</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900 mono">
                {dataLoading ? 'Loading...' : `UGX ${Math.round(inventoryValue).toLocaleString()}`}
              </p>
            </div>
            <div className="stat-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-red-100 p-2.5 rounded-xl stat-icon">
                  <Lock className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Refunds ({rangeLabel})
                </h3>
              </div>
              <p className="text-2xl font-bold text-slate-900 mono">
                {claimsLoading ? 'Loading...' : `UGX ${Math.round(refundsTotal).toLocaleString()}`}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Financial Trends */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-1">Financial Trends</h3>
            <p className="text-slate-600 mb-6">Monthly commission and refunds overview</p>
            <div className="flex gap-2 mb-6">
              {[['both','Both'],['balance','Commission'],['payouts','Refunds']].map(([k,l]) => (
                <button key={k} onClick={() => setChartView(k)}
                  className={`chart-toggle px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    chartView === k
                      ? 'active bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}>{l}</button>
              ))}
            </div>
            {dataLoading ? (
              <div className="h-80 flex flex-col items-center justify-center text-slate-500">
                <TrendingUp className="w-12 h-12 mb-4 loading-pulse text-orange-500" />
                <p className="font-medium">Loading chart data...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: 13 }} />
                  <YAxis yAxisId="left" tickFormatter={(v) => `${v/1000}k`} hide={chartView==='payouts'} stroke="#64748b" style={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v/1000}k`} hide={chartView==='balance'} stroke="#64748b" style={{ fontSize: 12 }} />
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xl">
                        <p className="font-bold text-slate-900 mb-3">{payload[0].payload.month}</p>
                        {(chartView==='both'||chartView==='balance') && payload.find(p=>p.dataKey==='commission') && (
                          <p className="text-sm text-slate-700 mb-1 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                            Commission: <span className="mono font-semibold">UGX {payload.find(p=>p.dataKey==='commission').value.toLocaleString()}</span>
                          </p>
                        )}
                        {(chartView==='both'||chartView==='payouts') && payload.find(p=>p.dataKey==='refunds') && (
                          <p className="text-sm text-slate-700 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                            Refunds: <span className="mono font-semibold">UGX {payload.find(p=>p.dataKey==='refunds').value.toLocaleString()}</span>
                          </p>
                        )}
                      </div>
                    );
                  }} />
                  {(chartView==='both'||chartView==='balance') && (
                    <Line yAxisId="left" type="monotone" dataKey="commission" stroke="#10b981" strokeWidth={3}
                      dot={{ r:5, fill:'#10b981', strokeWidth:2, stroke:'#fff' }} activeDot={{ r:7 }} />
                  )}
                  {(chartView==='both'||chartView==='payouts') && (
                    <Bar yAxisId="right" dataKey="refunds" fill="#ef4444" radius={[8,8,0,0]} />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            )}
            <div className="flex items-center justify-center gap-8 mt-6 pt-6 border-t border-gray-100">
              {(chartView==='both'||chartView==='balance') && (
                <div className="flex items-center gap-3"><div className="w-4 h-4 bg-emerald-400 rounded-full" /><span className="text-sm font-medium text-slate-700">Commission</span></div>
              )}
              {(chartView==='both'||chartView==='payouts') && (
                <div className="flex items-center gap-3"><div className="w-4 h-4 bg-red-400 rounded-full" /><span className="text-sm font-medium text-slate-700">Refunds</span></div>
              )}
            </div>
          </div>

          {/* Financial Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-1">Financial Distribution</h3>
            <p className="text-slate-600 mb-6">Breakdown for {rangeLabel}</p>
            {dataLoading || ordersLoading ? (
              <div className="h-80 flex flex-col items-center justify-center text-slate-500">
                <TrendingUp className="w-12 h-12 mb-4 loading-pulse text-orange-500" />
                <p className="font-medium">Loading...</p>
              </div>
            ) : totalRevenue === 0 ? (
              <div className="h-80 flex flex-col items-center justify-center text-slate-500">
                <AlertCircle className="w-12 h-12 mb-4 text-slate-400" />
                <p className="font-medium text-slate-600">No data for selected period</p>
                <p className="text-sm text-slate-500 mt-2">Try selecting a different time range</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={distributionData} cx="50%" cy="50%" labelLine={false} outerRadius={110}
                      dataKey="value" label={({ name, value }) => `${name}: ${value.toLocaleString()}`}
                      strokeWidth={3} stroke="#fff">
                      {distributionData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `UGX ${v.toLocaleString()}`}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                  {distributionData.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-lg" style={{ backgroundColor: item.color }} />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500 mono">
                          {((item.value / totalRevenue) * 100).toFixed(1)}% · {item.value.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Payouts Table */}
        <div ref={payoutsTableRef} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 scroll-mt-20">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">Finance Payouts</h3>
              <p className="text-slate-500 text-sm">All payout records · use filter to narrow by status</p>
            </div>
            <div className="flex items-center gap-3">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white">
                <option value="all">All Statuses</option>
                {uniqueStatuses.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-2.5 rounded-xl border border-orange-200">
                <span className="text-sm font-semibold text-orange-700">Commission Rate: 18%</span>
              </div>
            </div>
          </div>

          {dataLoading ? (
            <div className="text-center py-16">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 loading-pulse text-orange-500" />
              <p className="font-medium text-slate-600">Loading payouts...</p>
            </div>
          ) : tablePayouts.length === 0 ? (
            <div className="text-center py-16">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="font-medium text-slate-600 mb-2">No payouts found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-gray-50">
                      {['ID','Date','Vendor','Gross Amount','Commission','Net Payout','Status','Action'].map((h) => (
                        <th key={h} className="text-left px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tablePayouts.map((p) => {
                      const gross = getGross(p);
                      const comm = getCommission(p) || (gross * getCommissionRate(p) / 100);
                      const net = getNetPayout(p) || (gross - comm);
                      const parsedDate = parseDate(p.date || p.created_at);

                      return (
                        <tr key={p.id} className="table-row">
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900 mono">#{p.id}</td>
                          <td className="px-6 py-4 text-sm text-slate-700 mono whitespace-nowrap">
                            {parsedDate ? format(parsedDate, 'MMM dd, yyyy') : '—'}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">
                            {p.vendor_name || p.vendor || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900 mono">
                            UGX {fmt(gross)}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-orange-600 mono">
                            UGX {fmt(comm)}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-emerald-600 mono">
                            UGX {fmt(net)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`status-badge px-3 py-1.5 rounded-lg text-xs ${
                              SETTLED.includes(getStatus(p)) ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : PENDING.includes(getStatus(p)) ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>{p.status || '—'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => { setSelectedPayout(p); setPayoutModalOpen(true); }}
                              className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payout Detail Modal */}
      {payoutModalOpen && selectedPayout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto modal-content">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Payout Details</h2>
                <button onClick={() => setPayoutModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-600 text-2xl">×</button>
              </div>
              <div className="space-y-5">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-900 text-lg mb-4">Overview</h3>
                  {[
                    ['Payout ID', `#${selectedPayout.id}`],
                    ['Status', selectedPayout.status || '—'],
                    ['Date', parseDate(selectedPayout.date || selectedPayout.created_at) ? format(parseDate(selectedPayout.date || selectedPayout.created_at), 'MMM dd, yyyy') : '—'],
                    ['Vendor', selectedPayout.vendor_name || selectedPayout.vendor || 'N/A'],
                    ['Order ID', selectedPayout.order_id || selectedPayout.order || '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">{label}</span>
                      <span className="font-semibold text-slate-900 mono">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200 space-y-3">
                  <h3 className="font-bold text-slate-900 text-lg mb-4">Financial Breakdown</h3>
                  {(() => {
                    const gross = getGross(selectedPayout);
                    const comm = getCommission(selectedPayout) || (gross * getCommissionRate(selectedPayout) / 100);
                    const net = getNetPayout(selectedPayout) || (gross - comm);
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-700">Gross Amount</span>
                          <span className="font-semibold text-slate-900 mono">UGX {fmt(gross)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-700">Commission ({getCommissionRate(selectedPayout)}%)</span>
                          <span className="font-semibold text-orange-600 mono">- UGX {fmt(comm)}</span>
                        </div>
                        <div className="flex justify-between pt-3 border-t-2 border-orange-300">
                          <span className="text-base font-bold text-slate-900">Net Payout</span>
                          <span className="text-lg font-bold text-emerald-600 mono">UGX {fmt(net)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PIN Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-overlay">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 modal-content">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Enter PIN</h2>
              <p className="text-slate-600">Enter your 4-digit PIN to view balance</p>
            </div>
            <form onSubmit={handlePinSubmit}>
              <div className="flex justify-center gap-3 mb-6">
                {pinDigits.map((digit, idx) => (
                  <input key={idx} type="text" maxLength={1} value={digit} ref={inputRefs[idx]}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    className="pin-input w-14 h-14 border-2 border-gray-300 rounded-xl text-center text-xl font-bold focus:outline-none mono"
                    disabled={loading} />
                ))}
              </div>
              {pinError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{pinError}</div>}
              {apiError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{apiError}</div>}
              <button type="submit" disabled={loading}
                className="btn-primary w-full text-white py-3.5 rounded-xl font-semibold disabled:opacity-50 text-base">
                {loading ? 'Verifying...' : 'Submit PIN'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceOverview;