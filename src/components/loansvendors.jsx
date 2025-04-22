// src/components/LoanRepayments.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  loanSettings,
  repaymentBlocks,
  repaymentHistory,
  loanApplications,
} from '../data/loandata';
import LoansModal from '../modals/loan_details';

const ITEMS_PER_PAGE = 20;
const { paymentMethods } = loanSettings;
const loanTabs = [
  'Loan Applications',    // Vendor loan applications with Pending, Rejected, or Approved status
  'Upcoming Due Loans',   // Admin overview for upcoming dues
  'Repayment History',    // Completed repayments
  'Overdue Loans',        // Loans past due
];

const LoanRepayments = () => {
  const [activeTab, setActiveTab] = useState(loanTabs[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  // Open modal with selected loan
  const openModal = (loan) => {
    setSelectedLoan(loan);
    setIsModalOpen(true);
  };

  // Close modal and reset selection
  const closeModal = () => {
    setSelectedLoan(null);
    setIsModalOpen(false);
  };

  const getDataForTab = () => {
    switch (activeTab) {
      case 'Loan Applications':
        return loanApplications.filter(
          app => ['Pending', 'Rejected', 'Approved'].includes(app.status)
        );
      case 'Upcoming Due Loans':
        return repaymentBlocks.filter(r => r.status === 'Upcoming');
      case 'Overdue Loans':
        return repaymentBlocks.filter(r => r.status === 'Overdue');
      case 'Repayment History':
        return repaymentHistory;
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
    if (activeTab === 'Loan Applications') {
      return ['Application ID', 'Vendor', 'Requested', 'Guarantor', 'Applied On', 'Status', 'Action'];
    }
    if (activeTab === 'Upcoming Due Loans') {
      return ['ID', 'Vendor (Balance)', 'Loan ID', 'Due Date', 'Days Until Due', 'Amount Due', 'Amount Paid', 'Status', 'Admin Action'];
    }
    if (activeTab === 'Overdue Loans') {
      return ['ID', 'Vendor (Balance)', 'Loan ID', 'Due Date', 'Days Overdue', 'Amount Due', 'Amount Paid', 'Status', 'Action'];
    }
    // Repayment History
    return ['ID', 'Vendor', 'Loan ID', 'Date Paid', 'Amount Paid', 'Payment Method', 'Status'];
  };

  const renderRows = () => {
    const headers = renderHeaders();
    const totalCols = headers.length;

    return pageData.map(row => (
      <tr key={row.applicationId || row.id} className="relative border-t hover:bg-gray-100 text-[10px] text-gray-800">
        {headers.map((h, i) => {
          let val;
          switch (h) {
            case 'Application ID': val = row.applicationId; break;
            case 'Vendor': val = row.vendor.name; break;
            case 'Requested': val = row.requestedAmount; break;
            case 'Guarantor': val = row.guarantor; break;
            case 'Applied On': val = row.appliedDate; break;
            case 'ID': val = row.id; break;
            case 'Vendor (Balance)': val = `${row.vendor.name} (${row.vendor.walletBalance})`; break;
            case 'Loan ID': val = row.loanId; break;
            case 'Due Date': val = row.dueDate; break;
            case 'Days Until Due': val = row.daysUntilDue; break;
            case 'Days Overdue': val = Math.abs(row.daysUntilDue); break;
            case 'Date Paid': val = row.paidDate || '-'; break;
            case 'Amount Due': val = row.amountDue; break;
            case 'Amount Paid': val = row.amountPaid || '-'; break;
            case 'Payment Method': val = row.paymentMethod || '-'; break;
            case 'Status':
              val = (
                <span
                  className={`inline-block px-2 py-1 rounded-full text-[9px] ${
                    row.status === 'Pending'
                      ? 'bg-orange-100 text-orange-900'
                      : row.status === 'Rejected'
                        ? 'bg-red-100 text-red-600'
                        : ['Approved', 'Paid', 'Upcoming'].includes(row.status)
                          ? 'bg-green-100 text-green-900'
                          : ''
                  }`}
                >
                  {row.status}
                </span>
              );
              break;
            case 'Action':
              val = (
                <button
                  onClick={() => openModal(row)}
                  className="px-2 py-1 text-gray-600 hover:underline"
                  aria-label="View Details"
                >
                  View
                </button>
              );
              break;
            case 'Admin Action':
              val = (
                <button
                  onClick={() => openModal(row)}
                  className="text-[11px] px-2 py-1 border rounded hover:bg-gray-50"
                >{row.adminAction || 'Action'}</button>
              );
              break;
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
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <select
          value={activeTab}
          onChange={e => handleTabChange(e.target.value)}
          className="text-[11px] border border-gray-300 rounded px-3 py-2 focus:outline-none"
        >
          {loanTabs.map(tab => <option key={tab} value={tab}>{tab}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto bg-white rounded">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-50 text-gray-700 text-[10px]">
            <tr>
              {renderHeaders().map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-2 text-left font-medium ${i < renderHeaders().length - 1 ? 'border-r border-gray-200' : ''}`}
                >{h}</th>
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

      {/* Modal for viewing loan details */}
      {isModalOpen && (
        <LoansModal
          isOpen={isModalOpen}
          onClose={closeModal}
          loan={selectedLoan}
        />
      )}
    </div>
  );
};

export default LoanRepayments;
