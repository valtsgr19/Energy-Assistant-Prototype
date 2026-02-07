/**
 * Daily Assistant Service
 * 
 * Combines solar forecast, consumption, and tariff data to generate
 * chart data with shading logic and current status information.
 */

import { generateSolarForecast } from './solarForecast.js';
import { getTariffStructure, mapTariffToIntervals, getDefaultTariffStructure } from './tariff.js';
import { getConsumptionWithGaps } from './consumption.js';
import { prisma } from './prisma.js';

export interface ChartInterval {
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  solarGenerationKwh: number;
  consumptionKwh: number | null;
  pricePerKwh: number;
  periodName: string; // Tariff period name (off-peak, shoulder, peak)
  shading: 'green' | 'yellow' | 'red' | 'none';
  baseShading: 'green' | 'yellow' | 'none'; // Shading without considering events
}

export interface EnergyEventInfo {
  eventId: string;
  eventType: 'INCREASE_CONSUMPTION' | 'DECREASE_CONSUMPTION';
  startTime: string; // ISO format
  endTime: string;   // ISO format
  incentiveDescription: string;
  incentiveAmountDollars: number;
}

export interface CurrentStatus {
  solarState: 'high' | 'medium' | 'low';
  consumptionState: 'high' | 'medium' | 'low';
  currentPrice: number;
  actionPrompt: string;
}

export interface ChartData {
  date: string; // YYYY-MM-DD format
  intervals: ChartInterval[];
  currentStatus: CurrentStatus | null;
  energyEvents: EnergyEventInfo[];
}

/**
 * Generate chart data for a specific date
 */
export async function generateChartData(
  userId: string,
  date: Date
): Promise<ChartData> {
  // Get user's solar configuration (or create default if missing)
  let solarConfig = await prisma.solarSystem.findUnique({
    where: { userId }
  });

  if (!solarConfig) {
    // Create default solar configuration (no solar)
    solarConfig = await prisma.solarSystem.create({
      data: {
        userId,
        hasSolar: false,
        systemSizeKw: null,
        tiltDegrees: null,
        orientation: null
      }
    });
  }

  // Generate solar forecast
  const solarForecast = generateSolarForecast(
    {
      hasSolar: solarConfig.hasSolar,
      systemSizeKw: solarConfig.systemSizeKw,
      tiltDegrees: solarConfig.tiltDegrees,
      orientation: solarConfig.orientation
    },
    date
  );

  // Get tariff structure
  let tariffStructure = await getTariffStructure(userId);
  if (!tariffStructure) {
    tariffStructure = getDefaultTariffStructure(userId);
  }

  // Map tariff to intervals
  const tariffIntervals = mapTariffToIntervals(tariffStructure, date);

  // Get consumption data (with gaps handled)
  const consumptionData = await getConsumptionWithGaps(userId, date);

  // Calculate average daily consumption for shading logic
  const avgConsumption = await calculateAverageDailyConsumption(userId);

  // Get active energy events for this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const energyEvents = await prisma.energyEvent.findMany({
    where: {
      AND: [
        { startTime: { lte: endOfDay } },
        { endTime: { gte: startOfDay } },
        {
          OR: [
            { targetUserIds: { contains: userId } },
            { targetUserIds: { equals: 'ALL' } }
          ]
        }
      ]
    }
  });

  // Filter events by targetUserIds
  const activeEvents = energyEvents.filter(event => {
    if (event.targetUserIds === 'ALL') return true;
    const targetIds = event.targetUserIds.split(',').map(id => id.trim());
    return targetIds.includes(userId);
  });

  // Combine data into chart intervals
  const intervals: ChartInterval[] = [];
  for (let i = 0; i < 48; i++) {
    const solarInterval = solarForecast.intervals[i];
    const tariffInterval = tariffIntervals[i];
    const consumptionPoint = consumptionData[i];

    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    const startTime = formatTime(hour, minute);
    const endTime = formatTime(
      minute === 30 ? hour + 1 : hour,
      minute === 30 ? 0 : 30
    );

    // Check if this interval overlaps with any energy event
    const intervalStart = new Date(date);
    intervalStart.setHours(hour, minute, 0, 0);
    const intervalEnd = new Date(intervalStart);
    intervalEnd.setMinutes(intervalEnd.getMinutes() + 30);

    const hasEvent = activeEvents.some(event => 
      event.startTime < intervalEnd && event.endTime > intervalStart
    );

    // Determine base shading (without considering events)
    const baseShading = determineBaseShading(
      solarInterval.generationKwh,
      consumptionPoint.consumptionKwh,
      tariffInterval.pricePerKwh,
      tariffInterval.periodName,
      avgConsumption
    );

    // Determine final shading (with events)
    const shading = hasEvent ? 'red' : baseShading;

    intervals.push({
      startTime,
      endTime,
      solarGenerationKwh: solarInterval.generationKwh,
      consumptionKwh: consumptionPoint.consumptionKwh,
      pricePerKwh: tariffInterval.pricePerKwh,
      periodName: tariffInterval.periodName,
      shading,
      baseShading
    });
  }

  // Calculate current status if date is today
  const currentStatus = isToday(date) 
    ? await calculateCurrentStatus(userId, intervals, solarForecast.intervals, consumptionData)
    : null;

  return {
    date: formatDate(date),
    intervals,
    currentStatus,
    energyEvents: activeEvents.map(event => ({
      eventId: event.id,
      eventType: event.eventType as 'INCREASE_CONSUMPTION' | 'DECREASE_CONSUMPTION',
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      incentiveDescription: event.incentiveDescription,
      incentiveAmountDollars: event.incentiveAmountDollars
    }))
  };
}

/**
 * Determine base shading for an interval (without considering events)
 */
function determineBaseShading(
  solarGeneration: number,
  consumption: number | null,
  price: number,
  periodName: string,
  avgConsumption: number
): 'green' | 'yellow' | 'none' {
  // Green shading conditions:
  // 1. Off-peak tariff period AND consumption < 50% of daily average
  if (periodName === 'off-peak' && consumption !== null && consumption < avgConsumption * 0.5 / 48) {
    return 'green';
  }

  // 2. Solar generation > consumption + 1 kWh
  if (consumption !== null && solarGeneration > consumption + 1) {
    return 'green';
  }

  // Yellow shading conditions:
  // 1. Peak tariff period
  if (periodName === 'peak') {
    return 'yellow';
  }

  // 2. Low solar AND high price
  if (solarGeneration < 0.5 && price > 0.20) {
    return 'yellow';
  }

  return 'none';
}

/**
 * Calculate average daily consumption for a user
 */
async function calculateAverageDailyConsumption(userId: string): Promise<number> {
  // Get last 7 days of consumption data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const dataPoints = await prisma.consumptionDataPoint.findMany({
    where: {
      userId,
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  if (dataPoints.length === 0) {
    return 20; // Default assumption: 20 kWh per day
  }

  const totalConsumption = dataPoints.reduce((sum, point) => sum + point.consumptionKwh, 0);
  const days = Math.max(1, dataPoints.length / 48); // Approximate number of days
  
  return totalConsumption / days;
}

/**
 * Calculate current status for today
 */
async function calculateCurrentStatus(
  userId: string,
  intervals: ChartInterval[],
  solarIntervals: any[],
  consumptionData: any[]
): Promise<CurrentStatus> {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Find current interval (0-47)
  const currentIntervalIndex = currentHour * 2 + (currentMinute >= 30 ? 1 : 0);
  const currentInterval = intervals[currentIntervalIndex];

  // Look ahead 3 hours (6 intervals)
  const lookAheadIntervals = 6;
  const futureIntervalIndex = Math.min(currentIntervalIndex + lookAheadIntervals, 47);
  const futureIntervals = intervals.slice(currentIntervalIndex, futureIntervalIndex + 1);

  // Calculate solar state
  const maxSolarGeneration = Math.max(...solarIntervals.map(i => i.generationKwh));
  const currentSolarGeneration = currentInterval.solarGenerationKwh;
  
  let solarState: 'high' | 'medium' | 'low';
  if (maxSolarGeneration === 0) {
    solarState = 'low';
  } else if (currentSolarGeneration > maxSolarGeneration * 0.7) {
    solarState = 'high';
  } else if (currentSolarGeneration > maxSolarGeneration * 0.3) {
    solarState = 'medium';
  } else {
    solarState = 'low';
  }

  // Calculate consumption state
  const avgConsumption = await calculateAverageDailyConsumption(userId);
  const avgIntervalConsumption = avgConsumption / 48;
  const currentConsumption = currentInterval.consumptionKwh || 0;

  let consumptionState: 'high' | 'medium' | 'low';
  if (currentConsumption > avgIntervalConsumption * 1.5) {
    consumptionState = 'high';
  } else if (currentConsumption > avgIntervalConsumption * 0.7) {
    consumptionState = 'medium';
  } else {
    consumptionState = 'low';
  }

  // Analyze next 3 hours for forward-looking guidance
  const currentShading = currentInterval.shading;
  const currentPrice = currentInterval.pricePerKwh;
  const currentPeriod = intervals[currentIntervalIndex];
  
  // Check if conditions will change in the next 3 hours
  const futureGreenCount = futureIntervals.filter(i => i.shading === 'green').length;
  const futureYellowCount = futureIntervals.filter(i => i.shading === 'yellow').length;
  const futureRedCount = futureIntervals.filter(i => i.shading === 'red').length;
  
  // Check if we're transitioning from good to bad conditions
  const currentlyGood = currentShading === 'green' || (solarState === 'high' && currentPrice < 0.20);
  const futureBad = futureYellowCount > 2 || futureRedCount > 0;
  
  // Check if we're transitioning from bad to good conditions
  const currentlyBad = currentShading === 'yellow' || currentPrice >= 0.25;
  const futureGood = futureGreenCount > 2;
  
  // Check for price changes
  const futurePrices = futureIntervals.map(i => i.pricePerKwh);
  const maxFuturePrice = Math.max(...futurePrices);
  const minFuturePrice = Math.min(...futurePrices);
  const priceWillIncrease = maxFuturePrice > currentPrice * 1.2;
  const priceWillDecrease = minFuturePrice < currentPrice * 0.8;

  // Generate action prompt with forward-looking guidance
  let actionPrompt = '';
  
  // Priority 1: Warn about upcoming bad conditions (tail-end of good period)
  if (currentlyGood && futureBad) {
    const timeUntilChange = futureIntervals.findIndex(i => i.shading === 'yellow' || i.shading === 'red');
    const hoursUntilChange = Math.round(timeUntilChange / 2 * 10) / 10;
    if (hoursUntilChange <= 1.5) {
      actionPrompt = `Good time to use energy now, but prepare to reduce usage in ${hoursUntilChange} hour${hoursUntilChange !== 1 ? 's' : ''}. Peak rates approaching.`;
    } else {
      actionPrompt = `Good time to use energy for the next ${hoursUntilChange} hours. Peak rates will follow.`;
    }
  }
  // Priority 2: High solar with upcoming decline
  else if (solarState === 'high' && consumptionState === 'low') {
    const futureSolarDecline = futureIntervals.slice(2).every(i => i.solarGenerationKwh < currentSolarGeneration * 0.7);
    if (futureSolarDecline) {
      actionPrompt = 'Turn it up now! Solar generation is high but will decline soon. Use energy while it\'s free.';
    } else {
      actionPrompt = 'Turn it up! Solar generation is high and will remain strong for the next few hours.';
    }
  }
  // Priority 3: Currently in peak with upcoming relief
  else if (currentlyBad && futureGood) {
    const timeUntilGood = futureIntervals.findIndex(i => i.shading === 'green');
    const hoursUntilGood = Math.round(timeUntilGood / 2 * 10) / 10;
    actionPrompt = `Reduce usage now. Better rates in ${hoursUntilGood} hour${hoursUntilGood !== 1 ? 's' : ''}. Hold off on high-energy tasks.`;
  }
  // Priority 4: Price will increase significantly
  else if (priceWillIncrease && !currentlyBad) {
    actionPrompt = 'Use energy now if needed. Prices will increase significantly in the next few hours.';
  }
  // Priority 5: Currently in peak period
  else if (currentInterval.pricePerKwh >= 0.25) {
    if (priceWillDecrease) {
      const timeUntilCheaper = futureIntervals.findIndex(i => i.pricePerKwh < currentPrice * 0.8);
      const hoursUntilCheaper = Math.round(timeUntilCheaper / 2 * 10) / 10;
      actionPrompt = `Reduce usage. Peak rates active. Prices will drop in ${hoursUntilCheaper} hour${hoursUntilCheaper !== 1 ? 's' : ''}.`;
    } else {
      actionPrompt = 'Reduce usage. Electricity prices are at peak rates for the next few hours.';
    }
  }
  // Priority 6: Good solar conditions
  else if (solarState === 'high') {
    actionPrompt = 'Good time to use energy. Solar is generating well and conditions remain favorable.';
  }
  // Priority 7: Off-peak rates
  else if (currentInterval.shading === 'green') {
    if (futureBad) {
      actionPrompt = 'Off-peak rates active now. Good time for high-energy tasks before rates increase.';
    } else {
      actionPrompt = 'Off-peak rates active. Good time for high-energy tasks for the next few hours.';
    }
  }
  // Default: Normal conditions
  else {
    if (futureGood) {
      const timeUntilGood = futureIntervals.findIndex(i => i.shading === 'green');
      const hoursUntilGood = Math.round(timeUntilGood / 2 * 10) / 10;
      actionPrompt = `Normal conditions. Better rates coming in ${hoursUntilGood} hour${hoursUntilGood !== 1 ? 's' : ''}.`;
    } else if (futureBad) {
      const timeUntilBad = futureIntervals.findIndex(i => i.shading === 'yellow' || i.shading === 'red');
      const hoursUntilBad = Math.round(timeUntilBad / 2 * 10) / 10;
      actionPrompt = `Normal conditions. Peak rates approaching in ${hoursUntilBad} hour${hoursUntilBad !== 1 ? 's' : ''}.`;
    } else {
      actionPrompt = 'Normal conditions. Steady rates expected for the next few hours.';
    }
  }

  return {
    solarState,
    consumptionState,
    currentPrice: currentInterval.pricePerKwh,
    actionPrompt
  };
}

/**
 * Check if a date is today
 */
function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

/**
 * Format time as HH:MM
 */
function formatTime(hour: number, minute: number): string {
  const normalizedHour = hour === 24 ? 0 : hour;
  return `${normalizedHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}
