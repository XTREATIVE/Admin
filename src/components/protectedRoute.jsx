<<<<<<< HEAD
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
=======
// src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, ensureValidToken } from "../utils/AuthUtils";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const validateAuthentication = async () => {
      try {
        // Quick check first
        if (!isAuthenticated()) {
          navigate("/login", { replace: true });
          return;
        }

        // Validate token
        const validToken = await ensureValidToken();
        
        if (validToken) {
          setIsAuthorized(true);
        } else {
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error("Auth validation error:", error);
        navigate("/login", { replace: true });
      } finally {
        setIsValidating(false);
      }
    };

    validateAuthentication();

    // Listen for auth changes
    const handleAuthChange = (event) => {
      if (event.detail?.type === "logout") {
        setIsAuthorized(false);
        navigate("/login", { replace: true });
      } else if (event.detail?.type === "login" || event.detail?.type === "tokenRefreshed") {
        setIsAuthorized(true);
      }
    };

    window.addEventListener("authChanged", handleAuthChange);

    return () => {
      window.removeEventListener("authChanged", handleAuthChange);
    };
  }, [navigate]);

  // Show loading while validating
  if (isValidating) {
    return (
      <div className="flex items-center justify-center h-screen font-poppins">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating authentication...</p>
        </div>
      </div>
    );
  }

  // Only render children if authorized
  return isAuthorized ? children : null;
};

export default ProtectedRoute;
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
