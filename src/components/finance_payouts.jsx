// src/components/FinancePayouts.js
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { blocks, transactionHistory, tabs } from '../data/dummydata';

const ITEMS_PER_PAGE = 20;

const FinancePayouts = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [currentPage, setCurrentPage] = useState(1);

  const getDataForTab = () => {
    switch (activeTab) {
      case 'Upcoming Payouts':
        return blocks.filter(b => b.status === 'Upcoming');
      case 'Pending Payouts':
        return blocks.filter(b => b.status === 'Pending');
      case 'Payout History':
        return blocks.filter(b => b.status === 'Paid');
      case 'Transaction History':
        return transactionHistory;
      case 'Refunds':
        return blocks.filter(b => b.refund);
      default:
        return [];
    }
  };

  const data = getDataForTab();
  const totalPages = Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));

  const goPrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const goNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const pageData = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const renderHeaders = () => {
    if (activeTab === 'Transaction History') {
      return ['ID', 'Name', 'Date', 'Duration', 'User Type', 'Payment Method', 'Account', 'Type', 'Amount'];
    }
    if (activeTab === 'Refunds') {
      return ['ID', 'Date', 'Amount', 'Type'];
    }
    return ['ID', 'Date', 'Time', 'Vendor', 'Order ID', 'Sales', 'Commission', 'Net Payout', 'Status', 'Action'];
  };

  const renderRows = () => {
    const headers = renderHeaders();
    const totalColumns = headers.length;

    if (activeTab === 'Transaction History') {
      return pageData.map(tx => (
        <tr key={tx.id} className="border-t hover:bg-gray-100 text-[10px]">
          {[tx.id, tx.name, tx.date, tx.duration, tx.userType, tx.paymentMethod, tx.account, tx.type, tx.amount]
            .map((val, i) => (
              <td key={i} className={`px-4 py-2 ${i !== totalColumns - 1 ? 'border-r border-gray-200' : ''}`}>
                {val}
              </td>
            ))}
        </tr>
      ));
    }

    if (activeTab === 'Refunds') {
      return pageData.map(b => (
        <tr key={b.id} className="border-t hover:bg-gray-100 text-[10px]">
          {[b.id, b.date, b.netPayout, 'Refund']
            .map((c, i) => (
              <td key={i} className={`px-4 py-2 ${i !== totalColumns - 1 ? 'border-r border-gray-200' : ''}`}>
                {c}
              </td>
            ))}
        </tr>
      ));
    }

    return pageData.map(b => (
      <tr key={b.id} className="border-t hover:bg-gray-100 text-[10px]">
        {[b.id, b.date, b.time, b.vendor, b.orderid, b.sales, b.commissionAmount, b.netPayout]
          .map((c, i) => (
            <td key={i} className={`px-4 py-2 ${i !== totalColumns - 3 ? 'border-r border-gray-200' : ''}`}>
              {c}
            </td>
          ))}
        <td className={`px-4 py-2 ${totalColumns > 2 ? 'border-r border-gray-200' : ''}`}>
          <span
            className={`inline-block px-2 py-1 rounded-full text-[9px] ${
              ['Paid', 'Upcoming'].includes(b.status)
                ? 'bg-green-100 text-green-900'
                : 'bg-yellow-100 text-yellow-600'
            }`}
          >
            {b.status}
          </span>
        </td>
        <td className="px-4 py-2 cursor-pointer hover:underline">{b.action}</td>
      </tr>
    ));
  };

  return (
    <div className="flex flex-col">
      {/* Tab selector */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <select
          value={activeTab}
          onChange={e => handleTabChange(e.target.value)}
          className="text-[11px] border border-gray-300 rounded px-3 py-2 focus:outline-none"
        >
          {tabs.map(tab => (
            <option key={tab} value={tab}>{tab}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-50 text-gray-700 text-[10px]">
            <tr>
              {renderHeaders().map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-2 text-left font-medium ${i !== renderHeaders().length - 1 ? 'border-r border-gray-200' : ''}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-center space-x-2 text-[11px]">
        <button onClick={goPrev} disabled={currentPage === 1} className="p-1 disabled:opacity-50">
          <ChevronLeft size={16} />
        </button>
        <span>{currentPage} of {totalPages}</span>
        <button onClick={goNext} disabled={currentPage === totalPages} className="p-1 disabled:opacity-50">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default FinancePayouts;
