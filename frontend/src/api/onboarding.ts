/**
 * Onboarding API
 */

import { apiClient } from './client';

export interface SolarSystemRequest {
  hasSolar: boolean;
  systemSizeKw?: number;
  tiltDegrees?: number;
  orientation?: string;
}

export interface SolarSystemResponse {
  success: boolean;
  solarSystemId?: string;
}

export interface OnboardingStatusResponse {
  onboardingComplete: boolean;
  stepsCompleted: string[];
}

export const onboardingApi = {
  configureSolarSystem: async (data: SolarSystemRequest): Promise<SolarSystemResponse> => {
    return apiClient.post<SolarSystemResponse>('/onboarding/solar-system', data);
  },

  getStatus: async (): Promise<OnboardingStatusResponse> => {
    return apiClient.get<OnboardingStatusResponse>('/onboarding/status');
  },
};
