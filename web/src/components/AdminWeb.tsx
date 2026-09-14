import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Vehicle, VehicleStatus, VehicleType } from '../types';
import { vehicleService } from '../services/vehicleService';

// ---------------------------------------------------------------
// Konfigurasi tampilan
// ---------------------------------------------------------------

type CategoryFilter = 'all' | VehicleType;

const CATEGORY_TABS: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'car', label: 'Mobil' },
  { key: 'bike', label: 'Motor' },
  { key: 'bicycle', label: 'Sepeda' },
];

const STATUS_META: Record<
  VehicleStatus,
  { label: string; dot: string; badge: string }
> = {
  available: {
    label: 'Available',
    dot: '🟢',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  rented: {
    label: 'Rented',
    dot: '🟡',
    badge: 'bg-amber-100 text-amber-700',
  },
  maintenance: {
    label: 'Maintenance',
    dot: '🔴',
    badge: 'bg-rose-100 text-rose-700',
  },
  reserved: {
    label: 'Reserved',
    dot: '🔵',
    badge: 'bg-sky-100 text-sky-700',
  },
};

const STATUS_ACTIONS: {
  status: VehicleStatus;
  label: string;
  text: string;
  hover: string;
  border: string;
}[] = [
  {
    status: 'available',
    label: 'Available',
    text: 'text-emerald-600',
    hover: 'hover:bg-emerald-50',
    border: 'border-r border-slate-200',
  },
  {
    status: 'rented',
    label: 'Rented',
    text: 'text-amber-600',
    hover: 'hover:bg-amber-50',
    border: 'border-r border-slate-200',
  },
  {
    status: 'maintenance',
    label: 'Repair',
    text: 'text-rose-600',
    hover: 'hover:bg-rose-50',
    border: '',
  },
];

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">
       <rect width="100%" height="100%" fill="#e2e8f0"/>
       <text x="50%" y="54%" font-size="11" fill="#94a3b8"
             text-anchor="middle" font-family="sans-serif">no image</text>
     </svg>`
  );

// ---------------------------------------------------------------
// Komponen
// ---------------------------------------------------------------

export const AdminWeb: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- FETCH -----------------------------------------------------
  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await vehicleService.getAllVehicles();
      setVehicles(data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError(
        err instanceof Error ? err.message : 'Gagal memuat data kendaraan.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchVehicles();
  }, [fetchVehicles]);

  // --- UPDATE STATUS (optimistic + rollback) ----------------------
  const handleUpdateStatus = async (id: string, newStatus: VehicleStatus) => {
    const previous = vehicles;
    setUpdatingId(id);
    setError(null);

    // Optimistic update: UI langsung berubah
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
    );

    try {
      const updated = await vehicleService.updateVehicleStatus(id, newStatus);
      // Sinkronkan dengan response server
      setVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...updated } : v))
      );
    } catch (err) {
      console.error('Error updating status:', err);
      setVehicles(previous); // rollback
      setError(
        err instanceof Error ? err.message : 'Gagal mengubah status kendaraan.'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // --- FILTER ----------------------------------------------------
  const filteredVehicles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return vehicles.filter((v) => {
      // 1. Filter kategori
      if (selectedCategory !== 'all' && v.type !== selectedCategory) {
        return false;
      }
      // 2. Filter pencarian
      if (!q) return true;

      const haystack = [
        v.name,
        v.brand,
        v.model,
        v.licensePlate ?? '',
        v.serialNumber,
        v.locationHub,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [vehicles, searchQuery, selectedCategory]);

  // ---------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER SECTION */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              VehLend - Dashboard Admin
            </h1>
            <p className="text-sm text-slate-500">
              Manajemen Kendaraan Operasional
            </p>
          </div>
          <button
            onClick={() => void fetchVehicles()}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition"
          >
            {isLoading ? 'Memuat…' : 'Refresh Data'}
          </button>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="flex items-start justify-between gap-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
            <span>
              <strong className="font-semibold">Terjadi kesalahan: </strong>
              {error}
            </span>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-600 font-bold leading-none"
              aria-label="Tutup"
            >
              ×
            </button>
          </div>
        )}

        {/* SEARCH & FILTER CONTROLS */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
          <input
            type="text"
            placeholder="Cari nama, brand, atau plat nomor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex items-center gap-2">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedCategory(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <span className="ml-2 text-xs text-slate-400">
              {filteredVehicles.length} / {vehicles.length} unit
            </span>
          </div>
        </div>

        {/* TABLE VEHICLES MANAGEMENT */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="p-4">Kendaraan</th>
                <th className="p-4">Tipe &amp; Plat</th>
                <th className="p-4">Lokasi</th>
                <th className="p-4">Tarif/Hari</th>
                <th className="p-4">Status Real-time</th>
                <th className="p-4 text-center">Aksi (Ubah Status)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-slate-500">
                    Memuat data dari API...
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-slate-400">
                    Tidak ada data kendaraan ditemukan.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => {
                  const meta = STATUS_META[vehicle.status];
                  const isUpdating = updatingId === vehicle.id;

                  return (
                    <tr key={vehicle.id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={vehicle.imageUrl || FALLBACK_IMAGE}
                            alt={vehicle.name}
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_IMAGE;
                            }}
                            className="w-12 h-12 object-cover rounded-lg bg-slate-100"
                          />
                          <div>
                            <div className="font-bold text-slate-900">
                              {vehicle.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {vehicle.brand} · {vehicle.year}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="uppercase text-xs font-bold text-slate-600 block">
                          {vehicle.type}
                        </span>
                        <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {vehicle.licensePlate ?? vehicle.serialNumber}
                        </span>
                      </td>

                      <td className="p-4 text-xs text-slate-600">
                        {vehicle.locationHub}
                      </td>

                      <td className="p-4 font-semibold text-blue-600">
                        Rp {vehicle.dailyRate?.toLocaleString('id-ID')}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${meta.badge}`}
                        >
                          {meta.dot} {meta.label}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <div
                          className={`inline-flex rounded-lg border border-slate-200 overflow-hidden transition ${
                            isUpdating ? 'opacity-40 pointer-events-none' : ''
                          }`}
                        >
                          {STATUS_ACTIONS.map((action) => (
                            <button
                              key={action.status}
                              onClick={() =>
                                void handleUpdateStatus(vehicle.id, action.status)
                              }
                              disabled={
                                isUpdating || vehicle.status === action.status
                              }
                              className={`px-2.5 py-1 bg-white text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed ${action.hover} ${action.text} ${action.border}`}
                            >
                              {action.label}
                            </button>
                          ))}
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
    </div>
  );
};

export default AdminWeb;