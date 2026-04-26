import React, { useState, useEffect, useCallback } from "react";
import {
  MessageCircle,
  Plus,
  ChevronLeft,
  Send,
  Lock,
  CheckCircle,
  Clock,
  AlertCircle,
  Tag,
  User,
  Calendar,
  Filter,
  X,
  RefreshCw,
} from "lucide-react";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import { authFetch } from "../api"; // ✅ use your central authFetch

// ─── API helpers (all use authFetch so token key & scheme are consistent) ─────
const api = {
  getTickets: () => authFetch("/support/tickets/"),
  getTicket: (id) => authFetch(`/support/tickets/${id}/`),
  createTicket: (body) =>
    authFetch("/support/tickets/", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  replyTicket: (id, body) =>
    authFetch(`/support/tickets/${id}/reply/`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  resolveTicket: (id) =>
    authFetch(`/support/tickets/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({ status: "resolved" }),
    }),
};

// ─── Helper: check admin from stored user object ──────────────────────────────
const getIsAdmin = () => {
  const roleFlag = localStorage.getItem("isAdmin");
  if (roleFlag === "true") return true;

  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return !!(user.is_staff || user.is_superuser || user.role === "admin");
  } catch (_) {}

  // Decode JWT if present
  const token = localStorage.getItem("authToken");
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      return !!(payload.is_staff || payload.is_superuser || payload.role === "admin");
    }
  } catch (_) {}

  return false;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIORITY_STYLES = {
  high: "bg-red-50 text-red-700 border border-red-200",
  medium: "bg-amber-50 text-amber-700 border border-amber-200",
  low: "bg-gray-100 text-gray-600 border border-gray-200",
};

const STATUS_STYLES = {
  open: "bg-blue-50 text-blue-700 border border-blue-200",
  resolved: "bg-green-50 text-green-700 border border-green-200",
  pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  in_progress: "bg-purple-50 text-purple-700 border border-purple-200",
};

const CATEGORIES = ["order", "billing", "technical", "shipping", "other"];
const PRIORITIES = ["low", "medium", "high"];

// ─── Sub-components ──────────────────────────────────────────────────────────
const Badge = ({ className, children }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${className}`}
  >
    {children}
  </span>
);

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
  </div>
);

// ─── New Ticket Modal ─────────────────────────────────────────────────────────
const NewTicketModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    subject: "",
    category: "order",
    priority: "medium",
    initial_message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.initial_message.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const ticket = await api.createTicket(form);
      if (ticket?.id) {
        onCreated(ticket);
      } else {
        setError("Unexpected response from server. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Failed to create ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">New Support Ticket</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Brief description of your issue"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 capitalize"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 capitalize"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Message
            </label>
            <textarea
              rows={5}
              value={form.initial_message}
              onChange={(e) =>
                setForm({ ...form, initial_message: e.target.value })
              }
              placeholder="Describe your issue in detail..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {submitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Ticket Detail View ───────────────────────────────────────────────────────
const TicketDetail = ({ ticket, onBack, onUpdated, isAdmin }) => {
  const [replyBody, setReplyBody] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [localTicket, setLocalTicket] = useState(ticket);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      setLoadingDetail(true);
      try {
        const full = await api.getTicket(ticket.id);
        setLocalTicket(full);
      } catch (err) {
        console.error("Failed to load ticket detail:", err);
        setLocalTicket(ticket);
      } finally {
        setLoadingDetail(false);
      }
    };
    loadDetail();
  }, [ticket.id]);

  const handleReply = async () => {
    if (!replyBody.trim()) return;
    setSending(true);
    try {
      const msg = await api.replyTicket(localTicket.id, {
        body: replyBody,
        is_internal: isInternal,
      });
      if (msg?.id) {
        setLocalTicket((prev) => ({
          ...prev,
          messages: [...(prev.messages || []), msg],
        }));
      } else {
        const full = await api.getTicket(localTicket.id);
        setLocalTicket(full);
      }
      setReplyBody("");
      setIsInternal(false);
      onUpdated();
    } catch (err) {
      console.error("Reply failed:", err.message);
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    setResolving(true);
    try {
      const updated = await api.resolveTicket(localTicket.id);
      setLocalTicket(updated);
      onUpdated();
    } catch (err) {
      console.error("Resolve failed:", err.message);
    } finally {
      setResolving(false);
    }
  };

  const messages = localTicket.messages || [];

  if (loadingDetail) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-3 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to tickets
          </button>
        </div>
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Ticket header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-3 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to tickets
        </button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-gray-400 mb-1">
              {localTicket.ticket_number}
            </p>
            <h2 className="text-xl font-bold text-gray-900 truncate">
              {localTicket.subject}
            </h2>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <Badge className={STATUS_STYLES[localTicket.status] || STATUS_STYLES.open}>
                {localTicket.status === "open" ? (
                  <Clock className="w-3 h-3 mr-1" />
                ) : (
                  <CheckCircle className="w-3 h-3 mr-1" />
                )}
                {localTicket.status?.replace("_", " ")}
              </Badge>
              <Badge
                className={
                  PRIORITY_STYLES[localTicket.priority] || PRIORITY_STYLES.medium
                }
              >
                {localTicket.priority}
              </Badge>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Tag className="w-3 h-3" />
                {localTicket.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <User className="w-3 h-3" />
                {localTicket.submitted_by}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {new Date(localTicket.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {isAdmin &&
            (localTicket.status === "open" ||
              localTicket.status === "in_progress") && (
              <button
                onClick={handleResolve}
                disabled={resolving}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-60"
              >
                {resolving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Mark Resolved
              </button>
            )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-10">
            No messages yet.
          </p>
        )}
        {messages.map((msg) => {
          const isAdminMsg = msg.sender_role === "admin";
          const isInternalMsg = msg.is_internal;

          return (
            <div
              key={msg.id}
              className={`flex ${isAdminMsg ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                  isInternalMsg
                    ? "bg-amber-50 border border-amber-200 border-l-4 border-l-amber-400"
                    : isAdminMsg
                    ? "bg-gradient-to-br from-orange-500 to-red-500 text-white"
                    : "bg-white border border-gray-200"
                }`}
              >
                {isInternalMsg && (
                  <div className="flex items-center gap-1 mb-1">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-700">
                      Internal note
                    </span>
                  </div>
                )}
                <p
                  className={`text-sm leading-relaxed ${
                    isAdminMsg && !isInternalMsg ? "text-white" : "text-gray-800"
                  }`}
                >
                  {msg.body}
                </p>
                <div
                  className={`flex items-center gap-2 mt-2 text-xs ${
                    isAdminMsg && !isInternalMsg
                      ? "text-orange-100"
                      : "text-gray-400"
                  }`}
                >
                  <span className="font-medium">{msg.sender_email}</span>
                  <span>·</span>
                  <span>
                    {new Date(msg.created_at).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply box */}
      {localTicket.status !== "resolved" && localTicket.status !== "closed" ? (
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          {isAdmin && (
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => setIsInternal(false)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  !isInternal
                    ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                <Send className="w-3 h-3" />
                Reply to customer
              </button>
              <button
                onClick={() => setIsInternal(true)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  isInternal
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                <Lock className="w-3 h-3" />
                Internal note
              </button>
            </div>
          )}

          <div className="flex gap-3 items-end">
            <textarea
              rows={2}
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleReply();
              }}
              placeholder={
                isInternal
                  ? "Write an internal note (only visible to staff)..."
                  : "Write your reply..."
              }
              className={`flex-1 px-4 py-2.5 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 transition-all ${
                isInternal
                  ? "border-amber-300 bg-amber-50 focus:ring-amber-300"
                  : "border-gray-200 focus:ring-orange-400"
              }`}
            />
            <button
              onClick={handleReply}
              disabled={sending || !replyBody.trim()}
              className="p-3 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex-shrink-0"
            >
              {sending ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Ctrl + Enter to send</p>
        </div>
      ) : (
        <div className="bg-green-50 border-t border-green-100 px-6 py-4 text-center">
          <p className="text-sm text-green-700 font-medium flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            This ticket was resolved
            {localTicket.resolved_at
              ? ` on ${new Date(localTicket.resolved_at).toLocaleDateString()}`
              : ""}
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Ticket Card ──────────────────────────────────────────────────────────────
const TicketCard = ({ ticket, onClick, isSelected }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
      isSelected
        ? "border-orange-400 bg-orange-50 shadow-md"
        : "border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm"
    }`}
  >
    <div className="flex items-start justify-between gap-2 mb-2">
      <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-1 flex-1">
        {ticket.subject}
      </p>
      <Badge className={STATUS_STYLES[ticket.status] || STATUS_STYLES.open}>
        {ticket.status?.replace("_", " ")}
      </Badge>
    </div>

    <p className="text-xs text-gray-400 font-mono mb-2">{ticket.ticket_number}</p>

    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
      <User className="w-3 h-3" />
      {ticket.submitted_by}
    </p>

    <div className="flex items-center gap-2 flex-wrap">
      <Badge className={PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.medium}>
        {ticket.priority}
      </Badge>
      <span className="text-xs text-gray-500 capitalize">{ticket.category}</span>
      <span className="text-xs text-gray-400 ml-auto">
        {new Date(ticket.created_at).toLocaleDateString()}
      </span>
    </div>

    {ticket.messages?.length > 0 && (
      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
        <MessageCircle className="w-3 h-3" />
        {ticket.messages.length} message{ticket.messages.length !== 1 ? "s" : ""}
      </p>
    )}
  </button>
);

// ─── Main SupportPage ─────────────────────────────────────────────────────────
const SupportPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = getIsAdmin();

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTickets();
      const list = Array.isArray(data) ? data : data.results || [];
      setTickets(list);
    } catch (err) {
      console.error("Failed to fetch tickets:", err.message);
      setTickets([]);
      setError(err.message || "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleTicketCreated = (ticket) => {
    setShowNewModal(false);
    setTickets((prev) => [ticket, ...prev]);
    setSelectedTicket(ticket);
  };

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    if (filterCategory && t.category !== filterCategory) return false;
    if (
      searchQuery &&
      !t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.ticket_number?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.submitted_by?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const openCount = tickets.filter((t) => t.status === "open").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;
  const highCount = tickets.filter(
    (t) => t.priority === "high" && t.status === "open"
  ).length;

  return (
    <div className="h-screen font-poppins flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-hidden bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/20 ml-[80px] flex flex-col">
          {/* Page header */}
          <div className="px-8 py-6 border-b border-gray-200 bg-white/70 backdrop-blur-sm flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-orange-500" />
                Support Tickets
                {isAdmin && (
                  <span className="ml-2 text-xs font-semibold px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                    Admin View
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {isAdmin
                  ? "View and respond to all customer support requests"
                  : "Manage and track your support requests"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchTickets}
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => setShowNewModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-orange-200"
              >
                <Plus className="w-4 h-4" />
                New Ticket
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="px-8 py-3 bg-white/50 border-b border-gray-100 flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Total</span>
              <span className="text-sm font-bold text-gray-900">{tickets.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs text-gray-500">Open</span>
              <span className="text-sm font-bold text-blue-600">{openCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs text-gray-500">Resolved</span>
              <span className="text-sm font-bold text-green-600">{resolvedCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs text-gray-500">High priority</span>
              <span className="text-sm font-bold text-red-600">{highCount}</span>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left panel */}
            <div className="w-80 flex-shrink-0 border-r border-gray-200 bg-white/60 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-gray-100 space-y-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tickets or users…"
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
                <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                  <Filter className="w-3 h-3" />
                  Filters
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="col-span-1 text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
                  >
                    <option value="">Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="col-span-1 text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
                  >
                    <option value="">Priority</option>
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="col-span-1 text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
                  >
                    <option value="">Category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {(filterStatus || filterPriority || filterCategory || searchQuery) && (
                  <button
                    onClick={() => {
                      setFilterStatus("");
                      setFilterPriority("");
                      setFilterCategory("");
                      setSearchQuery("");
                    }}
                    className="w-full text-xs text-orange-600 font-semibold py-1 hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                    {error}
                  </div>
                )}

                {loading ? (
                  <Spinner />
                ) : filteredTickets.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 font-medium">
                      {tickets.length === 0
                        ? "No tickets yet"
                        : "No tickets match filters"}
                    </p>
                  </div>
                ) : (
                  filteredTickets.map((t) => (
                    <TicketCard
                      key={t.id}
                      ticket={t}
                      isSelected={selectedTicket?.id === t.id}
                      onClick={() => setSelectedTicket(t)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {selectedTicket ? (
                <TicketDetail
                  key={selectedTicket.id}
                  ticket={selectedTicket}
                  onBack={() => setSelectedTicket(null)}
                  onUpdated={fetchTickets}
                  isAdmin={isAdmin}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="w-9 h-9 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Select a ticket
                  </h3>
                  <p className="text-gray-500 text-sm max-w-xs">
                    Choose a ticket from the list to view details and reply, or
                    create a new one.
                  </p>
                  <button
                    onClick={() => setShowNewModal(true)}
                    className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Ticket
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {showNewModal && (
        <NewTicketModal
          onClose={() => setShowNewModal(false)}
          onCreated={handleTicketCreated}
        />
      )}
    </div>
  );
};

export default SupportPage;