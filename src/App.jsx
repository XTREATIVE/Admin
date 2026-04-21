import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginScreen from "./pages/login.jsx";
import AdminDashboard from "./pages/adminDashboard.jsx";
import Vendors from "./pages/vendors.jsx";
import Customers from "./pages/customers.jsx";
import Products from "./pages/products.jsx";
import ProductDetails from "./pages/products_details_product.jsx";
import Settings from "./pages/Settings.jsx";
import VendorsDetails from "./pages/vendorDetails.jsx";
import CustomerDetails from "./pages/customerDetails.jsx";
import OrderList from "./pages/OrderList.jsx";
import Order_Details from "./pages/order_order_details.jsx";
import Reports from "./pages/Reports.jsx";
import Logout from "./pages/logout.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/index.css";
import Finance from "./pages/finance.jsx";
import Loans from "./pages/loans.jsx";
import Profile from "./pages/profile.jsx";
import Chat from "./pages/chat.jsx";
import Reset_Password from "./pages/reset_password.jsx";
import SupportPage from "./pages/SupportPage.jsx"; // ✅ NEW

import { useSingleStepNavigationLimit } from "./hooks/custom.jsx";

// ─── Protected Route ──────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("authToken");
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("authToken")
  );
  useSingleStepNavigationLimit();

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("authToken"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <>
      <Routes>
        {/* ── Public routes ── */}
        <Route path="/" element={<LoginScreen />} />
        <Route path="/reset_password" element={<Reset_Password />} />

        {/* ── Protected routes ── */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Vendors"
          element={
            <ProtectedRoute>
              <Vendors />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Vendors/details"
          element={
            <ProtectedRoute>
              <VendorsDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Customers"
          element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Customers/details"
          element={
            <ProtectedRoute>
              <CustomerDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products/product/:publicId/:slug"
          element={
            <ProtectedRoute>
              <ProductDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/order/:orderId"
          element={
            <ProtectedRoute>
              <Order_Details />
            </ProtectedRoute>
          }
        />

        <Route
          path="/finance"
          element={
            <ProtectedRoute>
              <Finance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/loans"
          element={
            <ProtectedRoute>
              <Loans />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        {/* ✅ Support Tickets — opened by the chat icon in AdminDashboard */}
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <SupportPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/logout"
          element={
            <ProtectedRoute>
              <Logout />
            </ProtectedRoute>
          }
        />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
      </Routes>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
}

export default App;