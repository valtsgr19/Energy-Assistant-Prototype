/**
 * Energy Insights API
 */

import { apiClient } from './client';

export interface DisaggregationData {
  hvacKwh: number;
  waterHeaterKwh: number;
  evChargingKwh: number;
  baseloadKwh: number;
  discretionaryKwh: number;
  totalKwh: number;
  hvacPercentage: number;
  waterHeaterPercentage: number;
  evChargingPercentage: number;
  baseloadPercentage: number;
  discretionaryPercentage: number;
  evPatternDetected: boolean;
  hasConfiguredEv: boolean;
}

export interface SolarPerformanceData {
  totalGenerationKwh: number;
  totalConsumptionKwh: number;
  totalExportKwh: number;
  selfConsumptionKwh: number;
  selfConsumptionPercentage: number;
  exportPercentage: number;
  recommendations: string[];
}

export type EnergyPersonality = 
  | 'SOLAR_CHAMPION' 
  | 'NIGHT_OWL' 
  | 'PEAK_AVOIDER' 
  | 'GRID_CONSCIOUS' 
  | 'BALANCED_USER';

export interface EnergyPersonalityResult {
  personality: EnergyPersonality;
  description: string;
  visual: string;
}

export interface EventParticipation {
  eventId: string;
  eventDate: string;
  eventType: 'INCREASE_CONSUMPTION' | 'DECREASE_CONSUMPTION';
  performanceDeltaKwh: number;
  incentiveEarned: number;
}

export interface HouseholdComparisonData {
  userAverageDailyKwh: number;
  similarHouseholdAverageKwh: number;
  comparisonPercentage: number;
  personality: EnergyPersonalityResult;
  eventHistory: EventParticipation[];
}

export interface EnergyInsightsResponse {
  disaggregation: DisaggregationData;
  solarPerformance: SolarPerformanceData | null;
  householdComparison: HouseholdComparisonData;
}

export const energyInsightsApi = {
  /**
   * Get all energy insights
   */
  async getInsights(): Promise<EnergyInsightsResponse> {
    return apiClient.get<EnergyInsightsResponse>('/energy-insights');
  },

  /**
   * Get consumption disaggregation only
   */
  async getDisaggregation(): Promise<DisaggregationData> {
    return apiClient.get<DisaggregationData>('/energy-insights/disaggregation');
  },

  /**
   * Get solar performance only
   */
  async getSolarPerformance(): Promise<SolarPerformanceData | null> {
    return apiClient.get<SolarPerformanceData | null>('/energy-insights/solar-performance');
  },

  /**
   * Get household comparison only
   */
  async getHouseholdComparison(): Promise<HouseholdComparisonData> {
    return apiClient.get<HouseholdComparisonData>('/energy-insights/household-comparison');
  }
};
