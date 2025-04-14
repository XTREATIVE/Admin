// src/pages/settings.jsx
import React, { useState } from "react";
import {
  FaCog,
  FaUser,
  FaCreditCard,
  FaMapMarkerAlt,
  FaBell,
  FaLock,
  FaFileContract,
  FaSignOutAlt,
  FaThLarge,
  FaUsers,
  FaStore,
  FaChartBar,
  FaShoppingCart
} from "react-icons/fa";

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const settingsOptions = [
    { id: 1, title: "Profile", icon: <FaUser />, onClick: () => alert("Navigate to Profile") },
    { id: 2, title: "Payment Methods", icon: <FaCreditCard />, onClick: () => alert("Navigate to Payment Methods") },
    { id: 3, title: "Shipping Address", icon: <FaMapMarkerAlt />, onClick: () => alert("Navigate to Shipping Address") },
    {
      id: 4,
      title: "Notifications",
      icon: <FaBell />,
      onClick: null, // handled by toggle
    },
    {
      id: 5,
      title: "Privacy Policy",
      icon: <FaLock />,
      onClick: () => alert("This is the privacy policy."),
    },
    {
      id: 6,
      title: "Terms of Service",
      icon: <FaFileContract />,
      onClick: () => alert("These are the terms of service."),
    },
    {
      id: 7,
      title: "Logout",
      icon: <FaSignOutAlt />,
      onClick: () => {
        const confirmed = window.confirm("Are you sure you want to logout?");
        if (confirmed) console.log("User logged out");
      },
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-24 bg-[#f9622c] py-6 flex flex-col items-center">
        {[
          { name: "Dashboard", icon: <FaThLarge />, route: "/admin-dashboard" },
          { name: "Customers", icon: <FaUsers />, route: "/customers" },
          { name: "Vendors", icon: <FaStore />, route: "/vendors" },
          { name: "Reports", icon: <FaChartBar />, route: "/reports" },
          { name: "Orders", icon: <FaShoppingCart />, route: "/orders" },
          { name: "Settings", icon: <FaCog />, route: "/settings" },
        ].map((item, index) => (
          <a
            key={index}
            href={item.route}
            className="flex flex-col items-center text-white my-4 hover:text-gray-100"
          >
            <div className="text-xl">{item.icon}</div>
            <span className="text-[10px] mt-1">{item.name}</span>
          </a>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-[#280300] mb-6">Settings</h1>
        <div className="bg-white rounded-xl p-6 shadow-md">
          {settingsOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded hover:bg-gray-100 transition-all duration-150"
            >
              <div className="flex items-center space-x-3">
                <div className="text-[#f9622c]">{option.icon}</div>
                <span className="text-sm font-medium text-gray-800">{option.title}</span>
              </div>
              {option.id === 4 ? (
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notificationsEnabled}
                    onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-[#f9622c] transition"></div>
                </label>
              ) : (
                <button
                  onClick={option.onClick}
                  className="text-sm text-[#f9622c] font-medium hover:underline"
                >
                  Manage
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
