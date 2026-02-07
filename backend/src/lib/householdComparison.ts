/**
 * Household Comparison and Energy Personality Service
 * 
 * Compares user consumption to similar households and assigns energy personality
 */

import { prisma } from './prisma.js';

export type EnergyPersonality = 
  | 'SOLAR_CHAMPION' 
  | 'NIGHT_OWL' 
  | 'PEAK_AVOIDER' 
  | 'GRID_CONSCIOUS' 
  | 'BALANCED_USER';

export interface EnergyPersonalityResult {
  personality: EnergyPersonality;
  description: string;
  visual: string; // Emoji or icon identifier
}

export interface EventParticipation {
  eventId: string;
  eventDate: string;
  eventType: 'INCREASE_CONSUMPTION' | 'DECREASE_CONSUMPTION';
  performanceDeltaKwh: number;
  incentiveEarned: number;
}

export interface HouseholdComparisonResult {
  userAverageDailyKwh: number;
  similarHouseholdAverageKwh: number;
  comparisonPercentage: number; // Positive means above average, negative means below
  personality: EnergyPersonalityResult;
  eventHistory: EventParticipation[];
}

/**
 * Calculate household comparison and assign energy personality
 */
export async function calculateHouseholdComparison(
  userId: string
): Promise<HouseholdComparisonResult> {
  // Get user's consumption data for last 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const consumptionData = await prisma.consumptionDataPoint.findMany({
    where: {
      userId,
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  // Calculate user's average daily consumption
  const totalKwh = consumptionData.reduce((sum, dp) => sum + dp.consumptionKwh, 0);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const userAverageDailyKwh = days > 0 ? totalKwh / days : 0;

  // Get similar household average (in a real system, this would be based on household size, location, etc.)
  // For now, use a fixed average
  const similarHouseholdAverageKwh = 20; // Average household uses ~20 kWh/day

  // Calculate comparison percentage
  const comparisonPercentage = similarHouseholdAverageKwh > 0
    ? ((userAverageDailyKwh - similarHouseholdAverageKwh) / similarHouseholdAverageKwh) * 100
    : 0;

  // Assign energy personality
  const personality = await assignEnergyPersonality(userId, consumptionData);

  // Get event participation history
  const eventHistory = await getEventParticipationHistory(userId);

  return {
    userAverageDailyKwh,
    similarHouseholdAverageKwh,
    comparisonPercentage,
    personality,
    eventHistory
  };
}

/**
 * Assign energy personality based on consumption patterns
 */
async function assignEnergyPersonality(
  userId: string,
  consumptionData: Array<{ consumptionKwh: number; timestamp: Date }>
): Promise<EnergyPersonalityResult> {
  // Get user's solar configuration
  const solarConfig = await prisma.solarSystem.findUnique({
    where: { userId }
  });

  const hasSolar = solarConfig?.hasSolar || false;

  // Analyze consumption patterns
  let peakConsumption = 0;
  let offPeakConsumption = 0;
  let middayConsumption = 0;
  let nightConsumption = 0;

  for (const dp of consumptionData) {
    const hour = dp.timestamp.getHours();
    
    // Peak hours: 4 PM - 9 PM
    if (hour >= 16 && hour < 21) {
      peakConsumption += dp.consumptionKwh;
    }
    // Off-peak hours: 10 PM - 6 AM
    else if (hour >= 22 || hour < 6) {
      offPeakConsumption += dp.consumptionKwh;
    }
    // Midday hours: 10 AM - 3 PM (solar hours)
    else if (hour >= 10 && hour < 15) {
      middayConsumption += dp.consumptionKwh;
    }
    // Night hours: 6 PM - 11 PM
    else if (hour >= 18 && hour < 23) {
      nightConsumption += dp.consumptionKwh;
    }
  }

  const totalConsumption = consumptionData.reduce((sum, dp) => sum + dp.consumptionKwh, 0);

  // Calculate ratios
  const peakRatio = totalConsumption > 0 ? peakConsumption / totalConsumption : 0;
  const offPeakRatio = totalConsumption > 0 ? offPeakConsumption / totalConsumption : 0;
  const middayRatio = totalConsumption > 0 ? middayConsumption / totalConsumption : 0;
  const nightRatio = totalConsumption > 0 ? nightConsumption / totalConsumption : 0;

  // Assign personality based on patterns
  if (hasSolar && middayRatio > 0.35) {
    return {
      personality: 'SOLAR_CHAMPION',
      description: 'You maximize your solar generation by using energy during peak sun hours. Keep up the great work!',
      visual: '☀️'
    };
  }

  if (offPeakRatio > 0.45) {
    return {
      personality: 'NIGHT_OWL',
      description: 'You shift most of your energy use to off-peak hours, taking advantage of lower rates. Smart strategy!',
      visual: '🦉'
    };
  }

  if (peakRatio < 0.20) {
    return {
      personality: 'PEAK_AVOIDER',
      description: 'You successfully avoid peak hours, helping reduce grid strain and your electricity costs.',
      visual: '🎯'
    };
  }

  if (nightRatio > 0.40) {
    return {
      personality: 'GRID_CONSCIOUS',
      description: 'You spread your energy use throughout the day, helping balance grid demand.',
      visual: '⚡'
    };
  }

  return {
    personality: 'BALANCED_USER',
    description: 'You have a balanced energy usage pattern across different times of day.',
    visual: '⚖️'
  };
}

/**
 * Get event participation history
 */
async function getEventParticipationHistory(userId: string): Promise<EventParticipation[]> {
  const participations = await prisma.eventParticipation.findMany({
    where: { userId },
    include: {
      event: true
    },
    orderBy: {
      event: {
        startTime: 'desc'
      }
    },
    take: 10 // Last 10 events
  });

  return participations.map(p => ({
    eventId: p.eventId,
    eventDate: p.event.startTime.toISOString().split('T')[0],
    eventType: p.event.eventType as 'INCREASE_CONSUMPTION' | 'DECREASE_CONSUMPTION',
    performanceDeltaKwh: p.performanceDeltaKwh,
    incentiveEarned: p.event.incentiveAmountDollars
  }));
}
