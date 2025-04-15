// OrderList.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import OrderTable from "../components/orderlist_table";
import RecentClaims from "../components/RecentClaims";
import ClaimsModal from "../modals/returnClaims";
// 1) Install recharts: npm install recharts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Define dummyClaims for use in the modal
const dummyClaims = [
  {
    name: "John Alinatwe",
    message: "Claimed a refund for UGX 50,000",
    time: "3 min ago",
    type: "refund",
  },
  {
    name: "Jane Ayebale",
    message: "Submitted a claim for delayed delivery of UGX 20,000",
    time: "15 min ago",
    type: "claim",
  },
  {
    name: "Alice Opio",
    message: "Claimed compensation for a faulty product - UGX 30,000",
    time: "45 min ago",
    type: "claim",
  },
];


const claimsData = [
  {
    id: "324561324",
    pickupAddress: "Al Ain Ahlia Insurance Co, Abudhabi, Al Karamah",
    deliveryAddress: "King Abdullah bin Abdul Aziz Al Sud Street, Abu Dhabi, AD",
    expiry: "12.12.19",
    price: 120,
    buttonText: "Place Bid",
    giftTitle: "Sweater Shirt",
    quantity: "1",
    weight: "2 kg",
    description: "A small box with gifts ... careful handling.",
    shipper: "Holden Caulfield",
    giftPrice: 120
  },

]

const OrderList = () => {
  const navigate = useNavigate();

  // Date picker state
  const [selectedDate, setSelectedDate] = useState(new Date());
  // Time‐range for the return‐rate graph
  const [range, setRange] = useState("This Month");

  // Modal state for viewing all claims
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Example metrics data
  const summaryData = [
    { title: "Total Orders", value: 980, icon: "📝" },
    { title: "Pending Orders", value: 150, icon: "⏳" },
    { title: "Processing", value: 210, icon: "🔄" },
    { title: "Shipped", value: 300, icon: "🚚" },
    { title: "Delivered", value: 250, icon: "✅" },
    { title: "Cancelled", value: 70, icon: "❌" },
    { title: "Total sales", value: "UGX 85000", icon: "💰" },
    { title: "Return Rate", value: "5%", icon: "↩️" },
  ];

  // Sample return‐rate data over various dates
  const returnRateData = [
    { date: "2025-01-15", rate: 3.8 },
    { date: "2025-02-10", rate: 4.1 },
    { date: "2025-03-05", rate: 4.7 },
    { date: "2025-04-08", rate: 4.2 },
    { date: "2025-04-09", rate: 4.5 },
    { date: "2025-04-10", rate: 5.0 },
    { date: "2025-04-11", rate: 4.8 },
    { date: "2025-04-12", rate: 5.2 },
    { date: "2025-04-13", rate: 5.0 },
    { date: "2025-04-14", rate: 4.9 },
  ];

  // Helper for filtering based on range + selectedDate
  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();

  const filteredReturnData = returnRateData.filter((d) => {
    const [y, m, day] = d.date.split("-").map(Number);
    if (range === "Today") {
      return d.date === selectedDateStr;
    }
    if (range === "This Month") {
      return y === selectedYear && m - 1 === selectedMonth;
    }
    if (range === "This Year") {
      return y === selectedYear;
    }
    return true;
  });

  return (
    <div className="h-screen font-poppins relative">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 p-5 bg-gray-100 ml-[80px]">
          {/* Date Picker */}
          <div className="mb-5">
            <input
              type="date"
              id="datePicker"
              className="border border-gray-300 rounded px-2 py-1 text-[10px] text-gray-500"
              value={selectedDateStr}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
            />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {summaryData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-lg transition"
              >
                <div className="flex flex-col">
                  <h3 className="text-[11px] font-semibold text-gray-700">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{item.value}</p>
                </div>
                <div className="text-lg">{item.icon}</div>
              </div>
            ))}
          </div>

          {/* Graphs & Order List Section */}
          <div className="flex gap-2 min-h-[300px]">
            {/* Left Column: Return Rate Graph and Recent Claims */}
            <div className="flex flex-col gap-2 w-1/3">
              {/* Return Rate Card */}
              <div className="p-5 bg-white rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[11px] font-semibold text-gray-700">
                    Return Rate
                  </h3>
                  <select
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    className="text-[10px] border border-gray-300 rounded px-1 py-0.5"
                  >
                    <option>Today</option>
                    <option>This Month</option>
                    <option>This Year</option>
                  </select>
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart
                    data={filteredReturnData}
                    margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 8 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={[0, "dataMax"]}
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 8 }}
                    />
                    <Tooltip
                      formatter={(value) => `${value}%`}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{ fontSize: "10px" }}
                      itemStyle={{ fontSize: "10px" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Claims Card */}
              <RecentClaims onViewAll={() => setIsModalOpen(true)} />
            </div>
            
            {/* Right Column: Order List */}
            <div className="w-2/3">
              <div className="p-4 bg-white rounded-lg shadow h-full">
                <h3 className="text-[11px] font-semibold text-gray-700">
                  Order List
                </h3>
                <OrderTable />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render the Claims Modal component */}
      {isModalOpen && (
        <ClaimsModal 
          claims={dummyClaims}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default OrderList;
