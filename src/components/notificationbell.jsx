import { useState } from "react";
import PropTypes from "prop-types";

const NotificationBell = ({ notifications = [] }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative">
        <i className="fas fa-bell"></i>
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-lg z-50">
          <ul>
            {notifications.length > 0 ? (
              notifications.map((n, index) => (
                <li key={index} className="p-2 hover:bg-gray-100">
                  <strong>{n.title}</strong>
                  <p className="text-xs text-gray-500">{n.time}</p>
                </li>
              ))
            ) : (
              <li className="p-2 text-center text-gray-500">No notifications</li>
            )}
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
