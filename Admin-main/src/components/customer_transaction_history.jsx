// components/TransactionHistoryCard.jsx
import React from 'react';

// Dummy transaction data for testing/demo purposes
const dummyTransactions = [
  { id: 'TXN001', date: '2025-05-01', duration: 'Instant', type: 'Purchase', account: 'ACC-12345', paymentMethod: 'Credit Card', status: 'Success', amount: 'UGX 5,000' },
  { id: 'TXN002', date: '2025-04-28', duration: '2 days', type: 'Refund', account: 'ACC-67890', paymentMethod: 'Bank Transfer', status: 'Pending', amount: 'UGX 2,500' },
  { id: 'TXN003', date: '2025-04-25', duration: 'Instant', type: 'Purchase', account: 'ACC-54321', paymentMethod: 'Mobile Money', status: 'Failed', amount: 'UGX 1,200' },
];

export default function TransactionHistoryCard({ transactions = dummyTransactions }) {
  const data = (transactions && transactions.length > 0) ? transactions : [];

  return (
    <div className="bg-white p-4 rounded shadow h-full overflow-auto">
      <h2 className="text-sm font-semibold mb-4">Transaction History</h2>
      {data.length === 0 ? (
        <p className="text-[12px] text-gray-600">No transactions available.</p>
      ) : (
        <table className="min-w-full text-[12px]">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-2 px-3 text-left">Txn ID</th>
              <th className="py-2 px-3 text-left">Date</th>
              <th className="py-2 px-3 text-left">Duration</th>
              <th className="py-2 px-3 text-left">Type</th>
              <th className="py-2 px-3 text-left">Account</th>
              <th className="py-2 px-3 text-left">Payment Method</th>
              <th className="py-2 px-3 text-left">Status</th>
              <th className="py-2 px-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.map((txn) => (
              <tr key={txn.id} className="border-b last:border-0">
                <td className="py-2 px-3">{txn.id}</td>
                <td className="py-2 px-3">{txn.date}</td>
                <td className="py-2 px-3">{txn.duration}</td>
                <td className="py-2 px-3">{txn.type}</td>
                <td className="py-2 px-3">{txn.account}</td>
                <td className="py-2 px-3">{txn.paymentMethod}</td>
                <td className="py-2 px-3">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                    txn.status === 'Success' ? 'bg-green-100 text-green-800' :
                    txn.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {txn.status}
                  </span>
                </td>
                <td className="py-2 px-3 text-right">{txn.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}