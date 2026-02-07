import apiClient from './client';

export interface OEMSession {
  user_id: string;
  device_id: string;
  device_type: 'EV' | 'CHARGER' | 'BATTERY';
  market: string;
  locale: string;
  theme_config?: {
    primary_color?: string;
    secondary_color?: string;
    font_family?: string;
    button_style?: 'rounded' | 'square' | 'pill';
    border_radius?: number;
    logo_url?: string;
  };
}

export interface TariffRate {
  startTime: string;
  endTime: string;
  pricePerKwh: number;
}

export interface TariffProfile {
  supplier: string;
  tariffName: string;
  rateType: 'flat' | 'tou';
  rates: TariffRate[];
  standingCharge?: number;
  region?: string;
  postcode?: string;
  confidence?: number;
}

export interface OptimisationPreferences {
  mode: 'fully_managed' | 'events_only';
}

export const onboardingApi = {
  // Initialize session
  initSession: async (oemContext: OEMSession) => {
    const response = await apiClient.post('/sessions/init', oemContext);
    return response.data;
  },

  // Get session
  getSession: async (sessionId: string) => {
    const response = await apiClient.get(`/sessions/${sessionId}`);
    return response.data;
  },

  // Confirm value proposition
  confirmValue: async (sessionId: string) => {
    const response = await apiClient.post(`/sessions/${sessionId}/confirm-value`);
    return response.data;
  },

  // Save tariff
  saveTariff: async (sessionId: string, tariff: TariffProfile) => {
    const response = await apiClient.post(`/sessions/${sessionId}/tariff`, tariff);
    return response.data;
  },

  // Get tariff
  getTariff: async (sessionId: string) => {
    const response = await apiClient.get(`/sessions/${sessionId}/tariff`);
    return response.data;
  },

  // Save preferences
  savePreferences: async (sessionId: string, prefs: OptimisationPreferences) => {
    const response = await apiClient.post(`/sessions/${sessionId}/preferences`, prefs);
    return response.data;
  },

  // Complete session
  completeSession: async (sessionId: string) => {
    const response = await apiClient.post(`/sessions/${sessionId}/complete`);
    return response.data;
  }
};
