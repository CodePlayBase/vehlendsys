import { Vehicle, User, Transaction, DashboardStats, ApiLogEntry, VehicleStatus } from '../types';
import { INITIAL_VEHICLES, INITIAL_USERS, INITIAL_TRANSACTIONS } from '../data/mockData';

const STORAGE_KEY_VEHICLES = 'vls_vehicles_v1';
const STORAGE_KEY_USERS = 'vls_users_v1';
const STORAGE_KEY_TRANSACTIONS = 'vls_transactions_v1';
const STORAGE_KEY_MOCKAPI_URL = 'vls_mockapi_url_v1';

type Listener = () => void;

class ApiStore {
  private vehicles: Vehicle[] = [];
  private users: User[] = [];
  private transactions: Transaction[] = [];
  private listeners: Set<Listener> = new Set();
  private apiLogs: ApiLogEntry[] = [];
  private mockApiUrl: string = '';

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const storedVehicles = localStorage.getItem(STORAGE_KEY_VEHICLES);
      const storedUsers = localStorage.getItem(STORAGE_KEY_USERS);
      const storedTransactions = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      const storedMockApi = localStorage.getItem(STORAGE_KEY_MOCKAPI_URL);

      this.vehicles = storedVehicles ? JSON.parse(storedVehicles) : [...INITIAL_VEHICLES];
      this.users = storedUsers ? JSON.parse(storedUsers) : [...INITIAL_USERS];
      this.transactions = storedTransactions ? JSON.parse(storedTransactions) : [...INITIAL_TRANSACTIONS];
      this.mockApiUrl = storedMockApi || '';
    } catch {
      this.vehicles = [...INITIAL_VEHICLES];
      this.users = [...INITIAL_USERS];
      this.transactions = [...INITIAL_TRANSACTIONS];
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(this.vehicles));
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(this.transactions));
      localStorage.setItem(STORAGE_KEY_MOCKAPI_URL, this.mockApiUrl);
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
    this.notify();
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public resetToDefaults() {
    this.vehicles = [...INITIAL_VEHICLES];
    this.users = [...INITIAL_USERS];
    this.transactions = [...INITIAL_TRANSACTIONS];
    this.saveState();
    this.logApiCall('POST', '/api/system/reset', 200, 'Web Admin', { action: 'reset_all' }, { message: 'Database reset to default seed state' });
  }

  public setMockApiUrl(url: string) {
    this.mockApiUrl = url.trim();
    this.saveState();
  }

  public getMockApiUrl(): string {
    return this.mockApiUrl;
  }

  public getApiLogs(): ApiLogEntry[] {
    return [...this.apiLogs];
  }

  private logApiCall(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    statusCode: number,
    client: 'Web Admin' | 'Mobile Customer' | 'Desktop Worker' | 'API Explorer',
    payload?: any,
    response?: any
  ) {
    const entry: ApiLogEntry = {
      id: 'log_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      method,
      endpoint,
      statusCode,
      client,
      durationMs: Math.floor(Math.random() * 45) + 15,
      payload,
      response,
    };
    this.apiLogs = [entry, ...this.apiLogs.slice(0, 49)];
    //this.notify();
  }

  // --- VEHICLES API ---
  public getVehicles(client: 'Web Admin' | 'Mobile Customer' | 'Desktop Worker' | 'API Explorer' = 'Web Admin'): Vehicle[] {
    this.logApiCall('GET', '/vehicles', 200, client, undefined, { count: this.vehicles.length });
    return [...this.vehicles];
  }

  public getVehicleById(id: string, client: 'Web Admin' | 'Mobile Customer' | 'Desktop Worker' | 'API Explorer' = 'Web Admin'): Vehicle | undefined {
    const vehicle = this.vehicles.find(v => v.id === id);
    this.logApiCall('GET', `/vehicles/${id}`, vehicle ? 200 : 404, client, undefined, vehicle);
    return vehicle;
  }

  public addVehicle(data: Omit<Vehicle, 'id' | 'createdAt'>, client: 'Web Admin' | 'Mobile Customer' | 'Desktop Worker' | 'API Explorer' = 'Web Admin'): Vehicle {
    const newVehicle: Vehicle = {
      ...data,
      id: 'veh_' + Math.random().toString(36).substr(2, 6),
      createdAt: new Date().toISOString(),
    };
    this.vehicles.unshift(newVehicle);
    this.saveState();
    this.logApiCall('POST', '/vehicles', 201, client, data, newVehicle);
    return newVehicle;
  }

  public updateVehicle(id: string, updates: Partial<Vehicle>, client: 'Web Admin' | 'Mobile Customer' | 'Desktop Worker' | 'API Explorer' = 'Web Admin'): Vehicle | null {
    const index = this.vehicles.findIndex(v => v.id === id);
    if (index === -1) {
      this.logApiCall('PATCH', `/vehicles/${id}`, 404, client, updates, { error: 'Vehicle not found' });
      return null;
    }
    const updated = { ...this.vehicles[index], ...updates };
    this.vehicles[index] = updated;
    this.saveState();
    this.logApiCall('PATCH', `/vehicles/${id}`, 200, client, updates, updated);
    return updated;
  }

  public deleteVehicle(id: string, client: 'Web Admin' | 'Mobile Customer' | 'Desktop Worker' | 'API Explorer' = 'Web Admin'): boolean {
    const initialLen = this.vehicles.length;
    this.vehicles = this.vehicles.filter(v => v.id !== id);
    const success = this.vehicles.length < initialLen;
    this.saveState();
    this.logApiCall('DELETE', `/vehicles/${id}`, success ? 204 : 404, client, undefined, { success });
    return success;
  }

  // --- USERS API ---
  public getUsers(client: 'Web Admin' | 'Mobile Customer' | 'Desktop Worker' | 'API Explorer' = 'Web Admin'): User[] {
    this.logApiCall('GET', '/users', 200, client, undefined, { count: this.users.length });
    return [...this.users];
  }

  public updateUserVerification(userId: string, status: 'verified' | 'pending' | 'rejected', client: 'Web Admin' | 'Mobile Customer' | 'Desktop Worker' | 'API Explorer' = 'Web Admin'): User | null {
    const index = this.users.findIndex(u => u.id === userId);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], verificationStatus: status };
    this.saveState();
    this.logApiCall('PATCH', `/users/${userId}`, 200, client, { verificationStatus: status }, this.users[index]);
    return this.users[index];
  }

  // --- TRANSACTIONS API ---
  public getTransactions(client: 'Web Admin' | 'Mobile Customer' | 'Desktop Worker' | 'API Explorer' = 'Web Admin'): Transaction[] {
    this.logApiCall('GET', '/transactions', 200, client, undefined, { count: this.transactions.length });
    return [...this.transactions];
  }

  public createTransaction(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>, client: 'Web Admin' | 'Mobile Customer' | 'Desktop Worker' | 'API Explorer' = 'Mobile Customer'): Transaction {
    const newTx: Transaction = {
      ...data,
      id: 'tx_' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.transactions.unshift(newTx);

    // If booking is pending, set vehicle status to reserved
    const vehicle = this.vehicles.find(v => v.id === data.vehicleId);
    if (vehicle && vehicle.status === 'available') {
      this.updateVehicle(vehicle.id, { status: 'reserved' }, client);
    }

    this.saveState();
    this.logApiCall('POST', '/transactions', 201, client, data, newTx);
    return newTx;
  }

  public updateTransactionStatus(
    txId: string,
    status: Transaction['status'],
    reviewerId?: string,
    client: 'Web Admin' | 'Mobile Customer' | 'Desktop Worker' | 'API Explorer' = 'Web Admin'
  ): Transaction | null {
    const index = this.transactions.findIndex(t => t.id === txId);
    if (index === -1) return null;

    const tx = this.transactions[index];
    const updatedTx: Transaction = {
      ...tx,
      status,
      ...(reviewerId ? { approvedByAdminId: reviewerId } : {}),
      updatedAt: new Date().toISOString(),
    };

    // Update vehicle status according to transaction lifecycle
    if (status === 'approved' || status === 'active') {
      this.updateVehicle(tx.vehicleId, { status: 'rented' }, client);
    } else if (status === 'completed' || status === 'cancelled' || status === 'rejected') {
      this.updateVehicle(tx.vehicleId, { status: 'available' }, client);
    }

    this.transactions[index] = updatedTx;
    this.saveState();
    this.logApiCall('PATCH', `/transactions/${txId}`, 200, client, { status }, updatedTx);
    return updatedTx;
  }

  // --- STATS ---
  public getStats(): DashboardStats {
    const totalVehicles = this.vehicles.length;
    const availableVehicles = this.vehicles.filter(v => v.status === 'available').length;
    const activeRentals = this.vehicles.filter(v => v.status === 'rented').length;
    const underMaintenance = this.vehicles.filter(v => v.status === 'maintenance').length;
    const totalUsers = this.users.length;
    const pendingVerifications = this.users.filter(u => u.verificationStatus === 'pending').length;
    const pendingBookings = this.transactions.filter(t => t.status === 'pending_verification').length;

    const totalRevenueToday = this.transactions
      .filter(t => t.paymentStatus === 'paid')
      .reduce((sum, t) => sum + (t.totalCost || 0), 0);

    const fleetBreakdown = {
      cars: this.vehicles.filter(v => v.type === 'car').length,
      bikes: this.vehicles.filter(v => v.type === 'bike').length,
      bicycles: this.vehicles.filter(v => v.type === 'bicycle').length,
    };

    return {
      totalVehicles,
      availableVehicles,
      activeRentals,
      underMaintenance,
      totalUsers,
      pendingVerifications,
      pendingBookings,
      totalRevenueToday,
      fleetBreakdown,
    };
  }

  public getFullDbExport() {
    return {
      users: this.users,
      vehicles: this.vehicles,
      transactions: this.transactions,
    };
  }
}

export const apiStore = new ApiStore();
