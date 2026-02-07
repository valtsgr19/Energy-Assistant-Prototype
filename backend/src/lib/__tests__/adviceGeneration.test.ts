/**
 * Tests for Energy Advice Generation Service
 */

import { generateEnergyAdvice } from '../adviceGeneration';
import { prisma } from '../prisma';
import { createTestUser } from '../../__tests__/testSetup';

describe('Energy Advice Generation Service', () => {
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

  describe('generateEnergyAdvice', () => {
    it('should generate advice with all three categories', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const advice = await generateEnergyAdvice(userId, today);

      expect(advice).toHaveProperty('generalAdvice');
      expect(advice).toHaveProperty('evAdvice');
      expect(advice).toHaveProperty('batteryAdvice');
      expect(Array.isArray(advice.generalAdvice)).toBe(true);
      expect(Array.isArray(advice.evAdvice)).toBe(true);
      expect(Array.isArray(advice.batteryAdvice)).toBe(true);
    });

    it('should limit general advice to maximum 3 recommendations', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const advice = await generateEnergyAdvice(userId, today);

      expect(advice.generalAdvice.length).toBeLessThanOrEqual(3);
    });

    it('should include required fields in each advice item', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const advice = await generateEnergyAdvice(userId, today);

      advice.generalAdvice.forEach(item => {
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('recommendedTimeStart');
        expect(item).toHaveProperty('recommendedTimeEnd');
        expect(item).toHaveProperty('estimatedSavings');
        expect(item).toHaveProperty('priority');
        
        expect(typeof item.title).toBe('string');
        expect(typeof item.description).toBe('string');
        expect(typeof item.estimatedSavings).toBe('number');
        expect(['high', 'medium', 'low']).toContain(item.priority);
      });
    });

    it('should prioritize advice by priority level and savings', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const advice = await generateEnergyAdvice(userId, today);

      if (advice.generalAdvice.length > 1) {
        // Check that high priority comes before medium/low
        for (let i = 0; i < advice.generalAdvice.length - 1; i++) {
          const current = advice.generalAdvice[i];
          const next = advice.generalAdvice[i + 1];

          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const currentPriority = priorityOrder[current.priority];
          const nextPriority = priorityOrder[next.priority];

          expect(currentPriority).toBeGreaterThanOrEqual(nextPriority);
        }
      }
    });

    it('should generate peak avoidance advice when peak periods exist', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const advice = await generateEnergyAdvice(userId, today);

      // Should have at least one advice item about peak periods
      const peakAdvice = advice.generalAdvice.find(item => 
        item.description.toLowerCase().includes('peak')
      );

      expect(peakAdvice).toBeDefined();
    });

    it('should generate off-peak advice for overnight periods', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const advice = await generateEnergyAdvice(userId, today);

      // Should have advice about off-peak periods
      const offPeakAdvice = advice.generalAdvice.find(item => 
        item.description.toLowerCase().includes('off-peak') ||
        item.description.toLowerCase().includes('overnight') ||
        item.description.toLowerCase().includes('cheapest')
      );

      expect(offPeakAdvice).toBeDefined();
    });

    it('should generate solar surplus advice when solar generation is high', async () => {
      // Create scenario with high solar generation
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

      const advice = await generateEnergyAdvice(userId, today);

      // Should have advice about using solar surplus
      const solarAdvice = advice.generalAdvice.find(item => 
        item.description.toLowerCase().includes('solar') ||
        item.title.toLowerCase().includes('solar')
      );

      expect(solarAdvice).toBeDefined();
      if (solarAdvice) {
        expect(solarAdvice.priority).toBe('high');
      }
    });

    it('should calculate estimated savings for each advice item', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const advice = await generateEnergyAdvice(userId, today);

      advice.generalAdvice.forEach(item => {
        expect(item.estimatedSavings).toBeGreaterThanOrEqual(0);
        expect(typeof item.estimatedSavings).toBe('number');
      });
    });

    it('should format time recommendations correctly', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const advice = await generateEnergyAdvice(userId, today);

      const timeRegex = /^\d{2}:\d{2}$/;

      advice.generalAdvice.forEach(item => {
        expect(item.recommendedTimeStart).toMatch(timeRegex);
        expect(item.recommendedTimeEnd).toMatch(timeRegex);
      });
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

      const advice = await generateEnergyAdvice(userId, today);

      // Should still generate advice (peak avoidance, off-peak)
      expect(advice.generalAdvice.length).toBeGreaterThan(0);

      // Should not have solar-specific advice
      const solarAdvice = advice.generalAdvice.find(item => 
        item.description.toLowerCase().includes('solar generation') ||
        item.description.toLowerCase().includes('excess solar')
      );

      expect(solarAdvice).toBeUndefined();
    });

    it('should handle missing consumption data gracefully', async () => {
      // Delete all consumption data
      await prisma.consumptionDataPoint.deleteMany({
        where: { userId }
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const advice = await generateEnergyAdvice(userId, today);

      // Should still generate advice based on tariff and solar
      expect(advice.generalAdvice.length).toBeGreaterThan(0);
    });
  });

  describe('Advice Content Quality', () => {
    it('should provide actionable descriptions', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const advice = await generateEnergyAdvice(userId, today);

      advice.generalAdvice.forEach(item => {
        // Description should be substantial
        expect(item.description.length).toBeGreaterThan(20);
        
        // Should mention specific actions or appliances
        const hasActionableContent = 
          item.description.toLowerCase().includes('dishwasher') ||
          item.description.toLowerCase().includes('washing') ||
          item.description.toLowerCase().includes('laundry') ||
          item.description.toLowerCase().includes('dryer') ||
          item.description.toLowerCase().includes('charging') ||
          item.description.toLowerCase().includes('run') ||
          item.description.toLowerCase().includes('schedule') ||
          item.description.toLowerCase().includes('delay') ||
          item.description.toLowerCase().includes('avoid');

        expect(hasActionableContent).toBe(true);
      });
    });

    it('should provide clear time windows', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const advice = await generateEnergyAdvice(userId, today);

      advice.generalAdvice.forEach(item => {
        // Time window should be mentioned in description
        const mentionsTime = 
          item.description.includes(item.recommendedTimeStart) ||
          item.description.includes(item.recommendedTimeEnd) ||
          item.description.toLowerCase().includes('between') ||
          item.description.toLowerCase().includes('from') ||
          item.description.toLowerCase().includes('until') ||
          item.description.toLowerCase().includes('after');

        expect(mentionsTime).toBe(true);
      });
    });
  });
});
