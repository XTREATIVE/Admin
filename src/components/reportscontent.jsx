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
import { ProductsContext } from "../context/allproductscontext";

import { blocks } from "../data/reportsdata";
import topProductImg from "../assets/Shirt.jpg";
import logoImg from "../assets/logo.png";

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
  const [topProductImgBase64, setTopProductImgBase64] = useState("");
  const [logoImgBase64, setLogoImgBase64] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [loanActiveTab, setLoanActiveTab] = useState("applications");
  const [financialActiveTab, setFinancialActiveTab] = useState("upcoming");
  const reportRef = useRef();

  // Convert topProductImg to Base64
  useEffect(() => {
    const convertImageToBase64 = async () => {
      try {
        const response = await fetch(topProductImg);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => setTopProductImgBase64(reader.result);
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Failed to convert top product image to Base64:", error);
        setTopProductImgBase64("");
      }
    };
    convertImageToBase64();
  }, []);

  // Convert logoImg to Base64
  useEffect(() => {
    const convertLogoToBase64 = async () => {
      try {
        const response = await fetch(logoImg);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoImgBase64(reader.result);
          console.log("Logo image loaded successfully");
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Failed to convert logo image to Base64:", error);
        setLogoImgBase64("");
      }
    };
    convertLogoToBase64();
  }, []);

  const openTabs = useMemo(
    () =>
      reportType === "sales"
        ? [
            { key: "sales", label: `Sales Report: ${fromDate} - ${toDate}` },
            { key: "summary", label: "Sales Summary" },
            { key: "orderStats", label: "Sales Leaderboard" },
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

  // Filter & search for Sales Report
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
        return data.sort((a, b) => b.vendor.localeCompare(b.vendor));
      default:
        return data.sort((a, b) => new Date(b.date) - new Date(b.date));
    }
  }, [filteredData, sortOption]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / ITEMS_PER_PAGE));
  const pageData = isGeneratingPDF
    ? sortedData
    : sortedData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
        return data.sort((a, b) => b.vendor.localeCompare(b.vendor));
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

  const topVendor = vendorRankingData[0] || { vendor: "N/A", sales: 0 };
  const topProduct = productRankingData[0] || { product: "N/A", count: 0 };

  // PDF export
  const handleGeneratePDF = async () => {
    if (!reportRef.current) {
      console.error("Report reference is not available");
      return;
    }

    if (!logoImgBase64) {
      console.error("Logo image is not loaded");
      return;
    }

    try {
      setIsGeneratingPDF(true);
      // Wait for the DOM to update with isGeneratingPDF = true
      await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay to ensure re-render

      const pdf = new jsPDF("p", "pt", "a4");

      // Load and register Poppins font
      let poppinsRegistered = false;
      try {
        const poppinsRegularResponse = await fetch(
          "https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecn1HGF0.ttf"
        );
        if (!poppinsRegularResponse.ok) throw new Error("Font file not found");
        const poppinsRegularBlob = await poppinsRegularResponse.blob();
        const poppinsRegularReader = new FileReader();
        await new Promise((resolve) => {
          poppinsRegularReader.onloadend = () => {
            const base64data = poppinsRegularReader.result.split(",")[1];
            pdf.addFileToVFS("Poppins-Regular.ttf", base64data);
            pdf.addFont("Poppins-Regular.ttf", "Poppins", "normal");
            console.log("Poppins Regular font loaded successfully");
            resolve();
          };
          poppinsRegularReader.readAsDataURL(poppinsRegularBlob);
        });

        const poppinsBoldResponse = await fetch(
          "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.ttf"
        );
        if (!poppinsBoldResponse.ok) throw new Error("Font file not found");
        const poppinsBoldBlob = await poppinsBoldResponse.blob();
        const poppinsBoldReader = new FileReader();
        await new Promise((resolve) => {
          poppinsBoldReader.onloadend = () => {
            const base64data = poppinsBoldReader.result.split(",")[1];
            pdf.addFileToVFS("Poppins-Bold.ttf", base64data);
            pdf.addFont("Poppins-Bold.ttf", "Poppins", "bold");
            console.log("Poppins Bold font loaded successfully");
            poppinsRegistered = true;
            resolve();
          };
          poppinsBoldReader.readAsDataURL(poppinsBoldBlob);
        });
      } catch (error) {
        console.error("Failed to load Poppins font:", error);
        poppinsRegistered = false;
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
      const canvas = await html2canvas(reportRef.current, {
        scale: 3,
        logging: true,
        useCORS: true,
        windowWidth: reportRef.current.scrollWidth,
        windowHeight: reportRef.current.scrollHeight,
      });

      console.log("Canvas dimensions:", canvas.width, canvas.height);

      const imgData = canvas.toDataURL("image/png");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      const headerHeight = 60;
      const footerMargin = 20;
      const adjustedPageHeight = pageHeight - headerHeight - footerMargin;
      const totalPages = Math.ceil(imgHeight / adjustedPageHeight);

      console.log("Total PDF pages:", totalPages, "Image height:", imgHeight);

      // Determine the active tab label for the filename and header
      let activeTabLabel = "";
      if (reportType === "sales") {
        const activeTabObj = openTabs.find((tab) => tab.key === activeTab);
        activeTabLabel = activeTabObj ? activeTabObj.label : "Unknown";
      } else if (reportType === "loan") {
        const loanTabs = [
          { key: "applications", label: "Applications" },
          { key: "due", label: "Due & Overdue Loans" },
          { key: "history", label: "Repayment History" },
          { key: "overview", label: "Summary & Leaderboard" },
          { key: "details", label: "Loan Details" },
        ];
        const activeLoanTab = loanTabs.find((tab) => tab.key === loanActiveTab);
        activeTabLabel = activeLoanTab ? activeLoanTab.label : "Unknown";
      } else if (reportType === "financial") {
        const financialTabs = [
          { key: "upcoming", label: "Upcoming Payouts" },
          { key: "pending", label: "Pending Payouts" },
          { key: "history", label: "Payout History" },
          { key: "refunds", label: "Refunds/Cancelled Payouts" },
          { key: "summary", label: "Summary & Payout Leaderboard" },
        ];
        const activeFinancialTabObj = financialTabs.find((tab) => tab.key === financialActiveTab);
        activeTabLabel = activeFinancialTabObj ? activeFinancialTabObj.label : "Unknown";
      } else {
        // For other report types (orders, product)
        activeTabLabel = reportType.charAt(0).toUpperCase() + reportType.slice(1);
      }

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        const logoHeight = 40;
        const logoWidth = logoHeight * 2;
        const margin = 20;

        const leftLogoX = margin;
        const logoY = 10;
        pdf.addImage(
          logoImgBase64,
          "PNG",
          leftLogoX,
          logoY,
          logoWidth,
          logoHeight
        );

        const sectionWidth = pageWidth / 3;
        const middleText = `${
          reportType.charAt(0).toUpperCase() + reportType.slice(1)
        } Report`;
        const tabText = `${activeTabLabel}`; // Active tab name wrapped in brackets
        const generatedText = `Generated on: ${new Date().toLocaleDateString()}`;

        // Report Type Heading
        pdf.setFont(poppinsRegistered ? "Poppins" : "Helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        const middleTextWidth = pdf.getTextWidth(middleText);
        const middleTextX = sectionWidth + (sectionWidth - middleTextWidth) / 2;
        const middleTextY = logoY + 15;
        pdf.text(middleText, middleTextX, middleTextY);

        // Active Tab Name (below Report Type)
        pdf.setFont(poppinsRegistered ? "Poppins" : "Helvetica", "bold");
        pdf.setFontSize(7);
        pdf.setTextColor(128, 128, 128); // Slightly lighter color for distinction
        const tabTextWidth = pdf.getTextWidth(tabText);
        const tabTextX = sectionWidth + (sectionWidth - tabTextWidth) / 2;
        const tabTextY = middleTextY + 16; // Position below the report type
        pdf.text(tabText, tabTextX, tabTextY);

        // Generated On Text (below Tab Name)
        pdf.setFont(poppinsRegistered ? "Poppins" : "Helvetica", "bold");
        pdf.setFontSize(7);
        pdf.setTextColor(128, 128, 128);
        const generatedTextWidth = pdf.getTextWidth(generatedText);
        const generatedTextX = sectionWidth + (sectionWidth - generatedTextWidth) / 2;
        const generatedTextY = tabTextY + 10; // Position below the tab name
        pdf.text(generatedText, generatedTextX, generatedTextY);

        const rightText1 = `Start Date: ${fromDate}`;
        const rightText2 = `End Date: ${toDate}`;
        pdf.setFont(poppinsRegistered ? "Poppins" : "Helvetica", "bold");
        pdf.setFontSize(7);

        const rightText1Width = pdf.getTextWidth(rightText1);
        const rightText2Width = pdf.getTextWidth(rightText2);
        const maxRightTextWidth = Math.max(rightText1Width, rightText2Width);

        const rightTextX = pageWidth - maxRightTextWidth - margin;
        const rightTextY1 = logoY + 10;
        const rightTextY2 = rightTextY1 + 15;

        pdf.text(rightText1, rightTextX, rightTextY1);
        pdf.text(rightText2, rightTextX, rightTextY2);

        pdf.setDrawColor(240, 240, 240);
        pdf.line(margin, headerHeight - 5, pageWidth - margin, headerHeight - 5);

        console.log(
          `Page ${page + 1} - Header added:`,
          `Left Logo position: (${leftLogoX}, ${logoY})`,
          `Middle Text: "${middleText}" at (${middleTextX}, ${middleTextY})`,
          `Tab Text: "${tabText}" at (${tabTextX}, ${tabTextY})`,
          `Generated Text: "${generatedText}" at (${generatedTextX}, ${generatedTextY})`,
          `Right Text 1: "${rightText1}" at (${rightTextX}, ${rightTextY1})`,
          `Right Text 2: "${rightText2}" at (${rightTextX}, ${rightTextY2})`,
          `Logo size: ${logoWidth}x${logoHeight}`
        );

        const offsetY = page * adjustedPageHeight;
        const startY = headerHeight;
        const visibleHeight = Math.min(adjustedPageHeight, imgHeight - offsetY);
        if (visibleHeight > 0) {
          pdf.setGState(new pdf.GState({ opacity: 0.9 }));
          pdf.addImage(
            imgData,
            "PNG",
            0,
            startY + offsetY,
            pageWidth,
            visibleHeight,
            undefined,
            "FAST"
          );
          pdf.setGState(new pdf.GState({ opacity: 1 }));

          pdf.setFont(poppinsRegistered ? "Poppins" : "Helvetica", "normal");
          pdf.setFontSize(7);
          pdf.setTextColor(200, 200, 200);
          const pageText = `Page ${page + 1}`;
          const pageTextWidth = pdf.getTextWidth(pageText);
          const pageTextX = pageWidth - pageTextWidth - margin;
          const pageTextY = pageHeight - footerMargin + 5;
          pdf.text(pageText, pageTextX, pageTextY);
        }
      }

      // Sanitize the activeTabLabel to remove invalid filename characters
      const sanitizedTabLabel = activeTabLabel.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_");

      // Save the PDF with the active tab label in the filename
      pdf.save(`report_${reportType}_${sanitizedTabLabel}_${fromDate}_to_${toDate}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden text-[11px] bg-gray-50">
      {/* Spinner Loader Overlay */}
      {isGeneratingPDF && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-[#f9622c] rounded-full animate-spin"></div>
            <p className="mt-2 text-white text-sm">Generating PDF...</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center px-6 py-4 bg-white space-x-4">
        <div className="relative">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border rounded px-2 py-1 pr-8 text-gray-700"
          >
            <option value="sales">Sales Reports</option>
            <option value="loan">Loan Reports</option>
            <option value="financial">Financial Reports</option>
            <option value="orders">Order Reports</option>
            <option value="product">Product Reports</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="Vendor name…"
          value={userFilter}
          onChange={(e) => {
            setUserFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded px-2 py-1 text-gray-700"
        />
        <div className="relative flex-1 max-w-xs">
          <Search
            size={14}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search Order ID, product, vendor, etc."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-8 w-full border rounded px-2 py-1 text-gray-700"
          />
        </div>
        <div className="relative">
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded px-2 py-1 pr-8 text-gray-700"
          >
            {FILTER_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center ml-auto space-x-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded px-2 py-1 text-gray-700"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded px-2 py-1 text-gray-700"
          />
          <button
            onClick={handleGeneratePDF}
            className="bg-[#f9622c] text-white rounded px-4 py-1 hover:bg-orange-800 disabled:opacity-50"
            disabled={isGeneratingPDF}
          >
            Generate PDF
          </button>
        </div>
      </div>

      {/* Sub-tabs - Hide during PDF generation */}
      {reportType === "sales" && !isGeneratingPDF && (
        <div className="flex border-b bg-gray-100 px-6">
          {openTabs.map((tab) => (
            <div
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 text-center py-2 cursor-pointer text-gray-700 ${
                activeTab === tab.key
                  ? "bg-white border-t border-l border-r"
                  : "hover:text-gray-900"
              }`}
            >
              {tab.label}
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-6" ref={reportRef}>
        {/* SALES */}
        {reportType === "sales" && activeTab === "sales" && (
          <div className="bg-white border rounded-lg p-4">
            <table className="min-w-full text-left text-[10px] border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {[
                    "Date",
                    "Time",
                    "Vendor",
                    "Order ID",
                    "Sales (UGX)",
                    "Commission (UGX)",
                    "Net Payout (UGX)",
                  ].map((h) => (
                    <th key={h} className="px-2 py-1 border">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((b, i) => (
                  <tr key={i} className="border-t">
                    {[
                      b.date,
                      b.time,
                      b.vendor,
                      b.orderid,
                      b.sales,
                      b.commissionAmount,
                      b.netPayout,
                    ].map((c, j) => (
                      <td key={j} className="px-2 py-1 border ">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {!isGeneratingPDF && (
              <div className="flex justify-center space-x-2 py-2 mt-4 text-[11px]">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 border rounded text-gray-600 disabled:opacity-50"
                >
                  Previous
                </button>
                <span>
                  {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 border rounded text-gray-600 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {reportType === "sales" && activeTab === "summary" && (
          <div className="bg-white border rounded-lg p-4">
            <div className="flex justify-between bg-gray-50 px-3 py-2 font-semibold mb-4 text-[11px]">
              <span>Sales Summary: {fromDate} – {toDate}</span>
              <span>Total Sales: UGX {totals.sales.toFixed(2)}</span>
            </div>
            <table className="min-w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {[
                    "Vendor",
                    "Orders",
                    "Sales (UGX)",
                    "Commission (UGX)",
                    "Net Payout (UGX)",
                  ].map((h) => (
                    <th key={h} className="px-2 py-1 border">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedSummary.map((r, i) => (
                  <tr key={i} className="border-t">
                    {[
                      r.vendor,
                      r.orders,
                      r.sales.toFixed(2),
                      r.commission.toFixed(2),
                      r.net.toFixed(2),
                    ].map((c, j) => (
                      <td key={j} className="px-2 py-1 border">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-2 py-1 border">Totals</td>
                  <td className="px-2 py-1 border">{totals.orders}</td>
                  <td className="px-2 py-1 border">{totals.sales.toFixed(2)}</td>
                  <td className="px-2 py-1 border">{totals.commission.toFixed(2)}</td>
                  <td className="px-2 py-1 border">{totals.net.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {reportType === "sales" && activeTab === "orderStats" && (
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-4 text-gray-800">
              Sales Leaderboard: {fromDate} – {toDate}
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-64">
                <h4 className="font-medium mb-2 text-gray-700">Top 5 Vendors</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={vendorRankingData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="vendor" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip
                      formatter={(v) => new Intl.NumberFormat().format(v)}
                    />
                    <Bar
                      dataKey="sales"
                      name="Sales (UGX)"
                      barSize={20}
                      fill="#4a5568"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="h-64">
                <h4 className="font-medium mb-2 text-gray-700">Top 5 Products</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={productRankingData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="product" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      name="Units Sold"
                      barSize={20}
                      fill="#4a5568"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="border-t py-3 px-4 flex justify-between items-center mt-4">
              <div className="flex items-center space-x-3">
                {topProductImgBase64 ? (
                  <img
                    src={topProductImgBase64}
                    alt={topProduct.product}
                    className="w-8 h-8 rounded border"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 flex items-center justify-center text-gray-500 text-[10px] border rounded">
                    No Image
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-700">#1 Top Product</div>
                  <div className="text-gray-600">
                    {topProduct.product} – {topProduct.count} units
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-700">#1 Top Vendor</div>
                <div className="text-gray-600">
                  {topVendor.vendor} –{" "}
                  {new Intl.NumberFormat().format(topVendor.sales)} UGX
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOAN REPORT */}
        {reportType === "loan" && (
          <LoanReport
            searchTerm={searchTerm}
            isGeneratingPDF={isGeneratingPDF}
            onTabChange={(tabKey) => setLoanActiveTab(tabKey)}
          />
        )}

        {/* FINANCIAL REPORT */}
        {reportType === "financial" && (
          <FinancialReports
            searchTerm={searchTerm}
            isGeneratingPDF={isGeneratingPDF}
            onTabChange={(tabKey) => setFinancialActiveTab(tabKey)}
          />
        )}

        {/* ORDER REPORT */}
        {reportType === "orders" && (
          <OrderReports
            searchTerm={searchTerm}
            hideTabsWhenGeneratingPDF={isGeneratingPDF}
          />
        )}

        {/* PRODUCT REPORT */}
        {reportType === "product" && (
          <ProductReports
            searchTerm={searchTerm}
            disableReviewsPagination={true}
            isGeneratingPDF={isGeneratingPDF}
          />
        )}
      </div>
    </div>
  );
}