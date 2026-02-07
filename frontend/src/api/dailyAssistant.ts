/**
 * Daily Assistant API
 */

import { apiClient } from './client';

export interface ChartInterval {
  startTime: string;
  endTime: string;
  solarGenerationKwh: number;
  consumptionKwh: number | null;
  pricePerKwh: number;
  periodName: string;
  shading: 'green' | 'yellow' | 'red' | 'none';
  baseShading: 'green' | 'yellow' | 'none';
}

export interface EnergyEventInfo {
  eventId: string;
  eventType: 'INCREASE_CONSUMPTION' | 'DECREASE_CONSUMPTION';
  startTime: string;
  endTime: string;
  incentiveDescription: string;
  incentiveAmountDollars: number;
}

export interface CurrentStatus {
  solarState: 'high' | 'medium' | 'low';
  consumptionState: 'high' | 'medium' | 'low';
  currentPrice: number;
  actionPrompt: string;
}

export interface ChartDataResponse {
  date: string;
  intervals: ChartInterval[];
  currentStatus: CurrentStatus | null;
  energyEvents: EnergyEventInfo[];
}

export interface EnergyAdvice {
  title: string;
  description: string;
  recommendedTimeStart: string;
  recommendedTimeEnd: string;
  estimatedSavings: number;
  priority: 'high' | 'medium' | 'low';
}

export interface AdviceResponse {
  generalAdvice: EnergyAdvice[];
  evAdvice: EnergyAdvice[];
  batteryAdvice: EnergyAdvice[];
}

export const dailyAssistantApi = {
  getChartData: async (date: 'today' | 'tomorrow'): Promise<ChartDataResponse> => {
    return apiClient.get<ChartDataResponse>(`/daily-assistant/chart-data?date=${date}`);
  },

  getAdvice: async (date: 'today' | 'tomorrow'): Promise<AdviceResponse> => {
    return apiClient.get<AdviceResponse>(`/daily-assistant/advice?date=${date}`);
  },
};
