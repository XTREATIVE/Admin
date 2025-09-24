// pages/AdminDashboard.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import StatsCardsGrid from "../components/cardgrid";

const AdminDashboard = () => {
  const { isLoading: authLoading } = useAuth();

  const dummyNotifications = [
    { title: "New vendor registered", time: "5 mins ago" },
    { title: "Customer placed an order", time: "10 mins ago" },
    { title: "New loan application", time: "30 mins ago" },
  ];

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen font-poppins">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
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