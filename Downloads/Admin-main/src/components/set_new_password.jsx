// src/components/SetNewPassword.jsx
import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { IoCheckmarkDoneCircle, IoEye, IoEyeOff } from "react-icons/io5";
import Loader from "../pages/Loader";

const SetNewPassword = ({ resetToken, onCancel }) => {
  const navigate = useNavigate();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  // Auto-hide toast after 3s
  useEffect(() => {
    if (toastVisible) {
      const timer = setTimeout(() => setToastVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastVisible]);

  const validationSchema = Yup.object({
    newPassword: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], "Passwords must match")
      .required("Please confirm your password"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const payload = {
      new_password: values.newPassword,
      confirm_password: values.confirmPassword,
    };

    try {
      const res = await fetch(
        "https://api-xtreative.onrender.com/accounts/auth/admin-password-reset/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resetToken}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();

      if (res.ok) {
        setShowLoader(true);
        setToastMessage("Password reset successful!");
        setToastType("success");
        setToastVisible(true);
        resetForm();
        setTimeout(() => navigate("/"), 3500);
      } else {
        const errMsg = data.detail || data.error || "Error resetting password.";
        setToastMessage(errMsg);
        setToastType("error");
        setToastVisible(true);
      }
    } catch {
      setToastMessage("Network error. Please try again.");
      setToastType("error");
      setToastVisible(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (showLoader) {
    return <Loader />;
  }

  return (
    <div className="reset-card">
      <h2 className="title">Set New Password</h2>
      <p className="description text-[11px] mb-6">Enter your new password below.</p>

      <Formik
        initialValues={{ newPassword: "", confirmPassword: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            {/* New Password */}
            <div className="form-group relative">
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type={showNew ? "text" : "password"}
                name="newPassword"
                placeholder="••••••••"
                value={values.newPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className="input pr-10"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute top-9 right-3"
                tabIndex={-1}
              >
                {showNew ? <IoEyeOff size={20} /> : <IoEye size={20} />}
              </button>
              {touched.newPassword && errors.newPassword && (
                <p className="message error">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group relative">
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className="input pr-10"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute top-9 right-3"
                tabIndex={-1}
              >
                {showConfirm ? <IoEyeOff size={20} /> : <IoEye size={20} />}
              </button>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="message error">{errors.confirmPassword}</p>
              )}
            </div>

            <button type="submit" className="button mb-2" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Reset Password"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="text-[11px] underline"
              disabled={isSubmitting}
            >
              Back
            </button>
          </form>
        )}
      </Formik>

      {/* Toast Notification */}
      {toastVisible && (
        <div
          className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded flex items-center space-x-2 shadow-lg text-white text-[11px] ${
            toastType === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <IoCheckmarkDoneCircle size={20} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default SetNewPassword;
