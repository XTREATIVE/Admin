// pages/ProductDetails.jsx
import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import OrderHistory from "../components/product_Order_History";
import StatsCard from "../components/Cards";
import ReviewsRatings from "../components/product_review_ratings";        // ← Updated import
import Loader from "../pages/Loader";
import { ProductContext } from "../context/productcontext";
import { OrdersContext } from "../context/orderscontext";
import { ProductsContext } from "../context/allproductscontext";
import DeleteProductModal from "../modals/deleteProduct";
import { FaSearchPlus, FaTimes } from "react-icons/fa";

export default function ProductDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const { selectedProduct, selectedVendorId } = useContext(ProductContext);
  const { orders, loading: ordersLoading, error: ordersError } = useContext(OrdersContext);
  const { getProductById, loadingProducts, errorProducts } = useContext(ProductsContext);

  const { product: locationProduct } = location.state || {};
  const product = selectedProduct || locationProduct || null;

  const [showZoom, setShowZoom] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [vendorError, setVendorError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch vendor details
  useEffect(() => {
    let isMounted = true;
    if (!selectedVendorId) {
      setVendor(null);
      return;
    }

    const fetchVendor = async () => {
      try {
        const res = await fetch(
          `https://xtreativeapi.onrender.com/vendors/${selectedVendorId}/details/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to load vendor");
        const data = await res.json();
        if (isMounted) setVendor(data);
      } catch (err) {
        if (isMounted) setVendorError("Unable to load vendor details");
      }
    };

    fetchVendor();
    return () => { isMounted = false; };
  }, [selectedVendorId]);

  // Hide loader when product and vendor are ready
  useEffect(() => {
    if (product && (!selectedVendorId || vendor !== null || vendorError !== null)) {
      setLoading(false);
    }
  }, [product, vendor, vendorError, selectedVendorId]);

  if (loading || !product || loadingProducts) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Header />
        <Loader />
      </div>
    );
  }

  // Get latest inventory from context
  const ctxProduct = getProductById(product.id);
  const inventoryCount = ctxProduct?.quantity ?? "–";

  // Format date
  const addDate = product.created_at
    ? new Date(product.created_at).toLocaleDateString("en-GB")
    : "";

  // Filter orders related to this product
  const productOrders = orders
    .filter((order) =>
      order.items?.some((item) => item.product === product.id)
    )
    .map((order) => {
      const item = order.items.find((i) => i.product === product.id);
      return {
        id: order.id,
        date: new Date(order.created_at).toLocaleDateString("en-GB"),
        quantity: item?.quantity || 0,
        customer: order.customer,
        status: order.status,
      };
    });

  const orderHistoryData = productOrders.length ? productOrders : [];

  // Stats
  const deliveredCount = productOrders.filter((o) => o.status.toLowerCase() === "delivered").length;
  const pendingCount = productOrders.filter((o) => {
    const s = o.status.toLowerCase();
    return s === "pending" || s === "processing";
  }).length;
  const returnedCount = productOrders.filter((o) => o.status.toLowerCase() === "returned").length;

  const statsData = [
    { title: "Inventory", value: `${inventoryCount}`.padStart(2, "0") },
    { title: "Delivered", value: String(deliveredCount).padStart(2, "0") },
    { title: "Pending", value: String(pendingCount).padStart(2, "0") },
    { title: "Returned", value: String(returnedCount).padStart(2, "0") },
  ];

  const onDeleteConfirm = () => {
    navigate("/products");
  };

  return (
    <div className="h-screen flex flex-col font-poppins">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 bg-gray-100 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 items-stretch">

            {/* LEFT COLUMN - Product Info */}
            <div className="lg:col-span-1 ml-[80px]">
              <div className="bg-white p-4 rounded flex flex-col items-center h-full">
                {product.product_image_url && (
                  <div className="relative group w-full flex justify-center mb-4">
                    <img
                      src={product.product_image_url}
                      alt={product.name}
                      className="object-cover h-80 w-full rounded p-5"
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => setShowZoom(true)}
                    >
                      <FaSearchPlus className="text-white text-2xl" />
                    </div>
                  </div>
                )}

                <div className="w-full text-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[13px] font-semibold text-[#280300] ml-4">
                      {product.name}
                    </h3>
                    <span className="text-[13px] font-semibold text-[#280300] mr-5">
                      {product.price && `UGX ${product.price}`}
                    </span>
                  </div>

                  <div className="mb-4 ml-4">
                    <h4 className="text-[11px] font-semibold text-gray-600">Description</h4>
                    <p className="text-[11px] text-gray-700 mt-1">
                      {product.description || "No description available."}
                    </p>
                  </div>

                  <table className="table-auto w-full ml-2 text-[11px]">
                    <tbody>
                      <tr>
                        <td className="font-medium py-1">Size:</td>
                        <td className="py-1">
                          {product.size === "custom" ? product.custom_size : product.size}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-medium py-1">Color:</td>
                        <td className="py-1">
                          {product.color === "custom" ? product.custom_color : product.color}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-medium py-1">Material:</td>
                        <td className="py-1">{product.material}</td>
                      </tr>
                      <tr>
                        <td className="font-medium py-1">Country of Origin:</td>
                        <td className="py-1">{product.country_of_origin}</td>
                      </tr>
                      <tr>
                        <td className="font-medium py-1">Add Date:</td>
                        <td className="py-1">{addDate}</td>
                      </tr>
                    </tbody>
                  </table>

                  <hr className="my-4 border-gray-300" />

                  {/* Vendor Information */}
                  <div className="ml-2">
                    <h4 className="text-[11px] font-semibold text-gray-600 mb-2">
                      Vendor Information
                    </h4>
                    {vendorError ? (
                      <div className="text-[10px] text-red-500">{vendorError}</div>
                    ) : vendor ? (
                      <table className="table-auto w-full text-[11px]">
                        <tbody>
                          <tr><td className="font-medium py-1">Shop:</td><td>{vendor.shop_name}</td></tr>
                          <tr><td className="font-medium py-1">Vendor:</td><td>{vendor.username}</td></tr>
                          <tr><td className="font-medium py-1">Location:</td><td>{vendor.shop_address}</td></tr>
                          <tr><td className="font-medium py-1">Email:</td><td>{vendor.user_email}</td></tr>
                          <tr><td className="font-medium py-1">Phone:</td><td>{vendor.phone_number}</td></tr>
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-[11px] text-gray-600">No vendor information available</div>
                    )}
                  </div>

                  <div className="mt-10 flex justify-center">
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      disabled={deleting}
                      className="px-10 py-2 bg-red-500 text-[11px] text-white font-semibold rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      {deleting ? "Deleting…" : "Delete this product"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statsData.map((stat) => (
                  <StatsCard key={stat.title} title={stat.title} value={stat.value} />
                ))}
              </div>

              <OrderHistory orderHistory={orderHistoryData} />

              {/* ✅ Now passing productId so reviews load for this specific product */}
              <div className="mt-6">
                <ReviewsRatings productId={product.id} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Image Zoom Modal */}
      {showZoom && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50"
          onClick={() => setShowZoom(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={product.product_image_url}
              alt={product.name}
              className="max-w-full max-h-screen rounded shadow-lg"
            />
            <button
              className="absolute top-3 right-3 text-white bg-gray-700 rounded-full p-2 hover:bg-gray-600"
              onClick={() => setShowZoom(false)}
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteProductModal
          product={product}
          onClose={() => setShowDeleteModal(false)}
          onDeleteConfirm={onDeleteConfirm}
          onDeleteError={(msg) => console.error("Delete error:", msg)}
        />
      )}
    </div>
  );
}