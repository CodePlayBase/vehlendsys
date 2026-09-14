export type VehicleType = 'car' | 'bike' | 'bicycle';

export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'reserved';

export type UserRole = 'admin' | 'customer' | 'worker';

export type VerificationStatus = 'verified' | 'pending' | 'rejected';

export type TransactionStatus = 'pending_verification' | 'approved' | 'active' | 'completed' | 'cancelled' | 'rejected';

export type PaymentStatus = 'paid' | 'pending' | 'refunded' | 'failed';

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: VehicleType;
  licensePlate?: string; // For cars and bikes
  serialNumber: string;  // Universal identifier
  status: VehicleStatus;
  hourlyRate: number;
  dailyRate: number;
  fuelOrBatteryLevel: number; // 0 - 100 percentage
  locationHub: string;
  imageUrl: string;
  year: number;
  transmission?: 'automatic' | 'manual' | 'n/a';
  seats?: number;
  conditionNotes?: string;
  lastMaintainedDate: string;
  createdAt: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  avatarUrl: string;
  verificationStatus: VerificationStatus;
  driverLicenseNumber?: string;
  idCardNumber: string;
  membershipTier: 'standard' | 'premium' | 'vip';
  rating: number; // 1-5
  totalRentals: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  vehicleId: string;
  userName?: string;
  vehicleName?: string;
  vehicleType?: VehicleType;
  licensePlate?: string;
  startDateTime: string;
  endDateTime: string;
  durationHours: number;
  totalCost: number;
  status: TransactionStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'credit_card' | 'e_wallet' | 'cash_at_hub';
  pickupHub: string;
  dropoffHub: string;
  notes?: string;
  reviewedByWorkerId?: string;
  approvedByAdminId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  activeRentals: number;
  underMaintenance: number;
  totalUsers: number;
  pendingVerifications: number;
  pendingBookings: number;
  totalRevenueToday: number;
  fleetBreakdown: {
    cars: number;
    bikes: number;
    bicycles: number;
  };
}

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  statusCode: number;
  client: 'Web Admin' | 'Mobile Customer' | 'Desktop Worker' | 'API Explorer';
  durationMs: number;
  payload?: any;
  response?: any;
}
