/**
 * Property-Based Tests for Solar Configuration
 * Feature: energy-usage-assistant
 * 
 * Tests Property 3: Solar Configuration Persistence
 */

import { describe, it, beforeEach, afterEach } from '@jest/globals';
import * as fc from 'fast-check';
import { prisma } from '../lib/prisma.js';

// Test data generators
const solarSystemConfigGenerator = () => fc.record({
  hasSolar: fc.boolean(),
  systemSizeKw: fc.option(fc.float({ min: Math.fround(0.1), max: Math.fround(100.0), noNaN: true }), { nil: null }),
  tiltDegrees: fc.option(fc.float({ min: Math.fround(0.0), max: Math.fround(90.0), noNaN: true }), { nil: null }),
  orientation: fc.option(
    fc.constantFrom('N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'),
    { nil: null }
  )
}).map(config => {
  // If hasSolar is false, ensure all other fields are null
  if (!config.hasSolar) {
    return {
      hasSolar: false,
      systemSizeKw: null,
      tiltDegrees: null,
      orientation: null
    };
  }
  // If hasSolar is true, ensure all fields have values
  return {
    hasSolar: true,
    systemSizeKw: config.systemSizeKw ?? 5.0,
    tiltDegrees: config.tiltDegrees ?? 30.0,
    orientation: config.orientation ?? 'S'
  };
});

describe('Property-Based Tests: Solar Configuration', () => {
  let testUserId: string;

  beforeEach(async () => {
    // Create a test user
    const user = await prisma.userProfile.create({
      data: {
        email: `test-solar-${Date.now()}@example.com`,
        passwordHash: 'hashedpassword'
      }
    });
    testUserId = user.id;
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.solarSystem.deleteMany({
      where: { userId: testUserId }
    });
    await prisma.userProfile.delete({
      where: { id: testUserId }
    });
  });

  /**
   * Property 3: Solar Configuration Persistence
   * 
   * For any valid solar system configuration (size, tilt, orientation),
   * when the configuration is saved, retrieving the configuration should
   * return the same values.
   * 
   * Validates: Requirements 1.5
   */
  it('Property 3: saved solar configuration should be retrievable with same values', async () => {
    await fc.assert(
      fc.asyncProperty(
        solarSystemConfigGenerator(),
        async (config) => {
          // Save configuration
          await prisma.solarSystem.upsert({
            where: { userId: testUserId },
            create: {
              userId: testUserId,
              hasSolar: config.hasSolar,
              systemSizeKw: config.systemSizeKw,
              tiltDegrees: config.tiltDegrees,
              orientation: config.orientation
            },
            update: {
              hasSolar: config.hasSolar,
              systemSizeKw: config.systemSizeKw,
              tiltDegrees: config.tiltDegrees,
              orientation: config.orientation
            }
          });

          // Retrieve configuration
          const retrieved = await prisma.solarSystem.findUnique({
            where: { userId: testUserId }
          });

          // Verify all fields match
          if (!retrieved) {
            return false;
          }

          const hasSolarMatches = retrieved.hasSolar === config.hasSolar;
          
          // For floating point numbers, use approximate equality
          const sizeMatches = config.systemSizeKw === null 
            ? retrieved.systemSizeKw === null
            : retrieved.systemSizeKw !== null && Math.abs(retrieved.systemSizeKw - config.systemSizeKw) < 0.01;
            
          const tiltMatches = config.tiltDegrees === null
            ? retrieved.tiltDegrees === null
            : retrieved.tiltDegrees !== null && Math.abs(retrieved.tiltDegrees - config.tiltDegrees) < 0.01;
            
          const orientationMatches = retrieved.orientation === config.orientation;

          return hasSolarMatches && sizeMatches && tiltMatches && orientationMatches;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Configuration with hasSolar=false should have null values
   */
  it('Property: when hasSolar is false, other fields should be nullable', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant({ hasSolar: false, systemSizeKw: null, tiltDegrees: null, orientation: null }),
        async (config) => {
          // Save configuration
          await prisma.solarSystem.upsert({
            where: { userId: testUserId },
            create: {
              userId: testUserId,
              hasSolar: config.hasSolar,
              systemSizeKw: config.systemSizeKw,
              tiltDegrees: config.tiltDegrees,
              orientation: config.orientation
            },
            update: {
              hasSolar: config.hasSolar,
              systemSizeKw: config.systemSizeKw,
              tiltDegrees: config.tiltDegrees,
              orientation: config.orientation
            }
          });

          // Retrieve configuration
          const retrieved = await prisma.solarSystem.findUnique({
            where: { userId: testUserId }
          });

          // Verify configuration is valid
          return retrieved !== null && 
                 retrieved.hasSolar === false &&
                 retrieved.systemSizeKw === null &&
                 retrieved.tiltDegrees === null &&
                 retrieved.orientation === null;
        }
      ),
      { numRuns: 50 }
    );
  });
});
