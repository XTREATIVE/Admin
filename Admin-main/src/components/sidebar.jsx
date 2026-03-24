import React from "react";
import { Link } from "react-router-dom";
import {
  FiFileText,
} from "react-icons/fi";
import "../styles/sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <Link to="/reports" className="sidebar-btn">
          <FiFileText size={15} />
          <span>Reports</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
