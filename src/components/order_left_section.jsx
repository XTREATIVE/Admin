/**
 * OrderLeftSection.jsx — Admin order detail page (left column)
 *
 * ─── WHAT CHANGED & WHY ─────────────────────────────────────────────────────
 *
 * FIX 1 — Hardcoded confirm-warehouse URL (THE CORE FIX)
 *   BEFORE: tried two URLs in a loop using ${API_BASE} variable
 *   AFTER:  single hardcoded URL:
 *           https://api-xtreative.onrender.com/orders/orders/{id}/confirm-warehouse/
 *   WHY:    The API schema explicitly defines POST /orders/orders/{id}/confirm-warehouse/
 *           The fallback /orders/{id}/confirm-warehouse/ does not exist and caused silent 404s.
 *
 * FIX 2 — Removed || currentStep === 0 guard from handleNextStep
 *   BEFORE: if (... || currentStep === 0) return;   ← silently blocked button
 *   AFTER:  if (currentStep >= STEPS.length - 1 || isUpdatingRef.current) return;
 *   WHY:    StepActionButton already renders a disabled state at step 0 via isVendorStep.
 *           Having the guard in handleNextStep too meant any timing race where the UI
 *           briefly showed step 0 would silently no-op even when the vendor had dispatched.
 *
 * FIX 3 — fetchStatus() called whenever order.status changes
 *   BEFORE: useEffect only seeded progress bar from context, never force-polled
 *   AFTER:  fetchStatus() fires on every order.status change in context
 *   WHY:    When vendor taps 🚚, context updates — this immediately hits the API
 *           to confirm the fresh status, so "Confirm Warehouse" button appears without
 *           waiting for the next 5-second auto-poll cycle.
 *
 * FIX 4 — stepError shows full URL + HTTP status + response body
 *   BEFORE: error message was sometimes empty or missing the endpoint
 *   AFTER:  "POST https://...confirm-warehouse/ → HTTP 403: {...}"
 *   WHY:    Makes debugging instant — admin can copy and send to developer.
 *
 * FIX 5 — update-status URLs (step 2→3) also hardcoded
 *   BEFORE: used ${API_BASE} variable in both fallback URLs
 *   AFTER:  both URLs use the full hardcoded https://api-xtreative.onrender.com base
 * ────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  CheckCircle, Clock, Truck, Warehouse, PackageCheck,
  AlertCircle, RefreshCw, ChevronRight, Zap,
} from "lucide-react";
import OrderTimeline from "./order_details_timeline";
import CustomerDetailsCard from "./order_customer_details";
import { OrdersContext } from "../context/orderscontext";
import { ProductsContext } from "../context/allproductscontext";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
// FIX 1 & 5: Single hardcoded base — no variable substitution can break it.
const API = "https://api-xtreative.onrender.com";
const OFFSET = 1000;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function extractPrice(priceStr) {
  if (!priceStr) return 0;
  return Number(String(priceStr).replace(/[^\d.]/g, ""));
}

function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

function formatDate(dateObj) {
  if (!dateObj || isNaN(dateObj)) return "N/A";
  const day     = dateObj.getDate();
  const ordinal = getOrdinalSuffix(day);
  const month   = dateObj.toLocaleString("en-GB", { month: "long" });
  const year    = dateObj.getFullYear();
  return `${day}${ordinal} ${month} ${year}`;
}

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const normalizeStatus = (s) => (s || "").toLowerCase().trim();

const STATUS_MAP = {
  "pending":             0,
  "sent to warehouse":   1,
  "confirmed warehouse": 2,
  "delivered":           3,
};

const STEPS = [
  { label: "Pending",             color: "bg-yellow-500", status: "pending",             icon: Clock        },
  { label: "Sent to Warehouse",   color: "bg-orange-500", status: "sent to warehouse",   icon: Truck        },
  { label: "Confirmed Warehouse", color: "bg-blue-500",   status: "confirmed warehouse", icon: Warehouse    },
  { label: "Delivered",           color: "bg-green-500",  status: "delivered",           icon: PackageCheck },
];

function getStatusChipClasses(status) {
  switch (normalizeStatus(status)) {
    case "pending":             return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "sent to warehouse":   return "bg-orange-100 text-orange-800 border-orange-300";
    case "confirmed warehouse": return "bg-blue-100   text-blue-800   border-blue-300";
    case "delivered":           return "bg-green-100  text-green-800  border-green-300";
    case "canceled":
    case "cancelled":           return "bg-red-100    text-red-800    border-red-300";
    default:                    return "bg-gray-100   text-gray-800   border-gray-300";
  }
}

function capitalize(str) {
  return String(str)
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// ─── Awaiting Vendor Banner ───────────────────────────────────────────────────
// Shown only when currentStep === 0 (status = "Pending")
// Tells the admin: vendor hasn't tapped 🚚 yet, nothing to do here.
function AwaitingVendorBanner({ order, onPollNow }) {
  const age = timeAgo(order?.created_at);
  const vendorNames = [...new Set(
    (order?.items || []).map(i => i.vendor_name || i.vendor || null).filter(Boolean)
  )];

  return (
    <div className="rounded-xl border-2 border-dashed border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 p-5 mb-4">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3 mt-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500" />
          </span>
          <h3 className="text-[13px] font-bold text-yellow-900">Waiting for Vendor Action</h3>
        </div>
        <button
          onClick={onPollNow}
          className="flex items-center gap-1.5 text-[10px] text-yellow-700 hover:text-yellow-900 border border-yellow-300 hover:border-yellow-500 px-2.5 py-1 rounded-full transition-all"
        >
          <RefreshCw className="w-3 h-3" />
          Check now
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-white/70 rounded-lg p-3 border border-yellow-200">
          <p className="text-[9px] text-yellow-600 font-semibold uppercase tracking-wide mb-1">Current step</p>
          <p className="text-[11px] font-bold text-yellow-900 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Order Placed
          </p>
          <p className="text-[9px] text-yellow-700 mt-1">
            Vendor must tap 🚚 in their app to dispatch items to warehouse
          </p>
        </div>
        <div className="bg-white/70 rounded-lg p-3 border border-yellow-200">
          <p className="text-[9px] text-yellow-600 font-semibold uppercase tracking-wide mb-1">Next step (admin)</p>
          <p className="text-[11px] font-bold text-orange-800 flex items-center gap-1.5">
            <Warehouse className="w-3.5 h-3.5" /> Confirm Warehouse
          </p>
          <p className="text-[9px] text-orange-700 mt-1">Once vendor sends items, you confirm receipt here</p>
        </div>
        <div className="bg-white/70 rounded-lg p-3 border border-yellow-200">
          <p className="text-[9px] text-yellow-600 font-semibold uppercase tracking-wide mb-1">Order age</p>
          <p className="text-[11px] font-bold text-gray-800">{age || "—"}</p>
          {order?.created_at && (
            <p className="text-[9px] text-gray-500 mt-1">Placed {formatDate(new Date(order.created_at))}</p>
          )}
        </div>
      </div>

      {vendorNames.length > 0 && (
        <div className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-2 border border-yellow-200 mb-3">
          <Truck className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
          <p className="text-[10px] text-yellow-800">
            <span className="font-semibold">Pending vendor{vendorNames.length > 1 ? "s" : ""}:</span>{" "}
            {vendorNames.join(", ")}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
        {(order?.items || []).map(item => (
          <span key={item.id} className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-[9px] px-2 py-1 rounded-full border border-yellow-200">
            📦 {item.product_name || "Item"} ×{item.quantity}
          </span>
        ))}
      </div>

      <div className="flex items-start gap-2 text-[9px] text-yellow-700">
        <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
        <p>
          This page auto-refreshes every 5 seconds. The <strong>"Confirm Warehouse"</strong> button
          will become active once the vendor marks their items as dispatched.
        </p>
      </div>
    </div>
  );
}

// ─── Step Action Button ───────────────────────────────────────────────────────
// Renders the right CTA for each step:
//   step 0 → waiting for vendor (disabled yellow pill)
//   step 1 → "Confirm Warehouse" button  → calls confirm-warehouse endpoint
//   step 2 → "Mark as Delivered" button  → calls update-status endpoint
//   step 3 → "Order Completed" (disabled green)
function StepActionButton({ currentStep, isUpdating, isCompleted, isVendorStep, onClick }) {
  if (isCompleted) {
    return (
      <button disabled className="px-4 py-2 text-green-600 flex items-center gap-2 text-[11px]">
        <CheckCircle className="h-4 w-4" />
        Order Completed
      </button>
    );
  }
  if (isVendorStep) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded text-[10px] text-yellow-700">
        <Clock className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
        <span>Vendor hasn't dispatched yet</span>
      </div>
    );
  }

  const labels = {
    1: isUpdating ? "Confirming…"  : "Confirm Warehouse",
    2: isUpdating ? "Updating…"    : "Mark as Delivered",
  };

  return (
    <button
      onClick={onClick}
      disabled={isUpdating}
      className={`inline-flex items-center gap-2 px-4 py-2 text-[11px] rounded text-white bg-[#f9622c] hover:opacity-90 transition-opacity ${isUpdating ? "opacity-60 cursor-wait" : ""}`}
    >
      {isUpdating ? (
        <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
      ) : (
        <ChevronRight className="w-3.5 h-3.5" />
      )}
      {labels[currentStep] || "Move to Next Step"}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OrderLeftSection() {
  const { orderId } = useParams();
  const { orders, loading, error, refreshOrders } = useContext(OrdersContext);
  const { getProductById, loadingProducts, errorProducts } = useContext(ProductsContext);

  const [currentStep,       setCurrentStep]       = useState(0);
  const [steps,             setSteps]             = useState(STEPS.map(s => ({ ...s, width: "w-0", active: false })));
  const [warehouseStatuses, setWarehouseStatuses] = useState({});
  const [warehouseLoading,  setWarehouseLoading]  = useState({});
  const [isUpdating,        setIsUpdating]        = useState(false);
  const [lastPolled,        setLastPolled]        = useState(null);
  const [pollError,         setPollError]         = useState(null);
  const [stepError,         setStepError]         = useState(null);

  // useRef mirrors isUpdating so the setInterval closure always reads the live value,
  // not a stale copy from when the interval was created.
  const isUpdatingRef = useRef(false);
  const setIsUpdatingSync = (val) => {
    isUpdatingRef.current = val;
    setIsUpdating(val);
  };

  // origId = UI order number minus OFFSET → real DB id
  // dbId   = the actual id used in every API call
  const origId = parseInt(orderId, 10) - OFFSET;
  const order  = orders?.find(o => o.id === origId);
  const dbId   = order?.id ?? origId;

  // ── applyStep: update progress bar to reflect a step index ────────────────
  const applyStep = (stepIndex) => {
    const clamped = Math.max(0, Math.min(stepIndex, STEPS.length - 1));
    setCurrentStep(clamped);
    setSteps(STEPS.map((s, i) => ({
      ...s,
      width:  i <= clamped ? "w-full" : "w-0",
      active: i === clamped,
    })));
  };

  // ── FIX 3: Seed from context AND immediately fetch from API ───────────────
  // Runs whenever order.status changes in context.
  // 1. Instantly paints the progress bar from context data (no flicker)
  // 2. Then fires a real API GET to confirm the authoritative status
  // This means: vendor taps 🚚 → context updates → this effect fires →
  //   "Confirm Warehouse" button appears within milliseconds, not 5 seconds.
  useEffect(() => {
    if (!order) return;
    const step = STATUS_MAP[normalizeStatus(order.status)] ?? 0;
    applyStep(step);
    const init = {};
    (order.items || []).forEach(item => {
      init[item.id] = normalizeStatus(item.status || order.status || "pending");
    });
    setWarehouseStatuses(init);
    fetchStatus(); // force fresh poll on every status change
  }, [order?.id, order?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── fetchStatus: pure GET — no isUpdating guard ───────────────────────────
  // Always runs regardless of mutation state. Called by:
  //   - handleNextStep (after a successful POST/PATCH)
  //   - handleConfirmShipment (after per-item confirmation)
  //   - The status-change effect above (FIX 3)
  //   - The 5s auto-poll interval via pollNow
  const fetchStatus = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await fetch(`${API}/orders/${dbId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setPollError(`Fetch failed (${res.status})`); return; }
      const data = await res.json();
      setPollError(null);
      applyStep(STATUS_MAP[normalizeStatus(data.status)] ?? 0);
      setLastPolled(new Date());
      if (Array.isArray(data.item_statuses)) {
        const updated = {};
        data.item_statuses.forEach(item => { updated[item.item_id] = normalizeStatus(item.status); });
        setWarehouseStatuses(prev => ({ ...prev, ...updated }));
      }
      refreshOrders?.();
    } catch (e) {
      setPollError("Network error");
    }
  }, [dbId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── pollNow: background poll — skips while a mutation is in-flight ────────
  // Reads isUpdatingRef (not state) so the interval closure is always current.
  const pollNow = useCallback(async () => {
    if (isUpdatingRef.current) return;
    await fetchStatus();
  }, [fetchStatus]);

  // ── Auto-poll every 5 seconds ─────────────────────────────────────────────
  useEffect(() => {
    if (!dbId) return;
    fetchStatus();
    const interval = setInterval(pollNow, 5000);
    return () => clearInterval(interval);
  }, [dbId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── handleNextStep: advance order through the 4-step flow ─────────────────
  //
  // FIX 2: Guard no longer includes || currentStep === 0.
  //   That guard silently blocked the button at step 1 in edge cases.
  //   StepActionButton already prevents clicks at step 0 via isVendorStep.
  //
  // FIX 1: confirm-warehouse URL is hardcoded — no variable, no loop, no fallback.
  //   Exact URL: https://api-xtreative.onrender.com/orders/orders/{dbId}/confirm-warehouse/
  const handleNextStep = async () => {
    // FIX 2: Removed || currentStep === 0 from this guard
    if (currentStep >= STEPS.length - 1 || isUpdatingRef.current) return;

    const stepAtCall = currentStep;
    const token      = localStorage.getItem("authToken");
    if (!token) return;

    setStepError(null);
    setIsUpdatingSync(true);
    applyStep(stepAtCall + 1); // optimistic update — will revert if API fails

    try {
      let res;
      let lastErrText = "";

      if (stepAtCall === 1) {
        // ── Step 1 → 2: Sent to Warehouse → Confirmed Warehouse ──────────────
        //
        // FIX 1 (CORE FIX): Single hardcoded URL. No loop. No fallback.
        // API schema: POST /orders/orders/{order_id}/confirm-warehouse/
        // Full URL:   https://api-xtreative.onrender.com/orders/orders/{dbId}/confirm-warehouse/
        const confirmUrl = `https://api-xtreative.onrender.com/orders/orders/${dbId}/confirm-warehouse/`;

        res = await fetch(confirmUrl, {
          method:  "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body:    JSON.stringify({}),
        });

        if (!res.ok) {
          // FIX 4: Full error details captured for on-screen debug display
          lastErrText = `POST ${confirmUrl} → HTTP ${res.status}: ${await res.text()}`;
          console.error("confirm-warehouse failed:", lastErrText);
        }

      } else if (stepAtCall === 2) {
        // ── Step 2 → 3: Confirmed Warehouse → Delivered ──────────────────────
        //
        // FIX 5: Both URLs use hardcoded base (no ${API_BASE} variable)
        // Try custom update-status endpoint first, fall back to documented PATCH endpoint
        const urlPrimary  = `https://api-xtreative.onrender.com/orders/${dbId}/update-status/`;
        const urlFallback = `https://api-xtreative.onrender.com/orders/${dbId}/status/`;

        res = await fetch(urlPrimary, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body:    JSON.stringify({ status: "delivered" }),
        });

        if (!res.ok) {
          lastErrText = `PATCH ${urlPrimary} → HTTP ${res.status}: ${await res.text()}`;
          console.warn("update-status primary failed, trying fallback:", lastErrText);

          res = await fetch(urlFallback, {
            method:  "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body:    JSON.stringify({ status: "delivered" }),
          });

          if (!res.ok) {
            lastErrText += ` | PATCH ${urlFallback} → HTTP ${res.status}: ${await res.text()}`;
            console.error("update-status fallback also failed:", lastErrText);
          }
        }
      }

      if (!res || !res.ok) {
        // FIX 4: Show full error string on screen — admin can copy + report it
        setStepError(lastErrText || `HTTP ${res?.status ?? "no response"}`);
        applyStep(stepAtCall); // revert optimistic update
      } else {
        // Success: replace optimistic step with authoritative value from server
        await fetchStatus();
      }
    } catch (e) {
      console.error("Network error in handleNextStep:", e);
      setStepError(`Network error: ${e.message}`);
      applyStep(stepAtCall); // revert on network failure
    } finally {
      setIsUpdatingSync(false);
    }
  };

  // ── handleConfirmShipment: confirm individual item at warehouse ────────────
  // Called per-item when isAtWarehouse === true (order status = "sent to warehouse").
  // Uses the same hardcoded confirm-warehouse URL, passes item_id in the body.
  const handleConfirmShipment = async (itemId) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    setWarehouseLoading(prev => ({ ...prev, [itemId]: true }));
    try {
      // Same hardcoded URL as handleNextStep step 1 — item_id in body
      const confirmUrl = `https://api-xtreative.onrender.com/orders/orders/${dbId}/confirm-warehouse/`;
      const res = await fetch(confirmUrl, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ item_id: itemId }),
      });
      if (res.ok) {
        setWarehouseStatuses(prev => ({ ...prev, [itemId]: "confirmed" }));
        await fetchStatus();
      } else {
        console.error("Confirm shipment failed:", await res.text());
      }
    } catch (e) {
      console.error("Network error in handleConfirmShipment:", e);
    } finally {
      setWarehouseLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (loading || loadingProducts)
    return <div className="text-center text-[11px] p-8 text-gray-400">Loading order details…</div>;
  if (error)
    return <div className="text-center text-[11px] p-8 text-red-500">Error: {error}</div>;
  if (errorProducts)
    return <div className="text-center text-[11px] p-8 text-red-500">Error: {errorProducts}</div>;
  if (!order)
    return <div className="text-center text-[11px] p-8 text-gray-400">Order not found.</div>;

  const orderNumber  = `#${order.id + OFFSET}`;
  const createdDate  = formatDate(new Date(order.created_at));
  const shipDate     = order.estimated_shipping_date
    ? formatDate(new Date(order.estimated_shipping_date)) : "N/A";

  // isVendorStep  → step 0: vendor hasn't dispatched, admin waits
  // isAtWarehouse → step 1: vendor dispatched, admin confirms per-item
  // isCompleted   → step 3: delivered, everything done
  const isVendorStep  = currentStep === 0;
  const isAtWarehouse = normalizeStatus(order.status) === "sent to warehouse";
  const isCompleted   = currentStep === STEPS.length - 1;

  return (
    <div className="flex flex-col md:flex-row font-poppins text-[11px]">
      {/* ── LEFT COLUMN ── */}
      <div className="w-full md:w-2/3 p-4">

        {/* Yellow "waiting for vendor" banner — only shown at step 0 */}
        {isVendorStep && <AwaitingVendorBanner order={order} onPollNow={pollNow} />}

        {/* Background poll error — shown when GET /orders/{id}/ fails */}
        {pollError && (
          <div className="mb-3 flex items-center gap-2 text-[10px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {pollError} — retrying automatically
          </div>
        )}

        {/* FIX 4: Step action error — full URL + status + body so it's debuggable */}
        {stepError && (
          <div className="mb-3 text-[10px] text-red-700 bg-red-50 border border-red-300 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 font-semibold mb-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Action failed — copy this and send to your developer:
            </div>
            <code className="block bg-red-100 rounded px-2 py-1 text-[9px] break-all select-all">
              {stepError}
            </code>
            <button onClick={() => setStepError(null)} className="mt-2 text-[9px] underline text-red-500">
              Dismiss
            </button>
          </div>
        )}

        {/* ── Progress card ── */}
        <div className="bg-white shadow rounded-xl mb-4 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-5 flex-wrap gap-2">
              <div>
                <h4 className="flex items-center flex-wrap gap-1.5 text-[12px] text-[#280300] font-semibold">
                  <span>{orderNumber}</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] rounded-full border border-green-200">
                    {order.payment_status || "Paid"}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full border ${getStatusChipClasses(order.status)}`}>
                    {capitalize(order.status || "Unknown")}
                  </span>
                </h4>
                <p className="text-[10px] text-gray-400 mt-1">{createdDate}</p>
              </div>
              <div className="flex items-center gap-3">
                {lastPolled && (
                  <p className="text-[9px] text-gray-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                    Live · {timeAgo(lastPolled)}
                  </p>
                )}
                <button
                  onClick={pollNow}
                  className="flex items-center gap-1 text-[9px] text-gray-400 hover:text-gray-700 border border-gray-200 hover:border-gray-400 px-2 py-1 rounded-full transition-all"
                >
                  <RefreshCw className="w-2.5 h-2.5" /> Refresh
                </button>
              </div>
            </div>

            <p className="mb-3 text-[10px] font-medium text-[#f9622c] flex items-center gap-1.5">
              <Zap className="w-3 h-3" /> Progress
            </p>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {steps.map((s, i) => {
                const StepIcon = s.icon;
                return (
                  <div key={i}>
                    <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className={`${s.color} ${s.width} h-full transition-all duration-700 ease-in-out`} />
                    </div>
                    <p className={`text-[10px] mt-2 flex items-center gap-1 ${s.active ? "font-semibold text-gray-800" : "text-gray-300"}`}>
                      <StepIcon className={`w-3 h-3 ${s.active ? "text-[#f9622c]" : ""}`} />
                      {s.label}
                      {s.active && <span className="ml-1 text-[8px] text-[#f9622c] font-normal">← now</span>}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 flex justify-between items-center flex-wrap gap-2 border-t border-gray-100">
            <p className="flex items-center text-[10px] bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
              Delivery date:
              <span className="ml-1 font-semibold text-[#280300]">{shipDate}</span>
            </p>
            <StepActionButton
              currentStep={currentStep}
              isUpdating={isUpdating}
              isCompleted={isCompleted}
              isVendorStep={isVendorStep}
              onClick={handleNextStep}
            />
          </div>
        </div>

        {/* ── Order Items table ── */}
        <div className="bg-white shadow rounded-xl overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-gray-100">
            <h5 className="text-[11px] font-semibold text-gray-700">Order Items</h5>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-gray-600">
              <thead className="bg-gray-50 uppercase text-gray-400 text-[9px]">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Price / item</th>
                  <th className="px-4 py-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-[10px]">
                {(order.items || []).map(item => {
                  const detail    = getProductById(item.product) || {};
                  const unitPrice = extractPrice(item.price);
                  const amount    = unitPrice * item.quantity;
                  const size      = detail.size || item.size;
                  const color     = detail.custom_color && detail.custom_color !== "custom"
                    ? detail.custom_color : detail.color || item.color;
                  const material  = detail.material || item.material;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 flex items-center space-x-2 min-w-[160px]">
                        <img
                          src={item.product_image_url || detail.product_image_url || "https://via.placeholder.com/50"}
                          alt={item.product_name || detail.name}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                        />
                        <div>
                          <p className="font-semibold text-gray-800 text-[11px]">
                            {item.product_name || detail.name}
                          </p>
                          {(size || color || material) && (
                            <p className="text-[9px] text-gray-400">
                              {[
                                size     && `Size: ${size}`,
                                color    && `Color: ${color}`,
                                material && `Material: ${material}`,
                              ].filter(Boolean).join(" · ")}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{item.quantity}</td>
                      <td className="px-4 py-3">UGX {unitPrice.toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        UGX {amount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Warehouse table ── */}
        <div className="bg-white shadow rounded-xl overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 flex-wrap">
            <Warehouse className="w-4 h-4 text-gray-400" />
            <h5 className="text-[11px] font-semibold text-gray-700">Warehouse</h5>
            {isAtWarehouse && (
              <span className="text-[9px] px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                Items received — confirm each below
              </span>
            )}
            {isVendorStep && (
              <span className="text-[9px] px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                Awaiting vendor dispatch
              </span>
            )}
            {currentStep >= 2 && !isVendorStep && !isAtWarehouse && (
              <span className="text-[9px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                ✓ Warehouse confirmed
              </span>
            )}
          </div>

          {!isAtWarehouse ? (
            <div className="flex flex-col items-center gap-3 py-10 text-gray-300">
              <Truck className="w-10 h-10 text-gray-200" />
              <p className="text-[10px] italic text-center px-8">
                {isVendorStep
                  ? "Vendor hasn't dispatched items yet — waiting for them to tap 🚚 in their app."
                  : currentStep >= 2
                    ? "Warehouse receipt already confirmed."
                    : "No items in warehouse."}
              </p>
              {isVendorStep && (
                <p className="text-[9px] text-yellow-500 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                  This section will activate automatically when the vendor marks items as sent
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-gray-600 text-[10px]">
                <thead className="bg-gray-50 uppercase text-gray-400 text-[9px]">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Price / item</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(order.items || []).map(item => {
                    const detail    = getProductById(item.product) || {};
                    const unitPrice = extractPrice(item.price || detail.price || "0");
                    const amount    = unitPrice * item.quantity;
                    const status    = warehouseStatuses[item.id];
                    const isLoading = warehouseLoading[item.id];
                    const confirmed = ["confirmed", "shipped", "confirmed warehouse"].includes(status);

                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 flex items-center space-x-2 min-w-[160px]">
                          <img
                            src={item.product_image_url || detail.product_image_url || "https://via.placeholder.com/50"}
                            alt={item.product_name || detail.name}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                          />
                          <span className="font-semibold text-gray-800 text-[11px]">
                            {item.product_name || detail.name}
                          </span>
                        </td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">UGX {unitPrice.toLocaleString()}</td>
                        <td className="px-4 py-3 font-semibold text-gray-800">
                          UGX {amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          {isLoading ? (
                            <div className="w-4 h-4 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
                          ) : confirmed ? (
                            <div className="flex items-center gap-1 text-green-600 text-[10px] font-medium">
                              <CheckCircle className="w-3.5 h-3.5" /> Confirmed
                            </div>
                          ) : (
                            <button
                              onClick={() => handleConfirmShipment(item.id)}
                              className="px-2.5 py-1 text-[10px] bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                            >
                              Confirm Receipt
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <OrderTimeline steps={steps} currentStep={currentStep} />
      </div>

      {/* ── RIGHT COLUMN ── */}
      <div className="w-full md:w-1/3 p-4">
        <CustomerDetailsCard order={order} />
      </div>
    </div>
  );
}