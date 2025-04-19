import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Sample payout ledger entries
const blocks = [
  { id: '001', date: '2025-04-17', time: '10:30 AM', vendor: 'Alinatwe Tenny', orderid: 'ORD12310', sales: 'UGX 1,200.00', commissionAmount: 'UGX 120.00', netPayout: 'UGX 1,080.00', status: 'Upcoming', action: 'View' },
  { id: '002', date: '2025-04-16', time: '02:45 PM', vendor: 'Alinatwe Kenny', orderid: 'ORD1238',  sales: 'UGX 850.00',   commissionAmount: 'UGX 85.00',  netPayout: 'UGX 765.00',  status: 'Pending',  action: 'View' },
  { id: '003', date: '2025-04-15', time: '11:15 AM', vendor: 'Alinatwe Wenny', orderid: 'ORD1237', sales: 'UGX 2,500.00', commissionAmount: 'UGX 250.00', netPayout: 'UGX 2,250.00', status: 'Paid',     action: 'View' },
  { id: '004', date: '2025-04-14', time: '04:00 PM', vendor: 'Alinatwe Lenny', orderid: 'ORD1235', sales: 'UGX 430.00',   commissionAmount: 'UGX 43.00',  netPayout: 'UGX 387.00',  status: 'Pending',  action: 'View' },
  { id: '005', date: '2025-04-13', time: '09:00 AM', vendor: 'Alinatwe Jerry', orderid: 'ORD1234', sales: 'UGX 1,150.00', commissionAmount: 'UGX 115.00', netPayout: 'UGX 1,035.00', status: 'Refunded', action: 'View', refund: true },
];

// Transaction History data
const transactionHistory = [
  { id: '1', name: 'John Alinatwe',  date: '2025-04-15', duration: '2m ago',  userType: 'Customer', paymentMethod: 'Mobile Money',  account: '0701234567',        type: 'Deposit',    amount: 'UGX 50,000'  },
  { id: '2', name: 'Jane Ayebale',   date: '2025-04-16', duration: '15m ago', userType: 'Vendor',   paymentMethod: 'Bank Transfer',  account: '012345678901',      type: 'Withdrawal', amount: 'UGX 20,000'  },
  { id: '3', name: 'Alice Opio',    date: '2025-04-17', duration: '45m ago', userType: 'Customer', paymentMethod: 'Credit Card',   account: '**** **** **** 1234', type: 'Shopping',   amount: 'UGX 150,000' },
];

const tabs = [
  'Upcoming Payouts',
  'Pending Payouts',
  'Payout History',
  'Transaction History',
  'Refunds',
];

const FinancePayouts = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const renderHeaders = () => {
    let headers;
    switch (activeTab) {
      case 'Transaction History':
        headers = ['ID','Name','Date','Duration','User Type','Payment Method','Account','Type','Amount']; break;
      case 'Refunds':
        headers = ['ID','Date','Amount','Type']; break;
      default:
        headers = ['ID','Date','Time','Vendor','Order ID','Sales','Commission','Net Payout','Status','Action'];
    }
    return <tr className="text-[10px]">{headers.map(h => <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>)}</tr>;
  };

  const renderRows = () => {
    switch (activeTab) {
      case 'Upcoming Payouts':
      case 'Pending Payouts':
      case 'Payout History':
        return blocks.filter(b => {
          if (activeTab==='Upcoming Payouts') return b.status==='Upcoming';
          if (activeTab==='Pending Payouts') return b.status==='Pending';
          return b.status==='Paid';
        }).map(b => (
          <tr key={b.id} className="border-t hover:bg-gray-100 text-[10px]">
            {[b.id,b.date,b.time,b.vendor,b.orderid,b.sales,b.commissionAmount,b.netPayout].map((c,i) => (
              <td key={i} className="px-4 py-2">{c}</td>
            ))}
            <td className="px-4 py-2">
              <span className={`inline-block px-2 py-1 rounded-full text-[9px] ${b.status==='Paid'||b.status==='Upcoming'? 'bg-green-100 text-green-900' : 'bg-yellow-100 text-yellow-600'}`}>{b.status}</span>
            </td>
            <td className="px-4 py-2 cursor-pointer hover:underline">{b.action}</td>
          </tr>
        ));
      case 'Transaction History':
        return transactionHistory.map(tx => (
          <tr key={tx.id} className="border-t hover:bg-gray-100 text-[10px]">
            {[tx.id,tx.name,tx.date,tx.duration,tx.userType,tx.paymentMethod,tx.account,tx.type,tx.amount].map((c,i) => (
              <td key={i} className="px-4 py-2">{c}</td>
            ))}
          </tr>
        ));
      case 'Refunds':
        return blocks.filter(b => b.refund).map(b => (
          <tr key={b.id} className="border-t hover:bg-gray-100 text-[10px]">
            {[b.id,b.date,b.netPayout,'Refund'].map((c,i) => (
              <td key={i} className="px-4 py-2">{c}</td>
            ))}
          </tr>
        ));
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Dropdown Selector */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <select
          value={activeTab}
          onChange={e => setActiveTab(e.target.value)}
          className="text-[11px] border border-gray-300 rounded px-3 py-2 focus:outline-none"
        >
          {tabs.map(tab => (
            <option key={tab} value={tab}>{tab}</option>
            
          ))}
        </select>
      </div>

      {/* Content Area */}
      <div className=" flex-1 overflow-auto">
        {/* Unified Table */}
        <div className="overflow-x-auto bg-white rounded">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50 text-gray-700">{renderHeaders()}</thead>
            <tbody>{renderRows()}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancePayouts;
