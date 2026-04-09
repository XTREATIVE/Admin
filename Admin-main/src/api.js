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

// ============================================
// ACCOUNTS - Admin Operations
// ============================================

export const adminLogin = (credentials) =>
  authFetch("/accounts/admin/login/", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

export const adminVerifyOTP = (data) =>
  authFetch("/accounts/admin/verify-otp/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const adminResendOTP = (data) =>
  authFetch("/accounts/admin/resend-otp/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const adminPasswordReset = (data) =>
  authFetch("/accounts/auth/admin-password-reset/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const adminPasswordResetVerifyOTP = (data) =>
  authFetch("/accounts/auth/password-reset/admin-reset-verify-otp/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const changePassword = (data) =>
  authFetch("/accounts/change-password/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ============================================
// ADMINS - Admin Operations
// ============================================

export const getAdminsList = () => authFetch("/admins/list/");

export const getAdminDetails = (id) => authFetch(`/admins/${id}/details/`);

export const updateAdmin = (id, data) =>
  authFetch(`/admins/${id}/update/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const patchAdmin = (id, data) =>
  authFetch(`/admins/${id}/update/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteAdmin = (id) =>
  authFetch(`/admins/${id}/delete/`, {
    method: "DELETE",
  });

export const registerAdmin = (data) =>
  authFetch("/admins/register/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const adminsLogin = (credentials) =>
  authFetch("/admins/login/", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

export const adminsResendOTP = (data) =>
  authFetch("/admins/resend-otp/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const adminsVerifyOTP = (data) =>
  authFetch("/admins/verify-otp/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getAdminPayouts = () => authFetch("/admins/payouts/");

// ============================================
// CUSTOMERS - Admin Operations
// ============================================

export const getCustomersList = () => authFetch("/customers/list/");

export const getCustomerDetails = (id) =>
  authFetch(`/customers/${id}/details/`);

export const updateCustomer = (id, data) =>
  authFetch(`/customers/${id}/update/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const patchCustomer = (id, data) =>
  authFetch(`/customers/${id}/patch/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteCustomer = (id) =>
  authFetch(`/customers/${id}/delete/`, {
    method: "DELETE",
  });

export const activateCustomer = (id) =>
  authFetch(`/customers/${id}/activate/`, {
    method: "POST",
  });

export const deactivateCustomer = (id) =>
  authFetch(`/customers/${id}/deactivate/`, {
    method: "POST",
  });

export const disconnectCustomer = (id) =>
  authFetch(`/customers/${id}/disconnect/`, {
    method: "POST",
  });

export const registerCustomer = (data) =>
  authFetch("/customers/register/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getCustomerShippingAddress = () =>
  authFetch("/customers/shipping-address/");

export const createCustomerShippingAddress = (data) =>
  authFetch("/customers/shipping-address/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getShippingMethods = () =>
  authFetch("/customers/shipping-methods/");

export const createShippingMethod = (data) =>
  authFetch("/customers/shipping-methods/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const createCurrency = (data) =>
  authFetch("/customers/currencies/create/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const setCurrency = (data) =>
  authFetch("/customers/currency/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ============================================
// VENDORS - Admin Operations
// ============================================

export const getVendorsList = () => authFetch("/vendors/list/");

export const getVendorDetails = (id) => authFetch(`/vendors/${id}/details/`);

export const updateVendor = (id, data) =>
  authFetch(`/vendors/${id}/update/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const patchVendor = (id, data) =>
  authFetch(`/vendors/${id}/patch/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteVendor = (id) =>
  authFetch(`/vendors/${id}/delete/`, {
    method: "DELETE",
  });

export const approveVendor = (vendorId) =>
  authFetch(`/vendors/${vendorId}/approve/`, {
    method: "POST",
  });

export const rejectVendor = (vendorId) =>
  authFetch(`/vendors/${vendorId}/reject/`, {
    method: "POST",
  });

export const vendorLogin = (credentials) =>
  authFetch("/vendors/login/", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

export const vendorVerifyOTP = (data) =>
  authFetch("/vendors/verify-otp/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const vendorResendOTP = (data) =>
  authFetch("/vendors/resend-otp/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getVendorRegister = () => authFetch("/vendors/register/");

export const vendorRegister = (data) =>
  authFetch("/vendors/register/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const vendorOTPLogin = (data) =>
  authFetch("/vendors/otp/login/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const vendorOTPResend = (data) =>
  authFetch("/vendors/otp/resend/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const vendorOTPVerify = (data) =>
  authFetch("/vendors/otp/verify/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getVendorNotifications = () =>
  authFetch("/vendors/notifications/");

export const getVendorPayouts = () => authFetch("/vendors/payouts/");

export const getVendorStock = () => authFetch("/vendors/stock/");

export const vendorRestock = (data) =>
  authFetch("/vendors/restock/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const vendorSalesSettle = (orderItemId) =>
  authFetch(`/vendors/sales/${orderItemId}/settle/`, {
    method: "POST",
  });

export const getVendorReceipt = (orderId) =>
  authFetch(`/vendors/${orderId}/receipt/`);

// ============================================
// PRODUCTS - Admin Operations
// ============================================

export const getProductsList = () => authFetch("/products/list/");

export const getProductListing = () => authFetch("/products/listing/");

export const getProductDetails = (id) => authFetch(`/products/${id}/details/`);

export const getProductEdit = (id) => authFetch(`/products/${id}/edit/`);

export const updateProduct = (id, data) =>
  authFetch(`/products/${id}/edit/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const patchProduct = (id, data) =>
  authFetch(`/products/${id}/edit/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteProduct = (id) =>
  authFetch(`/products/${id}/delete/`, {
    method: "DELETE",
  });

export const adminDeleteProduct = (id) =>
  authFetch(`/products/admin/products/${id}/delete/`, {
    method: "DELETE",
  });

export const addProduct = (data) =>
  authFetch("/products/add/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getProductPresignedUrl = (productId) =>
  authFetch(`/products/${productId}/presigned-url/`);

export const getProductStock = () => authFetch("/products/stock/");

export const getReviews = () => authFetch("/products/reviews/");

export const getReviewDetails = (id) => authFetch(`/products/reviews/${id}/`);

export const updateReview = (id, data) =>
  authFetch(`/products/reviews/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const patchReview = (id, data) =>
  authFetch(`/products/reviews/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteReview = (id) =>
  authFetch(`/products/reviews/${id}/`, {
    method: "DELETE",
  });

export const getProductReviews = () =>
  authFetch("/products/reviews/product_reviews/");

export const getVendorReviews = () =>
  authFetch("/products/reviews/vendor_reviews/");

export const getMyReviews = () => authFetch("/products/reviews/my_reviews/");

export const getProductRatings = (productId) =>
  authFetch(`/products/products/${productId}/ratings/`);

export const getReviewStats = () =>
  authFetch("/products/reviews/review_stats/");

export const getReviewRatings = (id) =>
  authFetch(`/products/reviews/${id}/ratings/`);

export const replyToReview = (reviewId, data) =>
  authFetch(`/products/reviews/${reviewId}/reply/`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const createReview = (data) =>
  authFetch("/products/reviews/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ============================================
// ORDERS - Admin Operations
// ============================================

export const getOrdersList = () => authFetch("/orders/list/");

export const getOrderDetails = (orderId) => authFetch(`/orders/${orderId}/`);

export const updateOrderStatus = (orderId, data) =>
  authFetch(`/orders/${orderId}/update-status/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const patchOrderStatus = (orderId, data) =>
  authFetch(`/orders/${orderId}/status/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const markOrderSent = (orderId) =>
  authFetch(`/orders/${orderId}/mark-sent/`, {
    method: "POST",
  });

export const createDraftOrder = (data) =>
  authFetch("/orders/create-draft-order/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const placeOrder = (data) =>
  authFetch("/orders/place-order/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const payOrder = (data) =>
  authFetch("/orders/pay_order/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const confirmWarehouse = (orderId) =>
  authFetch(`/orders/orders/${orderId}/confirm-warehouse/`, {
    method: "POST",
  });

export const ordersMarkSent = (orderId) =>
  authFetch(`/orders/orders/${orderId}/mark-sent/`, {
    method: "POST",
  });

export const getAdminPayments = () => authFetch("/orders/admin/payments/");

// ============================================
// SALES - Admin Operations
// ============================================

export const getSalesList = () => authFetch("/sales/list/");

export const getSalesDetails = (id) => authFetch(`/sales/${id}/details`);

export const updateSale = (id, data) =>
  authFetch(`/sales/${id}/update`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const patchSale = (id, data) =>
  authFetch(`/sales/${id}/update`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteSale = (id) =>
  authFetch(`/sales/${id}/delete`, {
    method: "DELETE",
  });

export const getSalesInvoice = (id) => authFetch(`/sales/${id}/invoice`);

export const getSalesPDF = (id) => authFetch(`/sales/${id}/pdf/`);

export const getSalesAnalytics = () => authFetch("/sales/analytics");

export const getSalesGraph = () => authFetch("/sales/graph");

// ============================================
// PAYMENTS - Admin Operations
// ============================================

export const getTransactions = () => authFetch("/payments/transactions/");

export const getTransactionStatus = (data) =>
  authFetch("/payments/transaction-status/", {
    method: "GET",
    ...(data && { params: data }),
  });

export const adminReleasePayout = (transactionId) =>
  authFetch(`/payments/admin/payouts/${transactionId}/release/`, {
    method: "POST",
  });

export const adminGenerateReport = () =>
  authFetch("/payments/admin/reports/generate/");

export const pesapalCallback = (data) =>
  authFetch("/payments/pesapal-callback/", { params: data });

export const pesapalRedirect = (data) =>
  authFetch("/payments/pesapal-redirect/", { params: data });

export const pesapalIPN = (data) =>
  authFetch("/payments/pesapal/ipn/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const pesapalTopup = (data) =>
  authFetch("/payments/pesapal/topup/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const vendorPayout = (vendorId, orderItemId) =>
  authFetch(
    `/payments/vendors/${vendorId}/order-items/${orderItemId}/payout/`,
    { method: "POST" }
  );

// ============================================
// WALLETS - Admin Operations
// ============================================

export const getCustomerWalletBalance = () =>
  authFetch("/wallets/balance/customer/");

export const getVendorWalletBalance = () =>
  authFetch("/wallets/balance/vendor/");

export const createWallet = (data) =>
  authFetch("/wallets/create/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deposit = (data) =>
  authFetch("/wallets/deposit/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const withdraw = (data) =>
  authFetch("/wallets/withdraw/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const transfer = (data) =>
  authFetch("/wallets/transfer/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const setPin = (data) =>
  authFetch("/wallets/set-pin/", {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const patchSetPin = (data) =>
  authFetch("/wallets/set-pin/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const resetPin = (data) =>
  authFetch("/wallets/reset-pin/", {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const patchResetPin = (data) =>
  authFetch("/wallets/reset-pin/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const requestWalletOTP = (data) =>
  authFetch("/wallets/request-otp/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const businessWalletBalance = (data) =>
  authFetch("/wallets/business-wallet/balance/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getCustomerTransactions = () =>
  authFetch("/wallets/transactions/customer/");

export const getVendorTransactions = () =>
  authFetch("/wallets/transactions/vendor/");

// ============================================
// LOANS - Admin Operations
// ============================================

export const getLoansList = () => authFetch("/loan_app/loans/list/");

export const applyLoan = (data) =>
  authFetch("/loan_app/apply/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getLoanDetails = (id) => authFetch(`/loan_app/loan/${id}/`);

export const approveLoan = (loanId) =>
  authFetch(`/loan_app/${loanId}/approve/`, {
    method: "POST",
  });

export const rejectLoan = (loanId) =>
  authFetch(`/loan_app/${loanId}/reject/`, {
    method: "POST",
  });

export const getUserLoanStatus = () => authFetch("/loan_app/user-loan-status/");

export const getLoanPaymentHistory = (loanId) =>
  authFetch(`/loan_app/loan/${loanId}/payment-history/`);

export const getLoanPaymentSchedule = (loanId) =>
  authFetch(`/loan_app/loan/${loanId}/payment-schedule/`);

export const makeLoanPayment = (data) =>
  authFetch("/loan_app/loan/make-payment/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ============================================
// RETURNS - Admin Operations
// ============================================

export const getReturnsList = () => authFetch("/returns/list/");

export const getReturnDetails = (returnId) =>
  authFetch(`/returns/${returnId}/`);

export const createReturn = (returnId, data) =>
  authFetch(`/returns/${returnId}/`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateReturn = (returnId, data) =>
  authFetch(`/returns/${returnId}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const patchReturn = (returnId, data) =>
  authFetch(`/returns/${returnId}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteReturn = (returnId) =>
  authFetch(`/returns/${returnId}/`, {
    method: "DELETE",
  });

// ✅ FIXED: {return_id} replaced with correct JS template literal ${returnId}
export const approveReturn = (returnId) =>
  authFetch(`/returns/approve/${returnId}/`, {
    method: "PATCH",
  });

// ✅ FIXED: {return_id} replaced with correct JS template literal ${returnId}
export const rejectReturn = (returnId) =>
  authFetch(`/returns/api/returns/${returnId}/reject/`, {
    method: "PATCH",
  });

export const getOrderItemReturns = (orderItemId) =>
  authFetch(`/returns/order-items/${orderItemId}/returns/`);

export const createOrderItemReturn = (orderItemId, data) =>
  authFetch(`/returns/order-items/${orderItemId}/returns/`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateOrderItemReturn = (orderItemId, data) =>
  authFetch(`/returns/order-items/${orderItemId}/returns/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteOrderItemReturn = (orderItemId) =>
  authFetch(`/returns/order-items/${orderItemId}/returns/`, {
    method: "DELETE",
  });

export const requestReturn = (orderItemId, data) =>
  authFetch(`/returns/request/${orderItemId}/`, {
    method: "POST",
    body: JSON.stringify(data),
  });

// ============================================
// NOTIFICATIONS - Admin Operations
// ============================================

export const getAllNotifications = () => authFetch("/notifications/all/");

export const getNotifications = () => authFetch("/notifications/get/");

export const getNotificationDetails = (notificationId) =>
  authFetch(`/notifications/${notificationId}/details/`);

export const markNotificationAsRead = (notificationId) =>
  authFetch(`/notifications/mark-as-read/${notificationId}/`, {
    method: "PATCH",
  });

export const patchNotificationRead = (notificationId) =>
  authFetch(`/notifications/${notificationId}/mark-read/`, {
    method: "PATCH",
  });

export const deleteNotification = (notificationId) =>
  authFetch(`/notifications/${notificationId}/delete/`, {
    method: "DELETE",
  });

export const markAllNotificationsAsRead = () =>
  authFetch("/notifications/mark-all-read/", {
    method: "POST",
  });

export const getUnreadNotifications = () => authFetch("/notifications/unread/");

export const getNotificationPreferences = () =>
  authFetch("/notifications/preferences/");

export const updateNotificationPreferences = (data) =>
  authFetch("/notifications/preferences/update/", {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const sendOrderNotification = (vendorId, customerId, orderId) =>
  authFetch(
    `/notifications/send-order-notification/${vendorId}/${customerId}/${orderId}/`,
    { method: "POST" }
  );

// ============================================
// CHATS - Admin Operations
// ============================================

export const getChatSessions = () => authFetch("/chats/chat_sessions/");

export const createChatSession = (data) =>
  authFetch("/chats/chat_sessions/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateChatSession = (sessionId, data) =>
  authFetch(`/chats/chat_sessions/${sessionId}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const getChatMessages = (sessionId) =>
  authFetch(`/chats/chat_sessions/${sessionId}/messages/`);

export const sendChatMessage = (sessionId, data) =>
  authFetch(`/chats/chat_sessions/${sessionId}/messages/`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getSessions = () => authFetch("/chats/sessions/");

export const createSession = (data) =>
  authFetch("/chats/sessions/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateSession = (sessionId, data) =>
  authFetch(`/chats/sessions/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const sendSMS = (data) =>
  authFetch("/chats/send-sms/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const sendWhatsApp = (data) =>
  authFetch("/chats/send-whatsapp/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ============================================
// CHATSAPP - Admin Operations
// ============================================

export const getChatsappConversations = () =>
  authFetch("/chatsapp/conversations/");

export const getChatsappMessages = (conversationId) =>
  authFetch(`/chatsapp/conversations/${conversationId}/messages/`);

export const createChatsappMessage = (conversationId, data) =>
  authFetch(`/chatsapp/conversations/${conversationId}/messages/create/`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const createAdminUserConversation = (data) =>
  authFetch("/chatsapp/conversations/admin-user/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const createVendorCustomerConversation = (data) =>
  authFetch("/chatsapp/conversations/vendor-customer/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const createAdminConversation = (data) =>
  authFetch("/chatsapp/create-admin-conversation/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getListResponses = () => authFetch("/chatsapp/list/responses/");

export const deleteChatsappMessage = (id) =>
  authFetch(`/chatsapp/messages/${id}/delete/`, {
    method: "DELETE",
  });

export const updateChatsappMessage = (id, data) =>
  authFetch(`/chatsapp/messages/${id}/update/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const patchChatsappMessage = (id, data) =>
  authFetch(`/chatsapp/messages/${id}/update/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const getMessageResponses = (messageId) =>
  authFetch(`/chatsapp/messages/${messageId}/responses/`);

export const adminToCustomerMessage = (data) =>
  authFetch("/chatsapp/messages/admin-to-customer/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const customerToAdminMessage = (data) =>
  authFetch("/chatsapp/messages/customer-to-admin/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const receiveAndReply = (data) =>
  authFetch("/chatsapp/messages/receive-and-reply/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const replyMessage = (data) =>
  authFetch("/chatsapp/messages/reply/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getChatsappNotifications = () =>
  authFetch("/chatsapp/notifications/");

export const markChatsappNotificationRead = (id) =>
  authFetch(`/chatsapp/notifications/${id}/read/`, {
    method: "PUT",
  });

export const patchChatsappNotificationRead = (id) =>
  authFetch(`/chatsapp/notifications/${id}/read/`, {
    method: "PATCH",
  });

export const createChatsappNotification = (data) =>
  authFetch("/chatsapp/notifications/create/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ============================================
// USERS - Admin Operations
// ============================================

export const getUsersList = () => authFetch("/users/list/");

export const getUserDetails = (id) => authFetch(`/users/${id}/details/`);

export const activateUser = (id) =>
  authFetch(`/users/${id}/activate/`, {
    method: "POST",
  });

export const deactivateUser = (id) =>
  authFetch(`/users/${id}/deactivate/`, {
    method: "POST",
  });

export const deleteUser = (id) =>
  authFetch(`/users/${id}/delete/`, {
    method: "DELETE",
  });

export const getUsersAdmins = () => authFetch("/users/admins/");

export const getUsersAdminDetails = (id) =>
  authFetch(`/users/admins/${id}/details/`);

export const updateUsersAdmin = (id, data) =>
  authFetch(`/users/admins/${id}/update/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const patchUsersAdmin = (id, data) =>
  authFetch(`/users/admins/${id}/patch/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteUsersAdmin = (id) =>
  authFetch(`/users/admins/${id}/delete/`, {
    method: "DELETE",
  });

export const registerUsersAdmin = (data) =>
  authFetch("/users/admins/register/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deleteBulkUsers = (data) =>
  authFetch("/users/delete-bulk/", {
    method: "DELETE",
    body: JSON.stringify(data),
  });

export const updateUserProfile = (id, data) =>
  authFetch(`/users/profile/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const patchUserProfile = (id, data) =>
  authFetch(`/users/profile/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// ============================================
// CARTS - Admin Operations
// ============================================

export const getCart = (id) => authFetch(`/carts/${id}/`);

export const addToCart = (id, data) =>
  authFetch(`/carts/${id}/add/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const patchAddToCart = (id, data) =>
  authFetch(`/carts/${id}/add/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const removeFromCart = (id) =>
  authFetch(`/carts/${id}/remove/`, {
    method: "DELETE",
  });

// ============================================
// WISHLISTS - Admin Operations
// ============================================

export const getWishlists = () => authFetch("/wishlists/list/");

export const getWishlistDetails = (id) => authFetch(`/wishlists/${id}/details`);

export const getWishlistProducts = (id) =>
  authFetch(`/wishlists/${id}/products`);

export const addToWishlist = (id, data) =>
  authFetch(`/wishlists/${id}/add`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const removeFromWishlist = (productId) =>
  authFetch(`/wishlists/products/${productId}/remove`, {
    method: "DELETE",
  });

// ============================================
// AUTH - Admin Operations
// ============================================

export const getToken = (credentials) =>
  authFetch("/auth/token/", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

export const refreshToken = (data) =>
  authFetch("/auth/token/refresh/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ============================================
// API - Admin Operations
// ============================================

export const checkEmailConfig = () => authFetch("/api/check-email-config/");

export const sendTestEmail = (data) =>
  authFetch("/api/send-test-email/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getApiSchema = () => authFetch("/api/schema/");

// ============================================
// HEALTH - Admin Operations
// ============================================

export const healthCheck = () => authFetch("/health/");