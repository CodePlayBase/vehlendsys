import type { Vehicle, VehicleType, VehicleStatus } from '../types';

// ------------------------------------------------------------
// Map tipe Indonesia → English
// ------------------------------------------------------------
const TYPE_MAP: Record<string, VehicleType> = {
  mobil: 'car',
  car: 'car',
  motor: 'bike',
  bike: 'bike',
  motorbike: 'bike',
  sepeda: 'bicycle',
  bicycle: 'bicycle',
};

const STATUS_MAP: Record<string, VehicleStatus> = {
  available: 'available',
  tersedia: 'available',
  rented: 'rented',
  disewa: 'rented',
  maintenance: 'maintenance',
  perbaikan: 'maintenance',
  reserved: 'reserved',
  dipesan: 'reserved',
};

// ------------------------------------------------------------
// Normalize 1 vehicle
// ------------------------------------------------------------
export function normalizeVehicle(raw: any): Vehicle {
  // Daily rate: aman kalau undefined
  const dailyRate = Number(raw.dailyRate ?? raw.daily_rate ?? 0);

  // Hourly rate: kalau server tidak kirim, hitung dari daily / 8 jam
  // (asumsi 1 hari kerja = 8 jam — sesuaikan kalau beda)
  const hourlyRate = Number(
    raw.hourlyRate ??
    raw.hourly_rate ??
    (dailyRate > 0 ? dailyRate / 8 : 0)
  );

  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? 'Tanpa Nama'),
    brand: String(raw.brand ?? '-'),
    model: String(raw.model ?? '-'),
    type: TYPE_MAP[String(raw.type ?? '').toLowerCase()] ?? 'car',
    licensePlate: raw.licensePlate ?? raw.plateNumber ?? raw.plate ?? undefined,
    serialNumber: String(raw.serialNumber ?? raw.serial_number ?? raw.id ?? '-'),
    status: STATUS_MAP[String(raw.status ?? '').toLowerCase()] ?? 'available',
    hourlyRate,
    dailyRate,
    fuelOrBatteryLevel: Number(raw.fuelOrBatteryLevel ?? raw.fuelLevel ?? raw.batteryLevel ?? 100),
    locationHub: String(raw.locationHub ?? raw.location ?? raw.hub ?? '-'),
    imageUrl: String(raw.imageUrl ?? raw.image_url ?? raw.image ?? ''),
    year: Number(raw.year ?? new Date().getFullYear()),
    transmission: raw.transmission ?? 'n/a',
    seats: raw.seats ?? raw.capacity ?? undefined,
    conditionNotes: raw.conditionNotes ?? raw.description ?? undefined,
    lastMaintainedDate: String(raw.lastMaintainedDate ?? raw.last_maintained_date ?? new Date().toISOString().split('T')[0]),
    createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
  };
}

// ------------------------------------------------------------
// Normalize array
// ------------------------------------------------------------
export function normalizeVehicles(raw: any[]): Vehicle[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeVehicle);
}



// ------------------------------------------------------------
// Normalize transaction (jaga-jaga kalau schema beda juga)
// ------------------------------------------------------------
// export function normalizeTransaction(raw: any): any {
//   return {
//     ...raw,
//     id: String(raw.id ?? ''),
//     totalCost: Number(raw.totalCost ?? raw.total_cost ?? raw.total ?? 0),
//     durationHours: Number(raw.durationHours ?? raw.duration_hours ?? raw.duration ?? 0),
//     vehicleName: String(raw.vehicleName ?? raw.vehicle_name ?? '-'),
//     userName: String(raw.userName ?? raw.user_name ?? '-'),
//   };
// }

export function normalizeTransaction(raw: any) {
  const start = raw.startDateTime ?? raw.startDate ?? '';
  const end = raw.endDateTime ?? raw.endDate ?? '';
  const totalDays = raw.totalDays ?? 0;
  const durationHours = raw.durationHours ?? (totalDays ? totalDays * 24 : 0);

  const typeRaw = String(raw.vehicleType ?? '').toLowerCase();
  const vehicleType =
    typeRaw === 'mobil' || typeRaw === 'car' ? 'car' :
    typeRaw === 'motor' || typeRaw === 'bike' ? 'bike' :
    typeRaw === 'sepeda' || typeRaw === 'bicycle' ? 'bicycle' :
    'car';

  return {
    id: String(raw.id ?? ''),
    userId: String(raw.userId ?? ''),
    vehicleId: String(raw.vehicleId ?? ''),
    userName: String(raw.userName ?? '-'),
    userPhone: raw.userPhone ?? undefined,
    vehicleName: String(raw.vehicleName ?? '-'),
    vehicleType,
    licensePlate: raw.licensePlate ?? undefined,
    startDateTime: String(start),
    endDateTime: String(end),
    durationHours,
    totalDays,
    totalCost: Number(raw.totalCost ?? raw.totalAmount ?? 0),
    status: raw.status ?? 'pending_verification',
    paymentStatus: raw.paymentStatus ?? 'pending',
    paymentMethod: raw.paymentMethod ?? 'cash_at_hub',
    pickupHub: String(raw.pickupHub ?? '-'),
    dropoffHub: String(raw.dropoffHub ?? '-'),
    notes: raw.notes ?? raw.requestNotes ?? undefined,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    updatedAt: String(raw.updatedAt ?? raw.createdAt ?? new Date().toISOString()),
  };
}

export function normalizeTransactions(raw: any[]): any[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeTransaction);
}