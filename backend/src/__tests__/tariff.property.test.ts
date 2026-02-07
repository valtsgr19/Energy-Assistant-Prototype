/**
 * Property-Based Tests for Tariff Mapping
 * Feature: energy-usage-assistant
 * 
 * Tests Properties 8-9: Tariff Interval Mapping and Price Display
 */

import { describe, it } from '@jest/globals';
import * as fc from 'fast-check';
import { mapTariffToIntervals, type TariffStructure, type TariffPeriod } from '../lib/tariff.js';

// Test data generators
const tariffPeriodGenerator = () => fc.record({
  name: fc.constantFrom('off-peak', 'shoulder', 'peak'),
  startTime: fc.integer({ min: 0, max: 23 }).map(h => `${h.toString().padStart(2, '0')}:00`),
  endTime: fc.integer({ min: 0, max: 23 }).map(h => `${h.toString().padStart(2, '0')}:00`),
  pricePerKwh: fc.float({ min: Math.fround(0.05), max: Math.fround(0.50), noNaN: true }),
  daysOfWeek: fc.constant(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])
});

const tariffStructureGenerator = () => fc.record({
  userId: fc.constant('test-user-id'),
  effectiveDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
  periods: fc.array(tariffPeriodGenerator(), { minLength: 1, maxLength: 5 })
});

const dateGenerator = () => fc.date({
  min: new Date('2024-01-01'),
  max: new Date('2025-12-31')
});

describe('Property-Based Tests: Tariff Mapping', () => {
  /**
   * Property 8: Tariff Interval Mapping Completeness
   * 
   * For any tariff structure, when mapped to half-hour intervals,
   * all 48 intervals in a day should have an associated electricity price.
   * 
   * Validates: Requirements 3.3
   */
  it('Property 8: tariff mapping produces exactly 48 intervals', () => {
    fc.assert(
      fc.property(
        tariffStructureGenerator(),
        dateGenerator(),
        (tariff, date) => {
          const intervals = mapTariffToIntervals(tariff, date);
          return intervals.length === 48;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: all intervals have a price assigned', () => {
    fc.assert(
      fc.property(
        tariffStructureGenerator(),
        dateGenerator(),
        (tariff, date) => {
          const intervals = mapTariffToIntervals(tariff, date);
          
          // All intervals should have a price (even if 0 for unknown periods)
          return intervals.every(interval => 
            typeof interval.pricePerKwh === 'number' && 
            !isNaN(interval.pricePerKwh) &&
            interval.pricePerKwh >= 0
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: intervals cover complete 24-hour period', () => {
    fc.assert(
      fc.property(
        tariffStructureGenerator(),
        dateGenerator(),
        (tariff, date) => {
          const intervals = mapTariffToIntervals(tariff, date);
          
          // Check first interval starts at 00:00
          const firstInterval = intervals[0];
          const isStartMidnight = firstInterval.startTime === '00:00';
          
          // Check last interval ends at 00:00 (next day)
          const lastInterval = intervals[47];
          const isEndMidnight = lastInterval.endTime === '00:00';
          
          return isStartMidnight && isEndMidnight;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9: Price Display Unit Consistency
   * 
   * For any displayed electricity price, it should be formatted in
   * dollars per kilowatt-hour with consistent decimal precision.
   * 
   * Validates: Requirements 3.4
   */
  it('Property 9: prices are in valid range and format', () => {
    fc.assert(
      fc.property(
        tariffStructureGenerator(),
        dateGenerator(),
        (tariff, date) => {
          const intervals = mapTariffToIntervals(tariff, date);
          
          // All prices should be reasonable (between $0 and $1 per kWh)
          return intervals.every(interval => 
            interval.pricePerKwh >= 0 && 
            interval.pricePerKwh <= 1.0
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 9: prices maintain precision', () => {
    fc.assert(
      fc.property(
        tariffStructureGenerator(),
        dateGenerator(),
        (tariff, date) => {
          const intervals = mapTariffToIntervals(tariff, date);
          
          // Prices should be representable as valid numbers
          // Check they don't have extreme precision issues
          return intervals.every(interval => {
            const price = interval.pricePerKwh;
            // Just check it's a valid number in reasonable range
            return typeof price === 'number' && 
                   !isNaN(price) && 
                   isFinite(price) &&
                   price >= 0 &&
                   price <= 1.0;
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Intervals have consistent 30-minute duration
   */
  it('Property: each interval represents 30 minutes', () => {
    fc.assert(
      fc.property(
        tariffStructureGenerator(),
        dateGenerator(),
        (tariff, date) => {
          const intervals = mapTariffToIntervals(tariff, date);
          
          // Check most intervals (not the last one which wraps to midnight)
          for (let i = 0; i < intervals.length - 1; i++) {
            const interval = intervals[i];
            const startMinutes = timeToMinutes(interval.startTime);
            const endMinutes = timeToMinutes(interval.endTime);
            
            // Duration should be 30 minutes
            const duration = endMinutes - startMinutes;
            if (duration !== 30) {
              return false;
            }
          }
          
          // Last interval: 23:30 to 00:00
          const lastInterval = intervals[47];
          if (lastInterval.startTime !== '23:30' || lastInterval.endTime !== '00:00') {
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Helper function to convert HH:MM time to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
