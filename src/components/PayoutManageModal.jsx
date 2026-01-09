// src/components/PayoutManageModal.js
import React, { useState } from 'react';
import { 
  X, 
  User, 
  Package, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Clock
} from 'lucide-react';

const PayoutManageModal = ({ payout, isOpen, onClose, onAction }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !payout) return null;

  const handleProcessPayout = async () => {
    setIsProcessing(true);
    try {
      console.log('Processing payout for:', {
        vendor_id: payout.vendor_id,
        order_item_id: payout.order_item_id,
        payout_id: payout.id
      });

      // Call the API endpoint for processing payout
      const response = await fetch(`https://api-xtreative.onrender.com/payments/vendors/${payout.vendor_id}/order-items/${payout.order_item_id}/payout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any authentication headers if needed
          // 'Authorization': `Bearer ${token}`,
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Try to get response text first to see what we're getting
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          body: responseText
        });
        throw new Error(`HTTP error! status: ${response.status} - ${responseText}`);
      }

      // Try to parse as JSON
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('Parsed result:', result);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        // If it's not JSON, maybe it's a redirect HTML page
        if (responseText.includes('pesapal') || responseText.includes('redirect')) {
          console.log('Appears to be a redirect response');
          // Handle as redirect
          window.location.href = `https://api-xtreative.onrender.com/payments/vendors/${payout.vendor_id}/order-items/${payout.order_item_id}/payout/`;
          return;
        }
        throw new Error('Invalid response format');
      }
      
      // Check if the response contains a redirect URL for Pesapal
      if (result.redirect_url || result.payment_url || result.checkout_url) {
        console.log('Redirecting to:', result.redirect_url || result.payment_url || result.checkout_url);
        // Redirect to Pesapal UI
        window.location.href = result.redirect_url || result.payment_url || result.checkout_url;
        return;
      }

      // If there's a checkout_request_id, it might be in the response
      if (result.checkout_request_id) {
        console.log('Checkout request created:', result.checkout_request_id);
      }

      // Check if the API indicates success but no redirect
      if (result.success || result.status === 'success') {
        console.log('Payout processed successfully');
        alert('Payout processed successfully!');
      }
      
      // Call the parent component's onAction callback if provided
      if (onAction) {
        await onAction(payout.id, 'approve');
      }
      
      // Close modal after successful processing
      onClose();
      
    } catch (error) {
      console.error('Payout processing failed:', error);
      
      // More detailed error message
      let errorMessage = 'Failed to process payout. ';
      if (error.message.includes('404')) {
        errorMessage += 'API endpoint not found. Please check the vendor_id and order_item_id.';
      } else if (error.message.includes('500')) {
        errorMessage += 'Server error. Please try again later.';
      } else if (error.message.includes('403')) {
        errorMessage += 'Access denied. Please check your authentication.';
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex-1"></div>
          <h2 className="text-xl font-bold text-gray-900 text-center">MANAGE PAYOUT</h2>
          <div className="flex-1 flex justify-end">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isProcessing}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Payout Overview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Payout Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <FileText size={16} className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-600">Payout ID</p>
                  <p className="font-semibold">#{payout.id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock size={16} className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-600">Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    payout.status === 'Paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payout.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar size={16} className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-600">Date Created</p>
                  <p className="font-semibold">{payout.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User size={16} className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-600">Vendor</p>
                  <p className="font-semibold">{payout.vendor}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div>
                  <p className="text-xs text-gray-600">Gross Sales</p>
                  <p className="font-bold text-blue-600">{payout.sales}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div>
                  <p className="text-xs text-gray-600">Commission (18%)</p>
                  <p className="font-bold text-orange-600">{payout.commissionAmount}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div>
                  <p className="text-xs text-gray-600">Net Payout</p>
                  <p className="font-bold text-green-600">{payout.netPayout}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Information</h3>
            <div className="flex items-center space-x-3 mb-3">
              <Package size={16} className="text-gray-500" />
              <div>
                <p className="text-xs text-gray-600">Product/Order</p>
                <p className="font-semibold">{payout.orderid}</p>
              </div>
            </div>
          </div>

          {/* Process Payout Button - Now inside content area */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            {payout.status === 'Pending' ? (
              <button
                onClick={handleProcessPayout}
                disabled={isProcessing}
                className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg text-base font-semibold"
              >
                <CheckCircle size={18} className="mr-2" />
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Processing Payout...
                  </>
                ) : (
                  'Process Payout via Pesapal'
                )}
              </button>
            ) : (
              <div className="flex items-center justify-center py-4 text-base text-gray-500 bg-white rounded-lg border border-gray-200">
                <CheckCircle size={18} className="mr-2 text-green-500" />
                This payout has already been processed
              </div>
            )}
          </div>
        </div>

        {/* Footer with Close Button */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
              disabled={isProcessing}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayoutManageModal;