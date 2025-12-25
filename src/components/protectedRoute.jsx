// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const accessToken = localStorage.getItem("authToken");

  // If we DON’T have a token, they must log in first
  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  // Otherwise show the protected content
  return children;
};

export default ProtectedRoute;
