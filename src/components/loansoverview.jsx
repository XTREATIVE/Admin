<<<<<<< HEAD
import React, { useEffect, useState, useContext } from 'react';
import { Users, DollarSign, Clock, RefreshCw, TrendingUp } from 'lucide-react';
import loanIcon from '../assets/money-icon.png';
import LoanRepayments from './loansvendors';
import { LoansContext } from '../context/loanscontext';

const formatUGX = (num) => (num != null ? `UGX ${num.toLocaleString('en-UG')}` : 'UGX 0');

export default function LoanOverview() {
  const { loans, loading, error } = useContext(LoansContext);
  const [stats, setStats] = useState({
    outstandingBalance: 0,
    activeLoans: 0,
    principalDisbursed: 0,
    interestEarned: 0,
    totalRepayable: 0,
    totalRepaid: 0,
    pendingApprovals: 0,
    overdueLoans: 0,
    totalSales: 0,
  });

  useEffect(() => {
    if (loading) return;

    const calculatedStats = {
      outstandingBalance: loans.reduce((sum, l) => sum + (parseFloat(l.current_balance) || 0), 0),
      activeLoans: loans.filter(l => l.status === 'Active').length,
      principalDisbursed: loans.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0),
      interestEarned: loans.reduce((sum, l) => sum + ((parseFloat(l.total_repayable) || 0) - (parseFloat(l.amount) || 0)), 0),
      totalRepayable: loans.reduce((sum, l) => sum + (parseFloat(l.total_repayable) || 0), 0),
      totalRepaid: loans.reduce((sum, l) => sum + ((parseFloat(l.total_repayable) || 0) - (parseFloat(l.current_balance) || 0)), 0),
      pendingApprovals: loans.filter(l => l.status === 'Pending').length,
      overdueLoans: loans.filter(l => l.next_payment_date && new Date(l.next_payment_date) < new Date()).length,
      totalSales: 0,
    };
    setStats(calculatedStats);

    const fetchTotalSales = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('https://api-xtreative.onrender.com/sales/analytics', {
=======
// src/context/loanscontext.jsx
import React, { createContext, useState, useEffect } from 'react';
import dayjs from 'dayjs';

export const LoansContext = createContext();

export const LoansProvider = ({ children }) => {
  const [loans, setLoans] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        console.log('Auth token exists:', !!token);  // Debug: Check if token is present

        if (!token) {
          const err = new Error('No authentication token found. Please log in.');
          console.error(err.message);
          setError(err.message);
          return;  // Exit early instead of throwing
        }

        // Fetch loans from correct endpoint (per Swagger)
        console.log('Fetching loans from:', 'https://api-xtreative.onrender.com/loan_app/loans/list/');  // Debug URL
        const loansRes = await fetch('https://api-xtreative.onrender.com/loan_app/loans/list/', {
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
<<<<<<< HEAD
        if (response.ok) {
          const data = await response.json();
          setStats(prev => ({ ...prev, totalSales: data.total_sales || data.totalAmount || 0 }));
        }
      } catch (err) {
        console.error('Sales fetch error:', err);
      }
    };
    fetchTotalSales();
  }, [loans, loading]);

  const summary = { value: stats.principalDisbursed };

  const cards = [
    { label: 'Total Active Loans', icon: Users, value: stats.activeLoans, isMonetary: false },
    { label: 'Outstanding Balance', icon: TrendingUp, value: stats.outstandingBalance, isMonetary: true },
    { label: 'Total Repaid', icon: RefreshCw, value: stats.totalRepaid, isMonetary: true },
    { label: 'Pending Approvals', icon: Clock, value: stats.pendingApprovals, isMonetary: false },
    { label: 'Overdue Loans', icon: Clock, value: stats.overdueLoans, isMonetary: false },
    // { label: 'Total Sales Amount', icon: DollarSign, value: stats.totalSales, isMonetary: true },
  ];

  if (loading) {
    return (
      <div className="w-full p-4 flex flex-col items-center justify-center h-64">
        <p className="text-gray-600">Loading loan data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 flex flex-col items-center justify-center h-64">
        <p className="text-red-600">Error: {error}</p>
        <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full p-4 flex flex-col">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 mb-6">
        <div className="col-span-1 lg:col-span-2 border rounded bg-white p-4 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">Principal Disbursed</h2>
            <img src={loanIcon} alt="Loans" className="w-10 h-10" />
          </div>
          <div className="flex items-center mt-4">
            <h1 className="text-3xl font-bold text-gray-900">{formatUGX(summary.value)}</h1>
          </div>
        </div>

        {cards.map((c, idx) => (
          <div key={idx} className="border rounded bg-white p-4 flex items-center space-x-3 shadow-sm">
            <div className="p-2 bg-gray-100 rounded-full">
              <c.icon size={20} className="text-gray-700" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className="font-semibold text-gray-900">{c.isMonetary ? formatUGX(c.value) : c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <LoanRepayments /> 
      </div>
    </div>
  );
}
=======
        console.log('Loans response status:', loansRes.status);  // Debug status
        if (!loansRes.ok) {
          const errorText = await loansRes.text();  // Get full error body
          console.error('Loans full error:', errorText);  // Debug full error
          const err = new Error(`Loans API Error ${loansRes.status}: ${loansRes.statusText} - ${errorText}`);
          setError(err.message);
          return;  // Exit early instead of throwing
        }
        const loansData = await loansRes.json();
        console.log('Loans data received:', loansData);  // Debug data
        setLoans(Array.isArray(loansData) ? loansData : []);  // Ensure array

        // Fetch vendors
        console.log('Fetching vendors from:', 'https://api-xtreative.onrender.com/vendors/list/');  // Debug URL
        const vendorsRes = await fetch('https://api-xtreative.onrender.com/vendors/list/', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Vendors response status:', vendorsRes.status);  // Debug status
        if (!vendorsRes.ok) {
          const errorText = await vendorsRes.text();
          console.error('Vendors full error:', errorText);  // Debug full error
          const err = new Error(`Vendors API Error ${vendorsRes.status}: ${vendorsRes.statusText} - ${errorText}`);
          setError(err.message);
          return;  // Exit early instead of throwing
        }
        const vendorsData = await vendorsRes.json();
        console.log('Vendors data received:', vendorsData);  // Debug data
        setVendors(Array.isArray(vendorsData) ? vendorsData : []);  // Ensure array
      } catch (err) {
        console.error('Fetch error details:', err);  // Enhanced logging
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to approve loan (fixed endpoint)
  const approveLoan = async (loanId) => {
    const currentLoading = loading;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      console.log('Approving loan ID:', loanId);  // Debug
      const response = await fetch(`https://api-xtreative.onrender.com/loan_app/${loanId}/approve/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      console.log('Approve response status:', response.status);  // Debug status
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Approve full error:', errorData);  // Debug full error
        const err = new Error(errorData.detail || `Approve API Error ${response.status}: ${response.statusText}`);
        setError(err.message);
        throw err;
      }
      const updatedLoan = await response.json();
      console.log('Updated loan:', updatedLoan);  // Debug update

      // Update loans state
      setLoans(prevLoans =>
        prevLoans.map(loan => (loan.id === loanId ? { ...loan, ...updatedLoan } : loan))
      );

      return updatedLoan;
    } catch (err) {
      console.error('Approve error details:', err);  // Enhanced logging
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Function to reject loan (fixed endpoint)
  const rejectLoan = async (loanId, rejectionReason) => {
    const currentLoading = loading;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      console.log('Rejecting loan ID:', loanId, 'Reason:', rejectionReason);  // Debug
      const response = await fetch(`https://api-xtreative.onrender.com/loan_app/${loanId}/reject/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rejection_reason: rejectionReason }),
      });

      console.log('Reject response status:', response.status);  // Debug status
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Reject full error:', errorData);  // Debug full error
        const err = new Error(errorData.detail || `Reject API Error ${response.status}: ${response.statusText}`);
        setError(err.message);
        throw err;
      }
      const updatedLoan = await response.json();
      console.log('Updated loan after reject:', updatedLoan);  // Debug update

      // Update loans state
      setLoans(prevLoans =>
        prevLoans.map(loan => (loan.id === loanId ? { ...loan, ...updatedLoan } : loan))
      );

      return updatedLoan;
    } catch (err) {
      console.error('Reject error details:', err);  // Enhanced logging
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Derive repaymentBlocks
  const repaymentBlocks = loans
    .filter(l => ['Active', 'Approved'].includes(l.status))
    .map(l => {
      const due = l.next_payment_date ? dayjs(l.next_payment_date) : null;
      const daysUntil = due ? due.diff(dayjs(), 'day') : null;
      return {
        id: l.id,
        vendor_username: l.vendor_username,
        vendor_balance: l.current_balance,
        loanId: l.id,
        dueDate: due?.format('YYYY-MM-DD') || '-',
        daysUntilDue: daysUntil,
        amountDue: l.monthly_payment || l.weekly_payment || 0,
        amountPaid: '-',
        status: daysUntil > 0 ? 'Upcoming' : daysUntil === 0 ? 'Due Today' : 'Overdue',
        adminAction: 'Manage',
        originalLoan: l,
      };
    });

  // Derive repaymentHistory
  const repaymentHistory = loans
    .filter(l => l.status === 'Completed')
    .map(l => ({
      id: l.id,
      vendor_username: l.vendor_username,
      loanId: l.id,
      paidDate: l.updated_at.split('T')[0],
      amountPaid: l.monthly_payment || l.weekly_payment || 0,
      paymentMethod: l.payment_frequency,
      status: 'Paid',
    }));

  console.log('Final loans state:', loans.length, 'loans loaded');  // Debug final state

  return (
    <LoansContext.Provider value={{ loans, vendors, loading, error, repaymentBlocks, repaymentHistory, approveLoan, rejectLoan }}>
      {children}
    </LoansContext.Provider>
  );
};
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
