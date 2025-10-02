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

        // Fetch loans from correct endpoint (per Swagger)
        const loansRes = await fetch('https://api-xtreative.onrender.com/loan_app/loans/list/', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!loansRes.ok) throw new Error(`Loans API Error ${loansRes.status}: ${loansRes.statusText}`);
        const loansData = await loansRes.json();
        setLoans(Array.isArray(loansData) ? loansData : []);  // Ensure array

        // Fetch vendors
        const vendorsRes = await fetch('https://api-xtreative.onrender.com/vendors/list/', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!vendorsRes.ok) throw new Error(`Vendors API Error ${vendorsRes.status}: ${vendorsRes.statusText}`);
        const vendorsData = await vendorsRes.json();
        setVendors(Array.isArray(vendorsData) ? vendorsData : []);  // Ensure array
      } catch (err) {
        console.error('Fetch error:', err);  // Log for debugging
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem('authToken')) {  // Only fetch if token exists
      fetchData();
    }
  }, []);

  // Function to approve loan (fixed endpoint)
  const approveLoan = async (loanId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://api-xtreative.onrender.com/loan_app/${loanId}/approve/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Approve API Error ${response.status}: ${response.statusText}`);
      }
      const updatedLoan = await response.json();

      // Update loans state
      setLoans(prevLoans =>
        prevLoans.map(loan => (loan.id === loanId ? { ...loan, ...updatedLoan } : loan))
      );

      return updatedLoan;
    } catch (err) {
      console.error('Approve error:', err);  // Log for debugging
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Function to reject loan (fixed endpoint)
  const rejectLoan = async (loanId, rejectionReason) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://api-xtreative.onrender.com/loan_app/${loanId}/reject/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rejection_reason: rejectionReason }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Reject API Error ${response.status}: ${response.statusText}`);
      }
      const updatedLoan = await response.json();

      // Update loans state
      setLoans(prevLoans =>
        prevLoans.map(loan => (loan.id === loanId ? { ...loan, ...updatedLoan } : loan))
      );

      return updatedLoan;
    } catch (err) {
      console.error('Reject error:', err);  // Log for debugging
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
        vendor: { name: l.vendor_username, walletBalance: l.current_balance },
        loanId: l.id,
        dueDate: due?.format('YYYY-MM-DD') || '-',
        daysUntilDue: daysUntil,
        amountDue: l.monthly_payment || l.weekly_payment || 0,
        amountPaid: '-',
        status: daysUntil > 0 ? 'Upcoming' : daysUntil === 0 ? 'Due Today' : 'Overdue',
        adminAction: 'Manage',
      };
    });

  // Derive repaymentHistory
  const repaymentHistory = loans
    .filter(l => l.status === 'Completed')
    .map(l => ({
      id: l.id,
      vendor: { name: l.vendor_username },
      loanId: l.id,
      paidDate: l.updated_at.split('T')[0],
      amountPaid: l.monthly_payment || l.weekly_payment || 0,
      paymentMethod: l.payment_frequency,
      status: 'Paid',
    }));

  return (
    <LoansContext.Provider value={{ loans, vendors, loading, error, repaymentBlocks, repaymentHistory, approveLoan, rejectLoan }}>
      {children}
    </LoansContext.Provider>
  );
};