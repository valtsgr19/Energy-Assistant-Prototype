import {
  User,
  OnboardingProgress,
  OnboardingStep,
  TariffData,
  ChargingPreferences,
  AuthorizationData,
  SiteData
} from '../types';

/**
 * Storage abstraction interface for the EV VPP onboarding system.
 * Supports both in-memory and PostgreSQL implementations.
 */
export interface StorageService {
  // User operations
  createUser(email: string): Promise<User>;
  getUser(userId: string): Promise<User | null>;
  updateUser(userId: string, data: Partial<User>): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;

  // Progress tracking
  getProgress(userId: string): Promise<OnboardingProgress>;
  updateProgress(userId: string, step: OnboardingStep, data: any): Promise<void>;
  completeStep(userId: string, step: OnboardingStep): Promise<void>;

  // Site operations
  saveSite(userId: string, site: SiteData): Promise<void>;
  getSite(userId: string): Promise<SiteData | null>;

  // Tariff operations
  saveTariff(userId: string, tariff: TariffData): Promise<void>;
  getTariff(userId: string): Promise<TariffData | null>;

  // Preferences operations
  savePreferences(userId: string, prefs: ChargingPreferences): Promise<void>;
  getPreferences(userId: string): Promise<ChargingPreferences | null>;

  // Authorization operations
  saveAuthorization(userId: string, auth: AuthorizationData): Promise<void>;
  getAuthorization(userId: string): Promise<AuthorizationData | null>;

  // Manufacturer selection
  saveManufacturer(userId: string, manufacturer: string): Promise<void>;
  getManufacturer(userId: string): Promise<string | null>;

  // Vehicle activation
  activateVehicle(userId: string): Promise<void>;
  getVehicleStatus(userId: string): Promise<'PENDING' | 'ACTIVE' | 'INACTIVE'>;
}
