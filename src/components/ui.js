import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  Users,
  DollarSign,
  Clock,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Activity,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
} from "lucide-react";
import loanIcon from "../assets/money-icon.png";
import LoanRepayments from "./loansvendors";
import { LoansContext } from "../context/loanscontext";

/* ─── helpers ──────────────────────────────────────────────────── */
const BASE = "https://xtreativeapi.onrender.com";
const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
});

const fmt = (n) =>
  n != null ? `UGX ${Number(n).toLocaleString("en-UG")}` : "UGX 0";

const fmtShort = (n) => {
  if (n == null) return "UGX 0";
  if (n >= 1_000_000) return `UGX ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `UGX ${(n / 1_000).toFixed(0)}K`;
  return `UGX ${n.toLocaleString("en-UG")}`;
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-UG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

/* ─── animated counter ──────────────────────────────────────────── */
function Counter({ value, prefix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / 40;
    const t = setInterval(() => {
      start = Math.min(start + step, value);
      setDisplay(Math.floor(start));
      if (start >= value) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [value]);
  return (
    <>
      {prefix}
      {display.toLocaleString("en-UG")}
    </>
  );
}

/* ─── radial ring ───────────────────────────────────────────────── */
function Ring({ pct, size = 72, stroke = 7, color = "#2563eb" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - (Math.min(pct, 100) / 100) * circ}
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
    </svg>
  );
}

/* ─── status pill ───────────────────────────────────────────────── */
const PILL = {
  Active: { bg: "#dcfce7", color: "#16a34a" },
  Pending: { bg: "#fef9c3", color: "#ca8a04" },
  Overdue: { bg: "#fee2e2", color: "#dc2626" },
  Closed: { bg: "#f1f5f9", color: "#64748b" },
  Rejected: { bg: "#fce7f3", color: "#be185d" },
};
function Pill({ status }) {
  const s = PILL[status] || PILL.Closed;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "2px 10px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

/* ─── toast ─────────────────────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: type === "error" ? "#fee2e2" : "#dcfce7",
        color: type === "error" ? "#dc2626" : "#16a34a",
        border: `1px solid ${type === "error" ? "#fca5a5" : "#86efac"}`,
        borderRadius: 10,
        padding: "12px 20px",
        fontSize: 13,
        fontWeight: 600,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {type === "error" ? <XCircle size={16} /> : <CheckCircle size={16} />}
      {msg}
    </div>
  );
}

/* ─── loan detail modal ─────────────────────────────────────────── */
function LoanModal({ loanId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("schedule");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loanId) return;
    setLoading(true);
    Promise.all([
      fetch(`${BASE}/loan_app/loan/${loanId}/`, { headers: authHeader() }).then(
        (r) => r.json(),
      ),
      fetch(`${BASE}/loan_app/loan/${loanId}/payment-schedule/`, {
        headers: authHeader(),
      }).then((r) => r.json()),
      fetch(`${BASE}/loan_app/loan/${loanId}/payment-history/`, {
        headers: authHeader(),
      }).then((r) => r.json()),
    ])
      .then(([d, s, h]) => {
        setDetail(d);
        setSchedule(Array.isArray(s) ? s : s.schedule || []);
        setHistory(Array.isArray(h) ? h : h.history || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [loanId]);

  return (
    <div style={M.overlay} onClick={onClose}>
      <div style={M.box} onClick={(e) => e.stopPropagation()}>
        <div style={M.head}>
          <h3 style={M.title}>Loan #{loanId}</h3>
          <button onClick={onClose} style={M.closeBtn}>
            ✕
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
            <Loader2
              size={28}
              style={{ animation: "spin 0.8s linear infinite" }}
            />
          </div>
        ) : detail ? (
          <>
            <div style={M.strip}>
              {[
                ["Amount", fmt(detail.amount)],
                ["Balance", fmt(detail.current_balance)],
                ["Repayable", fmt(detail.total_repayable)],
                ["Status", detail.status],
              ].map(([k, v]) => (
                <div key={k} style={M.stripItem}>
                  <p style={M.stripLabel}>{k}</p>
                  {k === "Status" ? (
                    <Pill status={v} />
                  ) : (
                    <p style={M.stripVal}>{v}</p>
                  )}
                </div>
              ))}
            </div>

            <div style={M.tabs}>
              {["schedule", "history"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{ ...M.tab, ...(tab === t ? M.tabActive : {}) }}
                >
                  {t === "schedule" ? "Payment Schedule" : "Payment History"}
                </button>
              ))}
            </div>

            <div style={M.tableWrap}>
              {tab === "schedule" &&
                (schedule.length === 0 ? (
                  <p
                    style={{
                      color: "#94a3b8",
                      textAlign: "center",
                      padding: 24,
                    }}
                  >
                    No schedule available
                  </p>
                ) : (
                  <table style={M.table}>
                    <thead>
                      <tr>
                        {[
                          "#",
                          "Due Date",
                          "Principal",
                          "Interest",
                          "Amount",
                          "Status",
                        ].map((h) => (
                          <th key={h} style={M.th}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map((s, i) => (
                        <tr key={i} style={M.tr}>
                          <td style={M.td}>{s.installment_number || i + 1}</td>
                          <td style={M.td}>{fmtDate(s.due_date)}</td>
                          <td style={M.td}>{fmt(s.principal)}</td>
                          <td style={M.td}>{fmt(s.interest)}</td>
                          <td style={{ ...M.td, fontWeight: 600 }}>
                            {fmt(s.amount || s.total_amount)}
                          </td>
                          <td style={M.td}>
                            <Pill status={s.status || "Pending"} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ))}

              {tab === "history" &&
                (history.length === 0 ? (
                  <p
                    style={{
                      color: "#94a3b8",
                      textAlign: "center",
                      padding: 24,
                    }}
                  >
                    No payment history yet
                  </p>
                ) : (
                  <table style={M.table}>
                    <thead>
                      <tr>
                        {["Date", "Amount Paid", "Method", "Reference"].map(
                          (h) => (
                            <th key={h} style={M.th}>
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((p, i) => (
                        <tr key={i} style={M.tr}>
                          <td style={M.td}>
                            {fmtDate(p.payment_date || p.date)}
                          </td>
                          <td
                            style={{
                              ...M.td,
                              color: "#16a34a",
                              fontWeight: 600,
                            }}
                          >
                            {fmt(p.amount)}
                          </td>
                          <td style={M.td}>
                            {p.payment_method || p.method || "—"}
                          </td>
                          <td
                            style={{
                              ...M.td,
                              fontFamily: "monospace",
                              fontSize: 11,
                            }}
                          >
                            {p.reference || p.transaction_id || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ))}
            </div>
          </>
        ) : (
          <p style={{ color: "#dc2626", padding: 24 }}>
            Failed to load loan details.
          </p>
        )}
      </div>
    </div>
  );
}

const M = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    backdropFilter: "blur(4px)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  box: {
    background: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 720,
    maxHeight: "90vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
  },
  head: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 24px",
    borderBottom: "1px solid #e2e8f0",
  },
  title: {
    fontFamily: "'Syne',sans-serif",
    fontSize: 18,
    fontWeight: 800,
    color: "#0f172a",
    margin: 0,
  },
  closeBtn: {
    background: "#f1f5f9",
    border: "none",
    borderRadius: 8,
    width: 32,
    height: 32,
    cursor: "pointer",
    fontSize: 14,
    color: "#64748b",
  },
  strip: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 1,
    background: "#e2e8f0",
    borderBottom: "1px solid #e2e8f0",
  },
  stripItem: { background: "#f8fafc", padding: "14px 18px" },
  stripLabel: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 4,
  },
  stripVal: { fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 },
  tabs: {
    display: "flex",
    padding: "0 24px",
    borderBottom: "1px solid #e2e8f0",
    background: "#f8fafc",
  },
  tab: {
    padding: "12px 18px",
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    fontSize: 13,
    fontWeight: 600,
    color: "#94a3b8",
    cursor: "pointer",
    fontFamily: "'DM Sans',sans-serif",
  },
  tabActive: { borderBottomColor: "#2563eb", color: "#2563eb" },
  tableWrap: { overflowY: "auto", flex: 1 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "10px 18px",
    textAlign: "left",
    fontSize: 10,
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    background: "#f8fafc",
    position: "sticky",
    top: 0,
  },
  tr: { borderTop: "1px solid #f1f5f9" },
  td: { padding: "12px 18px", fontSize: 13, color: "#334155" },
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function LoanOverview() {
  const {
    loans = [],
    loading: ctxLoading,
    error: ctxError,
  } = useContext(LoansContext);

  const [loans2, setLoans2] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [userStatus, setUserStatus] = useState(null);
  const [modalId, setModalId] = useState(null);
  const [toast, setToast] = useState(null);
  const [actionBusy, setActionBusy] = useState({});

  const allLoans = loans2.length ? loans2 : loans;
  const showToast = (msg, type = "success") => setToast({ msg, type });

  /* fetch all loans */
  const fetchLoans = useCallback(async () => {
    setApiLoading(true);
    try {
      const r = await fetch(`${BASE}/loan_app/loans/list/`, {
        headers: authHeader(),
      });
      if (r.ok) {
        const d = await r.json();
        setLoans2(Array.isArray(d) ? d : d.loans || d.results || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setApiLoading(false);
    }
  }, []);

  /* fetch user loan status */
  const fetchStatus = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/loan_app/user-loan-status/`, {
        headers: authHeader(),
      });
      if (r.ok) setUserStatus(await r.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
    fetchStatus();
  }, []);

  /* approve / reject */
  const doAction = async (loanId, action) => {
    setActionBusy((p) => ({ ...p, [loanId]: action }));
    try {
      const r = await fetch(`${BASE}/loan_app/${loanId}/${action}/`, {
        method: "POST",
        headers: authHeader(),
      });
      if (r.ok) {
        showToast(`Loan ${action}d successfully`);
        fetchLoans();
      } else {
        const d = await r.json().catch(() => ({}));
        showToast(d.detail || `Failed to ${action} loan`, "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setActionBusy((p) => ({ ...p, [loanId]: null }));
    }
  };

  /* stats */
  const now = new Date();
  const stats = {
    active: allLoans.filter((l) => l.status === "Active").length,
    pending: allLoans.filter((l) => l.status === "Pending").length,
    overdue: allLoans.filter(
      (l) => l.next_payment_date && new Date(l.next_payment_date) < now,
    ).length,
    principal: allLoans.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0),
    outstanding: allLoans.reduce(
      (s, l) => s + (parseFloat(l.current_balance) || 0),
      0,
    ),
    repaid: allLoans.reduce(
      (s, l) =>
        s +
        ((parseFloat(l.total_repayable) || 0) -
          (parseFloat(l.current_balance) || 0)),
      0,
    ),
    repayable: allLoans.reduce(
      (s, l) => s + (parseFloat(l.total_repayable) || 0),
      0,
    ),
    interest: allLoans.reduce(
      (s, l) =>
        s +
        ((parseFloat(l.total_repayable) || 0) - (parseFloat(l.amount) || 0)),
      0,
    ),
  };
  const repaidPct =
    stats.repayable > 0
      ? Math.round((stats.repaid / stats.repayable) * 100)
      : 0;
  const loading = (ctxLoading || apiLoading) && allLoans.length === 0;

  /* ── Loading ── */
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 size={32} className="text-blue-600 animate-spin" />
        <p className="text-gray-500 text-sm">Loading portfolio data…</p>
      </div>
    );

  /* ── Error ── */
  if (ctxError && allLoans.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertTriangle size={32} className="text-red-500" />
        <p className="text-red-500 text-sm">{ctxError}</p>
        <button
          onClick={fetchLoans}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Syne:wght@700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .lo-card  { animation:fadeUp .45s ease both; transition:box-shadow .18s,transform .18s; }
        .lo-card:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,0,0,0.10) !important; }
        .lo-row:hover  { background:#f8fafc; }
        .lo-btn   { transition:background .15s,color .15s; }
        .lo-btn:hover { filter:brightness(0.95); }
        .animate-spin { animation:spin 0.8s linear infinite; }
      `}</style>

      <div
        style={{
          fontFamily: "'DM Sans',sans-serif",
          background: "#f1f5f9",
          minHeight: "100vh",
          padding: "24px 20px 48px",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            animation: "fadeUp .4s ease both",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 10,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <img
                src={loanIcon}
                alt="Loans"
                style={{ width: 28, height: 28, display: "block" }}
              />
            </div>
            <div>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#2563eb",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Finance
              </p>
              <h1
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Loan Portfolio
              </h1>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {userStatus && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: "7px 14px",
                  fontSize: 12,
                  color: "#64748b",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                My Status:&nbsp;
                <strong style={{ color: "#0f172a" }}>
                  {userStatus.status || userStatus.loan_status || "N/A"}
                </strong>
              </div>
            )}
            <button
              onClick={fetchLoans}
              disabled={apiLoading}
              className="lo-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
              }}
            >
              <RefreshCw
                size={13}
                style={
                  apiLoading ? { animation: "spin .8s linear infinite" } : {}
                }
              />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Hero row ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: 14,
            marginBottom: 14,
          }}
        >
          {/* Principal Disbursed */}
          <div
            className="lo-card"
            style={{
              background: "#2563eb",
              borderRadius: 14,
              padding: "22px 24px",
              boxShadow: "0 4px 24px rgba(37,99,235,0.28)",
              animationDelay: "0ms",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -24,
                right: -24,
                width: 130,
                height: 130,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.07)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -20,
                right: 40,
                width: 70,
                height: 70,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 14,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.65)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  margin: 0,
                }}
              >
                Total Principal Disbursed
              </p>
              <div
                style={{
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <DollarSign size={20} color="#fff" />
              </div>
            </div>
            <h2
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 32,
                fontWeight: 800,
                color: "#fff",
                margin: "0 0 6px",
              }}
            >
              <Counter value={stats.principal} prefix="UGX " />
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.55)",
                margin: 0,
              }}
            >
              {allLoans.length} loan{allLoans.length !== 1 ? "s" : ""} in
              portfolio
            </p>
          </div>

          {/* Repayment Progress */}
          <div
            className="lo-card"
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              padding: 20,
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              animationDelay: "60ms",
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                margin: "0 0 14px",
              }}
            >
              Repayment Progress
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  position: "relative",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ring pct={repaidPct} size={76} stroke={7} color="#2563eb" />
                <span
                  style={{
                    position: "absolute",
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#0f172a",
                    fontFamily: "'Syne',sans-serif",
                  }}
                >
                  {repaidPct}%
                </span>
              </div>
              <div style={{ fontSize: 12 }}>
                <div style={{ marginBottom: 8 }}>
                  <p
                    style={{
                      color: "#94a3b8",
                      margin: "0 0 1px",
                      fontSize: 11,
                    }}
                  >
                    Repaid
                  </p>
                  <p style={{ color: "#16a34a", fontWeight: 700, margin: 0 }}>
                    {fmtShort(stats.repaid)}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      color: "#94a3b8",
                      margin: "0 0 1px",
                      fontSize: 11,
                    }}
                  >
                    Outstanding
                  </p>
                  <p style={{ color: "#dc2626", fontWeight: 700, margin: 0 }}>
                    {fmtShort(stats.outstanding)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interest Earned */}
          <div
            className="lo-card"
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              padding: 20,
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              animationDelay: "100ms",
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                margin: "0 0 10px",
              }}
            >
              Interest Earned
            </p>
            <h3
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 22,
                fontWeight: 800,
                color: "#0f172a",
                margin: "0 0 10px",
              }}
            >
              {fmtShort(stats.interest)}
            </h3>
            <div
              style={{
                height: 5,
                background: "#f1f5f9",
                borderRadius: 99,
                overflow: "hidden",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg,#2563eb,#60a5fa)",
                  borderRadius: 99,
                  width: `${stats.principal > 0 ? Math.min(100, (stats.interest / stats.principal) * 100) : 0}%`,
                  transition: "width 1s ease",
                }}
              />
            </div>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
              {stats.principal > 0
                ? `${((stats.interest / stats.principal) * 100).toFixed(1)}% yield on principal`
                : "—"}
            </p>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5,1fr)",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            {
              label: "Active Loans",
              val: stats.active,
              icon: Users,
              color: "#2563eb",
              bg: "#eff6ff",
              isNum: true,
            },
            {
              label: "Outstanding",
              val: stats.outstanding,
              icon: TrendingUp,
              color: "#dc2626",
              bg: "#fef2f2",
              isNum: false,
            },
            {
              label: "Total Repaid",
              val: stats.repaid,
              icon: CheckCircle,
              color: "#16a34a",
              bg: "#f0fdf4",
              isNum: false,
            },
            {
              label: "Pending Approvals",
              val: stats.pending,
              icon: Clock,
              color: "#ca8a04",
              bg: "#fefce8",
              isNum: true,
            },
            {
              label: "Overdue Loans",
              val: stats.overdue,
              icon: AlertTriangle,
              color: "#ea580c",
              bg: "#fff7ed",
              isNum: true,
            },
          ].map((c, i) => (
            <div
              key={i}
              className="lo-card"
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "16px 18px",
                boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                animationDelay: `${140 + i * 40}ms`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    margin: 0,
                  }}
                >
                  {c.label}
                </p>
                <div style={{ background: c.bg, borderRadius: 8, padding: 7 }}>
                  <c.icon size={14} color={c.color} />
                </div>
              </div>
              <p
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 22,
                  fontWeight: 800,
                  color: c.color,
                  margin: 0,
                }}
              >
                {c.isNum ? <Counter value={c.val} /> : fmtShort(c.val)}
              </p>
            </div>
          ))}
        </div>

        {/* ── Loans Table ── */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            marginBottom: 20,
            animation: "fadeUp .5s ease both",
            animationDelay: "320ms",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 22px",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <h3
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 15,
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
              }}
            >
              All Loans
            </h3>
            <span
              style={{
                fontSize: 12,
                color: "#94a3b8",
                background: "#f1f5f9",
                padding: "3px 10px",
                borderRadius: 99,
              }}
            >
              {allLoans.length} records
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    "Borrower",
                    "Principal",
                    "Balance",
                    "Repayable",
                    "Status",
                    "Next Payment",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 18px",
                        textAlign: "left",
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allLoans.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        padding: 32,
                        color: "#94a3b8",
                        fontSize: 13,
                      }}
                    >
                      No loans found
                    </td>
                  </tr>
                ) : (
                  allLoans.map((loan, i) => {
                    const isOverdue =
                      loan.next_payment_date &&
                      new Date(loan.next_payment_date) < now;
                    const statusLabel =
                      isOverdue && loan.status === "Active"
                        ? "Overdue"
                        : loan.status || "Unknown";
                    const busy = actionBusy[loan.id];

                    return (
                      <tr
                        key={loan.id || i}
                        className="lo-row"
                        style={{
                          borderTop: "1px solid #f1f5f9",
                          transition: "background .12s",
                        }}
                      >
                        {/* Borrower */}
                        <td style={{ padding: "12px 18px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                background: "#eff6ff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#2563eb",
                                flexShrink: 0,
                              }}
                            >
                              {(loan.borrower_name ||
                                loan.borrower ||
                                "U")[0].toUpperCase()}
                            </div>
                            <div>
                              <p
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "#0f172a",
                                  margin: 0,
                                }}
                              >
                                {loan.borrower_name || loan.borrower || "—"}
                              </p>
                              <p
                                style={{
                                  fontSize: 11,
                                  color: "#94a3b8",
                                  margin: 0,
                                }}
                              >
                                #{loan.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "12px 18px",
                            fontSize: 13,
                            color: "#334155",
                            fontWeight: 500,
                          }}
                        >
                          {fmt(parseFloat(loan.amount) || 0)}
                        </td>
                        <td
                          style={{
                            padding: "12px 18px",
                            fontSize: 13,
                            fontWeight: 600,
                            color:
                              parseFloat(loan.current_balance) > 0
                                ? "#dc2626"
                                : "#16a34a",
                          }}
                        >
                          {fmt(parseFloat(loan.current_balance) || 0)}
                        </td>
                        <td
                          style={{
                            padding: "12px 18px",
                            fontSize: 13,
                            color: "#334155",
                          }}
                        >
                          {fmt(parseFloat(loan.total_repayable) || 0)}
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <Pill status={statusLabel} />
                        </td>
                        <td
                          style={{
                            padding: "12px 18px",
                            fontSize: 12,
                            color: isOverdue ? "#dc2626" : "#64748b",
                            fontWeight: isOverdue ? 600 : 400,
                          }}
                        >
                          {fmtDate(loan.next_payment_date)}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "12px 18px" }}>
                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              onClick={() => setModalId(loan.id)}
                              className="lo-btn"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "5px 10px",
                                background: "#f1f5f9",
                                border: "1px solid #e2e8f0",
                                borderRadius: 7,
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#475569",
                                cursor: "pointer",
                              }}
                            >
                              <Eye size={11} /> View
                            </button>

                            {loan.status === "Pending" && (
                              <button
                                onClick={() => doAction(loan.id, "approve")}
                                disabled={!!busy}
                                className="lo-btn"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  padding: "5px 10px",
                                  background: "#f0fdf4",
                                  border: "1px solid #bbf7d0",
                                  borderRadius: 7,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: "#16a34a",
                                  cursor: "pointer",
                                  opacity: busy ? 0.6 : 1,
                                }}
                              >
                                {busy === "approve" ? (
                                  <Loader2
                                    size={11}
                                    style={{
                                      animation: "spin .8s linear infinite",
                                    }}
                                  />
                                ) : (
                                  <CheckCircle size={11} />
                                )}
                                Approve
                              </button>
                            )}

                            {loan.status === "Pending" && (
                              <button
                                onClick={() => doAction(loan.id, "reject")}
                                disabled={!!busy}
                                className="lo-btn"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  padding: "5px 10px",
                                  background: "#fef2f2",
                                  border: "1px solid #fecaca",
                                  borderRadius: 7,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: "#dc2626",
                                  cursor: "pointer",
                                  opacity: busy ? 0.6 : 1,
                                }}
                              >
                                {busy === "reject" ? (
                                  <Loader2
                                    size={11}
                                    style={{
                                      animation: "spin .8s linear infinite",
                                    }}
                                  />
                                ) : (
                                  <XCircle size={11} />
                                )}
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Loan Repayments ── */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            animation: "fadeUp .5s ease both",
            animationDelay: "380ms",
          }}
        >
          <LoanRepayments />
        </div>
      </div>

      {/* Loan Detail Modal */}
      {modalId && (
        <LoanModal loanId={modalId} onClose={() => setModalId(null)} />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
