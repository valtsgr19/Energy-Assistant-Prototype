// Core data types for Kia smart charging onboarding

export interface OEMSession {
  user_id: string;
  device_id: string;
  device_type: 'EV' | 'CHARGER' | 'BATTERY';
  market: string; // ISO-3166 country code
  locale: string; // IETF locale tag
  theme_config?: ThemeConfig;
}

export interface ThemeConfig {
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
  button_style?: 'rounded' | 'square' | 'pill';
  border_radius?: number;
  logo_url?: string;
}

export type OnboardingStep =
  | 'value-confirmation'
  | 'bill-capture'
  | 'bill-processing'
  | 'tariff-confirmation'
  | 'optimisation-preferences'
  | 'completion';

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
  confidence?: number; // 0-1 confidence score from OCR
}

export interface OptimisationPreferences {
  mode: 'fully_managed' | 'events_only';
}

export interface DeviceBinding {
  device_id: string;
  user_id: string;
  device_type: string;
  bound_at: Date;
}

export interface OnboardingSession {
  session_id: string;
  oem_context: OEMSession;
  current_step: OnboardingStep;
  completed_steps: OnboardingStep[];
  tariff_profile?: TariffProfile;
  optimisation_preferences?: OptimisationPreferences;
  device_binding?: DeviceBinding;
  created_at: Date;
  updated_at: Date;
}

export interface CompletionCallback {
  status: 'completed' | 'cancelled' | 'error';
  session_id: string;
  device_id: string;
  tariff_status: 'confirmed' | 'pending' | 'failed';
  timestamp: Date;
}
