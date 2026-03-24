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

// Custom ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("authToken"); // Check if auth token exists
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page and save the intended destination
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
};

// Assuming useSingleStepNavigationLimit is intended to limit navigation steps
import { useSingleStepNavigationLimit } from "./hooks/custom.jsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("authToken"));
  useSingleStepNavigationLimit(); // Keep this if it serves a specific purpose

  // Update authentication state if token changes (e.g., after logout)
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
        {/* Public routes */}
        <Route path="/" element={<LoginScreen />} />
        <Route path="/reset_password" element={<Reset_Password />} />

        {/* Reports page only - all other routes redirect to reports */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        
        {/* All other routes redirect to reports */}
        <Route path="/admin-dashboard" element={<Navigate to="/reports" replace />} />
        <Route path="/Settings" element={<Navigate to="/reports" replace />} />
        <Route path="/profile" element={<Navigate to="/reports" replace />} />
        <Route path="/Vendors" element={<Navigate to="/reports" replace />} />
        <Route path="/Customers" element={<Navigate to="/reports" replace />} />
        <Route path="/products" element={<Navigate to="/reports" replace />} />
        <Route path="/logout" element={<Navigate to="/reports" replace />} />
        <Route path="/Vendors/details" element={<Navigate to="/reports" replace />} />
        <Route path="/Customers/details" element={<Navigate to="/reports" replace />} />
        <Route path="/orders" element={<Navigate to="/reports" replace />} />
        <Route path="/order/:orderId" element={<Navigate to="/reports" replace />} />
        <Route path="/products/product/:publicId/:slug" element={<Navigate to="/reports" replace />} />
        <Route path="/chat" element={<Navigate to="/reports" replace />} />
        <Route path="/finance" element={<Navigate to="/reports" replace />} />
        <Route path="/loans" element={<Navigate to="/reports" replace />} />
        <Route path="*" element={<Navigate to="/reports" replace />} />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
}

export default App;