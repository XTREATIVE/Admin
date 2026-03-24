// src/components/LoanDetails.jsx
import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom';
import { FiZoomIn } from 'react-icons/fi';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LoansContext } from '../context/loanscontext';

export default function LoanDetails() {
  const {
    vendors,
    loans,
    repaymentHistory,
    loading,
    error,
  } = useContext(LoansContext);

  const [activeVendorIndex, setActiveVendorIndex] = useState(0);
  const [zoomSrc, setZoomSrc] = useState(null);

  if (loading) return <p className="p-4 text-[11px]">Loading…</p>;
  if (error)   return <p className="p-4 text-red-600 text-[11px]">Error: {error}</p>;
  if (!vendors.length) return <p className="p-4 text-[11px]">No vendors found.</p>;

  const vendor = vendors[activeVendorIndex];
  // Filter all loans for this vendor
  const apps = (Array.isArray(loans) ? loans : []).filter(l => l.vendor_username === vendor.username);

  const prevVendor = () => setActiveVendorIndex(i => Math.max(0, i - 1));
  const nextVendor = () => setActiveVendorIndex(i => Math.min(vendors.length - 1, i + 1));

  const renderDocs = (loan) => {
    const docs = [];
    if (loan.national_id_photo) docs.push({ uri: loan.national_id_photo, label: 'National ID' });
    if (loan.business_documents) docs.push({ uri: loan.business_documents, label: 'Business Doc' });

    if (!docs.length) return <p className="text-gray-500 italic text-[11px]">No documents uploaded.</p>;

    return (
      <div className="grid grid-cols-2 gap-4">
        {docs.map((doc, i) => (
          <div key={i}>
            <div className="relative group w-32">
              <img
                src={doc.uri}
                alt={doc.label}
                className="w-full h-auto max-h-24 object-contain border rounded"
              />
              <button
                onClick={() => setZoomSrc(doc.uri)}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-25 opacity-0 group-hover:opacity-100 transition rounded"
              >
                <FiZoomIn size={20} className="text-white" />
              </button>
            </div>
            <a href={doc.uri} download className="text-[11px] text-[#f9622c] hover:underline">
              Download
            </a>
          </div>
        ))}
      </div>
    );
  };

  const ZoomModal = () => (
    ReactDOM.createPortal(
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
        onClick={() => setZoomSrc(null)}
      >
        <img src={zoomSrc} alt="Zoom" className="max-w-full max-h-full" />
      </div>,
      document.body
    )
  );

  return (
    <div className="flex h-full">
      {/* Vendor Tabs */}
      <div className="flex-shrink-0 w-40 border-r overflow-y-auto">
        <ul className="flex flex-col">
          {vendors.map((v, idx) => (
            <li
              key={v.id}
              className={`cursor-pointer px-3 py-2 text-[11px] ${
                idx === activeVendorIndex
                  ? 'bg-white font-semibold border-l-4 border-[#f9622c]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveVendorIndex(idx)}
            >
              {v.username}
            </li>
          ))}
        </ul>
      </div>

      {/* Details Panel */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevVendor} disabled={activeVendorIndex === 0} className="p-1 disabled:opacity-50">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold">{vendor.username} Loans</h2>
          <button onClick={nextVendor} disabled={activeVendorIndex === vendors.length - 1} className="p-1 disabled:opacity-50">
            <ChevronRight size={20} />
          </button>
        </div>

        {apps.length ? (
          apps.map((loan, i) => (
            <div key={i} className="border rounded bg-white p-4 mb-6">
              <h3 className="font-semibold text-[12px] mb-2">Application ID: {loan.id}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-[11px] mb-4">
                <div>
                  <p className="text-gray-500">Vendor Name</p>
                  <p className="font-medium">{loan.vendor_username}</p>
                </div>
                <div>
                  <p className="text-gray-500">Wallet Balance</p>
                  <p className="font-medium">UGX {loan.vendor_balance?.toLocaleString('en-UG') || '–'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Guarantors</p>
                  <p className="font-medium whitespace-pre-line">
                    {(loan.guarantors || []).map(id => {
                      const g = vendors.find(v => v.id === id);
                      return g ? g.username : 'Unknown';
                    }).join('\n') || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium">{loan.status}</p>
                </div>
                <div>
                  <p className="text-gray-500">Applied Date</p>
                  <p className="font-medium">{loan.created_at.split('T')[0]}</p>
                </div>
                <div>
                  <p className="text-gray-500">Loan Purpose</p>
                  <p className="font-medium">{loan.purpose || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Duration</p>
                  <p className="font-medium">{loan.duration} months</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment Plan</p>
                  <p className="font-medium">{loan.payment_frequency}</p>
                </div>
                <div>
                  <p className="text-gray-500">Weekly Payable</p>
                  <p className="font-medium">UGX {loan.weekly_payment}</p>
                </div>
                <div>
                  <p className="text-gray-500">Monthly Payable</p>
                  <p className="font-medium">UGX {loan.monthly_payment}</p>
                </div>
                <div>
                  <p className="text-gray-500">NIN Number</p>
                  <p className="font-medium">{loan.national_id_number}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 text-[11px] mb-2">Uploaded Documents</p>
                {renderDocs(loan)}
              </div>

              {/* Repayment History for this loan */}
              <div className="mt-4">
                <h4 className="text-[11px] font-medium mb-1">Repayment History</h4>
                {repaymentHistory.filter(r => r.loanId === loan.id).length ? (
                  <table className="min-w-full text-left text-[10px] border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 border">Date</th>
                        <th className="px-4 py-2 border">Amount Paid</th>
                        <th className="px-4 py-2 border">Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repaymentHistory
                        .filter(r => r.loanId === loan.id)
                        .map((h, j) => (
                          <tr key={j} className="hover:bg-gray-100">
                            <td className="px-4 py-2 border">{h.paidDate?.split('T')[0] || '-'}</td>
                            <td className="px-4 py-2 border">UGX {h.amountPaid.toLocaleString('en-UG')}</td>
                            <td className="px-4 py-2 border">{h.paymentMethod || '-'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 italic text-[11px]">No repayments for this loan.</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic text-[11px]">No loan applications for this vendor.</p>
        )}

        {/* Zoom Modal */}
        {zoomSrc && <ZoomModal />}
      </div>
    </div>
  );
}
