/**
 * Settings API Client
 * 
 * Handles API calls for user settings, EVs, and batteries
 */

import { apiClient } from './client';

export interface SolarSystem {
  hasSolar: boolean;
  systemSizeKw: number | null;
  tiltDegrees: number | null;
  orientation: string | null;
}

export interface ElectricVehicle {
  vehicleId: string;
  make: string;
  model: string;
  batteryCapacityKwh: number;
  chargingSpeedKw: number;
  averageDailyMiles: number;
}

export interface HomeBattery {
  batteryId: string;
  powerKw: number;
  capacityKwh: number;
}

export interface UserProfile {
  userId: string;
  energyAccountId: string;
  solarSystem: SolarSystem | null;
  evs: ElectricVehicle[];
  batteries: HomeBattery[];
}

export interface CreateEVRequest {
  make: string;
  model: string;
  chargingSpeedKw: number;
  averageDailyMiles: number;
  batteryCapacityKwh?: number;
}

export interface UpdateEVRequest {
  make?: string;
  model?: string;
  chargingSpeedKw?: number;
  averageDailyMiles?: number;
  batteryCapacityKwh?: number;
}

export interface CreateBatteryRequest {
  powerKw: number;
  capacityKwh: number;
}

export interface UpdateBatteryRequest {
  powerKw?: number;
  capacityKwh?: number;
}

export interface UpdateSolarSystemRequest {
  hasSolar: boolean;
  systemSizeKw?: number;
  tiltDegrees?: number;
  orientation?: string;
}

class SettingsApi {
  async getProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/settings/profile');
  }

  async updateSolarSystem(data: UpdateSolarSystemRequest): Promise<{ success: boolean }> {
    return apiClient.put<{ success: boolean }>('/settings/solar-system', data);
  }

  // EV Management
  async createEV(data: CreateEVRequest): Promise<{ success: boolean; vehicleId: string; batteryCapacityKwh: number }> {
    return apiClient.post<{ success: boolean; vehicleId: string; batteryCapacityKwh: number }>('/settings/ev', data);
  }

  async updateEV(vehicleId: string, data: UpdateEVRequest): Promise<{ success: boolean; vehicleId: string; batteryCapacityKwh: number }> {
    return apiClient.put<{ success: boolean; vehicleId: string; batteryCapacityKwh: number }>(`/settings/ev/${vehicleId}`, data);
  }

  async deleteEV(vehicleId: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/settings/ev/${vehicleId}`);
  }

  // Battery Management
  async createBattery(data: CreateBatteryRequest): Promise<{ success: boolean; batteryId: string }> {
    return apiClient.post<{ success: boolean; batteryId: string }>('/settings/battery', data);
  }

  async updateBattery(batteryId: string, data: UpdateBatteryRequest): Promise<{ success: boolean; batteryId: string }> {
    return apiClient.put<{ success: boolean; batteryId: string }>(`/settings/battery/${batteryId}`, data);
  }

  async deleteBattery(batteryId: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/settings/battery/${batteryId}`);
  }
}

export const settingsApi = new SettingsApi();
