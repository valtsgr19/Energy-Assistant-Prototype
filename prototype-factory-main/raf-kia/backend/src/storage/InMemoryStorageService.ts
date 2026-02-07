import { StorageService } from './StorageService';
import { OnboardingSession, TariffProfile, OptimisationPreferences, DeviceBinding, OnboardingStep } from '../types';

export class InMemoryStorageService implements StorageService {
  private sessions: Map<string, OnboardingSession> = new Map();

  async createSession(session: OnboardingSession): Promise<void> {
    this.sessions.set(session.session_id, session);
  }

  async getSession(sessionId: string): Promise<OnboardingSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  async updateSession(sessionId: string, updates: Partial<OnboardingSession>): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    this.sessions.set(sessionId, {
      ...session,
      ...updates,
      updated_at: new Date()
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async completeStep(sessionId: string, step: OnboardingStep): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (!session.completed_steps.includes(step)) {
      session.completed_steps.push(step);
      session.updated_at = new Date();
    }
  }

  async updateCurrentStep(sessionId: string, step: OnboardingStep): Promise<void> {
    await this.updateSession(sessionId, { current_step: step });
  }

  async saveTariffProfile(sessionId: string, tariff: TariffProfile): Promise<void> {
    await this.updateSession(sessionId, { tariff_profile: tariff });
  }

  async getTariffProfile(sessionId: string): Promise<TariffProfile | null> {
    const session = this.sessions.get(sessionId);
    return session?.tariff_profile || null;
  }

  async saveOptimisationPreferences(sessionId: string, prefs: OptimisationPreferences): Promise<void> {
    await this.updateSession(sessionId, { optimisation_preferences: prefs });
  }

  async getOptimisationPreferences(sessionId: string): Promise<OptimisationPreferences | null> {
    const session = this.sessions.get(sessionId);
    return session?.optimisation_preferences || null;
  }

  async saveDeviceBinding(sessionId: string, binding: DeviceBinding): Promise<void> {
    await this.updateSession(sessionId, { device_binding: binding });
  }

  async getDeviceBinding(sessionId: string): Promise<DeviceBinding | null> {
    const session = this.sessions.get(sessionId);
    return session?.device_binding || null;
  }
}
