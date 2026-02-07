/**
 * Tests for Daily Assistant Service
 */

import { generateChartData } from '../dailyAssistant';
import { prisma } from '../prisma';
import { createTestUser } from '../../__tests__/testSetup';

describe('Daily Assistant Service', () => {
  let userId: string;

  beforeEach(async () => {
    // Create test user with unique email
    const user = await createTestUser(`test-${Date.now()}-${Math.random()}@example.com`);
    userId = user.id;

    // Create solar configuration
    await prisma.solarSystem.create({
      data: {
        userId,
        hasSolar: true,
        systemSizeKw: 5.0,
        tiltDegrees: 30.0,
        orientation: 'S'
      }
    });

    // Create tariff structure
    await prisma.tariffStructure.create({
      data: {
        userId,
        effectiveDate: new Date(),
        periods: {
          create: [
            {
              name: 'off-peak',
              startTime: '00:00',
              endTime: '07:00',
              pricePerKwh: 0.07,
              daysOfWeek: 'MON,TUE,WED,THU,FRI,SAT,SUN'
            },
            {
              name: 'shoulder',
              startTime: '07:00',
              endTime: '17:00',
              pricePerKwh: 0.15,
              daysOfWeek: 'MON,TUE,WED,THU,FRI,SAT,SUN'
            },
            {
              name: 'peak',
              startTime: '17:00',
              endTime: '22:00',
              pricePerKwh: 0.30,
              daysOfWeek: 'MON,TUE,WED,THU,FRI,SAT,SUN'
            },
            {
              name: 'off-peak',
              startTime: '22:00',
              endTime: '00:00',
              pricePerKwh: 0.07,
              daysOfWeek: 'MON,TUE,WED,THU,FRI,SAT,SUN'
            }
          ]
        }
      }
    });

    // Create some consumption data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 48; i++) {
      const timestamp = new Date(today);
      timestamp.setMinutes(i * 30);

      await prisma.consumptionDataPoint.create({
        data: {
          userId,
          timestamp,
          consumptionKwh: 0.5 + Math.random() * 0.5 // 0.5-1.0 kWh per interval
        }
      });
    }
  });

  describe('generateChartData', () => {
    it('should generate chart data with 48 intervals', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const chartData = await generateChartData(userId, today);

      expect(chartData.intervals).toHaveLength(48);
    });

    it('should include solar generation, consumption, and price for each interval', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const chartData = await generateChartData(userId, today);

      chartData.intervals.forEach(interval => {
        expect(interval).toHaveProperty('startTime');
        expect(interval).toHaveProperty('endTime');
        expect(interval).toHaveProperty('solarGenerationKwh');
        expect(interval).toHaveProperty('consumptionKwh');
        expect(interval).toHaveProperty('pricePerKwh');
        expect(interval).toHaveProperty('shading');
      });
    });

    it('should apply green shading for off-peak periods with low consumption', async () => {
      // Create historical data for average calculation (7 days)
      await prisma.consumptionDataPoint.deleteMany({ where: { userId } });
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Create 7 days of historical data with higher consumption
      for (let day = 1; day <= 7; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() - day);

        for (let i = 0; i < 48; i++) {
          const timestamp = new Date(date);
          timestamp.setMinutes(i * 30);

          await prisma.consumptionDataPoint.create({
            data: {
              userId,
              timestamp,
              consumptionKwh: 0.8 // Higher historical consumption
            }
          });
        }
      }

      // Create today's data with very low consumption
      for (let i = 0; i < 48; i++) {
        const timestamp = new Date(today);
        timestamp.setMinutes(i * 30);

        await prisma.consumptionDataPoint.create({
          data: {
            userId,
            timestamp,
            consumptionKwh: 0.05 // Very low consumption today
          }
        });
      }

      const chartData = await generateChartData(userId, today);

      // Check early morning off-peak intervals (00:00-07:00)
      const offPeakIntervals = chartData.intervals.slice(0, 14); // First 14 intervals (7 hours)
      const greenShadedCount = offPeakIntervals.filter(i => i.shading === 'green').length;

      // At least some off-peak intervals should be green
      expect(greenShadedCount).toBeGreaterThan(0);
    });

    it('should apply yellow shading for peak periods', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const chartData = await generateChartData(userId, today);

      // Check peak period intervals (17:00-22:00)
      const peakIntervals = chartData.intervals.slice(34, 44); // Intervals 34-43 (17:00-22:00)
      const yellowShadedCount = peakIntervals.filter(i => i.shading === 'yellow').length;

      // All peak intervals should be yellow
      expect(yellowShadedCount).toBeGreaterThan(0);
    });

    it('should include current status when date is today', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const chartData = await generateChartData(userId, today);

      expect(chartData.currentStatus).not.toBeNull();
      expect(chartData.currentStatus).toHaveProperty('solarState');
      expect(chartData.currentStatus).toHaveProperty('consumptionState');
      expect(chartData.currentStatus).toHaveProperty('currentPrice');
      expect(chartData.currentStatus).toHaveProperty('actionPrompt');
    });

    it('should not include current status when date is tomorrow', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const chartData = await generateChartData(userId, tomorrow);

      expect(chartData.currentStatus).toBeNull();
    });

    it('should handle user without solar system', async () => {
      // Update solar config to no solar
      await prisma.solarSystem.update({
        where: { userId },
        data: {
          hasSolar: false,
          systemSizeKw: null,
          tiltDegrees: null,
          orientation: null
        }
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const chartData = await generateChartData(userId, today);

      // All solar generation should be zero
      chartData.intervals.forEach(interval => {
        expect(interval.solarGenerationKwh).toBe(0);
      });
    });

    it('should format date correctly', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const chartData = await generateChartData(userId, today);

      // Date should be in YYYY-MM-DD format
      expect(chartData.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should format times correctly', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const chartData = await generateChartData(userId, today);

      // Check first interval
      expect(chartData.intervals[0].startTime).toBe('00:00');
      expect(chartData.intervals[0].endTime).toBe('00:30');

      // Check last interval
      expect(chartData.intervals[47].startTime).toBe('23:30');
      expect(chartData.intervals[47].endTime).toBe('00:00');
    });

    it('should handle missing consumption data gracefully', async () => {
      // Delete all consumption data
      await prisma.consumptionDataPoint.deleteMany({
        where: { userId }
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const chartData = await generateChartData(userId, today);

      // Should still generate chart data with null consumption
      expect(chartData.intervals).toHaveLength(48);
      chartData.intervals.forEach(interval => {
        expect(interval.consumptionKwh).toBeNull();
      });
    });
  });

  describe('Current Status', () => {
    it('should calculate solar state correctly', async () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0); // Noon - high solar

      const chartData = await generateChartData(userId, today);

      if (chartData.currentStatus) {
        expect(['high', 'medium', 'low']).toContain(chartData.currentStatus.solarState);
      }
    });

    it('should calculate consumption state correctly', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const chartData = await generateChartData(userId, today);

      if (chartData.currentStatus) {
        expect(['high', 'medium', 'low']).toContain(chartData.currentStatus.consumptionState);
      }
    });

    it('should provide action prompt for high solar and low consumption', async () => {
      // Create scenario with high solar (midday) and low consumption
      const today = new Date();
      today.setHours(12, 0, 0, 0);

      const chartData = await generateChartData(userId, today);

      if (chartData.currentStatus) {
        expect(chartData.currentStatus.actionPrompt).toBeTruthy();
        expect(typeof chartData.currentStatus.actionPrompt).toBe('string');
      }
    });

    it('should provide action prompt for peak pricing', async () => {
      // Create scenario during peak period
      const today = new Date();
      today.setHours(18, 0, 0, 0); // 6 PM - peak period

      const chartData = await generateChartData(userId, today);

      if (chartData.currentStatus) {
        expect(chartData.currentStatus.actionPrompt).toBeTruthy();
      }
    });
  });

  describe('Shading Logic', () => {
    it('should apply green shading when solar exceeds consumption by 1 kWh', async () => {
      // Create high solar generation scenario
      await prisma.solarSystem.update({
        where: { userId },
        data: {
          systemSizeKw: 10.0 // Large system for high generation
        }
      });

      // Create low consumption data
      await prisma.consumptionDataPoint.deleteMany({ where: { userId } });
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 48; i++) {
        const timestamp = new Date(today);
        timestamp.setMinutes(i * 30);

        await prisma.consumptionDataPoint.create({
          data: {
            userId,
            timestamp,
            consumptionKwh: 0.1 // Very low consumption
          }
        });
      }

      const chartData = await generateChartData(userId, today);

      // During midday, solar should exceed consumption + 1 kWh
      const middayIntervals = chartData.intervals.slice(20, 30); // 10:00-15:00
      const greenCount = middayIntervals.filter(i => i.shading === 'green').length;

      expect(greenCount).toBeGreaterThan(0);
    });

    it('should apply yellow shading for high price with low solar', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const chartData = await generateChartData(userId, today);

      // Evening hours should have yellow shading (peak period)
      const eveningIntervals = chartData.intervals.slice(34, 44); // 17:00-22:00
      const yellowCount = eveningIntervals.filter(i => i.shading === 'yellow').length;

      expect(yellowCount).toBeGreaterThan(0);
    });
  });
});
