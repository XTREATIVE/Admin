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
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
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