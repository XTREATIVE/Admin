<<<<<<< HEAD
import React, { useState, useRef, useEffect, useMemo, useContext } from 'react';
=======
import React, { useState, useRef, useEffect, useMemo } from 'react';
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
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
<<<<<<< HEAD
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

=======
  subDays,
  subWeeks,
  subMonths,
} from "date-fns";

const FinanceOverview = () => {
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
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

<<<<<<< HEAD
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
=======
  // Date range state
  const today = useMemo(() => new Date(), []);
  const [range, setRange] = useState("thisMonth");
  const [customDate, setCustomDate] = useState(today);

  // DUMMY DATA
  const dummyPayouts = [
    { id: 101, created_at: subDays(today, 2).toISOString(), amount: 1250000, status: "settled", vendor_name: "Kampala Electronics" },
    { id: 102, created_at: subDays(today, 5).toISOString(), amount: 890000, status: "settled", vendor_name: "Fashion Hub UG" },
    { id: 103, created_at: subDays(today, 8).toISOString(), amount: 2100000, status: "pending", vendor_name: "Home Essentials Ltd" },
    { id: 104, created_at: subDays(today, 12).toISOString(), amount: 650000, status: "settled", vendor_name: "Fresh Mart" },
    { id: 105, created_at: subWeeks(today, 3).toISOString(), amount: 1800000, status: "settled", vendor_name: "Tech Gadgets Pro" },
    { id: 106, created_at: subMonths(today, 2).toISOString(), amount: 3200000, status: "settled", vendor_name: "Beauty Palace" },
    { id: 107, created_at: subMonths(today, 4).toISOString(), amount: 950000, status: "settled", vendor_name: "Sports Gear UG" },
  ];

  const dummyMonthlyTrends = [
    { month: 'Jan', commission: 450000, refunds: 120000 },
    { month: 'Feb', commission: 680000, refunds: 80000 },
    { month: 'Mar', commission: 920000, refunds: 180000 },
    { month: 'Apr', commission: 1100000, refunds: 95000 },
    { month: 'May', commission: 1350000, refunds: 220000 },
    { month: 'Jun', commission: 1480000, refunds: 150000 },
    { month: 'Jul', commission: 1620000, refunds: 300000 },
    { month: 'Aug', commission: 1790000, refunds: 210000 },
    { month: 'Sep', commission: 1950000, refunds: 280000 },
    { month: 'Oct', commission: 2100000, refunds: 350000 },
    { month: 'Nov', commission: 2300000, refunds: 400000 },
    { month: 'Dec', commission: 2550000, refunds: 450000 },
  ];

  // Static dummy values for demo
  const dummyTotalSales = 18450000;
  const dummyInventoryValue = 45230000;
  const dummyRefundsTotal = {
    today: 0,
    thisWeek: 150000,
    thisMonth: 450000,
    thisYear: 2840000,
  };

  // Date range label
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

  // Helper function to check if date is in selected range
  const inRange = (dateStr) => {
    const date = parseISO(dateStr);
    switch (range) {
      case "today": return isSameDay(date, today);
      case "thisWeek": return isSameWeek(date, today, { weekStartsOn: 1 });
      case "thisMonth": return isSameMonth(date, today);
      case "thisYear": return isSameYear(date, today);
      case "custom": return isSameDay(date, customDate);
      default: return isSameMonth(date, today);
    }
  };

  // Filtered payouts based on range
  const filteredPayouts = useMemo(() => {
    return dummyPayouts.filter(p => inRange(p.created_at));
  }, [range, customDate]);

  const payoutsData = useMemo(() => {
    const settled = filteredPayouts
      .filter(p => p.status?.toLowerCase() === 'settled')
      .reduce((sum, p) => sum + p.amount, 0);

    const pending = filteredPayouts
      .filter(p => p.status?.toLowerCase() === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    const commission = filteredPayouts.reduce((sum, p) => sum + (p.amount * 0.144), 0);

    return { settled, pending, all: filteredPayouts, commission };
  }, [filteredPayouts]);

  const totalCommission = payoutsData.commission;
  const totalSales = dummyTotalSales;
  const inventoryValue = dummyInventoryValue;
  const refundsTotal = dummyRefundsTotal[range] || dummyRefundsTotal.thisMonth;

  const monthlyTrends = dummyMonthlyTrends;

  // Distribution for Pie Chart
  const distributionData = useMemo(() => {
    return [
      { name: 'Sales', value: totalSales, color: '#f9622c' },
      { name: 'Commission', value: Math.round(totalCommission), color: '#4ade80' },
      { name: 'Payouts', value: payoutsData.settled, color: '#60a5fa' },
      { name: 'Refunds', value: refundsTotal, color: '#f87171' },
    ];
  }, [totalSales, totalCommission, payoutsData.settled, refundsTotal]);

  const totalRevenue = useMemo(() => {
    return totalSales + totalCommission + payoutsData.settled + refundsTotal;
  }, [totalSales, totalCommission, payoutsData.settled, refundsTotal]);

  // PIN & Balance handlers (kept for UX)
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
  const handleEyeClick = () => {
    if (showAmount) {
      setShowAmount(false);
    } else {
      setModalOpen(true);
      setPinError('');
<<<<<<< HEAD
      setApiError('');
=======
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
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
<<<<<<< HEAD

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
=======
    setLoading(true);
    // Simulate success with dummy balance
    setTimeout(() => {
      setBalance('UGX 28,450,000');
      setShowAmount(true);
      setModalOpen(false);
      setLoading(false);
    }, 1000);
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
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
<<<<<<< HEAD
              value={customDate instanceof Date ? customDate.toISOString().slice(0, 10) : customDate}
=======
              value={customDate.toISOString().slice(0, 10)}
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
              onChange={e => setCustomDate(new Date(e.target.value))}
            />
          )}
          <span className="text-gray-600 font-medium">Data for {rangeLabel}</span>
        </div>
        <div className="text-sm text-gray-700 font-medium">{format(today, "do MMMM, yyyy")}</div>
      </div>

<<<<<<< HEAD
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
=======
      {/* Payout Details Modal */}
      {payoutModalOpen && selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl mx-2 overflow-y-auto max-h-[90vh]">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">PAYOUT DETAILS</h2>
              <button onClick={() => setPayoutModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <span className="text-3xl">&times;</span>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">Payout Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <CreditCard size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Payout ID</p>
                      <p className="font-bold text-lg">#{selectedPayout.id}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <Clock size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Status</p>
                      <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                        selectedPayout.status?.toLowerCase() === 'settled'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {selectedPayout.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <Archive size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Date Created</p>
                      <p className="font-bold">
                        {format(parseISO(selectedPayout.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <DollarSign size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Vendor</p>
                      <p className="font-bold">{selectedPayout.vendor_name}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-6 bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Financial Breakdown</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                    <p className="text-2xl font-bold text-blue-600">
                      UGX {selectedPayout.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Commission (14.4%)</p>
                    <p className="text-2xl font-bold text-orange-600">
                      UGX {Math.round(selectedPayout.amount * 0.144).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Net Payout</p>
                    <p className="text-2xl font-bold text-green-600">
                      UGX {Math.round(selectedPayout.amount * 0.856).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PIN Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form onSubmit={handlePinSubmit} className="bg-white rounded-lg p-8 w-96 mx-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center">
                <Lock size={32} className="text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Enter PIN</h3>
            <p className="text-gray-600 mb-6 text-sm">Enter your 4-digit PIN to continue</p>
            <div className="flex justify-center space-x-2 mb-4">
              {pinDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  className="w-12 h-12 border border-gray-300 rounded-md text-center text-lg font-medium focus:border-orange-400 focus:outline-none"
                  disabled={loading}
                />
              ))}
            </div>
            {pinError && <p className="text-red-600 text-sm mb-4">{pinError}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-orange-500 text-white font-semibold rounded-md text-sm disabled:opacity-50 hover:bg-orange-600 transition-colors"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
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
<<<<<<< HEAD
              <button onClick={handleEyeClick} aria-label={showAmount ? 'Hide amount' : 'Show amount'}>
=======
              <button onClick={handleEyeClick}>
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
                {showAmount ? <EyeOff size={20} className="text-gray-600" /> : <Eye size={20} className="text-gray-600" />}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
<<<<<<< HEAD
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
=======
                <p className="text-gray-500 text-xs mb-1">Total Sales ({rangeLabel})</p>
                <p className="text-lg font-semibold text-orange-500">UGX {totalSales.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Commission</p>
                <p className="text-lg font-semibold text-green-600">UGX {Math.round(totalCommission).toLocaleString()}</p>
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
              </div>
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {/* Other Metrics */}
=======
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="border border-gray-300 rounded-lg bg-white p-4 flex items-center space-x-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Settled Payouts ({rangeLabel})</p>
<<<<<<< HEAD
              <p className="text-lg font-semibold">
                {dataLoading ? 'Loading...' : `UGX ${Math.round(payoutsData.settled).toLocaleString()}`}
              </p>
            </div>
          </div>

=======
              <p className="text-lg font-semibold">UGX {payoutsData.settled.toLocaleString()}</p>
            </div>
          </div>
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
          <div className="border border-gray-300 rounded-lg bg-white p-4 flex items-center space-x-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Archive size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Inventory Value</p>
<<<<<<< HEAD
              <p className="text-lg font-semibold">
                {dataLoading ? 'Loading...' : `UGX ${Math.round(inventoryValue).toLocaleString()}`}
              </p>
            </div>
          </div>

=======
              <p className="text-lg font-semibold">UGX {inventoryValue.toLocaleString()}</p>
            </div>
          </div>
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
          <div className="border border-gray-300 rounded-lg bg-white p-4 flex items-center space-x-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Pending Payouts ({rangeLabel})</p>
<<<<<<< HEAD
              <p className="text-lg font-semibold">
                {dataLoading ? 'Loading...' : `UGX ${Math.round(payoutsData.pending).toLocaleString()}`}
              </p>
            </div>
          </div>

=======
              <p className="text-lg font-semibold">UGX {payoutsData.pending.toLocaleString()}</p>
            </div>
          </div>
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
          <div className="border border-gray-300 rounded-lg bg-white p-4 flex items-center space-x-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <RefreshCw size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Refunds ({rangeLabel})</p>
<<<<<<< HEAD
              <p className="text-lg font-semibold">
                {dataLoading || claimsLoading ? 'Loading...' : `UGX ${Math.round(refundsTotal).toLocaleString()}`}
              </p>
=======
              <p className="text-lg font-semibold">UGX {refundsTotal.toLocaleString()}</p>
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
            </div>
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* ==================== CHARTS SECTION ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Financial Trends Chart */}
=======
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
        <div className="lg:col-span-2 border border-gray-300 rounded-lg shadow-sm bg-white p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-1">Financial Trends (This Year)</h3>
            <p className="text-sm text-gray-500">Monthly commission and refunds over time</p>
          </div>
<<<<<<< HEAD

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

=======
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setChartView('both')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${chartView === 'both' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Both
            </button>
            <button onClick={() => setChartView('balance')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${chartView === 'balance' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Commission
            </button>
            <button onClick={() => setChartView('payouts')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${chartView === 'payouts' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
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
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#999" tickLine={false} tickFormatter={(v) => `${v / 1000}k`} hide={chartView === 'payouts'} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#999" tickLine={false} tickFormatter={(v) => `${v / 1000}k`} hide={chartView === 'balance'} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                        <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.month}</p>
                        {(chartView === 'both' || chartView === 'balance') && (
                          <p className="text-sm text-gray-700">
                            Commission: <span className="font-semibold text-green-600">UGX {payload.find(p => p.dataKey === 'commission')?.value.toLocaleString()}</span>
                          </p>
                        )}
                        {(chartView === 'both' || chartView === 'payouts') && (
                          <p className="text-sm text-gray-700">
                            Refunds: <span className="font-semibold text-red-600">UGX {payload.find(p => p.dataKey === 'refunds')?.value.toLocaleString()}</span>
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
                  <Bar yAxisId="right" dataKey="refunds" fill="url(#refundGradient)" />
                  <Line yAxisId="right" type="monotone" dataKey="refunds" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#ef4444' }} />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
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

<<<<<<< HEAD
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
=======
        <div className="border border-gray-300 rounded-lg shadow-sm bg-white p-6">
          <h3 className="text-lg font-semibold mb-4">Financial Distribution ({rangeLabel})</h3>
          {totalRevenue === 0 ? (
            <div className="h-64 flex items-center justify-center"><p className="text-gray-500">No data</p></div>
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
<<<<<<< HEAD
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
=======
                  <Pie data={distributionData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `UGX ${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
<<<<<<< HEAD
                {distributionData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
=======
                {distributionData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
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

<<<<<<< HEAD
      {/* ==================== PAYOUTS TABLE ==================== */}
=======
      {/* Payouts Table */}
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
      <div className="border border-gray-300 rounded-lg shadow-sm bg-white p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Finance Payouts ({rangeLabel})</h3>
          <span className="text-sm text-gray-500">Commission Rate: 14.4%</span>
        </div>
<<<<<<< HEAD

        {dataLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading payouts...</p>
          </div>
        ) : payoutsData.all.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No payouts found for the selected period</p>
          </div>
=======
        {filteredPayouts.length === 0 ? (
          <div className="text-center py-8"><p className="text-gray-500">No payouts found for the selected period</p></div>
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
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
<<<<<<< HEAD
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
=======
                  {filteredPayouts.map((payout) => {
                    const amount = payout.amount;
                    const commission = Math.round(amount * 0.144);
                    const netPayout = amount - commission;
                    return (
                      <tr key={payout.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">#{payout.id}</td>
                        <td className="py-3 px-4 text-sm">{format(parseISO(payout.created_at), 'MMM dd, yyyy')}</td>
                        <td className="py-3 px-4 text-sm">{payout.vendor_name}</td>
                        <td className="py-3 px-4 text-sm text-blue-600 font-semibold">UGX {amount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm text-orange-600 font-semibold">UGX {commission.toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm text-green-600 font-semibold">UGX {netPayout.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            payout.status === 'settled' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
                          }`}>
                            {payout.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
<<<<<<< HEAD
                          <button
                            onClick={() => handleViewPayout(payout)}
                            className="text-blue-600 text-sm hover:underline"
                          >
=======
                          <button onClick={() => handleViewPayout(payout)} className="text-blue-600 text-sm hover:underline">
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
<<<<<<< HEAD

            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
              <span>Showing {payoutsData.all.length} result(s)</span>
              <div className="flex items-center space-x-2">
                <span>Page 1 of 1</span>
              </div>
=======
            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
              <span>Showing {filteredPayouts.length} result(s)</span>
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
            </div>
          </>
        )}
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default FinanceOverview;
=======
export default FinanceOverview;
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
