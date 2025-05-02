// OrderLeftSection.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import OrderTimeline from "./order_details_timeline";
import CustomerDetailsCard from "./order_customer_details";
import { OrdersContext } from "../context/orderscontext";
import { ProductsContext } from "../context/allproductscontext";

const OFFSET = 1000;

// Utility: strip non-numeric chars and parse price
function extractPrice(priceStr) {
  return Number(priceStr.replace(/[^\d.]/g, ""));
}

// Utility: get "st"/"nd"/"rd"/"th" suffix for dates
function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

// Utility: format JS Date → "4th April 2025"
function formatDate(dateObj) {
  const day = dateObj.getDate();
  const ordinal = getOrdinalSuffix(day);
  const month = dateObj.toLocaleString("en-GB", { month: "long" });
  const year = dateObj.getFullYear();
  return `${day}${ordinal} ${month} ${year}`;
}

// Map warehouse status → badge CSS
const getWarehouseStatusClasses = (status) => {
  switch ((status || "").toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "processing":
      return "bg-orange-100 text-orange-800";
    case "packaging":
      return "bg-amber-100 text-amber-800";
    case "sent to warehouse":
      return "bg-gray-50 text-gray-800";
    case "shipped":
      return "bg-green-100 text-green-800";
    case "delivered":
      return "bg-teal-100 text-teal-800";
    case "canceled":
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Capitalize each word
function capitalize(str) {
  return String(str)
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export default function OrderLeftSection() {
  const { orderId } = useParams();
  const { orders, loading, error, refreshOrders } = useContext(OrdersContext);
  const { getProductById, loadingProducts, errorProducts } = useContext(ProductsContext);

  // State: simulate date-loading, progress steps, "ready to deliver", warehouse statuses & loaders
  const [isDateLoading, setIsDateLoading] = useState(true);
  const [steps, setSteps] = useState([
    { label: "Payment Confirmed", width: "w-full", color: "bg-green-500" },
    { label: "Order Confirmed", width: "w-full", color: "bg-green-500" },
    { label: "Order Processing", width: "w-0", color: "bg-yellow-500", spinner: false },
    { label: "Order Delivering", width: "w-0", color: "bg-blue-500" },
    { label: "Order Delivered", width: "w-0", color: "bg-blue-500" },
  ]);
  const [isMarked, setIsMarked] = useState(false);
  const [warehouseStatuses, setWarehouseStatuses] = useState({});
  const [warehouseLoading, setWarehouseLoading] = useState({});  // per-item loader

  // Simulate initial date loading (e.g. skeleton)
  useEffect(() => {
    const t = setTimeout(() => setIsDateLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  // Once orders & products loaded, initialize each item’s warehouse status
  useEffect(() => {
    if (!loading && !loadingProducts) {
      const origId = parseInt(orderId, 10) - OFFSET;
      const ord = orders.find(o => o.id === origId);
      if (ord) {
        const init = {};
        const base = ord.status?.toLowerCase() ?? "unknown";
        ord.items.forEach(item => {
          init[item.id] = base;
        });
        setWarehouseStatuses(init);
      }
    }
  }, [loading, loadingProducts, orders, orderId]);

  // Progress: when marking ready for delivery
  const handleReadyToDeliver = () => {
    setIsMarked(true);
    setSteps(prev =>
      prev.map((s, i) =>
        i === 2 ? { ...s, width: "w-full", color: "bg-green-500", spinner: false } : s
      )
    );
    // then trigger spinner on next step
    setTimeout(() => {
      setSteps(prev =>
        prev.map((s, i) =>
          i === 3 ? { ...s, width: "w-full", color: "bg-yellow-500", spinner: true } : s
        )
      );
    }, 700);
  };

  // Confirm shipment per item with loader
  const handleConfirmShipment = async (itemId) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token");
      return;
    }

    setWarehouseLoading(prev => ({ ...prev, [itemId]: true }));

    try {
      const orig = parseInt(orderId, 10) - OFFSET;
      const res = await fetch(
        `https://api-xtreative.onrender.com/orders/orders/${orig}/confirm-warehouse/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ item_id: itemId }),
        }
      );
      if (res.ok) {
        setWarehouseStatuses(prev => ({ ...prev, [itemId]: "shipped" }));
        setWarehouseLoading(prev => ({ ...prev, [itemId]: false }));
        // Optionally update progress bar
        setSteps(prev =>
          prev.map((s, i) =>
            i === 2 ? { ...s, width: "w-3/5", spinner: true } : s
          )
        );
        refreshOrders?.();
      } else {
        console.error("API error");
        setWarehouseLoading(prev => ({ ...prev, [itemId]: false }));
      }
    } catch (e) {
      console.error("Network error", e);
      setWarehouseLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Show loaders or errors
  if (loading || loadingProducts || isDateLoading) {
    return <div className="text-center text-[11px] p-4">Loading order details…</div>;
  }
  if (error) {
    return <div className="text-center text-[11px] p-4 text-red-600">Error: {error}</div>;
  }
  if (errorProducts) {
    return <div className="text-center text-[11px] p-4 text-red-600">Error: {errorProducts}</div>;
  }

  // Locate order
  const origId = parseInt(orderId, 10) - OFFSET;
  const order = orders.find(o => o.id === origId);
  if (!order) {
    return <div className="text-center text-[11px] p-4">Order not found.</div>;
  }

  const orderNumber = `#${order.id + OFFSET}`;
  const createdDate = formatDate(new Date(order.created_at));
  const shipDate = order.estimated_shipping_date
    ? formatDate(new Date(order.estimated_shipping_date))
    : "N/A";

  return (
    <div className="flex flex-col md:flex-row font-poppins text-[11px]">
      {/* LEFT SECTION */}
      <div className="w-full md:w-2/3 p-4">
        {/* Header & Progress */}
        <div className="bg-white shadow rounded-lg mb-4">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="flex items-center space-x-2 text-[11px] text-[#280300] font-medium">
                  <span>{orderNumber}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-[10px] rounded">
                    {order.payment_status || "Paid"}
                  </span>
                  <span className="px-2 py-1 border border-yellow-500 text-yellow-500 text-[10px] rounded">
                    {order.status || "Unknown"}
                  </span>
                </h4>
                <p className="text-[11px] text-gray-500 mt-1">{createdDate}</p>
              </div>
            </div>
            <h4 className="mb-4 text-[10px] text-[#f9622c]">Progress</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              {steps.map((s, i) => (
                <div key={i}>
                  <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`${s.color} ${s.width} h-full transition-all duration-8000 ease-in-out`}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-[10px]">{s.label}</p>
                    {s.spinner && (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
            <p className="flex items-center text-[10px] bg-white px-3 py-1 rounded border">
              Order Delivering date:
              <span className="ml-1 font-medium text-[#280300]">{shipDate}</span>
            </p>
            {!isMarked ? (
              <button
                onClick={handleReadyToDeliver}
                className="px-4 py-2 text-[11px] bg-[#f9622c] text-white rounded"
              >
                Mark As Ready For Delivery
              </button>
            ) : (
              <button disabled className="px-4 py-2 text-green-500 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Out For Delivery
              </button>
            )}
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
              {order.items.map(item => {
                const unitPrice = extractPrice(item.price);
                const amount = unitPrice * item.quantity;
                const detail = getProductById(item.product) || {};
                const size = detail.size || item.size;
                const color = detail.custom_color && detail.custom_color !== "custom"
                  ? detail.custom_color
                  : detail.color || item.color;
                const material = detail.material || item.material;

                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 flex items-center space-x-2 min-w-[150px]">
                      <img
                        src={item.product_image_url || detail.product_image_url || "https://via.placeholder.com/50"}
                        alt={item.product_name || detail.name}
                        className="w-10 rounded"
                      />
                      <div>
                        <p className="font-medium text-gray-800 text-[11px]">
                          {item.product_name || detail.name}
                        </p>
                        {(size || color || material) && (
                          <p className="text-[9px] text-gray-500">
                            {size && `Size: ${size}`}
                            {color && ` | Color: ${color}`}
                            {material && ` | Material: ${material}`}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">UGX {unitPrice.toLocaleString()}</td>
                    <td className="px-4 py-3">UGX {amount.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Warehouse Table */}
        <div className="bg-white shadow rounded-lg overflow-x-auto mb-4">
          <h5 className="px-4 py-2 text-[11px] font-medium">Warehouse</h5>
          <table className="min-w-full text-left text-gray-600 text-[10px]">
            <thead className="bg-gray-50 uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Price per item</th>
                <th className="px-4 py-3">Amount</th>
                {/* Status column removed */}
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            {order.status?.toLowerCase() !== "sent to warehouse" ? (
              <tbody>
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    No product in the warehouse
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-gray-100">
                {order.items.map(item => {
                  const status = warehouseStatuses[item.id];
                  const isLoading = warehouseLoading[item.id];
                  const detail = getProductById(item.product) || {};
                  const unitPrice = extractPrice(item.price || detail.price || "0");
                  const amount = unitPrice * item.quantity;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 flex items-center space-x-2 min-w-[150px]">
                        <img
                          src={item.product_image_url || detail.product_image_url || "https://via.placeholder.com/50"}
                          alt={item.product_name || detail.name}
                          className="w-10 rounded"
                        />
                        <span className="font-medium text-gray-800 text-[11px]">
                          {item.product_name || detail.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">UGX {unitPrice.toLocaleString()}</td>
                      <td className="px-4 py-3">UGX {amount.toLocaleString()}</td>
                      <td className="px-4 py-3 space-x-2">
                        {isLoading ? (
                          <div className="mx-auto animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent" />
                        ) : status === "shipped" ? (
                          <div className="flex items-center text-green-600 text-[10px]">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span>Shipment Confirmed</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleConfirmShipment(item.id)}
                            className="px-2 py-1 text-[10px] bg-green-500 text-white rounded"
                          >
                            Confirm Shipment
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            )}
          </table>
        </div>

        {/* Timeline */}
        <OrderTimeline order={order} />
      </div>

      {/* RIGHT SECTION: Customer Details */}
      <div className="w-full md:w-1/3 p-4">
        <CustomerDetailsCard order={order} />
      </div>
    </div>
  );
}
