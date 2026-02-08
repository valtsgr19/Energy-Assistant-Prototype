/**
 * Energy Advice Generation Service
 * 
 * Generates actionable energy advice based on solar forecast, consumption,
 * and tariff data. Prioritizes recommendations by cost savings.
 */

import { generateSolarForecast } from './solarForecast.js';
import { getTariffStructure, mapTariffToIntervals, getDefaultTariffStructure } from './tariff.js';
import { getConsumptionWithGaps } from './consumption.js';
import { prisma } from './prisma.js';

export interface EnergyAdvice {
  title: string;
  description: string;
  recommendedTimeStart: string; // HH:MM format
  recommendedTimeEnd: string;   // HH:MM format
  estimatedSavings: number; // dollars
  priority: 'high' | 'medium' | 'low';
}

export interface AdviceResponse {
  generalAdvice: EnergyAdvice[];
  evAdvice: EnergyAdvice[];
  batteryAdvice: EnergyAdvice[];
}

interface IntervalData {
  startTime: string;
  endTime: string;
  solarGenerationKwh: number;
  consumptionKwh: number | null;
  pricePerKwh: number;
  periodName: string;
}

/**
 * Generate all energy advice for a specific date
 */
export async function generateEnergyAdvice(
  userId: string,
  date: Date
): Promise<AdviceResponse> {
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

  // Get consumption data
  const consumptionData = await getConsumptionWithGaps(userId, date);

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

  // Combine data into intervals
  const intervals: IntervalData[] = [];
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

    intervals.push({
      startTime,
      endTime,
      solarGenerationKwh: solarInterval.generationKwh,
      consumptionKwh: consumptionPoint.consumptionKwh,
      pricePerKwh: tariffInterval.pricePerKwh,
      periodName: tariffInterval.periodName
    });
  }

  // Generate general advice (including event-based advice)
  const generalAdvice = await generateGeneralAdvice(intervals, activeEvents, date);

  // Generate EV charging advice
  const evAdvice = await generateEVChargingAdvice(userId, intervals, date);

  // Generate battery charging advice
  const batteryAdvice = await generateBatteryChargingAdvice(userId, intervals, date);

  return {
    generalAdvice,
    evAdvice,
    batteryAdvice
  };
}

/**
 * Generate general energy advice based on intervals
 */
async function generateGeneralAdvice(
  intervals: IntervalData[], 
  energyEvents: any[], 
  date: Date
): Promise<EnergyAdvice[]> {
  const advice: EnergyAdvice[] = [];

  // Generate event-based advice (highest priority)
  const eventAdvice = generateEventAdvice(energyEvents, date);
  advice.push(...eventAdvice);

  // Find solar surplus periods (high priority)
  const solarSurplusAdvice = findSolarSurplusAdvice(intervals);
  advice.push(...solarSurplusAdvice);

  // Find peak avoidance opportunities (high priority)
  const peakAvoidanceAdvice = findPeakAvoidanceAdvice(intervals);
  advice.push(...peakAvoidanceAdvice);

  // Find off-peak opportunities (medium priority)
  const offPeakAdvice = findOffPeakAdvice(intervals);
  advice.push(...offPeakAdvice);

  // Sort by priority and estimated savings
  const sortedAdvice = advice.sort((a, b) => {
    // Priority order: high > medium > low
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    
    // Within same priority, sort by savings
    return b.estimatedSavings - a.estimatedSavings;
  });

  // Return top 3 recommendations
  return sortedAdvice.slice(0, 3);
}

/**
 * Generate advice for active energy events
 */
function generateEventAdvice(energyEvents: any[], date: Date): EnergyAdvice[] {
  const advice: EnergyAdvice[] = [];

  for (const event of energyEvents) {
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);

    // Format times in HH:MM format (using local timezone)
    const startTimeStr = formatTime(startTime.getHours(), startTime.getMinutes());
    const endTimeStr = formatTime(endTime.getHours(), endTime.getMinutes());

    if (event.eventType === 'INCREASE_CONSUMPTION') {
      advice.push({
        title: '⚡ Energy Event: Increase Usage',
        description: `${event.incentiveDescription}. Run high-energy appliances like dishwasher, washing machine, or dryer during this window to earn rewards.`,
        recommendedTimeStart: startTimeStr,
        recommendedTimeEnd: endTimeStr,
        estimatedSavings: event.incentiveAmountDollars,
        priority: 'high'
      });
    } else if (event.eventType === 'DECREASE_CONSUMPTION') {
      advice.push({
        title: '🔻 Energy Event: Reduce Usage',
        description: `${event.incentiveDescription}. Avoid running high-energy appliances during this period to earn rewards and help grid stability.`,
        recommendedTimeStart: startTimeStr,
        recommendedTimeEnd: endTimeStr,
        estimatedSavings: event.incentiveAmountDollars,
        priority: 'high'
      });
    }
  }

  return advice;
}

/**
 * Find advice for solar surplus periods
 * High priority: generation > consumption + 2 kWh
 */
function findSolarSurplusAdvice(intervals: IntervalData[]): EnergyAdvice[] {
  const advice: EnergyAdvice[] = [];
  const surplusWindows: { start: number; end: number; surplus: number }[] = [];

  // Find consecutive intervals with solar surplus
  let windowStart = -1;
  let windowSurplus = 0;

  for (let i = 0; i < intervals.length; i++) {
    const interval = intervals[i];
    const consumption = interval.consumptionKwh || 0;
    const surplus = interval.solarGenerationKwh - consumption;

    if (surplus > 2) {
      if (windowStart === -1) {
        windowStart = i;
        windowSurplus = surplus;
      } else {
        windowSurplus += surplus;
      }
    } else {
      if (windowStart !== -1) {
        surplusWindows.push({
          start: windowStart,
          end: i - 1,
          surplus: windowSurplus
        });
        windowStart = -1;
        windowSurplus = 0;
      }
    }
  }

  // Close final window if needed
  if (windowStart !== -1) {
    surplusWindows.push({
      start: windowStart,
      end: intervals.length - 1,
      surplus: windowSurplus
    });
  }

  // Generate advice for the best surplus window
  if (surplusWindows.length > 0) {
    const bestWindow = surplusWindows.reduce((best, current) => 
      current.surplus > best.surplus ? current : best
    );

    const startInterval = intervals[bestWindow.start];
    const endInterval = intervals[bestWindow.end];

    // Calculate savings (surplus energy that would otherwise be exported at low value)
    const avgPrice = intervals.reduce((sum, i) => sum + i.pricePerKwh, 0) / intervals.length;
    const estimatedSavings = bestWindow.surplus * avgPrice * 0.5; // 50% of retail price for export

    advice.push({
      title: 'Use high-energy appliances during solar peak',
      description: `Run your dryer and turn on the AC between ${startInterval.startTime} and ${endInterval.endTime} to maximize use of excess solar generation`,
      recommendedTimeStart: startInterval.startTime,
      recommendedTimeEnd: endInterval.endTime,
      estimatedSavings: Math.round(estimatedSavings * 100) / 100,
      priority: 'high'
    });
  }

  return advice;
}

/**
 * Find advice for avoiding peak periods
 * High priority: shift consumption away from peak
 */
function findPeakAvoidanceAdvice(intervals: IntervalData[]): EnergyAdvice[] {
  const advice: EnergyAdvice[] = [];

  // Find peak periods
  const peakIntervals = intervals.filter(i => i.periodName === 'peak');
  
  if (peakIntervals.length === 0) {
    return advice;
  }

  // Find the peak period window
  const firstPeak = intervals.findIndex(i => i.periodName === 'peak');
  const lastPeak = intervals.length - 1 - [...intervals].reverse().findIndex(i => i.periodName === 'peak');

  if (firstPeak === -1) {
    return advice;
  }

  const peakStart = intervals[firstPeak];
  const peakEnd = intervals[lastPeak];

  // Calculate potential savings
  const peakPrice = peakIntervals[0].pricePerKwh;
  const offPeakPrice = intervals.find(i => i.periodName === 'off-peak')?.pricePerKwh || 0.07;
  const avgConsumption = 1.5; // Assume 1.5 kWh for high-energy task
  const estimatedSavings = avgConsumption * (peakPrice - offPeakPrice);

  advice.push({
    title: 'Avoid high-energy tasks during peak hours',
    description: `Peak pricing is active from ${peakStart.startTime} to ${peakEnd.endTime}. Delay dishwasher, laundry, and EV charging until after peak hours`,
    recommendedTimeStart: peakEnd.endTime,
    recommendedTimeEnd: '23:59',
    estimatedSavings: Math.round(estimatedSavings * 100) / 100,
    priority: 'high'
  });

  return advice;
}

/**
 * Find advice for off-peak opportunities
 * Medium priority: schedule activities during off-peak
 */
function findOffPeakAdvice(intervals: IntervalData[]): EnergyAdvice[] {
  const advice: EnergyAdvice[] = [];

  // Find overnight off-peak periods
  const overnightOffPeak = intervals.filter((i, idx) => 
    i.periodName === 'off-peak' && idx < 14 // First 7 hours (00:00-07:00)
  );

  if (overnightOffPeak.length > 0) {
    const firstOffPeak = overnightOffPeak[0];
    const lastOffPeak = overnightOffPeak[overnightOffPeak.length - 1];

    // Calculate savings compared to shoulder rate
    const offPeakPrice = firstOffPeak.pricePerKwh;
    const shoulderPrice = intervals.find(i => i.periodName === 'shoulder')?.pricePerKwh || 0.15;
    const avgConsumption = 1.5; // Assume 1.5 kWh for high-energy task
    const estimatedSavings = avgConsumption * (shoulderPrice - offPeakPrice);

    advice.push({
      title: 'Schedule overnight tasks for lowest rates',
      description: `Schedule your dishwasher and washing machine to run between ${firstOffPeak.startTime} and ${lastOffPeak.endTime} for the cheapest electricity rates`,
      recommendedTimeStart: firstOffPeak.startTime,
      recommendedTimeEnd: lastOffPeak.endTime,
      estimatedSavings: Math.round(estimatedSavings * 100) / 100,
      priority: 'medium'
    });
  }

  return advice;
}

/**
 * Generate EV charging advice based on configured EVs
 */
async function generateEVChargingAdvice(
  userId: string,
  intervals: IntervalData[],
  date: Date
): Promise<EnergyAdvice[]> {
  const advice: EnergyAdvice[] = [];

  // Get user's EVs
  const evs = await prisma.electricVehicle.findMany({
    where: { userId }
  });

  if (evs.length === 0) {
    return advice;
  }

  // Generate advice for each EV
  for (const ev of evs) {
    const evAdvice = generateEVAdviceForVehicle(ev, intervals, date);
    advice.push(...evAdvice);
  }

  // Sort by priority and estimated savings
  const sortedAdvice = advice.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    
    return b.estimatedSavings - a.estimatedSavings;
  });

  // Return top 3 EV recommendations
  return sortedAdvice.slice(0, 3);
}

/**
 * Generate charging advice for a specific EV
 */
function generateEVAdviceForVehicle(
  ev: any,
  intervals: IntervalData[],
  date: Date
): EnergyAdvice[] {
  const advice: EnergyAdvice[] = [];

  // Calculate required charging duration
  const milesPerKwh = 3.5; // Average efficiency (Tesla Model 3 ~4, Nissan Leaf ~3)
  const dailyEnergyNeeded = ev.averageDailyMiles / milesPerKwh;
  const chargingHoursNeeded = dailyEnergyNeeded / ev.chargingSpeedKw;
  const intervalsNeeded = Math.ceil(chargingHoursNeeded * 2); // Convert to 30-min intervals

  // Find overnight off-peak charging windows
  const overnightAdvice = findOvernightChargingAdvice(ev, intervals, intervalsNeeded);
  if (overnightAdvice) {
    advice.push(overnightAdvice);
  }

  // Find midday solar charging windows (if solar surplus exists)
  const solarAdvice = findSolarChargingAdvice(ev, intervals, intervalsNeeded);
  if (solarAdvice) {
    advice.push(solarAdvice);
  }

  return advice;
}

/**
 * Find overnight charging advice for EV
 */
function findOvernightChargingAdvice(
  ev: any,
  intervals: IntervalData[],
  intervalsNeeded: number
): EnergyAdvice | null {
  // Find overnight off-peak periods (00:00-07:00)
  const overnightOffPeak = intervals
    .map((interval, idx) => ({ interval, idx }))
    .filter(({ interval, idx }) => 
      interval.periodName === 'off-peak' && idx < 14 // First 7 hours (14 intervals)
    );

  if (overnightOffPeak.length === 0) {
    return null;
  }

  // If we don't have enough consecutive intervals, still provide advice for available window
  const availableIntervals = Math.min(intervalsNeeded, overnightOffPeak.length);

  // Find the best consecutive window
  const bestWindow = findBestChargingWindow(
    overnightOffPeak.map(o => o.interval),
    availableIntervals
  );

  if (!bestWindow) {
    return null;
  }

  const startInterval = overnightOffPeak[bestWindow.start].interval;
  const endIdx = Math.min(bestWindow.start + availableIntervals - 1, overnightOffPeak.length - 1);
  const endInterval = overnightOffPeak[endIdx].interval;

  // Calculate savings compared to peak rate
  const offPeakPrice = startInterval.pricePerKwh;
  const peakPrice = intervals.find(i => i.periodName === 'peak')?.pricePerKwh || 0.35;
  const milesPerKwh = 3.5;
  const dailyEnergyNeeded = ev.averageDailyMiles / milesPerKwh;
  const estimatedSavings = dailyEnergyNeeded * (peakPrice - offPeakPrice);

  const chargingHours = Math.ceil((ev.averageDailyMiles / milesPerKwh) / ev.chargingSpeedKw * 10) / 10;

  return {
    title: `Charge ${ev.make} ${ev.model} overnight`,
    description: `Plug in between ${startInterval.startTime} and ${endInterval.endTime} for lowest rates. Estimated charging time: ${chargingHours} hours for ${ev.averageDailyMiles} miles`,
    recommendedTimeStart: startInterval.startTime,
    recommendedTimeEnd: endInterval.endTime,
    estimatedSavings: Math.round(estimatedSavings * 100) / 100,
    priority: 'high'
  };
}

/**
 * Find solar charging advice for EV
 */
function findSolarChargingAdvice(
  ev: any,
  intervals: IntervalData[],
  intervalsNeeded: number
): EnergyAdvice | null {
  // Find midday periods with solar surplus (10:00-16:00)
  const middayIntervals = intervals
    .map((interval, idx) => ({ interval, idx }))
    .filter(({ interval, idx }) => {
      const consumption = interval.consumptionKwh || 0;
      const surplus = interval.solarGenerationKwh - consumption;
      return idx >= 20 && idx < 32 && surplus > 2; // 10:00-16:00 with 2+ kWh surplus
    });

  if (middayIntervals.length === 0 || middayIntervals.length < intervalsNeeded) {
    return null;
  }

  // Find the best consecutive window
  const bestWindow = findBestChargingWindow(
    middayIntervals.map(m => m.interval),
    intervalsNeeded
  );

  if (!bestWindow) {
    return null;
  }

  const startInterval = middayIntervals[bestWindow.start].interval;
  const endInterval = middayIntervals[Math.min(bestWindow.start + intervalsNeeded - 1, middayIntervals.length - 1)].interval;

  // Calculate savings (using free solar vs buying from grid)
  const avgPrice = intervals.reduce((sum, i) => sum + i.pricePerKwh, 0) / intervals.length;
  const milesPerKwh = 3.5;
  const dailyEnergyNeeded = ev.averageDailyMiles / milesPerKwh;
  const estimatedSavings = dailyEnergyNeeded * avgPrice;

  const chargingHours = Math.ceil((ev.averageDailyMiles / milesPerKwh) / ev.chargingSpeedKw * 10) / 10;

  return {
    title: `Charge ${ev.make} ${ev.model} with solar`,
    description: `Charge between ${startInterval.startTime} and ${endInterval.endTime} to use excess solar generation. Estimated charging time: ${chargingHours} hours`,
    recommendedTimeStart: startInterval.startTime,
    recommendedTimeEnd: endInterval.endTime,
    estimatedSavings: Math.round(estimatedSavings * 100) / 100,
    priority: 'high'
  };
}

/**
 * Find the best consecutive charging window
 */
function findBestChargingWindow(
  intervals: IntervalData[],
  intervalsNeeded: number
): { start: number; avgPrice: number } | null {
  if (intervals.length < intervalsNeeded) {
    return null;
  }

  let bestWindow = { start: 0, avgPrice: Infinity };

  for (let i = 0; i <= intervals.length - intervalsNeeded; i++) {
    const window = intervals.slice(i, i + intervalsNeeded);
    const avgPrice = window.reduce((sum, interval) => sum + interval.pricePerKwh, 0) / intervalsNeeded;

    if (avgPrice < bestWindow.avgPrice) {
      bestWindow = { start: i, avgPrice };
    }
  }

  return bestWindow;
}

/**
 * Generate battery charging advice based on configured batteries
 */
async function generateBatteryChargingAdvice(
  userId: string,
  intervals: IntervalData[],
  date: Date
): Promise<EnergyAdvice[]> {
  const advice: EnergyAdvice[] = [];

  // Get user's batteries
  const batteries = await prisma.homeBattery.findMany({
    where: { userId }
  });

  if (batteries.length === 0) {
    return advice;
  }

  // Get tomorrow's solar forecast to inform battery strategy
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  let tomorrowSolarConfig = await prisma.solarSystem.findUnique({
    where: { userId }
  });

  if (!tomorrowSolarConfig) {
    tomorrowSolarConfig = await prisma.solarSystem.create({
      data: {
        userId,
        hasSolar: false,
        systemSizeKw: null,
        tiltDegrees: null,
        orientation: null
      }
    });
  }

  const tomorrowSolarForecast = generateSolarForecast(
    {
      hasSolar: tomorrowSolarConfig.hasSolar,
      systemSizeKw: tomorrowSolarConfig.systemSizeKw,
      tiltDegrees: tomorrowSolarConfig.tiltDegrees,
      orientation: tomorrowSolarConfig.orientation
    },
    tomorrow
  );

  // Calculate tomorrow's total solar generation
  const tomorrowTotalSolar = tomorrowSolarForecast.intervals.reduce(
    (sum, interval) => sum + interval.generationKwh,
    0
  );

  // Generate advice for each battery
  for (const battery of batteries) {
    const batteryAdvice = generateBatteryAdviceForUnit(
      battery,
      intervals,
      tomorrowTotalSolar,
      date
    );
    advice.push(...batteryAdvice);
  }

  // Sort by priority and estimated savings
  const sortedAdvice = advice.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    
    return b.estimatedSavings - a.estimatedSavings;
  });

  // Return top 3 battery recommendations
  return sortedAdvice.slice(0, 3);
}

/**
 * Generate charging advice for a specific battery
 */
function generateBatteryAdviceForUnit(
  battery: any,
  intervals: IntervalData[],
  tomorrowTotalSolar: number,
  date: Date
): EnergyAdvice[] {
  const advice: EnergyAdvice[] = [];

  // Determine battery strategy based on tomorrow's solar forecast
  const hasSolar = tomorrowTotalSolar > 5; // More than 5 kWh total generation
  const highSolarTomorrow = tomorrowTotalSolar > 20; // High solar day

  if (highSolarTomorrow) {
    // High solar tomorrow: recommend leaving capacity for solar charging
    const solarAdvice = generateSolarStorageAdvice(battery, intervals);
    if (solarAdvice) {
      advice.push(solarAdvice);
    }
  } else {
    // Low/no solar tomorrow: recommend overnight charging
    const overnightAdvice = generateOvernightBatteryChargingAdvice(battery, intervals);
    if (overnightAdvice) {
      advice.push(overnightAdvice);
    }
  }

  // Check for peak periods and recommend pre-charging
  const peakAdvice = generatePeakPreChargingAdvice(battery, intervals);
  if (peakAdvice) {
    advice.push(peakAdvice);
  }

  return advice;
}

/**
 * Generate advice for leaving battery capacity for solar charging
 */
function generateSolarStorageAdvice(
  battery: any,
  intervals: IntervalData[]
): EnergyAdvice | null {
  // Find midday solar surplus periods
  const solarPeriods = intervals.filter((interval, idx) => {
    return idx >= 20 && idx < 32 && interval.solarGenerationKwh > 1; // 10:00-16:00
  });

  if (solarPeriods.length === 0) {
    return null;
  }

  const firstSolar = solarPeriods[0];
  const lastSolar = solarPeriods[solarPeriods.length - 1];

  // Calculate potential savings (storing solar vs buying from grid later)
  const avgPrice = intervals.reduce((sum, i) => sum + i.pricePerKwh, 0) / intervals.length;
  const peakPrice = intervals.find(i => i.periodName === 'peak')?.pricePerKwh || 0.35;
  const estimatedSavings = battery.capacityKwh * (peakPrice - avgPrice * 0.1); // Assume 10% export value

  return {
    title: `Reserve battery for solar charging`,
    description: `Keep battery capacity available between ${firstSolar.startTime} and ${lastSolar.endTime} to store excess solar generation for use during peak hours`,
    recommendedTimeStart: firstSolar.startTime,
    recommendedTimeEnd: lastSolar.endTime,
    estimatedSavings: Math.round(estimatedSavings * 100) / 100,
    priority: 'high'
  };
}

/**
 * Generate advice for overnight battery charging
 */
function generateOvernightBatteryChargingAdvice(
  battery: any,
  intervals: IntervalData[]
): EnergyAdvice | null {
  // Find overnight off-peak periods
  const overnightOffPeak = intervals.filter((interval, idx) => {
    return interval.periodName === 'off-peak' && idx < 14; // 00:00-07:00
  });

  if (overnightOffPeak.length === 0) {
    return null;
  }

  const firstOffPeak = overnightOffPeak[0];
  const lastOffPeak = overnightOffPeak[overnightOffPeak.length - 1];

  // Calculate charging time needed
  const chargingHours = battery.capacityKwh / battery.powerKw;
  const chargingIntervalsNeeded = Math.ceil(chargingHours * 2);

  // Calculate savings (charging at off-peak vs peak)
  const offPeakPrice = firstOffPeak.pricePerKwh;
  const peakPrice = intervals.find(i => i.periodName === 'peak')?.pricePerKwh || 0.35;
  const estimatedSavings = battery.capacityKwh * (peakPrice - offPeakPrice);

  const endIdx = Math.min(chargingIntervalsNeeded - 1, overnightOffPeak.length - 1);
  const endInterval = overnightOffPeak[endIdx];

  return {
    title: `Charge battery overnight`,
    description: `Charge battery from ${firstOffPeak.startTime} to ${endInterval.endTime} during off-peak rates. Estimated charging time: ${Math.round(chargingHours * 10) / 10} hours for ${battery.capacityKwh} kWh capacity`,
    recommendedTimeStart: firstOffPeak.startTime,
    recommendedTimeEnd: endInterval.endTime,
    estimatedSavings: Math.round(estimatedSavings * 100) / 100,
    priority: 'high'
  };
}

/**
 * Generate advice for pre-charging battery before peak periods
 */
function generatePeakPreChargingAdvice(
  battery: any,
  intervals: IntervalData[]
): EnergyAdvice | null {
  // Find peak periods
  const peakIntervals = intervals.filter(i => i.periodName === 'peak');
  
  if (peakIntervals.length === 0) {
    return null;
  }

  // Find the first peak interval
  const firstPeakIdx = intervals.findIndex(i => i.periodName === 'peak');
  
  if (firstPeakIdx < 2) {
    return null; // Not enough time to pre-charge
  }

  // Find shoulder period before peak
  const preChargeStart = Math.max(0, firstPeakIdx - 4); // 2 hours before peak
  const preChargeEnd = firstPeakIdx - 1;

  const startInterval = intervals[preChargeStart];
  const endInterval = intervals[preChargeEnd];
  const firstPeak = intervals[firstPeakIdx];

  // Only recommend if pre-charge period has lower rates
  if (startInterval.pricePerKwh >= firstPeak.pricePerKwh) {
    return null;
  }

  // Calculate savings
  const preChargePrice = startInterval.pricePerKwh;
  const peakPrice = firstPeak.pricePerKwh;
  const estimatedSavings = battery.capacityKwh * (peakPrice - preChargePrice) * 0.5; // Assume 50% usage during peak

  return {
    title: `Pre-charge battery before peak hours`,
    description: `Charge battery from ${startInterval.startTime} to ${endInterval.endTime} to have stored energy available during peak pricing (${firstPeak.startTime} onwards)`,
    recommendedTimeStart: startInterval.startTime,
    recommendedTimeEnd: endInterval.endTime,
    estimatedSavings: Math.round(estimatedSavings * 100) / 100,
    priority: 'medium'
  };
}

/**
 * Format time as HH:MM
 */
function formatTime(hour: number, minute: number): string {
  const normalizedHour = hour === 24 ? 0 : hour;
  return `${normalizedHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}
