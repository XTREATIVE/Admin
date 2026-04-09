// components/ReviewsRatings.jsx

import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa"; // For displaying star icons
import { fetchReviews } from "../api";

export default function ReviewsRatings({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await fetchReviews(productId);
        setReviews(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, [productId]);

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2; // Adjust this number as needed
  const totalPages = Math.ceil(reviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPageData = reviews.slice(startIndex, startIndex + itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  // Helper function to compute initials from the name
  const getInitials = (name) => {
    const nameParts = name.split(" ");
    if (nameParts.length === 1) {
      return nameParts[0][0].toUpperCase();
    }
    // Take the first letter of the first and last name parts.
    return (
      nameParts[0][0].toUpperCase() +
      nameParts[nameParts.length - 1][0].toUpperCase()
    );
  };

  if (loading) return <div>Loading reviews...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-base sm:text-sm font-semibold mb-4">
        Reviews &amp; Ratings({reviews.length})
      </h2>

      {currentPageData.map((review, index) => (
        <div
          key={review.id || index}
          className="border-b border-gray-200 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0"
        >
          {/* Reviewer Info */}
          <div className="flex items-center mb-2">
            {/* Initials Avatar */}
            <div className="w-10 h-10 rounded-full bg-[#280300] flex items-center justify-center mr-3">
              <span className="text-[12px] font-bold text-[#f9622c]">
                {getInitials(review.user?.name || review.name || 'Anonymous')}
              </span>
            </div>
            <div>
              <h3 className="text-[11px] font-medium leading-tight">
                {review.user?.name || review.name || 'Anonymous'}
              </h3>
              {/* Star Icons */}
              <div className="flex text-yellow-500 text-[12px]">
                {Array(review.rating || 5)
                  .fill(null)
                  .map((_, i) => (
                    <FaStar key={i} />
                  ))}
              </div>
            </div>
          </div>

          {/* Rating Text */}
          <p className="text-[11px] font-semibold text-gray-800 mb-1">
            {review.rating_text || 'Good Quality'}
          </p>

          {/* Location and Date */}
          <p className="text-[11px] text-gray-600 mb-2">
            Reviewed in {review.location || 'Unknown'} on {review.created_at ? new Date(review.created_at).toLocaleDateString() : review.date}
          </p>

          {/* Review Body */}
          <p className="text-[11px] text-gray-700">{review.comment || review.review}</p>
        </div>
      ))}

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="px-5 py-1 bg-gray-200 text-gray-700 text-[12px] rounded disabled:opacity-50 mr-2"
        >
          Previous
        </button>

        <div className="flex space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={`px-5 py-1 rounded ${
                currentPage === page
                  ? "bg-[#f9622c] text-white text-[12px]"
                  : "bg-gray-200 text-gray-700 text-[12px]"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-5 py-1 bg-gray-200 text-gray-700 text-[12px] rounded disabled:opacity-50 ml-2"
        >
          Next
        </button>
      </div>
    </div>
  );
}
