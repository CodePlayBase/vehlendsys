import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  Users, 
  Car, 
  DollarSign, 
  Clock, 
  CheckSquare, 
  Activity, 
  FileText,
  MapPin,
  BatteryCharging,
  Fuel,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { Vehicle, User, Transaction, DashboardStats, VehicleType, VehicleStatus } from '../../types';
import { apiStore } from '../../services/apiStore';
import { VehicleTypeBadge, VehicleStatusBadge, TransactionStatusBadge, VerificationStatusBadge } from '../shared/Badge';
import { HUBS } from '../../data/mockData';

interface WebAdminDashboardProps {
  stats: DashboardStats;
  vehicles: Vehicle[];
  users: User[];
  transactions: Transaction[];
}

export const WebAdminDashboard: React.FC<WebAdminDashboardProps> = ({
  stats,
  vehicles,
  users,
  transactions,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'bookings' | 'users'>('overview');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('all');
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState<string>('all');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form State for Vehicle Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    type: 'car' as VehicleType,
    licensePlate: '',
    serialNumber: '',
    status: 'available' as VehicleStatus,
    hourlyRate: 15.0,
    dailyRate: 80.0,
    fuelOrBatteryLevel: 100,
    locationHub: HUBS[0],
    imageUrl: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=600&auto=format&fit=crop&q=80',
    year: 2025,
    seats: 5,
    conditionNotes: '',
    lastMaintainedDate: new Date().toISOString().split('T')[0],
  });

  // Filtered vehicles
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      v.brand.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      v.serialNumber.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      (v.licensePlate && v.licensePlate.toLowerCase().includes(vehicleSearch.toLowerCase()));
    
    const matchesType = vehicleTypeFilter === 'all' || v.type === vehicleTypeFilter;
    const matchesStatus = vehicleStatusFilter === 'all' || v.status === vehicleStatusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pending items for quick review
  const pendingBookings = transactions.filter(t => t.status === 'pending_verification');
  const pendingUsers = users.filter(u => u.verificationStatus === 'pending');

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setFormData({
      name: '',
      brand: '',
      model: '',
      type: 'car',
      licensePlate: 'EV-' + Math.floor(100 + Math.random() * 900) + '-US',
      serialNumber: 'SN-' + Math.floor(10000 + Math.random() * 90000),
      status: 'available',
      hourlyRate: 12.0,
      dailyRate: 65.0,
      fuelOrBatteryLevel: 100,
      locationHub: HUBS[0],
      imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80',
      year: 2025,
      seats: 5,
      conditionNotes: 'Brand new unit initialized into fleet.',
      lastMaintainedDate: new Date().toISOString().split('T')[0],
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setFormData({
      name: v.name,
      brand: v.brand,
      model: v.model,
      type: v.type,
      licensePlate: v.licensePlate || '',
      serialNumber: v.serialNumber,
      status: v.status,
      hourlyRate: v.hourlyRate,
      dailyRate: v.dailyRate,
      fuelOrBatteryLevel: v.fuelOrBatteryLevel,
      locationHub: v.locationHub,
      imageUrl: v.imageUrl,
      year: v.year,
      seats: v.seats || (v.type === 'car' ? 5 : v.type === 'bike' ? 2 : 1),
      conditionNotes: v.conditionNotes || '',
      lastMaintainedDate: v.lastMaintainedDate,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.serialNumber) {
      alert('Please fill in Name, Brand, and Serial Number');
      return;
    }

    if (editingVehicle) {
      apiStore.updateVehicle(editingVehicle.id, formData, 'Web Admin');
    } else {
      apiStore.addVehicle(formData, 'Web Admin');
    }
    setIsAddModalOpen(false);
  };

  const handleDeleteVehicle = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the active fleet inventory?`)) {
      apiStore.deleteVehicle(id, 'Web Admin');
    }
  };

  const handleApproveBooking = (txId: string) => {
    apiStore.updateTransactionStatus(txId, 'active', 'usr_004 (Admin David)', 'Web Admin');
  };

  const handleRejectBooking = (txId: string) => {
    const reason = prompt('Please enter the reason for rejection (e.g. Invalid license, insurance lapse):');
    if (reason !== null) {
      apiStore.updateTransactionStatus(txId, 'rejected', 'usr_004 (Admin David)', 'Web Admin');
    }
  };

  const handleVerifyUser = (userId: string, status: 'verified' | 'rejected') => {
    apiStore.updateUserVerification(userId, status, 'Web Admin');
  };

  return (
    <div className="space-y-6">
      {/* Admin Subheader with Role Context */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-600 text-white">ADMIN PORTAL</span>
            <span className="text-slate-400">/web</span>
            <span className="text-xs text-slate-500 font-mono">Role: Super Admin (David Thorne)</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Fleet & Booking Operations Dashboard</h1>
          <p className="text-sm text-slate-600">
            Centrally manage vehicle inventories, review customer identity verifications, and approve lending workflows.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Vehicle</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Fleet</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalVehicles}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1.5">
            <span>🚗 {stats.fleetBreakdown.cars} Cars</span>
            <span>•</span>
            <span>🏍️ {stats.fleetBreakdown.bikes} Bikes</span>
            <span>•</span>
            <span>🚲 {stats.fleetBreakdown.bicycles} Bikes</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Now</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">{stats.availableVehicles}</div>
          <div className="text-xs text-slate-500 mt-1">
            {stats.totalVehicles ? Math.round((stats.availableVehicles / stats.totalVehicles) * 100) : 0}% fleet readiness
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Loans</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-indigo-600 mt-2">{stats.activeRentals}</div>
          <div className="text-xs text-slate-500 mt-1">
            {stats.underMaintenance} units in maintenance
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Tasks</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">
            {stats.pendingBookings + stats.pendingVerifications}
          </div>
          <div className="text-xs text-amber-700 mt-1 font-medium">
            {stats.pendingBookings} bookings • {stats.pendingVerifications} KYC verifications
          </div>
        </div>
      </div>

      {/* Tab Navigation within Admin */}
      <div className="border-b border-slate-200 bg-white px-4 rounded-xl shadow-sm">
        <nav className="flex space-x-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Executive Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`py-4 border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'fleet'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Vehicle Fleet Inventory ({vehicles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-4 border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'bookings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Booking Verification Queue</span>
            {pendingBookings.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse">
                {pendingBookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customer KYC & Users ({users.length})</span>
            {pendingUsers.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                {pendingUsers.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Actionable Verification Alerts */}
          {(pendingBookings.length > 0 || pendingUsers.length > 0) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-amber-900 text-sm">Action Items Requiring Super Admin Approval</h3>
                    <p className="text-xs text-amber-700 mt-0.5">
                      You have <strong>{pendingBookings.length}</strong> borrowing request(s) awaiting verification and <strong>{pendingUsers.length}</strong> new customer driver license(s) pending audit.
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition"
                  >
                    Review Bookings
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="bg-white border border-amber-300 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded hover:bg-amber-100 transition"
                  >
                    Review Licenses
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats Bento */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hub Distribution */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
              <h3 className="font-bold text-slate-900 text-base flex items-center justify-between mb-4">
                <span>Fleet Distribution by Hub Station</span>
                <span className="text-xs text-slate-500 font-normal">Real-time GPS / Hub telemetry</span>
              </h3>
              <div className="space-y-3">
                {HUBS.map(hub => {
                  const hubVehicles = vehicles.filter(v => v.locationHub === hub);
                  const availableCount = hubVehicles.filter(v => v.status === 'available').length;
                  const pct = hubVehicles.length ? Math.round((availableCount / hubVehicles.length) * 100) : 0;
                  return (
                    <div key={hub} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between mb-1.5 text-xs">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-semibold text-slate-800">{hub}</span>
                        </div>
                        <span className="font-mono text-slate-600">
                          <strong>{availableCount}</strong> / {hubVehicles.length} available ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 5)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Revenue & Transaction Summary */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center justify-between">
                <span>Lending Financials</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </h3>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 text-center">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Settled Rental Volume</span>
                <div className="text-3xl font-extrabold text-emerald-800 mt-1">
                  ${stats.totalRevenueToday.toFixed(2)}
                </div>
                <span className="text-[11px] text-emerald-600">Auto-calculated from paid transactions</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Total Processed Transactions</span>
                  <span className="font-bold text-slate-800">{transactions.length}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Active On-Road Loans</span>
                  <span className="font-bold text-indigo-600">{stats.activeRentals}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Avg. Hourly Rate (Cars)</span>
                  <span className="font-bold text-slate-800">$16.20/hr</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Registered Customer Accounts</span>
                  <span className="font-bold text-slate-800">{users.filter(u => u.role === 'customer').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FLEET INVENTORY MANAGEMENT */}
      {activeTab === 'fleet' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by name, model, plate, serial..."
                value={vehicleSearch}
                onChange={e => setVehicleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <select
                value={vehicleTypeFilter}
                onChange={e => setVehicleTypeFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Vehicle Types</option>
                <option value="car">🚗 Cars Only</option>
                <option value="bike">🏍️ Bikes Only</option>
                <option value="bicycle">🚲 Bicycles Only</option>
              </select>

              <select
                value={vehicleStatusFilter}
                onChange={e => setVehicleStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="available">🟢 Available</option>
                <option value="rented">🔵 Rented</option>
                <option value="maintenance">🔴 Maintenance</option>
                <option value="reserved">🟠 Reserved</option>
              </select>

              <button
                onClick={handleOpenAdd}
                className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition ml-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle</span>
              </button>
            </div>
          </div>

          {/* Vehicles Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Vehicle</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Plate / Serial</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Battery / Fuel</th>
                    <th className="py-3.5 px-4">Pricing</th>
                    <th className="py-3.5 px-4">Hub Location</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVehicles.map(vehicle => (
                    <tr key={vehicle.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={vehicle.imageUrl}
                            alt={vehicle.name}
                            className="w-12 h-10 object-cover rounded-md border border-slate-200"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">{vehicle.name}</div>
                            <div className="text-xs text-slate-500">{vehicle.brand} • {vehicle.year}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <VehicleTypeBadge type={vehicle.type} />
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        <div className="font-medium text-slate-800">{vehicle.licensePlate || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400">{vehicle.serialNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <VehicleStatusBadge status={vehicle.status} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5">
                          {vehicle.type === 'bicycle' ? (
                            <BatteryCharging className="w-3.5 h-3.5 text-amber-500" />
                          ) : (
                            <Fuel className="w-3.5 h-3.5 text-blue-500" />
                          )}
                          <span className="font-semibold text-slate-700">{vehicle.fuelOrBatteryLevel}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        <div className="font-bold text-slate-900">${vehicle.hourlyRate.toFixed(2)}/hr</div>
                        <div className="text-slate-500">${vehicle.dailyRate.toFixed(2)}/day</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {vehicle.locationHub}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEdit(vehicle)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Edit Vehicle Specs"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteVehicle(vehicle.id, vehicle.name)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                            title="Delete Vehicle"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredVehicles.length === 0 && (
              <div className="text-center py-10 text-slate-500">
                <Car className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p>No vehicles match your selected filters.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BOOKING VERIFICATION QUEUE */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Booking Verification & Loan Approvals</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Process customer lending requests. Verify driver credentials before authorizing vehicle release.
              </p>
            </div>
            <span className="text-xs px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full font-semibold">
              {pendingBookings.length} Verification(s) Pending
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {transactions.map(tx => {
              const user = users.find(u => u.id === tx.userId);
              const vehicle = vehicles.find(v => v.id === tx.vehicleId);
              const isPending = tx.status === 'pending_verification';

              return (
                <div
                  key={tx.id}
                  className={`bg-white rounded-xl border p-5 transition shadow-sm ${
                    isPending ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      {user && (
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200"
                        />
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-base">{tx.userName || user?.fullName}</span>
                          <span className="text-xs font-mono text-slate-400">({tx.id})</span>
                          <TransactionStatusBadge status={tx.status} />
                        </div>

                        <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>🚗 Vehicle: <strong>{tx.vehicleName}</strong></span>
                          <span>📍 Pickup: <strong>{tx.pickupHub}</strong></span>
                          <span>⏳ Duration: <strong>{tx.durationHours} hrs</strong></span>
                          <span>💳 Total: <strong className="text-emerald-700">${tx.totalCost.toFixed(2)}</strong></span>
                        </div>

                        {user && (
                          <div className="mt-2 text-xs bg-slate-50 p-2 rounded border border-slate-100 flex items-center space-x-3 text-slate-600">
                            <span>License: <strong className="font-mono">{user.driverLicenseNumber || 'N/A'}</strong></span>
                            <span>KYC: <VerificationStatusBadge status={user.verificationStatus} /></span>
                            <span>Phone: {user.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 md:self-center">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleApproveBooking(tx.id)}
                            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Verify & Approve Loan</span>
                          </button>

                          <button
                            onClick={() => handleRejectBooking(tx.id)}
                            className="flex items-center space-x-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-2 rounded-lg text-xs font-semibold transition"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <div className="text-right text-xs text-slate-500">
                          <div>Status: <strong className="text-slate-800">{tx.status.toUpperCase()}</strong></div>
                          <div>Updated: {new Date(tx.updatedAt).toLocaleTimeString()}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: USER & KYC MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="font-bold text-slate-900 text-base">User Accounts & Identity Verification (KYC)</h2>
              <span className="text-xs text-slate-500">Total Registered: {users.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Driver License / ID</th>
                    <th className="py-3 px-4">KYC Status</th>
                    <th className="py-3 px-4">Tier & Rating</th>
                    <th className="py-3 px-4 text-right">KYC Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.avatarUrl}
                            alt={user.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">{user.fullName}</div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'worker' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono">
                        <div>DL: {user.driverLicenseNumber || 'N/A'}</div>
                        <div className="text-slate-400">ID: {user.idCardNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <VerificationStatusBadge status={user.verificationStatus} />
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className="capitalize font-semibold text-slate-700">{user.membershipTier}</span>
                        <div className="text-amber-600 font-bold">★ {user.rating} ({user.totalRentals} rentals)</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {user.verificationStatus === 'pending' ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleVerifyUser(user.id, 'verified')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleVerifyUser(user.id, 'rejected')}
                              className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded text-xs font-semibold transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Validated</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT VEHICLE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">
                {editingVehicle ? 'Edit Vehicle Specifications' : 'Add New Vehicle to Fleet'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Tesla Model Y Long Range"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Tesla, Honda, Trek"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category / Type *</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as VehicleType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="car">🚗 Car (Sedan/SUV/EV)</option>
                    <option value="bike">🏍️ Motorbike / Scooter</option>
                    <option value="bicycle">🚲 City / Electric Bicycle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as VehicleStatus })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">License Plate (or N/A)</label>
                  <input
                    type="text"
                    value={formData.licensePlate}
                    onChange={e => setFormData({ ...formData, licensePlate: e.target.value })}
                    placeholder="e.g. EV-849-TX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Serial / Barcode Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.serialNumber}
                    onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="e.g. TSLA3-998201-2025"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.hourlyRate}
                    onChange={e => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Rate ($)</label>
                  <input
                    type="number"
                    step="1"
                    value={formData.dailyRate}
                    onChange={e => setFormData({ ...formData, dailyRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fuel / Battery Level (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.fuelOrBatteryLevel}
                    onChange={e => setFormData({ ...formData, fuelOrBatteryLevel: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hub Location</label>
                  <select
                    value={formData.locationHub}
                    onChange={e => setFormData({ ...formData, locationHub: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {HUBS.map(hub => (
                      <option key={hub} value={hub}>{hub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inspection & Condition Notes</label>
                <textarea
                  rows={2}
                  value={formData.conditionNotes}
                  onChange={e => setFormData({ ...formData, conditionNotes: e.target.value })}
                  placeholder="e.g. Tires inspected, helmet in storage compartment."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition shadow-sm"
                >
                  {editingVehicle ? 'Update Vehicle' : 'Save & Register to Fleet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
