import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import OrderTimeline from "./order_details_timeline"; // Timeline component
import CustomerDetailsCard from "./order_customer_details"; // Customer details component
import { OrdersContext } from "../context/orderscontext";
import { ProductsContext } from "../context/allproductscontext";  // Import the products context

const OFFSET = 1000;

// Helper function to extract numerical price from a formatted price string
function extractPrice(priceStr) {
  return Number(priceStr.replace(/[^\d.]/g, ""));
}

// Helper function to get the ordinal suffix for a day number
function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

// Helper function to format a Date object into "15th April 2025"
function formatDate(dateObj) {
  const day = dateObj.getDate();
  const ordinal = getOrdinalSuffix(day);
  const month = dateObj.toLocaleString("en-GB", { month: "long" });
  const year = dateObj.getFullYear();
  return `${day}${ordinal} ${month} ${year}`;
}

// Shimmer Loader Component using Tailwind CSS
function Shimmer({ width = "100px", height = "10px" }) {
  return (
    <div
      className="bg-gray-300 rounded animate-pulse"
      style={{ width, height }}
    ></div>
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

export default function OrderLeftSection() {
  const { orderId } = useParams();
  const { orders, loading, error } = useContext(OrdersContext);
  const { getProductById, loadingProducts, errorProducts } = useContext(ProductsContext);

  // Simulate additional loading for top-section data if needed
  const [isDateLoading, setIsDateLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDateLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // If any of the asynchronous data is still loading, show a loading message.
  if (loading || loadingProducts || isDateLoading) {
    return <div className="text-center text-[11px] p-4">Loading order details…</div>;
  }

  if (error) {
    return (
      <div className="text-center text-[11px] p-4 text-red-600">
        Error fetching order: {error}
      </div>
    );
  }

  if (errorProducts) {
    return (
      <div className="text-center text-[11px] p-4 text-red-600">
        Error fetching products: {errorProducts}
      </div>
    );
  }

  // Convert the masked orderId to the original order ID.
  const originalOrderId = parseInt(orderId, 10) - OFFSET;
  const order = orders.find((o) => o.id === originalOrderId);

  if (!order) {
    return (
      <div className="text-center text-[11px] p-4">Order not found.</div>
    );
  }

  // Top Section variables
  const orderNumber = `#${order.id + OFFSET}`;
  const formattedDate = formatDate(new Date(order.created_at)); // now uses human readable date

  // Define progress steps as used in the top section (adjust as needed)
  const steps = [
    { label: "Order Confirming", width: "w-full", color: "bg-green-500" },
    { label: "Payment Pending", width: "w-full", color: "bg-green-500" },
    { label: "Processing", width: "w-3/5", color: "bg-yellow-500", spinner: true },
    { label: "Shipping", width: "w-0", color: "bg-blue-500" },
    { label: "Delivered", width: "w-0", color: "bg-blue-500" },
  ];

  return (
    <div
      className="flex flex-col md:flex-row font-poppins text-[11px]"
      style={{ fontFamily: "Poppins" }}
    >
      {/* Left Section: Top Order Details, Products Table, Timeline Card */}
      <div className="w-full md:w-2/3 p-4">
        {/* Top Order Details and Progress */}
        <div className="bg-white shadow rounded-lg mb-4">
          <div className="p-6">
            <div className="flex flex-wrap justify-between items-center mb-4">
              <div>
                <h4 style={{ fontSize: "11px", color: "#280300" }} className="flex items-center font-medium space-x-2">
                  <span>{orderNumber}</span>
                  <span className="px-2 py-1 text-[10px] font-medium bg-green-100 text-green-800 rounded">
                    {order.payment_status || "Paid"}
                  </span>
                  <span className="px-2 py-1 text-[10px] font-medium border border-yellow-500 text-yellow-500 rounded">
                    {order.status || "In Progress"}
                  </span>
                </h4>
                <p style={{ fontSize: "11px", color: "gray" }} className="text-[11px] mt-1">
                  {formattedDate}
                </p>
              </div>
            </div>
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
                    <p style={{ fontSize: "10px", color: "#000" }} className="mb-0">{s.label}</p>
                    {s.spinner && (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
            <p style={{ fontSize: "10px", color: "#000" }} className="flex items-center bg-white px-3 py-1 rounded border">
              Estimated shipping date:
              <span className="ml-1 font-medium" style={{ color: "#280300" }}>
                {order.estimated_shipping_date
                  ? formatDate(new Date(order.estimated_shipping_date))
                  : "N/A"}
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
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Price per item</th>
                <th className="px-4 py-3">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[10px]">
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => {
                  const unitPrice = extractPrice(item.price);
                  const amount = item.quantity * unitPrice;
                  // Retrieve product details from the ProductsContext using the product id from the order item
                  const productDetail = getProductById(item.product);
                  // Use the product's initial details when available; fallback to the item's properties otherwise
                  const size = productDetail?.size || item.size;
                  const color =
                    productDetail?.custom_color && productDetail.custom_color !== "custom"
                      ? productDetail.custom_color
                      : productDetail?.color || item.color;
                  const material = productDetail?.material || item.material;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 flex items-center space-x-2 min-w-[150px]">
                        <img
                          src={
                            item.product_image_url ||
                            productDetail?.product_image_url ||
                            "https://via.placeholder.com/50"
                          }
                          alt={item.product_name || productDetail?.name || "Product"}
                          className="w-10 h-auto object-cover rounded"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800 text-[11px]">
                            {item.product_name || productDetail?.name || "Product Name"}
                          </span>
                          {(size || color || material) && (
                            <span className="text-[9px] text-gray-500">
                              {size ? `Size: ${size} | ` : ""}
                              {color ? `Color: ${color} | ` : ""}
                              {material ? `Material: ${material}` : ""}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">UGX {unitPrice.toLocaleString()}</td>
                      <td className="px-4 py-3">UGX {amount.toLocaleString()}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-4 py-3 text-center" colSpan="4">
                    No products found for this order.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Timeline Card Component */}
        <OrderTimeline order={order} />
      </div>

      {/* Right Section: Customer Details Card */}
      <div className="w-full md:w-1/3 p-4">
        <CustomerDetailsCard order={order} />
      </div>
    </div>
  );
}
