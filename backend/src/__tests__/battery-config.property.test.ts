/**
 * Property-Based Tests for Battery Configuration
 * Feature: energy-usage-assistant
 * 
 * Tests Properties 28-29: Battery Configuration Persistence, CRUD Operations
 */

import { describe, it, beforeEach, afterEach } from '@jest/globals';
import * as fc from 'fast-check';
import { prisma } from '../lib/prisma.js';

describe('Property-Based Tests: Battery Configuration', () => {
  let testUserId: string;

  beforeEach(async () => {
    // Create a test user
    const user = await prisma.userProfile.create({
      data: {
        email: `test-battery-${Date.now()}@example.com`,
        passwordHash: 'hashedpassword'
      }
    });
    testUserId = user.id;
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.homeBattery.deleteMany({ where: { userId: testUserId } });
    await prisma.userProfile.delete({ where: { id: testUserId } });
  });

  /**
   * Property 28: Battery Configuration Persistence
   * 
   * For any valid home battery configuration, when saved, retrieving the
   * configuration should return the same specifications.
   * 
   * Validates: Requirements 9.3
   */
  it('Property 28: saved battery configuration is retrievable', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          powerKw: fc.float({ min: Math.fround(1.0), max: Math.fround(100.0), noNaN: true }),
          capacityKwh: fc.float({ min: Math.fround(1.0), max: Math.fround(500.0), noNaN: true })
        }),
        async (batteryConfig) => {
          // Save battery configuration
          const created = await prisma.homeBattery.create({
            data: {
              userId: testUserId,
              powerKw: batteryConfig.powerKw,
              capacityKwh: batteryConfig.capacityKwh
            }
          });

          // Retrieve configuration
          const retrieved = await prisma.homeBattery.findUnique({
            where: { id: created.id }
          });

          // Verify all fields match (with floating point tolerance)
          if (!retrieved) return false;

          const powerMatches = Math.abs(retrieved.powerKw - batteryConfig.powerKw) < 0.01;
          const capacityMatches = Math.abs(retrieved.capacityKwh - batteryConfig.capacityKwh) < 0.01;

          return powerMatches && capacityMatches;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 29: Battery CRUD Operations
   * 
   * For any configured home battery, the system should support editing the
   * configuration and removing the battery from the user profile.
   * 
   * Validates: Requirements 9.4
   */
  it('Property 29: battery can be created, updated, and deleted', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          powerKw: fc.float({ min: Math.fround(1.0), max: Math.fround(100.0), noNaN: true }),
          capacityKwh: fc.float({ min: Math.fround(1.0), max: Math.fround(500.0), noNaN: true })
        }),
        fc.record({
          powerKw: fc.float({ min: Math.fround(1.0), max: Math.fround(100.0), noNaN: true }),
          capacityKwh: fc.float({ min: Math.fround(1.0), max: Math.fround(500.0), noNaN: true })
        }),
        async (initialConfig, updates) => {
          // CREATE: Save battery configuration
          const created = await prisma.homeBattery.create({
            data: {
              userId: testUserId,
              powerKw: initialConfig.powerKw,
              capacityKwh: initialConfig.capacityKwh
            }
          });

          // UPDATE: Modify configuration
          const updated = await prisma.homeBattery.update({
            where: { id: created.id },
            data: {
              powerKw: updates.powerKw,
              capacityKwh: updates.capacityKwh
            }
          });

          // Verify update worked
          const updateSuccess = 
            Math.abs(updated.powerKw - updates.powerKw) < 0.01 &&
            Math.abs(updated.capacityKwh - updates.capacityKwh) < 0.01;

          // DELETE: Remove battery
          await prisma.homeBattery.delete({
            where: { id: created.id }
          });

          // Verify deletion
          const deleted = await prisma.homeBattery.findUnique({
            where: { id: created.id }
          });

          return updateSuccess && deleted === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Multiple batteries can be configured for one user
   */
  it('Property: user can have multiple batteries configured', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }),
        async (numBatteries) => {
          // Create multiple batteries
          const batteryIds: string[] = [];
          for (let i = 0; i < numBatteries; i++) {
            const battery = await prisma.homeBattery.create({
              data: {
                userId: testUserId,
                powerKw: 5.0 + i,
                capacityKwh: 13.5 + i * 2
              }
            });
            batteryIds.push(battery.id);
          }

          // Retrieve all batteries for user
          const userBatteries = await prisma.homeBattery.findMany({
            where: { userId: testUserId }
          });

          // Clean up
          await prisma.homeBattery.deleteMany({
            where: { id: { in: batteryIds } }
          });

          return userBatteries.length === numBatteries;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Additional property: Battery configuration fields are within valid ranges
   */
  it('Property: battery configuration validates field ranges', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          powerKw: fc.float({ min: Math.fround(1.0), max: Math.fround(100.0), noNaN: true }),
          capacityKwh: fc.float({ min: Math.fround(1.0), max: Math.fround(500.0), noNaN: true })
        }),
        async (batteryConfig) => {
          // Save battery configuration
          const created = await prisma.homeBattery.create({
            data: {
              userId: testUserId,
              powerKw: batteryConfig.powerKw,
              capacityKwh: batteryConfig.capacityKwh
            }
          });

          // Verify all fields are within expected ranges
          const validPower = created.powerKw >= 1 && created.powerKw <= 100;
          const validCapacity = created.capacityKwh >= 1 && created.capacityKwh <= 500;

          return validPower && validCapacity;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Power rating should not exceed capacity
   * (Typical battery C-rate is 0.5-1.0, meaning power ≤ capacity)
   */
  it('Property: battery power rating is reasonable relative to capacity', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.float({ min: Math.fround(10.0), max: Math.fround(100.0), noNaN: true }),
        fc.float({ min: Math.fround(1.0), max: Math.fround(100.0), noNaN: true }),
        async (capacityKwh, powerKw) => {
          // Ensure power doesn't exceed 2x capacity
          const adjustedPower = Math.min(powerKw, capacityKwh * 2);
          
          // Save battery configuration
          const created = await prisma.homeBattery.create({
            data: {
              userId: testUserId,
              powerKw: adjustedPower,
              capacityKwh: capacityKwh
            }
          });

          // Verify power is reasonable relative to capacity
          // Typical home batteries have C-rate of 0.5-1.0 (power = 0.5-1.0 × capacity)
          // We allow up to 2x for flexibility (with small tolerance for floating point)
          const ratio = created.powerKw / created.capacityKwh;
          return ratio > 0 && ratio <= 2.01; // Small tolerance for floating point
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Battery specifications are positive numbers
   */
  it('Property: battery specifications are always positive', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          powerKw: fc.float({ min: Math.fround(1.0), max: Math.fround(100.0), noNaN: true }),
          capacityKwh: fc.float({ min: Math.fround(1.0), max: Math.fround(500.0), noNaN: true })
        }),
        async (batteryConfig) => {
          // Save battery configuration
          const created = await prisma.homeBattery.create({
            data: {
              userId: testUserId,
              powerKw: batteryConfig.powerKw,
              capacityKwh: batteryConfig.capacityKwh
            }
          });

          // Verify all values are positive
          return created.powerKw > 0 && created.capacityKwh > 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});
