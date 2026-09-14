import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { transactionService } from '../api/services/transactionService';
import { normalizeVehicles } from '../api/normalizer';
import { vehicleService } from '../services/vehicleService';

type TabKey = 'approvals' | 'vehicles' | 'transactions';

const TAB_LABELS: Record<TabKey, string> = {
  approvals: '🔔 Approvals',
  vehicles: '🚗 Kendaraan',
  transactions: '📋 Transaksi',
};

const VEHICLE_STATUS_META: Record<string, { label: string; cls: string }> = {
  available:   { label: '🟢 Tersedia',     cls: 'bg-emerald-100 text-emerald-700' },
  rented:      { label: '🟡 Sedang Disewa', cls: 'bg-amber-100 text-amber-700' },
  maintenance: { label: '🔴 Perbaikan',    cls: 'bg-rose-100 text-rose-700' },
  reserved:    { label: '🔵 Dipesan',      cls: 'bg-sky-100 text-sky-700' },
};

const TX_STATUS_META: Record<string, { label: string; cls: string }> = {
  pending_verification: { label: '⏳ Menunggu',  cls: 'bg-amber-100 text-amber-700' },
  approved:             { label: '✅ Disetujui', cls: 'bg-blue-100 text-blue-700' },
  active:               { label: '🔵 Aktif',    cls: 'bg-emerald-100 text-emerald-700' },
  completed:            { label: '✓ Selesai',   cls: 'bg-slate-100 text-slate-700' },
  cancelled:            { label: '✕ Dibatalkan', cls: 'bg-rose-100 text-rose-700' },
  rejected:             { label: '✕ Ditolak',   cls: 'bg-rose-100 text-rose-700' },
};

export const AdminWeb: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('approvals');

  const [pendingTx, setPendingTx] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [allTx, setAllTx] = useState<any[]>([]);

  const [loading, setLoading] = useState({ pending: false, vehicles: false, tx: false });
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  // Filter untuk tab kendaraan
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'car' | 'bike' | 'bicycle'>('all');

  // ============================================================
  // FETCHERS
  // ============================================================
  const fetchPending = useCallback(async () => {
    setLoading((s) => ({ ...s, pending: true }));
    try {
      const data = await transactionService.getPending();
      setPendingTx(data);
    } catch (e: any) {
      setError(e.message ?? 'Gagal memuat pending');
    } finally {
      setLoading((s) => ({ ...s, pending: false }));
    }
  }, []);

  const fetchVehicles = useCallback(async () => {
    setLoading((s) => ({ ...s, vehicles: true }));
    try {
      const raw = await vehicleService.getAllVehicles();
      setVehicles(normalizeVehicles(raw));
    } catch (e: any) {
      setError(e.message ?? 'Gagal memuat kendaraan');
    } finally {
      setLoading((s) => ({ ...s, vehicles: false }));
    }
  }, []);

  const fetchAllTx = useCallback(async () => {
    setLoading((s) => ({ ...s, tx: true }));
    try {
      const data = await transactionService.getAll();
      setAllTx(data);
    } catch (e: any) {
      setError(e.message ?? 'Gagal memuat transaksi');
    } finally {
      setLoading((s) => ({ ...s, tx: false }));
    }
  }, []);

  const fetchAll = useCallback(() => {
    setError(null);
    fetchPending();
    fetchVehicles();
    fetchAllTx();
  }, [fetchPending, fetchVehicles, fetchAllTx]);

  // Fetch pertama
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Auto-refresh pending setiap 15 detik (hanya saat tab approvals aktif)
  useEffect(() => {
    if (activeTab !== 'approvals') return;
    const interval = setInterval(fetchPending, 15000);
    return () => clearInterval(interval);
  }, [activeTab, fetchPending]);

  // ============================================================
  // ACTIONS
  // ============================================================
  const handleApprove = async (id: string) => {
    if (!confirm('Setujui peminjaman ini? Kendaraan akan otomatis jadi "rented".')) return;
    setActionId(id);
    try {
      await transactionService.approve(id, 'usr_004');
      await Promise.all([fetchPending(), fetchVehicles(), fetchAllTx()]);
    } catch (e: any) {
      alert(`Gagal approve: ${e.message}`);
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Alasan penolakan:', 'Tidak memenuhi syarat');
    if (reason === null) return;
    setActionId(id);
    try {
      await transactionService.reject(id, reason, 'usr_004');
      await Promise.all([fetchPending(), fetchVehicles(), fetchAllTx()]);
    } catch (e: any) {
      alert(`Gagal reject: ${e.message}`);
    } finally {
      setActionId(null);
    }
  };

  // ============================================================
  // FILTERS
  // ============================================================
  const filteredVehicles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vehicles.filter((v) => {
      if (filterType !== 'all' && v.type !== filterType) return false;
      if (!q) return true;
      return [v.name, v.brand, v.licensePlate, v.locationHub]
        .join(' ').toLowerCase().includes(q);
    });
  }, [vehicles, search, filterType]);

  // ============================================================
  // RENDER HELPERS
  // ============================================================
  const fmtRp = (n: number) => `Rp ${Number(n ?? 0).toLocaleString('id-ID')}`;
  const fmtDate = (s: string) => s ? new Date(s).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  }) : '-';

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">VehLend — Admin Dashboard</h1>
            <p className="text-sm text-slate-500">
              Approval center & monitoring kendaraan
            </p>
          </div>
          <button
            onClick={fetchAll}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition"
          >
            🔄 Refresh
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-start justify-between gap-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
            <span><strong>Error:</strong> {error}</span>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 font-bold">×</button>
          </div>
        )}

        {/* TABS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex gap-2">
          {(Object.keys(TAB_LABELS) as TabKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === key
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {TAB_LABELS[key]}
              {key === 'approvals' && pendingTx.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                  {pendingTx.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ============================================================
            TAB: APPROVALS
        ============================================================ */}
        {activeTab === 'approvals' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-bold text-slate-800">
                🔔 Menunggu Persetujuan ({pendingTx.length})
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Peminjaman yang masuk dari aplikasi mobile customer. Setujui untuk mengaktifkan peminjaman.
              </p>
            </div>

            {loading.pending && pendingTx.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Memuat...</div>
            ) : pendingTx.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-3">✨</div>
                <p className="text-slate-500 text-sm">Tidak ada peminjaman yang menunggu approval.</p>
                <p className="text-slate-400 text-xs mt-1">Semua sudah diproses. Good job!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingTx.map((tx) => {
                  const isProcessing = actionId === tx.id;
                  return (
                    <div key={tx.id} className="p-5 hover:bg-slate-50 transition">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900">{tx.vehicleName}</span>
                            <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {tx.id}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${TX_STATUS_META[tx.status]?.cls ?? 'bg-slate-100 text-slate-600'}`}>
                              {TX_STATUS_META[tx.status]?.label ?? tx.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div>
                              <div className="text-slate-400">Peminjam</div>
                              <div className="font-semibold text-slate-700">{tx.userName}</div>
                              {tx.userPhone && (
                                <div className="text-slate-500 font-mono text-[10px]">{tx.userPhone}</div>
                              )}
                            </div>
                            <div>
                              <div className="text-slate-400">Periode</div>
                              <div className="font-semibold text-slate-700">
                                {fmtDate(tx.startDateTime)} → {fmtDate(tx.endDateTime)}
                              </div>
                              <div className="text-slate-500">{tx.totalDays || tx.durationHours / 24} hari</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Pickup</div>
                              <div className="font-semibold text-slate-700 truncate">{tx.pickupHub}</div>
                              <div className="text-slate-500 truncate">→ {tx.dropoffHub}</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Total Biaya</div>
                              <div className="font-bold text-blue-600 text-sm">{fmtRp(tx.totalCost)}</div>
                              <div className="text-slate-500 capitalize">{tx.paymentStatus}</div>
                            </div>
                          </div>

                          {tx.notes && (
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-600 italic">
                              💬 {tx.notes}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={() => handleApprove(tx.id)}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition min-w-[100px]"
                          >
                            {isProcessing ? '...' : '✅ Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(tx.id)}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 disabled:opacity-50 text-xs font-bold rounded-lg transition min-w-[100px]"
                          >
                            ❌ Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB: VEHICLES (read-only)
        ============================================================ */}
        {activeTab === 'vehicles' && (
          <>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
              <input
                type="text"
                placeholder="Cari nama, brand, plat, atau hub..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-80 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                {(['all', 'car', 'bike', 'bicycle'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                      filterType === t
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t === 'all' ? 'Semua' : t === 'car' ? 'Mobil' : t === 'bike' ? 'Motor' : 'Sepeda'}
                  </button>
                ))}
                <span className="ml-2 text-xs text-slate-400">
                  {filteredVehicles.length} / {vehicles.length}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-800">Daftar Kendaraan</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    📌 <strong>Read-only</strong> — perubahan status kendaraan hanya bisa dilakukan oleh Worker (desktop).
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="p-4">Kendaraan</th>
                      <th className="p-4">Tipe &amp; Plat</th>
                      <th className="p-4">Lokasi</th>
                      <th className="p-4">Tarif/Hari</th>
                      <th className="p-4">BBM/Baterai</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {loading.vehicles && vehicles.length === 0 ? (
                      <tr><td colSpan={6} className="text-center p-8 text-slate-500">Memuat...</td></tr>
                    ) : filteredVehicles.length === 0 ? (
                      <tr><td colSpan={6} className="text-center p-8 text-slate-400">Tidak ada kendaraan.</td></tr>
                    ) : (
                      filteredVehicles.map((v) => {
                        const meta = VEHICLE_STATUS_META[v.status] ?? VEHICLE_STATUS_META.available;
                        return (
                          <tr key={v.id} className="hover:bg-slate-50 transition">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={v.imageUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="100%" height="100%" fill="%23e2e8f0"/></svg>'}
                                  alt={v.name}
                                  className="w-12 h-12 object-cover rounded-lg bg-slate-100"
                                />
                                <div>
                                  <div className="font-bold text-slate-900">{v.name}</div>
                                  <div className="text-xs text-slate-500">{v.brand} · {v.year}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="uppercase text-xs font-bold text-slate-600 block">{v.type}</span>
                              <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {v.licensePlate ?? v.serialNumber}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-slate-600">{v.locationHub}</td>
                            <td className="p-4 font-semibold text-blue-600">{fmtRp(v.dailyRate)}</td>
                            <td className="p-4 text-xs text-slate-600">{v.fuelOrBatteryLevel}%</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${meta.cls}`}>
                                {meta.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ============================================================
            TAB: TRANSACTIONS
        ============================================================ */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-bold text-slate-800">Semua Transaksi</h2>
              <p className="text-xs text-slate-500 mt-1">
                Riwayat lengkap peminjaman dari customer.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="p-4">ID</th>
                    <th className="p-4">Peminjam</th>
                    <th className="p-4">Kendaraan</th>
                    <th className="p-4">Periode</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading.tx && allTx.length === 0 ? (
                    <tr><td colSpan={6} className="text-center p-8 text-slate-500">Memuat...</td></tr>
                  ) : allTx.length === 0 ? (
                    <tr><td colSpan={6} className="text-center p-8 text-slate-400">Belum ada transaksi.</td></tr>
                  ) : (
                    allTx.map((tx) => {
                      const meta = TX_STATUS_META[tx.status] ?? { label: tx.status, cls: 'bg-slate-100 text-slate-600' };
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50 transition">
                          <td className="p-4 font-mono text-xs text-slate-500">{tx.id}</td>
                          <td className="p-4 font-semibold text-slate-800">{tx.userName}</td>
                          <td className="p-4 text-slate-700">{tx.vehicleName}</td>
                          <td className="p-4 text-xs text-slate-600">
                            {fmtDate(tx.startDateTime)} → {fmtDate(tx.endDateTime)}
                          </td>
                          <td className="p-4 font-semibold text-blue-600">{fmtRp(tx.totalCost)}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${meta.cls}`}>
                              {meta.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminWeb;