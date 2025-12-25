const API_BASE_URL = "https://api-xtreative.onrender.com"; // your backend base URL

// Generic authenticated fetch helper
export const authFetch = async (path, options = {}) => {
  const token = localStorage.getItem("authToken"); // same key you already use

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
    } catch {
      // ignore JSON parsing errors, keep default message
    }
    throw new Error(message);
  }

  // If no content
  if (res.status === 204) return null;

  return res.json();
};

export { API_BASE_URL };
