import React, { useState, useRef, useEffect } from "react";
import { FiBell } from "react-icons/fi";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

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

  // Fetch notifications from different endpoints
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
        console.error("Failed to fetch notifications from", url, await response.text());
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching notifications from", url, error);
      return [];
    }
  };

  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        const Notifications = await fetchNotifications(
          "https://api-xtreative.onrender.com/notifications/get/"
        );

        const orderNotifications = await fetchNotifications(
          "https://api-xtreative.onrender.com/orders/place-order/"
        );

        const loanNotifications = await fetchNotifications(
          "https://api-xtreative.onrender.com/loans/list/"
        );

        const vendorNotifications = await fetchNotifications(
          "https://api-xtreative.onrender.com/vendors/list/"
        );

        // Merge notifications and sort by timestamp
        const allNotifications = [
          ...Notifications.map((notif) => ({ ...notif, type: "Chat" })),
          ...orderNotifications.map((notif) => ({ ...notif, type: "Order" })),
          ...loanNotifications.map((notif) => ({ ...notif, type: "Loan" })),
          ...vendorNotifications.map((notif) => ({ ...notif, type: "Vendor" })),
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setNotifications(allNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchAllNotifications();
    const interval = setInterval(fetchAllNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 focus:outline-none"
        onClick={toggleDropdown}
      >
        <FiBell size={20} color="gray" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-30">
          <div className="p-2 border-b font-bold text-sm text-gray-700">
            Notifications
          </div>
          <ul className="divide-y">
            {notifications.length === 0 ? (
              <li className="p-3 text-sm text-gray-500">No new notifications</li>
            ) : (
              notifications.map((notification, index) => (
                <li key={index} className="p-3 hover:bg-gray-100 text-sm">
                  <p className="text-sm text-gray-700 font-semibold">
                    {notification.type} Notification
                  </p>
                  <p className="text-sm text-gray-700">{notification.sender?.username || notification.title}</p>
                  <p className="text-sm text-gray-700">{notification.created_at}</p>
                  <p className="text-xs text-gray-400">{notification.message_content || notification.details}</p>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
