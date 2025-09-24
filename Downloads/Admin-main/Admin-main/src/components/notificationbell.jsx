import React, { useState, useEffect, useRef } from "react";
import { FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => setOpen(!open);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async (url) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.warn("No auth token found. User might not be logged in.");
      return [];
    }

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch loans from", url, "Status:", response.status, await response.text());
        return [];
      }

      const data = await response.json();
      console.log("Fetched loan data from", url, ":", data); // Debug log
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching loans from", url, error);
      return [];
    }
  };

  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        const loanNotifications = await fetchNotifications(
          "https://api-xtreative.onrender.com/loan_app/loans/"
        );

        const allNotifications = loanNotifications.map((loan) => ({
          ...loan,
          type: "Loan",
          message: loan.status_message || `Loan ${loan.loan_id || "ID"} Updated`,
          read: loan.read || false,
          created_at: loan.updated_at || new Date().toISOString(),
          sender: { username: "System" }, // Default sender for loans
        })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setNotifications(allNotifications);
        setUnreadCount(allNotifications.filter((n) => !n.read).length);
      } catch (error) {
        console.error("Error fetching loans:", error);
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    fetchAllNotifications();
    const interval = setInterval(fetchAllNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleViewAll = () => {
    navigate("/notifications/all");
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 focus:outline-none"
        onClick={toggleDropdown}
      >
        <FiBell size={20} color="gray" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-30 p-4">
          <div className="p-2 border-b font-bold text-sm text-gray-700">
            Notifications
          </div>
          <ul className="divide-y max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="p-3 text-sm text-gray-500">No new notifications</li>
            ) : (
              notifications.map((notification, index) => (
                <li key={index} className="p-2 flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    {notification.avatar && (
                      <img src={notification.avatar} alt="avatar" className="w-8 h-8 rounded-full mr-2" />
                    )}
                    <span className={notification.read ? "text-gray-500" : "text-gray-700 font-medium"}>
                      {notification.message}
                    </span>
                  </div>
                  {notification.sender?.username && (
                    <span className="text-sm text-gray-500">{notification.sender.username}</span>
                  )}
                </li>
              ))
            )}
          </ul>
          <button
            className="mt-2 w-full bg-orange-500 text-white py-1 rounded hover:bg-orange-600"
            onClick={handleViewAll}
          >
            View ALL LOANS
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;