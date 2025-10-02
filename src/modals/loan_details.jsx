import React, { useState, useContext } from "react";
import ReactDOM from "react-dom";
import { FiX, FiZoomIn, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FaCheck, FaTimes } from "react-icons/fa";
import { LoansContext } from "../context/loanscontext";

/**
 * LoansModal.jsx
 * React‑Vite modal component for displaying a vendor loan application.
 * Uses loan data passed via props and LoansContext for updates.
 * Shows a permanent green "APPROVED" watermark when the loan status is "Approved".
 */

const LoansModal = ({ isOpen, onClose, loan }) => {
      const { vendors, approveLoan, rejectLoan, error } = React.useContext(LoansContext);
      const [activeTab, setActiveTab] = React.useState('details');
      const [zoomSrc, setZoomSrc] = React.useState(null);
      const [docsOpen, setDocsOpen] = React.useState(true);
      const [isApproving, setIsApproving] = React.useState(false);
      const [isRejecting, setIsRejecting] = React.useState(false);
      const [actionError, setActionError] = React.useState(null);

      if (!isOpen || !loan) return null;

      const {
        id: applicationId = '',
        vendor_username = 'Unknown',
        vendor_email = 'Unknown',
        amount = 0,
        purpose = '-',
        duration = 0,
        payment_frequency = '-',
        national_id_number = '-',
        national_id_photo_url = null,
        business_documents_url = null,
        guarantor_details = [],
        status = 'Pending',
        created_at = new Date().toISOString(),
        total_repayable = 0,
        weekly_payment = 0,
        monthly_payment = 0,
        current_balance = 0,
        rejection_reason = null,
      } = loan;

      const guarantorUsernames = Array.isArray(guarantor_details) && guarantor_details.length > 0
        ? guarantor_details.map(g => g.username).join('\n')
        : '-';

      const principal = parseFloat(amount) || 0;
      const totalRepayable = parseFloat(total_repayable) || principal;
      const weeklyPayable = parseFloat(weekly_payment) || 0;
      const monthlyPayable = parseFloat(monthly_payment) || 0;

      const documents = [];
      if (national_id_photo_url) {
        documents.push({ type: 'National ID', uri: national_id_photo_url, label: 'National ID' });
      }
      if (business_documents_url) {
        documents.push({ type: 'Business Document', uri: business_documents_url, label: 'Business Document' });
      }

      const handleApprove = async () => {
        setIsApproving(true);
        setActionError(null);
        try {
          await approveLoan(applicationId);
        } catch (err) {
          setActionError(err.message || 'Failed to approve loan');
        } finally {
          setIsApproving(false);
        }
      };

      const handleReject = async () => {
        setIsRejecting(true);
        setActionError(null);
        try {
          const rejectionReason = prompt('Please provide a reason for rejection:');
          if (!rejectionReason) {
            setActionError('Rejection reason is required');
            return;
          }
          await rejectLoan(applicationId, rejectionReason);
          onClose();
        } catch (err) {
          setActionError(err.message || 'Failed to reject loan');
        } finally {
          setIsRejecting(false);
        }
      };

      const renderDocs = () => {
        if (!documents.length) {
          return <p className="text-gray-500 italic text-[11px]">No documents uploaded.</p>;
        }

        const idDocs = documents.filter(d => d.type === 'National ID');
        const otherDocs = documents.filter(d => d.type !== 'National ID');

        const renderColumn = (title, docs) => (
          <div>
            <p className="text-[11px] font-medium mb-1">{title}</p>
            {docs.length ? (
              docs.map((doc, i) => (
                <div key={i} className="mb-4">
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
                  <a
                    href={doc.uri}
                    download
                    className="px-2 py-1 rounded text-[11px] text-[#f9622c] hover:bg-gray-300 inline-block"
                  >
                    Download
                  </a>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic text-[11px]">No {title}.</p>
            )}
          </div>
        );

        return (
          <div className="grid grid-cols-2 gap-6">
            {renderColumn('National ID Documents', idDocs)}
            {renderColumn('Other Documents', otherDocs)}
          </div>
        );
      };

      const overview = [
        { label: 'Application ID', value: applicationId },
        { label: 'Vendor Name', value: vendor_username },
        { label: 'Vendor Email', value: vendor_email },
        { label: 'Guarantors', value: guarantorUsernames },
        { label: 'Status', value: status },
        { label: 'Applied Date', value: created_at.split('T')[0] },
        { label: 'Rejection Reason', value: rejection_reason || '-' },
      ];

      const ZoomModal = () => ReactDOM.createPortal(
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
        </div>,
        document.body
      );

      return (
        <>
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={onClose}
          >
            <div
              className="w-[90%] md:w-[75%] max-h-[95vh] overflow-y-auto rounded shadow-lg bg-white relative"
              onClick={e => e.stopPropagation()}
            >
              {status === 'Approved' && (
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                  <div
                    className="text-green-600 text-[100px] font-bold rotate-[-45deg]"
                    style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}
                  >
                    APPROVED
                  </div>
                </div>
              )}
              <div className="flex justify-end p-6">
                <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                  <FiX size={20} />
                </button>
              </div>
              <div className="bg-gray-100 text-gray-600 px-6 py-3 flex justify-between text-center">
                {[
                  { label: 'Requested Amount', value: principal.toLocaleString('en-UG') },
                  { label: 'Total Repayable', value: totalRepayable.toLocaleString('en-UG') },
                  { label: 'Applied Date', value: created_at.split('T')[0] },
                ].map((item, idx) => (
                  <div key={idx} className="text-[11px]">
                    <p>{item.label}</p>
                    <p className="font-semibold text-[13px] text-[#f9622c]">
                      {item.label.includes('Amount') ? `UGX ${item.value}` : item.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="px-6 pt-4">
                <div className="flex space-x-4 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`py-2 text-[11px] border-b-2 transition ${
                      activeTab === 'details' ? 'border-[#f9622c] text-[#f9622c]' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Application Details
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`py-2 text-[11px] border-b-2 transition ${
                      activeTab === 'history' ? 'border-[#f9622c] text-[#f9622c]' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Repayment History
                  </button>
                </div>
                {activeTab === 'details' && (
                  <div className="mt-6 space-y-6">
                    {(error || actionError) && (
                      <div className="text-red-600 text-[11px] text-center">{error || actionError}</div>
                    )}
                    <div className="grid grid-cols-3 gap-4">
                      {overview.map(o => (
                        <div key={o.label}>
                          <p className="text-gray-500 text-[11px]">{o.label}</p>
                          <p className="text-gray-700 text-[11px] font-medium" style={{ whiteSpace: 'pre-line' }}>
                            {o.value}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Loan Purpose', value: purpose },
                        { label: 'Duration', value: `${duration} months` },
                        { label: 'Payment Plan', value: payment_frequency },
                        { label: 'Weekly Payable', value: `UGX ${weeklyPayable.toLocaleString('en-UG')}` },
                        { label: 'Monthly Payable', value: `UGX ${monthlyPayable.toLocaleString('en-UG')}` },
                      ].map(s => (
                        <div key={s.label}>
                          <p className="text-gray-500 text-[11px]">{s.label}</p>
                          <p className="text-gray-700 text-[11px] font-medium">{s.value}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-gray-500 text-[11px]">NIN Number</p>
                      <p className="text-gray-700 text-[11px] font-medium">{national_id_number}</p>
                    </div>
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
                    {status === 'Pending' && (
                      <div className="flex justify-end space-x-4 mt-6 pb-6">
                        <button
                          className="flex items-center justify-center w-24 h-8 text-white text-[11px] rounded-md border border-[#f9622c] bg-[#f9622c]"
                          onClick={handleApprove}
                          disabled={isApproving || isRejecting}
                        >
                          <FaCheck className="mr-1" />
                          {isApproving ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          className="flex items-center justify-center w-24 h-8 bg-[#fff] text-[#280300] text-[11px] rounded-md border border-[#280300]"
                          onClick={handleReject}
                          disabled={isRejecting || isApproving}
                        >
                          <FaTimes className="mr-1" />
                          {isRejecting ? 'Rejecting...' : 'Reject'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'history' && (
                  <div className="mt-6 pb-6">
                    <p className="text-center text-gray-500 text-[11px]">
                      No repayment history available.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {zoomSrc && <ZoomModal />}
        </>
      );
    };

export default LoansModal;