import React, { useState, useRef, useEffect, useMemo, useContext } from 'react';
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
import { OrdersContext } from '../context/orderscontext';
import { ClaimsContext } from '../context/claimscontext';
import { DateContext } from '../context/datecontext';
import {
  getAdminPayouts,
  getProductStock,
  getBusinessWalletBalance,
} from '../api.js';

const FinanceOverview = () => {
  const { orders: contextOrders, loading: ordersLoading } = useContext(OrdersContext);
  const { claims: contextClaims, isLoading: claimsLoading } = useContext(ClaimsContext);
  const { range, setRange, customDate, setCustomDate, rangeLabel, inRange, today } = useContext(DateContext);

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

  // Data states
  const [payoutsData, setPayoutsData] = useState({ settled: 0, pending: 0, all: [] });
  
  // Separate all-time and period totals
  const [totalSalesAllTime, setTotalSalesAllTime] = useState(0);
  const [totalOrdersAllTime, setTotalOrdersAllTime] = useState(0);
  const [totalSalesThisPeriod, setTotalSalesThisPeriod] = useState(0);
  const [totalOrdersThisPeriod, setTotalOrdersThisPeriod] = useState(0);
  
  const [inventoryValue, setInventoryValue] = useState(0);
  const [refundsTotal, setRefundsTotal] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [monthlyTrends, setMonthlyTrends] = useState([]);

  // Calculate ALL-TIME totals
  useEffect(() => {
    const ordersToUse = contextOrders || [];
    
    if (ordersToUse.length > 0) {
      setTotalOrdersAllTime(ordersToUse.length);
      const totalSales = ordersToUse.reduce((sum, order) => {
        return sum + parseFloat(order.total_price || order.amount || 0);
      }, 0);
      setTotalSalesAllTime(totalSales);
    } else {
      setTotalOrdersAllTime(0);
      setTotalSalesAllTime(0);
    }
  }, [contextOrders]);

  // Calculate PERIOD-specific orders data
  const calculatePeriodOrdersData = useMemo(() => {
    const ordersToUse = contextOrders || [];

    if (!Array.isArray(ordersToUse)) {
      return { filteredOrders: [], totalSalesAmount: 0 };
    }

    const filteredOrders = ordersToUse.filter(order => {
      if (!order) return false;
      const dateStr = order.created_at || order.date;
      return inRange(dateStr);
    });

    const totalSalesAmount = filteredOrders.reduce((sum, order) => {
      return sum + parseFloat(order.total_price || order.amount || 0);
    }, 0);

    return { filteredOrders, totalSalesAmount };
  }, [contextOrders, inRange]);

  useEffect(() => {
    setTotalSalesThisPeriod(calculatePeriodOrdersData.totalSalesAmount);
    setTotalOrdersThisPeriod(calculatePeriodOrdersData.filteredOrders.length);
  }, [calculatePeriodOrdersData]);

  // Fetch payouts
  const fetchPayouts = async () => {
    try {
      const payouts = await getAdminPayouts();
      const filteredPayouts = payouts.filter(payout => {
        const dateStr = payout.created_at || payout.date;
        return inRange(dateStr);
      });

      const settled = filteredPayouts
        .filter(p => ['settled', 'completed', 'paid'].includes(p.status?.toLowerCase()))
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      const pending = filteredPayouts
        .filter(p => ['pending', 'processing'].includes(p.status?.toLowerCase()))
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      const commission = filteredPayouts
        .filter(p => ['settled', 'completed', 'paid'].includes(p.status?.toLowerCase()))
        .reduce((sum, p) => sum + (parseFloat(p.amount || 0) * 0.144), 0);

      setPayoutsData({ settled, pending, all: filteredPayouts });
      setTotalCommission(commission);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      setPayoutsData({ settled: 0, pending: 0, all: [] });
      setTotalCommission(0);
    }
  };

  // Fetch inventory value
  const fetchInventoryValue = async () => {
    try {
      const stockData = await getProductStock();
      const totalValue = stockData.reduce((sum, item) => {
        const price = parseFloat(item.price || 0);
        const quantity = parseInt(item.quantity || item.stock_quantity || 0);
        return sum + (price * quantity);
      }, 0);
      setInventoryValue(totalValue);
    } catch (error) {
      console.error('Error fetching inventory value:', error);
      setInventoryValue(0);
    }
  };

  // Calculate refunds
  const calculateRefunds = useMemo(() => {
    const returns = contextClaims || [];
    const filteredReturns = returns.filter(returnItem => {
      const dateStr = returnItem.created_at || returnItem.date;
      const isRefunded = ['approved', 'completed', 'refunded'].includes(returnItem.status?.toLowerCase());
      return inRange(dateStr) && isRefunded;
    });

    return filteredReturns.reduce((sum, r) => sum + parseFloat(r.refund_amount || r.amount || 0), 0);
  }, [contextClaims, inRange]);

  useEffect(() => {
    setRefundsTotal(calculateRefunds);
  }, [calculateRefunds]);

  // Generate monthly trends (yearly view)
  const generateMonthlyTrends = async () => {
    try {
      const payouts = await getAdminPayouts();
      const returns = contextClaims || [];

      const months = eachMonthOfInterval({
        start: startOfYear(today),
        end: endOfMonth(today)
      });

      const trends = months.map(month => {
        const monthPayouts = payouts.filter(p => {
          const dateStr = p.created_at || p.date;
          if (!dateStr) return false;
          let payoutDate;
          try {
            payoutDate = parseISO(dateStr);
            if (isNaN(payoutDate.getTime())) payoutDate = new Date(dateStr);
          } catch { return false; }
          return isSameMonth(payoutDate, month) && isSameYear(payoutDate, month) &&
                 ['settled', 'completed', 'paid'].includes(p.status?.toLowerCase());
        });

        const commission = monthPayouts.reduce((sum, p) => sum + (parseFloat(p.amount || 0) * 0.144), 0);

        const monthReturns = returns.filter(r => {
          const dateStr = r.created_at || r.date;
          if (!dateStr) return false;
          let returnDate;
          try {
            returnDate = parseISO(dateStr);
            if (isNaN(returnDate.getTime())) returnDate = new Date(dateStr);
          } catch { return false; }
          return isSameMonth(returnDate, month) && isSameYear(returnDate, month) &&
                 ['approved', 'completed', 'refunded'].includes(r.status?.toLowerCase());
        });

        const refunds = monthReturns.reduce((sum, r) => sum + parseFloat(r.refund_amount || r.amount || 0), 0);

        return {
          month: format(month, 'MMM'),
          commission: Math.round(commission),
          refunds: Math.round(refunds)
        };
      });

      setMonthlyTrends(trends);
    } catch (error) {
      console.error('Error generating monthly trends:', error);
    }
  };

  // Load all data
  useEffect(() => {
    const fetchAllData = async () => {
      setDataLoading(true);
      await Promise.all([
        fetchPayouts(),
        fetchInventoryValue(),
        generateMonthlyTrends()
      ]);
      setDataLoading(false);
    };
    fetchAllData();
  }, [range, customDate, contextOrders, contextClaims]);

  // Distribution data for pie chart (period-specific)
  const distributionData = useMemo(() => {
    const data = [
      { name: 'Sales', value: totalSalesThisPeriod, color: '#f9622c' },
      { name: 'Commission', value: totalCommission, color: '#4ade80' },
      { name: 'Payouts', value: payoutsData.settled, color: '#60a5fa' },
      { name: 'Refunds', value: refundsTotal, color: '#f87171' },
    ];
    return data.filter(item => item.value > 0);
  }, [totalSalesThisPeriod, totalCommission, payoutsData.settled, refundsTotal]);

  const totalRevenue = useMemo(() => {
    return totalSalesThisPeriod + totalCommission + payoutsData.settled + refundsTotal;
  }, [totalSalesThisPeriod, totalCommission, payoutsData.settled, refundsTotal]);

  // PIN & Balance handlers (unchanged)
  const handleEyeClick = () => {
    if (showAmount) {
      setShowAmount(false);
    } else {
      setModalOpen(true);
      setPinError('');
      setApiError('');
      setPinDigits(['', '', '', '']);
      setTimeout(() => inputRefs[0].current?.focus(), 0);
    }
  };

  const handleDigitChange = (index, value) => {
    if (/^[0-9]?$/.test(value)) {
      const newDigits = [...pinDigits];
      newDigits[index] = value;
      setPinDigits(newDigits);
      if (value && index < 3) {
        inputRefs[index + 1].current?.focus();
      }
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    const pin = pinDigits.join('');
    if (pin.length !== 4) {
      setPinError('Please enter a 4-digit PIN.');
      return;
    }

    setLoading(true);
    setPinError('');
    setApiError('');

    try {
      const balanceResponse = await getBusinessWalletBalance({ pin });
      const fetchedBalance = balanceResponse.balance;
      setBalance(`UGX ${fetchedBalance.toLocaleString()}`);
      setShowAmount(true);
      setModalOpen(false);
    } catch (error) {
      if (error.message?.includes('401') || error.message?.includes('Incorrect')) {
        setPinError('Incorrect PIN or invalid credentials.');
      } else {
        setApiError('Failed to fetch balance. Please try again later.');
      }
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

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
              value={customDate instanceof Date ? customDate.toISOString().slice(0, 10) : customDate}
              onChange={e => setCustomDate(new Date(e.target.value))}
            />
          )}
          <span className="text-gray-600 font-medium">Data for {rangeLabel}</span>
        </div>
        <div className="text-sm text-gray-700 font-medium">{format(today, "do MMMM, yyyy")}</div>
      </div>

      {/* Loading indicator */}
      {(dataLoading || ordersLoading || claimsLoading) && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <p className="text-sm text-gray-600 mt-2">Loading financial data...</p>
        </div>
      )}

      {/* Modals (Payout Details & PIN) - unchanged */}
      {payoutModalOpen && selectedPayout && (
        // ... (same payout modal code as in your original)
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* Modal content unchanged - omitted for brevity */}
        </div>
      )}

      {modalOpen && (
        // ... (same PIN modal code as before)
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {/* PIN form unchanged */}
        </div>
      )}

      {/* Stats Cards with All-Time & Period breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Admin Wallet Card */}
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
              <button onClick={handleEyeClick} aria-label={showAmount ? 'Hide amount' : 'Show amount'}>
                {showAmount ? <EyeOff size={20} className="text-gray-600" /> : <Eye size={20} className="text-gray-600" />}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-xs mb-1">Total Sales (All Time)</p>
                <p className="text-lg font-semibold text-orange-500">
                  {dataLoading || ordersLoading ? 'Loading...' : `UGX ${Math.round(totalSalesAllTime).toLocaleString()}`}
                </p>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-[9px] text-gray-400">{rangeLabel}:</p>
                  <p className="text-[11px] font-semibold text-blue-600">
                    UGX {Math.round(totalSalesThisPeriod).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Commission ({rangeLabel})</p>
                <p className="text-lg font-semibold text-green-600">
                  {dataLoading ? 'Loading...' : `UGX ${Math.round(totalCommission).toLocaleString()}`}
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
                {dataLoading ? 'Loading...' : `UGX ${Math.round(payoutsData.settled).toLocaleString()}`}
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
                {dataLoading ? 'Loading...' : `UGX ${Math.round(inventoryValue).toLocaleString()}`}
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
                {dataLoading ? 'Loading...' : `UGX ${Math.round(payoutsData.pending).toLocaleString()}`}
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
                {dataLoading || claimsLoading ? 'Loading...' : `UGX ${Math.round(refundsTotal).toLocaleString()}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== CHARTS SECTION ==================== */}
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

          {dataLoading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Loading chart data...</p>
            </div>
          ) : (
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
                  tickFormatter={(value) => `${value / 1000}k`}
                  hide={chartView === 'payouts'}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  stroke="#999"
                  tickLine={false}
                  tickFormatter={(value) => `${value / 1000}k`}
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
          )}

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
          {dataLoading || ordersLoading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : totalRevenue === 0 ? (
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

      {/* ==================== PAYOUTS TABLE ==================== */}
      <div className="border border-gray-300 rounded-lg shadow-sm bg-white p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Finance Payouts ({rangeLabel})</h3>
          <span className="text-sm text-gray-500">Commission Rate: 14.4%</span>
        </div>

        {dataLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading payouts...</p>
          </div>
        ) : payoutsData.all.length === 0 ? (
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
                          {payout.created_at ? format(parseISO(payout.created_at), 'MMM dd, yyyy') :
                           payout.date ? format(parseISO(payout.date), 'MMM dd, yyyy') : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm">{payout.vendor_name || payout.vendor || 'N/A'}</td>
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
                            ['settled', 'completed', 'paid'].includes(payout.status?.toLowerCase())
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
    </div>
  );
};

export default FinanceOverview;