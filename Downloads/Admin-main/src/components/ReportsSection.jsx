// src/components/ReportsSection.jsx
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ReportsSection = () => {
  const [reportType, setReportType] = useState("sales");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const data = [
    { name: "Product A", amount: 100, date: "2024-04-10" },
    { name: "Product B", amount: 200, date: "2024-04-11" },
    { name: "Product C", amount: 150, date: "2024-04-12" },
  ];

  const filteredData = data.filter((item) => {
    const itemDate = new Date(item.date);
    const fromDate = dateRange.from ? new Date(dateRange.from) : null;
    const toDate = dateRange.to ? new Date(dateRange.to) : null;
    return (
      (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate)
    );
  });

  const handleExcelExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(dataBlob, `${reportType}-report.xlsx`);
  };

  const handlePDFExport = () => {
    const doc = new jsPDF();
    doc.text(`${reportType.toUpperCase()} Report`, 14, 16);
    const tableColumn = ["Name", "Amount", "Date"];
    const tableRows = filteredData.map((item) => [
      item.name,
      item.amount,
      item.date
    ]);
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
    doc.save(`${reportType}-report.pdf`);
  };

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block mb-1 text-sm font-medium">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          >
            <option value="sales">Sales</option>
            <option value="transactions">Financial Transactions</option>
            <option value="loans">Loans</option>
            <option value="revenue">Revenue</option>
            <option value="users">Users</option>
            <option value="orders">Orders</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">From Date</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, from: e.target.value }))
            }
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">To Date</label>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, to: e.target.value }))
            }
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>
      </div>

      <div className="mb-4 flex gap-4">
        <button
          onClick={handleExcelExport}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Download Excel
        </button>
        <button
          onClick={handlePDFExport}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Download PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">Amount</th>
              <th className="border px-4 py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{item.name}</td>
                <td className="border px-4 py-2">{item.amount}</td>
                <td className="border px-4 py-2">{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsSection;
