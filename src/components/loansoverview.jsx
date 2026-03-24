import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  Users, DollarSign, Clock, RefreshCw, TrendingUp,
  AlertTriangle, CheckCircle, XCircle, Loader2, Eye,
} from 'lucide-react';
import loanIcon from '../assets/money-icon.png';
import LoanRepayments from './loansvendors';
import { LoansContext } from '../context/loanscontext';

/* ─── helpers ──────────────────────────────────────────────────── */
const BASE = 'https://api-xtreative-nwf7.onrender.com';
const authHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('authToken')}`,
});

const fmt = (n) =>
  n != null ? `UGX ${Number(n).toLocaleString('en-UG')}` : 'UGX 0';

const fmtShort = (n) => {
  if (n == null) return 'UGX 0';
  if (n >= 1_000_000) return `UGX ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `UGX ${(n / 1_000).toFixed(0)}K`;
  return `UGX ${n.toLocaleString('en-UG')}`;
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

function getBorrowerName(loan) {
  const flat =
    loan.borrower_name   ||
    loan.applicant_name  ||
    loan.client_name     ||
    loan.full_name       ||
    loan.customer_name;
  if (flat) return flat;
  if (typeof loan.borrower === 'string' && loan.borrower) return loan.borrower;
  if (typeof loan.borrower === 'number') return `User #${loan.borrower}`;
  const fromObj = (obj) => {
    if (!obj || typeof obj !== 'object') return null;
    const full = [obj.first_name, obj.last_name].filter(Boolean).join(' ').trim();
    return full || obj.name || obj.full_name || obj.username || obj.email || null;
  };
  return (
    fromObj(loan.user)       ||
    fromObj(loan.borrower)   ||
    fromObj(loan.applicant)  ||
    fromObj(loan.customer)   ||
    fromObj(loan.client)     ||
    fromObj(loan.member)     ||
    '—'
  );
}

function getBorrowerInitial(loan) {
  const name = getBorrowerName(loan);
  return name !== '—' ? name[0].toUpperCase() : 'U';
}

/* ─── animated counter ──────────────────────────────────────────── */
function Counter({ value, prefix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(value / 40, 1);
    const t = setInterval(() => {
      start = Math.min(start + step, value);
      setDisplay(Math.floor(start));
      if (start >= value) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [value]);
  return <>{prefix}{display.toLocaleString('en-UG')}</>;
}

/* ─── radial ring ───────────────────────────────────────────────── */
function Ring({ pct, size = 72, stroke = 7, color = '#F97316' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - (Math.min(pct, 100) / 100) * circ}
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
    </svg>
  );
}

/* ─── status pill ───────────────────────────────────────────────── */
const PILL = {
  Active:   { bg: '#000',     color: '#fff'    },
  Pending:  { bg: '#FFF7ED', color: '#C2410C'  },
  Overdue:  { bg: '#F97316', color: '#fff'     },
  Closed:   { bg: '#f3f4f6', color: '#6b7280'  },
  Rejected: { bg: '#1a1a1a', color: '#9ca3af'  },
};
function Pill({ status }) {
  const s = PILL[status] || PILL.Closed;
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '3px 11px', borderRadius: 4,
      fontSize: 10, fontWeight: 800,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
}

/* ─── toast ─────────────────────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: type === 'error' ? '#1a1a1a' : '#000',
      color: type === 'error' ? '#F97316' : '#fff',
      border: `2px solid ${type === 'error' ? '#F97316' : '#333'}`,
      borderRadius: 6, padding: '12px 20px', fontSize: 13, fontWeight: 700,
      boxShadow: '0 8px 32px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: "'DM Mono', monospace",
    }}>
      {type === 'error' ? <XCircle size={15} /> : <CheckCircle size={15} />}
      {msg}
    </div>
  );
}

/* ─── reject reason modal ───────────────────────────────────────── */
function RejectModal({ loanId, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  const [busy,   setBusy]   = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    setBusy(true);
    await onConfirm(loanId, reason.trim());
    setBusy(false);
  };

  return (
    <div style={M.overlay} onClick={onCancel}>
      <div
        style={{
          background: '#fff', borderRadius: 8, padding: 32,
          width: 440, maxWidth: '95vw',
          boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
          border: '1.5px solid #d1d5db',
          animation: 'fadeUp .25s ease both',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ background: '#F97316', borderRadius: 6, padding: '6px 8px', display:'flex' }}>
            <XCircle size={16} color="#fff" />
          </div>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 900, color: '#111', margin: 0 }}>
            Reject Loan #{loanId}
          </h3>
        </div>
        <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 16px', paddingLeft: 44 }}>
          Provide a reason. This will be recorded and may be communicated to the borrower.
        </p>

        <textarea
          autoFocus
          rows={4}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Insufficient income documentation…"
          style={{
            width: '100%', boxSizing: 'border-box',
            border: '2px solid #e5e7eb', borderRadius: 6,
            padding: '10px 14px', fontSize: 13, color: '#111',
            fontFamily: "'DM Sans', sans-serif", resize: 'vertical',
            outline: 'none', transition: 'border-color .15s',
          }}
          onFocus={e => { e.target.style.borderColor = '#F97316'; }}
          onBlur={e  => { e.target.style.borderColor = '#e5e7eb'; }}
        />

        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
          <button onClick={onCancel}
            style={{ padding: '9px 20px', background: '#f3f4f6', border: '1.5px solid #e5e7eb', borderRadius: 6, fontSize: 12, fontWeight: 700, color: '#374151', cursor: 'pointer', fontFamily:"'DM Sans',sans-serif" }}>
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={!reason.trim() || busy}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 20px',
              background: reason.trim() ? '#F97316' : '#fed7aa',
              border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 800,
              color: '#fff', cursor: reason.trim() ? 'pointer' : 'not-allowed',
              fontFamily:"'DM Sans',sans-serif", transition: 'background .15s',
            }}>
            {busy
              ? <><Loader2 size={12} style={{ animation: 'spin .8s linear infinite' }} /> Rejecting…</>
              : <><XCircle size={12} /> Confirm Reject</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── loan detail modal ─────────────────────────────────────────── */
function LoanModal({ loanId, onClose }) {
  const [detail,   setDetail]   = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [history,  setHistory]  = useState([]);
  const [tab,      setTab]      = useState('schedule');
  const [loading,  setLoading]  = useState(true);
  const [fetchErr, setFetchErr] = useState(null);

  useEffect(() => {
    if (!loanId) return;
    setLoading(true); setFetchErr(null); setDetail(null); setSchedule([]); setHistory([]);
    const safeFetch = (url) =>
      fetch(url, { headers: authHeader() }).then(r => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      });
    safeFetch(`${BASE}/loan_app/loan/${loanId}/`)
      .then(d => {
        setDetail(d);
        return Promise.allSettled([
          safeFetch(`${BASE}/loan_app/loan/${loanId}/payment-schedule/`),
          safeFetch(`${BASE}/loan_app/loan/${loanId}/payment-history/`),
        ]);
      })
      .then(results => {
        if (!results) return;
        const [sRes, hRes] = results;
        if (sRes.status === 'fulfilled') { const s = sRes.value; setSchedule(Array.isArray(s) ? s : s.schedule || s.results || []); }
        if (hRes.status === 'fulfilled') { const h = hRes.value; setHistory(Array.isArray(h) ? h : h.history || h.results || []); }
      })
      .catch(err => setFetchErr(err.message || 'Failed to load loan details.'))
      .finally(() => setLoading(false));
  }, [loanId]);

  const borrowerName = detail ? getBorrowerName(detail) : '—';

  return (
    <div style={M.overlay} onClick={onClose}>
      <div style={M.box} onClick={e => e.stopPropagation()}>
        <div style={M.head}>
          <div>
            <h3 style={M.title}>Loan #{loanId}</h3>
            {detail && <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{borrowerName}</p>}
          </div>
          <button onClick={onClose} style={M.closeBtn}>✕</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>
            <Loader2 size={28} style={{ animation: 'spin 0.8s linear infinite', color: '#F97316' }} />
            <p style={{ marginTop: 12, fontSize: 13 }}>Loading loan details…</p>
          </div>
        ) : fetchErr ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <AlertTriangle size={28} color="#F97316" />
            <p style={{ color: '#F97316', fontSize: 13, marginTop: 10 }}>{fetchErr}</p>
            <p style={{ color: '#9ca3af', fontSize: 12 }}>Check that loan #{loanId} exists and you have permission.</p>
          </div>
        ) : detail ? (
          <>
            <div style={M.strip}>
              {[
                ['Borrower',  borrowerName],
                ['Amount',    fmt(detail.amount)],
                ['Balance',   fmt(detail.current_balance)],
                ['Repayable', fmt(detail.total_repayable)],
                ['Status',    detail.status],
              ].map(([k, v]) => (
                <div key={k} style={M.stripItem}>
                  <p style={M.stripLabel}>{k}</p>
                  {k === 'Status' ? <Pill status={v} /> : <p style={M.stripVal}>{v}</p>}
                </div>
              ))}
            </div>

            <div style={M.tabs}>
              {['schedule', 'history'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ ...M.tab, ...(tab === t ? M.tabActive : {}) }}>
                  {t === 'schedule' ? 'Payment Schedule' : 'Payment History'}
                </button>
              ))}
            </div>

            <div style={M.tableWrap}>
              {tab === 'schedule' && (
                schedule.length === 0
                  ? <p style={{ color: '#9ca3af', textAlign: 'center', padding: 28, fontSize: 13 }}>No schedule available</p>
                  : (
                    <table style={M.table}>
                      <thead><tr>{['#','Due Date','Principal','Interest','Amount','Status'].map(h => <th key={h} style={M.th}>{h}</th>)}</tr></thead>
                      <tbody>
                        {schedule.map((s, i) => (
                          <tr key={i} style={M.tr}>
                            <td style={M.td}>{s.installment_number || i + 1}</td>
                            <td style={M.td}>{fmtDate(s.due_date)}</td>
                            <td style={M.td}>{fmt(s.principal)}</td>
                            <td style={M.td}>{fmt(s.interest)}</td>
                            <td style={{ ...M.td, fontWeight: 700 }}>{fmt(s.amount || s.total_amount)}</td>
                            <td style={M.td}><Pill status={s.status || 'Pending'} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
              )}
              {tab === 'history' && (
                history.length === 0
                  ? <p style={{ color: '#9ca3af', textAlign: 'center', padding: 28, fontSize: 13 }}>No payment history yet</p>
                  : (
                    <table style={M.table}>
                      <thead><tr>{['Date','Amount Paid','Method','Reference'].map(h => <th key={h} style={M.th}>{h}</th>)}</tr></thead>
                      <tbody>
                        {history.map((p, i) => (
                          <tr key={i} style={M.tr}>
                            <td style={M.td}>{fmtDate(p.payment_date || p.date)}</td>
                            <td style={{ ...M.td, color: '#111', fontWeight: 700 }}>{fmt(p.amount)}</td>
                            <td style={M.td}>{p.payment_method || p.method || '—'}</td>
                            <td style={{ ...M.td, fontFamily: 'monospace', fontSize: 11 }}>{p.reference || p.transaction_id || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

const M = {
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  box:        { background: '#fff', borderRadius: 8, border: '1.5px solid #d1d5db', width: '100%', maxWidth: 780, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 12px 40px rgba(0,0,0,0.14)' },
  head:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '18px 24px', borderBottom: '2px solid #000', background: '#222' },
  title:      { fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 900, color: '#fff', margin: '0 0 2px' },
  closeBtn:   { background: '#F97316', border: 'none', borderRadius: 4, width: 30, height: 30, cursor: 'pointer', fontSize: 14, color: '#fff', fontWeight: 800, flexShrink: 0 },
  strip:      { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 1, background: '#222', borderBottom: '2px solid #000' },
  stripItem:  { background: '#fff', padding: '14px 16px' },
  stripLabel: { fontSize: 9, color: '#9ca3af', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 },
  stripVal:   { fontSize: 13, fontWeight: 800, color: '#111', margin: 0 },
  tabs:       { display: 'flex', padding: '0 24px', borderBottom: '2px solid #000', background: '#f9fafb' },
  tab:        { padding: '12px 20px', background: 'none', border: 'none', borderBottom: '3px solid transparent', fontSize: 12, fontWeight: 700, color: '#9ca3af', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em' },
  tabActive:  { borderBottomColor: '#F97316', color: '#111' },
  tableWrap:  { overflowY: 'auto', flex: 1 },
  table:      { width: '100%', borderCollapse: 'collapse' },
  th:         { padding: '10px 18px', textAlign: 'left', fontSize: 9, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', background: '#f9fafb', position: 'sticky', top: 0, borderBottom: '1px solid #e5e7eb' },
  tr:         { borderTop: '1px solid #f3f4f6' },
  td:         { padding: '12px 18px', fontSize: 13, color: '#374151' },
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function LoanOverview() {
  const { loans = [], loading: ctxLoading, error: ctxError } = useContext(LoansContext);

  const [loans2,       setLoans2]       = useState([]);
  const [apiLoading,   setApiLoading]   = useState(true);
  const [userStatus,   setUserStatus]   = useState(null);
  const [modalId,      setModalId]      = useState(null);
  const [toast,        setToast]        = useState(null);
  const [actionBusy,   setActionBusy]   = useState({});
  const [rejectTarget, setRejectTarget] = useState(null);

  const allLoans  = loans2.length ? loans2 : loans;
  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const fetchLoans = useCallback(async () => {
    setApiLoading(true);
    try {
      const r = await fetch(`${BASE}/loan_app/loans/list/`, { headers: authHeader() });
      if (r.ok) {
        const d = await r.json();
        setLoans2(Array.isArray(d) ? d : d.loans || d.results || []);
      }
    } catch (e) { console.error(e); }
    finally { setApiLoading(false); }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/loan_app/user-loan-status/`, { headers: authHeader() });
      if (r.ok) setUserStatus(await r.json());
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchLoans(); fetchStatus(); }, []);

  const doAction = async (loanId, action, reason = '') => {
    setActionBusy(p => ({ ...p, [loanId]: action }));
    try {
      const body = {};
      if (reason) body.reason = reason;
      const r = await fetch(`${BASE}/loan_app/${loanId}/${action}/`, {
        method: 'POST', headers: authHeader(), body: JSON.stringify(body),
      });
      if (r.ok) { showToast(`Loan ${action}d successfully`); fetchLoans(); }
      else {
        const d = await r.json().catch(() => ({}));
        showToast(d.detail || d.message || `Failed to ${action} loan`, 'error');
      }
    } catch { showToast('Network error', 'error'); }
    finally { setActionBusy(p => ({ ...p, [loanId]: null })); }
  };

  const handleRejectConfirm = async (loanId, reason) => {
    await doAction(loanId, 'reject', reason);
    setRejectTarget(null);
  };

  const now = new Date();
  const stats = {
    active:      allLoans.filter(l => l.status === 'Active').length,
    pending:     allLoans.filter(l => l.status === 'Pending').length,
    overdue:     allLoans.filter(l => l.next_payment_date && new Date(l.next_payment_date) < now).length,
    principal:   allLoans.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0),
    outstanding: allLoans.reduce((s, l) => s + (parseFloat(l.current_balance) || 0), 0),
    repaid:      allLoans.reduce((s, l) => s + ((parseFloat(l.total_repayable) || 0) - (parseFloat(l.current_balance) || 0)), 0),
    repayable:   allLoans.reduce((s, l) => s + (parseFloat(l.total_repayable) || 0), 0),
    interest:    allLoans.reduce((s, l) => s + ((parseFloat(l.total_repayable) || 0) - (parseFloat(l.amount) || 0)), 0),
  };
  const repaidPct = stats.repayable > 0 ? Math.round((stats.repaid / stats.repayable) * 100) : 0;
  const loading   = (ctxLoading || apiLoading) && allLoans.length === 0;

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Loader2 size={32} style={{ color: '#F97316', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#6b7280', fontSize: 13 }}>Loading portfolio data…</p>
    </div>
  );

  if (ctxError && allLoans.length === 0) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <AlertTriangle size={32} color="#F97316" />
      <p style={{ color: '#F97316', fontSize: 13 }}>{ctxError}</p>
      <button onClick={fetchLoans}
        style={{ padding: '9px 20px', background: '#222', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
        Retry
      </button>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Syne:wght@700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .lo-card       { animation:fadeUp .4s ease both; transition:box-shadow .18s,transform .18s; }
        .lo-card:hover { transform:translateY(-2px); }
        .lo-row:hover  { background:#FFF7ED !important; }
        .lo-btn        { transition:opacity .12s,transform .12s; }
        .lo-btn:hover  { opacity:0.85; transform:translateY(-1px); }
        .animate-spin  { animation:spin 0.8s linear infinite; }
      `}</style>

      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f9fafb', minHeight: '100vh', padding: '24px 20px 56px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, animation: 'fadeUp .35s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ background: '#F97316', borderRadius: 8, padding: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              <img src={loanIcon} alt="Loans" style={{ width: 26, height: 26, display: 'block', filter: 'brightness(0) invert(1)' }} />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, color: '#F97316', letterSpacing: '0.18em', textTransform: 'uppercase', margin: 0 }}>Finance</p>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 900, color: '#111', margin: 0, letterSpacing: '-0.02em' }}>Loan Portfolio</h1>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {userStatus && (
              <div style={{ background: '#fff', border: '1.5px solid #d1d5db', borderRadius: 6, padding: '7px 14px', fontSize: 12, color: '#374151', fontWeight: 600, boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
                My Status:&nbsp;<strong style={{ color: '#F97316' }}>{userStatus.status || userStatus.loan_status || 'N/A'}</strong>
              </div>
            )}
            <button onClick={fetchLoans} disabled={apiLoading} className="lo-btn"
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#222', color: '#fff', border: '1.5px solid #d1d5db', borderRadius: 6, fontSize: 12, fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 10px rgba(249,115,22,0.25)', letterSpacing: '0.04em' }}>
              <RefreshCw size={13} style={apiLoading ? { animation: 'spin .8s linear infinite' } : {}} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Hero Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14, marginBottom: 14 }}>

          {/* Principal — black card */}
          <div className="lo-card" style={{
            background: '#1f2937', borderRadius: 10, padding: '26px 28px',
            boxShadow: '0 4px 20px rgba(249,115,22,0.28)', animationDelay: '0ms',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* decorative stripe */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: 6, height: '100%', background: '#F97316' }} />
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.16em', margin: '0 0 2px' }}>Total Principal Disbursed</p>
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{allLoans.length} loan{allLoans.length !== 1 ? 's' : ''} in portfolio</p>
            </div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
              <Counter value={stats.principal} prefix="UGX " />
            </h2>
          </div>

          {/* Repayment Ring — white card */}
          <div className="lo-card" style={{ background: '#fff', border: '1.5px solid #d1d5db', borderRadius: 10, padding: 22, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', animationDelay: '60ms' }}>
            <p style={{ fontSize: 9, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 16px' }}>Repayment Progress</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Ring pct={repaidPct} size={76} stroke={7} color="#F97316" />
                <span style={{ position: 'absolute', fontSize: 15, fontWeight: 900, color: '#111', fontFamily: "'Syne', sans-serif" }}>{repaidPct}%</span>
              </div>
              <div>
                <div style={{ marginBottom: 10 }}>
                  <p style={{ color: '#9ca3af', margin: '0 0 1px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Repaid</p>
                  <p style={{ color: '#111', fontWeight: 800, margin: 0, fontSize: 13 }}>{fmtShort(stats.repaid)}</p>
                </div>
                <div>
                  <p style={{ color: '#9ca3af', margin: '0 0 1px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Outstanding</p>
                  <p style={{ color: '#F97316', fontWeight: 800, margin: 0, fontSize: 13 }}>{fmtShort(stats.outstanding)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interest — white card */}
          <div className="lo-card" style={{ background: '#fff', border: '1.5px solid #d1d5db', borderRadius: 10, padding: 22, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', animationDelay: '100ms' }}>
            <p style={{ fontSize: 9, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 10px' }}>Interest Earned</p>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 900, color: '#111', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
              {fmtShort(stats.interest)}
            </h3>
            <div style={{ height: 5, background: '#f3f4f6', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{
                height: '100%', background: '#F97316', borderRadius: 2,
                width: `${stats.principal > 0 ? Math.min(100, (stats.interest / stats.principal) * 100) : 0}%`,
                transition: 'width 1.2s ease',
              }} />
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, fontFamily: "'DM Mono', monospace" }}>
              {stats.principal > 0 ? `${((stats.interest / stats.principal) * 100).toFixed(1)}% yield on principal` : '—'}
            </p>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Active Loans',      val: stats.active,      icon: Users,         accent: '#374151', isNum: true  },
            { label: 'Outstanding',       val: stats.outstanding, icon: TrendingUp,    accent: '#F97316', isNum: false },
            { label: 'Total Repaid',      val: stats.repaid,      icon: CheckCircle,   accent: '#374151', isNum: false },
            { label: 'Pending Approvals', val: stats.pending,     icon: Clock,         accent: '#F97316', isNum: true  },
            { label: 'Overdue Loans',     val: stats.overdue,     icon: AlertTriangle, accent: '#F97316', isNum: true  },
          ].map((c, i) => (
            <div key={i} className="lo-card"
              style={{ background: '#fff', border: '1.5px solid #d1d5db', borderRadius: 8, padding: '16px 18px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', animationDelay: `${140 + i * 40}ms` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <p style={{ fontSize: 9, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{c.label}</p>
                <div style={{ background: c.accent, borderRadius: 5, padding: 6 }}><c.icon size={13} color="#fff" /></div>
              </div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 900, color: c.accent, margin: 0, letterSpacing: '-0.02em' }}>
                {c.isNum ? <Counter value={c.val} /> : fmtShort(c.val)}
              </p>
            </div>
          ))}
        </div>

        {/* ── Loans Table ── */}
        <div style={{ background: '#fff', border: '1.5px solid #d1d5db', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 20, animation: 'fadeUp .5s ease both', animationDelay: '320ms' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '2px solid #000', background: '#222' }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>All Loans</h3>
            <span style={{ fontSize: 11, color: '#F97316', background: '#222', padding: '3px 12px', borderRadius: 4, fontWeight: 800, fontFamily: "'DM Mono', monospace" }}>
              {allLoans.length} records
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #000' }}>
                  {['Borrower', 'Principal', 'Balance', 'Repayable', 'Status', 'Next Payment', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 18px', textAlign: 'left', fontSize: 9, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allLoans.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 36, color: '#9ca3af', fontSize: 13 }}>No loans found</td></tr>
                ) : allLoans.map((loan, i) => {
                  const isOverdue   = loan.next_payment_date && new Date(loan.next_payment_date) < now;
                  const statusLabel = isOverdue && loan.status === 'Active' ? 'Overdue' : (loan.status || 'Unknown');
                  const busy        = actionBusy[loan.id];
                  const name        = getBorrowerName(loan);
                  const initial     = getBorrowerInitial(loan);

                  return (
                    <tr key={loan.id || i} className="lo-row" style={{ borderTop: '1px solid #f3f4f6', transition: 'background .1s' }}>

                      {/* Borrower */}
                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 4, background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#F97316', flexShrink: 0, fontFamily: "'Syne',sans-serif" }}>
                            {initial}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: 0 }}>{name}</p>
                            <p style={{ fontSize: 10, color: '#9ca3af', margin: 0, fontFamily: "'DM Mono', monospace" }}>#{loan.id}</p>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '13px 18px', fontSize: 13, color: '#374151', fontWeight: 600 }}>{fmt(parseFloat(loan.amount) || 0)}</td>
                      <td style={{ padding: '13px 18px', fontSize: 13, fontWeight: 800, color: parseFloat(loan.current_balance) > 0 ? '#F97316' : '#000' }}>{fmt(parseFloat(loan.current_balance) || 0)}</td>
                      <td style={{ padding: '13px 18px', fontSize: 13, color: '#374151' }}>{fmt(parseFloat(loan.total_repayable) || 0)}</td>
                      <td style={{ padding: '13px 18px' }}><Pill status={statusLabel} /></td>
                      <td style={{ padding: '13px 18px', fontSize: 12, color: isOverdue ? '#F97316' : '#6b7280', fontWeight: isOverdue ? 800 : 500, fontFamily: "'DM Mono', monospace" }}>
                        {fmtDate(loan.next_payment_date)}
                      </td>

                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>

                          {/* View */}
                          <button onClick={() => setModalId(loan.id)} className="lo-btn"
                            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 11px', background: '#fff', border: '1.5px solid #d1d5db', borderRadius: 5, fontSize: 11, fontWeight: 700, color: '#111', cursor: 'pointer' }}>
                            <Eye size={11} /> View
                          </button>

                          {loan.status === 'Pending' && (
                            <button onClick={() => doAction(loan.id, 'approve')} disabled={!!busy} className="lo-btn"
                              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 11px', background: '#374151', border: '1.5px solid #374151', borderRadius: 5, fontSize: 11, fontWeight: 700, color: '#fff', cursor: 'pointer', opacity: busy ? 0.5 : 1 }}>
                              {busy === 'approve' ? <Loader2 size={11} style={{ animation: 'spin .8s linear infinite' }} /> : <CheckCircle size={11} />}
                              Approve
                            </button>
                          )}

                          {loan.status === 'Pending' && (
                            <button onClick={() => setRejectTarget(loan.id)} disabled={!!busy} className="lo-btn"
                              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 11px', background: '#F97316', border: '1.5px solid #F97316', borderRadius: 5, fontSize: 11, fontWeight: 700, color: '#fff', cursor: 'pointer', opacity: busy ? 0.5 : 1 }}>
                              {busy === 'reject' ? <Loader2 size={11} style={{ animation: 'spin .8s linear infinite' }} /> : <XCircle size={11} />}
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Loan Repayments ── */}
        <div style={{ background: '#fff', border: '1.5px solid #d1d5db', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', animation: 'fadeUp .5s ease both', animationDelay: '380ms' }}>
          <LoanRepayments />
        </div>

      </div>

      {modalId && <LoanModal loanId={modalId} onClose={() => setModalId(null)} />}

      {rejectTarget && (
        <RejectModal
          loanId={rejectTarget}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}