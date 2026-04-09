import React, { useState, useContext } from "react";
import { FaCheck, FaTimes, FaRedo } from "react-icons/fa";
import { ClaimsContext } from "../context/claimscontext";

const ClaimItem = ({ claim }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { approveClaim, rejectClaim } = useContext(ClaimsContext);

  const getAvatarLetters = (name = "") => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatAddress = (address) => {
    if (!address || typeof address !== "string" || address.trim() === "") {
      return "Pioneer Mall, Burton Street, Kampala, Uganda";
    }
    return address
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(", ");
  };

  const handleApprove = async () => {
    if (claim?.id) await approveClaim(claim.id);
  };

  const handleReject = async () => {
    if (claim?.id) await rejectClaim(claim.id);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved": return "bg-green-500";
      case "rejected": return "bg-red-500";
      default: return "bg-orange-500";
    }
  };

  return (
    <div className="border border-gray-200 rounded-md mb-6 shadow-sm p-4 bg-white">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#f9622c] flex items-center justify-center">
            <span className="text-[#280300] font-semibold text-sm">
              {getAvatarLetters(claim.name)}
            </span>
          </div>
          <div>
            <p className="font-semibold text-[#280300]">{claim.name}</p>
            <p className="text-xs text-gray-600">Return for {claim.product_name}</p>
          </div>
        </div>

        <div className="text-right">
          <div className={`inline-block w-3 h-3 rounded-full ${getStatusColor(claim.status)} mb-1`} />
          <p className="text-xs text-gray-500">{claim.time}</p>
        </div>
      </div>

      <p className="text-xs text-gray-700 mb-4">
        <span className="font-medium">Delivery:</span> {formatAddress(claim.deliveryAddress)}
      </p>

      {claim.status?.toLowerCase() === "requested" && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleApprove}
            className="flex-1 bg-[#f9622c] hover:bg-[#e55a20] text-white py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2"
          >
            <FaCheck /> Approve
          </button>
          <button
            onClick={handleReject}
            className="flex-1 border border-[#280300] text-[#280300] hover:bg-gray-50 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2"
          >
            <FaTimes /> Reject
          </button>
        </div>
      )}

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="mt-4 text-[#f9622c] hover:text-orange-700 text-xs font-medium flex items-center gap-1 ml-auto"
      >
        {showDetails ? "Hide" : "Show"} Details
        <span className={`transition-transform ${showDetails ? "rotate-180" : ""}`}>▼</span>
      </button>

      {showDetails && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-col md:flex-row gap-6">
            <img
              src={claim.image || ""}
              alt={claim.product_name}
              className="w-28 h-28 object-contain border rounded"
              onError={(e) => (e.target.style.display = "none")}
            />
            <div className="text-xs space-y-1">
              <p><strong>Reason:</strong> {claim.reason}</p>
              <p><strong>Quantity:</strong> {claim.quantity}</p>
              <p><strong>Amount:</strong> UGX {claim.giftPrice?.toLocaleString() || "N/A"}</p>
              <p><strong>Order Item:</strong> {claim.order_item}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ClaimsModal = ({ onClose }) => {
  const { claims, isLoading, error, retryFetch } = useContext(ClaimsContext);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Return Claims</h2>
          <button onClick={onClose} className="text-3xl text-gray-400 hover:text-black">×</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Loading claims...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-red-600 font-medium mb-2">Error Loading Claims</p>
              <p className="text-gray-600 mb-6 max-w-md">{error}</p>
              
              <button
                onClick={retryFetch}
                className="flex items-center gap-2 bg-[#f9622c] hover:bg-[#e55a20] text-white px-6 py-2.5 rounded-lg font-medium"
              >
                <FaRedo /> Retry
              </button>
            </div>
          ) : claims.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No claims available at the moment.</p>
          ) : (
            claims
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((claim) => <ClaimItem key={claim.id} claim={claim} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimsModal;