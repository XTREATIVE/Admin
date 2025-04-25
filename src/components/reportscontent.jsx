import React, { useState, useMemo } from "react";
import { ChevronDown, XCircle } from "lucide-react";
import { blocks } from "../data/reportsdata"; // our dummy data

const ITEMS_PER_PAGE = 20;

const ReportContent = () => {
  // Active tab & pagination
  const [activeTab, setActiveTab] = useState("sales");
  const [currentPage, setCurrentPage] = useState(1);

  // Date range
  const [fromDate, setFromDate] = useState("2016-12-10");
  const [toDate, setToDate] = useState("2016-12-31");

  // Tabs
  const [openTabs, setOpenTabs] = useState([
    { key: "sales", label: `SALES REPORT : ${fromDate} - ${toDate}` },
    { key: "summary", label: "SALES SUMMARY" }
  ]);

  // Filter data by date range
  const filteredData = useMemo(
    () =>
      blocks.filter(({ date }) => {
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

  // Build summary: orders, sales, commission, net per vendor
  const summaryData = useMemo(() => {
    const map = {};
    filteredData.forEach(({ vendor, sales, commissionAmount, netPayout }) => {
      if (!map[vendor]) {
        map[vendor] = { vendor, orders: 0, sales: 0, commission: 0, net: 0 };
      }
      map[vendor].orders += 1;
      map[vendor].sales += parseFloat(sales);
      map[vendor].commission += parseFloat(commissionAmount);
      map[vendor].net += parseFloat(netPayout);
    });
    return Object.values(map);
  }, [filteredData]);

  // Totals across all vendors
  const totals = useMemo(
    () =>
      summaryData.reduce(
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

  // Tab close
  const closeTab = (key) => {
    const remaining = openTabs.filter((t) => t.key !== key);
    setOpenTabs(remaining);
    if (activeTab === key && remaining.length > 0) {
      setActiveTab(remaining[0].key);
    }
  };

  // Regenerate report label
  const handleGenerate = () => {
    setOpenTabs((tabs) =>
      tabs.map((t) =>
        t.key === "sales"
          ? { ...t, label: `SALES REPORT : ${fromDate} - ${toDate}` }
          : t
      )
    );
    setCurrentPage(1);
    setActiveTab("sales");
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden font-poppins text-[11px]">
      {/* Controls */}
      <div className="flex items-center px-6 py-4 bg-white">
        <div className="relative">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="appearance-none border border-gray-300 rounded px-2 py-1 pr-8 text-[11px] focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <option value="sales">Sales Reports</option>
            <option value="inventory">Loans Reports</option>
            <option value="vendor">Vendor Reports</option>
            <option value="customer">Customer Reports</option>
            <option value="product">Product Reports</option>
            <option value="order">Order Reports</option>
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>

        <div className="flex items-center space-x-4 ml-auto">
          <div className="flex items-center space-x-2">
            <label>From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label>To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          <button
            onClick={handleGenerate}
            className="bg-[#f9622c] text-white rounded px-4 py-1 hover:bg-orange-600"
          >
            Generate
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200 px-6 bg-gray-50">
        {openTabs.map((tab) => (
          <div
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center py-2 px-4 -mb-px cursor-pointer space-x-2 ${
              activeTab === tab.key
                ? "border border-gray-200 text-gray-800 bg-gray-50"
                : "text-gray-600 hover:text-gray-800 bg-white"
            }`}
          >
            <span className="flex-1 truncate">{tab.label}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.key);
              }}
              className="flex items-center justify-center rounded-full p-1 hover:bg-gray-200"
            >
              <XCircle size={14} className="text-gray-500" />
            </button>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative flex-1 overflow-auto bg-white">
        {activeTab === "sales" && (
          <>
            <table className="min-w-full text-left text-[11px] border-collapse">
              <thead>
                <tr>
                  {[
                    "Date",
                    "Time",
                    "Vendor",
                    "Order ID",
                    "Sales (UGX)",
                    "Commission (UGX)",
                    "Net Payout (UGX)"
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2 whitespace-nowrap border-y border-x first:border-l-0 last:border-r-0 border-gray-300"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    {[b.date, b.time, b.vendor, b.orderid, b.sales, b.commissionAmount, b.netPayout].map(
                      (c, i) => (
                        <td
                          key={i}
                          className="px-4 py-2 whitespace-nowrap border-y border-x first:border-l-0 last:border-r-0 border-gray-100"
                        >
                          {c}
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            <div className="flex items-center justify-center py-2 space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 disabled:opacity-50"
              >
                &#8592;
              </button>
              <span className="text-[11px]">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 disabled:opacity-50"
              >
                &#8594;
              </button>
            </div>
          </>
        )}

        {activeTab === "summary" && (
          <div className="p-6 text-[12px]">
            <div className="border rounded mb-4">
              <div className="flex justify-between bg-gray-50 px-4 py-2 font-semibold">
                <span>
                  Sales Summary: {fromDate} - {toDate}
                </span>
                <span>Total Sales : UGX {totals.sales.toFixed(2)}</span>
              </div>
              <table className="min-w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr>
                    {["Vendor", "Orders", "Sales (UGX)", "Commission (UGX)", "Net Payout (UGX)"].map(
                      (h) => (
                        <th key={h} className="px-4 py-2 border-y border-x border-gray-300">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {summaryData.map((row) => (
                    <tr key={row.vendor} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border-y border-x border-gray-100">{row.vendor}</td>
                      <td className="px-4 py-2 border-y border-x border-gray-100">{row.orders}</td>
                      <td className="px-4 py-2 border-y border-x border-gray-100">{row.sales.toFixed(2)}</td>
                      <td className="px-4 py-2 border-y border-x border-gray-100">{row.commission.toFixed(2)}</td>
                      <td className="px-4 py-2 border-y border-x border-gray-100">{row.net.toFixed(2)}</td>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportContent;
