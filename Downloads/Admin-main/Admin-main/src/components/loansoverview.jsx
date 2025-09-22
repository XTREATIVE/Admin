// src/components/LoanOverview.jsx
import React, { useEffect } from 'react';
import {
  Users,
  DollarSign,
  Clock,
  RefreshCw,
  TrendingUp,
  Percent,
} from 'lucide-react';
import loanIcon from '../assets/money-icon.png';    // replace with appropriate asset
import LoanRepayments from './loansvendors'
// Format numbers as Ugandan Shillings
const formatUGX = num =>
  num != null ? `UGX ${num.toLocaleString('en-UG')}` : 'UGX 0';

// Default statistics for demonstration
const defaultStats = {
  outstandingBalance: 50000000,    // UGX 50,000,000
  activeLoans: 120,                // 120 active loans
  principalDisbursed: 80000000,    // UGX 80,000,000
  interestEarned: 2000000,         // UGX 2,000,000 (2.5% of principal)
  totalRepayable: 8000000,        // Principal + interest
  totalRepaid: 30000000,           // UGX 30,000,000
  pendingApprovals: 5,             // 5 pending applications
  overdueLoans: 10,                // 10 loans overdue
};

const LoanOverview = ({ stats = defaultStats }) => {
  useEffect(() => {
    // If fetching real data, replace defaultStats with API call
    if (stats === defaultStats) {
      // fetchLoanStats().then(data => setStats(data));
    }
  }, [stats]);

  // Summary card: Outstanding Balance
  const summary = {
   
    value: stats.outstandingBalance,
  };

  // Metric cards
  const cards = [
    { label: 'Total Active Loans', icon: Users, value: stats.activeLoans, isMonetary: false },
    { label: 'Total Repayable', icon: DollarSign, value: stats.principalDisbursed, isMonetary: true },
    { label: 'Outstanding Balance', icon: TrendingUp, value: stats.totalRepayable, isMonetary: true },
    { label: 'Total Repaid', icon: RefreshCw, value: stats.totalRepaid, isMonetary: true },
    { label: 'Pending Approvals', icon: Clock, value: stats.pendingApprovals, isMonetary: false },
    { label: 'Overdue Loans', icon: Clock, value: stats.overdueLoans, isMonetary: false },
  ];

  return (
    <div className="w-full p-4 flex flex-col">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-6">
        {/* Main Summary Card */}
        <div className="col-span-1 lg:col-span-2 border rounded bg-white p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Principal Disbursed</h2>
            <img src={loanIcon} alt="Loans" className="w-10 h-10" />
          </div>
          <div className="flex items-center mt-4">
            <h1 className="text-3xl font-bold">
              {formatUGX(summary.value)}
            </h1>
          </div>

        </div>

        {/* Other Metric Cards */}
        {cards.map((c, idx) => (
          <div key={idx} className="border rounded bg-white p-4 flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <c.icon size={20} className="text-gray-700" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className="font-semibold">
                {c.isMonetary ? formatUGX(c.value) : c.value}
              </p>
            </div>
          </div>
        ))}
      </div>
       {/* Payouts & Transactions Table */}
       <div>
        <LoanRepayments />
      </div>
    </div>
    
    
  );
};

export default LoanOverview;
