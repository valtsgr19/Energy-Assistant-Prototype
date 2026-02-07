/**
 * Consumption Data Service
 * 
 * Handles consumption data retrieval, storage, and retention.
 * Integrates with external energy provider API (mocked).
 */

import { prisma } from './prisma.js';
import { mockEnergyProviderApi } from './mockEnergyProviderApi.js';

export interface ConsumptionDataPoint {
  timestamp: Date;
  consumptionKwh: number;
}

const RETENTION_DAYS = 30;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Fetch consumption data from external API for a date range
 */
export async function fetchConsumptionData(
  userId: string,
  startDate: Date,
  endDate: Date,
  retryCount = 0
): Promise<ConsumptionDataPoint[]> {
  try {
    // Get user's energy account credentials
    const user = await prisma.userProfile.findUnique({
      where: { id: userId },
      select: { energyAccountId: true, energyAccountCredentials: true }
    });

    if (!user?.energyAccountId) {
      throw new Error('Energy account not linked');
    }

    // Fetch from external API (mocked)
    const data = await mockEnergyProviderApi.getConsumptionData(
      user.energyAccountId,
      startDate,
      endDate
    );

    return data;
  } catch (error) {
    // Retry logic for API failures
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      await delay(RETRY_DELAY_MS * (retryCount + 1)); // Exponential backoff
      return fetchConsumptionData(userId, startDate, endDate, retryCount + 1);
    }
    throw error;
  }
}

/**
 * Store consumption data points in the database
 */
export async function storeConsumptionData(
  userId: string,
  dataPoints: ConsumptionDataPoint[]
): Promise<void> {
  // Use upsert to handle duplicate timestamps
  for (const point of dataPoints) {
    await prisma.consumptionDataPoint.upsert({
      where: {
        userId_timestamp: {
          userId,
          timestamp: point.timestamp
        }
      },
      update: {
        consumptionKwh: point.consumptionKwh,
        retrievedAt: new Date()
      },
      create: {
        userId,
        timestamp: point.timestamp,
        consumptionKwh: point.consumptionKwh
      }
    });
  }
}

/**
 * Retrieve consumption data for a specific date
 */
export async function getConsumptionForDate(
  userId: string,
  date: Date
): Promise<ConsumptionDataPoint[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const dataPoints = await prisma.consumptionDataPoint.findMany({
    where: {
      userId,
      timestamp: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    orderBy: { timestamp: 'asc' }
  });

  return dataPoints.map(point => ({
    timestamp: point.timestamp,
    consumptionKwh: point.consumptionKwh
  }));
}

/**
 * Retrieve consumption data for a date range
 */
export async function getConsumptionForRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<ConsumptionDataPoint[]> {
  const dataPoints = await prisma.consumptionDataPoint.findMany({
    where: {
      userId,
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { timestamp: 'asc' }
  });

  return dataPoints.map(point => ({
    timestamp: point.timestamp,
    consumptionKwh: point.consumptionKwh
  }));
}

/**
 * Clean up old consumption data beyond retention period
 */
export async function cleanupOldData(userId: string): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

  const result = await prisma.consumptionDataPoint.deleteMany({
    where: {
      userId,
      timestamp: {
        lt: cutoffDate
      }
    }
  });

  return result.count;
}

/**
 * Sync consumption data for a user
 * Fetches latest data from external API and stores it
 */
export async function syncConsumptionData(
  userId: string,
  daysToSync: number = 7
): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];
  let synced = 0;

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToSync);

    // Fetch data from external API
    const dataPoints = await fetchConsumptionData(userId, startDate, endDate);

    // Store in database
    await storeConsumptionData(userId, dataPoints);
    synced = dataPoints.length;

    // Clean up old data
    await cleanupOldData(userId);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error');
  }

  return { synced, errors };
}

/**
 * Get consumption data with gap handling
 * Returns data points with null values for missing intervals
 * For future dates, generates estimated consumption based on historical patterns
 */
export async function getConsumptionWithGaps(
  userId: string,
  date: Date
): Promise<Array<{ timestamp: Date; consumptionKwh: number | null }>> {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  
  const startOfRequestedDay = new Date(date);
  startOfRequestedDay.setHours(0, 0, 0, 0);
  
  // Check if requested date is in the future
  const isFutureDate = startOfRequestedDay > startOfToday;
  
  if (isFutureDate) {
    // For future dates, generate estimated consumption based on historical average
    return await getEstimatedConsumption(userId, date);
  }
  
  // For past/current dates, use actual data
  const dataPoints = await getConsumptionForDate(userId, date);
  const result: Array<{ timestamp: Date; consumptionKwh: number | null }> = [];

  // Generate all 48 half-hour intervals for the day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  for (let i = 0; i < 48; i++) {
    const timestamp = new Date(startOfDay);
    timestamp.setMinutes(i * 30);

    // Find matching data point
    const dataPoint = dataPoints.find(
      point => point.timestamp.getTime() === timestamp.getTime()
    );

    result.push({
      timestamp,
      consumptionKwh: dataPoint?.consumptionKwh ?? null
    });
  }

  return result;
}

/**
 * Generate estimated consumption for future dates
 * Uses average of last 7 days for each half-hour interval
 */
async function getEstimatedConsumption(
  userId: string,
  date: Date
): Promise<Array<{ timestamp: Date; consumptionKwh: number | null }>> {
  const result: Array<{ timestamp: Date; consumptionKwh: number | null }> = [];
  
  // Get last 7 days of historical data
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  startDate.setHours(0, 0, 0, 0);
  
  const historicalData = await getConsumptionForRange(userId, startDate, endDate);
  
  // If no historical data, return nulls
  if (historicalData.length === 0) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 48; i++) {
      const timestamp = new Date(startOfDay);
      timestamp.setMinutes(i * 30);
      result.push({ timestamp, consumptionKwh: null });
    }
    
    return result;
  }
  
  // Calculate average consumption for each half-hour interval
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 48; i++) {
    const timestamp = new Date(startOfDay);
    timestamp.setMinutes(i * 30);
    
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    
    // Find all historical data points for this time of day
    const matchingPoints = historicalData.filter(point => {
      const pointHour = point.timestamp.getHours();
      const pointMinute = point.timestamp.getMinutes();
      return pointHour === hour && pointMinute === minute;
    });
    
    // Calculate average
    let estimatedConsumption: number | null = null;
    if (matchingPoints.length > 0) {
      const sum = matchingPoints.reduce((acc, point) => acc + point.consumptionKwh, 0);
      estimatedConsumption = Math.round((sum / matchingPoints.length) * 100) / 100;
    }
    
    result.push({
      timestamp,
      consumptionKwh: estimatedConsumption
    });
  }
  
  return result;
}

/**
 * Check if consumption data exists for a date
 */
export async function hasConsumptionData(
  userId: string,
  date: Date
): Promise<boolean> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const count = await prisma.consumptionDataPoint.count({
    where: {
      userId,
      timestamp: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  return count > 0;
}

/**
 * Delay helper for retry logic
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
