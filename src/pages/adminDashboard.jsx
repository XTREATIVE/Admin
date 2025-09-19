// pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import StatsCardsGrid from "../components/cardgrid";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const dummyNotifications = [
    { title: "New vendor registered", time: "5 mins ago" },
    { title: "Customer placed an order", time: "10 mins ago" },
    { title: "New loan application", time: "30 mins ago" },
  ];

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        // No token found, redirect to login
        setIsAuthenticating(false);
        setIsAuthorized(false);
        navigate("/login", { replace: true });
        return;
      }

      // Token exists, user is authorized
      setIsAuthorized(true);
      setIsAuthenticating(false);
    };

    // Initial check
    checkAuthentication();

    // Listen for auth changes
    const handleAuthChange = (event) => {
      if (event.detail?.type === "login") {
        setIsAuthorized(true);
        setIsAuthenticating(false);
      } else if (event.detail?.type === "logout") {
        setIsAuthorized(false);
        navigate("/login", { replace: true });
      }
    };

    // Listen for storage changes (token changes from other tabs)
    const handleStorageChange = (event) => {
      if (event.key === "authToken") {
        checkAuthentication();
      }
    };

    window.addEventListener("authChanged", handleAuthChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("authChanged", handleAuthChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate]);

  // Show loading while checking authentication
  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center h-screen font-poppins">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authorized
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="h-screen font-poppins">
      <Header notifications={dummyNotifications} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 bg-gray-100 ml-[80px]">
          <StatsCardsGrid />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;