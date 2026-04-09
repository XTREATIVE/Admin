import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import OrderTimeline from "./order_details_timeline";
import CustomerDetailsCard from "./order_customer_details";
import { OrdersContext } from "../context/orderscontext";
import { ProductsContext } from "../context/allproductscontext";

const OFFSET = 1000;
const BASE_URL = "https://xtreativeapi.onrender.com"; // Change to http://127.0.0.1:8000 for local dev

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
});

const apiMarkSent         = (id) => fetch(`${BASE_URL}/orders/${id}/mark-sent/`,         { method: "POST",  headers: authHeaders() });
const apiConfirmWarehouse = (id) => fetch(`${BASE_URL}/orders/${id}/confirm-warehouse/`,  { method: "POST",  headers: authHeaders() });
const apiPatchStatus      = (id, status) => fetch(`${BASE_URL}/orders/${id}/status/`, {
  method: "PATCH",
  headers: authHeaders(),
  body: JSON.stringify({ status }),
});

function formatDate(dateObj) {
  const day = dateObj.getDate();
  const ordinal = (day > 3 && day < 21) ? "th" : ["st", "nd", "rd"][(day % 10) - 1] || "th";
  const month = dateObj.toLocaleString("en-GB", { month: "long" });
  return `${day}${ordinal} ${month} ${dateObj.getFullYear()}`;
}

const getStatusBadgeClasses = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "pending")                                                              return "bg-yellow-100 text-yellow-800";
  if (s === "sent to warehouse")                                                    return "bg-gray-100 text-gray-700";
  if (["confirmed warehouse", "warehouse confirmed", "processing"].includes(s))    return "bg-green-100 text-green-800";
  if (["delivered", "completed"].includes(s))                                       return "bg-teal-100 text-teal-800";
  if (["canceled", "cancelled"].includes(s))                                        return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
};

const capitalize = (str) =>
  String(str).split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

// ─── Status → step index (read-only mapping from backend state) ──────────────
const STATUS_TO_STEP = {
  "pending":             0,
  "sent to warehouse":   1,
  "warehouse confirmed": 2,
  "confirmed warehouse": 2,
  "processing":          2, // backend's label after confirm-warehouse
  "delivered":           3,
  "completed":           3,
};

// Maps each step index → what API to call to advance FROM that step.
// IMPORTANT: action selection always uses backendStep (ground truth),
// never the optimistic displayStep.
const STEP_ACTIONS = {
  0: { nextLabel: "Send to Warehouse", call: (id) => apiMarkSent(id) },
  1: { nextLabel: "Confirm Warehouse", call: (id) => apiConfirmWarehouse(id) },
  2: { nextLabel: "Mark as Delivered", call: (id) => apiPatchStatus(id, "Delivered") },
};

const STEPS = [
  { label: "Pending",             color: "bg-yellow-500" },
  { label: "Sent to Warehouse",   color: "bg-gray-500"   },
  { label: "Confirmed Warehouse", color: "bg-green-500"  },
  { label: "Delivered",           color: "bg-teal-500"   },
];

export default function OrderLeftSection() {
  const { orderId } = useParams();
  const { orders, loading, error, refreshOrders } = useContext(OrdersContext);
  const { loadingProducts, errorProducts }         = useContext(ProductsContext);

  // pendingStep: set optimistically while a request is in-flight, null otherwise.
  // Used ONLY for rendering the progress bars — never for deciding which API to call.
  const [pendingStep, setPendingStep] = useState(null);
  const [isUpdating,  setIsUpdating]  = useState(false);
  const refreshTimer = useRef(null);

  const origId = parseInt(orderId, 10) - OFFSET;
  const order  = orders.find(o => o.id === origId);

  // ── Ground truth: what the backend actually says ─────────────────────────
  const backendStep = order
    ? (STATUS_TO_STEP[(order.status || "").toLowerCase()] ?? 0)
    : 0;

  // ── Display step: only used for rendering progress bars ──────────────────
  // Show the optimistic value only while it is strictly ahead of the backend.
  // The moment the backend catches up (or surpasses), drop the optimistic value.
  const displayStep = (pendingStep !== null && pendingStep > backendStep)
    ? pendingStep
    : backendStep;

  // Clear optimistic override once backend has caught up
  useEffect(() => {
    if (pendingStep !== null && backendStep >= pendingStep) {
      setPendingStep(null);
    }
  }, [backendStep, pendingStep]);

  // ── Polling ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${BASE_URL}/orders/${origId}/status/`, { headers: authHeaders() });
        if (res.ok) refreshOrders?.();
      } catch (e) {
        console.error("Polling failed:", e);
      }
    };
    poll();
    const id = setInterval(poll, 7000);
    return () => clearInterval(id);
  }, [origId]);

  // ── Advance order to the next step ───────────────────────────────────────
  const handleNextStep = async () => {
    if (isUpdating || !order) return;

    // FIX 1: Always derive the action from backendStep (server ground truth),
    //         never from the optimistic displayStep. This prevents calling
    //         the wrong endpoint (e.g. confirm-warehouse when already Processing,
    //         or mark-delivered when already Delivered).
    const action = STEP_ACTIONS[backendStep];
    if (!action) return; // already at final step

    // FIX 2: Block re-entry while an optimistic update is in flight.
    //         Without this, a second click before the backend responds would
    //         fire the same API call again, producing the double-transition error.
    if (pendingStep !== null) return;

    console.log(`[DEBUG] Advancing order ${origId} from backendStep ${backendStep}`);
    setIsUpdating(true);

    try {
      const res = await action.call(origId);
      console.log(`[DEBUG] HTTP ${res.status} ${res.statusText}`);

      if (res.ok) {
        // FIX 3: Optimistic step is always backendStep + 1 (not displayStep + 1).
        //         This avoids drift when displayStep temporarily differs from backendStep.
        const nextStep = backendStep + 1;
        console.log(`[SUCCESS] Optimistically advancing to step ${nextStep}`);
        setPendingStep(nextStep);

        if (refreshTimer.current) clearTimeout(refreshTimer.current);
        refreshTimer.current = setTimeout(() => refreshOrders?.(), 500);
      } else {
        let errorMsg = `HTTP ${res.status}`;
        try {
          const data = await res.json();
          console.error("[ERROR RESPONSE]:", data);
          errorMsg = data.detail
            || data.non_field_errors?.[0]
            || data.message
            || data.error
            || JSON.stringify(data).slice(0, 300);
        } catch {
          errorMsg = (await res.text().catch(() => "")) || errorMsg;
        }
        alert(`Update failed:\n${errorMsg}`);
      }
    } catch (e) {
      console.error("[NETWORK ERROR]", e);
      alert("Network error. Check your connection.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || loadingProducts)
    return <div className="text-center text-[11px] p-8">Loading order details…</div>;
  if (error || errorProducts || !order)
    return <div className="text-center text-[11px] p-8 text-red-600">Order not found.</div>;

  const orderNumber = `#${order.id + OFFSET}`;
  const createdDate = formatDate(new Date(order.created_at));
  const shipDate    = order.estimated_shipping_date
    ? formatDate(new Date(order.estimated_shipping_date))
    : "N/A";

  // FIX 4: isFinalStep is derived from backendStep only — never the optimistic value.
  //         This ensures the button is truly hidden only after the server confirms
  //         the final state, preventing a race where the button briefly reappears.
  const isFinalStep   = backendStep >= STEPS.length - 1;

  // FIX 5: currentAction is derived from backendStep so the button label always
  //         reflects the actual next server-side transition, not an optimistic one.
  const currentAction = STEP_ACTIONS[backendStep];

  // FIX 6: Also disable the button while any optimistic update is in flight,
  //         regardless of isUpdating (covers the gap between setIsUpdating(false)
  //         and the backend refresh landing).
  const buttonDisabled = isUpdating || pendingStep !== null;

  return (
    <div className="flex flex-col md:flex-row font-poppins text-[11px] gap-6">
      <div className="w-full md:w-2/3 space-y-6">

        {/* Progress Card */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="flex items-center gap-3 text-[13px] text-[#280300] font-semibold">
                  <span>{orderNumber}</span>
                  <span className="px-3 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full">
                    {order.payment_status || "Paid"}
                  </span>
                  <span className={`px-3 py-0.5 text-[10px] rounded-full border ${getStatusBadgeClasses(order.status)}`}>
                    {capitalize(order.status || "Unknown")}
                  </span>
                </h4>
                <p className="text-gray-500 mt-1 text-[10.5px]">{createdDate}</p>
              </div>
            </div>

            <h5 className="text-[#f9622c] text-[11px] font-medium mb-4">ORDER PROGRESS</h5>

            {/* Progress bars — use displayStep so the optimistic advance is visible */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STEPS.map((step, i) => (
                <div key={i} className="text-center">
                  <div className="bg-gray-100 h-2 rounded-full overflow-hidden mb-3">
                    <div
                      className={`${step.color} h-full transition-all duration-700 ${
                        i <= displayStep ? "w-full" : "w-0"
                      }`}
                    />
                  </div>
                  <p className={`text-[10px] font-medium ${i <= displayStep ? "text-gray-800" : "text-gray-400"}`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 flex flex-wrap gap-4 justify-between items-center border-t">
            <p className="text-[10px] flex items-center">
              Estimated Delivery:
              <span className="ml-2 font-medium text-[#280300]">{shipDate}</span>
            </p>

            {isFinalStep ? (
              <div className="flex items-center gap-2 px-5 py-2 bg-teal-100 text-teal-700 rounded-lg text-[11px] font-medium">
                <CheckCircle size={16} />
                Order Completed
              </div>
            ) : (
              <button
                onClick={handleNextStep}
                disabled={buttonDisabled}
                className="px-6 py-2 bg-[#f9622c] hover:bg-[#e55a1f] text-white text-[11px] font-medium rounded-lg disabled:opacity-60 transition-colors"
              >
                {isUpdating ? "Updating..." : currentAction?.nextLabel ?? "Move to Next Step"}
              </button>
            )}
          </div>
        </div>

        {/* Timeline also uses displayStep for visual continuity */}
        <OrderTimeline steps={STEPS} currentStep={displayStep} />
      </div>

      <div className="w-full md:w-1/3">
        <CustomerDetailsCard order={order} />
      </div>
    </div>
  );
}