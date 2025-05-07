// src/components/ReportContent.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { ChevronDown, Search } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

import LoanReport from "./loans_reports";
import FinancialReports from "./financial_reports";
import OrderReports from "./order_reports";
import ProductReports from "./product_reports";
import VendorReports from "./vendor_reports";
import CustomerReports from "./customer_reports";

import { blocks } from "../data/reportsdata";
import topProductImg from "../assets/Shirt.jpg";

const ITEMS_PER_PAGE = 20;
const FILTER_OPTIONS = [
  { key: "dateDesc", label: "Newest First" },
  { key: "dateAsc", label: "Oldest First" },
  { key: "topSelling", label: "Top Selling (UGX)" },
  { key: "vendorAZ", label: "Vendor A–Z" },
  { key: "vendorZA", label: "Vendor Z–A" },
];

export default function ReportContent() {
  const [reportType, setReportType] = useState("sales");
  const [activeTab, setActiveTab] = useState("sales");
  const [fromDate, setFromDate] = useState("2016-12-10");
  const [toDate, setToDate] = useState("2016-12-31");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState(FILTER_OPTIONS[0].key);
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const reportRef = useRef();

  const openTabs = useMemo(
    () =>
      reportType === "sales"
        ? [
            { key: "sales", label: `SALES REPORT : ${fromDate} - ${toDate}` },
            { key: "summary", label: "SALES SUMMARY" },
            { key: "orderStats", label: "SALES LEADERBOARD" },
          ]
        : [],
    [reportType, fromDate, toDate]
  );

  useEffect(() => {
    if (openTabs.length) setActiveTab(openTabs[0].key);
    setCurrentPage(1);
    setSearchTerm("");
    setSortOption(FILTER_OPTIONS[0].key);
    setUserFilter("");
  }, [openTabs]);

  // Filter & search
  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const user = userFilter.trim().toLowerCase();
    return blocks.filter(({ date, vendor, orderid, product }) => {
      const d = new Date(date);
      if (d < new Date(fromDate) || d > new Date(toDate)) return false;
      if (user && !vendor.toLowerCase().includes(user)) return false;
      if (!term) return true;
      return (
        vendor.toLowerCase().includes(term) ||
        orderid.toLowerCase().includes(term) ||
        (product && product.toLowerCase().includes(term))
      );
    });
  }, [fromDate, toDate, searchTerm, userFilter]);

  // Sort
  const sortedData = useMemo(() => {
    const data = [...filteredData];
    switch (sortOption) {
      case "dateAsc":
        return data.sort((a, b) => new Date(a.date) - new Date(b.date));
      case "topSelling":
        return data.sort((a, b) => +b.sales - +a.sales);
      case "vendorAZ":
        return data.sort((a, b) => a.vendor.localeCompare(b.vendor));
      case "vendorZA":
        return data.sort((a, b) => b.vendor.localeCompare(a.vendor));
      default:
        return data.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  }, [filteredData, sortOption]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / ITEMS_PER_PAGE));
  const pageData = sortedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Summary computation
  const summaryData = useMemo(() => {
    const map = {};
    filteredData.forEach(({ vendor, sales, commissionAmount, netPayout }) => {
      if (!map[vendor]) map[vendor] = { vendor, orders: 0, sales: 0, commission: 0, net: 0 };
      map[vendor].orders++;
      map[vendor].sales += +sales;
      map[vendor].commission += +commissionAmount;
      map[vendor].net += +netPayout;
    });
    return Object.values(map);
  }, [filteredData]);

  const sortedSummary = useMemo(() => {
    const data = [...summaryData];
    switch (sortOption) {
      case "vendorAZ":
        return data.sort((a, b) => a.vendor.localeCompare(b.vendor));
      case "vendorZA":
        return data.sort((a, b) => b.vendor.localeCompare(a.vendor));
      case "topSelling":
        return data.sort((a, b) => b.sales - a.sales);
      default:
        return data;
    }
  }, [summaryData, sortOption]);

  const totals = useMemo(
    () =>
      sortedSummary.reduce(
        (acc, r) => ({
          orders: acc.orders + r.orders,
          sales: acc.sales + r.sales,
          commission: acc.commission + r.commission,
          net: acc.net + r.net,
        }),
        { orders: 0, sales: 0, commission: 0, net: 0 }
      ),
    [sortedSummary]
  );

  // Leaderboards
  const vendorRankingData = useMemo(() => {
    const map = {};
    filteredData.forEach(({ vendor, sales }) => (map[vendor] = (map[vendor] || 0) + +sales));
    return Object.entries(map)
      .map(([vendor, sales]) => ({ vendor, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [filteredData]);

  const productRankingData = useMemo(() => {
    const map = {};
    filteredData.forEach(({ product }) => (map[product] = (map[product] || 0) + 1));
    return Object.entries(map)
      .map(([product, count]) => ({ product, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredData]);

  const topVendor = vendorRankingData[0] || { vendor: "", sales: 0 };
  const topProduct = productRankingData[0] || { product: "", count: 0 };

  // PDF export
  const handleGeneratePDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(img, "PNG", 0, 0, w, h);
    pdf.save(`report_${reportType}_${fromDate}_to_${toDate}.pdf`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden text-[11px]" ref={reportRef}>
      {/* Controls */}
      <div className="flex items-center px-6 py-4 bg-white space-x-4">
        <div className="relative">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border rounded px-2 py-1 pr-8"
          >
            <option value="sales">Sales Reports</option>
            <option value="loan">Loan Reports</option>
            <option value="financial">Financial Reports</option>
            <option value="orders">Order Reports</option>
            <option value="product">Product Reports</option>
            <option value="vendor">Vendor Reports</option>
            <option value="customer">Customer Reports</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>
        <input
          type="text"
          placeholder="Vendor name…"
          value={userFilter}
          onChange={(e) => {
            setUserFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded px-2 py-1"
        />
        <div className="relative flex-1 max-w-xs">
          <Search
            size={14}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Order ID, product…"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-8 w-full border rounded px-2 py-1"
          />
        </div>
        <div className="relative">
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded px-2 py-1 pr-8"
          >
            {FILTER_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>
        <div className="flex items-center ml-auto space-x-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button
            onClick={handleGeneratePDF}
            className="bg-[#f9622c] text-white rounded px-4 py-1 hover:bg-orange-600"
          >
            Generate PDF
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      {reportType === "sales" && (
        <div className="flex border-b bg-gray-50 px-6">
          {openTabs.map((tab) => (
            <div
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 text-center py-2 cursor-pointer ${
                activeTab === tab.key
                  ? "bg-white border-t border-l border-r"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto bg-white p-6">
        {/* SALES */}
        {reportType === "sales" && activeTab === "sales" && (
          <>
            <table className="min-w-full text-left text-[10px] border-collapse">
              <thead>
                <tr>
                  {[
                    "Date",
                    "Time",
                    "Vendor",
                    "Order ID",
                    "Sales (UGX)",
                    "Commission (UGX)",
                    "Net Payout (UGX)",
                  ].map((h) => (
                    <th key={h} className="px-4 py-2 bg-gray-100 border">
                      {h}
                    </th>
                 
                ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((b, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {[b.date, b.time, b.vendor, b.orderid, b.sales, b.commissionAmount, b.netPayout].map(
                      (c, j) => (
                        <td key={j} className="px-4 py-2 border">
                          {c}
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center space-x-2 py-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 disabled:opacity-50"
              >
                ←
              </button>
              <span>
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 disabled:opacity-50"
              >
                →
              </button>
            </div>
          </>
        )}

        {reportType === "sales" && activeTab === "summary" && (
          <div>
            <div className="flex justify-between bg-gray-50 px-4 py-2 font-semibold mb-4">
              <span>Sales Summary: {fromDate} – {toDate}</span>
              <span>Total Sales: UGX {totals.sales.toFixed(2)}</span>
            </div>
            <table className="min-w-full text-left text-[11px] border-collapse">
              <thead>
                <tr>
                  {[
                    "Vendor",
                    "Orders",
                    "Sales (UGX)",
                    "Commission (UGX)",
                    "Net Payout (UGX)",
                  ].map((h) => (
                    <th key={h} className="px-4 py-2 bg-gray-100 border">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedSummary.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {[
                      r.vendor,
                      r.orders,
                      r.sales.toFixed(2),
                      r.commission.toFixed(2),
                      r.net.toFixed(2),
                    ].map((c, j) => (
                      <td key={j} className="px-4 py-2 border">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-2">Totals</td>
                  <td className="px-4 py-2">{totals.orders}</td>
                  <td className="px-4 py-2">{totals.sales.toFixed(2)}</td>
                  <td className="px-4 py-2">{totals.commission.toFixed(2)}</td>
                  <td className="px-4 py-2">{totals.net.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {reportType === "sales" && activeTab === "orderStats" && (
          <div>
            <h2 className="font-semibold mb-4">Sales Leaderboard: {fromDate} – {toDate}</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-64">
                <h3 className="font-medium mb-2">Top 5 Vendors</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={vendorRankingData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="vendor" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip formatter={(v) => new Intl.NumberFormat().format(v)} />
                    <Bar dataKey="sales" name="Sales (UGX)" barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="h-64">
                <h3 className="font-medium mb-2">Top 5 Products</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={productRankingData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="product" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Units Sold" barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t py-3 px-6 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <img src={topProductImg} alt={topProduct.product} className="w-8 h-8 rounded" />
                <div>
                  <div className="font-medium">#1 Top Product</div>
                  <div>
                    {topProduct.product} – {topProduct.count} units
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium">#1 Top Vendor</div>
                <div>{topVendor.vendor} – {new Intl.NumberFormat().format(topVendor.sales)} UGX</div>
              </div>
            </div>
          </div>
        )}

        {/* LOAN REPORT */}
        {reportType === "loan" && <LoanReport />}

        {/* FINANCIAL REPORT */}
        {reportType === "financial" && <FinancialReports />}

        {/* ORDER REPORT */}
        {reportType === "orders" && <OrderReports />}

        {/* PRODUCT REPORT */}
        {reportType === "product" && <ProductReports />}

        {/* VENDOR REPORT */}
        {reportType === "vendor" && <VendorReports />}

        {/* CUSTOMER REPORT */}
        {reportType === "customer" && <CustomerReports />}
      </div>
    </div>
  );
}
