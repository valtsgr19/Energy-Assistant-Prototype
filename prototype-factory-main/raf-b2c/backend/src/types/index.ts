// Core data types for the EV VPP onboarding system

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type OnboardingStep =
  | 'landing'
  | 'signup-overview'
  | 'email-capture'
  | 'bill-upload'
  | 'bill-processing'
  | 'address-consent'
  | 'tariff-confirmation'
  | 'charging-preferences'
  | 'manufacturer-selection'
  | 'oem-authorization'
  | 'authorization-return'
  | 'activated';

export interface SiteData {
  siteId: string;
  address: string;
  postcode: string;
  country: string;
  consentGranted: boolean;
  consentTimestamp: Date;
}

export interface MeterData {
  meterId: string;
  intervalMinutes: number;
  dataConsent: boolean;
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

export interface VehicleData {
  manufacturer: string;
  model?: string;
  batteryCapacityKwh?: number;
  supportsSmartCharging: boolean;
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
}

export interface AuthorizationData {
  provider: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scopesGranted: string[];
  authorizedAt: Date;
  revocable: boolean;
}

export interface OnboardingProgress {
  userId: string;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  data: {
    site?: SiteData;
    meter?: MeterData;
    tariff?: TariffData;
    preferences?: ChargingPreferences;
    manufacturer?: string;
    vehicle?: VehicleData;
    authorization?: AuthorizationData;
  };
}
