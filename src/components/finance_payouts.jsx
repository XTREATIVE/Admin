// src/components/FinancePayouts.js
import React, { useState, useContext } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PayoutsContext } from '../context/payoutscontext';
import { tabs } from '../data/dummydata';

const ITEMS_PER_PAGE = 20;

const FinancePayouts = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const { blocks, loading, error } = useContext(PayoutsContext);

  const filterByTab = () => {
    switch (activeTab) {
      case 'Upcoming Payouts':
        return blocks.filter(b => b.status === 'Upcoming');
      case 'Pending Payouts':
        return blocks.filter(b => b.status === 'Pending');
      case 'Payout History':
        return blocks.filter(b => b.status === 'Paid');
      default:
        return [];
    }
  };

  const data = filterByTab();
  const totalPages = Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));
  const pageData = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goPrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const goNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  const renderHeaders = () => ['ID', 'Date', 'Time', 'Vendor', 'Order ID', 'Sales', 'Commission', 'Net Payout', 'Status', 'Action'];

  const renderRows = () => {
    return pageData.map(b => (
      <tr key={b.id} className="border-t hover:bg-gray-100 text-[10px]">
        {[b.id, b.date, b.time, b.vendor, b.orderid, b.sales, b.commissionAmount, b.netPayout]
          .map((c, i) => (
            <td key={i} className={`px-4 py-2 ${i !== renderHeaders().length - 1 ? 'border-r border-gray-200' : ''}`}>{c}</td>
          ))}
        <td className="px-4 py-2">
          <span
            className={`inline-block px-2 py-1 rounded-full text-[9px] ${
              b.status === 'Paid' || b.status === 'Upcoming'
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

  if (loading) return <div className='text-[11px]'>Loading payouts...</div>;
  if (error) return <div className='text-[11px]'>Error: {error}</div>;

  return (
    <div className="flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <select
          value={activeTab}
          onChange={e => { setActiveTab(e.target.value); setCurrentPage(1); }}
          className="text-[11px] border border-gray-300 rounded px-3 py-2 focus:outline-none"
        >
          {tabs.map(tab => <option key={tab} value={tab}>{tab}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto bg-white rounded">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-50 text-gray-700 text-[10px]">
            <tr>
              {renderHeaders().map(h => (
                <th key={h} className="px-4 py-2 text-left font-medium border-r border-gray-200">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>

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
