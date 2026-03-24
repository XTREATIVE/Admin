const API_BASE_URL = "https://api-xtreative-nwf7.onrender.com";

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

// ============================================
// ACCOUNTS - Admin Operations
// ============================================

// Admin Login
export const adminLogin = (credentials) =>
  authFetch("/accounts/admin/login/", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

// Admin Verify OTP
export const adminVerifyOTP = (data) =>
  authFetch("/accounts/admin/verify-otp/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Admin Resend OTP
export const adminResendOTP = (data) =>
  authFetch("/accounts/admin/resend-otp/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Admin Password Reset
export const adminPasswordReset = (data) =>
  authFetch("/accounts/auth/admin-password-reset/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Admin Password Reset Verify OTP
export const adminPasswordResetVerifyOTP = (data) =>
  authFetch("/accounts/auth/password-reset/admin-reset-verify-otp/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Change Password
export const changePassword = (data) =>
  authFetch("/accounts/change-password/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ============================================
// ADMINS - Admin Operations
// ============================================

// Get Admin List
export const getAdminsList = () => authFetch("/admins/list/");

// Get Admin Details
export const getAdminDetails = (id) => authFetch(`/admins/${id}/details/`);

// Update Admin
export const updateAdmin = (id, data) =>
  authFetch(`/admins/${id}/update/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Patch Admin
export const patchAdmin = (id, data) =>
  authFetch(`/admins/${id}/update/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// Delete Admin
export const deleteAdmin = (id) =>
  authFetch(`/admins/${id}/delete/`, {
    method: "DELETE",
  });

// Admin Register
export const registerAdmin = (data) =>
  authFetch("/admins/register/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Admin Login (alternative)
export const adminsLogin = (credentials) =>
  authFetch("/admins/login/", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

// Admin Resend OTP
export const adminsResendOTP = (data) =>
  authFetch("/admins/resend-otp/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Admin Verify OTP
export const adminsVerifyOTP = (data) =>
  authFetch("/admins/verify-otp/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Get Admin Payouts
export const getAdminPayouts = () => authFetch("/admins/payouts/");

// ============================================
// CUSTOMERS - Admin Operations
// ============================================

// Get Customer List
export const getCustomersList = () => authFetch("/customers/list/");

// Get Customer Details
export const getCustomerDetails = (id) =>
  authFetch(`/customers/${id}/details/`);

// Update Customer
export const updateCustomer = (id, data) =>
  authFetch(`/customers/${id}/update/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Patch Customer
export const patchCustomer = (id, data) =>
  authFetch(`/customers/${id}/patch/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// Delete Customer
export const deleteCustomer = (id) =>
  authFetch(`/customers/${id}/delete/`, {
    method: "DELETE",
  });

// Activate Customer
export const activateCustomer = (id) =>
  authFetch(`/customers/${id}/activate/`, {
    method: "POST",
  });

// Deactivate Customer
export const deactivateCustomer = (id) =>
  authFetch(`/customers/${id}/deactivate/`, {
    method: "POST",
  });

// Disconnect Customer
export const disconnectCustomer = (id) =>
  authFetch(`/customers/${id}/disconnect/`, {
    method: "POST",
  });

// Register Customer
export const registerCustomer = (data) =>
  authFetch("/customers/register/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Get Customer Shipping Address
export const getCustomerShippingAddress = () =>
  authFetch("/customers/shipping-address/");

// Create Customer Shipping Address
export const createCustomerShippingAddress = (data) =>
  authFetch("/customers/shipping-address/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Get Shipping Methods
export const getShippingMethods = () =>
  authFetch("/customers/shipping-methods/");

// Create Shipping Method
export const createShippingMethod = (data) =>
  authFetch("/customers/shipping-methods/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Create Currency
export const createCurrency = (data) =>
  authFetch("/customers/currencies/create/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Set Currency
export const setCurrency = (data) =>
  authFetch("/customers/currency/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ============================================
// VENDORS - Admin Operations
// ============================================

// Get Vendor List
export const getVendorsList = () => authFetch("/vendors/list/");

// Get Vendor Details
export const getVendorDetails = (id) => authFetch(`/vendors/${id}/details/`);

// Update Vendor
export const updateVendor = (id, data) =>
  authFetch(`/vendors/${id}/update/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Patch Vendor
export const patchVendor = (id, data) =>
  authFetch(`/vendors/${id}/patch/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// Delete Vendor
export const deleteVendor = (id) =>
  authFetch(`/vendors/${id}/delete/`, {
    method: "DELETE",
  });

// Approve Vendor
export const approveVendor = (vendorId) =>
  authFetch(`/vendors/${vendorId}/approve/`, {
    method: "POST",
  });

// Reject Vendor
export const rejectVendor = (vendorId) =>
  authFetch(`/vendors/${vendorId}/reject/`, {
    method: "POST",
  });

// Vendor Login
export const vendorLogin = (credentials) =>
  authFetch("/vendors/login/", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

// Vendor Verify OTP
export const vendorVerifyOTP = (data) =>
  authFetch("/vendors/verify-otp/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Vendor Resend OTP
export const vendorResendOTP = (data) =>
  authFetch("/vendors/resend-otp/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Get Vendor Register
export const getVendorRegister = () => authFetch("/vendors/register/");

// Vendor Register
export const vendorRegister = (data) =>
  authFetch("/vendors/register/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Vendor OTP Login
export const vendorOTPLogin = (data) =>
  authFetch("/vendors/otp/login/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Vendor OTP Resend
export const vendorOTPResend = (data) =>
  authFetch("/vendors/otp/resend/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Vendor OTP Verify
export const vendorOTPVerify = (data) =>
  authFetch("/vendors/otp/verify/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Get Vendor Notifications
export const getVendorNotifications = () =>
  authFetch("/vendors/notifications/");

// Get Vendor Payouts
export const getVendorPayouts = () => authFetch("/vendors/payouts/");

// Get Vendor Stock
export const getVendorStock = () => authFetch("/vendors/stock/");

// Vendor Restock
export const vendorRestock = (data) =>
  authFetch("/vendors/restock/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Vendor Sales Settle
export const vendorSalesSettle = (orderItemId) =>
  authFetch(`/vendors/sales/${orderItemId}/settle/`, {
    method: "POST",
  });

// Get Vendor Receipt
export const getVendorReceipt = (orderId) =>
  authFetch(`/vendors/${orderId}/receipt/`);

// ============================================
// PRODUCTS - Admin Operations
// ============================================

// Get Product List
export const getProductsList = () => authFetch("/products/list/");

// Get Product Listing
export const getProductListing = () => authFetch("/products/listing/");

// Get Product Details
export const getProductDetails = (id) => authFetch(`/products/${id}/details/`);

// Get Product for Edit
export const getProductEdit = (id) => authFetch(`/products/${id}/edit/`);

// Update Product
export const updateProduct = (id, data) =>
  authFetch(`/products/${id}/edit/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Patch Product
export const patchProduct = (id, data) =>
  authFetch(`/products/${id}/edit/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// Delete Product
export const deleteProduct = (id) =>
  authFetch(`/products/${id}/delete/`, {
    method: "DELETE",
  });

// Admin Delete Product
export const adminDeleteProduct = (id) =>
  authFetch(`/products/admin/products/${id}/delete/`, {
    method: "DELETE",
  });

// Add Product
export const addProduct = (data) =>
  authFetch("/products/add/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Get Product Presigned URL
export const getProductPresignedUrl = (productId) =>
  authFetch(`/products/${productId}/presigned-url/`);

// Get Product Stock
export const getProductStock = () => authFetch("/products/stock/");

// Get Reviews
export const getReviews = () => authFetch("/products/reviews/");

// Get Review Details
export const getReviewDetails = (id) => authFetch(`/products/reviews/${id}/`);

// Update Review
export const updateReview = (id, data) =>
  authFetch(`/products/reviews/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Patch Review
export const patchReview = (id, data) =>
  authFetch(`/products/reviews/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// Delete Review
export const deleteReview = (id) =>
  authFetch(`/products/reviews/${id}/`, {
    method: "DELETE",
  });

// Get Product Reviews
export const getProductReviews = () =>
  authFetch("/products/reviews/product_reviews/");

// Get Vendor Reviews
export const getVendorReviews = () =>
  authFetch("/products/reviews/vendor_reviews/");

// Get My Reviews
export const getMyReviews = () => authFetch("/products/reviews/my_reviews/");

// Get Review Ratings
export const getProductRatings = (productId) =>
  authFetch(`/products/products/${productId}/ratings/`);

// Get Review Stats
export const getReviewStats = () =>
  authFetch("/products/reviews/review_stats/");

// Get Review Ratings
export const getReviewRatings = (id) =>
  authFetch(`/products/reviews/${id}/ratings/`);

// Reply to Review
export const replyToReview = (reviewId, data) =>
  authFetch(`/products/reviews/${reviewId}/reply/`, {
    method: "POST",
    body: JSON.stringify(data),
  });

// Create Review
export const createReview = (data) =>
  authFetch("/products/reviews/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ============================================
// ORDERS - Admin Operations
// ============================================

// Get Order List
export const getOrdersList = () => authFetch("/orders/list/");

// Get Order Details
export const getOrderDetails = (orderId) => authFetch(`/orders/${orderId}/`);

// Update Order Status
export const updateOrderStatus = (orderId, data) =>
  authFetch(`/orders/${orderId}/update-status/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// Patch Order Status
export const patchOrderStatus = (orderId, data) =>
  authFetch(`/orders/${orderId}/status/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// Mark Order Sent
export const markOrderSent = (orderId) =>
  authFetch(`/orders/${orderId}/mark-sent/`, {
    method: "POST",
  });

// Create Draft Order
export const createDraftOrder = (data) =>
  authFetch("/orders/create-draft-order/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Place Order
export const placeOrder = (data) =>
  authFetch("/orders/place-order/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Pay Order
export const payOrder = (data) =>
  authFetch("/orders/pay_order/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Confirm Warehouse
export const confirmWarehouse = (orderId) =>
  authFetch(`/orders/orders/${orderId}/confirm-warehouse/`, {
    method: "POST",
  });

// Mark Sent (Orders)
export const ordersMarkSent = (orderId) =>
  authFetch(`/orders/orders/${orderId}/mark-sent/`, {
    method: "POST",
  });

// Get Admin Payments
export const getAdminPayments = () => authFetch("/orders/admin/payments/");

// ============================================
// SALES - Admin Operations
// ============================================

// Get Sales List
export const getSalesList = () => authFetch("/sales/list/");

// Get Sales Details
export const getSalesDetails = (id) => authFetch(`/sales/${id}/details`);

// Update Sale
export const updateSale = (id, data) =>
  authFetch(`/sales/${id}/update`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Patch Sale
export const patchSale = (id, data) =>
  authFetch(`/sales/${id}/update`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// Delete Sale
export const deleteSale = (id) =>
  authFetch(`/sales/${id}/delete`, {
    method: "DELETE",
  });

// Get Sales Invoice
export const getSalesInvoice = (id) => authFetch(`/sales/${id}/invoice`);

// Get Sales PDF
export const getSalesPDF = (id) => authFetch(`/sales/${id}/pdf/`);

// Get Sales Analytics
export const getSalesAnalytics = () => authFetch("/sales/analytics");

// Get Sales Graph
export const getSalesGraph = () => authFetch("/sales/graph");

// ============================================
// PAYMENTS - Admin Operations
// ============================================

// Get Transactions
export const getTransactions = () => authFetch("/payments/transactions/");

// Get Transaction Status
export const getTransactionStatus = (data) =>
  authFetch("/payments/transaction-status/", {
    method: "GET",
    ...(data && { params: data }),
  });

// Admin Release Payout
export const adminReleasePayout = (transactionId) =>
  authFetch(`/payments/admin/payouts/${transactionId}/release/`, {
    method: "POST",
  });

// Admin Generate Report
export const adminGenerateReport = () =>
  authFetch("/payments/admin/reports/generate/");

// Pesapal Callback
export const pesapalCallback = (data) =>
  authFetch("/payments/pesapal-callback/", { params: data });

// Pesapal Redirect
export const pesapalRedirect = (data) =>
  authFetch("/payments/pesapal-redirect/", { params: data });

// Pesapal IPN
export const pesapalIPN = (data) =>
  authFetch("/payments/pesapal/ipn/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Pesapal Topup
export const pesapalTopup = (data) =>
  authFetch("/payments/pesapal/topup/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Vendor Payout
export const vendorPayout = (vendorId, orderItemId) =>
  authFetch(
    `/payments/vendors/${vendorId}/order-items/${orderItemId}/payout/`,
    {
      method: "POST",
    },
  );

// ============================================
// WALLETS - Admin Operations
// ============================================

// Get Customer Wallet Balance
export const getCustomerWalletBalance = () =>
  authFetch("/wallets/balance/customer/");

// Get Vendor Wallet Balance
export const getVendorWalletBalance = () =>
  authFetch("/wallets/balance/vendor/");

// Create Wallet
export const createWallet = (data) =>
  authFetch("/wallets/create/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Deposit
export const deposit = (data) =>
  authFetch("/wallets/deposit/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Withdraw
export const withdraw = (data) =>
  authFetch("/wallets/withdraw/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Transfer
export const transfer = (data) =>
  authFetch("/wallets/transfer/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Set PIN
export const setPin = (data) =>
  authFetch("/wallets/set-pin/", {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Patch Set PIN
export const patchSetPin = (data) =>
  authFetch("/wallets/set-pin/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// Reset PIN
export const resetPin = (data) =>
  authFetch("/wallets/reset-pin/", {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Patch Reset PIN
export const patchResetPin = (data) =>
  authFetch("/wallets/reset-pin/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// Request OTP
export const requestWalletOTP = (data) =>
  authFetch("/wallets/request-otp/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Business Wallet Balance
export const businessWalletBalance = (data) =>
  authFetch("/wallets/business-wallet/balance/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Get Customer Transactions
export const getCustomerTransactions = () =>
  authFetch("/wallets/transactions/customer/");

// Get Vendor Transactions
export const getVendorTransactions = () =>
  authFetch("/wallets/transactions/vendor/");

// ============================================
// LOANS - Admin Operations
// ============================================

// Get Loans List
export const getLoansList = () => authFetch("/loan_app/loans/list/");

// Apply for Loan
export const applyLoan = (data) =>
  authFetch("/loan_app/apply/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Get Loan Details
export const getLoanDetails = (id) => authFetch(`/loan_app/loan/${id}/`);

// Approve Loan
export const approveLoan = (loanId) =>
  authFetch(`/loan_app/${loanId}/approve/`, {
    method: "POST",
  });

// Reject Loan
export const rejectLoan = (loanId) =>
  authFetch(`/loan_app/${loanId}/reject/`, {
    method: "POST",
  });

// Get User Loan Status
export const getUserLoanStatus = () => authFetch("/loan_app/user-loan-status/");

// Get Loan Payment History
export const getLoanPaymentHistory = (loanId) =>
  authFetch(`/loan_app/loan/${loanId}/payment-history/`);

// Get Loan Payment Schedule
export const getLoanPaymentSchedule = (loanId) =>
  authFetch(`/loan_app/loan/${loanId}/payment-schedule/`);

// Make Loan Payment
export const makeLoanPayment = (data) =>
  authFetch("/loan_app/loan/make-payment/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ============================================
// RETURNS - Admin Operations
// ============================================

// Get Returns List - from returns module
export const getReturnsList = () => authFetch("/returns/list/");

// Get Return Details
export const getReturnDetails = (returnId) =>
  authFetch(`/returns/${returnId}/`);

// Create Return
export const createReturn = (returnId, data) =>
  authFetch(`/returns/${returnId}/`, {
    method: "POST",
    body: JSON.stringify(data),
  });

// Update Return
export const updateReturn = (returnId, data) =>
  authFetch(`/returns/${returnId}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Patch Return
export const patchReturn = (returnId, data) =>
  authFetch(`/returns/${returnId}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// Delete Return
export const deleteReturn = (returnId) =>
  authFetch(`/returns/${returnId}/`, {
    method: "DELETE",
  });

// Approve Return
export const approveReturn = (returnId) =>
  authFetch(`/returns/approve/${returnId}/`, {
    method: "PATCH",
  });

// Reject Return
export const rejectReturn = (returnId) =>
  authFetch(`/returns/api/returns/${returnId}/reject/`, {
    method: "PATCH",
  });

// Get Order Item Returns
export const getOrderItemReturns = (orderItemId) =>
  authFetch(`/returns/order-items/${orderItemId}/returns/`);

// Create Order Item Return
export const createOrderItemReturn = (orderItemId, data) =>
  authFetch(`/returns/order-items/${orderItemId}/returns/`, {
    method: "POST",
    body: JSON.stringify(data),
  });

// Update Order Item Return
export const updateOrderItemReturn = (orderItemId, data) =>
  authFetch(`/returns/order-items/${orderItemId}/returns/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Delete Order Item Return
export const deleteOrderItemReturn = (orderItemId) =>
  authFetch(`/returns/order-items/${orderItemId}/returns/`, {
    method: "DELETE",
  });

// Request Return
export const requestReturn = (orderItemId, data) =>
  authFetch(`/returns/request/${orderItemId}/`, {
    method: "POST",
    body: JSON.stringify(data),
  });

// ============================================
// NOTIFICATIONS - Admin Operations
// ============================================

// Get All Notifications
export const getAllNotifications = () => authFetch("/notifications/all/");

// Get Notifications
export const getNotifications = () => authFetch("/notifications/get/");

// Get Notification Details
export const getNotificationDetails = (notificationId) =>
  authFetch(`/notifications/${notificationId}/details/`);

// Mark Notification as Read
export const markNotificationAsRead = (notificationId) =>
  authFetch(`/notifications/mark-as-read/${notificationId}/`, {
    method: "PATCH",
  });

// Mark Notification Read (PATCH)
export const patchNotificationRead = (notificationId) =>
  authFetch(`/notifications/${notificationId}/mark-read/`, {
    method: "PATCH",
  });

// Delete Notification
export const deleteNotification = (notificationId) =>
  authFetch(`/notifications/${notificationId}/delete/`, {
    method: "DELETE",
  });

// Mark All as Read
export const markAllNotificationsAsRead = () =>
  authFetch("/notifications/mark-all-read/", {
    method: "POST",
  });

// Get Unread Notifications
export const getUnreadNotifications = () => authFetch("/notifications/unread/");

// Get Notification Preferences
export const getNotificationPreferences = () =>
  authFetch("/notifications/preferences/");

// Update Notification Preferences
export const updateNotificationPreferences = (data) =>
  authFetch("/notifications/preferences/update/", {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Send Order Notification
export const sendOrderNotification = (vendorId, customerId, orderId) =>
  authFetch(
    `/notifications/send-order-notification/${vendorId}/${customerId}/${orderId}/`,
    {
      method: "POST",
    },
  );

// ============================================
// CHATS - Admin Operations
// ============================================

// Get Chat Sessions
export const getChatSessions = () => authFetch("/chats/chat_sessions/");

// Create Chat Session
export const createChatSession = (data) =>
  authFetch("/chats/chat_sessions/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Update Chat Session
export const updateChatSession = (sessionId, data) =>
  authFetch(`/chats/chat_sessions/${sessionId}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// Get Chat Messages
export const getChatMessages = (sessionId) =>
  authFetch(`/chats/chat_sessions/${sessionId}/messages/`);

// Send Chat Message
export const sendChatMessage = (sessionId, data) =>
  authFetch(`/chats/chat_sessions/${sessionId}/messages/`, {
    method: "POST",
    body: JSON.stringify(data),
  });

// Get Sessions
export const getSessions = () => authFetch("/chats/sessions/");

// Create Session
export const createSession = (data) =>
  authFetch("/chats/sessions/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Update Session
export const updateSession = (sessionId, data) =>
  authFetch(`/chats/sessions/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// Send SMS
export const sendSMS = (data) =>
  authFetch("/chats/send-sms/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Send WhatsApp
export const sendWhatsApp = (data) =>
  authFetch("/chats/send-whatsapp/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ============================================
// CHATSAPP - Admin Operations
// ============================================

// Get Chatsapp Conversations
export const getChatsappConversations = () =>
  authFetch("/chatsapp/conversations/");

// Get Chatsapp Messages
export const getChatsappMessages = (conversationId) =>
  authFetch(`/chatsapp/conversations/${conversationId}/messages/`);

// Create Chatsapp Message
export const createChatsappMessage = (conversationId, data) =>
  authFetch(`/chatsapp/conversations/${conversationId}/messages/create/`, {
    method: "POST",
    body: JSON.stringify(data),
  });

// Admin-User Conversation
export const createAdminUserConversation = (data) =>
  authFetch("/chatsapp/conversations/admin-user/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Vendor-Customer Conversation
export const createVendorCustomerConversation = (data) =>
  authFetch("/chatsapp/conversations/vendor-customer/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Create Admin Conversation
export const createAdminConversation = (data) =>
  authFetch("/chatsapp/create-admin-conversation/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Get List Responses
export const getListResponses = () => authFetch("/chatsapp/list/responses/");

// Delete Chatsapp Message
export const deleteChatsappMessage = (id) =>
  authFetch(`/chatsapp/messages/${id}/delete/`, {
    method: "DELETE",
  });

// Update Chatsapp Message
export const updateChatsappMessage = (id, data) =>
  authFetch(`/chatsapp/messages/${id}/update/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Patch Chatsapp Message
export const patchChatsappMessage = (id, data) =>
  authFetch(`/chatsapp/messages/${id}/update/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// Get Message Responses
export const getMessageResponses = (messageId) =>
  authFetch(`/chatsapp/messages/${messageId}/responses/`);

// Admin to Customer Message
export const adminToCustomerMessage = (data) =>
  authFetch("/chatsapp/messages/admin-to-customer/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Customer to Admin Message
export const customerToAdminMessage = (data) =>
  authFetch("/chatsapp/messages/customer-to-admin/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Receive and Reply
export const receiveAndReply = (data) =>
  authFetch("/chatsapp/messages/receive-and-reply/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Reply Message
export const replyMessage = (data) =>
  authFetch("/chatsapp/messages/reply/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Get Notifications
export const getChatsappNotifications = () =>
  authFetch("/chatsapp/notifications/");

// Mark Notification Read
export const markChatsappNotificationRead = (id) =>
  authFetch(`/chatsapp/notifications/${id}/read/`, {
    method: "PUT",
  });

// Patch Notification Read
export const patchChatsappNotificationRead = (id) =>
  authFetch(`/chatsapp/notifications/${id}/read/`, {
    method: "PATCH",
  });

// Create Notification
export const createChatsappNotification = (data) =>
  authFetch("/chatsapp/notifications/create/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ============================================
// USERS - Admin Operations
// ============================================

// Get Users List
export const getUsersList = () => authFetch("/users/list/");

// Get User Details
export const getUserDetails = (id) => authFetch(`/users/${id}/details/`);

// Activate User
export const activateUser = (id) =>
  authFetch(`/users/${id}/activate/`, {
    method: "POST",
  });

// Deactivate User
export const deactivateUser = (id) =>
  authFetch(`/users/${id}/deactivate/`, {
    method: "POST",
  });

// Delete User
export const deleteUser = (id) =>
  authFetch(`/users/${id}/delete/`, {
    method: "DELETE",
  });

// Get Admins
export const getUsersAdmins = () => authFetch("/users/admins/");

// Get Admin User Details
export const getUsersAdminDetails = (id) =>
  authFetch(`/users/admins/${id}/details/`);

// Update Admin User
export const updateUsersAdmin = (id, data) =>
  authFetch(`/users/admins/${id}/update/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Patch Admin User
export const patchUsersAdmin = (id, data) =>
  authFetch(`/users/admins/${id}/patch/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// Delete Admin User
export const deleteUsersAdmin = (id) =>
  authFetch(`/users/admins/${id}/delete/`, {
    method: "DELETE",
  });

// Register Admin User
export const registerUsersAdmin = (data) =>
  authFetch("/users/admins/register/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Delete Bulk Users
export const deleteBulkUsers = (data) =>
  authFetch("/users/delete-bulk/", {
    method: "DELETE",
    body: JSON.stringify(data),
  });

// Update User Profile
export const updateUserProfile = (id, data) =>
  authFetch(`/users/profile/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Patch User Profile
export const patchUserProfile = (id, data) =>
  authFetch(`/users/profile/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// ============================================
// CARTS - Admin Operations
// ============================================

// Get Cart
export const getCart = (id) => authFetch(`/carts/${id}/`);

// Add to Cart
export const addToCart = (id, data) =>
  authFetch(`/carts/${id}/add/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Patch Add to Cart
export const patchAddToCart = (id, data) =>
  authFetch(`/carts/${id}/add/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// Remove from Cart
export const removeFromCart = (id) =>
  authFetch(`/carts/${id}/remove/`, {
    method: "DELETE",
  });

// ============================================
// WISHLISTS - Admin Operations
// ============================================

// Get Wishlists
export const getWishlists = () => authFetch("/wishlists/list/");

// Get Wishlist Details
export const getWishlistDetails = (id) => authFetch(`/wishlists/${id}/details`);

// Get Wishlist Products
export const getWishlistProducts = (id) =>
  authFetch(`/wishlists/${id}/products`);

// Add to Wishlist
export const addToWishlist = (id, data) =>
  authFetch(`/wishlists/${id}/add`, {
    method: "POST",
    body: JSON.stringify(data),
  });

// Remove from Wishlist
export const removeFromWishlist = (productId) =>
  authFetch(`/wishlists/products/${productId}/remove`, {
    method: "DELETE",
  });

// ============================================
// AUTH - Admin Operations
// ============================================

// Get Token
export const getToken = (credentials) =>
  authFetch("/auth/token/", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

// Refresh Token
export const refreshToken = (data) =>
  authFetch("/auth/token/refresh/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ============================================
// API - Admin Operations
// ============================================

// Check Email Config
export const checkEmailConfig = () => authFetch("/api/check-email-config/");

// Send Test Email
export const sendTestEmail = (data) =>
  authFetch("/api/send-test-email/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Get API Schema
export const getApiSchema = () => authFetch("/api/schema/");

// ============================================
// HEALTH - Admin Operations
// ============================================

// Health Check
export const healthCheck = () => authFetch("/health/");
