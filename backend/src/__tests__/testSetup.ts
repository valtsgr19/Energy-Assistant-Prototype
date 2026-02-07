/**
 * Test setup utilities for database management
 * Provides consistent database cleanup and isolation for tests
 */

import { prisma } from '../lib/prisma.js';

/**
 * Get the shared Prisma client instance
 * This ensures all tests and routes use the same client instance
 */
export function getPrismaClient() {
  return prisma;
}

/**
 * Clean all tables in the correct order to respect foreign key constraints
 * This should be called before each test to ensure a clean state
 */
export async function cleanDatabase(): Promise<void> {
  // Delete in reverse order of dependencies
  await prisma.eventParticipation.deleteMany({});
  await prisma.energyEvent.deleteMany({});
  await prisma.energyAdvice.deleteMany({});
  await prisma.solarInterval.deleteMany({});
  await prisma.solarForecast.deleteMany({});
  await prisma.tariffPeriod.deleteMany({});
  await prisma.tariffStructure.deleteMany({});
  await prisma.consumptionDataPoint.deleteMany({});
  await prisma.homeBattery.deleteMany({});
  await prisma.electricVehicle.deleteMany({});
  await prisma.solarSystem.deleteMany({});
  await prisma.userProfile.deleteMany({});
}

/**
 * Disconnect from the database
 * This should be called in afterAll hooks
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Setup function to be called in beforeEach
 */
export async function setupTest(): Promise<void> {
  await cleanDatabase();
}

/**
 * Teardown function to be called in afterAll
 */
export async function teardownTest(): Promise<void> {
  await cleanDatabase();
  await disconnectDatabase();
}

/**
 * Create a test user for testing purposes
 */
export async function createTestUser(email: string = 'test@example.com'): Promise<{ id: string; email: string }> {
  const user = await prisma.userProfile.create({
    data: {
      email,
      passwordHash: 'test-hash'
    }
  });
  
  return {
    id: user.id,
    email: user.email
  };
}
