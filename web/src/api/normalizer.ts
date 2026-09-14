// ============================================================
// Normalizer — konversi schema server ke schema internal web
// ============================================================

const TYPE_MAP: Record<string, string> = {
  mobil: 'car', car: 'car',
  motor: 'bike', bike: 'bike',
  sepeda: 'bicycle', bicycle: 'bicycle',
};

const STATUS_MAP: Record<string, string> = {
  tersedia: 'available', available: 'available',
  disewa: 'rented', rented: 'rented',
  perbaikan: 'maintenance', maintenance: 'maintenance',
  dipesan: 'reserved', reserved: 'reserved',
};

export function normalizeVehicle(raw: any) {
  const dailyRate = Number(raw.dailyRate ?? 0);
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? '-'),
    brand: String(raw.brand ?? '-'),
    model: String(raw.model ?? '-'),
    type: TYPE_MAP[String(raw.type ?? '').toLowerCase()] ?? 'car',
    licensePlate: raw.licensePlate ?? raw.plateNumber ?? undefined,
    serialNumber: String(raw.serialNumber ?? raw.id ?? '-'),
    status: STATUS_MAP[String(raw.status ?? '').toLowerCase()] ?? 'available',
    hourlyRate: Number(raw.hourlyRate ?? (dailyRate > 0 ? dailyRate / 8 : 0)),
    dailyRate,
    fuelOrBatteryLevel: Number(raw.fuelOrBatteryLevel ?? raw.fuelLevel ?? 100),
    locationHub: String(raw.locationHub ?? raw.location ?? '-'),
    imageUrl: String(raw.imageUrl ?? ''),
    year: Number(raw.year ?? new Date().getFullYear()),
    transmission: raw.transmission ?? 'n/a',
    seats: raw.seats ?? raw.capacity ?? undefined,
    conditionNotes: raw.conditionNotes ?? raw.description ?? undefined,
    lastMaintainedDate: String(raw.lastMaintainedDate ?? '-'),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  };
}

export function normalizeVehicles(raw: any[]) {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeVehicle);
}

export function normalizeTransaction(raw: any) {
  const start = raw.startDateTime ?? raw.startDate ?? '';
  const end = raw.endDateTime ?? raw.endDate ?? '';
  const totalDays = raw.totalDays ?? 0;
  const durationHours = raw.durationHours ?? (totalDays ? totalDays * 24 : 0);

  return {
    id: String(raw.id ?? ''),
    userId: String(raw.userId ?? ''),
    vehicleId: String(raw.vehicleId ?? ''),
    userName: String(raw.userName ?? '-'),
    userPhone: raw.userPhone ?? undefined,
    vehicleName: String(raw.vehicleName ?? '-'),
    vehicleType: TYPE_MAP[String(raw.vehicleType ?? '').toLowerCase()] ?? 'car',
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

export function normalizeTransactions(raw: any[]) {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeTransaction);
}