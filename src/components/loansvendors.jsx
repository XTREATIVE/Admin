// src/components/LoanRepayments.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { repaymentBlocks, repaymentHistory, loanTabs } from '../data/loandata';

const ITEMS_PER_PAGE = 20;

const LoanRepayments = () => {
  const [activeTab, setActiveTab] = useState(loanTabs[0]);
  const [currentPage, setCurrentPage] = useState(1);

  const getDataForTab = () => {
    switch (activeTab) {
      case 'Upcoming Repayments':
        return repaymentBlocks.filter(r => r.status === 'Upcoming');
      case 'Pending Repayments':
        return repaymentBlocks.filter(r => r.status === 'Pending');
      case 'Repayment History':
        return repaymentHistory;
      case 'Defaulted Loans':
        return repaymentBlocks.filter(r => r.status === 'Defaulted');
      default:
        return [];
    }
  };

  const data = getDataForTab();
  const totalPages = Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));

  const goPrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const goNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  const handleTabChange = tab => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const pageData = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const renderHeaders = () => {
    // Customize table headers based on tab
    if (activeTab === 'Repayment History') {
      return ['ID', 'Vendor', 'Loan ID', 'Date Paid', 'Amount Paid', 'Payment Method', 'Status'];
    }
    return ['ID', 'Vendor', 'Loan ID', 'Due Date', 'Amount Due', 'Amount Paid', 'Status', 'Action'];
  };

  const renderRows = () => {
    const headers = renderHeaders();
    const totalCols = headers.length;

    return pageData.map(row => (
      <tr key={row.id} className="border-t hover:bg-gray-100 text-[10px]">
        {headers.map((h, i) => {
          let val;
          switch (h) {
            case 'ID': val = row.id; break;
            case 'Vendor': val = row.vendor; break;
            case 'Loan ID': val = row.loanId; break;
            case 'Due Date': val = row.dueDate; break;
            case 'Date Paid': val = row.paidDate || '-'; break;
            case 'Amount Due': val = row.amountDue; break;
            case 'Amount Paid': val = row.amountPaid || '-'; break;
            case 'Payment Method': val = row.paymentMethod || '-'; break;
            case 'Status': val = <span className={`inline-block px-2 py-1 rounded-full text-[9px] ${row.status === 'Paid' || row.status === 'Upcoming' ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-600'}`}>{row.status}</span>; break;
            case 'Action': val = row.action; break;
            default: val = '-';
          }
          return (
            <td key={i} className={`px-4 py-2 ${i < totalCols - 1 ? 'border-r border-gray-200' : ''}`}>{val}</td>
          );
        })}
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
          {loanTabs.map(tab => (
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
                  className={`px-4 py-2 text-left font-medium ${i < renderHeaders().length - 1 ? 'border-r border-gray-200' : ''}`}
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

export default LoanRepayments;
