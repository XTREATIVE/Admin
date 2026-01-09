// pages/Reports.jsx
import React, { useState } from "react";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import ReportsSection from "../components/ReportsSection";

const Reports = () => {
  const [reportData, setReportData] = useState([]);

  const handleGenerateReport = (data) => {
    setReportData(data);
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(file, "report.xlsx");
  };

  return (
    <div className="h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-gray-100 ml-[80px] p-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-semibold">Reports</h1>
              <button
                onClick={handleExportExcel}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Export to Excel
              </button>
            </div>
            <ReportsSection onGenerate={handleGenerateReport} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
