import React, { useState, useRef, useEffect, useContext } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { IoMailOutline, IoLockClosed } from "react-icons/io5";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CurrencyContext } from "../context/currencycontext";

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
});

const SettingsProfile = () => {
  const {
    currency,
    country,
    coords,
    setManualCurrency,
    setManualCountry, // Added to support country override
    resetToAutoCurrency,
    loading,
    error,
  } = useContext(CurrencyContext);

  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [step, setStep] = useState("intro"); // intro, email, otp, pin
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
  const [otpError, setOtpError] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);
  const inputRefs = useRef([]);

  // For country/currency overrides
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

  // Focus first OTP input when entering otp step
  useEffect(() => {
    if (step === "otp") {
      setOtpDigits(Array(6).fill(""));
      setOtpError("");
      setTimeout(() => inputRefs.current[0]?.focus(), 0);
    }
  }, [step]);

  // Update selected country/currency when context changes
  useEffect(() => {
    setSelectedCountry(country);
    setSelectedCurrency(currency);
  }, [country, currency]);

  // Step 1: Send OTP
  const handleEmailSubmit = (values, { setSubmitting }) => {
    setTimeout(() => {
      setSubmitting(false);
      setStep("otp");
    }, 800);
  };

  // Handle each OTP digit
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

  // Step 2: Verify OTP
  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length < 6) {
      setOtpError("Please enter all 6 digits.");
      return;
    }
    setSettingsLoading(true);
    setTimeout(() => {
      setSettingsLoading(false);
      setStep("pin");
    }, 800);
  };

  // Step 3: Change PIN
  const handlePinSubmit = (values, { setSubmitting, resetForm }) => {
    setTimeout(() => {
      setSubmitting(false);
      resetForm();
      setStep("intro");
      toast.success("Wallet PIN updated successfully!");
    }, 800);
  };

  // Country selector change
  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);
    setManualCountry(newCountry); // Use context's setManualCountry
    toast.success(`Country set to ${newCountry}`);
  };

  // Currency selector change
  const handleCurrencyChange = (e) => {
    const newCurr = e.target.value;
    setSelectedCurrency(newCurr);
    setManualCurrency(newCurr);
    toast.success(`Currency set to ${newCurr}`);
  };

  // Reset to GPS-based Auto-Detected Currency
  const handleReset = () => {
    resetToAutoCurrency();
    toast.info("Reset to GPS-detected currency");
  };

  return (
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
                <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                  Verify Your Email
                </h2>
                <p className="text-sm text-gray-600 mb-6 text-center">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#f9622c]"
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
                        className="w-full py-2 bg-[#f9622c] text-white rounded font-medium hover:bg-orange-600"
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
                <h2 className="text-lg font-medium text-gray-900 text-center">
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
                  className="w-full py-2 bg-[#f9622c] text-white rounded font-medium hover:bg-orange-600"
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
                <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">
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
                        <label className="text-sm font-medium text-gray-700 mb-1">
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
                          <label className="text-sm font-medium text-gray-700 mb-1">
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
                          <label className="text-sm font-medium text-gray-700 mb-1">
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
                        className="w-full py-2 bg-[#f9622c] text-white rounded font-medium hover:bg-orange-600"
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
      </div>
    </div>
  );
};

export default SettingsProfile;