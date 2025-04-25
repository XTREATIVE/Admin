// ReportContent.jsx
import React, { useState, useMemo, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { blocks } from "../data/reportsdata";
// Import top product image from assets
import topProductImg from "../assets/Shirt.jpg";

const ITEMS_PER_PAGE = 20;

const ReportContent = () => {
  // Report type (group) & active sub-tab
  const [reportType, setReportType] = useState("sales");
  const [activeTab, setActiveTab] = useState("sales");

  // Date range
  const [fromDate, setFromDate] = useState("2016-12-10");
  const [toDate, setToDate] = useState("2016-12-31");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Compute tabs for sales reports
  const openTabs = useMemo(() => (
    reportType === "sales"
      ? [
          { key: "sales", label: `SALES REPORT : ${fromDate} - ${toDate}` },
          { key: "summary", label: "SALES SUMMARY" },
          { key: "orderStats", label: "SALES LEADERBOARD" }
        ]
      : []
  ), [reportType, fromDate, toDate]);

  // Reset sub-tab on reportType change
  useEffect(() => {
    if (openTabs.length) setActiveTab(openTabs[0].key);
    setCurrentPage(1);
  }, [openTabs]);

  // Filter data by date range
  const filteredData = useMemo(
    () => blocks.filter(({ date }) => {
      const d = new Date(date);
      return d >= new Date(fromDate) && d <= new Date(toDate);
    }),
    [fromDate, toDate]
  );

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const pageData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Build summary data
  const summaryData = useMemo(() => {
    const map = {};
    filteredData.forEach(({ vendor, sales, commissionAmount, netPayout }) => {
      if (!map[vendor]) map[vendor] = { vendor, orders: 0, sales: 0, commission: 0, net: 0 };
      map[vendor].orders += 1;
      map[vendor].sales += +sales;
      map[vendor].commission += +commissionAmount;
      map[vendor].net += +netPayout;
    });
    return Object.values(map);
  }, [filteredData]);

  const totals = useMemo(
    () => summaryData.reduce(
      (acc, row) => ({
        orders: acc.orders + row.orders,
        sales: acc.sales + row.sales,
        commission: acc.commission + row.commission,
        net: acc.net + row.net
      }),
      { orders: 0, sales: 0, commission: 0, net: 0 }
    ),
    [summaryData]
  );

  // Rankings
  const vendorRankingData = useMemo(() => {
    const map = {};
    filteredData.forEach(({ vendor, sales }) => map[vendor] = (map[vendor] || 0) + +sales);
    return Object.entries(map)
      .map(([vendor, sales]) => ({ vendor, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [filteredData]);

  const productRankingData = useMemo(() => {
    const map = {};
    filteredData.forEach(({ product }) => map[product] = (map[product] || 0) + 1);
    return Object.entries(map)
      .map(([product, count]) => ({ product, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredData]);

  // Top items for footer
  const topVendor = vendorRankingData[0] || { vendor: "", sales: 0 };
  const topProduct = productRankingData[0] || { product: "", count: 0 };

  return (
    <div className="flex-1 flex flex-col overflow-hidden font-poppins text-[11px]">
      {/* Controls */}
      <div className="flex items-center px-6 py-4 bg-white">
        <div className="relative">
          <select
            value={reportType}
            onChange={e => setReportType(e.target.value)}
            className="appearance-none border border-gray-300 rounded px-2 py-1 pr-8 text-[11px] focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <option value="sales">Sales Reports</option>
            <option value="loan">Loan Reports</option>
            <option value="financial">Financial Reports</option>
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>
        <div className="flex items-center space-x-4 ml-auto">
          <div className="flex items-center space-x-2">
            <label>From Date</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500" />
          </div>
          <div className="flex items-center space-x-2">
            <label>To Date</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500" />
          </div>
          <button onClick={() => { setCurrentPage(1); setActiveTab("sales"); }} className="bg-[#f9622c] text-white rounded px-4 py-1 hover:bg-orange-600">Generate</button>
        </div>
      </div>

      {/* Sales sub-tabs */}
      {reportType === "sales" && (
        <div className="flex items-center border-b border-gray-200 px-6 bg-gray-50">
          {openTabs.map(tab => (
            <div key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center py-2 px-4 -mb-px cursor-pointer space-x-2 ${activeTab === tab.key ? "bg-gray-100 text-gray-800" : "text-gray-600 hover:text-gray-800 bg-white"}`}>
              <span className="flex-1 truncate">{tab.label}</span>
              {activeTab === tab.key ? (
                <span className="relative w-3 h-3 border border-gray-500 rounded-full flex items-center justify-center">
                  <span className="w-1 h-1 bg-gray-500 rounded-full" />
                </span>
              ) : (
                <span className="w-2 h-2 border border-gray-500 rounded-full" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative flex-1 overflow-auto bg-white">
        {reportType === "sales" && activeTab === "sales" && (
          <>
            <table className="min-w-full text-left text-[10px] border-collapse">
              <thead>
                <tr>
                  {["Date","Time","Vendor","Order ID","Sales (UGX)","Commission (UGX)","Net Payout (UGX)"].map(h => <th key={h} className="px-4 py-2 whitespace-nowrap border-y border-x bg-gray-100">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {pageData.map((b, idx) => <tr key={idx} className="hover:bg-gray-50">{[b.date, b.time, b.vendor, b.orderid, b.sales, b.commissionAmount, b.netPayout].map((c,i)=><td key={i} className="px-4 py-2 whitespace-nowrap border-y border-x">{c}</td>)}</tr>)}
              </tbody>
            </table>
            <div className="flex items-center justify-center py-2 space-x-2">
              <button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} className="p-1 disabled:opacity-50">←</button>
              <span className="text-[11px]">{currentPage} of {totalPages}</span>
              <button onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages} className="p-1 disabled:opacity-50">→</button>
            </div>
          </>
        )}

        {reportType === "sales" && activeTab === "summary" && (
          <div className="p-6 text-[12px]">
            <div className="border rounded mb-4">
              <div className="flex justify-between bg-gray-50 px-4 py-2 font-semibold">
                <span>Sales Summary: {fromDate} – {toDate}</span>
                <span>Total Sales: UGX {totals.sales.toFixed(2)}</span>
              </div>
              <table className="min-w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr>{["Vendor","Orders","Sales (UGX)","Commission (UGX)","Net Payout (UGX)"].map(h=><th key={h} className="px-4 py-2 border-y border-x bg-gray-100">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {summaryData.map((row,i)=><tr key={i} className="hover:bg-gray-50">{[row.vendor,row.orders,row.sales.toFixed(2),row.commission.toFixed(2),row.net.toFixed(2)].map((c,j)=><td key={j} className="px-4 py-2 border-y border-x">{c}</td>)}</tr>)}
                </tbody>
                <tfoot><tr className="bg-gray-50 font-semibold"><td className="px-4 py-2">Totals</td><td className="px-4 py-2">{totals.orders}</td><td className="px-4 py-2">{totals.sales.toFixed(2)}</td><td className="px-4 py-2">{totals.commission.toFixed(2)}</td><td className="px-4 py-2">{totals.net.toFixed(2)}</td></tr></tfoot>
              </table>
            </div>
          </div>
        )}

        {reportType === "sales" && activeTab === "orderStats" && (
          <>
            <div className="p-6 text-[11px]">
              <h2 className="font-semibold mb-4">Sales Leaderboard: {fromDate} – {toDate}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-64">
                  <h3 className="font-medium mb-2">Top 5 Vendors</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vendorRankingData} margin={{ top:20,right:20,bottom:20,left:0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="vendor" tick={{ fontSize:10 }}/>
                      <YAxis />
                      <Tooltip formatter={val=>new Intl.NumberFormat().format(val)}/>
                      <Bar dataKey="sales" name="Sales (UGX)" barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-64">
                  <h3 className="font-medium mb-2">Top 5 Products</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productRankingData} margin={{ top:20,right:20,bottom:20,left:0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="product" tick={{ fontSize:10 }}/>
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Units Sold" barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 w-full flex items-center justify-between px-6 py-3 bg-white border-t z-10">
              <div className="flex items-center space-x-3">
                <img src={topProductImg} alt={topProduct.product} className="w-8 h-8 rounded object-cover" />
                <div className="text-[11px]">
                  <div className="font-medium">#1 Top Product</div>
                  <div>{topProduct.product} – {topProduct.count} units</div>
                </div>
              </div>
              <div className="text-[11px] text-gray-800 text-center">
                <div className="font-medium">#1 Top Vendor</div>
                <div>{topVendor.vendor} – {new Intl.NumberFormat().format(topVendor.sales)} UGX</div>
              </div>
            </div>
          </>
        )}

        {reportType !== "sales" && (
          <div className="p-6 text-center text-gray-500">
            <p>{reportType === "loan" ? "Loan Reports coming soon." : "Financial Reports coming soon."}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportContent;
