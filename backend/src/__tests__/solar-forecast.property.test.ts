/**
 * Property-Based Tests for Solar Forecasting
 * Feature: energy-usage-assistant
 * 
 * Tests Properties 4-7: Solar Forecast Generation
 */

import { describe, it } from '@jest/globals';
import * as fc from 'fast-check';
import { generateSolarForecast } from '../lib/solarForecast.js';

// Test data generators
const solarSystemWithSolarGenerator = () => fc.record({
  hasSolar: fc.constant(true),
  systemSizeKw: fc.float({ min: Math.fround(0.1), max: Math.fround(100.0), noNaN: true }),
  tiltDegrees: fc.float({ min: Math.fround(0.0), max: Math.fround(90.0), noNaN: true }),
  orientation: fc.constantFrom('N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW')
});

const solarSystemWithoutSolarGenerator = () => fc.constant({
  hasSolar: false,
  systemSizeKw: null,
  tiltDegrees: null,
  orientation: null
});

const dateGenerator = () => fc.date({
  min: new Date('2024-01-01'),
  max: new Date('2025-12-31')
});

describe('Property-Based Tests: Solar Forecasting', () => {
  /**
   * Property 4: Solar Forecast Generation Completeness
   * 
   * For any solar system configuration, when a forecast is generated,
   * it should contain exactly 48 half-hour intervals covering a complete
   * 24-hour period.
   * 
   * Validates: Requirements 2.1, 2.2
   */
  it('Property 4: forecast contains exactly 48 intervals', () => {
    fc.assert(
      fc.property(
        solarSystemWithSolarGenerator(),
        dateGenerator(),
        (config, date) => {
          const forecast = generateSolarForecast(config, date);
          return forecast.intervals.length === 48;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4: forecast intervals cover complete 24-hour period', () => {
    fc.assert(
      fc.property(
        solarSystemWithSolarGenerator(),
        dateGenerator(),
        (config, date) => {
          const forecast = generateSolarForecast(config, date);
          
          // Check intervals are consecutive (no gaps or overlaps)
          // Allow for DST transitions which can cause 1-hour gaps or overlaps
          let allConsecutive = true;
          for (let i = 0; i < forecast.intervals.length - 1; i++) {
            const currentEnd = new Date(forecast.intervals[i].endTime);
            const nextStart = new Date(forecast.intervals[i + 1].startTime);
            const timeDiff = Math.abs(nextStart.getTime() - currentEnd.getTime());
            // Should be exactly consecutive (0 difference) or within 1 hour for DST
            if (timeDiff > 60 * 60 * 1000) { // More than 1 hour difference
              allConsecutive = false;
              break;
            }
          }
          
          // Check total duration covers approximately 24 hours
          // (Allow for DST transitions which can make it 23 or 25 hours)
          const firstStart = new Date(forecast.intervals[0].startTime);
          const lastEnd = new Date(forecast.intervals[47].endTime);
          const totalMinutes = (lastEnd.getTime() - firstStart.getTime()) / (1000 * 60);
          const isApprox24Hours = totalMinutes >= 23 * 60 && totalMinutes <= 25 * 60;
          
          return allConsecutive && isApprox24Hours;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5: Nighttime Zero Generation
   * 
   * For any half-hour interval between sunset and sunrise,
   * the solar generation forecast should be zero.
   * 
   * Validates: Requirements 2.4
   * 
   * Note: We test very conservative nighttime hours (midnight-4AM, 10PM-midnight)
   * to account for seasonal and timezone variations
   */
  it('Property 5: nighttime intervals have zero generation', () => {
    fc.assert(
      fc.property(
        solarSystemWithSolarGenerator(),
        dateGenerator(),
        (config, date) => {
          const forecast = generateSolarForecast(config, date);
          
          // Check intervals before 4 AM and after 10 PM (very conservative nighttime)
          // These should always be zero regardless of season, location, or timezone
          const earlyMorningIntervals = forecast.intervals.slice(0, 8); // 00:00-04:00
          const lateEveningIntervals = forecast.intervals.slice(44, 48); // 22:00-24:00
          
          const earlyMorningAllZero = earlyMorningIntervals.every(
            interval => interval.generationKwh === 0
          );
          const lateEveningAllZero = lateEveningIntervals.every(
            interval => interval.generationKwh === 0
          );
          
          return earlyMorningAllZero && lateEveningAllZero;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: No Solar System Zero Generation
   * 
   * For any user who selected "I don't have solar", all solar generation
   * forecasts should be zero for all intervals.
   * 
   * Validates: Requirements 2.2
   */
  it('Property 6: no solar system produces zero generation for all intervals', () => {
    fc.assert(
      fc.property(
        solarSystemWithoutSolarGenerator(),
        dateGenerator(),
        (config, date) => {
          const forecast = generateSolarForecast(config, date);
          
          // All intervals should have zero generation
          return forecast.intervals.every(interval => interval.generationKwh === 0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: Daylight Generation Proportionality
   * 
   * For any daylight half-hour interval with a configured solar system,
   * the solar generation forecast should be proportional to the system size,
   * with larger systems producing proportionally more energy.
   * 
   * Validates: Requirements 2.5
   */
  it('Property 7: larger systems produce proportionally more energy', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.0), max: Math.fround(90.0), noNaN: true }), // tiltDegrees
        fc.constantFrom('N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'), // orientation
        dateGenerator(),
        (tiltDegrees, orientation, date) => {
          // Test with two different system sizes
          const smallSystem = {
            hasSolar: true,
            systemSizeKw: 5.0,
            tiltDegrees,
            orientation
          };
          
          const largeSystem = {
            hasSolar: true,
            systemSizeKw: 10.0, // Exactly 2x larger
            tiltDegrees,
            orientation
          };
          
          const smallForecast = generateSolarForecast(smallSystem, date);
          const largeForecast = generateSolarForecast(largeSystem, date);
          
          // Check midday intervals (10:00-14:00) where generation should be significant
          const middayStart = 20; // 10:00
          const middayEnd = 28;   // 14:00
          
          let proportionalityHolds = true;
          for (let i = middayStart; i < middayEnd; i++) {
            const smallGen = smallForecast.intervals[i].generationKwh;
            const largeGen = largeForecast.intervals[i].generationKwh;
            
            // If small system generates something, large system should generate ~2x
            if (smallGen > 0.01) {
              const ratio = largeGen / smallGen;
              // Allow 1% tolerance for floating point arithmetic
              if (Math.abs(ratio - 2.0) > 0.02) {
                proportionalityHolds = false;
                break;
              }
            }
          }
          
          return proportionalityHolds;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Generation is always non-negative
   */
  it('Property: generation values are always non-negative', () => {
    fc.assert(
      fc.property(
        solarSystemWithSolarGenerator(),
        dateGenerator(),
        (config, date) => {
          const forecast = generateSolarForecast(config, date);
          return forecast.intervals.every(interval => interval.generationKwh >= 0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Peak generation occurs during midday hours
   */
  it('Property: peak generation occurs during midday hours (10:00-14:00)', () => {
    fc.assert(
      fc.property(
        solarSystemWithSolarGenerator(),
        dateGenerator(),
        (config, date) => {
          const forecast = generateSolarForecast(config, date);
          
          // Find maximum generation
          const maxGeneration = Math.max(
            ...forecast.intervals.map(i => i.generationKwh)
          );
          
          // If there's any generation, it should peak during midday
          if (maxGeneration > 0) {
            const middayIntervals = forecast.intervals.slice(20, 28); // 10:00-14:00
            const middayMax = Math.max(...middayIntervals.map(i => i.generationKwh));
            
            // Peak should be in midday (allow small tolerance)
            return middayMax >= maxGeneration * 0.95;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
