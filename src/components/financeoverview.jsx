import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Archive,
  Clock,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import axios from 'axios';
import {
  format,
  parseISO,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
} from "date-fns";
import walletImage from '../assets/money-icon.png';
import FinancePayout from './finance_payouts';

const FinanceOverview = () => {
  const [showAmount, setShowAmount] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [pinError, setPinError] = useState('');
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  
  // Date range state
  const today = useMemo(() => new Date(), []);
  const [range, setRange] = useState("today");
  const [customDate, setCustomDate] = useState(today);
  
  // Data states
  const [payoutsData, setPayoutsData] = useState({ settled: 0, pending: 0 });
  const [totalSales, setTotalSales] = useState(0);
  const [inventoryValue, setInventoryValue] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  // Get auth token
  const getAuthToken = () => localStorage.getItem('authToken');

  // Date range label
  const rangeLabel = useMemo(() => {
    switch (range) {
      case "today": return "Today";
      case "thisWeek": return "This Week";
      case "thisMonth": return "This Month";
      case "thisYear": return "This Year";
      case "custom": return format(customDate, "do MMMM, yyyy");
      default: return "";
    }
  }, [range, customDate]);

  // Helper function to check if date is in selected range
  const inRange = (date) => {
    switch (range) {
      case "today": return isSameDay(date, today);
      case "thisWeek": return isSameWeek(date, today, { weekStartsOn: 1 });
      case "thisMonth": return isSameMonth(date, today);
      case "thisYear": return isSameYear(date, today);
      case "custom": return isSameDay(date, customDate);
      default: return false;
    }
  };

  // Fetch payouts data
  const fetchPayouts = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await axios.get(
        'https://api-xtreative.onrender.com/admins/payouts/',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const payouts = response.data;
      
      // Filter payouts by date range
      const filteredPayouts = payouts.filter(payout => {
        if (!payout.created_at) return false;
        const payoutDate = parseISO(payout.created_at);
        const dateObj = isNaN(payoutDate) ? new Date(payout.created_at) : payoutDate;
        return inRange(dateObj);
      });

      // Calculate settled and pending amounts
      const settled = filteredPayouts
        .filter(p => p.status?.toLowerCase() === 'settled' || p.status?.toLowerCase() === 'completed')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      
      const pending = filteredPayouts
        .filter(p => p.status?.toLowerCase() === 'pending' || p.status?.toLowerCase() === 'processing')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      setPayoutsData({ settled, pending });
    } catch (error) {
      console.error('Error fetching payouts:', error);
    }
  };

  // Fetch sales analytics
  const fetchSalesAnalytics = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await axios.get(
        'https://api-xtreative.onrender.com/sales/analytics/',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const salesData = response.data;
      
      // Filter sales by date range and calculate total
      let totalSalesAmount = 0;
      
      if (salesData.sales && Array.isArray(salesData.sales)) {
        totalSalesAmount = salesData.sales
          .filter(sale => {
            if (!sale.date) return false;
            const saleDate = parseISO(sale.date);
            const dateObj = isNaN(saleDate) ? new Date(sale.date) : saleDate;
            return inRange(dateObj);
          })
          .reduce((sum, sale) => sum + parseFloat(sale.amount || 0), 0);
      } else if (salesData.total_sales) {
        // If the API returns aggregated data, use it directly
        totalSalesAmount = parseFloat(salesData.total_sales || 0);
      }

      setTotalSales(totalSalesAmount);
    } catch (error) {
      console.error('Error fetching sales analytics:', error);
    }
  };

  // Fetch inventory/stock data
  const fetchInventoryValue = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await axios.get(
        'https://api-xtreative.onrender.com/products/listing/',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const stockData = response.data;
      
      // Calculate total inventory value
      let totalValue = 0;
      
      if (Array.isArray(stockData)) {
        totalValue = stockData.reduce((sum, item) => {
          const price = parseFloat(item.price || 0);
          const quantity = parseInt(item.quantity || 0);
          return sum + (price * quantity);
        }, 0);
      } else if (stockData.total_value) {
        totalValue = parseFloat(stockData.total_value || 0);
      }

      setInventoryValue(totalValue);
    } catch (error) {
      console.error('Error fetching inventory value:', error);
    }
  };

  // Fetch all data when component mounts or date range changes
  useEffect(() => {
    const fetchAllData = async () => {
      setDataLoading(true);
      await Promise.all([
        fetchPayouts(),
        fetchSalesAnalytics(),
        fetchInventoryValue()
      ]);
      setDataLoading(false);
    };

    fetchAllData();
  }, [range, customDate]);

  const handleEyeClick = () => {
    if (showAmount) {
      setShowAmount(false);
    } else {
      setModalOpen(true);
      setPinError('');
      setApiError('');
      setPinDigits(['', '', '', '']);
      setTimeout(() => inputRefs[0].current.focus(), 0);
    }
  };

  const handleDigitChange = (index, value) => {
    if (/^[0-9]?$/.test(value)) {
      const newDigits = [...pinDigits];
      newDigits[index] = value;
      setPinDigits(newDigits);
      if (value && index < 3) {
        inputRefs[index + 1].current.focus();
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
      const token = getAuthToken();
      if (!token) {
        setApiError('You must be logged in to view the balance.');
        setLoading(false);
        return;
      }

      const balanceResponse = await axios.post(
        'https://api-xtreative.onrender.com/wallets/business-wallet/balance/',
        { pin },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const fetchedBalance = balanceResponse.data.balance;
      setBalance(`UGX ${fetchedBalance.toLocaleString()}`);
      setShowAmount(true);
      setModalOpen(false);
    } catch (error) {
      if (error.response?.status === 401) {
        setPinError('Incorrect PIN or invalid credentials.');
      } else {
        setApiError('Failed to fetch balance. Please try again later.');
      }
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full p-4 flex flex-col">
      {/* Date Range Header */}
      <div className="w-full bg-gray-100 flex items-center justify-between px-4 py-2 mb-4 rounded">
        <div className="flex items-center space-x-2 text-[11px]">
          <select
            className="py-1 px-2 rounded border border-gray-300 focus:outline-none text-[10px]"
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
              className="py-1 px-2 focus:outline-none text-[10px] rounded border border-gray-300"
              value={customDate.toISOString().slice(0, 10)}
              onChange={e => setCustomDate(new Date(e.target.value))}
            />
          )}
          {/* <span className="text-gray-600">Data for {rangeLabel}</span> */}
        </div>
        <div className="text-[12px] text-gray-700">{format(today, "do MMMM, yyyy")}</div>
      </div>

      {/* Loading indicator */}
      {dataLoading && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">Loading financial data...</p>
        </div>
      )}

      {/* PIN Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form
            onSubmit={handlePinSubmit}
            className="bg-white rounded-lg p-8 w-96 mx-2 text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[#f9622c] flex items-center justify-center">
                <Lock size={32} className="text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Enter PIN</h3>
            <p className="text-gray-600 mb-6 text-[11px]">
              Enter your 4-digit PIN to continue
            </p>
            <div className="flex justify-center space-x-2 mb-4">
              {pinDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleDigitChange(idx, e.target.value)}
                  className="w-12 h-12 border border-gray-300 rounded-md text-center text-lg font-medium focus:border-orange-400 focus:outline-none"
                  disabled={loading}
                />
              ))}
            </div>
            {pinError && (
              <p className="text-red-600 text-[11px] mb-4">{pinError}</p>
            )}
            {apiError && (
              <p className="text-red-600 text-[11px] mb-4">{apiError}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-[#f9622c] text-white font-semibold rounded-md text-[11px] disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-4 mb-4">
        {/* Admin Wallet */}
        <div className="col-span-1 lg:col-span-2 lg:row-span-2 border border-gray-300 rounded shadow-sm bg-white overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold uppercase text-base">
                Admin Wallet
              </span>
              <img
                src={walletImage}
                alt="Admin Wallet"
                className="w-12 h-12 rounded-full"
              />
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <h2 className="text-2xl font-semibold">
                {showAmount && balance ? balance : '••••••••••'}
              </h2>
              <button
                onClick={handleEyeClick}
                aria-label={showAmount ? 'Hide amount' : 'Show amount'}
              >
                {showAmount ? (
                  <EyeOff size={20} className="text-gray-600" />
                ) : (
                  <Eye size={20} className="text-gray-600" />
                )}
              </button>
            </div>
          </div>
          <div className="bg-gray-100 p-4 flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-[12px]">Total Sales ({rangeLabel})</p>
              <p className="text-xl font-semibold text-[#f9622c]">
                {dataLoading ? 'Loading...' : `UGX ${totalSales.toLocaleString()}`}
              </p>
            </div>
          </div>
        </div>

        {/* Other Metrics */}
        <div className="col-span-1 lg:col-span-2 lg:row-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Settled Payouts */}
          <div className="border border-gray-300 rounded bg-white p-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <CreditCard size={20} className="text-gray-700" />
            </div>
            <div>
              <p className="text-gray-500 text-[12px]">Settled Payouts ({rangeLabel})</p>
              <p className="text-sm font-semibold">
                {dataLoading ? 'Loading...' : `UGX ${payoutsData.settled.toLocaleString()}`}
              </p>
            </div>
          </div>

          {/* Inventory Value */}
          <div className="border border-gray-300 rounded bg-white p-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Archive size={20} className="text-gray-800" />
            </div>
            <div>
              <p className="text-gray-500 text-[12px]">Inventory Value</p>
              <p className="text-sm font-semibold">
                {dataLoading ? 'Loading...' : `UGX ${inventoryValue.toLocaleString()}`}
              </p>
            </div>
          </div>

          {/* Pending Payouts */}
          <div className="border border-gray-300 rounded bg-white p-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Clock size={20} className="text-gray-800" />
            </div>
            <div>
              <p className="text-gray-500 text-[12px]">Pending Payouts ({rangeLabel})</p>
              <p className="text-sm font-semibold">
                {dataLoading ? 'Loading...' : `UGX ${payoutsData.pending.toLocaleString()}`}
              </p>
            </div>
          </div>

          {/* Refunds */}
          <div className="border border-gray-300 rounded bg-white p-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <RefreshCw size={20} className="text-gray-500" />
            </div>
            <div>
              <p className="text-gray-500 text-[12px]">Refunds</p>
              <p className="text-sm font-semibold">UGX 0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payouts & Transactions Table */}
      <div>
        <FinancePayout />
      </div>
    </div>
  );
};

export default FinanceOverview;