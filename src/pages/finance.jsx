// pages/AdminDashboard.js (updated)
import React from 'react';
import Sidebar from '../components/sidebar';
import Header from '../components/header';
import FinanceOverview from '../components/financeoverview';

const Finance = () => {
  return (
    <div className="h-screen font-poppins flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 bg-gray-100 ml-[80px]">
          <FinanceOverview />
        </main>
      </div>
    </div>
  );
};

export default Finance;