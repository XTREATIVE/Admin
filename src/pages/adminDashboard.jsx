// pages/AdminDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import StatsCardsGrid from "../components/cardgrid";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const dummyNotifications = [
    { title: "New vendor registered", time: "5 mins ago" },
    { title: "Customer placed an order", time: "10 mins ago" },
    { title: "New loan application", time: "30 mins ago" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login"); // redirect if no token
    } else {
      setLoading(false); // allow dashboard to show
    }
  }, [navigate]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
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
