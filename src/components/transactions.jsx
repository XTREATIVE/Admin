<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { authFetch } from "../api"; // adjust path if needed

const RecentTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Use Django TransactionFilterView
        // /payments/transactions/?transaction_type=purchase
        const data = await authFetch(
          "/payments/transactions/?transaction_type=purchase"
        );

        // Depending on your serializer, data might be a list or { results: [...] }
        const list = Array.isArray(data) ? data : data.results || [];
        setTransactions(list);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Map raw transaction from backend into UI fields { name, message, time, type }
  const mapTransaction = (t) => {
    const amount = Number(t.amount || 0);
    const timestamp = t.created_at || t.timestamp || t.date || null;

    // Try to build a reasonable label:
    const name =
      t.product_name ||
      t.product?.name ||
      t.user_email ||
      t.user?.email ||
      `Transaction #${t.id}`;

    const message = `${t.transaction_type || "transaction"} • UGX ${amount.toLocaleString()}`;

    const time = timestamp
      ? new Date(timestamp).toLocaleString()
      : "";

    // If transaction has vendor info, treat as vendor transaction, else customer
    const type = t.vendor || t.vendor_id ? "vendor" : "customer";

    return { name, message, time, type };
  };

  const viewTransactions = transactions.map(mapTransaction);

  const getAvatarLetter = (transaction) =>
    transaction.type === "vendor" ? "V" : "C";

=======
import React from "react";

const dummyTransactions = [
  {
    name: "Alinatwe Robinah",
    message: "Deposited UGX 20000 into their account",
    time: "2 min ago",
    type: "customer", // Marked as vendor
  },
  {
    name: "Nakungu Esther",
    message: "Withdrew UGX 50000 from her wallet",
    time: "10 min ago",
    type: "customer", // Marked as customer
  },
  {
    name: "Agaba Jennifer",
    message: "Received a payout of UGX 300000",
    time: "30 min ago",
    type: "vendor", // Marked as vendor
  },
  {
    name: "Mike Allen",
    message: "Bought 'Blue T-Shirt' for UGX 250000",
    time: "1 hour ago",
    type: "customer", // Marked as customer
  },
];

const RecentTransactions = ({ transactions = dummyTransactions }) => {
  const getAvatarLetter = (transaction) => {
    return transaction.type === "vendor" ? "V" : "C";
  };

>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
  return (
    <div className="bg-white rounded shadow p-6 mt-2">
      {/* Header */}
      <h2 className="font-semibold text-gray-500 mb-4 text-[12px]">
        Recent Transactions
      </h2>

      {/* Transactions List */}
<<<<<<< HEAD
      {loading ? (
        <p className="text-[10px] text-gray-400">Loading...</p>
      ) : (
        <div className="space-y-4 max-h-[200px] overflow-y-auto">
          {viewTransactions.slice(0, 4).map((transaction, idx) => (
            <div key={idx} className="flex items-start space-x-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-[#f9622c] flex items-center justify-center">
                <span className="text-[#280300] font-semibold text-[15px]">
                  {getAvatarLetter(transaction)}
                </span>
              </div>

              {/* Details */}
              <div>
                <p className="text-[#280300] font-semibold text-[11px]">
                  {transaction.name}
                </p>
                <p className="text-black-500 text-[10px]">
                  {transaction.message}
                </p>
                <p className="text-gray-400 text-[10px]">
                  {transaction.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View All Link */}
      <p
        className="text-[#f9622c] mt-4 cursor-pointer hover:underline text-[10px]"
        onClick={() => setShowModal(true)}
      >
        View All
      </p>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-[90%] max-w-md max-h-[80%] overflow-y-auto">
            <h2 className="font-semibold text-gray-500 mb-4 text-[12px]">
              All Transactions
            </h2>
            {viewTransactions.map((transaction, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 mb-3"
              >
                <div className="w-10 h-10 rounded-full bg-[#f9622c] flex items-center justify-center">
                  <span className="text-[#280300] font-semibold text-[15px]">
                    {getAvatarLetter(transaction)}
                  </span>
                </div>
                <div>
                  <p className="text-[#280300] font-semibold text-[11px]">
                    {transaction.name}
                  </p>
                  <p className="text-black-500 text-[10px]">
                    {transaction.message}
                  </p>
                  <p className="text-gray-400 text-[10px]">
                    {transaction.time}
                  </p>
                </div>
              </div>
            ))}
            <button
              className="mt-4 bg-[#f9622c] text-white py-1 px-4 rounded text-[10px]"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
=======
      <div className="space-y-4">
        {transactions.map((transaction, idx) => (
          <div key={idx} className="flex items-start space-x-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-[#f9622c] flex items-center justify-center">
              <span className="text-[#280300] font-semibold text-[15px]">
                {getAvatarLetter(transaction)}
              </span>
            </div>

            {/* Details */}
            <div>
              <p className="text-[#280300] font-semibold text-[11px]">
                {transaction.name}
              </p>
              <p className="text-black-500 text-[10px]">
                {transaction.message}
              </p>
              <p className="text-gray-400 text-[10px]">
                {transaction.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Link */}
      <p className="text-[#f9622c] mt-4 cursor-pointer hover:underline text-[10px]">
        View all
      </p>
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
    </div>
  );
};

<<<<<<< HEAD
export default RecentTransactions;
=======
export default RecentTransactions;
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
