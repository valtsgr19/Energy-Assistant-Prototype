import { OnboardingSession, TariffProfile, OptimisationPreferences, DeviceBinding, OnboardingStep } from '../types';

export interface StorageService {
  // Session management
  createSession(session: OnboardingSession): Promise<void>;
  getSession(sessionId: string): Promise<OnboardingSession | null>;
  updateSession(sessionId: string, updates: Partial<OnboardingSession>): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;

  // Step tracking
  completeStep(sessionId: string, step: OnboardingStep): Promise<void>;
  updateCurrentStep(sessionId: string, step: OnboardingStep): Promise<void>;

  // Data storage
  saveTariffProfile(sessionId: string, tariff: TariffProfile): Promise<void>;
  getTariffProfile(sessionId: string): Promise<TariffProfile | null>;
  
  saveOptimisationPreferences(sessionId: string, prefs: OptimisationPreferences): Promise<void>;
  getOptimisationPreferences(sessionId: string): Promise<OptimisationPreferences | null>;
  
  saveDeviceBinding(sessionId: string, binding: DeviceBinding): Promise<void>;
  getDeviceBinding(sessionId: string): Promise<DeviceBinding | null>;
}
