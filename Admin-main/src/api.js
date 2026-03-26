const API_BASE_URL = "https://xtreativeapi.onrender.com";

// Generic authenticated fetch helper
export const authFetch = async (path, options = {}) => {
  const token = localStorage.getItem("authToken");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    throw new Error("No auth token found. Please log in.");
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data.detail) message = data.detail;
    } catch (_) {}
    throw new Error(message);
  }

  if (res.status === 204) return null;

  return res.json();
};

export { API_BASE_URL };

// Finance
export const getTransactions = () => authFetch("/admin/transactions");
export const getAdminPayouts = () => authFetch("/admin/payouts");
export const getProductStock = () => authFetch("/admin/products/stock");

// Loans
export const getLoansList = () => authFetch("/admin/loans");

// Users
export const getVendorsList = () => authFetch("/admin/vendors");
export const getCustomersList = () => authFetch("/admin/customers");