// FinanceOverview.jsx
import React from 'react';
import {
  ChevronDown,
  CreditCard,
  Archive,
  Clock,
  RefreshCw,
} from 'lucide-react';
import walletImage from '../assets/money-icon.png';
import FinancePayout from './finance_payouts';

/**
 * FinanceOverview component with scrollable container
 * Wraps the content in a scrollable div to handle overflow when there are many items
 */
const FinanceOverview = () => {
  return (
    <div className="w-full h-full max-h-screen overflow-auto p-4">
      {/* Top summary and stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-4">
        {/* Admin Wallet Card */}
        <div className="col-span-1 lg:col-span-2 lg:row-span-2 border border-gray-300 rounded overflow-hidden shadow-sm bg-white">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold uppercase text-base">Admin Wallet</span>
              <img
                src={walletImage}
                alt="Admin Wallet"
                className="w-12 h-12 object-cover rounded-full"
              />
            </div>
            <h2 className="text-2xl font-semibold mb-4">UGX 50,000,000</h2>
          </div>
          <div className="bg-gray-100 p-4 flex justify-between items-center rounded-lg">
            <div>
              <p className="text-gray-500 text-[12px]">Total Sales</p>
              <p className="text-xl font-semibold text-[#f9622c]">UGX 500,000</p>
            </div>
            <div>
              <p className="text-gray-500 text-[12px]">Commission Earnings</p>
              <p className="text-xl font-semibold text-[#f9622c]">UGX 500,000</p>
            </div>
          </div>
        </div>

        {/* Other stats */}
        <div className="col-span-1 lg:col-span-2 lg:row-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-gray-300 rounded overflow-hidden bg-white">
            <div className="p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <CreditCard size={20} className="text-gray-700" />
              </div>
              <div>
                <p className="text-gray-500 text-[12px]">Payouts Made</p>
                <p className="text-sm font-semibold">UGX 20,000</p>
              </div>
            </div>
          </div>

          <div className="border border-gray-300 rounded overflow-hidden bg-white">
            <div className="p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Archive size={20} className="text-gray-800" />
              </div>
              <div>
                <p className="text-gray-500 text-[12px]">Inventory Value</p>
                <p className="text-sm font-semibold">UGX 2,500,000</p>
              </div>
            </div>
          </div>

          <div className="border border-gray-300 rounded overflow-hidden bg-white">
            <div className="p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Clock size={20} className="text-gray-800" />
              </div>
              <div>
                <p className="text-gray-500 text-[12px]">Pending Payouts</p>
                <p className="text-sm font-semibold">UGX 500,000</p>
              </div>
            </div>
          </div>

          <div className="border border-gray-300 rounded overflow-hidden bg-white">
            <div className="p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <RefreshCw size={20} className="text-[gray-500]" />
              </div>
              <div>
                <p className="text-gray-500 text-[12px]">Refunds</p>
                <p className="text-sm font-semibold">UGX 0</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payouts & Transactions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 pt-3">
        {/* Payouts Component (scrollable list inside, if needed) */}
        <div className="overflow-auto max-h-[400px]">
          <FinancePayout />
        </div>

    
      </div>
    </div>
  );
};

export default FinanceOverview;
