import React from "react";
import { FaUserCircle } from "react-icons/fa";
import logo from "../assets/logo.png";
import NotificationBell from "./NotificationBell"; // <-- make sure this is imported

const Header = ({ notifications }) => {
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
      <div className="flex items-center space-x-4">
        <NotificationBell notifications={notifications} />
        <div className="flex items-center space-x-2">
          <FaUserCircle size={30} color="#fff" />
          <div className="text-right">
            <p className="font-semibold text-gray-500 text-sm">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
