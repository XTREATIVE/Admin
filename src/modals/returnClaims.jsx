import React, { useState, useContext } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { ClaimsContext } from "../context/claimscontext";

// ClaimItem component: Renders an individual claim with toggled details.
const ClaimItem = ({ claim }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { approveClaim, rejectClaim } = useContext(ClaimsContext);

  // Helper to generate avatar letters from the claim name.
  const getAvatarLetters = (claim) => {
    const nameParts = claim.name.split(" ");
    if (nameParts.length >= 2) {
      return (
        nameParts[0].charAt(0).toUpperCase() +
        nameParts[1].charAt(0).toUpperCase()
      );
    }
    return claim.name.slice(0, 2).toUpperCase();
  };

  // Helper to format address (e.g., "mukono, uganda" to "Mukono, Uganda")
  const formatAddress = (address) => {
    if (!address || address.trim() === "") return address; // Return original if empty or invalid
    return address
      .split(", ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(", ");
  };

  // Toggle handler for expanding/collapsing the details view.
  const toggleDetails = (e) => {
    e.stopPropagation();
    setShowDetails((prev) => !prev);
  };

  // Handlers for approve and reject actions
  const handleApprove = () => {
    if (claim.id) {
      approveClaim(claim.id);
    }
  };

  const handleReject = () => {
    if (claim.id) {
      rejectClaim(claim.id);
    }
  };

  return (
    <div
      className="border border-gray-200 rounded-md mb-6 shadow-sm p-4"
    >
      {/* Main Claim Top Section */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-3 flex-1">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-[#f9622c] flex items-center justify-center">
            <span className="text-[#280300] font-semibold text-[15px]">
              {getAvatarLetters(claim)}
            </span>
          </div>
          {/* Name & Message */}
          <div>
            <p className="text-[11px] font-semibold text-[#280300]">
              {claim.name}
            </p>
            <p className="text-[10px] text-black-500">
              Claimed a return for {claim.product_name} for{" "}
              {claim.reason.toLowerCase()}
            </p>
          </div>
        </div>
        {/* Status Circle and Time */}
        <div className="flex items-center space-x-3">
          <div
            className={`w-3 h-3 rounded-full mt-1 ${
              claim.status.toLowerCase() === "requested"
                ? "bg-orange-500"
                : "bg-green-500"
            }`}
          ></div>
          <p className="text-[10px] text-gray-400">{claim.time}</p>
        </div>
      </div>

      {/* Address Details */}
      <div className="mb-2">
        <p className="text-[11px] text-gray-800">
          <span className="font-medium">Delivery address:</span>{" "}
          {formatAddress(claim.deliveryAddress) || "No address provided"}
        </p>
      </div>

      {/* Triangle arrow button */}
      <button onClick={toggleDetails} className="focus:outline-none float-right">
        <svg
          className={`w-5 h-5 transform transition-transform ${
            showDetails ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Toggled Details Section */}
      {showDetails && (
        <div className="mt-4 border-t pt-4 flex flex-col md:flex-row items-start">
          {/* Image section */}
          <div className="mr-4 mb-4 md:mb-0 md:w-1/4 flex justify-center md:justify-start">
            <img src={claim.image} alt="Product" className="w-32 h-auto" />
          </div>
          {/* Details section */}
          <div className="md:w-3/4">
            <h4 className="text-[11px] font-semibold text-gray-800 mb-2">
              {claim.giftTitle || claim.product_name}
            </h4>
            <p className="text-[11px] text-gray-600">
              <span className="font-medium">Quantity:</span> {claim.quantity}
            </p>
            <p className="text-[11px] text-gray-600 mt-2">
              {claim.description || claim.reason}
            </p>
            <p className="text-[11px] text-gray-600 mt-1">
              <span className="font-medium">OrderID:</span>{" "}
              {claim.shipper || `ORD${claim.order_item || "12345"}`}
            </p>
            <div className="mt-2">
              <p className="text-[11px] font-semibold text-gray-800">
                UGX {claim.giftPrice || "N/A"}
              </p>
            </div>
            {/* Approve/Reject Buttons for Requested Status */}
            {(claim.status.toLowerCase() === "requested" || claim.status.toLowerCase() === "pending") && (
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={handleApprove}
                  className="flex items-center justify-center w-24 h-8 text-white text-[11px] rounded-md border border-[#f9622c] bg-[#f9622c]"
                  aria-label="Approve claim"
                >
                  <FaCheck className="mr-1" />
                  Approve
                </button>
                <button
                  onClick={handleReject}
                  className="flex items-center justify-center w-24 h-8 bg-[#fff] text-[#280300] text-[11px] rounded-md border border-[#280300]"
                  aria-label="Reject claim"
                >
                  <FaTimes className="mr-1" />
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ClaimsModal = ({ onClose }) => {
  const { claims, isLoading, error } = useContext(ClaimsContext);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-[90%] md:w-[75%] h-[90%] p-6 relative overflow-auto">
          <p className="text-[11px] text-gray-500">Loading claims...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-[90%] md:w-[75%] h-[90%] p-6 relative overflow-auto">
          <p className="text-[11px] text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  // Sort claims by time (latest first)
  const sortedClaims = [...claims].sort((a, b) => {
    return Date.parse(b.time) - Date.parse(a.time);
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[90%] md:w-[75%] h-[90%] p- HSA relative overflow-auto">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        {/* Modal Title */}
        <h3 className="text-[11px] md:text-xl ml-5  font-semibold mb-6 mt-6">
          Return Claims
        </h3>
        {/* Render each claim using the ClaimItem component */}
        {sortedClaims.length === 0 ? (
          <p className="text-[11px] text-gray-500">No claims available.</p>
        ) : (
          sortedClaims.map((claim, idx) => <ClaimItem key={idx} claim={claim} />)
        )}
      </div>
    </div>
  );
};

export default ClaimsModal;