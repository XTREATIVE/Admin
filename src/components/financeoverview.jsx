import React, { useState, useRef } from 'react';
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
      // Retrieve the access token from localStorage (set during login)
      const token = localStorage.getItem('authToken');
      if (!token) {
        setApiError('You must be logged in to view the balance.');
        setLoading(false);
        return;
      }

      // Send PIN to the balance endpoint with Bearer token
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

      // Assuming balanceResponse.data contains { balance: number }
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
              <p className="text-gray-500 text-[12px]">Total Sales</p>
              <p className="text-xl font-semibold text-[#f9622c]">
                UGX 500,000
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-[12px]">Commission Earnings</p>
              <p className="text-xl font-semibold text-[#f9622c]">
                UGX 500,000
              </p>
            </div>
          </div>
        </div>

        {/* Other Metrics */}
        <div className="col-span-1 lg:col-span-2 lg:row-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Payouts Made */}
          <div className="border border-gray-300 rounded bg-white p-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <CreditCard size={20} className="text-gray-700" />
            </div>
            <div>
              <p className="text-gray-500 text-[12px]">Payouts Made</p>
              <p className="text-sm font-semibold">UGX 20,000</p>
            </div>
          </div>

          {/* Inventory Value */}
          <div className="border border-gray-300 rounded bg-white p-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Archive size={20} className="text-gray-800" />
            </div>
            <div>
              <p className="text-gray-500 text-[12px]">Inventory Value</p>
              <p className="text-sm font-semibold">UGX 2,500,000</p>
            </div>
          </div>

          {/* Pending Payouts */}
          <div className="border border-gray-300 rounded bg-white p-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Clock size={20} className="text-gray-800" />
            </div>
            <div>
              <p className="text-gray-500 text-[12px]">Pending Payouts</p>
              <p className="text-sm font-semibold">UGX 500,000</p>
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