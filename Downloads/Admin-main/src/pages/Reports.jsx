import React from "react";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import ReportContent from "../components/reportscontent";

const Reports = () => {
  return (
    <div className="h-screen font-poppins flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
       <main className="flex-1 p-1 overflow-auto ml-[65px] bg-gray-100">
                 <ReportContent />
               </main>
      </div>
    </div>
  );
};

export default Reports;
