import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Archive,
  Clock,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  DollarSign,
} from 'lucide-react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import axios from 'axios';
import {
  format,
  parseISO,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
  endOfMonth,
  eachMonthOfInterval,
  startOfYear,
} from "date-fns";

const FinanceOverview = () => {
  const [showAmount, setShowAmount] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [pinError, setPinError] = useState('');
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  const [chartView, setChartView] = useState('both');
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);

  // Date range state
  const today = useMemo(() => new Date(), []);
  const [range, setRange] = useState("thisMonth"); // Changed default to show more data
  const [customDate, setCustomDate] = useState(today);

  // Data states
  const [payoutsData, setPayoutsData] = useState({ settled: 0, pending: 0, all: [] });
  const [totalSales, setTotalSales] = useState(0);
  const [inventoryValue, setInventoryValue] = useState(0);
  const [refundsTotal, setRefundsTotal] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [dataLoading, setDataLoading] = useState(false); // Set to false for dummy data demo
  const [monthlyTrends, setMonthlyTrends] = useState([]);

  // Dummy Data (for demo purposes)
  const dummyMonthlyTrends = [
    { month: 'Jan', commission: 2450000, refunds: 180000 },
    { month: 'Feb', commission: 3120000, refunds: 220000 },
    { month: 'Mar', commission: 4280000, refunds: 310000 },
    { month: 'Apr', commission: 3950000, refunds: 280000 },
    { month: 'May', commission: 5100000, refunds: 400000 },
    { month: 'Jun', commission: 6200000, refunds: 350000 },
    { month: 'Jul', commission: 5800000, refunds: 420000 },
    { month: 'Aug', commission: 7200000, refunds: 510000 },
    { month: 'Sep', commission: 6800000, refunds: 380000 },
    { month: 'Oct', commission: 8500000, refunds: 600000 },
    { month: 'Nov', commission: 9200000, refunds: 550000 },
    { month: 'Dec', commission: 10500000, refunds: 720000 },
  ];

  const dummyPayouts = [
    { id: 101, created_at: '2025-12-20T10:00:00Z', vendor_name: 'TechHub Uganda', amount: 12500000, status: 'settled' },
    { id: 102, created_at: '2025-12-18T14:30:00Z', vendor_name: 'Fashion Palace', amount: 8900000, status: 'settled' },
    { id: 103, created_at: '2025-12-15T09:15:00Z', vendor_name: 'Home Essentials Ltd', amount: 6700000, status: 'pending' },
    { id: 104, created_at: '2025-12-10T16:45:00Z', vendor_name: 'Gadget World', amount: 15200000, status: 'settled' },
    { id: 105, created_at: '2025-12-05T11:20:00Z', vendor_name: 'Beauty Boutique', amount: 4800000, status: 'settled' },
  ];

  // Use dummy data when loading is false (for demo)
  useEffect(() => {
    if (!dataLoading) {
      setMonthlyTrends(dummyMonthlyTrends);

      const settled = dummyPayouts
        .filter(p => p.status?.toLowerCase() === 'settled')
        .reduce((sum, p) => sum + p.amount, 0);

      const pending = dummyPayouts
        .filter(p => p.status?.toLowerCase() === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);

      const commission = dummyPayouts.reduce((sum, p) => sum + (p.amount * 0.144), 0);

      setPayoutsData({ settled, pending, all: dummyPayouts });
      setTotalCommission(Math.round(commission));
      setTotalSales(98500000);
      setInventoryValue(156000000);
      setRefundsTotal(4200000);
    }
  }, [dataLoading]);

  // ... (keep all your existing helper functions: getAuthToken, rangeLabel, inRange, etc.)

  const rangeLabel = useMemo(() => {
    switch (range) {
      case "today": return "Today";
      case "thisWeek": return "This Week";
      case "thisMonth": return "This Month";
      case "thisYear": return "This Year";
      case "custom": return format(customDate, "do MMMM, yyyy");
      default: return "This Month";
    }
  }, [range, customDate]);

  // Calculate distribution data
  const distributionData = useMemo(() => {
    return [
      { name: 'Sales', value: totalSales, color: '#f9622c' },
      { name: 'Commission', value: totalCommission, color: '#4ade80' },
      { name: 'Payouts', value: payoutsData.settled, color: '#60a5fa' },
      { name: 'Refunds', value: refundsTotal, color: '#f87171' },
    ];
  }, [totalSales, totalCommission, payoutsData.settled, refundsTotal]);

  const totalRevenue = useMemo(() => {
    return totalSales + totalCommission + payoutsData.settled + Math.abs(refundsTotal);
  }, [totalSales, totalCommission, payoutsData.settled, refundsTotal]);

  // ... (keep all your handlers: handleEyeClick, handleDigitChange, handlePinSubmit, etc.)

  const handleViewPayout = (payout) => {
    setSelectedPayout(payout);
    setPayoutModalOpen(true);
  };

  return (
    <div className="w-full min-h-screen p-4 flex flex-col bg-gray-50">
      {/* Date Range Header */}
      <div className="w-full bg-white border border-gray-200 flex items-center justify-between px-4 py-3 mb-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2 text-sm">
          <select
            className="py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:border-orange-400 text-sm"
            value={range}
            onChange={e => setRange(e.target.value)}
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
              className="py-2 px-3 focus:outline-none text-sm rounded-md border border-gray-300 focus:border-orange-400"
              value={customDate.toISOString().slice(0, 10)}
              onChange={e => setCustomDate(new Date(e.target.value))}
            />
          )}
          <span className="text-gray-600 font-medium">Data for {rangeLabel}</span>
        </div>
        <div className="text-sm text-gray-700 font-medium">{format(today, "do MMMM, yyyy")}</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Admin Wallet */}
        <div className="border border-gray-300 rounded-lg shadow-sm bg-white overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold uppercase text-sm text-gray-600">Admin Wallet</span>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <DollarSign size={20} className="text-orange-500" />
              </div>
            </div>
            <div className="flex items-center space-x-2 mb-6">
              <h2 className="text-3xl font-bold">{showAmount && balance ? balance : '••••••••••'}</h2>
              <button onClick={() => setShowAmount(!showAmount)} aria-label={showAmount ? 'Hide amount' : 'Show amount'}>
                {showAmount ? <EyeOff size={20} className="text-gray-600" /> : <Eye size={20} className="text-gray-600" />}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-xs mb-1">Total Sales ({rangeLabel})</p>
                <p className="text-lg font-semibold text-orange-500">
                  UGX {totalSales.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Commission</p>
                <p className="text-lg font-semibold text-green-600">
                  UGX {Math.round(totalCommission).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Other Metrics */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="border border-gray-300 rounded-lg bg-white p-4 flex items-center space-x-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Settled Payouts ({rangeLabel})</p>
              <p className="text-lg font-semibold">
                UGX {payoutsData.settled.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="border border-gray-300 rounded-lg bg-white p-4 flex items-center space-x-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Archive size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Inventory Value</p>
              <p className="text-lg font-semibold">
                UGX {inventoryValue.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="border border-gray-300 rounded-lg bg-white p-4 flex items-center space-x-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Pending Payouts ({rangeLabel})</p>
              <p className="text-lg font-semibold">
                UGX {payoutsData.pending.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="border border-gray-300 rounded-lg bg-white p-4 flex items-center space-x-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <RefreshCw size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Refunds ({rangeLabel})</p>
              <p className="text-lg font-semibold">
                UGX {refundsTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Financial Trends Chart */}
        <div className="lg:col-span-2 border border-gray-300 rounded-lg shadow-sm bg-white p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-1">Financial Trends (This Year)</h3>
            <p className="text-sm text-gray-500">Monthly commission and refunds over time</p>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setChartView('both')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                chartView === 'both' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setChartView('balance')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                chartView === 'balance' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Commission
            </button>
            <button
              onClick={() => setChartView('payouts')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                chartView === 'payouts' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Refunds
            </button>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={monthlyTrends}>
              <defs>
                <linearGradient id="refundGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#999" tickLine={false} />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11 }}
                stroke="#999"
                tickLine={false}
                tickFormatter={(value) => `${value / 1000000}M`}
                hide={chartView === 'payouts'}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11 }}
                stroke="#999"
                tickLine={false}
                tickFormatter={(value) => `${value / 1000000}M`}
                hide={chartView === 'balance'}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                        <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.month}</p>
                        {(chartView === 'both' || chartView === 'balance') && payload.find(p => p.dataKey === 'commission') && (
                          <p className="text-sm text-gray-700">
                            Commission: <span className="font-semibold text-green-600">UGX {payload.find(p => p.dataKey === 'commission').value.toLocaleString()}</span>
                          </p>
                        )}
                        {(chartView === 'both' || chartView === 'payouts') && payload.find(p => p.dataKey === 'refunds') && (
                          <p className="text-sm text-gray-700">
                            Refunds: <span className="font-semibold text-red-600">UGX {payload.find(p => p.dataKey === 'refunds').value.toLocaleString()}</span>
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {(chartView === 'both' || chartView === 'balance') && (
                <Bar yAxisId="left" dataKey="commission" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              )}
              {(chartView === 'both' || chartView === 'payouts') && (
                <>
                  <Bar yAxisId="right" dataKey="refunds" fill="url(#refundGradient)" radius={[0, 0, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="refunds" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#ef4444' }} />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
            {(chartView === 'both' || chartView === 'balance') && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-600">Commission</span>
              </div>
            )}
            {(chartView === 'both' || chartView === 'payouts') && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-600">Refunds</span>
              </div>
            )}
          </div>
        </div>

        {/* Revenue Distribution Pie Chart */}
        <div className="border border-gray-300 rounded-lg shadow-sm bg-white p-6">
          <h3 className="text-lg font-semibold mb-4">Financial Distribution ({rangeLabel})</h3>
          {totalRevenue === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No data for selected period</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `UGX ${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {distributionData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-semibold">
                      {totalRevenue > 0 ? ((item.value / totalRevenue) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payouts Table */}
      <div className="border border-gray-300 rounded-lg shadow-sm bg-white p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Finance Payouts ({rangeLabel})</h3>
          <span className="text-sm text-gray-500">Commission Rate: 14.4%</span>
        </div>
        {payoutsData.all.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No payouts found for the selected period</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">ID</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Vendor</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Commission</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Net Payout</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payoutsData.all.map((payout) => {
                    const amount = parseFloat(payout.amount || 0);
                    const commission = amount * 0.144;
                    const netPayout = amount - commission;

                    return (
                      <tr key={payout.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">#{payout.id}</td>
                        <td className="py-3 px-4 text-sm">
                          {payout.created_at ? format(parseISO(payout.created_at), 'MMM dd, yyyy') : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm">{payout.vendor_name || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-blue-600 font-semibold">
                          UGX {amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-orange-600 font-semibold">
                          UGX {Math.round(commission).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-green-600 font-semibold">
                          UGX {Math.round(netPayout).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            payout.status?.toLowerCase() === 'settled'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {payout.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleViewPayout(payout)}
                            className="text-blue-600 text-sm hover:underline"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
              <span>Showing {payoutsData.all.length} result(s)</span>
              <div className="flex items-center space-x-2">
                <span>Page 1 of 1</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals remain unchanged */}
      {/* PIN Modal & Payout Details Modal – omitted here for brevity, but keep them as-is */}
    </div>
  );
};

export default FinanceOverview;
