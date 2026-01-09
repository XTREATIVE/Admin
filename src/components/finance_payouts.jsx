// src/components/FinancePayouts.js
import React, { useState, useContext } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PayoutsContext } from '../context/payoutscontext';
<<<<<<< HEAD
import { tabs } from '../data/dummydata';

const ITEMS_PER_PAGE = 20;
=======
import PayoutManageModal from './PayoutManageModal';

const ITEMS_PER_PAGE = 20;
const COMMISSION_RATE = 0.18; // 18% commission rate

const tabs = ['All Payouts', 'Pending Payouts', 'Paid Payouts'];
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06

const FinancePayouts = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [currentPage, setCurrentPage] = useState(1);
<<<<<<< HEAD
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
=======
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { blocks, loading, error } = useContext(PayoutsContext);

  // Helper function to calculate commission from sales
  const calculateCommission = (salesAmount) => {
    // Parse sales amount (remove currency symbols and convert to number)
    const numericSales = typeof salesAmount === 'string' 
      ? parseFloat(salesAmount.replace(/[^\d.-]/g, '')) || 0
      : salesAmount || 0;
    
    return numericSales * COMMISSION_RATE;
  };

  // Helper function to calculate net payout (sales - commission)
  const calculateNetPayout = (salesAmount) => {
    const numericSales = typeof salesAmount === 'string' 
      ? parseFloat(salesAmount.replace(/[^\d.-]/g, '')) || 0
      : salesAmount || 0;
    
    const commission = calculateCommission(salesAmount);
    return numericSales - commission;
  };

  // Helper function to format amount in UGX currency format (same as sales)
  const formatAmount = (amount) => {
    const roundedAmount = Math.round(amount);
    return `UGX ${roundedAmount.toLocaleString()}`;
  };

  const filterByTab = () => {
    switch (activeTab) {
      case 'Pending Payouts':
        return blocks.filter(b => b.status === 'Pending' || b.status === 'pending');
      case 'Paid Payouts':
        return blocks.filter(b => b.status === 'Paid' || b.status === 'settled');
      case 'All Payouts':
      default:
        return blocks;
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
    }
  };

  const data = filterByTab();
  const totalPages = Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));
  const pageData = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goPrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const goNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

<<<<<<< HEAD
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
=======
  const handleManageClick = (payout) => {
    setSelectedPayout(payout);
    setIsModalOpen(true);
  };

  const handleModalAction = async (payoutId, actionType, note) => {
    try {
      // Here you would make an API call to your backend
      // For now, we'll just log the action
      console.log('Payout Action:', { payoutId, actionType, note });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // You would typically refresh the data here
      alert(`Payout ${actionType} successful!`);
      
    } catch (error) {
      console.error('Action failed:', error);
      throw error;
    }
  };

  const renderHeaders = () => ['ID', 'Date', 'Time', 'Vendor', 'Product', 'Sales', 'Commission (18%)', 'Net Payout', 'Payout Status', 'Action'];

  const renderRows = () => {
    if (pageData.length === 0) {
      return (
        <tr>
          <td colSpan={renderHeaders().length} className="px-4 py-8 text-center text-[11px] text-gray-500">
            No {activeTab.toLowerCase()} found
          </td>
        </tr>
      );
    }

    return pageData.map(b => {
      // Calculate accurate commission and net payout
      const calculatedCommission = calculateCommission(b.sales);
      const calculatedNetPayout = calculateNetPayout(b.sales);

      return (
        <tr key={b.id} className="border-t hover:bg-gray-50 text-[10px]">
          <td className="px-4 py-2 border-r border-gray-200">#{b.id}</td>
          <td className="px-4 py-2 border-r border-gray-200">{b.date}</td>
          <td className="px-4 py-2 border-r border-gray-200">{b.time}</td>
          <td className="px-4 py-2 border-r border-gray-200">{b.vendor}</td>
          <td className="px-4 py-2 border-r border-gray-200">{b.orderid}</td>
          <td className="px-4 py-2 border-r border-gray-200 font-semibold text-blue-600">{b.sales}</td>
          <td className="px-4 py-2 border-r border-gray-200 font-semibold text-orange-600">
            {formatAmount(calculatedCommission)}
          </td>
          <td className="px-4 py-2 border-r border-gray-200 font-bold text-green-600">
            {formatAmount(calculatedNetPayout)}
          </td>
          <td className="px-4 py-2 border-r border-gray-200">
            <span
              className={`inline-block px-2 py-1 rounded-full text-[9px] ${
                b.status === 'Paid' || b.status === 'settled'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {b.status}
            </span>
          </td>
          <td className="px-4 py-2 cursor-pointer hover:underline text-blue-600">
            {b.action === 'Manage' ? (
              <button 
                onClick={() => handleManageClick({
                  ...b,
                  calculatedCommission,
                  calculatedNetPayout
                })}
                className="text-blue-600 hover:text-blue-800"
              >
                {b.action}
              </button>
            ) : (
              b.action
            )}
          </td>
        </tr>
      );
    });
  };

  if (loading) return (
    <div className='text-center p-4 text-gray-600 text-[11px]'>
      Loading payouts...
    </div>
  );
  
  if (error) return (
    <div className='text-center p-4 text-red-600 text-[11px]'>
      Error: {error}
    </div>
  );

  return (
    <div className="flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">Finance Payouts</h3>
          <div className="text-[10px] text-gray-600 bg-blue-50 px-2 py-1 rounded">
            Commission Rate: 18%
          </div>
        </div>
        <select
          value={activeTab}
          onChange={e => { setActiveTab(e.target.value); setCurrentPage(1); }}
          className="text-[11px] border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {tabs.map(tab => <option key={tab} value={tab}>{tab}</option>)}
        </select>
        <div className="mt-2 text-[10px] text-gray-600">
          Showing {data.length} {activeTab.toLowerCase()}
        </div>
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
      </div>

      <div className="overflow-x-auto bg-white rounded">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-50 text-gray-700 text-[10px]">
            <tr>
<<<<<<< HEAD
              {renderHeaders().map(h => (
                <th key={h} className="px-4 py-2 text-left font-medium border-r border-gray-200">{h}</th>
=======
              {renderHeaders().map((h, i) => (
                <th 
                  key={h} 
                  className={`px-4 py-2 text-left font-medium ${
                    i < renderHeaders().length - 1 ? 'border-r border-gray-200' : ''
                  }`}
                >
                  {h}
                </th>
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
              ))}
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>

<<<<<<< HEAD
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-center space-x-2 text-[11px]">
        <button onClick={goPrev} disabled={currentPage === 1} className="p-1 disabled:opacity-50">
          <ChevronLeft size={16} />
        </button>
        <span>{currentPage} of {totalPages}</span>
        <button onClick={goNext} disabled={currentPage === totalPages} className="p-1 disabled:opacity-50">
          <ChevronRight size={16} />
        </button>
      </div>
=======
      {data.length > 0 && (
        <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-[11px]">
          <div className="text-gray-600">
            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, data.length)} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, data.length)} of {data.length} results
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={goPrev} 
              disabled={currentPage === 1} 
              className="p-1 disabled:opacity-50 hover:bg-gray-100 rounded"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2">{currentPage} of {totalPages}</span>
            <button 
              onClick={goNext} 
              disabled={currentPage === totalPages} 
              className="p-1 disabled:opacity-50 hover:bg-gray-100 rounded"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Payout Management Modal */}
      <PayoutManageModal
        payout={selectedPayout}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAction={handleModalAction}
      />
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
    </div>
  );
};

<<<<<<< HEAD
export default FinancePayouts;
=======
export default FinancePayouts;
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
