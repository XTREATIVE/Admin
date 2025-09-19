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

        // Fetch loans
        const loansRes = await fetch('https://api-xtreative.onrender.com/loans/list/', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!loansRes.ok) throw new Error(`Loans API Error ${loansRes.status}: ${loansRes.statusText}`);
        const loansData = await loansRes.json();
        setLoans(loansData);

        // Fetch vendors
        const vendorsRes = await fetch('https://api-xtreative.onrender.com/vendors/list/', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!vendorsRes.ok) throw new Error(`Vendors API Error ${vendorsRes.status}: ${vendorsRes.statusText}`);
        const vendorsData = await vendorsRes.json();
        setVendors(vendorsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to update loan status
  const updateLoanStatus = async (loanId, newStatus, rejectionReason = null) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const payload = { status: newStatus };
      if (rejectionReason) payload.rejection_reason = rejectionReason;

      const response = await fetch(`https://api-xtreative.onrender.com/loans/${loanId}/update/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Update API Error ${response.status}: ${response.statusText}`);
      const updatedLoan = await response.json();

      // Update loans state
      setLoans(prevLoans =>
        prevLoans.map(loan => (loan.id === loanId ? { ...loan, ...updatedLoan } : loan))
      );

      return updatedLoan;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Derive repaymentBlocks
  const repaymentBlocks = loans
    .filter(l => ['Active', 'Approved', 'Upcoming', 'Overdue'].includes(l.status))
    .map(l => {
      const due = l.next_payment_date ? dayjs(l.next_payment_date) : null;
      const daysUntil = due ? due.diff(dayjs(), 'day') : null;
      return {
        id: l.id,
        vendor: { name: l.vendor_username, walletBalance: l.current_balance },
        loanId: l.id,
        dueDate: due?.format('YYYY-MM-DD') || '-',
        daysUntilDue: daysUntil,
        amountDue: l.monthly_payment,
        amountPaid: '-',
        status: daysUntil > 0 ? 'Upcoming' : daysUntil === 0 ? 'Due Today' : 'Overdue',
        adminAction: 'Manage',
      };
    });

  // Derive repaymentHistory
  const repaymentHistory = loans
    .filter(l => l.status === 'Paid')
    .map(l => ({
      id: l.id,
      vendor: { name: l.vendor_username },
      loanId: l.id,
      paidDate: l.updated_at.split('T')[0],
      amountPaid: l.monthly_payment,
      paymentMethod: l.payment_frequency,
      status: 'Paid',
    }));

  return (
    <LoansContext.Provider value={{ loans, vendors, loading, error, repaymentBlocks, repaymentHistory, updateLoanStatus }}>
      {children}
    </LoansContext.Provider>
  );
};