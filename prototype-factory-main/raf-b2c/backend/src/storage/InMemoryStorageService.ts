import { StorageService } from './StorageService';
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
 * In-memory implementation of StorageService.
 * Fast, no database required, ideal for development and testing.
 * Data is cleared on server restart.
 */
export class InMemoryStorageService implements StorageService {
  private users: Map<string, User> = new Map();
  private usersByEmail: Map<string, string> = new Map();
  private progress: Map<string, OnboardingProgress> = new Map();

  // User operations
  async createUser(email: string): Promise<User> {
    const id = this.generateId();
    const user: User = {
      id,
      email,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    this.usersByEmail.set(email, id);

    // Initialize progress
    this.progress.set(id, {
      userId: id,
      currentStep: 'landing',
      completedSteps: [],
      data: {}
    });

    return user;
  }

  async getUser(userId: string): Promise<User | null> {
    return this.users.get(userId) || null;
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...user,
      ...data,
      updatedAt: new Date()
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const userId = this.usersByEmail.get(email);
    if (!userId) return null;
    return this.users.get(userId) || null;
  }

  // Progress tracking
  async getProgress(userId: string): Promise<OnboardingProgress> {
    const prog = this.progress.get(userId);
    if (!prog) {
      // Return default progress if not found
      return {
        userId,
        currentStep: 'landing',
        completedSteps: [],
        data: {}
      };
    }
    return prog;
  }

  async updateProgress(userId: string, step: OnboardingStep, data: any): Promise<void> {
    const prog = await this.getProgress(userId);
    prog.currentStep = step;
    prog.data = { ...prog.data, ...data };
    this.progress.set(userId, prog);
  }

  async completeStep(userId: string, step: OnboardingStep): Promise<void> {
    const prog = await this.getProgress(userId);
    if (!prog.completedSteps.includes(step)) {
      prog.completedSteps.push(step);
    }
    this.progress.set(userId, prog);
  }

  // Site operations
  async saveSite(userId: string, site: SiteData): Promise<void> {
    const prog = await this.getProgress(userId);
    prog.data.site = site;
    this.progress.set(userId, prog);
  }

  async getSite(userId: string): Promise<SiteData | null> {
    const prog = await this.getProgress(userId);
    return prog.data.site || null;
  }

  // Tariff operations
  async saveTariff(userId: string, tariff: TariffData): Promise<void> {
    const prog = await this.getProgress(userId);
    prog.data.tariff = tariff;
    this.progress.set(userId, prog);
  }

  async getTariff(userId: string): Promise<TariffData | null> {
    const prog = await this.getProgress(userId);
    return prog.data.tariff || null;
  }

  // Preferences operations
  async savePreferences(userId: string, prefs: ChargingPreferences): Promise<void> {
    const prog = await this.getProgress(userId);
    prog.data.preferences = prefs;
    this.progress.set(userId, prog);
  }

  async getPreferences(userId: string): Promise<ChargingPreferences | null> {
    const prog = await this.getProgress(userId);
    return prog.data.preferences || null;
  }

  // Authorization operations
  async saveAuthorization(userId: string, auth: AuthorizationData): Promise<void> {
    const prog = await this.getProgress(userId);
    prog.data.authorization = auth;
    this.progress.set(userId, prog);
  }

  async getAuthorization(userId: string): Promise<AuthorizationData | null> {
    const prog = await this.getProgress(userId);
    return prog.data.authorization || null;
  }

  // Manufacturer selection
  async saveManufacturer(userId: string, manufacturer: string): Promise<void> {
    const prog = await this.getProgress(userId);
    prog.data.manufacturer = manufacturer;
    this.progress.set(userId, prog);
  }

  async getManufacturer(userId: string): Promise<string | null> {
    const prog = await this.getProgress(userId);
    return prog.data.manufacturer || null;
  }

  // Vehicle activation
  async activateVehicle(userId: string): Promise<void> {
    const prog = await this.getProgress(userId);
    if (!prog.data.vehicle) {
      prog.data.vehicle = {
        manufacturer: prog.data.manufacturer || 'unknown',
        supportsSmartCharging: true,
        status: 'ACTIVE'
      };
    } else {
      prog.data.vehicle.status = 'ACTIVE';
    }
    this.progress.set(userId, prog);
  }

  async getVehicleStatus(userId: string): Promise<'PENDING' | 'ACTIVE' | 'INACTIVE'> {
    const prog = await this.getProgress(userId);
    return prog.data.vehicle?.status || 'PENDING';
  }

  // Helper method
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
