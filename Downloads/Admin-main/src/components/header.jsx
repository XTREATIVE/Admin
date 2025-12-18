// #components/headers.jsx
import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import logo from "../assets/logo.png";
import NotificationBell from "./notificationbell";

const Header = ({ notifications }) => {
  const [menuOpen, setMenuOpen] = useState(false); // <-- 1. Add state

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="relative z-20 flex justify-between items-center bg-[#ccc] p-1 text-[#280300] font-poppins">
      {/* Left: Logo and Search */}
      <div className="flex items-center space-x-6">
        <img src={logo} alt="Logo" className="w-30 h-10 object-cover ml-20" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-[#eee] rounded-full px-10 py-1 focus:outline-none placeholder-gray-500 text-[10px]"
        />
      </div>

      {/* Right: NotificationBell and User Info */}
      <div className="flex items-center space-x-4 relative">
        <NotificationBell notifications={notifications} />
        
        {/* User Icon and Name (Clickable) */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={toggleMenu}>
          <FaUserCircle size={30} color="#fff" />
          <div className="text-right">
            <p className="font-semibold text-gray-500 text-sm">Admin</p>
          </div>
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute top-12 right-0 bg-white border rounded shadow-lg w-40 z-50">
            <a href="/profile" className="block px-4 py-2 hover:bg-gray-100 text-sm">Profile</a>
            <a href="/settings" className="block px-4 py-2 hover:bg-gray-100 text-sm">Settings</a>
            <button
              onClick={() => console.log('Logging out...')}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
