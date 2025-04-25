import React, { useState } from "react";
import { ChevronDown, MoreVertical, XCircle } from "lucide-react";
import { blocks } from '../data/dummydata'; // import the payouts data

const ITEMS_PER_PAGE = 20;

const ReportContent = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [openTabs, setOpenTabs] = useState([
    { key: "sales",     label: "SALES REPORT : 2016/12/10 - 2016/12/31" },
    { key: "purchase",  label: "PURCHASING REPORT : 2016/12/10 - 2016/12/31" },
    { key: "inventory", label: "TOTAL INVENTORY CALCULATION" },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showColumnPanel, setShowColumnPanel] = useState(false);

  // Use full data for date-range sales report
  const salesData = blocks;
  const totalPages = Math.max(1, Math.ceil(salesData.length / ITEMS_PER_PAGE));
  const pageData = salesData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const closeTab = (key) => {
    const remaining = openTabs.filter((t) => t.key !== key);
    setOpenTabs(remaining);
    if (activeTab === key && remaining.length > 0) {
      setActiveTab(remaining[0].key);
    }
  };

  const currentLabel = openTabs.find((t) => t.key === activeTab)?.label;

  // Columns for sales/date-range payouts (ID column removed)
  const payoutHeaders = ['Date', 'Time', 'Vendor', 'Order ID', 'Sales', 'Commission', 'Net Payout'];

  return (
    <div className="flex-1 flex flex-col overflow-hidden font-poppins text-[11px]">
      {/* Controls */}
      <div className="flex items-center px-6 py-4 bg-white">
        {/* Report selector */}
        <div className="relative">
          <select
            value={activeTab}
            onChange={e => setActiveTab(e.target.value)}
            className="appearance-none border border-gray-300 rounded px-2 py-1 pr-8 text-[11px] focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <option value="sales">Sales Reports</option>
        
            <option value="inventory">Inventory Reports</option>
            <option value="vendor">Vendor Reports</option>
            <option value="customer">Customer Reports</option>
            <option value="product">Product Reports</option>
            <option value="order">Order Reports</option>
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>

        {/* Date range & generate */}
        <div className="flex items-center space-x-4 ml-auto">
          <div className="flex items-center space-x-2">
            <label>From Date</label>
            <input
              type="date"
              defaultValue="2016-12-10"
              className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label>To Date</label>
            <input
              type="date"
              defaultValue="2016-12-31"
              className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          <button className="bg-[#f9622c] text-white rounded px-4 py-1 hover:bg-orange-600">
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
                ? "bg-gray-500 text-white"
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
              <XCircle size={16} className={`${activeTab === tab.key ? "text-white" : "text-gray-500"} hover:text-gray-700`} />
            </button>
          </div>
        ))}
      </div>

      

      {/* Table */}
      <div className="relative flex-1 overflow-auto bg-white">
        <table className="min-w-full text-left text-[10px] border-collapse">
          <thead>
            <tr>
              {payoutHeaders.map(h => (
                <th key={h} className="px-4 py-2 whitespace-nowrap border-y border-x first:border-l-0 last:border-r-0 border-gray-300 bg-gray-200">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map(b => (
              <tr key={b.id} className="hover:bg-gray-50">
                {[b.date, b.time, b.vendor, b.orderid, b.sales, b.commissionAmount, b.netPayout].map((c, i) => (
                  <td key={i} className="px-4 py-2 whitespace-nowrap border-y border-x first:border-l-0 last:border-r-0 border-gray-100">{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Column Panel for non-sales tabs omitted */}

        {/* Pagination Controls */}
        {activeTab === 'sales' && (
          <div className="flex items-center justify-center py-2 space-x-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 disabled:opacity-50">
              &#8592;
            </button>
            <span className="text-[11px]">{currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1 disabled:opacity-50">
              &#8594;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportContent;
