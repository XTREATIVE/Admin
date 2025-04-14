import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import OrderTimeline from "./order_details_timeline"; // Import the OrderTimeline component
import CustomerDetailsCard from "./order_customer_details"; // Import the CustomerDetailsCard component

// Helper function: extract numerical price from a formatted price string
function extractPrice(priceStr) {
  return Number(priceStr.replace(/[^\d.]/g, ""));
}

// Shimmer Loader Component using Tailwind CSS
function Shimmer({ width = "100px", height = "10px" }) {
  return (
    <div className="bg-gray-300 rounded animate-pulse" style={{ width, height }}></div>
  );
}

// Spinner Loader Component using Tailwind CSS
function Spinner({ size = "14px", borderWidth = "2px" }) {
  return (
    <div
      className="rounded-full border-t-[#f9622c] border-gray-200 animate-spin"
      style={{
        width: size,
        height: size,
        borderWidth: borderWidth,
        borderStyle: "solid",
      }}
    ></div>
  );
}

// Dummy product data
const dummyProducts = [
  {
    id: 1,
    name: "T-Shirt",
    product_image_url:
      "https://api-xtreative.onrender.com/media/product_images/product_uPtgpn9.jpeg",
    status: "active",
    quantity: 3,
    price: "UGX 35000",
    size: "M",
    color: "Red",
    material: "Cotton",
  },
  {
    id: 2,
    name: "Sneakers",
    product_image_url:
      "https://api-xtreative.onrender.com/media/product_images/product_uPtgpn9.jpeg",
    status: "packaging", // or "processing" to test the spinner
    quantity: 1,
    price: "UGX 80000",
    size: "42",
    color: "White",
    material: "Leather",
  },
  {
    id: 3,
    name: "Jeans",
    product_image_url:
      "https://api-xtreative.onrender.com/media/product_images/product_uPtgpn9.jpeg",
    status: "active",
    quantity: 2,
    price: "UGX 65000",
    size: "32",
    color: "Blue",
    material: "Denim",
  },
];

export default function VendorDetailsProducts() {
  // Simulate loading state for date (and any other top-left data you want)
  const [isDateLoading, setIsDateLoading] = useState(true);

  useEffect(() => {
    // Simulate an API call or some async operation
    const timer = setTimeout(() => {
      setIsDateLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Define progress steps as used in the ProgressSection component
  const steps = [
    { label: "Order Confirming", width: "w-full", color: "bg-green-500" },
    { label: "Payment Pending", width: "w-full", color: "bg-green-500" },
    {
      label: "Processing",
      width: "w-3/5",
      color: "bg-yellow-500",
      spinner: true,
    },
    { label: "Shipping", width: "w-0", color: "bg-blue-500" },
    { label: "Delivered", width: "w-0", color: "bg-blue-500" },
  ];

  return (
    <div
      className="flex flex-col md:flex-row font-poppins text-[11px]"
      style={{ fontFamily: "Poppins" }}
    >
      {/* Left Section: Top Order Details Section + Product Table + Timeline Card */}
      <div className="w-full md:w-2/3 p-4">
        {/* Top Section: Order Information and Progress */}
        <div className="bg-white shadow rounded-lg mb-4">
          <div className="p-6">
            {/* Header Row */}
            <div className="flex flex-wrap justify-between items-center mb-4">
              <div>
                <h4
                  style={{ fontSize: "11px", color: "#280300" }}
                  className="flex items-center font-medium space-x-2"
                >
                  <span>#0758267/90</span>
                  <span className="px-2 py-1 text-[10px] font-medium bg-green-100 text-green-800 rounded">
                    Paid
                  </span>
                  <span className="px-2 py-1 text-[10px] font-medium border border-yellow-500 text-yellow-500 rounded">
                    In Progress
                  </span>
                </h4>
                <p
                  style={{ fontSize: "11px", color: "gray" }}
                  className="text-[11px] mt-1"
                >
                  April 23, 2024 at 6:23 pm
                </p>
              </div>
              {/* Additional header action buttons if needed */}
            </div>

            {/* Progress Section */}
            <h4 style={{ fontSize: "10px", color: "#f9622c" }} className="mb-4">
              Progress
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              {steps.map((s, i) => (
                <div key={i}>
                  <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div className={`${s.color} ${s.width} h-full`} />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <p style={{ fontSize: "10px", color: "#000" }} className="mb-0">
                      {s.label}
                    </p>
                    {s.spinner && (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Footer row for Estimated Shipping and Action */}
          <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
            <p
              style={{ fontSize: "10px", color: "#000" }}
              className="flex items-center bg-white px-3 py-1 rounded border"
            >
              Estimated shipping date:
              <span className="ml-1 font-medium" style={{ color: "#280300" }}>
                Apr 25, 2024
              </span>
            </p>
            <button
              style={{ fontSize: "11px", backgroundColor: "#f9622c", color: "#fff" }}
              className="px-4 py-2 rounded hover:bg-opacity-90"
            >
              Make As Ready To Ship
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white shadow rounded-lg overflow-x-auto mb-4">
          <table className="min-w-full text-left text-gray-600">
            <thead className="bg-gray-50 uppercase text-gray-500 text-[10px]">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Price per item</th>
                <th className="px-4 py-3">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[10px]">
              {dummyProducts.map((product) => {
                const unitPrice = extractPrice(product.price);
                const amount = (product.quantity || 1) * unitPrice;
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 flex items-center space-x-2 min-w-[150px]">
                      <img
                        src={product.product_image_url}
                        alt={product.name}
                        className="w-10 h-auto object-cover rounded"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800 text-[11px]">
                          {product.name}
                        </span>
                        <span className="text-[9px] text-gray-500">
                          {product.size ? `Size: ${product.size} | ` : ""} 
                          {product.color ? `Color: ${product.color} | ` : ""} 
                          {product.material ? `Material: ${product.material}` : ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {product.status === "active" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-700 text-[9px]">
                          <FaCheckCircle className="mr-1" /> Ready
                        </span>
                      ) : product.status === "processing" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-[9px]">
                          <Spinner size="10px" borderWidth="2px" />
                          <span className="ml-1">Processing</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-700 text-[9px]">
                          <FaExclamationCircle className="mr-1" /> Packaging
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{product.quantity}</td>
                    <td className="px-4 py-3">UGX {unitPrice}</td>
                    <td className="px-4 py-3">UGX {amount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Timeline Card Component */}
        <OrderTimeline />
      </div>

      {/* Right Section: Customer Details Card */}
      <div className="w-full md:w-1/3 p-4">
        <CustomerDetailsCard />
      </div>
    </div>
  );
}
