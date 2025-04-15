// ClaimsModal.js
import React, { useState } from "react";
import Shirt from "../assets/Shirt.jpg";

// ClaimItem component: Renders an individual claim with toggled details.
const ClaimItem = ({ claim }) => {
  const [showDetails, setShowDetails] = useState(false);

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

  // Toggle handler for expanding/collapsing the details view.
  const toggleDetails = (e) => {
    // Prevent event bubbling so clicking the button doesn't trigger the parent onClick.
    e.stopPropagation();
    setShowDetails((prev) => !prev);
  };

  return (
    <div
      className="border border-gray-200 rounded-md mb-6 shadow-sm p-4 cursor-pointer"
      onClick={toggleDetails}
    >
      {/* Main Claim Top Section */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-3">
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
            <p className="text-[10px] text-black-500">{claim.message}</p>
          </div>
        </div>
        {/* Duration on the right */}
        <p className="text-[10px] text-gray-400">{claim.time}</p>
      </div>

      {/* Address Details */}
      <div className="mb-2">
       
        <p className="text-[11px] text-gray-800">
          <span className="font-medium">Return address:</span>{" "}
          {claim.deliveryAddress ||
            "Pioneer Mall, Burton Street, Kampala, Uganda"}
        </p>
      </div>

      {/* Triangle arrow button */}
      <button onClick={toggleDetails} className="focus:outline-none float-right">
        <svg
          className={`w-6 h-6 transform transition-transform ${
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
              src={claim.image || Shirt}
              alt="Product"
              className="w-32 h-auto"
            />
          </div>
          {/* Details section */}
          <div className="md:w-3/4">
            <h4 className="text-[11px] font-semibold text-gray-800 mb-2">
              {claim.giftTitle || "Sweater Shirt"}
            </h4>
            <p className="text-[11px] text-gray-600">
              <span className="font-medium">Quantity:</span>{" "}
              {claim.quantity || "1"}
            </p>
            <p className="text-[11px] text-gray-600 mt-2">
              {claim.description ||
                "Item received damaged. Also, I ordered color red and I received color black."}
            </p>
            <p className="text-[11px] text-gray-600 mt-1">
              <span className="font-medium">OrderID:</span>{" "}
              {claim.shipper || "#ORD12345"}
            </p>
            <div className="mt-2">
              <p className="text-[11px] font-semibold text-gray-800">
                UGX {claim.giftPrice || 120000}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ClaimsModal = ({ claims, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[90%] md:w-[75%] h-[90%] p-6 relative overflow-auto">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        {/* Modal Title */}
        <h3 className="text-[11px] md:text-xl font-semibold mb-6">
          Return Claims
        </h3>
        {/* Render each claim using the ClaimItem component */}
        {claims.map((claim, idx) => (
          <ClaimItem key={idx} claim={claim} />
        ))}
      </div>
    </div>
  );
};

export default ClaimsModal;
