import React, { useState } from "react";
import ReactDOM from "react-dom";
import { FiX, FiZoomIn, FiChevronDown, FiChevronUp } from "react-icons/fi";
// Import your local images
import ninFrontImg from "../assets/front.jpg";
import ninBackImg from "../assets/back.jpg";
import otherDocImg from "../assets/other-doc.jpg";

/**
 * LoansModal.jsx
 * React‑Vite modal component for displaying a dummy vendor loan application.
 * Uses only its own hard‑coded dummy data.
 */

// ———— Dummy Data ————
const dummyLoan = {
  applicationId: "A0123",
  vendor: { name: "Alinatwe Genny", walletBalance: 10000 },
  requestedAmount: 50000,
  purpose: "Restocking my clothes",
  duration: "1 month",
  paymentFrequency: "weekly",
  nin: "1234567890",
  ninType: "National ID",
  documents: [
    { type: "National ID", uri: ninFrontImg, label: "Front" },
    { type: "National ID", uri: ninBackImg, label: "Back" },
    { type: "Other", uri: otherDocImg },
  ],
  guarantor: "Janet Asimwe",
  appliedDate: "2025-04-20",
  status: "Pending",
  repaymentHistory: [
    { date: "2025-04-27", amount: "260.00" },
    { date: "2025-05-04", amount: "260.00" },
  ],
};

const LoansModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [zoomSrc, setZoomSrc] = useState(null);
  const [docsOpen, setDocsOpen] = useState(true);

  if (!isOpen) return null;

  const {
    applicationId,
    vendor,
    requestedAmount,
    purpose,
    duration,
    paymentFrequency,
    nin,
    ninType,
    documents,
    guarantor,
    appliedDate,
    status,
    repaymentHistory,
  } = dummyLoan;

  // Financial calculations
  const principal = parseFloat(requestedAmount) || 0;
  const weeksInMonth = 4;
  const rates = { weekly: 0.0045, monthly: 0.018 };
  const totalWeekly = principal * (1 + rates.weekly * weeksInMonth);
  const totalMonthly = principal * (1 + rates.monthly);
  const totalRepayable = paymentFrequency === "weekly" ? totalWeekly : totalMonthly;
  const weeklyPayable = (totalWeekly / weeksInMonth).toFixed(2);
  const monthlyPayable = totalMonthly.toFixed(2);

  // Render documents with zoom and download functionality
  const renderDocs = () => {
    if (!documents.length) {
      return <p className="text-gray-500 italic text-[11px]">No documents uploaded.</p>;
    }

    const idDocs = documents.filter((d) => d.type === "National ID");
    const otherDocs = documents.filter((d) => d.type !== "National ID");

    const renderColumn = (title, docs) => (
      <div>
        <p className="text-[11px] font-medium mb-1">{title}</p>
        {docs.length ? (
          docs.map((doc, i) => (
            <div key={i} className="mb-4">
              <div className="relative group w-32">
                <img
                  src={doc.uri}
                  alt={doc.label || doc.type}
                  className="w-full h-auto max-h-24 object-contain border rounded"
                />
                <button
                  onClick={() => setZoomSrc(doc.uri)}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-25 opacity-0 group-hover:opacity-100 transition rounded"
                >
                  <FiZoomIn size={20} className="text-white" />
                </button>
              </div>
              <div className="mt-2">
                <a
                  href={doc.uri}
                  download
                  className="px-2 py-1 rounded text-[11px] text-[#f9622c] hover:bg-gray-300 inline-block"
                >
                  Download
                </a>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic text-[11px]">No {title}.</p>
        )}
      </div>
    );

    return (
      <div className="grid grid-cols-2 gap-6">
        {renderColumn("National ID Documents", idDocs)}
        {renderColumn("Other Documents", otherDocs)}
      </div>
    );
  };

  // Overview data
  const overview = [
    { label: "Application ID", value: applicationId },
    { label: "Vendor Name", value: vendor.name },
    { label: "Wallet Balance", value: vendor.walletBalance },
    { label: "Guarantor", value: guarantor },
    { label: "Status", value: status },
    { label: "Applied Date", value: appliedDate },
  ];

  // Zoom modal rendered into body via portal
  const ZoomModal = () => (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-[9999] p-4"
      onClick={() => setZoomSrc(null)}
    >
      <div className="relative w-full h-full max-w-4xl max-h-screen overflow-auto rounded-lg bg-white p-2">
        <button
          onClick={() => setZoomSrc(null)}
          className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-75 z-10"
        >
          <FiX size={24} />
        </button>
        <img src={zoomSrc} alt="Zoomed document" className="w-full h-auto object-contain" />
      </div>
    </div>
  );

  return (
    <>      
      {/* Main Modal */}
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        onClick={onClose}
      >
        <div
          className="w-[90%] md:w-[75%] max-h-[95vh] overflow-y-auto rounded shadow-lg bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <div className="flex justify-end p-6">
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
              <FiX size={20} />
            </button>
          </div>

          {/* Summary header */}
          <div className="bg-[#f9622c] text-white px-6 py-3 flex justify-between text-center">
            {[
              { label: "Requested Amount", value: principal.toFixed(2) },
              { label: "Total Repayable", value: totalRepayable.toFixed(2) },
              { label: "Applied Date", value: appliedDate },
            ].map((item, idx) => (
              <div key={idx} className="text-[11px]">
                <p>{item.label}</p>
                <p className="font-semibold text-[13px]">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs & Content */}
          <div className="px-6 pt-4">
            <div className="flex space-x-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("details")}
                className={`py-2 text-[11px] border-b-2 transition ${
                  activeTab === "details"
                    ? "border-[#f9622c] text-[#f9622c]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Application Details
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-2 text-[11px] border-b-2 transition ${
                  activeTab === "history"
                    ? "border-[#f9622c] text-[#f9622c]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Repayment History
              </button>
            </div>

            {activeTab === "details" && (
              <div className="mt-6 space-y-6">
                {/* Overview grid */}
                <div className="grid grid-cols-3 gap-4">
                  {overview.map((o) => (
                    <div key={o.label}>
                      <p className="text-gray-500 text-[11px]">{o.label}</p>
                      <p className="text-gray-700 text-[11px] font-medium">{o.value}</p>
                    </div>
                  ))}
                </div>

                {/* Specifics grid */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Loan Purpose", value: purpose },
                    { label: "Duration", value: duration },
                    { label: "Payment Plan", value: paymentFrequency },
                    { label: "Weekly Payable", value: weeklyPayable },
                    { label: "Monthly Payable", value: monthlyPayable },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-gray-500	text-[11px]">{s.label}</p>
                      <p className="text-gray-700 text-[11px] font-medium">{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* NIN info */}
                <div>
                  <p className="text-gray-500 text-[11px]">NIN Number ({ninType})</p>
                  <p className="text-gray-700	text-[11px] font-medium">{nin}</p>
                </div>

                {/* Documents section */}
                <div>
                  <div className="border rounded-md">
                    <div
                      className="px-4 py-2 bg-gray-100 cursor-pointer text-[11px] font-medium flex justify-between items-center"
                      onClick={() => setDocsOpen(!docsOpen)}
                    >
                      <span>Uploaded Documents</span>
                      {docsOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </div>
                    {docsOpen && <div className="p-4 text-[11px]">{renderDocs()}</div>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="mt-6">
                {repaymentHistory.length ? (
                  <ul className="divide-y divide-gray-200">
                    {repaymentHistory.map((item, i) => (
                      <li key={i} className="flex justify-between py-2 text-[13px]">
                        <span className="text-gray-700">{item.date}</span>
                        <span className="font-medium	text-gray-900">{item.amount}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 text-[11px]">No repayment history available.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zoom Modal via Portal */}
      {zoomSrc && ReactDOM.createPortal(<ZoomModal />, document.body)}
    </>
  );
};

export default LoansModal;
