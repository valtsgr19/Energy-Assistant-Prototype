/**
 * Integration Tests - Core Data Services
 * 
 * Verifies that authentication, solar forecasting, tariff mapping,
 * and consumption retrieval work together correctly.
 */

import request from 'supertest';
import app from '../index.js';
import { cleanDatabase } from './testSetup.js';
import { generateSolarForecast } from '../lib/solarForecast.js';
import { mapTariffToIntervals, getDefaultTariffStructure } from '../lib/tariff.js';
import { storeConsumptionData } from '../lib/consumption.js';

describe('Integration Tests - Core Data Services', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe('Complete User Flow', () => {
    it('should complete full onboarding and data setup flow', async () => {
      // 1. Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'integration@example.com',
          password: 'SecurePass123!'
        });

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.token).toBeDefined();
      authToken = registerResponse.body.token;
      userId = registerResponse.body.userId;

      // 2. Link energy account
      const linkResponse = await request(app)
        .post('/api/auth/link-energy-account')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          energyAccountId: 'ACC001',
          energyAccountPassword: 'password123'
        });

      expect(linkResponse.status).toBe(200);
      expect(linkResponse.body.success).toBe(true);

      // 3. Configure solar system
      const solarResponse = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          systemSizeKw: 5.0,
          tiltDegrees: 30.0,
          orientation: 'S'
        });

      expect(solarResponse.status).toBe(200);
      expect(solarResponse.body.success).toBe(true);

      // 4. Store tariff structure
      const tariffResponse = await request(app)
        .post('/api/tariff')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
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
        });

      expect(tariffResponse.status).toBe(201);
      expect(tariffResponse.body.success).toBe(true);

      // 5. Sync consumption data
      const syncResponse = await request(app)
        .post('/api/consumption/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ days: 1 });

      expect(syncResponse.status).toBe(200);
      expect(syncResponse.body.success).toBe(true);
      expect(syncResponse.body.synced).toBeGreaterThan(0);

      // 6. Verify profile has all data
      const profileResponse = await request(app)
        .get('/api/settings/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.solarSystem).toBeDefined();
      expect(profileResponse.body.solarSystem.hasSolar).toBe(true);
      expect(profileResponse.body.energyAccountId).toBe('ACC001');
    });
  });

  describe('Service Integration', () => {
    beforeEach(async () => {
      await cleanDatabase();
      
      // Setup authenticated user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'service@example.com',
          password: 'SecurePass123!'
        });

      authToken = registerResponse.body.token;
      userId = registerResponse.body.userId;

      // Link energy account
      await request(app)
        .post('/api/auth/link-energy-account')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          energyAccountId: 'ACC001',
          energyAccountPassword: 'password123'
        });
    });

    it('should generate solar forecast for configured system', async () => {
      // Configure solar system
      await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          systemSizeKw: 5.0,
          tiltDegrees: 30.0,
          orientation: 'S'
        });

      // Generate forecast using service
      const config = {
        hasSolar: true,
        systemSizeKw: 5.0,
        tiltDegrees: 30.0,
        orientation: 'S'
      };

      const forecast = generateSolarForecast(config, new Date('2024-06-21'));

      expect(forecast.intervals).toHaveLength(48);
      
      // Verify some intervals have generation during daylight
      const middayIntervals = forecast.intervals.slice(22, 28);
      const hasGeneration = middayIntervals.some(i => i.generationKwh > 0);
      expect(hasGeneration).toBe(true);
    });

    it('should map tariff to 48 intervals', async () => {
      // Store tariff
      await request(app)
        .post('/api/tariff')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
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
              daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
            },
            {
              name: 'peak',
              startTime: '17:00',
              endTime: '22:00',
              pricePerKwh: 0.30,
              daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI']
            },
            {
              name: 'off-peak',
              startTime: '22:00',
              endTime: '00:00',
              pricePerKwh: 0.07,
              daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
            }
          ]
        });

      // Get tariff and map to intervals
      const tariff = getDefaultTariffStructure(userId);
      const intervals = mapTariffToIntervals(tariff, new Date('2024-01-15'));

      expect(intervals).toHaveLength(48);
      
      // Verify pricing structure
      expect(intervals[0].pricePerKwh).toBe(0.07); // Midnight - off-peak
      expect(intervals[14].pricePerKwh).toBe(0.15); // 7 AM - shoulder
      expect(intervals[34].pricePerKwh).toBe(0.30); // 5 PM - peak
    });

    it('should retrieve and store consumption data', async () => {
      // Sync consumption data
      const syncResponse = await request(app)
        .post('/api/consumption/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ days: 1 });

      expect(syncResponse.status).toBe(200);
      expect(syncResponse.body.synced).toBeGreaterThan(0);

      // Retrieve consumption data
      const today = new Date().toISOString().split('T')[0];
      const dataResponse = await request(app)
        .get(`/api/consumption/date/${today}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(dataResponse.status).toBe(200);
      expect(dataResponse.body.dataPoints).toBeDefined();
      expect(dataResponse.body.hasData).toBe(true);
    });

    it('should handle consumption data with gaps', async () => {
      // Store partial consumption data
      const date = new Date('2024-01-15');
      await storeConsumptionData(userId, [
        { timestamp: new Date('2024-01-15T00:00:00'), consumptionKwh: 0.5 },
        { timestamp: new Date('2024-01-15T00:30:00'), consumptionKwh: 0.6 },
        // Missing data for rest of day
      ]);

      // Retrieve with gaps
      const dataResponse = await request(app)
        .get('/api/consumption/date/2024-01-15?includeGaps=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(dataResponse.status).toBe(200);
      expect(dataResponse.body.dataPoints).toHaveLength(48);
      expect(dataResponse.body.dataPoints[0].consumptionKwh).toBe(0.5);
      expect(dataResponse.body.dataPoints[1].consumptionKwh).toBe(0.6);
      expect(dataResponse.body.dataPoints[2].consumptionKwh).toBeNull();
    });
  });

  describe('Data Consistency', () => {
    beforeEach(async () => {
      await cleanDatabase();
      
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'consistency@example.com',
          password: 'SecurePass123!'
        });

      authToken = registerResponse.body.token;
      userId = registerResponse.body.userId;
    });

    it('should maintain data consistency across services', async () => {
      // Link energy account
      await request(app)
        .post('/api/auth/link-energy-account')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          energyAccountId: 'ACC001',
          energyAccountPassword: 'password123'
        });

      // Configure solar
      await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          systemSizeKw: 5.0,
          tiltDegrees: 30.0,
          orientation: 'S'
        });

      // Store tariff
      await request(app)
        .post('/api/tariff')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
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
        });

      // Sync consumption
      await request(app)
        .post('/api/consumption/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ days: 1 });

      // Verify all data is accessible
      const profileResponse = await request(app)
        .get('/api/settings/profile')
        .set('Authorization', `Bearer ${authToken}`);

      const tariffResponse = await request(app)
        .get('/api/tariff')
        .set('Authorization', `Bearer ${authToken}`);

      const today = new Date().toISOString().split('T')[0];
      const consumptionResponse = await request(app)
        .get(`/api/consumption/date/${today}`)
        .set('Authorization', `Bearer ${authToken}`);

      // All services should return data
      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.solarSystem).toBeDefined();
      expect(profileResponse.body.energyAccountId).toBe('ACC001');

      expect(tariffResponse.status).toBe(200);
      expect(tariffResponse.body.periods).toHaveLength(1);

      expect(consumptionResponse.status).toBe(200);
      expect(consumptionResponse.body.hasData).toBe(true);
    });

    it('should handle updates to solar configuration', async () => {
      // Initial configuration
      await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          systemSizeKw: 5.0,
          tiltDegrees: 30.0,
          orientation: 'S'
        });

      // Update configuration
      await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          systemSizeKw: 10.0,
          tiltDegrees: 40.0,
          orientation: 'SE'
        });

      // Verify updated configuration
      const profileResponse = await request(app)
        .get('/api/settings/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.solarSystem.systemSizeKw).toBe(10.0);
      expect(profileResponse.body.solarSystem.tiltDegrees).toBe(40.0);
      expect(profileResponse.body.solarSystem.orientation).toBe('SE');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing authentication gracefully', async () => {
      const response = await request(app)
        .get('/api/settings/profile');

      expect(response.status).toBe(401);
    });

    it('should accept any energy account credentials in development', async () => {
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'anyaccount@example.com',
          password: 'SecurePass123!'
        });

      authToken = registerResponse.body.token;

      const linkResponse = await request(app)
        .post('/api/auth/link-energy-account')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          energyAccountId: 'ANY_ID',
          energyAccountPassword: 'any_password'
        });

      // In development mode, any credentials are accepted
      expect(linkResponse.status).toBe(200);
      expect(linkResponse.body).toHaveProperty('success', true);
    });

    it('should handle consumption sync without linked account', async () => {
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'nosync@example.com',
          password: 'SecurePass123!'
        });

      authToken = registerResponse.body.token;

      const syncResponse = await request(app)
        .post('/api/consumption/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ days: 1 });

      expect(syncResponse.status).toBe(207); // Partial success with errors
      expect(syncResponse.body.errors.length).toBeGreaterThan(0);
    }, 10000); // Increase timeout for retry logic
  });
});
