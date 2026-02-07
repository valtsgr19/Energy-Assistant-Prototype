/**
 * Property-Based Tests for Advice Generation
 * Feature: energy-usage-assistant
 * 
 * Tests Properties 15-19: Advice Display and Prioritization
 */

import { describe, it, beforeEach, afterEach } from '@jest/globals';
import * as fc from 'fast-check';
import { generateEnergyAdvice } from '../lib/adviceGeneration.js';
import { prisma } from '../lib/prisma.js';
import { generateSolarForecast } from '../lib/solarForecast.js';
import { getDefaultTariffStructure } from '../lib/tariff.js';

describe('Property-Based Tests: Advice Generation', () => {
  let testUserId: string;

  beforeEach(async () => {
    // Create a test user
    const user = await prisma.userProfile.create({
      data: {
        email: `test-advice-${Date.now()}@example.com`,
        passwordHash: 'hashedpassword'
      }
    });
    testUserId = user.id;

    // Create default tariff structure
    const defaultTariff = getDefaultTariffStructure(testUserId);
    await prisma.tariffStructure.create({
      data: {
        userId: testUserId,
        effectiveDate: defaultTariff.effectiveDate,
        periods: {
          create: defaultTariff.periods.map(period => ({
            name: period.name,
            startTime: period.startTime,
            endTime: period.endTime,
            pricePerKwh: period.pricePerKwh,
            daysOfWeek: period.daysOfWeek.join(',')
          }))
        }
      }
    });

    // Create some consumption data for the test date
    const testDate = new Date('2024-06-15');
    testDate.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 48; i++) {
      const timestamp = new Date(testDate);
      timestamp.setMinutes(i * 30);
      
      await prisma.consumptionDataPoint.create({
        data: {
          userId: testUserId,
          timestamp,
          consumptionKwh: 0.5 + Math.random() * 1.5 // 0.5-2.0 kWh per interval
        }
      });
    }
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.tariffStructure.deleteMany({ where: { userId: testUserId } });
    await prisma.solarSystem.deleteMany({ where: { userId: testUserId } });
    await prisma.electricVehicle.deleteMany({ where: { userId: testUserId } });
    await prisma.homeBattery.deleteMany({ where: { userId: testUserId } });
    await prisma.consumptionDataPoint.deleteMany({ where: { userId: testUserId } });
    await prisma.userProfile.delete({ where: { id: testUserId } });
  });

  /**
   * Property 15: Advice Display Limit
   * 
   * For any generated advice set, the system should display at most
   * 3 recommendations, prioritized by impact.
   * 
   * Validates: Requirements 5.8, 6.6
   */
  it('Property 15: general advice limited to 3 items', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          hasSolar: fc.boolean(),
          systemSizeKw: fc.float({ min: Math.fround(1.0), max: Math.fround(10.0), noNaN: true }),
          tiltDegrees: fc.float({ min: Math.fround(20.0), max: Math.fround(40.0), noNaN: true }),
          orientation: fc.constantFrom('S', 'SE', 'SW')
        }),
        fc.date({ min: new Date('2024-06-01'), max: new Date('2024-06-30') }), // Summer dates
        async (solarConfig, date) => {
          // Create solar system
          await prisma.solarSystem.upsert({
            where: { userId: testUserId },
            create: {
              userId: testUserId,
              hasSolar: solarConfig.hasSolar,
              systemSizeKw: solarConfig.hasSolar ? solarConfig.systemSizeKw : null,
              tiltDegrees: solarConfig.hasSolar ? solarConfig.tiltDegrees : null,
              orientation: solarConfig.hasSolar ? solarConfig.orientation : null
            },
            update: {
              hasSolar: solarConfig.hasSolar,
              systemSizeKw: solarConfig.hasSolar ? solarConfig.systemSizeKw : null,
              tiltDegrees: solarConfig.hasSolar ? solarConfig.tiltDegrees : null,
              orientation: solarConfig.hasSolar ? solarConfig.orientation : null
            }
          });

          // Generate advice
          const advice = await generateEnergyAdvice(testUserId, date);

          // General advice should be limited to 3 items
          return advice.generalAdvice.length <= 3;
        }
      ),
      { numRuns: 50 } // Reduced runs due to database operations
    );
  });

  it('Property 15: EV advice limited to 3 items', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }), // Number of EVs
        fc.date({ min: new Date('2024-06-01'), max: new Date('2024-06-30') }),
        async (numEvs, date) => {
          // Create solar system
          await prisma.solarSystem.upsert({
            where: { userId: testUserId },
            create: {
              userId: testUserId,
              hasSolar: false,
              systemSizeKw: null,
              tiltDegrees: null,
              orientation: null
            },
            update: {
              hasSolar: false,
              systemSizeKw: null,
              tiltDegrees: null,
              orientation: null
            }
          });

          // Create multiple EVs
          for (let i = 0; i < numEvs; i++) {
            await prisma.electricVehicle.create({
              data: {
                userId: testUserId,
                make: 'Tesla',
                model: `Model ${i}`,
                batteryCapacityKwh: 75.0,
                chargingSpeedKw: 7.0,
                averageDailyMiles: 30.0
              }
            });
          }

          // Generate advice
          const advice = await generateEnergyAdvice(testUserId, date);

          // EV advice should be limited to 3 items
          return advice.evAdvice.length <= 3;
        }
      ),
      { numRuns: 20 } // Reduced runs due to multiple database operations
    );
  });

  it('Property 15: battery advice limited to 3 items', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }), // Number of batteries
        fc.date({ min: new Date('2024-06-01'), max: new Date('2024-06-30') }),
        async (numBatteries, date) => {
          // Create solar system
          await prisma.solarSystem.upsert({
            where: { userId: testUserId },
            create: {
              userId: testUserId,
              hasSolar: false,
              systemSizeKw: null,
              tiltDegrees: null,
              orientation: null
            },
            update: {
              hasSolar: false,
              systemSizeKw: null,
              tiltDegrees: null,
              orientation: null
            }
          });

          // Create multiple batteries
          for (let i = 0; i < numBatteries; i++) {
            await prisma.homeBattery.create({
              data: {
                userId: testUserId,
                powerKw: 5.0,
                capacityKwh: 13.5
              }
            });
          }

          // Generate advice
          const advice = await generateEnergyAdvice(testUserId, date);

          // Battery advice should be limited to 3 items
          return advice.batteryAdvice.length <= 3;
        }
      ),
      { numRuns: 20 } // Reduced runs due to multiple database operations
    );
  });

  /**
   * Property 19: Advice Priority Ordering
   * 
   * For any set of generated advice items, they should be ordered by
   * potential cost savings in descending order.
   * 
   * Validates: Requirements 6.5
   */
  it('Property 19: advice ordered by priority and savings', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          hasSolar: fc.constant(true),
          systemSizeKw: fc.float({ min: Math.fround(5.0), max: Math.fround(10.0), noNaN: true }),
          tiltDegrees: fc.constant(30.0),
          orientation: fc.constant('S')
        }),
        fc.date({ min: new Date('2024-06-01'), max: new Date('2024-06-30') }),
        async (solarConfig, date) => {
          // Create solar system
          await prisma.solarSystem.upsert({
            where: { userId: testUserId },
            create: {
              userId: testUserId,
              hasSolar: solarConfig.hasSolar,
              systemSizeKw: solarConfig.systemSizeKw,
              tiltDegrees: solarConfig.tiltDegrees,
              orientation: solarConfig.orientation
            },
            update: {
              hasSolar: solarConfig.hasSolar,
              systemSizeKw: solarConfig.systemSizeKw,
              tiltDegrees: solarConfig.tiltDegrees,
              orientation: solarConfig.orientation
            }
          });

          // Generate advice
          const advice = await generateEnergyAdvice(testUserId, date);

          // Check general advice is ordered by priority (high > medium > low)
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          let isOrdered = true;

          for (let i = 0; i < advice.generalAdvice.length - 1; i++) {
            const current = advice.generalAdvice[i];
            const next = advice.generalAdvice[i + 1];

            const currentPriority = priorityOrder[current.priority];
            const nextPriority = priorityOrder[next.priority];

            // If priorities are equal, check savings
            if (currentPriority === nextPriority) {
              if (current.estimatedSavings < next.estimatedSavings) {
                isOrdered = false;
                break;
              }
            } else if (currentPriority < nextPriority) {
              isOrdered = false;
              break;
            }
          }

          return isOrdered;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Additional property: All advice items have required fields
   */
  it('Property: advice items have valid structure', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          hasSolar: fc.boolean(),
          systemSizeKw: fc.float({ min: Math.fround(1.0), max: Math.fround(10.0), noNaN: true }),
          tiltDegrees: fc.constant(30.0),
          orientation: fc.constant('S')
        }),
        fc.date({ min: new Date('2024-06-01'), max: new Date('2024-06-30') }),
        async (solarConfig, date) => {
          // Create solar system
          await prisma.solarSystem.upsert({
            where: { userId: testUserId },
            create: {
              userId: testUserId,
              hasSolar: solarConfig.hasSolar,
              systemSizeKw: solarConfig.hasSolar ? solarConfig.systemSizeKw : null,
              tiltDegrees: solarConfig.hasSolar ? solarConfig.tiltDegrees : null,
              orientation: solarConfig.hasSolar ? solarConfig.orientation : null
            },
            update: {
              hasSolar: solarConfig.hasSolar,
              systemSizeKw: solarConfig.hasSolar ? solarConfig.systemSizeKw : null,
              tiltDegrees: solarConfig.hasSolar ? solarConfig.tiltDegrees : null,
              orientation: solarConfig.hasSolar ? solarConfig.orientation : null
            }
          });

          // Generate advice
          const advice = await generateEnergyAdvice(testUserId, date);

          // Check all advice items have required fields
          const allAdvice = [
            ...advice.generalAdvice,
            ...advice.evAdvice,
            ...advice.batteryAdvice
          ];

          return allAdvice.every(item =>
            typeof item.title === 'string' && item.title.length > 0 &&
            typeof item.description === 'string' && item.description.length > 0 &&
            typeof item.recommendedTimeStart === 'string' &&
            typeof item.recommendedTimeEnd === 'string' &&
            typeof item.estimatedSavings === 'number' && item.estimatedSavings >= 0 &&
            ['high', 'medium', 'low'].includes(item.priority)
          );
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Additional property: Estimated savings are non-negative
   */
  it('Property: estimated savings are always non-negative', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          hasSolar: fc.boolean(),
          systemSizeKw: fc.float({ min: Math.fround(1.0), max: Math.fround(10.0), noNaN: true }),
          tiltDegrees: fc.constant(30.0),
          orientation: fc.constant('S')
        }),
        fc.date({ min: new Date('2024-06-01'), max: new Date('2024-06-30') }),
        async (solarConfig, date) => {
          // Create solar system
          await prisma.solarSystem.upsert({
            where: { userId: testUserId },
            create: {
              userId: testUserId,
              hasSolar: solarConfig.hasSolar,
              systemSizeKw: solarConfig.hasSolar ? solarConfig.systemSizeKw : null,
              tiltDegrees: solarConfig.hasSolar ? solarConfig.tiltDegrees : null,
              orientation: solarConfig.hasSolar ? solarConfig.orientation : null
            },
            update: {
              hasSolar: solarConfig.hasSolar,
              systemSizeKw: solarConfig.hasSolar ? solarConfig.systemSizeKw : null,
              tiltDegrees: solarConfig.hasSolar ? solarConfig.tiltDegrees : null,
              orientation: solarConfig.hasSolar ? solarConfig.orientation : null
            }
          });

          // Generate advice
          const advice = await generateEnergyAdvice(testUserId, date);

          // Check all savings are non-negative
          const allAdvice = [
            ...advice.generalAdvice,
            ...advice.evAdvice,
            ...advice.batteryAdvice
          ];

          return allAdvice.every(item => item.estimatedSavings >= 0);
        }
      ),
      { numRuns: 30 }
    );
  });
});
