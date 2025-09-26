// src/context/PayoutsContext.js
import React, { createContext, useState, useEffect } from 'react';
import dayjs from 'dayjs';

export const PayoutsContext = createContext();

export const PayoutsProvider = ({ children }) => {
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [settledPayouts, setSettledPayouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Since the backend doesn't have a general payouts endpoint,
    // we'll simulate loading state and use empty arrays for now
    setLoading(true);
    setError(null);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      // For now, we'll use empty arrays since the API endpoint doesn't exist
      // You can populate these with mock data or modify when the backend is ready
      setPendingPayouts([]);
      setSettledPayouts([]);
      setLoading(false);
      
      // If you want to show an informative message instead of an error:
      // setError('Payouts endpoint not yet implemented in backend');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Mock data for demonstration - replace this when you have real API endpoint
  const mockPayouts = [
    {
      id: 1,
      vendor__shop_name: 'Electronics Store',
      product__name: 'Smartphone XYZ',
      amount: 150000,
      status: 'Pending',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      vendor__shop_name: 'Fashion Hub',
      product__name: 'Designer Jacket',
      amount: 80000,
      status: 'Paid',
      settlement_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      vendor__shop_name: 'Book World',
      product__name: 'Programming Guide',
      amount: 25000,
      status: 'Pending',
      created_at: new Date().toISOString(),
    }
  ];

  // Use mock data for now - remove this when you have real API
  const mockPendingPayouts = mockPayouts.filter(p => p.status === 'Pending');
  const mockSettledPayouts = mockPayouts.filter(p => p.status === 'Paid');

  // derive blocks for table
  const blocks = [
    // pending payouts (use mock data if real data is empty)
    ...(pendingPayouts.length > 0 ? pendingPayouts : mockPendingPayouts).map(p => ({
      id: p.id,
      date: '-',
      time: '-',
      vendor: p.vendor__shop_name || 'Unknown Vendor',
      orderid: p.product__name || `Order #${p.id}`,
      sales: p.amount != null ? `UGX ${p.amount.toLocaleString()}` : '-',
      commissionAmount: p.amount != null ? `UGX ${(p.amount * 0.1).toLocaleString()}` : '-',
      netPayout: p.amount != null ? `UGX ${(p.amount * 0.9).toLocaleString()}` : '-',
      status: 'Pending',
      action: 'Manage',
    })),
    // settled payouts (use mock data if real data is empty)
    ...(settledPayouts.length > 0 ? settledPayouts : mockSettledPayouts).map(p => {
      const dt = dayjs(p.settlement_date || p.created_at);
      return {
        id: p.id,
        date: dt.isValid() ? dt.format('MMM DD, YYYY') : '-',
        time: dt.isValid() ? dt.format('hh:mm A').toLowerCase() : '-',
        vendor: p.vendor__shop_name || 'Unknown Vendor',
        orderid: p.product__name || `Order #${p.id}`,
        sales: p.amount != null ? `UGX ${p.amount.toLocaleString()}` : '-',
        commissionAmount: p.amount != null ? `UGX ${(p.amount * 0.1).toLocaleString()}` : '-',
        netPayout: p.amount != null ? `UGX ${(p.amount * 0.9).toLocaleString()}` : '-',
        status: 'Paid',
        action: 'View',
      };
    }),
  ];

  return (
    <PayoutsContext.Provider value={{ blocks, loading, error }}>
      {children}
    </PayoutsContext.Provider>
  );
};