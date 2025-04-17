// src/components/FinanceOverview.jsx
import React from 'react';
import {
    ChevronDown,
    CreditCard,
    Archive,
    Clock,
    RefreshCw,
  } from 'lucide-react';
import walletImage from '../assets/money-icon.png';

const FinanceOverview = () => {
  return (
    <div className="w-full">
      {/* Use a 4x2 grid on lg: left spans 2x2, right wrapper spans 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-4">
        {/* Left card: spans 2 columns & 2 rows on lg */}
        <div className="col-span-1 lg:col-span-2 lg:row-span-2 border border-gray-300 rounded-2xl overflow-hidden shadow-sm">
          {/* Top white section */}
          <div className="bg-white p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold uppercase text-base">Admin Wallet</span>
              <img
                src={walletImage}
                alt="Admin Wallet"
                className="w-16 h-16 object-cover rounded-full"
              />
            </div>
            <h2 className="text-2xl font-semibold mb-6">UGX 50,000,000</h2>
          </div>
          {/* Bottom grey section */}
          <div className="bg-gray-100 p-6 flex justify-between items-center rounded-lg">
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

        {/* Right wrapper: spans 2 cols & 2 rows */}
        <div className="col-span-1 lg:col-span-2 lg:row-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Top-left: All income (white) */}
          <div className="border border-gray-300 rounded-2xl overflow-hidden">
            <div className="bg-white p-6 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <CreditCard size={20} className="text-gray-700" />
              </div>
              <div>
                <p className="text-gray-500 text-[12px]">Payouts Made</p>
                <p className="text-sm font-semibold">UGX 20,000</p>
              </div>
            </div>
          </div>

          {/* Top-right: Paid income (white) */}
          <div className="border border-gray-300 rounded-2xl overflow-hidden">
            <div className="bg-white p-6 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Archive size={20} className="text-gray-800" />
              </div>
              <div>
                <p className="text-gray-500 text-[12px]">Inventory Value</p>
                <p className="text-sm font-semibold">UGX 2,500,000</p>
              </div>
            </div>
          </div>

          {/* Bottom-left: Total Sales (gray) */}
          <div className="bg-gray-100 border border-gray-300 rounded-2xl overflow-hidden">
            <div className="bg-white p-6 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Clock size={20} className="text-gray-800" />
              </div>
              <div>
                <p className="text-gray-500 text-[12px]">Pending Payouts</p>
                <p className="text-sm font-semibold">UGX 500,000</p>
              </div>
            </div>
          </div>

          {/* Bottom-right: Commission Earned (gray) */}
          <div className="bg-gray-100 border border-gray-300 rounded-2xl overflow-hidden">
            <div className="bg-white p-6 flex items-center space-x-3">
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

      {/* Two placeholder cards: Payouts & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-3">
        {/* Payouts placeholder */}
        <div className="border border-gray-300 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-white p-6 h-full flex flex-col justify-center items-center">
            <p className="text-gray-500">Payouts</p>
          </div>
        </div>
        {/* Transactions placeholder */}
        <div className="border border-gray-300 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-white p-6 h-full flex flex-col justify-center items-center">
            <p className="text-gray-500">Transactions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceOverview;
