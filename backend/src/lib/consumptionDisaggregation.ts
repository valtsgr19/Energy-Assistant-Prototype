/**
 * Consumption Disaggregation Service
 * 
 * Analyzes consumption patterns to estimate energy usage by device category
 */

import { prisma } from './prisma.js';

export interface DisaggregationResult {
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

/**
 * Analyze consumption data to disaggregate by device category
 */
export async function disaggregateConsumption(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<DisaggregationResult> {
  // Get consumption data for the period
  const dataPoints = await prisma.consumptionDataPoint.findMany({
    where: {
      userId,
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: {
      timestamp: 'asc'
    }
  });

  if (dataPoints.length === 0) {
    return getEmptyResult();
  }

  // Check if user has configured EV
  const evs = await prisma.electricVehicle.findMany({
    where: { userId }
  });
  const hasConfiguredEv = evs.length > 0;

  // Calculate total consumption
  const totalKwh = dataPoints.reduce((sum, dp) => sum + dp.consumptionKwh, 0);

  // Detect patterns
  const hvacKwh = detectHVACUsage(dataPoints);
  const waterHeaterKwh = detectWaterHeaterUsage(dataPoints);
  const evChargingResult = detectEVChargingUsage(dataPoints);
  const baseloadKwh = calculateBaseload(dataPoints);

  // Discretionary is what's left after accounting for other categories
  const accountedKwh = hvacKwh + waterHeaterKwh + evChargingResult.kwh + baseloadKwh;
  const discretionaryKwh = Math.max(0, totalKwh - accountedKwh);

  // Calculate percentages
  const hvacPercentage = (hvacKwh / totalKwh) * 100;
  const waterHeaterPercentage = (waterHeaterKwh / totalKwh) * 100;
  const evChargingPercentage = (evChargingResult.kwh / totalKwh) * 100;
  const baseloadPercentage = (baseloadKwh / totalKwh) * 100;
  const discretionaryPercentage = (discretionaryKwh / totalKwh) * 100;

  return {
    hvacKwh,
    waterHeaterKwh,
    evChargingKwh: evChargingResult.kwh,
    baseloadKwh,
    discretionaryKwh,
    totalKwh,
    hvacPercentage,
    waterHeaterPercentage,
    evChargingPercentage,
    baseloadPercentage,
    discretionaryPercentage,
    evPatternDetected: evChargingResult.detected,
    hasConfiguredEv
  };
}

/**
 * Detect HVAC usage based on cyclic patterns
 */
function detectHVACUsage(dataPoints: Array<{ consumptionKwh: number; timestamp: Date }>): number {
  if (dataPoints.length < 48) return 0;

  // HVAC typically shows cyclic patterns with sustained high usage
  // Look for periods where consumption is elevated and sustained
  let hvacTotal = 0;
  const avgConsumption = dataPoints.reduce((sum, dp) => sum + dp.consumptionKwh, 0) / dataPoints.length;

  for (let i = 0; i < dataPoints.length; i++) {
    const dp = dataPoints[i];
    
    // HVAC usage is typically 1.5-3x average consumption
    if (dp.consumptionKwh > avgConsumption * 1.5 && dp.consumptionKwh < avgConsumption * 3) {
      // Check if this is part of a sustained pattern (at least 2 hours)
      let sustainedCount = 1;
      for (let j = i + 1; j < Math.min(i + 4, dataPoints.length); j++) {
        if (dataPoints[j].consumptionKwh > avgConsumption * 1.3) {
          sustainedCount++;
        }
      }
      
      if (sustainedCount >= 3) {
        // Estimate HVAC contribution (roughly 60% of elevated consumption)
        hvacTotal += (dp.consumptionKwh - avgConsumption) * 0.6;
      }
    }
  }

  return Math.max(0, hvacTotal);
}

/**
 * Detect water heater usage based on morning/evening peaks
 */
function detectWaterHeaterUsage(dataPoints: Array<{ consumptionKwh: number; timestamp: Date }>): number {
  let waterHeaterTotal = 0;

  for (const dp of dataPoints) {
    const hour = dp.timestamp.getHours();
    
    // Water heater typically runs in morning (6-9 AM) and evening (6-9 PM)
    const isMorningPeak = hour >= 6 && hour < 9;
    const isEveningPeak = hour >= 18 && hour < 21;
    
    if (isMorningPeak || isEveningPeak) {
      // Water heater contributes roughly 0.5-1.5 kWh during peak times
      // Estimate based on consumption spikes
      if (dp.consumptionKwh > 1.0) {
        waterHeaterTotal += Math.min(1.5, dp.consumptionKwh * 0.15);
      }
    }
  }

  return waterHeaterTotal;
}

/**
 * Detect EV charging patterns
 */
function detectEVChargingUsage(
  dataPoints: Array<{ consumptionKwh: number; timestamp: Date }>
): { kwh: number; detected: boolean } {
  if (dataPoints.length < 48) return { kwh: 0, detected: false };

  let evTotal = 0;
  let chargingSessionsDetected = 0;
  const avgConsumption = dataPoints.reduce((sum, dp) => sum + dp.consumptionKwh, 0) / dataPoints.length;

  // EV charging shows sustained high consumption (typically 3-7 kW for several hours)
  for (let i = 0; i < dataPoints.length; i++) {
    const dp = dataPoints[i];
    const hour = dp.timestamp.getHours();
    
    // EV charging typically happens overnight (10 PM - 6 AM) or midday (11 AM - 2 PM)
    const isOvernightWindow = hour >= 22 || hour < 6;
    const isMiddayWindow = hour >= 11 && hour < 14;
    
    if ((isOvernightWindow || isMiddayWindow) && dp.consumptionKwh > avgConsumption * 2) {
      // Check for sustained high consumption (at least 2 hours)
      let sustainedHours = 1;
      let sessionTotal = dp.consumptionKwh;
      
      for (let j = i + 1; j < Math.min(i + 8, dataPoints.length); j++) {
        if (dataPoints[j].consumptionKwh > avgConsumption * 1.8) {
          sustainedHours++;
          sessionTotal += dataPoints[j].consumptionKwh;
        } else {
          break;
        }
      }
      
      // EV charging sessions are typically 2-6 hours
      if (sustainedHours >= 4 && sustainedHours <= 12) {
        evTotal += sessionTotal * 0.7; // Estimate 70% is EV charging
        chargingSessionsDetected++;
        i += sustainedHours; // Skip ahead to avoid double-counting
      }
    }
  }

  return {
    kwh: evTotal,
    detected: chargingSessionsDetected > 0
  };
}

/**
 * Calculate baseload (always-on devices)
 */
function calculateBaseload(dataPoints: Array<{ consumptionKwh: number; timestamp: Date }>): number {
  if (dataPoints.length === 0) return 0;

  // Baseload is the minimum consumption across all periods
  // This represents always-on devices (fridge, router, standby power, etc.)
  const sortedConsumption = dataPoints
    .map(dp => dp.consumptionKwh)
    .sort((a, b) => a - b);

  // Take the 10th percentile as baseload to avoid outliers
  const percentile10Index = Math.floor(sortedConsumption.length * 0.1);
  const baseloadPerInterval = sortedConsumption[percentile10Index];

  // Multiply by number of intervals to get total baseload
  return baseloadPerInterval * dataPoints.length;
}

/**
 * Get empty result when no data is available
 */
function getEmptyResult(): DisaggregationResult {
  return {
    hvacKwh: 0,
    waterHeaterKwh: 0,
    evChargingKwh: 0,
    baseloadKwh: 0,
    discretionaryKwh: 0,
    totalKwh: 0,
    hvacPercentage: 0,
    waterHeaterPercentage: 0,
    evChargingPercentage: 0,
    baseloadPercentage: 0,
    discretionaryPercentage: 0,
    evPatternDetected: false,
    hasConfiguredEv: false
  };
}
