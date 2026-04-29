import React, { useState, useEffect, useMemo, useCallback } from "react";
import { format, parseISO } from "date-fns";
import {
  Search,
  RefreshCw,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
  X,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3,
} from "lucide-react";

import Sidebar from "../components/sidebar";
import Header from "../components/header";
import { getTransactions, getTransactionStatus } from "../api.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

const parseDateSafe = (value) => {
  if (!value) return null;
  try {
    const d = value instanceof Date ? value : parseISO(String(value));
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

const fmtDate = (value) => {
  const d = parseDateSafe(value);
  return d ? format(d, "MMM d, yyyy · HH:mm") : "—";
};

const fmtAmount = (amount) =>
  `UGX ${Number(amount || 0).toLocaleString("en-UG")}`;

const STATUS_META = {
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    ring: "ring-emerald-200",
  },
  successful: {
    label: "Successful",
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    ring: "ring-emerald-200",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
    ring: "ring-amber-200",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    ring: "ring-blue-200",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
    ring: "ring-red-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    bg: "bg-gray-50",
    text: "text-gray-600",
    dot: "bg-gray-400",
    ring: "ring-gray-200",
  },
  refunded: {
    label: "Refunded",
    icon: ArrowDownLeft,
    bg: "bg-violet-50",
    text: "text-violet-700",
    dot: "bg-violet-500",
    ring: "ring-violet-200",
  },
};

const getStatusMeta = (status) =>
  STATUS_META[status?.toLowerCase()] ?? {
    label: status ?? "Unknown",
    icon: AlertCircle,
    bg: "bg-gray-50",
    text: "text-gray-500",
    dot: "bg-gray-400",
    ring: "ring-gray-200",
  };

const TYPE_META = {
  credit: { label: "Credit", icon: ArrowDownLeft, color: "text-emerald-600" },
  debit: { label: "Debit", icon: ArrowUpRight, color: "text-red-500" },
  payment: { label: "Payment", icon: ArrowUpRight, color: "text-blue-600" },
  payout: { label: "Payout", icon: ArrowDownLeft, color: "text-violet-600" },
  refund: { label: "Refund", icon: ArrowDownLeft, color: "text-orange-500" },
};

const getTypeMeta = (type) =>
  TYPE_META[type?.toLowerCase()] ?? {
    label: type ?? "Transaction",
    icon: Activity,
    color: "text-gray-500",
  };

// ─── StatusBadge ────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const meta = getStatusMeta(status);
  const Icon = meta.icon;
  const isSpinning = status?.toLowerCase() === "processing";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ring-1 ${meta.bg} ${meta.text} ${meta.ring}`}
    >
      <Icon className={`w-3.5 h-3.5 ${isSpinning ? "animate-spin" : ""}`} />
      {meta.label}
    </span>
  );
};

// ─── StatCard ────────────────────────────────────────────────────────────────

const StatCard = ({ title, value, sub, icon: Icon, gradient, iconBg, iconColor, change }) => (
  <div className="relative group">
    <div
      className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-20 group-hover:opacity-35 transition duration-500`}
    />
    <div className="relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 h-full">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {change && (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-green-50 rounded-full text-xs font-bold text-green-600">
            <TrendingUp className="w-3 h-3" />
            {change}
          </span>
        )}
      </div>
      <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  </div>
);

// ─── TransactionDetail Modal ──────────────────────────────────────────────────

const DetailRow = ({ label, value, mono }) => (
  <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500 font-medium w-40 shrink-0">{label}</span>
    <span className={`text-sm text-gray-900 text-right ${mono ? "font-mono" : "font-semibold"}`}>
      {value ?? "—"}
    </span>
  </div>
);

const TransactionModal = ({ tx, onClose, onRefreshStatus, statusLoading }) => {
  if (!tx) return null;
  const typeMeta = getTypeMeta(tx.transaction_type || tx.type);
  const TypeIcon = typeMeta.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10">
              <TypeIcon className={`w-5 h-5 text-white`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Transaction Detail</h2>
              <p className="text-slate-300 text-xs font-mono mt-0.5">
                #{tx.id || tx.transaction_id || "—"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Hero */}
        <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Amount</p>
            <p className="text-3xl font-extrabold text-gray-900">{fmtAmount(tx.amount)}</p>
          </div>
          <StatusBadge status={tx.status} />
        </div>

        {/* Details */}
        <div className="px-8 py-4 max-h-80 overflow-y-auto">
          <DetailRow label="Reference" value={tx.reference || tx.transaction_ref} mono />
          <DetailRow label="Type" value={typeMeta.label} />
          <DetailRow label="Description" value={tx.description || tx.narration} />
          <DetailRow label="Payer" value={tx.payer_name || tx.sender} />
          <DetailRow label="Payee" value={tx.payee_name || tx.receiver} />
          <DetailRow label="Method" value={tx.payment_method || tx.channel} />
          <DetailRow label="Currency" value={tx.currency ?? "UGX"} />
          <DetailRow label="Date" value={fmtDate(tx.created_at || tx.timestamp)} />
          <DetailRow label="Updated" value={fmtDate(tx.updated_at)} />
        </div>

        {/* Actions */}
        <div className="px-8 py-5 flex justify-end gap-3 bg-gray-50 border-t border-gray-100">
          <button
            onClick={() => onRefreshStatus(tx)}
            disabled={statusLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:border-slate-400 hover:bg-slate-50 transition disabled:opacity-50"
          >
            {statusLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh Status
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");

  // Sort
  const [sortField, setSortField] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  // Pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  // Modal
  const [selectedTx, setSelectedTx] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchTransactions = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const data = await getTransactions();
      const list = Array.isArray(data) ? data : data?.results ?? [];
      setTransactions(list);
    } catch (err) {
      setError(err.message || "Failed to load transactions.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // ── Refresh single status ────────────────────────────────────────────────

  const handleRefreshStatus = async (tx) => {
    setStatusLoading(true);
    try {
      const result = await getTransactionStatus({
        transaction_id: tx.id || tx.transaction_id,
        reference: tx.reference || tx.transaction_ref,
      });
      if (result) {
        setTransactions((prev) =>
          prev.map((t) =>
            (t.id || t.transaction_id) === (tx.id || tx.transaction_id)
              ? { ...t, status: result.status ?? t.status }
              : t
          )
        );
        if (selectedTx) {
          setSelectedTx((prev) => ({ ...prev, status: result.status ?? prev.status }));
        }
      }
    } catch (err) {
      console.error("Status refresh failed:", err);
    } finally {
      setStatusLoading(false);
    }
  };

  // ── Derived data ─────────────────────────────────────────────────────────

  const allStatuses = useMemo(() => {
    const s = new Set(transactions.map((t) => t.status?.toLowerCase()).filter(Boolean));
    return ["all", ...Array.from(s)];
  }, [transactions]);

  const allTypes = useMemo(() => {
    const t = new Set(
      transactions
        .map((t) => (t.transaction_type || t.type)?.toLowerCase())
        .filter(Boolean)
    );
    return ["all", ...Array.from(t)];
  }, [transactions]);

  const isInDateRange = useCallback(
    (dateValue) => {
      const d = parseDateSafe(dateValue);
      if (!d) return false;
      const now = new Date();
      if (dateFilter === "today") {
        return d.toDateString() === now.toDateString();
      }
      if (dateFilter === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return d >= weekAgo;
      }
      if (dateFilter === "month") {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (dateFilter === "custom" && customDate) {
        const cd = parseISO(customDate);
        return d.toDateString() === cd.toDateString();
      }
      return true;
    },
    [dateFilter, customDate]
  );

  const filtered = useMemo(() => {
    let list = [...transactions];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          String(t.id || t.transaction_id || "").toLowerCase().includes(q) ||
          String(t.reference || t.transaction_ref || "").toLowerCase().includes(q) ||
          String(t.description || t.narration || "").toLowerCase().includes(q) ||
          String(t.payer_name || t.sender || "").toLowerCase().includes(q) ||
          String(t.payee_name || t.receiver || "").toLowerCase().includes(q) ||
          String(t.amount || "").includes(q)
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((t) => t.status?.toLowerCase() === statusFilter);
    }

    if (typeFilter !== "all") {
      list = list.filter(
        (t) => (t.transaction_type || t.type)?.toLowerCase() === typeFilter
      );
    }

    if (dateFilter !== "all") {
      list = list.filter((t) => isInDateRange(t.created_at || t.timestamp || t.date));
    }

    list.sort((a, b) => {
      let av = a[sortField] ?? "";
      let bv = b[sortField] ?? "";
      if (sortField === "amount") {
        av = Number(av);
        bv = Number(bv);
      } else if (sortField === "created_at") {
        av = parseDateSafe(av)?.getTime() ?? 0;
        bv = parseDateSafe(bv)?.getTime() ?? 0;
      }
      return sortDir === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
    });

    return list;
  }, [transactions, search, statusFilter, typeFilter, dateFilter, customDate, sortField, sortDir, isInDateRange]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Stats ─────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = transactions.length;
    const totalVolume = transactions.reduce((s, t) => s + Number(t.amount || 0), 0);
    const completed = transactions.filter(
      (t) => ["completed", "successful"].includes(t.status?.toLowerCase())
    ).length;
    const pending = transactions.filter(
      (t) => t.status?.toLowerCase() === "pending"
    ).length;
    return { total, totalVolume, completed, pending };
  }, [transactions]);

  // ── Sort toggle ───────────────────────────────────────────────────────────

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }) =>
    sortField === field ? (
      sortDir === "asc" ? (
        <ChevronUp className="w-4 h-4 text-blue-500" />
      ) : (
        <ChevronDown className="w-4 h-4 text-blue-500" />
      )
    ) : (
      <ChevronDown className="w-4 h-4 text-gray-300" />
    );

  // ── CSV Export ────────────────────────────────────────────────────────────

  const exportCSV = () => {
    const headers = ["ID", "Reference", "Type", "Amount", "Status", "Description", "Date"];
    const rows = filtered.map((t) => [
      t.id || t.transaction_id || "",
      t.reference || t.transaction_ref || "",
      t.transaction_type || t.type || "",
      t.amount || 0,
      t.status || "",
      t.description || t.narration || "",
      fmtDate(t.created_at || t.timestamp),
    ]);
    const csv = [headers, ...rows].map((r) => r.map(String).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-600">Loading transactions…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen font-poppins flex flex-col bg-gray-50">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ml-[80px]">
          <div className="p-8">
            {/* ── Page Title ── */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-1">
                  Transactions
                </h1>
                <p className="text-gray-500 text-sm">
                  {filtered.length.toLocaleString()} of {transactions.length.toLocaleString()} records
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchTransactions(true)}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:border-blue-400 hover:text-blue-600 transition"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </button>
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-700 transition shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* ── Error Banner ── */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">{error}</span>
                <button
                  onClick={() => fetchTransactions()}
                  className="ml-auto text-sm font-semibold underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
              <StatCard
                title="Total Transactions"
                value={stats.total.toLocaleString()}
                icon={BarChart3}
                gradient="from-blue-500 to-indigo-500"
                iconBg="from-blue-100 to-indigo-100"
                iconColor="text-blue-600"
              />
              <StatCard
                title="Total Volume"
                value={`UGX ${(stats.totalVolume / 1_000_000).toFixed(1)}M`}
                sub="across all transactions"
                icon={DollarSign}
                gradient="from-emerald-500 to-teal-500"
                iconBg="from-emerald-100 to-teal-100"
                iconColor="text-emerald-600"
                change="+12.4%"
              />
              <StatCard
                title="Completed"
                value={stats.completed.toLocaleString()}
                sub={`${((stats.completed / Math.max(stats.total, 1)) * 100).toFixed(1)}% success rate`}
                icon={CheckCircle2}
                gradient="from-green-500 to-emerald-500"
                iconBg="from-green-100 to-emerald-100"
                iconColor="text-green-600"
              />
              <StatCard
                title="Pending"
                value={stats.pending.toLocaleString()}
                sub="awaiting confirmation"
                icon={Clock}
                gradient="from-amber-400 to-orange-500"
                iconBg="from-amber-100 to-orange-100"
                iconColor="text-amber-600"
              />
            </div>

            {/* ── Filters ── */}
            <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md border border-gray-200/60 p-5 mb-6">
              <div className="flex flex-wrap gap-4 items-end">
                {/* Search */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search ID, reference, name…"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-500 bg-gray-50"
                  />
                </div>

                {/* Status */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="appearance-none pl-8 pr-8 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:border-blue-500 bg-gray-50 cursor-pointer capitalize"
                  >
                    {allStatuses.map((s) => (
                      <option key={s} value={s} className="capitalize">
                        {s === "all" ? "All Statuses" : s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Type */}
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <select
                    value={typeFilter}
                    onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                    className="appearance-none pl-8 pr-8 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:border-blue-500 bg-gray-50 cursor-pointer capitalize"
                  >
                    {allTypes.map((t) => (
                      <option key={t} value={t} className="capitalize">
                        {t === "all" ? "All Types" : t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Date Range */}
                <div className="relative">
                  <select
                    value={dateFilter}
                    onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
                    className="appearance-none px-4 pr-8 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:border-blue-500 bg-gray-50 cursor-pointer"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">This Month</option>
                    <option value="custom">Custom Date</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Custom date picker */}
                {dateFilter === "custom" && (
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border-2 border-blue-400 text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-600 bg-gray-50"
                  />
                )}

                {/* Reset */}
                {(search || statusFilter !== "all" || typeFilter !== "all" || dateFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                      setTypeFilter("all");
                      setDateFilter("all");
                      setCustomDate("");
                      setPage(1);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 border-2 border-red-100 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* ── Table ── */}
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden">
              {paginated.length === 0 ? (
                <div className="py-24 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-semibold text-lg">No transactions found</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-100">
                        {[
                          { label: "ID / Reference", field: null },
                          { label: "Type", field: null },
                          { label: "Description", field: null },
                          { label: "Amount", field: "amount" },
                          { label: "Status", field: null },
                          { label: "Date", field: "created_at" },
                          { label: "", field: null },
                        ].map(({ label, field }, i) => (
                          <th
                            key={i}
                            onClick={() => field && toggleSort(field)}
                            className={`px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider ${
                              field ? "cursor-pointer hover:text-gray-700 select-none" : ""
                            }`}
                          >
                            <span className="flex items-center gap-1">
                              {label}
                              {field && <SortIcon field={field} />}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {paginated.map((tx, idx) => {
                        const typeMeta = getTypeMeta(tx.transaction_type || tx.type);
                        const TypeIcon = typeMeta.icon;
                        const isPositive = ["credit", "refund", "payout"].includes(
                          (tx.transaction_type || tx.type)?.toLowerCase()
                        );
                        return (
                          <tr
                            key={tx.id || tx.transaction_id || idx}
                            className="hover:bg-blue-50/40 transition-colors group"
                          >
                            {/* ID */}
                            <td className="px-5 py-4">
                              <p className="font-mono text-xs text-gray-700 font-semibold">
                                #{tx.id || tx.transaction_id || "—"}
                              </p>
                              {(tx.reference || tx.transaction_ref) && (
                                <p className="text-xs text-gray-400 font-mono mt-0.5">
                                  {tx.reference || tx.transaction_ref}
                                </p>
                              )}
                            </td>

                            {/* Type */}
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center gap-1.5 font-semibold ${typeMeta.color}`}>
                                <TypeIcon className="w-3.5 h-3.5" />
                                {typeMeta.label}
                              </span>
                            </td>

                            {/* Description */}
                            <td className="px-5 py-4">
                              <p className="text-gray-700 font-medium max-w-[200px] truncate">
                                {tx.description || tx.narration || "—"}
                              </p>
                              {(tx.payer_name || tx.sender) && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {tx.payer_name || tx.sender}
                                </p>
                              )}
                            </td>

                            {/* Amount */}
                            <td className="px-5 py-4">
                              <span
                                className={`text-base font-extrabold ${
                                  isPositive ? "text-emerald-600" : "text-gray-900"
                                }`}
                              >
                                {isPositive ? "+" : ""}
                                {fmtAmount(tx.amount)}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-5 py-4">
                              <StatusBadge status={tx.status} />
                            </td>

                            {/* Date */}
                            <td className="px-5 py-4 text-gray-500 text-xs font-medium whitespace-nowrap">
                              {fmtDate(tx.created_at || tx.timestamp || tx.date)}
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                <button
                                  onClick={() => setSelectedTx(tx)}
                                  className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition"
                                  title="View details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRefreshStatus(tx)}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition"
                                  title="Refresh status"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <p className="text-sm text-gray-500 font-medium">
                    Showing {(page - 1) * PAGE_SIZE + 1}–
                    {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pg =
                        totalPages <= 5
                          ? i + 1
                          : page <= 3
                          ? i + 1
                          : page >= totalPages - 2
                          ? totalPages - 4 + i
                          : page - 2 + i;
                      return (
                        <button
                          key={pg}
                          onClick={() => setPage(pg)}
                          className={`w-9 h-9 rounded-lg text-sm font-bold transition ${
                            pg === page
                              ? "bg-blue-600 text-white shadow"
                              : "border-2 border-gray-200 text-gray-600 hover:border-blue-400"
                          }`}
                        >
                          {pg}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-lg border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Detail Modal ── */}
      {selectedTx && (
        <TransactionModal
          tx={selectedTx}
          onClose={() => setSelectedTx(null)}
          onRefreshStatus={handleRefreshStatus}
          statusLoading={statusLoading}
        />
      )}
    </div>
  );
};

export default TransactionsPage;