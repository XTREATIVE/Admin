import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClaimsContext } from "../context/claimscontext";

const RecentClaims = ({ onViewAll }) => {
  const { claims, isLoading, error } = useContext(ClaimsContext);
  const navigate = useNavigate();

  // Helper to generate avatar letters from the claim name
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
    if (!address || address.trim() === "") return address;
    return address
      .split(", ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(", ");
  };

  if (
    error === "No authentication token found. Please log in." ||
    error === "Authentication failed. Please log in again."
  ) {
    navigate("/");
    return null;
  }

  if (isLoading) {
    return <div className="bg-white rounded shadow p-6 mt-4 text-[11px]">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-white rounded shadow p-6 mt-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  // Sort claims by time (latest first)
  const sortedClaims = [...claims].sort((a, b) => {
    return Date.parse(b.time) - Date.parse(a.time);
  });

  return (
    <div className="bg-white rounded shadow p-6 mt-4">
      {/* Header */}
      <h2 className="font-semibold text-gray-500 mb-4 text-[12px]">
        Return Claims
      </h2>

      {/* Claims List */}
      <div className="space-y-4">
        {sortedClaims.map((claim, idx) => (
          <ClaimItem key={idx} claim={claim} getAvatarLetters={getAvatarLetters} formatAddress={formatAddress} />
        ))}
      </div>

      {/* Link */}
      <p
        className="text-[#f9622c] mt-4 cursor-pointer hover:underline text-[10px]"
        onClick={onViewAll}
      >
        View all Claims
      </p>
    </div>
  );
};

// ClaimItem component: Renders an individual claim with toggled details
const ClaimItem = ({ claim, getAvatarLetters, formatAddress }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Toggle handler for expanding/collapsing the details view
  const toggleDetails = (e) => {
    e.stopPropagation();
    setShowDetails((prev) => !prev);
  };

  return (
    <div
      className="border border-gray-200 rounded-md shadow-sm p-4 cursor-pointer"
      onClick={toggleDetails}
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
              Claimed a return for {claim.product_name}
            </p>
            <p className="text-[10px] text-black-500">
              for {claim.reason.toLowerCase()}
            </p>
          </div>
        </div>
        {/* Status Circle */}
        <div className="flex items-center">
          <div
            className={`w-3 h-3 rounded-full mt-1 ${
              claim.status.toLowerCase() === "requested"
                ? "bg-orange-500"
                : "bg-green-500"
            }`}
          ></div>
        </div>
      </div>

      {/* Address Details and Time */}
      <div className="mb-2">
        <p className="text-[11px] text-gray-800">
          <span className="font-medium">Delivery address:</span>{" "}
          {formatAddress(claim.deliveryAddress) || "No address provided"}
        </p>
        <p className="text-[10px] text-gray-400 mt-1">{claim.time}</p>
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
            <img
              src={claim.image}
              alt="Product"
              className="w-32 h-auto"
            />
          </div>
          {/* Details section */}
          <div className="md:w-3/4">
            <h4 className="text-[11px] font-semibold text-gray-800 mb-2">
              {claim.giftTitle || claim.product_name}
            </h4>
            <p className="text-[11px] text-gray-600">
              <span className="font-medium">Quantity:</span>{" "}
              {claim.quantity}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentClaims;