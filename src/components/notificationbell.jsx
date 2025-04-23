import React, { useState, useRef, useEffect } from "react";
import { FiBell } from "react-icons/fi";
import PropTypes from "prop-types"; 

const NotificationBell = ({ notifications= [] }) => {
  const [open, setOpen] = useState(false);
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
            {notifications.map((notification, index) => (
              <li key={index} className="p-3 hover:bg-gray-100 text-sm">
                <p className="text-sm text-gray-700">{notification.title}</p>
                <p className="text-xs text-gray-400">{notification.time}</p>

              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

NotificationBell.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      time: PropTypes.string,
    })
  ),
};

export default NotificationBell;
