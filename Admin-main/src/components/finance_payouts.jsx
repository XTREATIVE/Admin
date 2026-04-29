// src/components/FinancePayouts.js
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';

const BASE_URL = 'https://xtreativeapi.onrender.com';
const ITEMS_PER_PAGE = 20;

const TABS = [
  { key: 'pending',   label: 'Pending Payouts',    statuses: ['pending payout', 'pending', 'processing'] },
  { key: 'history',   label: 'Payout History',     statuses: ['settled', 'completed', 'paid'] },
  { key: 'upcoming',  label: 'Upcoming Payouts',   statuses: ['upcoming'] },
  { key: 'refunds',   label: 'Refunds / Cancelled',statuses: ['refunded', 'cancelled', 'failed'] },
];

// ── Improved Helpers based on real API ─────────────────────────────────────
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('authToken')}`,
});

const formatDate = (str) => {
  if (!str) return '—';
  try {
    return new Date(str).toLocaleDateString('en-UG', { 
      day: '2-digit', month: 'short', year: 'numeric' 
    });
  } catch { return str; }
};

const formatTime = (str) => {
  if (!str) return '—';
  try {
    return new Date(str).toLocaleTimeString('en-UG', { 
      hour: '2-digit', minute: '2-digit' 
    });
  } catch { return str; }
};

const fmt = (n) => Math.round(parseFloat(n || 0)).toLocaleString('en-US');

// Resolve correct fields from your actual API
const getGross = (p) => parseFloat(p.sale_amount || p.amount || p.gross_amount || 0);
const getCommission = (p) => parseFloat(p.commission_amount || 0);
const getNet = (p) => parseFloat(p.final_vendor_amount || 0);
const getCommissionPercent = (p) => parseFloat(p.commission_percentage || 18);

const getStatus = (p) => (p.status || p.settlement_status || '').trim();

const statusStyle = (status = '') => {
  const s = status.toLowerCase();
  if (['settled', 'completed', 'paid'].includes(s)) 
    return 'bg-green-100 text-green-800';
  if (['pending payout', 'pending', 'processing'].includes(s))
    return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

// ── Main Component ────────────────────────────────────────────────────────
const FinancePayouts = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [allPayouts, setAllPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayout, setSelectedPayout] = useState(null);

  const fetchPayouts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [adminRes, paymentsRes] = await Promise.allSettled([
        fetch(`${BASE_URL}/admins/payouts/`, { headers: getAuthHeaders() }),
        fetch(`${BASE_URL}/payments/payouts/`, { headers: getAuthHeaders() }),
      ]);

      const extract = async (res) => {
        if (res.status !== 'fulfilled' || !res.value.ok) return [];
        const data = await res.value.json();
        return Array.isArray(data) ? data : (data?.results ?? []);
      };

      const [adminData, paymentsData] = await Promise.all([
        extract(adminRes), extract(paymentsRes)
      ]);

      const map = new Map();
      [...adminData, ...paymentsData].forEach(p => {
        if (p?.id) map.set(String(p.id), p);
      });

      setAllPayouts([...map.values()]);
    } catch (err) {
      setError(err.message || 'Failed to load payouts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const tab = TABS.find(t => t.key === activeTab) || TABS[0];

  const filtered = allPayouts.filter(p => {
    const status = getStatus(p).toLowerCase();
    return tab.statuses.some(s => status.includes(s));
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex flex-col h-full font-sans">

      {/* Tabs */}
      <div className="flex bg-gray-50 border-b text-sm overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => { setActiveTab(t.key); setCurrentPage(1); }}
            className={`px-6 py-3 whitespace-nowrap font-medium transition-all ${
              activeTab === t.key 
                ? 'bg-white border-b-2 border-orange-500 text-gray-900' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
        <button onClick={fetchPayouts} className="ml-auto px-4 py-3 text-gray-400 hover:text-orange-500">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        {loading && <div className="text-center py-20">Loading payouts...</div>}
        {error && <div className="text-red-500 text-center py-10">{error}</div>}

        {!loading && !error && (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">ID</th>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Vendor</th>
                  <th className="px-6 py-4 text-left">Product</th>
                  <th className="px-6 py-4 text-right">Gross (UGX)</th>
                  <th className="px-6 py-4 text-right">Commission</th>
                  <th className="px-6 py-4 text-right">Net Payout</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pageData.map(p => {
                  const gross = getGross(p);
                  const commission = getCommission(p) || (gross * getCommissionPercent(p) / 100);
                  const net = getNet(p) || (gross - commission);
                  const status = getStatus(p);

                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono">#{p.id}</td>
                      <td className="px-6 py-4">
                        {formatDate(p.date)}<br/>
                        <span className="text-xs text-gray-500">{formatTime(p.date)}</span>
                      </td>
                      <td className="px-6 py-4 font-medium">{p.vendor_name || '—'}</td>
                      <td className="px-6 py-4 text-gray-600">{p.product_name || '—'}</td>
                      <td className="px-6 py-4 text-right font-semibold">{fmt(gross)}</td>
                      <td className="px-6 py-4 text-right text-orange-600 font-semibold">
                        {fmt(commission)} <span className="text-xs">({getCommissionPercent(p)}%)</span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-emerald-600">{fmt(net)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusStyle(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => setSelectedPayout(p)}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-6">Payout Details</h2>
            
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-gray-500">ID</span><br/>#{selectedPayout.id}</div>
                <div><span className="text-gray-500">Date</span><br/>{formatDate(selectedPayout.date)}</div>
              </div>

              <div><span className="text-gray-500">Vendor</span><br/>{selectedPayout.vendor_name}</div>
              <div><span className="text-gray-500">Product</span><br/>{selectedPayout.product_name}</div>

              <div className="pt-4 border-t">
                <div className="flex justify-between py-2">
                  <span>Gross Amount</span>
                  <span className="font-semibold">UGX {fmt(getGross(selectedPayout))}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Commission ({getCommissionPercent(selectedPayout)}%)</span>
                  <span className="text-orange-600 font-semibold">- UGX {fmt(getCommission(selectedPayout))}</span>
                </div>
                <div className="flex justify-between py-3 border-t font-bold text-lg">
                  <span>Net Payout to Vendor</span>
                  <span className="text-emerald-600">UGX {fmt(getNet(selectedPayout))}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedPayout(null)}
              className="mt-8 w-full py-3 bg-gray-900 text-white rounded-xl font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancePayouts;