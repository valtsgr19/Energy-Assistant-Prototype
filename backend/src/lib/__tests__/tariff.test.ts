/**
 * Tests for Tariff Management Service
 */

import {
  storeTariffStructure,
  getTariffStructure,
  mapTariffToIntervals,
  getDefaultTariffStructure,
  type TariffStructure,
} from '../tariff.js';
import { createTestUser, cleanDatabase } from '../../__tests__/testSetup.js';

describe('Tariff Management Service', () => {
  let testUserId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const user = await createTestUser();
    testUserId = user.id;
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  describe('storeTariffStructure', () => {
    it('should store a tariff structure with periods', async () => {
      const tariff: TariffStructure = {
        userId: testUserId,
        effectiveDate: new Date('2024-01-01'),
        periods: [
          {
            name: 'off-peak',
            startTime: '00:00',
            endTime: '07:00',
            pricePerKwh: 0.07,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
          },
          {
            name: 'peak',
            startTime: '17:00',
            endTime: '22:00',
            pricePerKwh: 0.30,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI']
          }
        ]
      };

      await storeTariffStructure(tariff);

      const retrieved = await getTariffStructure(testUserId);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.periods).toHaveLength(2);
      expect(retrieved!.periods[0].name).toBe('off-peak');
      expect(retrieved!.periods[0].pricePerKwh).toBe(0.07);
    });

    it('should replace existing tariff structure', async () => {
      const tariff1: TariffStructure = {
        userId: testUserId,
        effectiveDate: new Date('2024-01-01'),
        periods: [
          {
            name: 'flat',
            startTime: '00:00',
            endTime: '00:00',
            pricePerKwh: 0.15,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
          }
        ]
      };

      const tariff2: TariffStructure = {
        userId: testUserId,
        effectiveDate: new Date('2024-02-01'),
        periods: [
          {
            name: 'off-peak',
            startTime: '00:00',
            endTime: '07:00',
            pricePerKwh: 0.07,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
          }
        ]
      };

      await storeTariffStructure(tariff1);
      await storeTariffStructure(tariff2);

      const retrieved = await getTariffStructure(testUserId);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.periods).toHaveLength(1);
      expect(retrieved!.periods[0].name).toBe('off-peak');
    });
  });

  describe('getTariffStructure', () => {
    it('should return null when no tariff exists', async () => {
      const retrieved = await getTariffStructure(testUserId);
      expect(retrieved).toBeNull();
    });

    it('should retrieve stored tariff structure', async () => {
      const tariff: TariffStructure = {
        userId: testUserId,
        effectiveDate: new Date('2024-01-01'),
        periods: [
          {
            name: 'shoulder',
            startTime: '07:00',
            endTime: '17:00',
            pricePerKwh: 0.15,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI']
          }
        ]
      };

      await storeTariffStructure(tariff);
      const retrieved = await getTariffStructure(testUserId);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.userId).toBe(testUserId);
      expect(retrieved!.periods[0].name).toBe('shoulder');
      expect(retrieved!.periods[0].startTime).toBe('07:00');
      expect(retrieved!.periods[0].endTime).toBe('17:00');
      expect(retrieved!.periods[0].pricePerKwh).toBe(0.15);
      expect(retrieved!.periods[0].daysOfWeek).toEqual(['MON', 'TUE', 'WED', 'THU', 'FRI']);
    });
  });

  describe('mapTariffToIntervals', () => {
    it('should generate 48 half-hour intervals', () => {
      const tariff = getDefaultTariffStructure(testUserId);
      const date = new Date('2024-01-15'); // Monday
      const intervals = mapTariffToIntervals(tariff, date);

      expect(intervals).toHaveLength(48);
    });

    it('should map intervals to correct prices', () => {
      const tariff: TariffStructure = {
        userId: testUserId,
        effectiveDate: new Date('2024-01-01'),
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
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
          },
          {
            name: 'peak',
            startTime: '17:00',
            endTime: '22:00',
            pricePerKwh: 0.30,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
          },
          {
            name: 'off-peak',
            startTime: '22:00',
            endTime: '00:00',
            pricePerKwh: 0.07,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
          }
        ]
      };

      const date = new Date('2024-01-15'); // Monday
      const intervals = mapTariffToIntervals(tariff, date);

      // Check midnight (off-peak)
      expect(intervals[0].startTime).toBe('00:00');
      expect(intervals[0].pricePerKwh).toBe(0.07);
      expect(intervals[0].periodName).toBe('off-peak');

      // Check 7:00 AM (shoulder)
      expect(intervals[14].startTime).toBe('07:00');
      expect(intervals[14].pricePerKwh).toBe(0.15);
      expect(intervals[14].periodName).toBe('shoulder');

      // Check 5:00 PM (peak)
      expect(intervals[34].startTime).toBe('17:00');
      expect(intervals[34].pricePerKwh).toBe(0.30);
      expect(intervals[34].periodName).toBe('peak');

      // Check 10:00 PM (off-peak)
      expect(intervals[44].startTime).toBe('22:00');
      expect(intervals[44].pricePerKwh).toBe(0.07);
      expect(intervals[44].periodName).toBe('off-peak');
    });

    it('should handle different rates for weekdays vs weekends', () => {
      const tariff: TariffStructure = {
        userId: testUserId,
        effectiveDate: new Date('2024-01-01'),
        periods: [
          {
            name: 'weekday-peak',
            startTime: '17:00',
            endTime: '22:00',
            pricePerKwh: 0.30,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI']
          },
          {
            name: 'weekend-shoulder',
            startTime: '17:00',
            endTime: '22:00',
            pricePerKwh: 0.15,
            daysOfWeek: ['SAT', 'SUN']
          },
          {
            name: 'off-peak',
            startTime: '00:00',
            endTime: '17:00',
            pricePerKwh: 0.07,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
          },
          {
            name: 'off-peak',
            startTime: '22:00',
            endTime: '00:00',
            pricePerKwh: 0.07,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
          }
        ]
      };

      const monday = new Date('2024-01-15'); // Monday
      const saturday = new Date('2024-01-20'); // Saturday

      const mondayIntervals = mapTariffToIntervals(tariff, monday);
      const saturdayIntervals = mapTariffToIntervals(tariff, saturday);

      // 5:00 PM on Monday should be peak (0.30)
      expect(mondayIntervals[34].pricePerKwh).toBe(0.30);
      expect(mondayIntervals[34].periodName).toBe('weekday-peak');

      // 5:00 PM on Saturday should be shoulder (0.15)
      expect(saturdayIntervals[34].pricePerKwh).toBe(0.15);
      expect(saturdayIntervals[34].periodName).toBe('weekend-shoulder');
    });

    it('should handle periods that cross midnight', () => {
      const tariff: TariffStructure = {
        userId: testUserId,
        effectiveDate: new Date('2024-01-01'),
        periods: [
          {
            name: 'off-peak',
            startTime: '22:00',
            endTime: '07:00',
            pricePerKwh: 0.07,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
          },
          {
            name: 'shoulder',
            startTime: '07:00',
            endTime: '22:00',
            pricePerKwh: 0.15,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
          }
        ]
      };

      const date = new Date('2024-01-15');
      const intervals = mapTariffToIntervals(tariff, date);

      // Midnight should be off-peak
      expect(intervals[0].pricePerKwh).toBe(0.07);
      expect(intervals[0].periodName).toBe('off-peak');

      // 6:30 AM should be off-peak
      expect(intervals[13].startTime).toBe('06:30');
      expect(intervals[13].pricePerKwh).toBe(0.07);

      // 7:00 AM should be shoulder
      expect(intervals[14].pricePerKwh).toBe(0.15);

      // 10:00 PM should be off-peak
      expect(intervals[44].pricePerKwh).toBe(0.07);
    });

    it('should format interval times correctly', () => {
      const tariff = getDefaultTariffStructure(testUserId);
      const date = new Date('2024-01-15');
      const intervals = mapTariffToIntervals(tariff, date);

      // Check first interval
      expect(intervals[0].startTime).toBe('00:00');
      expect(intervals[0].endTime).toBe('00:30');

      // Check second interval
      expect(intervals[1].startTime).toBe('00:30');
      expect(intervals[1].endTime).toBe('01:00');

      // Check noon interval
      expect(intervals[24].startTime).toBe('12:00');
      expect(intervals[24].endTime).toBe('12:30');

      // Check last interval
      expect(intervals[47].startTime).toBe('23:30');
      expect(intervals[47].endTime).toBe('00:00');
    });

    it('should handle flat rate tariff', () => {
      const tariff: TariffStructure = {
        userId: testUserId,
        effectiveDate: new Date('2024-01-01'),
        periods: [
          {
            name: 'flat',
            startTime: '00:00',
            endTime: '00:00',
            pricePerKwh: 0.12,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
          }
        ]
      };

      const date = new Date('2024-01-15');
      const intervals = mapTariffToIntervals(tariff, date);

      // All intervals should have the same price
      intervals.forEach(interval => {
        expect(interval.pricePerKwh).toBe(0.12);
        expect(interval.periodName).toBe('flat');
      });
    });
  });

  describe('getDefaultTariffStructure', () => {
    it('should return a valid default tariff', () => {
      const tariff = getDefaultTariffStructure(testUserId);

      expect(tariff.userId).toBe(testUserId);
      expect(tariff.periods.length).toBeGreaterThan(0);
      expect(tariff.effectiveDate).toBeInstanceOf(Date);
    });

    it('should have off-peak, shoulder, and peak periods', () => {
      const tariff = getDefaultTariffStructure(testUserId);

      const periodNames = tariff.periods.map(p => p.name);
      expect(periodNames).toContain('off-peak');
      expect(periodNames).toContain('shoulder');
      expect(periodNames).toContain('peak');
    });

    it('should have reasonable default prices', () => {
      const tariff = getDefaultTariffStructure(testUserId);

      tariff.periods.forEach(period => {
        expect(period.pricePerKwh).toBeGreaterThan(0);
        expect(period.pricePerKwh).toBeLessThan(1); // Reasonable max price
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty periods array', () => {
      const tariff: TariffStructure = {
        userId: testUserId,
        effectiveDate: new Date('2024-01-01'),
        periods: []
      };

      const date = new Date('2024-01-15');
      const intervals = mapTariffToIntervals(tariff, date);

      expect(intervals).toHaveLength(48);
      // All intervals should have 0 price and 'unknown' period
      intervals.forEach(interval => {
        expect(interval.pricePerKwh).toBe(0);
        expect(interval.periodName).toBe('unknown');
      });
    });

    it('should handle single period covering entire day', () => {
      const tariff: TariffStructure = {
        userId: testUserId,
        effectiveDate: new Date('2024-01-01'),
        periods: [
          {
            name: 'all-day',
            startTime: '00:00',
            endTime: '00:00',
            pricePerKwh: 0.20,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
          }
        ]
      };

      const date = new Date('2024-01-15');
      const intervals = mapTariffToIntervals(tariff, date);

      intervals.forEach(interval => {
        expect(interval.pricePerKwh).toBe(0.20);
        expect(interval.periodName).toBe('all-day');
      });
    });

    it('should handle multiple overlapping periods (first match wins)', () => {
      const tariff: TariffStructure = {
        userId: testUserId,
        effectiveDate: new Date('2024-01-01'),
        periods: [
          {
            name: 'period1',
            startTime: '10:00',
            endTime: '14:00',
            pricePerKwh: 0.10,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
          },
          {
            name: 'period2',
            startTime: '12:00',
            endTime: '16:00',
            pricePerKwh: 0.20,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
          }
        ]
      };

      const date = new Date('2024-01-15');
      const intervals = mapTariffToIntervals(tariff, date);

      // 12:00 should match period1 (first match)
      expect(intervals[24].pricePerKwh).toBe(0.10);
      expect(intervals[24].periodName).toBe('period1');
    });
  });
});
