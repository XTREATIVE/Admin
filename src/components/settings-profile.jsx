import React, { useState, useRef, useEffect, useContext } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
<<<<<<< HEAD
import { IoMailOutline, IoLockClosed, IoCheckmarkCircle, IoGlobeOutline } from "react-icons/io5";
=======
import { IoMailOutline, IoLockClosed } from "react-icons/io5";
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CurrencyContext } from "../context/currencycontext";

<<<<<<< HEAD
const TABS = ["Wallet Security", "Localization"];

// Validation schemas
const emailSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
});

const pinSchema = Yup.object().shape({
  currentPin: Yup.string().length(4, "PIN must be 4 digits").required("Current PIN is required"),
  newPin: Yup.string().length(4, "PIN must be 4 digits").required("New PIN is required"),
  confirmPin: Yup.string()
    .oneOf([Yup.ref("newPin"), null], "PINs must match")
    .required("Please confirm your new PIN"),
=======
const TABS = ["Wallet Pin", "Additional Settings"];

// Validation schemas
const emailSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email Field Required"),
});

const pinSchema = Yup.object().shape({
  currentPin: Yup.string().length(4, "PIN must be 4 digits").required("Required"),
  newPin: Yup.string().length(4, "PIN must be 4 digits").required("Required"),
  confirmPin: Yup.string()
    .oneOf([Yup.ref("newPin"), null], "Pins must match")
    .required("Confirm your new PIN"),
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
});

const SettingsProfile = () => {
  const {
    currency,
    country,
<<<<<<< HEAD
    setManualCurrency,
    setManualCountry,
=======
    coords,
    setManualCurrency,
    setManualCountry, // Added to support country override
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
    resetToAutoCurrency,
    loading,
    error,
  } = useContext(CurrencyContext);

  const [activeTab, setActiveTab] = useState(TABS[0]);
<<<<<<< HEAD
  const [step, setStep] = useState("intro");
=======
  const [step, setStep] = useState("intro"); // intro, email, otp, pin
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
  const [otpError, setOtpError] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);
  const inputRefs = useRef([]);

<<<<<<< HEAD
=======
  // For country/currency overrides
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
  const [selectedCountry, setSelectedCountry] = useState(country);
  const [selectedCurrency, setSelectedCurrency] = useState(currency);

  const countryCurrencyMap = {
    Uganda: "UGX",
    Rwanda: "RWF",
    Kenya: "KES",
    "United States": "USD",
    Unknown: "USD",
  };

  const countries = Object.keys(countryCurrencyMap);
  const currencies = ["USD", "UGX", "RWF", "KES"];

<<<<<<< HEAD
=======
  // Focus first OTP input when entering otp step
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
  useEffect(() => {
    if (step === "otp") {
      setOtpDigits(Array(6).fill(""));
      setOtpError("");
      setTimeout(() => inputRefs.current[0]?.focus(), 0);
    }
  }, [step]);

<<<<<<< HEAD
=======
  // Update selected country/currency when context changes
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
  useEffect(() => {
    setSelectedCountry(country);
    setSelectedCurrency(currency);
  }, [country, currency]);

<<<<<<< HEAD
=======
  // Step 1: Send OTP
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
  const handleEmailSubmit = (values, { setSubmitting }) => {
    setTimeout(() => {
      setSubmitting(false);
      setStep("otp");
<<<<<<< HEAD
      toast.success("OTP sent to your email");
    }, 800);
  };

=======
    }, 800);
  };

  // Handle each OTP digit
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
  const handleDigitChange = (idx, val) => {
    if (/^[0-9]?$/.test(val)) {
      const newDigits = [...otpDigits];
      newDigits[idx] = val;
      setOtpDigits(newDigits);
      if (val && idx < 5) {
        inputRefs.current[idx + 1]?.focus();
      }
    }
  };

<<<<<<< HEAD
  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

=======
  // Step 2: Verify OTP
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length < 6) {
<<<<<<< HEAD
      setOtpError("Please enter all 6 digits");
=======
      setOtpError("Please enter all 6 digits.");
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
      return;
    }
    setSettingsLoading(true);
    setTimeout(() => {
      setSettingsLoading(false);
      setStep("pin");
<<<<<<< HEAD
      toast.success("OTP verified successfully");
    }, 800);
  };

=======
    }, 800);
  };

  // Step 3: Change PIN
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
  const handlePinSubmit = (values, { setSubmitting, resetForm }) => {
    setTimeout(() => {
      setSubmitting(false);
      resetForm();
      setStep("intro");
      toast.success("Wallet PIN updated successfully!");
    }, 800);
  };

<<<<<<< HEAD
  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);
    setManualCountry(newCountry);
    toast.success(`Country set to ${newCountry}`);
  };

=======
  // Country selector change
  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);
    setManualCountry(newCountry); // Use context's setManualCountry
    toast.success(`Country set to ${newCountry}`);
  };

  // Currency selector change
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
  const handleCurrencyChange = (e) => {
    const newCurr = e.target.value;
    setSelectedCurrency(newCurr);
    setManualCurrency(newCurr);
    toast.success(`Currency set to ${newCurr}`);
  };

<<<<<<< HEAD
=======
  // Reset to GPS-based Auto-Detected Currency
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
  const handleReset = () => {
    resetToAutoCurrency();
    toast.info("Reset to GPS-detected currency");
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Settings</h1>
          <p className="text-sm text-gray-600">Manage your account security and preferences</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {TABS.map((tab, idx) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setStep("intro");
                }}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? "text-[#f9622c] border-b-2 border-[#f9622c] bg-orange-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {idx === 0 ? <IoLockClosed size={18} /> : <IoGlobeOutline size={18} />}
                  {tab}
                </div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Wallet Security Tab */}
            {activeTab === "Wallet Security" && (
              <div className="max-w-2xl mx-auto">
                {step === "intro" && (
                  <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                      <IoLockClosed size={32} className="text-[#f9622c]" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Change Wallet PIN
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-6 text-left">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Protect your business funds by updating your 4-digit wallet PIN. We'll verify 
                        your identity through email before allowing any changes. This ensures only you 
                        can modify your security settings.
                      </p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-start gap-2">
                          <IoCheckmarkCircle className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
                          <span className="text-sm text-gray-600">Email verification required</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <IoCheckmarkCircle className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
                          <span className="text-sm text-gray-600">Old PIN deactivated immediately</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <IoCheckmarkCircle className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
                          <span className="text-sm text-gray-600">Secure transaction protection</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setStep("email")}
                      className="px-8 py-3 bg-[#f9622c] text-white text-sm font-medium rounded-lg hover:bg-[#e5531a] transition-colors duration-200 shadow-sm"
                    >
                      Continue to Verification
                    </button>
                  </div>
                )}

                {step === "email" && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                        <IoMailOutline size={32} className="text-[#f9622c]" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Verify Your Email
                      </h2>
                      <p className="text-sm text-gray-600">
                        Enter your email address to receive a verification code
                      </p>
                    </div>
                    <Formik
                      initialValues={{ email: "" }}
                      validationSchema={emailSchema}
                      onSubmit={handleEmailSubmit}
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
                        <form onSubmit={handleSubmit} className="space-y-5">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Address
                            </label>
                            <input
                              type="email"
                              name="email"
                              placeholder="your.email@company.com"
                              value={values.email}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f9622c] focus:border-transparent text-sm transition-all"
                            />
                            {touched.email && errors.email && (
                              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                <span>⚠</span> {errors.email}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => setStep("intro")}
                              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 text-sm transition-colors"
                            >
                              Back
                            </button>
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="flex-1 py-3 bg-[#f9622c] text-white rounded-lg font-medium hover:bg-[#e5531a] text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSubmitting ? "Sending..." : "Send OTP"}
                            </button>
                          </div>
                        </form>
                      )}
                    </Formik>
                  </div>
                )}

                {step === "otp" && (
                  <form onSubmit={handleOtpSubmit} className="space-y-6">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                        <IoLockClosed size={32} className="text-[#f9622c]" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Enter Verification Code
                      </h2>
                      <p className="text-sm text-gray-600">
                        We've sent a 6-digit code to your email
                      </p>
                    </div>
                    
                    <div className="flex justify-center gap-3">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (inputRefs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          className="w-12 h-12 border-2 border-gray-300 rounded-lg text-center text-lg font-semibold focus:border-[#f9622c] focus:outline-none transition-colors"
                          disabled={settingsLoading}
                        />
                      ))}
                    </div>
                    
                    {otpError && (
                      <p className="text-sm text-red-600 text-center flex items-center justify-center gap-1">
                        <span>⚠</span> {otpError}
                      </p>
                    )}
                    
                    <div className="space-y-3">
                      <button
                        type="submit"
                        disabled={settingsLoading}
                        className="w-full py-3 bg-[#f9622c] text-white rounded-lg font-medium hover:bg-[#e5531a] text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {settingsLoading ? "Verifying..." : "Verify Code"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep("email")}
                        disabled={settingsLoading}
                        className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 underline"
                      >
                        Resend code or change email
                      </button>
                    </div>
                  </form>
                )}

                {step === "pin" && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                        <IoLockClosed size={32} className="text-[#f9622c]" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Set New PIN
                      </h2>
                      <p className="text-sm text-gray-600">
                        Choose a secure 4-digit PIN for your wallet
                      </p>
                    </div>
                    
                    <Formik
                      initialValues={{ currentPin: "", newPin: "", confirmPin: "" }}
                      validationSchema={pinSchema}
                      onSubmit={handlePinSubmit}
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
                        <form onSubmit={handleSubmit} className="space-y-5">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Current PIN
                            </label>
                            <input
                              type="password"
                              name="currentPin"
                              maxLength={4}
                              placeholder="••••"
                              value={values.currentPin}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f9622c] focus:border-transparent text-sm transition-all"
                            />
                            {touched.currentPin && errors.currentPin && (
                              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                <span>⚠</span> {errors.currentPin}
                              </p>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                New PIN
                              </label>
                              <input
                                type="password"
                                name="newPin"
                                maxLength={4}
                                placeholder="••••"
                                value={values.newPin}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f9622c] focus:border-transparent text-sm transition-all"
                              />
                              {touched.newPin && errors.newPin && (
                                <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                  <span>⚠</span> {errors.newPin}
                                </p>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm PIN
                              </label>
                              <input
                                type="password"
                                name="confirmPin"
                                maxLength={4}
                                placeholder="••••"
                                value={values.confirmPin}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f9622c] focus:border-transparent text-sm transition-all"
                              />
                              {touched.confirmPin && errors.confirmPin && (
                                <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                  <span>⚠</span> {errors.confirmPin}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-[#f9622c] text-white rounded-lg font-medium hover:bg-[#e5531a] text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? "Updating..." : "Update PIN"}
                          </button>
                        </form>
                      )}
                    </Formik>
                  </div>
                )}
              </div>
            )}

            {/* Localization Tab */}
            {activeTab === "Localization" && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                    <IoGlobeOutline size={32} className="text-[#f9622c]" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Localization Settings
                  </h2>
                  <p className="text-sm text-gray-600">
                    Configure your regional preferences and currency
                  </p>
                </div>

                {loading && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">Loading settings...</p>
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <select
                        value={selectedCountry}
                        onChange={handleCountryChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f9622c] focus:border-transparent text-sm transition-all bg-white"
                        disabled={loading || settingsLoading}
                      >
                        <option value="">Select a country</option>
                        {countries.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-2">
                        Your country helps us provide localized content
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={selectedCurrency}
                        onChange={handleCurrencyChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f9622c] focus:border-transparent text-sm transition-all bg-white"
                        disabled={loading || settingsLoading}
                      >
                        {currencies.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-2">
                        All prices will be displayed in this currency
                      </p>
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
                    <div className="flex items-start gap-3">
                      <IoGlobeOutline className="text-[#f9622c] mt-0.5 flex-shrink-0" size={20} />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 mb-1">
                          Auto-Detection Available
                        </h3>
                        <p className="text-xs text-gray-600 mb-3">
                          We can automatically detect your location and set the appropriate currency based on your GPS coordinates.
                        </p>
                        <button
                          onClick={handleReset}
                          className="px-4 py-2 bg-white border border-[#f9622c] text-[#f9622c] rounded-lg font-medium hover:bg-orange-50 text-sm transition-colors"
                          disabled={loading || settingsLoading}
                        >
                          Reset to GPS-Detected Currency
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
=======
    <div className="h-full">
      {/* Tabs */}
      <div className="flex space-x-6 border-b mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setStep("intro");
            }}
            className={`pb-2 text-[13px] font-medium ${
              activeTab === tab
                ? "border-b-2 border-[#f9622c] text-[#f9622c]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content with Vertical Lines */}
      <div className="relative max-w-xl mx-auto">
        {/* Left Vertical Line */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200"></div>
        {/* Right Vertical Line */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-200"></div>

        {/* Wallet Pin tab */}
        {activeTab === "Wallet Pin" && (
          <div className="p-8 max-w-2xl mx-auto">
            {step === "intro" && (
              <div className="text-center space-y-10">
                <h2 className="text-sm font-semibold text-gray-900">
                  Change Wallet PIN
                </h2>
                <p className="text-[11px] text-gray-600">
                  To ensure the highest level of protection for your business funds,
                  you can update your 4-digit wallet PIN at any time from this
                  settings page. Changing your PIN is a quick way to guard against
                  unauthorized access—whether you’ve simply forgotten your current
                  code, suspect it may have been compromised, or just want to refresh
                  your security credentials. Before you select a new PIN, we’ll send
                  a one-time verification link to your registered email address.
                  Once you click that link and confirm it’s you, you’ll be guided
                  through choosing and confirming your new 4-digit code. Your old PIN
                  will be immediately deactivated as soon as the update is complete,
                  and from that moment on all outgoing transactions and sensitive
                  actions will require your fresh, newly created PIN. This additional
                  layer of email verification helps ensure that only you can make
                  critical changes to your business wallet, giving you full confidence
                  that your company’s funds remain under your sole control.
                </p>
                <button
                  onClick={() => setStep("email")}
                  className="mt-4 px-6 py-2 bg-[#f9622c] text-[13px] text-white rounded font-medium hover:bg-orange-600"
                >
                  Continue
                </button>
              </div>
            )}

            {step === "email" && (
              <div>
                <IoMailOutline
                  size={48}
                  className="text-[#f9622c] mb-4 mx-auto block"
                />
                <h2 className="text-sm font-semibold text-gray-900 mb-2 text-center">
                  Verify Your Email
                </h2>
                <p className="text-[13px] text-gray-600 mb-6 text-center">
                  Enter your email to receive an OTP before changing your PIN.
                </p>
                <Formik
                  initialValues={{ email: "" }}
                  validationSchema={emailSchema}
                  onSubmit={handleEmailSubmit}
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
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#f9622c] text-[13px]"
                        />
                        {touched.email && errors.email && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2 bg-[#f9622c] text-white rounded font-medium hover:bg-orange-600 text-[13px]"
                      >
                        {isSubmitting ? "Sending…" : "Send OTP"}
                      </button>
                    </form>
                  )}
                </Formik>
              </div>
            )}

            {step === "otp" && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <IoLockClosed
                  size={48}
                  className="text-[#f9622c] mb-2 mx-auto block"
                />
                <h2 className="text-sm font-medium text-gray-900 text-center">
                  Enter OTP
                </h2>
                <div className="flex justify-center space-x-2 mb-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      className="w-10 h-10 border border-gray-300 rounded text-center focus:border-[#f9622c]"
                      disabled={settingsLoading}
                    />
                  ))}
                </div>
                {otpError && (
                  <p className="text-xs text-red-600 text-center">{otpError}</p>
                )}
                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="w-full py-2 bg-[#f9622c] text-white rounded font-medium hover:bg-orange-600 text-[13px]"
                >
                  {settingsLoading ? "Verifying…" : "Verify OTP"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  disabled={settingsLoading}
                  className="w-full py-1 text-sm text-gray-700 underline"
                >
                  Back to Email
                </button>
              </form>
            )}

            {step === "pin" && (
              <div>
                <IoLockClosed
                  size={48}
                  className="text-[#f9622c] mb-4 mx-auto block"
                />
                <h2 className="text-sm font-semibold text-gray-900 mb-2 text-center">
                  Change Wallet PIN
                </h2>
                <Formik
                  initialValues={{ currentPin: "", newPin: "", confirmPin: "" }}
                  validationSchema={pinSchema}
                  onSubmit={handlePinSubmit}
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
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="flex flex-col">
                        <label className="text-[13px] font-medium text-gray-700 mb-1">
                          Current PIN
                        </label>
                        <input
                          type="password"
                          name="currentPin"
                          maxLength={4}
                          value={values.currentPin}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#f9622c]"
                        />
                        {touched.currentPin && errors.currentPin && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors.currentPin}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-[13px] font-medium text-gray-700 mb-1">
                            New PIN
                          </label>
                          <input
                            type="password"
                            name="newPin"
                            maxLength={4}
                            value={values.newPin}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#f9622c]"
                          />
                          {touched.newPin && errors.newPin && (
                            <p className="text-xs text-red-600 mt-1">
                              {errors.newPin}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[13px] font-medium text-gray-700 mb-1">
                            Confirm PIN
                          </label>
                          <input
                            type="password"
                            name="confirmPin"
                            maxLength={4}
                            value={values.confirmPin}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#f9622c]"
                          />
                          {touched.confirmPin && errors.confirmPin && (
                            <p className="text-xs text-red-600 mt-1">
                              {errors.confirmPin}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2 bg-[#f9622c] text-white rounded font-medium hover:bg-orange-600 text-[13px]"
                      >
                        {isSubmitting ? "Updating…" : "Update PIN"}
                      </button>
                    </form>
                  )}
                </Formik>
              </div>
            )}
          </div>
        )}

        {/* Additional Settings tab */}
        {activeTab === "Additional Settings" && (
          <div className="p-8 max-w-2xl mx-auto">
            {loading && (
              <p className="text-gray-600 mb-4 text-sm">Loading settings...</p>
            )}
            {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

            <div className="space-y-6">
              <h3 className="text-[13px] font-medium text-gray-900">
                Localization Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#f9622c] text-[13px]"
                    disabled={loading || settingsLoading}
                  >
                    <option value="">Select a country</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={selectedCurrency}
                    onChange={handleCurrencyChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#f9622c] text-[13px]"
                    disabled={loading || settingsLoading}
                  >
                    {currencies.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleReset}
                  className="w-full py-2 bg-[#f9622c] text-white rounded font-medium hover:bg-orange-600 text-[13px]"
                  disabled={loading || settingsLoading}
                >
                  Reset to GPS-Detected Currency
                </button>
              </div>
            </div>
          </div>
        )}
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
      </div>
    </div>
  );
};

export default SettingsProfile;