
import React from 'react';
import Sidebar from '../components/sidebar';
import Header from '../components/header';
// Swap out FinanceOverview for LoanOverview
<<<<<<< HEAD
import LoanOverview from '../components/loansoverview';
=======
import loansoverview from '../components/loansoverview';
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06

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

<<<<<<< HEAD
export default Loans;
=======
export default Loans;
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
