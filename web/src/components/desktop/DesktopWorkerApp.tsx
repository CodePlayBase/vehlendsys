import React, { useState } from 'react';
import { 
  Monitor, 
  RefreshCw, 
  Search, 
  Barcode, 
  Save, 
  Wrench, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Terminal, 
  Cpu, 
  FileCode,
  HardDrive,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';
import { Vehicle, VehicleStatus } from '../../types';
import { apiStore } from '../../services/apiStore';
import { VehicleStatusBadge, VehicleTypeBadge } from '../shared/Badge';

interface DesktopWorkerAppProps {
  vehicles: Vehicle[];
}

export const DesktopWorkerApp: React.FC<DesktopWorkerAppProps> = ({ vehicles }) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [barcodeSearch, setBarcodeSearch] = useState<string>('');
  const [searchFeedback, setSearchFeedback] = useState<string>('');
  
  // Inspection form state
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];
  const [editStatus, setEditStatus] = useState<VehicleStatus>(selectedVehicle?.status || 'available');
  const [editFuel, setEditFuel] = useState<number>(selectedVehicle?.fuelOrBatteryLevel || 100);
  const [editNotes, setEditNotes] = useState<string>(selectedVehicle?.conditionNotes || '');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateSuccessMessage, setUpdateSuccessMessage] = useState<string>('');

  // Sync edit form when selected vehicle changes
  const handleSelectRow = (vehicle: Vehicle) => {
    setSelectedVehicleId(vehicle.id);
    setEditStatus(vehicle.status);
    setEditFuel(vehicle.fuelOrBatteryLevel);
    setEditNotes(vehicle.conditionNotes || '');
    setUpdateSuccessMessage('');
  };

  const handleBarcodeLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeSearch.trim()) return;

    const query = barcodeSearch.trim().toLowerCase();
    const match = vehicles.find(
      v => v.serialNumber.toLowerCase().includes(query) ||
           (v.licensePlate && v.licensePlate.toLowerCase().includes(query)) ||
           v.name.toLowerCase().includes(query)
    );

    if (match) {
      handleSelectRow(match);
      setSearchFeedback(`✓ Scanned & Selected: ${match.name} (${match.serialNumber})`);
    } else {
      setSearchFeedback(`✕ No matching unit found for barcode "${barcodeSearch}".`);
    }
  };

  const handleSaveInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    setIsUpdating(true);
    // Simulate C# HttpClient PatchAsync with 250ms simulated async network latency
    setTimeout(() => {
      apiStore.updateVehicle(
        selectedVehicle.id,
        {
          status: editStatus,
          fuelOrBatteryLevel: editFuel,
          conditionNotes: editNotes,
          lastMaintainedDate: new Date().toISOString().split('T')[0],
        },
        'Desktop Worker'
      );

      setIsUpdating(false);
      setUpdateSuccessMessage(`Physical check-in for ${selectedVehicle.serialNumber} saved & synced to central API.`);
    }, 250);
  };

  const handleQuickStatusChange = (status: VehicleStatus) => {
    setEditStatus(status);
  };

  return (
    <div className="space-y-6">
      {/* Context banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-purple-600 text-white">WORKER STATION</span>
            <span className="text-slate-400">/desktop</span>
            <span className="text-xs text-slate-500 font-mono">C# .NET 9.0 Windows Forms Client</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">Physical Inventory Inspection & Dispatch Terminal</h2>
          <p className="text-xs text-slate-600">
            Field workers inspect vehicles at hub stations, scan barcodes/plates, record physical battery levels, and toggle maintenance status using asynchronous <code>HttpClient</code>.
          </p>
        </div>
      </div>

      {/* WINFORMS WINDOW FRAME SIMULATION */}
      <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden font-sans">
        
        {/* Windows Title Bar */}
        <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800 text-xs text-slate-200 select-none">
          <div className="flex items-center space-x-2">
            <Monitor className="w-4 h-4 text-purple-400" />
            <span className="font-semibold font-mono">VehicleLending.WorkerTerminal.exe — [Hub: Downtown Station]</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <button className="hover:text-white"><Minimize2 className="w-3.5 h-3.5" /></button>
            <button className="hover:text-white"><Maximize2 className="w-3.5 h-3.5" /></button>
            <button className="hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* WinForms Menu Bar */}
        <div className="bg-slate-200 px-3 py-1 border-b border-slate-300 flex space-x-4 text-xs text-slate-800 select-none">
          <span className="hover:bg-blue-600 hover:text-white px-2 py-0.5 rounded cursor-pointer">File</span>
          <span className="hover:bg-blue-600 hover:text-white px-2 py-0.5 rounded cursor-pointer font-bold">Physical Inventory</span>
          <span className="hover:bg-blue-600 hover:text-white px-2 py-0.5 rounded cursor-pointer">Barcode Scanner</span>
          <span className="hover:bg-blue-600 hover:text-white px-2 py-0.5 rounded cursor-pointer">HttpClient Diagnostics</span>
          <span className="hover:bg-blue-600 hover:text-white px-2 py-0.5 rounded cursor-pointer">Help</span>
        </div>

        {/* WinForms ToolStrip */}
        <div className="bg-slate-100 p-2.5 border-b border-slate-300 flex flex-wrap items-center justify-between gap-3">
          <form onSubmit={handleBarcodeLookup} className="flex items-center space-x-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Barcode className="w-4 h-4 text-slate-500 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Scan Barcode / Serial / Enter License Plate..."
                value={barcodeSearch}
                onChange={e => setBarcodeSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold whitespace-nowrap"
            >
              Scan & Find
            </button>
          </form>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => {
                setUpdateSuccessMessage('Cloud inventory refreshed via HttpClient.GetAsync().');
              }}
              className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded font-medium shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Sync Cloud Data</span>
            </button>
            <span className="text-slate-500 font-mono">Status: Connected (200 OK)</span>
          </div>
        </div>

        {searchFeedback && (
          <div className={`px-4 py-1.5 text-xs font-mono border-b ${
            searchFeedback.startsWith('✓') ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {searchFeedback}
          </div>
        )}

        {/* WinForms Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 bg-slate-200">
          
          {/* DataGridView Simulator (Left 8 cols) */}
          <div className="lg:col-span-7 p-3">
            <div className="bg-white border border-slate-300 rounded shadow-inner overflow-hidden">
              <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 text-xs font-bold text-slate-700 flex justify-between">
                <span>DataGridView: Physical Fleet Inventory</span>
                <span className="font-mono text-slate-500">{vehicles.length} Records</span>
              </div>

              <div className="overflow-x-auto max-h-[480px]">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead className="bg-slate-200 text-slate-700 sticky top-0 border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">Serial / Barcode</th>
                      <th className="p-2 border-r border-slate-300">Vehicle Model</th>
                      <th className="p-2 border-r border-slate-300">Plate</th>
                      <th className="p-2 border-r border-slate-300">Status</th>
                      <th className="p-2 border-r border-slate-300">Level</th>
                      <th className="p-2">Hub</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {vehicles.map((v, idx) => {
                      const isSelected = v.id === selectedVehicle?.id;
                      return (
                        <tr
                          key={v.id}
                          onClick={() => handleSelectRow(v)}
                          className={`cursor-pointer select-none transition ${
                            isSelected
                              ? 'bg-blue-600 text-white font-semibold'
                              : idx % 2 === 0
                              ? 'bg-white hover:bg-blue-50 text-slate-800'
                              : 'bg-slate-50 hover:bg-blue-50 text-slate-800'
                          }`}
                        >
                          <td className="p-2 border-r border-slate-300 whitespace-nowrap">{v.serialNumber}</td>
                          <td className="p-2 border-r border-slate-300 whitespace-nowrap">{v.name}</td>
                          <td className="p-2 border-r border-slate-300 whitespace-nowrap">{v.licensePlate || 'N/A'}</td>
                          <td className="p-2 border-r border-slate-300 whitespace-nowrap uppercase font-bold text-[11px]">
                            {v.status}
                          </td>
                          <td className="p-2 border-r border-slate-300 whitespace-nowrap">{v.fuelOrBatteryLevel}%</td>
                          <td className="p-2 whitespace-nowrap truncate max-w-[120px]">{v.locationHub}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Physical Inspection Dock Panel (Right 5 cols) */}
          <div className="lg:col-span-5 p-3">
            <div className="bg-white border border-slate-300 rounded p-4 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <Wrench className="w-4 h-4 text-purple-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Physical Check-In & Inspection</h3>
                </div>
                <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                  HttpClient.PatchAsync()
                </span>
              </div>

              {selectedVehicle ? (
                <form onSubmit={handleSaveInspection} className="space-y-3.5 text-xs">
                  {/* Selected Vehicle Info Header */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-700 space-y-1">
                    <div className="font-bold text-slate-900 text-sm">{selectedVehicle.name}</div>
                    <div className="font-mono text-[11px] text-slate-500">
                      SN: <strong>{selectedVehicle.serialNumber}</strong> | Plate: {selectedVehicle.licensePlate || 'N/A'}
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      📍 Hub: {selectedVehicle.locationHub}
                    </div>
                  </div>

                  {/* Quick Status Buttons */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">Availability / Operational Status:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange('available')}
                        className={`p-2 rounded border font-bold text-center transition ${
                          editStatus === 'available'
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        🟢 Available
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange('maintenance')}
                        className={`p-2 rounded border font-bold text-center transition ${
                          editStatus === 'maintenance'
                            ? 'bg-rose-600 text-white border-rose-700'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        🔴 In Maintenance
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange('rented')}
                        className={`p-2 rounded border font-bold text-center transition ${
                          editStatus === 'rented'
                            ? 'bg-blue-600 text-white border-blue-700'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        🔵 Rented / Out
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange('reserved')}
                        className={`p-2 rounded border font-bold text-center transition ${
                          editStatus === 'reserved'
                            ? 'bg-amber-600 text-white border-amber-700'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        🟠 Reserved
                      </button>
                    </div>
                  </div>

                  {/* Physical Fuel / Battery Level */}
                  <div>
                    <div className="flex justify-between font-bold text-slate-800 mb-1">
                      <span>Physical Fuel / Battery Level:</span>
                      <span className="font-mono text-blue-600">{editFuel}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editFuel}
                      onChange={e => setEditFuel(parseInt(e.target.value))}
                      className="w-full accent-purple-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>0% (Empty)</span>
                      <span>50%</span>
                      <span>100% (Full Tank/Charge)</span>
                    </div>
                  </div>

                  {/* Condition & Inspection Notes */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Hub Worker Condition Notes:</label>
                    <textarea
                      rows={3}
                      value={editNotes}
                      onChange={e => setEditNotes(e.target.value)}
                      placeholder="e.g. Returned with no scratches. Tire pressure calibrated to 36 PSI."
                      className="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-purple-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold text-xs flex items-center justify-center space-x-2 transition shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isUpdating ? 'Executing HttpClient.PatchAsync()...' : 'Commit & Save Physical Check-In'}</span>
                  </button>

                  {updateSuccessMessage && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-[11px] font-mono">
                      ✓ {updateSuccessMessage}
                    </div>
                  )}
                </form>
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Please select a vehicle row in the DataGridView to inspect.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* WinForms Status Bar */}
        <div className="bg-slate-300 px-3 py-1 border-t border-slate-400 flex justify-between items-center text-[11px] text-slate-700 font-mono select-none">
          <div className="flex items-center space-x-4">
            <span>Worker: Thomas Briggs (Hub Id: #01)</span>
            <span>|</span>
            <span>API Thread Pool: Active (Async/Await)</span>
          </div>
          <div>Ready | Memory: 42.4 MB</div>
        </div>
      </div>
    </div>
  );
};
