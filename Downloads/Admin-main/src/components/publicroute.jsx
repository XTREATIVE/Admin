import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  // If token exists, user is authenticated.
  const isAuthenticated = !!localStorage.getItem("authToken");

  // Redirect authenticated users to the dashboard (or any protected page)
  if (isAuthenticated) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  // Else, render the public component (e.g., LoginScreen)
  return children;
};

export default PublicRoute;
