<<<<<<< HEAD
// src/context/loanscontext.jsx - Minimal Non-Crashing Version
import React, { createContext, useState, useEffect } from 'react';
=======
import React, { createContext, useState, useEffect } from 'react';
import dayjs from 'dayjs';
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06

export const LoansContext = createContext();

export const LoansProvider = ({ children }) => {
  const [loans, setLoans] = useState([]);
  const [vendors, setVendors] = useState([]);
<<<<<<< HEAD
  const [loading, setLoading] = useState(true);
=======
  const [loading, setLoading] = useState(false);
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
<<<<<<< HEAD
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('No token - please log in');
          setLoading(false);
          return;
        }

        // Fetch loans
        const loansRes = await fetch('https://api-xtreative.onrender.com/loan_app/loans/list/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (loansRes.ok) {
          const data = await loansRes.json();
          setLoans(Array.isArray(data) ? data : []);
        } else {
          setError('Loans fetch failed');
        }

        // Fetch vendors
        const vendorsRes = await fetch('https://api-xtreative.onrender.com/vendors/list/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (vendorsRes.ok) {
          const data = await vendorsRes.json();
          setVendors(Array.isArray(data) ? data : []);
        } else {
          setError('Vendors fetch failed');
        }
      } catch (err) {
        setError('Fetch error: ' + err.message);
=======
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
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
      } finally {
        setLoading(false);
      }
    };

<<<<<<< HEAD
    fetchData();
  }, []);

  const value = {
    loans,
    vendors,
    loading,
    error,
    approveLoan: async (id) => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`https://api-xtreative.onrender.com/${id}/approve/`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setLoans(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
          return data;
        }
      } catch (err) {
        setError('Approve failed: ' + err.message);
      }
    },
    rejectLoan: async (id, reason) => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`https://api-xtreative.onrender.com/loan_app/${id}/reject/`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ rejection_reason: reason }),
        });
        if (res.ok) {
          const data = await res.json();
          setLoans(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
          return data;
        }
      } catch (err) {
        setError('Reject failed: ' + err.message);
      }
    },
    // Derived data (no dayjs dependency to avoid crashes)
    repaymentBlocks: loans.filter(l => ['Active', 'Approved'].includes(l.status)).map(l => ({
      id: l.id,
      vendor_username: l.vendor_username,
      vendor_balance: l.current_balance,
      loanId: l.id,
      dueDate: l.next_payment_date ? l.next_payment_date.split('T')[0] : '-',
      daysUntilDue: 0, // Simplified
      amountDue: l.monthly_payment || l.weekly_payment || 0,
      amountPaid: '-',
      status: 'Upcoming',
      adminAction: 'Manage',
      originalLoan: l,
    })),
    repaymentHistory: loans.filter(l => l.status === 'Completed').map(l => ({
      id: l.id,
      vendor_username: l.vendor_username,
=======
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
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
      loanId: l.id,
      paidDate: l.updated_at.split('T')[0],
      amountPaid: l.monthly_payment || l.weekly_payment || 0,
      paymentMethod: l.payment_frequency,
      status: 'Paid',
<<<<<<< HEAD
    })),
  };

  return (
    <LoansContext.Provider value={value}>
      {children}
    </LoansContext.Provider>
  );
};
=======
    }));

  return (
    <LoansContext.Provider value={{ loans, vendors, loading, error, repaymentBlocks, repaymentHistory, approveLoan, rejectLoan }}>
      {children}
    </LoansContext.Provider>
  );
};
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
