// RecentClaims.js
import React from "react";

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

const RecentClaims = ({ claims = dummyClaims, onViewAll }) => {
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

  return (
    <div className="bg-white rounded shadow p-6 mt-4">
      {/* Header */}
      <h2 className="font-semibold text-gray-500 mb-4 text-[12px]">
        Return Claims
      </h2>

      {/* Claims List */}
      <div className="space-y-4">
        {claims.map((claim, idx) => (
          <div key={idx} className="flex items-start space-x-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-[#f9622c] flex items-center justify-center">
              <span className="text-[#280300] font-semibold text-[15px]">
                {getAvatarLetters(claim)}
              </span>
            </div>

            {/* Details */}
            <div>
              <p className="text-[#280300] font-semibold text-[11px]">
                {claim.name}
              </p>
              <p className="text-black-500 text-[10px]">{claim.message}</p>
              <p className="text-gray-400 text-[10px]">{claim.time}</p>
            </div>
          </div>
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

export default RecentClaims;
