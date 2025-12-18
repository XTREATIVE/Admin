// src/components/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { IoLockClosed } from "react-icons/io5";
import resetImage from "../assets/reset_pass.jpeg";
import OTPVerification from "../components/otp_verification";
import SetNewPassword from "../components/set_new_password";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [showSetNew, setShowSetNew] = useState(false);
  const [resetToken, setResetToken] = useState("");

  // On mount, check sessionStorage for existing token
  useEffect(() => {
    const storedToken = sessionStorage.getItem("resetToken");
    if (storedToken) {
      setResetToken(storedToken);
      setShowSetNew(true);
    }
  }, []);

  // Validation schema for email
  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email address").required("Email is required"),
  });

  // 1) Request OTP
  const handleReset = async (values, { setSubmitting }) => {
    try {
      const res = await fetch(
        "https://api-xtreative.onrender.com/accounts/auth/password-reset/request/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: values.email }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMessage(
          "If an account with that email exists, you’ll receive an OTP shortly."
        );
        setError("");
        setOtpStep(true);
      } else {
        setError(data.detail || "Something went wrong.");
        setMessage("");
      }
    } catch {
      setError("Network error.");
      setMessage("");
    } finally {
      setSubmitting(false);
    }
  };

  // 2) OTP succeeded → store token and show new password form
  const handleOtpSuccess = (token) => {
    setResetToken(token);
    sessionStorage.setItem("resetToken", token);
    setOtpStep(false);
    setShowSetNew(true);
  };

  // Cancel in SetNewPassword → clear token and go back
  const handleCancel = () => {
    sessionStorage.removeItem("resetToken");
    setResetToken("");
    setShowSetNew(false);
    setOtpStep(true);
  };

  return (
    <div className="reset-password-screen font-poppins flex min-h-screen">
      <style>{`
        .reset-password-screen { background:#f9fafb; }
        .left-panel, .right-panel { flex:1; display:flex; align-items:center; justify-content:center; }
        .left-panel { padding:4rem; }
        .reset-card { max-width:500px;width:100%;background:#f9fafb;padding:2rem;border-radius:8px;text-align:center; }
        .icon-lock { margin:0 auto 1rem;display:block;color:#f9622c; }
        .title { font-size:1.2rem;font-weight:700;color:#111827;margin-bottom:.5rem; }
        .description { font-size:.875rem;color:#6b7280;margin-bottom:1.5rem; }
        .form-group { margin-bottom:1.5rem;text-align:left; }
        .input { width:100%;padding:.75rem 1rem;border:1px solid #d1d5db;border-radius:4px;font-size:.875rem; }
        .input:focus { outline:none;border-color:#280300; }
        .button { width:100%;background:#f9622c;color:#fff;padding:.75rem;border:none;border-radius:4px;font-size:.875rem;font-weight:600;cursor:pointer; }
        .button:hover { background:#d94a1a; }
        .message { font-size:.7rem;margin-top:1rem; }
        .error { color:#dc2626; }
        .success { color:#16a34a; }
        .back-link { margin-top:1.5rem;font-size:.875rem;color:#6b7280; }
        .back-link span { color:#111827;cursor:pointer;font-weight:600; }
        .right-panel img { width:100%;height:auto;object-fit:contain;border-radius:0 8px 8px 0; }
      `}</style>

      <div className="left-panel">
        {showSetNew ? (
          // Step 3: set new password with stored token
          <SetNewPassword resetToken={resetToken} onCancel={handleCancel} />
        ) : otpStep ? (
          // Step 2: OTP input
          <OTPVerification
            isOpen={true}
            onClose={() => setOtpStep(false)}
            onSuccess={handleOtpSuccess}
          />
        ) : (
          // Step 1: request OTP form
          <div className="reset-card">
            <IoLockClosed size={48} className="icon-lock" />
            <h1 className="title">Reset Password</h1>
            <p className="description">
              Enter your email to receive an OTP to reset your password.
            </p>
            <Formik
              initialValues={{ email: "" }}
              validationSchema={validationSchema}
              onSubmit={handleReset}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      className="input"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.email}
                    />
                    {touched.email && errors.email && (
                      <div className="message error">{errors.email}</div>
                    )}
                  </div>
                  <button type="submit" className="button" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send OTP"}
                  </button>
                  {message && <div className="message success">{message}</div>}
                  {error && <div className="message error">{error}</div>}
                  <div className="back-link">
                    Back to <span onClick={() => navigate("/")}>Sign In</span>
                  </div>
                </form>
              )}
            </Formik>
          </div>
        )}
      </div>

      <div className="right-panel">
        <img src={resetImage} alt="Reset Password Illustration" loading="lazy" />
      </div>
    </div>
  );
};

export default ResetPassword;
