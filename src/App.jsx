// App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
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
// Import the custom navigation limiting hook
import { useSingleStepNavigationLimit } from "./hooks/custom.jsx";


function App() {
  // Call the hook once at the top level so it affects the entire app.
  useSingleStepNavigationLimit();

  return (
    <>
      <Routes>
        {/* Wrap the login route with PublicRoute */}
        <Route path="/" element={<LoginScreen />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/Settings" element={<Settings />} />
        <Route path="/Vendors" element={<Vendors />} />
        <Route path="/Customers" element={<Customers />} />
        <Route path="/products" element={<Products />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/Vendors/details" element={<VendorsDetails />} />
        <Route path="/Customers/details" element={<CustomerDetails />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/order/:orderId" element={<Order_Details />} />
        <Route
          path="/products/product/:publicId/:slug"
          element={<ProductDetails />}
        />
        <Route path="/reports" element={<Reports />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/loans" element={<Loans />} />
      </Routes>
      {/* ToastContainer should be rendered outside of <Routes> */}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
}

export default App;
