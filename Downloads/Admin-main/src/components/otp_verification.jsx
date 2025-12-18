// src/components/OTPVerification.jsx
import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Lock } from "lucide-react";

const OTPVerification = ({ isOpen, onClose, onSuccess }) => {
  const [pinDigits, setPinDigits] = useState(["", "", "", "", "", ""]);
  const [pinError, setPinError] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setPinDigits(["", "", "", "", "", ""]);
      setPinError("");
      setApiError("");
      // focus first input when component mounts
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 0);
    }
  }, [isOpen]);

  const handleDigitChange = (idx, val) => {
    if (/^[0-9]?$/.test(val)) {
      const newDigits = [...pinDigits];
      newDigits[idx] = val;
      setPinDigits(newDigits);
      if (val && idx < 5) {
        inputRefs.current[idx + 1]?.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = pinDigits.join("");
    if (otpCode.length < 6) {
      setPinError("Please enter a valid 6-digit OTP code.");
      return;
    }
    setLoading(true);
    setPinError("");
    setApiError("");

    try {
      const res = await fetch(
        "https://api-xtreative.onrender.com/accounts/auth/password-reset/admin-reset-verify-otp/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp_code: otpCode }),
        }
      );
      const result = await res.json();
      if (res.ok) {
        // persist the token immediately
        sessionStorage.setItem("resetToken", result.reset_token);
        onSuccess(result.reset_token);
      } else {
        setApiError(result.detail || "Invalid OTP code. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setApiError("Network error. Please try later.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="reset-card">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-[#f9622c] flex items-center justify-center">
          <Lock size={32} className="text-white" />
        </div>
      </div>
      <h1 className="title">Enter OTP</h1>
      <p className="description text-[11px] mb-6">
        Enter the OTP you received in your email to continue.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="flex justify-center space-x-2 mb-4">
          {pinDigits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              className="w-12 h-12 border border-gray-300 rounded-md text-center text-lg font-medium focus:border-orange-400 focus:outline-none"
              disabled={loading}
            />
          ))}
        </div>
        {pinError && (
          <p className="text-red-600 text-[11px] mb-4">{pinError}</p>
        )}
        {apiError && (
          <p className="text-red-600 text-[11px] mb-4">{apiError}</p>
        )}
        <button
          type="submit"
          className="w-full py-3 bg-[#f9622c] text-white font-semibold rounded-md text-[11px] disabled:opacity-50 mb-2"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
        <button
          type="button"
          className="w-full py-2 text-[11px] underline"
          onClick={onClose}
          disabled={loading}
        >
          Back
        </button>
      </form>
    </div>
  );
};

OTPVerification.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default OTPVerification;
