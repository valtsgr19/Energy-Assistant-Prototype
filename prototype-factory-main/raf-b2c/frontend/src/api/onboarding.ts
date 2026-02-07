import apiClient from './client';

export interface SiteData {
  address: string;
  postcode: string;
  country: string;
  consentGranted: boolean;
}

export interface TariffRate {
  startTime: string;
  endTime: string;
  pricePerKwh: number;
}

export interface TariffData {
  supplier: string;
  tariffName: string;
  rateType: 'flat' | 'tou';
  rates: TariffRate[];
}

export interface ChargingPreferences {
  readyByTime: string;
  minimumSocPercent: number;
  mode: 'fully_managed' | 'events_only';
}

export interface Manufacturer {
  id: string;
  name: string;
}

export const onboardingApi = {
  // Site and consent
  saveSite: async (userId: string, site: SiteData) => {
    const response = await apiClient.post(`/onboarding/${userId}/site`, site);
    return response.data;
  },

  getSite: async (userId: string) => {
    const response = await apiClient.get(`/onboarding/${userId}/site`);
    return response.data;
  },

  // Tariff
  saveTariff: async (userId: string, tariff: TariffData) => {
    const response = await apiClient.post(`/onboarding/${userId}/tariff`, tariff);
    return response.data;
  },

  getTariff: async (userId: string) => {
    const response = await apiClient.get(`/onboarding/${userId}/tariff`);
    return response.data;
  },

  // Charging preferences
  savePreferences: async (userId: string, prefs: ChargingPreferences) => {
    const response = await apiClient.post(`/onboarding/${userId}/preferences`, prefs);
    return response.data;
  },

  getPreferences: async (userId: string) => {
    const response = await apiClient.get(`/onboarding/${userId}/preferences`);
    return response.data;
  },

  // Manufacturer
  getManufacturers: async (): Promise<{ manufacturers: Manufacturer[] }> => {
    const response = await apiClient.get('/onboarding/manufacturers');
    return response.data;
  },

  saveManufacturer: async (userId: string, manufacturer: string) => {
    const response = await apiClient.post(`/onboarding/${userId}/manufacturer`, { manufacturer });
    return response.data;
  },

  // Activation
  activateVehicle: async (userId: string) => {
    const response = await apiClient.post(`/onboarding/${userId}/activate`);
    return response.data;
  }
};
