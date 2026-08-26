import React, { useState } from 'react';
import { 
  Smartphone, 
  Search, 
  MapPin, 
  BatteryCharging, 
  Fuel, 
  Calendar, 
  Clock, 
  CreditCard, 
  CheckCircle, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Info,
  Car,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { Vehicle, User, Transaction, VehicleType } from '../../types';
import { apiStore } from '../../services/apiStore';
import { VehicleTypeBadge, VehicleStatusBadge, TransactionStatusBadge } from '../shared/Badge';
import { HUBS } from '../../data/mockData';

interface MobileCustomerAppProps {
  vehicles: Vehicle[];
  users: User[];
  transactions: Transaction[];
}

export const MobileCustomerApp: React.FC<MobileCustomerAppProps> = ({
  vehicles,
  users,
  transactions,
}) => {
  const [activeCustomer, setActiveCustomer] = useState<User>(users[0] || {} as User);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'catalog' | 'my-trips' | 'profile'>('catalog');

  // Booking Form State
  const [durationHours, setDurationHours] = useState<number>(4);
  const [pickupHub, setPickupHub] = useState<string>(HUBS[0]);
  const [dropoffHub, setDropoffHub] = useState<string>(HUBS[0]);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'e_wallet' | 'cash_at_hub'>('credit_card');
  const [bookingSuccess, setBookingSuccess] = useState<Transaction | null>(null);

  // Filter catalog
  const filteredVehicles = vehicles.filter(v => {
    const matchesType = selectedType === 'all' || v.type === selectedType;
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.locationHub.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Customer's transactions
  const customerTrips = transactions.filter(t => t.userId === activeCustomer.id);

  const handleOpenBorrow = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setPickupHub(vehicle.locationHub);
    setDropoffHub(vehicle.locationHub);
    setDurationHours(4);
    setBookingSuccess(null);
    setIsBorrowModalOpen(true);
  };

  const handleConfirmBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    const totalCost = durationHours >= 24 
      ? Math.ceil(durationHours / 24) * selectedVehicle.dailyRate 
      : durationHours * selectedVehicle.hourlyRate;

    const newTx = apiStore.createTransaction({
      userId: activeCustomer.id,
      vehicleId: selectedVehicle.id,
      userName: activeCustomer.fullName,
      vehicleName: selectedVehicle.name,
      vehicleType: selectedVehicle.type,
      licensePlate: selectedVehicle.licensePlate,
      startDateTime: new Date().toISOString(),
      endDateTime: new Date(Date.now() + durationHours * 3600 * 1000).toISOString(),
      durationHours,
      totalCost,
      status: 'pending_verification',
      paymentStatus: 'paid',
      paymentMethod,
      pickupHub,
      dropoffHub,
      notes: `Requested via Mobile React Native App. Customer verification: ${activeCustomer.verificationStatus}`,
    }, 'Mobile Customer');

    setBookingSuccess(newTx);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Context banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-600 text-white">CUSTOMER MOBILE APP</span>
            <span className="text-slate-400">/mobile</span>
            <span className="text-xs text-slate-500 font-mono">React Native + Expo Simulation</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">Customer Vehicle Lending Client</h2>
          <p className="text-xs text-slate-600">
            Browse real-time vehicle catalog (FlatList UI), check battery/fuel telemetry, and submit borrowing requests.
          </p>
        </div>

        {/* Customer Profile Switcher for Simulation */}
        <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">Logged in as:</span>
          <select
            value={activeCustomer.id}
            onChange={e => {
              const u = users.find(user => user.id === e.target.value);
              if (u) setActiveCustomer(u);
            }}
            className="bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-slate-800 focus:outline-none"
          >
            {users.filter(u => u.role === 'customer').map(u => (
              <option key={u.id} value={u.id}>
                {u.fullName} ({u.verificationStatus})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Dual-Column Layout: Mobile Device Mockup + Live Sync Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT / CENTER: Mobile Smartphone Mockup Viewport */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-sm bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-900/20">
            
            {/* Phone Screen Container */}
            <div className="bg-slate-50 rounded-[36px] overflow-hidden flex flex-col h-[740px] relative border border-slate-200/50">
              
              {/* iOS / Android Status Bar & Dynamic Island */}
              <div className="bg-white px-6 pt-3 pb-2 flex justify-between items-center text-xs font-semibold text-slate-800 border-b border-slate-100 select-none">
                <span>9:41</span>
                <div className="w-20 h-4 bg-slate-900 rounded-full"></div>
                <div className="flex items-center space-x-1.5 text-[10px]">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* In-App Header */}
              <div className="bg-white px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight">Vehicle Lending</h3>
                  <p className="text-[11px] text-slate-500">Find & borrow nearby vehicles</p>
                </div>
                <div className="flex items-center space-x-2">
                  <img
                    src={activeCustomer.avatarUrl}
                    alt={activeCustomer.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                </div>
              </div>

              {/* TAB CONTENT: CATALOG (FLATLIST SIMULATION) */}
              {mobileTab === 'catalog' && (
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3 scrollbar-none">
                  
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search car, bike, bicycle or hub..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* Category Filter Chips (Horizontal Scroll) */}
                  <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                    {[
                      { id: 'all', label: 'All Fleet' },
                      { id: 'car', label: '🚗 Cars' },
                      { id: 'bike', label: '🏍️ Motorbikes' },
                      { id: 'bicycle', label: '🚲 Bicycles' },
                    ].map(chip => (
                      <button
                        key={chip.id}
                        onClick={() => setSelectedType(chip.id)}
                        className={`px-3 py-1 rounded-full font-semibold whitespace-nowrap transition ${
                          selectedType === chip.id
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {/* FlatList Vehicle Cards */}
                  <div className="space-y-3">
                    {filteredVehicles.map(vehicle => {
                      const isAvailable = vehicle.status === 'available';
                      return (
                        <div
                          key={vehicle.id}
                          className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition"
                        >
                          <div className="relative h-36 bg-slate-100">
                            <img
                              src={vehicle.imageUrl}
                              alt={vehicle.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 flex space-x-1">
                              <VehicleStatusBadge status={vehicle.status} />
                            </div>
                            <div className="absolute top-2 right-2">
                              <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                {vehicle.type.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          <div className="p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm leading-tight">{vehicle.name}</h4>
                                <div className="text-[11px] text-slate-500 flex items-center mt-0.5">
                                  <MapPin className="w-3 h-3 text-slate-400 mr-1 shrink-0" />
                                  <span className="truncate max-w-[160px]">{vehicle.locationHub}</span>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="font-extrabold text-slate-900 text-sm">${vehicle.hourlyRate.toFixed(2)}<span className="text-[10px] font-normal text-slate-500">/hr</span></div>
                                <div className="text-[10px] text-slate-400">${vehicle.dailyRate.toFixed(2)}/day</div>
                              </div>
                            </div>

                            {/* Telemetry row */}
                            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                              <div className="flex items-center space-x-1">
                                {vehicle.type === 'bicycle' ? (
                                  <BatteryCharging className="w-3 h-3 text-amber-500" />
                                ) : (
                                  <Fuel className="w-3 h-3 text-blue-500" />
                                )}
                                <span>{vehicle.fuelOrBatteryLevel}% Level</span>
                              </div>

                              {vehicle.seats && (
                                <span>👥 {vehicle.seats} Seats</span>
                              )}

                              <button
                                onClick={() => handleOpenBorrow(vehicle)}
                                disabled={!isAvailable}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                                  isAvailable
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                <span>{isAvailable ? 'Borrow' : 'In Use'}</span>
                                {isAvailable && <ArrowRight className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {filteredVehicles.length === 0 && (
                      <div className="text-center py-12 text-slate-400 text-xs">
                        <Car className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No matching vehicles found.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: MY TRIPS / REQUEST HISTORY */}
              {mobileTab === 'my-trips' && (
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3 scrollbar-none">
                  <h4 className="font-bold text-slate-900 text-sm">My Borrowing Requests & Loans</h4>
                  
                  {customerTrips.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 text-xs">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>You have no active or historical loans yet.</p>
                      <button
                        onClick={() => setMobileTab('catalog')}
                        className="mt-3 text-blue-600 font-semibold underline text-xs"
                      >
                        Explore Vehicle Catalog
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {customerTrips.map(tx => (
                        <div key={tx.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs text-xs space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900">{tx.vehicleName}</span>
                            <TransactionStatusBadge status={tx.status} />
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            {new Date(tx.startDateTime).toLocaleDateString()} • {tx.durationHours} hours loan
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-[11px]">
                            <span className="text-slate-600">Total: <strong>${tx.totalCost.toFixed(2)}</strong></span>
                            <span className="font-mono text-slate-400">{tx.id}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: PROFILE */}
              {mobileTab === 'profile' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none text-xs">
                  <div className="text-center py-2">
                    <img
                      src={activeCustomer.avatarUrl}
                      alt={activeCustomer.fullName}
                      className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-blue-500"
                    />
                    <h4 className="font-bold text-slate-900 text-sm mt-2">{activeCustomer.fullName}</h4>
                    <p className="text-slate-500">{activeCustomer.email}</p>
                    <div className="mt-1">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded uppercase text-[10px]">
                        {activeCustomer.membershipTier} Member
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">KYC Status:</span>
                      <span className="font-semibold text-emerald-600 capitalize">{activeCustomer.verificationStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Driver License:</span>
                      <span className="font-mono font-medium">{activeCustomer.driverLicenseNumber || 'None'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Completed Loans:</span>
                      <span className="font-bold">{activeCustomer.totalRentals}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Bottom Tab Bar */}
              <div className="bg-white border-t border-slate-200 px-6 py-2 flex justify-between items-center text-[10px] text-slate-500 select-none">
                <button
                  onClick={() => setMobileTab('catalog')}
                  className={`flex flex-col items-center space-y-0.5 ${
                    mobileTab === 'catalog' ? 'text-blue-600 font-bold' : 'hover:text-slate-800'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>Catalog</span>
                </button>

                <button
                  onClick={() => setMobileTab('my-trips')}
                  className={`flex flex-col items-center space-y-0.5 ${
                    mobileTab === 'my-trips' ? 'text-blue-600 font-bold' : 'hover:text-slate-800'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>My Trips ({customerTrips.length})</span>
                </button>

                <button
                  onClick={() => setMobileTab('profile')}
                  className={`flex flex-col items-center space-y-0.5 ${
                    mobileTab === 'profile' ? 'text-blue-600 font-bold' : 'hover:text-slate-800'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Mobile Architecture & Real-Time Sync Explainer */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-blue-600 font-bold text-sm">
              <Smartphone className="w-4 h-4" />
              <span>React Native / Expo Architecture</span>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              The customer mobile app communicates asynchronously with the central REST endpoint. 
              When a customer requests a vehicle, the vehicle state transitions to <span className="font-semibold text-amber-700">"reserved"</span> while waiting for Admin KYC verification.
            </p>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-2 font-mono">
              <div className="text-slate-500 font-semibold">// Live Customer State</div>
              <div className="text-slate-800">Customer: <strong>{activeCustomer.fullName}</strong></div>
              <div className="text-slate-800">KYC Status: <span className="text-emerald-600 font-bold">{activeCustomer.verificationStatus.toUpperCase()}</span></div>
              <div className="text-slate-800">License: <strong>{activeCustomer.driverLicenseNumber}</strong></div>
              <div className="text-slate-800">Active Requests: <strong>{customerTrips.length}</strong></div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <h4 className="text-xs font-bold text-slate-800 mb-2">Try the Multi-Platform Lifecycle:</h4>
              <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside">
                <li>Pick an available vehicle on the phone simulator and click <strong>"Borrow"</strong>.</li>
                <li>Submit the request to create a <code>pending_verification</code> transaction.</li>
                <li>Switch to the <strong>Web Admin Portal</strong> tab to verify the customer and approve the loan!</li>
                <li>Switch to the <strong>Desktop Worker Station</strong> to see physical inventory update!</li>
              </ol>
            </div>
          </div>
        </div>

      </div>

      {/* BORROWING MODAL */}
      {isBorrowModalOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            {bookingSuccess ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Borrowing Request Submitted!</h3>
                <p className="text-xs text-slate-600">
                  Your reservation for <strong>{selectedVehicle.name}</strong> was submitted with reference ID <span className="font-mono font-bold text-blue-600">{bookingSuccess.id}</span>.
                </p>
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-amber-800 text-left">
                  ⏳ <strong>Next Step:</strong> Admin verification required before vehicle unlock code is generated.
                </div>
                <button
                  onClick={() => {
                    setIsBorrowModalOpen(false);
                    setMobileTab('my-trips');
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition mt-2"
                >
                  View My Requests
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmBorrow} className="space-y-4">
                <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Request to Borrow Vehicle</h3>
                    <p className="text-xs text-slate-500">{selectedVehicle.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBorrowModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm"
                  >
                    ✕
                  </button>
                </div>

                {/* Duration Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Borrowing Duration:</span>
                    <span className="text-blue-600">{durationHours} Hours ({durationHours >= 24 ? `${Math.round(durationHours / 24)} days` : 'hourly'})</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="72"
                    value={durationHours}
                    onChange={e => setDurationHours(parseInt(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                {/* Pickup Hub */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pickup Hub</label>
                    <select
                      value={pickupHub}
                      onChange={e => setPickupHub(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                    >
                      {HUBS.map(hub => (
                        <option key={hub} value={hub}>{hub}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Dropoff Hub</label>
                    <select
                      value={dropoffHub}
                      onChange={e => setDropoffHub(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                    >
                      {HUBS.map(hub => (
                        <option key={hub} value={hub}>{hub}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { id: 'credit_card', label: 'Credit Card' },
                      { id: 'e_wallet', label: 'E-Wallet' },
                      { id: 'cash_at_hub', label: 'Cash Hub' },
                    ].map(method => (
                      <button
                        type="button"
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`p-2 rounded-lg border text-center font-medium transition ${
                          paymentMethod === method.id
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Rate:</span>
                    <span>${selectedVehicle.hourlyRate.toFixed(2)}/hr (${selectedVehicle.dailyRate.toFixed(2)}/day)</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-200">
                    <span>Estimated Total:</span>
                    <span className="text-emerald-700">
                      ${(durationHours >= 24 
                        ? Math.ceil(durationHours / 24) * selectedVehicle.dailyRate 
                        : durationHours * selectedVehicle.hourlyRate).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Confirm & Submit Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
