
import React from 'react';
import Sidebar from '../components/sidebar';
import Header from '../components/header';
// Swap out FinanceOverview for LoanOverview
import LoanOverview from '../components/loansoverview';

const Loans = () => {
  return (
    <div className="h-screen font-poppins flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-gray-100 ml-[80px] overflow-hidden">
          {/* Scrollable wrapper */}
          <div className="h-full overflow-y-auto p-4">
            <LoanOverview /> {/* Render loan overview metrics */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Loans;
