/**
 * Tariff Management Service
 * 
 * Handles tariff structure storage, retrieval, and interval mapping.
 * Maps tariff periods to 48 half-hour intervals for a given day.
 */

import { prisma } from './prisma.js';

export interface TariffPeriod {
  name: string;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  pricePerKwh: number;
  daysOfWeek: string[]; // ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
}

export interface TariffStructure {
  userId: string;
  effectiveDate: Date;
  periods: TariffPeriod[];
}

export interface TariffInterval {
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  pricePerKwh: number;
  periodName: string;
}

/**
 * Store a tariff structure for a user
 */
export async function storeTariffStructure(tariff: TariffStructure): Promise<void> {
  // Delete existing tariff structures for this user
  await prisma.tariffStructure.deleteMany({
    where: { userId: tariff.userId }
  });

  // Create new tariff structure with periods
  await prisma.tariffStructure.create({
    data: {
      userId: tariff.userId,
      effectiveDate: tariff.effectiveDate,
      periods: {
        create: tariff.periods.map(period => ({
          name: period.name,
          startTime: period.startTime,
          endTime: period.endTime,
          pricePerKwh: period.pricePerKwh,
          daysOfWeek: period.daysOfWeek.join(',')
        }))
      }
    }
  });
}

/**
 * Retrieve the current tariff structure for a user
 */
export async function getTariffStructure(userId: string): Promise<TariffStructure | null> {
  const tariffStructure = await prisma.tariffStructure.findFirst({
    where: { userId },
    include: { periods: true },
    orderBy: { effectiveDate: 'desc' }
  });

  if (!tariffStructure) {
    return null;
  }

  return {
    userId: tariffStructure.userId,
    effectiveDate: tariffStructure.effectiveDate,
    periods: tariffStructure.periods.map(period => ({
      name: period.name,
      startTime: period.startTime,
      endTime: period.endTime,
      pricePerKwh: period.pricePerKwh,
      daysOfWeek: period.daysOfWeek.split(',')
    }))
  };
}

/**
 * Map tariff structure to 48 half-hour intervals for a specific date
 */
export function mapTariffToIntervals(
  tariff: TariffStructure,
  date: Date
): TariffInterval[] {
  const intervals: TariffInterval[] = [];
  const dayOfWeek = getDayOfWeekString(date);

  // Generate 48 half-hour intervals
  for (let i = 0; i < 48; i++) {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    const startTime = formatTime(hour, minute);
    const endTime = formatTime(
      minute === 30 ? hour + 1 : hour,
      minute === 30 ? 0 : 30
    );

    // Find matching tariff period for this interval
    // Check the start time of the interval (not the end time)
    const matchingPeriod = findMatchingPeriod(tariff.periods, startTime, dayOfWeek);

    intervals.push({
      startTime,
      endTime,
      pricePerKwh: matchingPeriod?.pricePerKwh || 0,
      periodName: matchingPeriod?.name || 'unknown'
    });
  }

  return intervals;
}

/**
 * Get day of week as string (MON, TUE, etc.)
 */
function getDayOfWeekString(date: Date): string {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[date.getDay()];
}

/**
 * Format time as HH:MM
 */
function formatTime(hour: number, minute: number): string {
  // Handle hour 24 as 00 (midnight)
  const normalizedHour = hour === 24 ? 0 : hour;
  return `${normalizedHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

/**
 * Find the tariff period that matches a given time and day of week
 */
function findMatchingPeriod(
  periods: TariffPeriod[],
  time: string,
  dayOfWeek: string
): TariffPeriod | null {
  for (const period of periods) {
    // Check if this period applies to the day of week
    if (!period.daysOfWeek.includes(dayOfWeek)) {
      continue;
    }

    // Check if time falls within this period
    if (isTimeInRange(time, period.startTime, period.endTime)) {
      return period;
    }
  }

  return null;
}

/**
 * Check if a time falls within a range
 * Handles ranges that cross midnight (e.g., 22:00 - 06:00)
 * Special case: 00:00 - 00:00 means entire day
 */
function isTimeInRange(time: string, startTime: string, endTime: string): boolean {
  // Special case: 00:00 to 00:00 means entire day
  if (startTime === '00:00' && endTime === '00:00') {
    return true;
  }

  const timeMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  if (startMinutes <= endMinutes) {
    // Normal range (e.g., 09:00 - 17:00)
    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
  } else {
    // Range crosses midnight (e.g., 22:00 - 06:00)
    return timeMinutes >= startMinutes || timeMinutes < endMinutes;
  }
}

/**
 * Convert HH:MM time to minutes since midnight
 * Special case: 24:00 = 1440 minutes (end of day)
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  // Handle 24:00 as end of day
  if (hours === 24) {
    return 24 * 60;
  }
  return hours * 60 + minutes;
}

/**
 * Get default tariff structure (fallback when user tariff is unavailable)
 */
export function getDefaultTariffStructure(userId: string): TariffStructure {
  return {
    userId,
    effectiveDate: new Date(),
    periods: [
      {
        name: 'off-peak',
        startTime: '00:00',
        endTime: '07:00',
        pricePerKwh: 0.07,
        daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
      },
      {
        name: 'shoulder',
        startTime: '07:00',
        endTime: '17:00',
        pricePerKwh: 0.15,
        daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI']
      },
      {
        name: 'shoulder',
        startTime: '07:00',
        endTime: '22:00',
        pricePerKwh: 0.15,
        daysOfWeek: ['SAT', 'SUN']
      },
      {
        name: 'peak',
        startTime: '17:00',
        endTime: '22:00',
        pricePerKwh: 0.30,
        daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI']
      },
      {
        name: 'off-peak',
        startTime: '22:00',
        endTime: '24:00',
        pricePerKwh: 0.07,
        daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
      }
    ]
  };
}
