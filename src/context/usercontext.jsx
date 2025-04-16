// UserContext.js
import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Get the auth token from localStorage (set by your login process)
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No auth token found. Please log in.");
        }

        const res = await fetch("https://api-xtreative.onrender.com/users/list/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error(`Error fetching users: ${res.statusText}`);
        }
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  /**
   * Helper function to return the username from a user id.
   * Assumes order.customer is the same as user.id.
   */
  const getUsernameById = (userId) => {
    // Ensure we compare numbers (or adjust as needed)
    const user = users.find((u) => u.id === Number(userId));
    return user ? user.username : "Unknown";
  };

  return (
    <UserContext.Provider value={{ users, getUsernameById, loadingUsers, error }}>
      {children}
    </UserContext.Provider>
  );
};
