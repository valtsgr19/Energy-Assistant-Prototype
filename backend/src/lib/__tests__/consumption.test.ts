/**
 * Tests for Consumption Data Service
 */

import {
  fetchConsumptionData,
  storeConsumptionData,
  getConsumptionForDate,
  getConsumptionForRange,
  cleanupOldData,
  syncConsumptionData,
  getConsumptionWithGaps,
  hasConsumptionData,
  type ConsumptionDataPoint,
} from '../consumption.js';
import { createTestUser, cleanDatabase } from '../../__tests__/testSetup.js';
import { prisma } from '../prisma.js';

describe('Consumption Data Service', () => {
  let testUserId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const user = await createTestUser('consumption@example.com');
    testUserId = user.id;

    // Link energy account
    await prisma.userProfile.update({
      where: { id: testUserId },
      data: {
        energyAccountId: 'ACC001',
        energyAccountCredentials: 'encrypted_credentials'
      }
    });
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  describe('fetchConsumptionData', () => {
    it('should fetch consumption data from external API', async () => {
      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-15');

      const data = await fetchConsumptionData(testUserId, startDate, endDate);

      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('timestamp');
      expect(data[0]).toHaveProperty('consumptionKwh');
      expect(typeof data[0].consumptionKwh).toBe('number');
    });

    it('should throw error if energy account not linked', async () => {
      const userWithoutAccount = await createTestUser('nolink@example.com');
      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-15');

      await expect(
        fetchConsumptionData(userWithoutAccount.id, startDate, endDate)
      ).rejects.toThrow();
    }, 10000); // Increase timeout for retry logic

    it('should generate 48 data points for a single day', async () => {
      const startDate = new Date('2024-01-15');
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date('2024-01-15');
      endDate.setHours(23, 59, 59, 999);

      const data = await fetchConsumptionData(testUserId, startDate, endDate);

      expect(data.length).toBe(48);
    });
  });

  describe('storeConsumptionData', () => {
    it('should store consumption data points', async () => {
      const dataPoints: ConsumptionDataPoint[] = [
        { timestamp: new Date('2024-01-15T00:00:00'), consumptionKwh: 0.5 },
        { timestamp: new Date('2024-01-15T00:30:00'), consumptionKwh: 0.6 },
        { timestamp: new Date('2024-01-15T01:00:00'), consumptionKwh: 0.4 },
      ];

      await storeConsumptionData(testUserId, dataPoints);

      const stored = await prisma.consumptionDataPoint.findMany({
        where: { userId: testUserId }
      });

      expect(stored).toHaveLength(3);
      expect(stored[0].consumptionKwh).toBe(0.5);
    });

    it('should update existing data points (upsert)', async () => {
      const timestamp = new Date('2024-01-15T00:00:00');
      
      // Store initial data
      await storeConsumptionData(testUserId, [
        { timestamp, consumptionKwh: 0.5 }
      ]);

      // Update with new value
      await storeConsumptionData(testUserId, [
        { timestamp, consumptionKwh: 0.8 }
      ]);

      const stored = await prisma.consumptionDataPoint.findMany({
        where: { userId: testUserId }
      });

      expect(stored).toHaveLength(1);
      expect(stored[0].consumptionKwh).toBe(0.8);
    });
  });

  describe('getConsumptionForDate', () => {
    it('should retrieve consumption data for a specific date', async () => {
      const date = new Date('2024-01-15');
      const dataPoints: ConsumptionDataPoint[] = [
        { timestamp: new Date('2024-01-15T00:00:00'), consumptionKwh: 0.5 },
        { timestamp: new Date('2024-01-15T00:30:00'), consumptionKwh: 0.6 },
        { timestamp: new Date('2024-01-16T00:00:00'), consumptionKwh: 0.7 }, // Different day
      ];

      await storeConsumptionData(testUserId, dataPoints);

      const retrieved = await getConsumptionForDate(testUserId, date);

      expect(retrieved).toHaveLength(2);
      expect(retrieved[0].consumptionKwh).toBe(0.5);
      expect(retrieved[1].consumptionKwh).toBe(0.6);
    });

    it('should return empty array if no data exists', async () => {
      const date = new Date('2024-01-15');
      const retrieved = await getConsumptionForDate(testUserId, date);

      expect(retrieved).toHaveLength(0);
    });

    it('should return data in chronological order', async () => {
      const date = new Date('2024-01-15');
      const dataPoints: ConsumptionDataPoint[] = [
        { timestamp: new Date('2024-01-15T12:00:00'), consumptionKwh: 1.0 },
        { timestamp: new Date('2024-01-15T00:00:00'), consumptionKwh: 0.5 },
        { timestamp: new Date('2024-01-15T06:00:00'), consumptionKwh: 0.8 },
      ];

      await storeConsumptionData(testUserId, dataPoints);

      const retrieved = await getConsumptionForDate(testUserId, date);

      expect(retrieved[0].timestamp.getHours()).toBe(0);
      expect(retrieved[1].timestamp.getHours()).toBe(6);
      expect(retrieved[2].timestamp.getHours()).toBe(12);
    });
  });

  describe('getConsumptionForRange', () => {
    it('should retrieve consumption data for a date range', async () => {
      const dataPoints: ConsumptionDataPoint[] = [
        { timestamp: new Date('2024-01-15T00:00:00'), consumptionKwh: 0.5 },
        { timestamp: new Date('2024-01-16T00:00:00'), consumptionKwh: 0.6 },
        { timestamp: new Date('2024-01-17T00:00:00'), consumptionKwh: 0.7 },
        { timestamp: new Date('2024-01-18T00:00:00'), consumptionKwh: 0.8 },
      ];

      await storeConsumptionData(testUserId, dataPoints);

      const startDate = new Date('2024-01-16T00:00:00');
      const endDate = new Date('2024-01-17T23:59:59');
      const retrieved = await getConsumptionForRange(testUserId, startDate, endDate);

      expect(retrieved).toHaveLength(2);
      expect(retrieved[0].consumptionKwh).toBe(0.6);
      expect(retrieved[1].consumptionKwh).toBe(0.7);
    });
  });

  describe('cleanupOldData', () => {
    it('should delete data older than retention period', async () => {
      const now = new Date();
      const old = new Date(now);
      old.setDate(old.getDate() - 35); // 35 days ago (beyond 30-day retention)
      const recent = new Date(now);
      recent.setDate(recent.getDate() - 10); // 10 days ago (within retention)

      const dataPoints: ConsumptionDataPoint[] = [
        { timestamp: old, consumptionKwh: 0.5 },
        { timestamp: recent, consumptionKwh: 0.6 },
      ];

      await storeConsumptionData(testUserId, dataPoints);

      const deletedCount = await cleanupOldData(testUserId);

      expect(deletedCount).toBe(1);

      const remaining = await prisma.consumptionDataPoint.findMany({
        where: { userId: testUserId }
      });

      expect(remaining).toHaveLength(1);
      expect(remaining[0].consumptionKwh).toBe(0.6);
    });

    it('should not delete data within retention period', async () => {
      const now = new Date();
      const recent1 = new Date(now);
      recent1.setDate(recent1.getDate() - 10);
      const recent2 = new Date(now);
      recent2.setDate(recent2.getDate() - 20);

      const dataPoints: ConsumptionDataPoint[] = [
        { timestamp: recent1, consumptionKwh: 0.5 },
        { timestamp: recent2, consumptionKwh: 0.6 },
      ];

      await storeConsumptionData(testUserId, dataPoints);

      const deletedCount = await cleanupOldData(testUserId);

      expect(deletedCount).toBe(0);
    });
  });

  describe('syncConsumptionData', () => {
    it('should sync consumption data from external API', async () => {
      const result = await syncConsumptionData(testUserId, 1); // Sync 1 day

      expect(result.synced).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);

      const stored = await prisma.consumptionDataPoint.findMany({
        where: { userId: testUserId }
      });

      expect(stored.length).toBeGreaterThan(0);
    });

    it('should handle sync errors gracefully', async () => {
      const userWithoutAccount = await createTestUser('nosync@example.com');

      const result = await syncConsumptionData(userWithoutAccount.id, 1);

      expect(result.synced).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    }, 10000); // Increase timeout for retry logic
  });

  describe('getConsumptionWithGaps', () => {
    it('should return all 48 intervals with null for missing data', async () => {
      const date = new Date('2024-01-15');
      date.setHours(0, 0, 0, 0);

      // Store only a few data points
      const dataPoints: ConsumptionDataPoint[] = [
        { timestamp: new Date(date), consumptionKwh: 0.5 },
        { timestamp: new Date(date.getTime() + 30 * 60 * 1000), consumptionKwh: 0.6 },
      ];

      await storeConsumptionData(testUserId, dataPoints);

      const result = await getConsumptionWithGaps(testUserId, date);

      expect(result).toHaveLength(48);
      expect(result[0].consumptionKwh).toBe(0.5);
      expect(result[1].consumptionKwh).toBe(0.6);
      expect(result[2].consumptionKwh).toBeNull();
      expect(result[47].consumptionKwh).toBeNull();
    });

    it('should handle completely missing data', async () => {
      const date = new Date('2024-01-15');
      const result = await getConsumptionWithGaps(testUserId, date);

      expect(result).toHaveLength(48);
      result.forEach(point => {
        expect(point.consumptionKwh).toBeNull();
      });
    });
  });

  describe('hasConsumptionData', () => {
    it('should return true if data exists for date', async () => {
      const date = new Date('2024-01-15');
      const dataPoints: ConsumptionDataPoint[] = [
        { timestamp: new Date('2024-01-15T00:00:00'), consumptionKwh: 0.5 },
      ];

      await storeConsumptionData(testUserId, dataPoints);

      const exists = await hasConsumptionData(testUserId, date);

      expect(exists).toBe(true);
    });

    it('should return false if no data exists for date', async () => {
      const date = new Date('2024-01-15');
      const exists = await hasConsumptionData(testUserId, date);

      expect(exists).toBe(false);
    });
  });

  describe('Data Retention', () => {
    it('should maintain at least 30 days of data', async () => {
      const now = new Date();
      const dataPoints: ConsumptionDataPoint[] = [];

      // Create data for 35 days
      for (let i = 0; i < 35; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(12, 0, 0, 0);
        dataPoints.push({
          timestamp: date,
          consumptionKwh: 0.5 + i * 0.01
        });
      }

      await storeConsumptionData(testUserId, dataPoints);
      await cleanupOldData(testUserId);

      const remaining = await prisma.consumptionDataPoint.findMany({
        where: { userId: testUserId }
      });

      // Should have at least 30 days of data
      expect(remaining.length).toBeGreaterThanOrEqual(30);
      // Should have deleted data older than 30 days
      expect(remaining.length).toBeLessThan(35);
    });
  });
});
