/**
 * Property-Based Tests for Battery Charging Advice
 * 
 * Tests Properties 29-31 from the design document:
 * - Property 29: Battery Advice Generation
 * - Property 30: High Solar Forecast Battery Advice
 * - Property 31: Low Solar Forecast Battery Advice
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import * as fc from 'fast-check';
import { prisma } from '../lib/prisma.js';
import { generateEnergyAdvice } from '../lib/adviceGeneration.js';
import { generateSolarForecast } from '../lib/solarForecast.js';

describe('Battery Charging Advice Property Tests', () => {
  let testUserId: string;

  beforeAll(async () => {
    // Create a test user
    const user = await prisma.userProfile.create({
      data: {
        email: `battery-test-${Date.now()}@example.com`,
        passwordHash: 'test-hash',
        energyAccountId: 'test-account',
        energyAccountCredentials: 'test-credentials'
      }
    });
    testUserId = user.id;

    // Create default solar configuration (no solar for baseline tests)
    await prisma.solarSystem.create({
      data: {
        userId: testUserId,
        hasSolar: false,
        systemSizeKw: null,
        tiltDegrees: null,
        orientation: null
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.homeBattery.deleteMany({ where: { userId: testUserId } });
    await prisma.solarSystem.deleteMany({ where: { userId: testUserId } });
    await prisma.userProfile.delete({ where: { id: testUserId } });
  });

  /**
   * Property 29: Battery Advice Generation
   * 
   * For any user with a configured home battery, when generating energy advice,
   * the system should include at least one battery-specific recommendation.
   * 
   * **Validates: Requirements 9.5, 10.1**
   */
  it('Property 29: Battery advice is generated when battery configured', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          powerKw: fc.float({ min: 3.0, max: 15.0, noNaN: true }).map(Math.fround),
          capacityKwh: fc.float({ min: 5.0, max: 30.0, noNaN: true }).map(Math.fround)
        }),
        async (batteryConfig) => {
          // Create battery
          const battery = await prisma.homeBattery.create({
            data: {
              userId: testUserId,
              powerKw: batteryConfig.powerKw,
              capacityKwh: batteryConfig.capacityKwh
            }
          });

          try {
            // Generate advice for today
            const today = new Date();
            const advice = await generateEnergyAdvice(testUserId, today);

            // Should have battery advice
            expect(advice.batteryAdvice.length).toBeGreaterThan(0);

            // Battery advice should have valid structure
            for (const item of advice.batteryAdvice) {
              expect(item.title).toBeTruthy();
              expect(item.description).toBeTruthy();
              expect(item.recommendedTimeStart).toMatch(/^\d{2}:\d{2}$/);
              expect(item.recommendedTimeEnd).toMatch(/^\d{2}:\d{2}$/);
              expect(item.estimatedSavings).toBeGreaterThanOrEqual(0);
              expect(['high', 'medium', 'low']).toContain(item.priority);
            }
          } finally {
            // Clean up
            await prisma.homeBattery.delete({ where: { id: battery.id } });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 30: High Solar Forecast Battery Advice
   * 
   * For any day when tomorrow's solar forecast total exceeds 80% of battery capacity,
   * the system should recommend leaving battery capacity for solar charging.
   * 
   * **Validates: Requirements 10.2**
   */
  it('Property 30: High solar forecast recommends reserving capacity', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          systemSizeKw: fc.float({ min: 8.0, max: 15.0, noNaN: true }).map(Math.fround), // Large solar system
          batteryCapacityKwh: fc.float({ min: 10.0, max: 20.0, noNaN: true }).map(Math.fround),
          batteryPowerKw: fc.float({ min: 5.0, max: 10.0, noNaN: true }).map(Math.fround)
        }),
        async (config) => {
          // Update solar configuration to have large solar system
          await prisma.solarSystem.update({
            where: { userId: testUserId },
            data: {
              hasSolar: true,
              systemSizeKw: config.systemSizeKw,
              tiltDegrees: 30.0,
              orientation: 'N' // North facing (Southern hemisphere)
            }
          });

          // Create battery
          const battery = await prisma.homeBattery.create({
            data: {
              userId: testUserId,
              powerKw: config.batteryPowerKw,
              capacityKwh: config.batteryCapacityKwh
            }
          });

          try {
            // Generate advice for today
            const today = new Date();
            const advice = await generateEnergyAdvice(testUserId, today);

            // Calculate tomorrow's solar forecast
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowForecast = generateSolarForecast(
              {
                hasSolar: true,
                systemSizeKw: config.systemSizeKw,
                tiltDegrees: 30.0,
                orientation: 'N'
              },
              tomorrow
            );

            const tomorrowTotalSolar = tomorrowForecast.intervals.reduce(
              (sum, interval) => sum + interval.generationKwh,
              0
            );

            // If tomorrow's solar exceeds 80% of battery capacity, should recommend solar storage
            if (tomorrowTotalSolar > config.batteryCapacityKwh * 0.8) {
              const solarStorageAdvice = advice.batteryAdvice.find(a =>
                a.title.toLowerCase().includes('solar') ||
                a.title.toLowerCase().includes('reserve') ||
                a.description.toLowerCase().includes('solar') ||
                a.description.toLowerCase().includes('excess')
              );

              // Should have solar storage advice
              expect(solarStorageAdvice).toBeDefined();

              if (solarStorageAdvice) {
                // Should recommend midday time window (10:00-16:00)
                const startHour = parseInt(solarStorageAdvice.recommendedTimeStart.split(':')[0]);
                expect(startHour).toBeGreaterThanOrEqual(10);
                expect(startHour).toBeLessThan(16);
              }
            }
          } finally {
            // Clean up
            await prisma.homeBattery.delete({ where: { id: battery.id } });
            
            // Reset solar configuration
            await prisma.solarSystem.update({
              where: { userId: testUserId },
              data: {
                hasSolar: false,
                systemSizeKw: null,
                tiltDegrees: null,
                orientation: null
              }
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 31: Low Solar Forecast Battery Advice
   * 
   * For any day when tomorrow's solar forecast total is less than 30% of battery capacity,
   * the system should recommend overnight battery charging during off-peak periods.
   * 
   * **Validates: Requirements 10.3**
   */
  it('Property 31: Low solar forecast recommends overnight charging', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          systemSizeKw: fc.float({ min: 1.0, max: 3.0, noNaN: true }).map(Math.fround), // Small solar system
          batteryCapacityKwh: fc.float({ min: 10.0, max: 20.0, noNaN: true }).map(Math.fround),
          batteryPowerKw: fc.float({ min: 5.0, max: 10.0, noNaN: true }).map(Math.fround)
        }),
        async (config) => {
          // Update solar configuration to have small solar system
          await prisma.solarSystem.update({
            where: { userId: testUserId },
            data: {
              hasSolar: true,
              systemSizeKw: config.systemSizeKw,
              tiltDegrees: 30.0,
              orientation: 'S' // South facing (less optimal in Southern hemisphere)
            }
          });

          // Create battery
          const battery = await prisma.homeBattery.create({
            data: {
              userId: testUserId,
              powerKw: config.batteryPowerKw,
              capacityKwh: config.batteryCapacityKwh
            }
          });

          try {
            // Generate advice for today
            const today = new Date();
            const advice = await generateEnergyAdvice(testUserId, today);

            // Calculate tomorrow's solar forecast
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowForecast = generateSolarForecast(
              {
                hasSolar: true,
                systemSizeKw: config.systemSizeKw,
                tiltDegrees: 30.0,
                orientation: 'S'
              },
              tomorrow
            );

            const tomorrowTotalSolar = tomorrowForecast.intervals.reduce(
              (sum, interval) => sum + interval.generationKwh,
              0
            );

            // If tomorrow's solar is less than 30% of battery capacity, should recommend overnight charging
            if (tomorrowTotalSolar < config.batteryCapacityKwh * 0.3) {
              const overnightChargingAdvice = advice.batteryAdvice.find(a =>
                a.title.toLowerCase().includes('overnight') ||
                a.title.toLowerCase().includes('charge') ||
                a.description.toLowerCase().includes('overnight') ||
                a.description.toLowerCase().includes('off-peak')
              );

              // Should have overnight charging advice
              expect(overnightChargingAdvice).toBeDefined();

              if (overnightChargingAdvice) {
                // Should recommend overnight time window (00:00-07:00)
                const startHour = parseInt(overnightChargingAdvice.recommendedTimeStart.split(':')[0]);
                expect(startHour).toBeLessThan(7);
              }
            }
          } finally {
            // Clean up
            await prisma.homeBattery.delete({ where: { id: battery.id } });
            
            // Reset solar configuration
            await prisma.solarSystem.update({
              where: { userId: testUserId },
              data: {
                hasSolar: false,
                systemSizeKw: null,
                tiltDegrees: null,
                orientation: null
              }
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional Property: Battery advice is limited to 3 items
   */
  it('Additional: Battery advice is limited to 3 items', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          powerKw: fc.float({ min: 5.0, max: 15.0, noNaN: true }).map(Math.fround),
          capacityKwh: fc.float({ min: 10.0, max: 30.0, noNaN: true }).map(Math.fround)
        }),
        async (batteryConfig) => {
          // Create battery
          const battery = await prisma.homeBattery.create({
            data: {
              userId: testUserId,
              powerKw: batteryConfig.powerKw,
              capacityKwh: batteryConfig.capacityKwh
            }
          });

          try {
            // Generate advice for today
            const today = new Date();
            const advice = await generateEnergyAdvice(testUserId, today);

            // Battery advice should be limited to 3 items
            expect(advice.batteryAdvice.length).toBeLessThanOrEqual(3);
          } finally {
            // Clean up
            await prisma.homeBattery.delete({ where: { id: battery.id } });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional Property: Battery advice is prioritized correctly
   */
  it('Additional: Battery advice is prioritized by priority and savings', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          powerKw: fc.float({ min: 5.0, max: 15.0, noNaN: true }).map(Math.fround),
          capacityKwh: fc.float({ min: 10.0, max: 30.0, noNaN: true }).map(Math.fround)
        }),
        async (batteryConfig) => {
          // Create battery
          const battery = await prisma.homeBattery.create({
            data: {
              userId: testUserId,
              powerKw: batteryConfig.powerKw,
              capacityKwh: batteryConfig.capacityKwh
            }
          });

          try {
            // Generate advice for today
            const today = new Date();
            const advice = await generateEnergyAdvice(testUserId, today);

            // Check prioritization if multiple advice items exist
            if (advice.batteryAdvice.length >= 2) {
              for (let i = 0; i < advice.batteryAdvice.length - 1; i++) {
                const current = advice.batteryAdvice[i];
                const next = advice.batteryAdvice[i + 1];

                const priorityOrder = { high: 3, medium: 2, low: 1 };
                const currentPriority = priorityOrder[current.priority];
                const nextPriority = priorityOrder[next.priority];

                // Higher priority should come first
                if (currentPriority !== nextPriority) {
                  expect(currentPriority).toBeGreaterThanOrEqual(nextPriority);
                } else {
                  // Within same priority, higher savings should come first
                  expect(current.estimatedSavings).toBeGreaterThanOrEqual(next.estimatedSavings);
                }
              }
            }
          } finally {
            // Clean up
            await prisma.homeBattery.delete({ where: { id: battery.id } });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional Property: Battery advice mentions capacity or power
   */
  it('Additional: Battery advice references battery specifications', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          powerKw: fc.float({ min: 5.0, max: 15.0, noNaN: true }).map(Math.fround),
          capacityKwh: fc.float({ min: 10.0, max: 30.0, noNaN: true }).map(Math.fround)
        }),
        async (batteryConfig) => {
          // Create battery
          const battery = await prisma.homeBattery.create({
            data: {
              userId: testUserId,
              powerKw: batteryConfig.powerKw,
              capacityKwh: batteryConfig.capacityKwh
            }
          });

          try {
            // Generate advice for today
            const today = new Date();
            const advice = await generateEnergyAdvice(testUserId, today);

            // At least one advice item should reference battery capacity or charging time
            const hasBatteryReference = advice.batteryAdvice.some(a =>
              a.description.toLowerCase().includes('kwh') ||
              a.description.toLowerCase().includes('capacity') ||
              a.description.toLowerCase().includes('hours') ||
              a.description.toLowerCase().includes('battery')
            );

            expect(hasBatteryReference).toBe(true);
          } finally {
            // Clean up
            await prisma.homeBattery.delete({ where: { id: battery.id } });
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
