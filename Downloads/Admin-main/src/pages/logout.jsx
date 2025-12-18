import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";  // Adjust the path as needed

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear the authentication tokens from localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");

    // Optionally, clear any additional user data here

    // Redirect to login after a brief message
    setTimeout(() => {
      navigate("/");
    }, 500);
  }, [navigate]);

  return (
    <>
      {/* Render the loader overlay */}
      <Loader />
      
      {/* Absolute positioned text on top of the loader */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1100, // Higher than the loader's z-index
          textAlign: "center",
        }}
      >
        <h2>Logging out...</h2>
      </div>
    </>
  );
};

export default Logout;
