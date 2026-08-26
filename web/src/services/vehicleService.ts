import { apiClient } from '../api/client';
import { Vehicle, VehicleStatus, VehicleType } from '../types';

export interface VehicleFilterParams {
  type?: VehicleType;
  status?: VehicleStatus;
  search?: string;
  locationHub?: string;
  page?: number;
  limit?: number;
}

export const vehicleService = {
  /**
   * Fetch all vehicles with optional filters (e.g. mockapi.io or REST endpoint)
   */
  async getAllVehicles(params?: VehicleFilterParams): Promise<Vehicle[]> {
    return apiClient.get<Vehicle[]>('/vehicles', params);
  },

  /**
   * Fetch single vehicle details by ID
   */
  async getVehicleById(id: string): Promise<Vehicle> {
    return apiClient.get<Vehicle>(`/vehicles/${id}`);
  },

  /**
   * Add a new vehicle to fleet (Admin only)
   */
  async createVehicle(vehicleData: Omit<Vehicle, 'id' | 'createdAt'>): Promise<Vehicle> {
    const payload = {
      ...vehicleData,
      createdAt: new Date().toISOString(),
    };
    return apiClient.post<Vehicle>('/vehicles', payload);
  },

  /**
   * Update vehicle information or fleet specifications
   */
  async updateVehicle(id: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    return apiClient.put<Vehicle>(`/vehicles/${id}`, vehicleData);
  },

  /**
   * Quick status & condition update (e.g. Set to 'maintenance' or update fuel level)
   */
  async updateVehicleStatus(
    id: string,
    status: VehicleStatus,
    fuelOrBatteryLevel?: number,
    conditionNotes?: string
  ): Promise<Vehicle> {
    return apiClient.patch<Vehicle>(`/vehicles/${id}`, {
      status,
      ...(fuelOrBatteryLevel !== undefined ? { fuelOrBatteryLevel } : {}),
      ...(conditionNotes !== undefined ? { conditionNotes } : {}),
      lastMaintainedDate: new Date().toISOString().split('T')[0],
    });
  },

  /**
   * Delete vehicle from fleet inventory
   */
  async deleteVehicle(id: string): Promise<void> {
    return apiClient.delete<void>(`/vehicles/${id}`);
  }
};
