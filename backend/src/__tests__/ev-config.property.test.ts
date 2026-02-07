/**
 * Property-Based Tests for EV Configuration
 * Feature: energy-usage-assistant
 * 
 * Tests Properties 20-22: EV Battery Capacity Inference, Configuration Persistence, CRUD Operations
 */

import { describe, it, beforeEach, afterEach } from '@jest/globals';
import * as fc from 'fast-check';
import { prisma } from '../lib/prisma.js';
import { inferBatteryCapacity, getAvailableMakes, getAvailableModels } from '../lib/evBatteryLookup.js';

describe('Property-Based Tests: EV Configuration', () => {
  let testUserId: string;

  beforeEach(async () => {
    // Create a test user
    const user = await prisma.userProfile.create({
      data: {
        email: `test-ev-${Date.now()}@example.com`,
        passwordHash: 'hashedpassword'
      }
    });
    testUserId = user.id;
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.electricVehicle.deleteMany({ where: { userId: testUserId } });
    await prisma.userProfile.delete({ where: { id: testUserId } });
  });

  /**
   * Property 20: EV Battery Capacity Inference
   * 
   * For any known EV make and model combination, the system should infer
   * a battery capacity value within the typical range for that vehicle.
   * 
   * Validates: Requirements 7.3
   */
  it('Property 20: known EV models return valid battery capacity', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...getAvailableMakes()),
        (make) => {
          const models = getAvailableModels(make);
          if (models.length === 0) return true;
          
          const model = models[0]; // Test first model for each make
          const capacity = inferBatteryCapacity(make, model);
          
          // Should return a valid capacity
          return capacity !== null && 
                 capacity > 0 && 
                 capacity <= 200; // Reasonable upper bound
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 20: inferred capacity is within typical EV range', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...getAvailableMakes()),
        (make) => {
          const models = getAvailableModels(make);
          if (models.length === 0) return true;
          
          const model = models[Math.floor(Math.random() * models.length)];
          const capacity = inferBatteryCapacity(make, model);
          
          // Typical EV battery range: 30-150 kWh
          return capacity === null || (capacity >= 30 && capacity <= 150);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 20: same make/model always returns same capacity', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...getAvailableMakes()),
        (make) => {
          const models = getAvailableModels(make);
          if (models.length === 0) return true;
          
          const model = models[0];
          const capacity1 = inferBatteryCapacity(make, model);
          const capacity2 = inferBatteryCapacity(make, model);
          
          // Should be deterministic
          return capacity1 === capacity2;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 21: EV Configuration Persistence
   * 
   * For any valid EV configuration, when saved, retrieving the configuration
   * should return the same vehicle details.
   * 
   * Validates: Requirements 7.4
   */
  it('Property 21: saved EV configuration is retrievable', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          make: fc.constantFrom('Tesla', 'Nissan', 'Chevrolet', 'Ford'),
          model: fc.string({ minLength: 1, maxLength: 50 }),
          batteryCapacityKwh: fc.float({ min: Math.fround(30.0), max: Math.fround(150.0), noNaN: true }),
          chargingSpeedKw: fc.float({ min: Math.fround(1.0), max: Math.fround(50.0), noNaN: true }),
          averageDailyMiles: fc.float({ min: Math.fround(1.0), max: Math.fround(500.0), noNaN: true })
        }),
        async (evConfig) => {
          // Save EV configuration
          const created = await prisma.electricVehicle.create({
            data: {
              userId: testUserId,
              make: evConfig.make,
              model: evConfig.model,
              batteryCapacityKwh: evConfig.batteryCapacityKwh,
              chargingSpeedKw: evConfig.chargingSpeedKw,
              averageDailyMiles: evConfig.averageDailyMiles
            }
          });

          // Retrieve configuration
          const retrieved = await prisma.electricVehicle.findUnique({
            where: { id: created.id }
          });

          // Verify all fields match (with floating point tolerance)
          if (!retrieved) return false;

          const makeMatches = retrieved.make === evConfig.make;
          const modelMatches = retrieved.model === evConfig.model;
          const capacityMatches = Math.abs(retrieved.batteryCapacityKwh - evConfig.batteryCapacityKwh) < 0.01;
          const speedMatches = Math.abs(retrieved.chargingSpeedKw - evConfig.chargingSpeedKw) < 0.01;
          const milesMatches = Math.abs(retrieved.averageDailyMiles - evConfig.averageDailyMiles) < 0.01;

          return makeMatches && modelMatches && capacityMatches && speedMatches && milesMatches;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 22: EV CRUD Operations
   * 
   * For any configured EV, the system should support editing the configuration
   * and removing the EV from the user profile.
   * 
   * Validates: Requirements 7.5
   */
  it('Property 22: EV can be created, updated, and deleted', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          make: fc.constantFrom('Tesla', 'Nissan', 'Chevrolet', 'Ford'),
          model: fc.string({ minLength: 1, maxLength: 50 }),
          batteryCapacityKwh: fc.float({ min: Math.fround(30.0), max: Math.fround(150.0), noNaN: true }),
          chargingSpeedKw: fc.float({ min: Math.fround(1.0), max: Math.fround(50.0), noNaN: true }),
          averageDailyMiles: fc.float({ min: Math.fround(1.0), max: Math.fround(500.0), noNaN: true })
        }),
        fc.record({
          chargingSpeedKw: fc.float({ min: Math.fround(1.0), max: Math.fround(50.0), noNaN: true }),
          averageDailyMiles: fc.float({ min: Math.fround(1.0), max: Math.fround(500.0), noNaN: true })
        }),
        async (initialConfig, updates) => {
          // CREATE: Save EV configuration
          const created = await prisma.electricVehicle.create({
            data: {
              userId: testUserId,
              make: initialConfig.make,
              model: initialConfig.model,
              batteryCapacityKwh: initialConfig.batteryCapacityKwh,
              chargingSpeedKw: initialConfig.chargingSpeedKw,
              averageDailyMiles: initialConfig.averageDailyMiles
            }
          });

          // UPDATE: Modify configuration
          const updated = await prisma.electricVehicle.update({
            where: { id: created.id },
            data: {
              chargingSpeedKw: updates.chargingSpeedKw,
              averageDailyMiles: updates.averageDailyMiles
            }
          });

          // Verify update worked
          const updateSuccess = 
            Math.abs(updated.chargingSpeedKw - updates.chargingSpeedKw) < 0.01 &&
            Math.abs(updated.averageDailyMiles - updates.averageDailyMiles) < 0.01;

          // DELETE: Remove EV
          await prisma.electricVehicle.delete({
            where: { id: created.id }
          });

          // Verify deletion
          const deleted = await prisma.electricVehicle.findUnique({
            where: { id: created.id }
          });

          return updateSuccess && deleted === null;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Additional property: Multiple EVs can be configured for one user
   */
  it('Property: user can have multiple EVs configured', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }),
        async (numEvs) => {
          // Create multiple EVs
          const evIds: string[] = [];
          for (let i = 0; i < numEvs; i++) {
            const ev = await prisma.electricVehicle.create({
              data: {
                userId: testUserId,
                make: 'Tesla',
                model: `Model ${i}`,
                batteryCapacityKwh: 75.0,
                chargingSpeedKw: 7.0,
                averageDailyMiles: 30.0
              }
            });
            evIds.push(ev.id);
          }

          // Retrieve all EVs for user
          const userEvs = await prisma.electricVehicle.findMany({
            where: { userId: testUserId }
          });

          // Clean up
          await prisma.electricVehicle.deleteMany({
            where: { id: { in: evIds } }
          });

          return userEvs.length === numEvs;
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Additional property: EV configuration fields are within valid ranges
   */
  it('Property: EV configuration validates field ranges', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          make: fc.constantFrom('Tesla', 'Nissan', 'Chevrolet', 'Ford'),
          model: fc.string({ minLength: 1, maxLength: 50 }),
          batteryCapacityKwh: fc.float({ min: Math.fround(30.0), max: Math.fround(150.0), noNaN: true }),
          chargingSpeedKw: fc.float({ min: Math.fround(1.0), max: Math.fround(50.0), noNaN: true }),
          averageDailyMiles: fc.float({ min: Math.fround(1.0), max: Math.fround(500.0), noNaN: true })
        }),
        async (evConfig) => {
          // Save EV configuration
          const created = await prisma.electricVehicle.create({
            data: {
              userId: testUserId,
              make: evConfig.make,
              model: evConfig.model,
              batteryCapacityKwh: evConfig.batteryCapacityKwh,
              chargingSpeedKw: evConfig.chargingSpeedKw,
              averageDailyMiles: evConfig.averageDailyMiles
            }
          });

          // Verify all fields are within expected ranges
          const validCapacity = created.batteryCapacityKwh >= 30 && created.batteryCapacityKwh <= 150;
          const validSpeed = created.chargingSpeedKw >= 1 && created.chargingSpeedKw <= 50;
          const validMiles = created.averageDailyMiles >= 1 && created.averageDailyMiles <= 500;

          return validCapacity && validSpeed && validMiles;
        }
      ),
      { numRuns: 50 }
    );
  });
});
