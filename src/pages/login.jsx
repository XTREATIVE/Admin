// src/components/LoginScreen.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import logo from "../assets/logo.png";

const API_URL = "https://api-xtreative.onrender.com/accounts/admin/login/"; // keep your endpoint

const LoginScreen = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(4, "Password must be at least 4 characters")
      .required("Password is required"),
  });

  const persistTokens = (data) => {
    try {
      // Backends and other parts of your code may expect different keys;
      // store tokens under multiple commonly used keys so consumers don't fail.
      const access = data.access || data.token || data.access_token || null;
      const refresh = data.refresh || data.refreshToken || data.refresh_token || null;

      if (access) {
        localStorage.setItem("authToken", access);
        localStorage.setItem("accessToken", access);
        localStorage.setItem("token", access);
        localStorage.setItem("access", access);
        // set a session cookie fallback (expires with session) to help some hosts/clients
        try { sessionStorage.setItem("authToken", access); } catch { /* ignore sessionStorage errors */ }
      }
      if (refresh) {
        localStorage.setItem("refreshToken", refresh);
        localStorage.setItem("refresh", refresh);
      }
    } catch (err) {
      console.warn("Could not persist tokens safely:", err);
    }
  };

  const handleLogin = async (values, { setSubmitting }) => {
    setLoginError("");
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      // try to parse JSON safely
      let data = {};
      try {
        data = await response.json();
      } catch {
        // not JSON or empty body — fall back to empty object
        data = {};
      }

      if (response.ok && (data.access || data.token || data.access_token)) {
        persistTokens(data);

        setLoginError("");
        setLoginSuccess(true);

        // Quick user experience improvement: navigate with replace so back button doesn't return to login
        navigate("/admin-dashboard", { replace: true });
      } else {
        // Prefer explicit messages from backend, fall back to friendly message
        const msg =
          data.message ||
          data.detail ||
          data.error ||
          (typeof data === "string" ? data : null) ||
          "Invalid credentials. Please try again.";

        setLoginError(msg);
        setLoginSuccess(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Something went wrong. Please check your network and try again.");
      setLoginSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-screen font-poppins">
      <style>{`
        .login-screen { min-height:100vh; background-color:#fff; display:flex; flex-direction:column; }
        .login-container { flex-grow:1; display:flex; justify-content:center; align-items:center; padding:16px; }
        .login-card { width:100%; max-width:450px; background:#fff; border:1px solid #ddd; border-radius:8px; padding:40px; box-shadow:0 4px 8px rgba(0,0,0,0.08); position:relative; }
        .login-card-title { text-align:center; font-size:2rem; font-weight:700; margin-bottom:32px; color:#280300; }
        .login-form { display:flex; flex-direction:column; }
        .form-group { position:relative; margin-bottom:24px; }
        .login-input { width:100%; padding:12px 8px; font-size:14px; border:1px solid #ccc; border-radius:4px; background:transparent; outline:none; transition:border-color .2s; }
        .login-input:focus { border-color:#6B46C1; }
        .login-label { position:absolute; left:12px; top:12px; font-size:14px; color:#999; background:transparent; padding:0 4px; transition:all .2s; pointer-events:none; }
        .login-input:focus + .login-label, .login-input:not(:placeholder-shown) + .login-label { top:-10px; left:8px; font-size:12px; color:#6B46C1; background:#fff; }
        .login-error { font-size:12px; color:#F9622C; margin-top:4px; }
        .forgot-password-container { text-align:right; margin-bottom:24px; }
        .forgot-password { font-size:12px; color:#1976D2; background:none; border:none; cursor:pointer; padding:0; }
        .login-button { width:100%; background-color:#280300; color:#fff; padding:12px; border:none; border-radius:4px; font-size:16px; cursor:pointer; transition: background-color .3s; }
        .login-button:hover { background-color:#1e0200; }
        .login-button:disabled { background-color:#999; cursor:not-allowed; }
        .error-message, .success-message { margin-top:16px; padding:8px; border-radius:4px; font-size:12px; text-align:center; }
        .error-message { background:#ffe6e6; color:#d9534f; }
        .success-message { background:#e6ffe6; color:#28a745; }
        .loader { margin:0 auto 16px; border:4px solid #f3f3f3; border-top:4px solid #280300; border-radius:50%; width:30px; height:30px; animation:spin 1s linear infinite; }
        @keyframes spin { 0%{ transform:rotate(0deg); } 100%{ transform:rotate(360deg); } }
        .login-footer { margin-top:32px; display:flex; justify-content:center; }
        .login-logo { width:100px; height:60px; object-fit:contain; }
        .password-toggle-icon { position:absolute; top:50%; right:12px; transform:translateY(-50%); cursor:pointer; color:#999; }
      `}</style>

      <div className="login-container">
        <div className="login-card">
          <h2 className="login-card-title">Sign In</h2>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isSubmitting,
            }) => (
              <form onSubmit={handleSubmit} className="login-form" noValidate>
                {isSubmitting && <div className="loader" />}

                <div className="form-group">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.email}
                    className="login-input"
                    placeholder=" "
                    autoComplete="email"
                  />
                  <label htmlFor="email" className="login-label">
                    Email
                  </label>
                  {touched.email && errors.email && (
                    <p className="login-error">{errors.email}</p>
                  )}
                </div>

                <div className="form-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                    className="login-input"
                    placeholder=" "
                    autoComplete="current-password"
                  />
                  <label htmlFor="password" className="login-label">
                    Password
                  </label>
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowPassword((p) => !p)}
                    role="button"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? (
                      <IoEyeOffOutline size={20} />
                    ) : (
                      <IoEyeOutline size={20} />
                    )}
                  </span>
                  {touched.password && errors.password && (
                    <p className="login-error">{errors.password}</p>
                  )}
                </div>

                <div className="forgot-password-container">
                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() => {
                      try { sessionStorage.removeItem("resetToken"); } catch { /* ignore */ }
                      navigate("/reset_password");
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="login-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </button>

                {loginError && (
                  <div className="error-message" role="alert">{loginError}</div>
                )}
                {loginSuccess && (
                  <div className="success-message">Login successful! Redirecting...</div>
                )}
              </form>
            )}
          </Formik>

          <div className="login-footer">
            <img src={logo} alt="Logo" className="login-logo" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
