/**
 * Tests for Tariff API Routes
 */

import request from 'supertest';
import app from '../../index.js';
import { cleanDatabase, createTestUser } from '../../__tests__/testSetup.js';
import { generateToken } from '../../lib/auth.js';

describe('Tariff API Routes', () => {
  let testUserId: string;
  let testEmail: string;
  let authToken: string;

  beforeEach(async () => {
    await cleanDatabase();
    const user = await createTestUser('tariff@example.com');
    testUserId = user.id;
    testEmail = user.email;
    authToken = generateToken(testUserId, testEmail);
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/tariff', () => {
    it('should store a tariff structure', async () => {
      const tariff = {
        effectiveDate: '2024-01-01',
        periods: [
          {
            name: 'off-peak',
            startTime: '00:00',
            endTime: '07:00',
            pricePerKwh: 0.07,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
          },
          {
            name: 'peak',
            startTime: '17:00',
            endTime: '22:00',
            pricePerKwh: 0.30,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI']
          }
        ]
      };

      const response = await request(app)
        .post('/api/tariff')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tariff);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should require authentication', async () => {
      const tariff = {
        effectiveDate: '2024-01-01',
        periods: [
          {
            name: 'off-peak',
            startTime: '00:00',
            endTime: '07:00',
            pricePerKwh: 0.07,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
          }
        ]
      };

      const response = await request(app)
        .post('/api/tariff')
        .send(tariff);

      expect(response.status).toBe(401);
    });

    it('should validate tariff structure', async () => {
      const invalidTariff = {
        effectiveDate: '2024-01-01',
        periods: [] // Empty periods array
      };

      const response = await request(app)
        .post('/api/tariff')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTariff);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid tariff structure');
    });

    it('should validate time format', async () => {
      const invalidTariff = {
        effectiveDate: '2024-01-01',
        periods: [
          {
            name: 'off-peak',
            startTime: '25:00', // Invalid hour
            endTime: '07:00',
            pricePerKwh: 0.07,
            daysOfWeek: ['MON']
          }
        ]
      };

      const response = await request(app)
        .post('/api/tariff')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTariff);

      expect(response.status).toBe(400);
    });

    it('should validate price range', async () => {
      const invalidTariff = {
        effectiveDate: '2024-01-01',
        periods: [
          {
            name: 'off-peak',
            startTime: '00:00',
            endTime: '07:00',
            pricePerKwh: -0.05, // Negative price
            daysOfWeek: ['MON']
          }
        ]
      };

      const response = await request(app)
        .post('/api/tariff')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTariff);

      expect(response.status).toBe(400);
    });

    it('should validate days of week', async () => {
      const invalidTariff = {
        effectiveDate: '2024-01-01',
        periods: [
          {
            name: 'off-peak',
            startTime: '00:00',
            endTime: '07:00',
            pricePerKwh: 0.07,
            daysOfWeek: ['MONDAY'] // Invalid day format
          }
        ]
      };

      const response = await request(app)
        .post('/api/tariff')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTariff);

      expect(response.status).toBe(400);
    });

    it('should replace existing tariff', async () => {
      const tariff1 = {
        effectiveDate: '2024-01-01',
        periods: [
          {
            name: 'flat',
            startTime: '00:00',
            endTime: '00:00',
            pricePerKwh: 0.15,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
          }
        ]
      };

      const tariff2 = {
        effectiveDate: '2024-02-01',
        periods: [
          {
            name: 'off-peak',
            startTime: '00:00',
            endTime: '07:00',
            pricePerKwh: 0.07,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
          }
        ]
      };

      await request(app)
        .post('/api/tariff')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tariff1);

      await request(app)
        .post('/api/tariff')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tariff2);

      const response = await request(app)
        .get('/api/tariff')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.periods).toHaveLength(1);
      expect(response.body.periods[0].name).toBe('off-peak');
    });
  });

  describe('GET /api/tariff', () => {
    it('should return default tariff when none is configured', async () => {
      const response = await request(app)
        .get('/api/tariff')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.isDefault).toBe(true);
      expect(response.body.periods.length).toBeGreaterThan(0);
    });

    it('should return stored tariff structure', async () => {
      const tariff = {
        effectiveDate: '2024-01-01',
        periods: [
          {
            name: 'off-peak',
            startTime: '00:00',
            endTime: '07:00',
            pricePerKwh: 0.07,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
          },
          {
            name: 'shoulder',
            startTime: '07:00',
            endTime: '17:00',
            pricePerKwh: 0.15,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI']
          }
        ]
      };

      await request(app)
        .post('/api/tariff')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tariff);

      const response = await request(app)
        .get('/api/tariff')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.isDefault).toBe(false);
      expect(response.body.periods).toHaveLength(2);
      expect(response.body.periods[0].name).toBe('off-peak');
      expect(response.body.periods[0].pricePerKwh).toBe(0.07);
      expect(response.body.periods[1].name).toBe('shoulder');
      expect(response.body.periods[1].pricePerKwh).toBe(0.15);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/tariff');

      expect(response.status).toBe(401);
    });

    it('should include userId and effectiveDate', async () => {
      const response = await request(app)
        .get('/api/tariff')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.userId).toBe(testUserId);
      expect(response.body.effectiveDate).toBeDefined();
    });
  });

  describe('Integration', () => {
    it('should support complete tariff management workflow', async () => {
      // 1. Get default tariff
      const defaultResponse = await request(app)
        .get('/api/tariff')
        .set('Authorization', `Bearer ${authToken}`);

      expect(defaultResponse.body.isDefault).toBe(true);

      // 2. Store custom tariff
      const customTariff = {
        effectiveDate: '2024-01-01',
        periods: [
          {
            name: 'off-peak',
            startTime: '00:00',
            endTime: '07:00',
            pricePerKwh: 0.08,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
          },
          {
            name: 'peak',
            startTime: '17:00',
            endTime: '22:00',
            pricePerKwh: 0.35,
            daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI']
          }
        ]
      };

      const storeResponse = await request(app)
        .post('/api/tariff')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customTariff);

      expect(storeResponse.status).toBe(201);

      // 3. Retrieve custom tariff
      const customResponse = await request(app)
        .get('/api/tariff')
        .set('Authorization', `Bearer ${authToken}`);

      expect(customResponse.body.isDefault).toBe(false);
      expect(customResponse.body.periods[0].pricePerKwh).toBe(0.08);
      expect(customResponse.body.periods[1].pricePerKwh).toBe(0.35);
    });
  });
});
