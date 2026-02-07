/**
 * EV Settings Tests
 * 
 * Tests for EV configuration endpoints (POST, PUT, DELETE)
 */

import request from 'supertest';
import express from 'express';
import settingsRouter from '../settings.js';
import { setupTest, teardownTest, getPrismaClient } from '../../__tests__/testSetup.js';
import { generateToken } from '../../lib/auth.js';

const app = express();
app.use(express.json());
app.use('/api/settings', settingsRouter);

const prisma = getPrismaClient();

describe('EV Settings', () => {
  let userId: string;
  let authToken: string;

  beforeEach(async () => {
    await setupTest();

    // Create test user
    const user = await prisma.userProfile.create({
      data: {
        email: 'evowner@test.com',
        passwordHash: 'hashedpassword',
        energyAccountId: 'ACC001',
      },
    });

    userId = user.id;
    authToken = generateToken(userId, user.email);
  });

  afterAll(async () => {
    await teardownTest();
  });

  describe('POST /api/settings/ev', () => {
    it('should create EV with inferred battery capacity', async () => {
      const response = await request(app)
        .post('/api/settings/ev')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          make: 'Tesla',
          model: 'Model 3 Long Range',
          chargingSpeedKw: 11,
          averageDailyMiles: 40,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.vehicleId).toBeDefined();
      expect(response.body.batteryCapacityKwh).toBe(75); // Inferred from lookup

      // Verify in database
      const ev = await prisma.electricVehicle.findUnique({
        where: { id: response.body.vehicleId },
      });

      expect(ev).toBeDefined();
      expect(ev?.make).toBe('Tesla');
      expect(ev?.model).toBe('Model 3 Long Range');
      expect(ev?.batteryCapacityKwh).toBe(75);
      expect(ev?.chargingSpeedKw).toBe(11);
      expect(ev?.averageDailyMiles).toBe(40);
    });

    it('should create EV with explicit battery capacity', async () => {
      const response = await request(app)
        .post('/api/settings/ev')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          make: 'Custom',
          model: 'EV Model',
          batteryCapacityKwh: 80,
          chargingSpeedKw: 7,
          averageDailyMiles: 30,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.batteryCapacityKwh).toBe(80);
    });

    it('should create EV with default values', async () => {
      const response = await request(app)
        .post('/api/settings/ev')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          make: 'Nissan',
          model: 'Leaf',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      const ev = await prisma.electricVehicle.findUnique({
        where: { id: response.body.vehicleId },
      });

      expect(ev?.chargingSpeedKw).toBe(7.0); // Default
      expect(ev?.averageDailyMiles).toBe(30); // Default
      expect(ev?.batteryCapacityKwh).toBe(40); // Inferred from Nissan Leaf
    });

    it('should use default battery capacity for unknown model', async () => {
      const response = await request(app)
        .post('/api/settings/ev')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          make: 'Unknown',
          model: 'Unknown Model',
        });

      expect(response.status).toBe(201);
      expect(response.body.batteryCapacityKwh).toBe(65); // Default mid-size
    });

    it('should reject missing make', async () => {
      const response = await request(app)
        .post('/api/settings/ev')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          model: 'Model 3',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Make and model are required');
    });

    it('should reject missing model', async () => {
      const response = await request(app)
        .post('/api/settings/ev')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          make: 'Tesla',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Make and model are required');
    });

    it('should reject invalid charging speed', async () => {
      const response = await request(app)
        .post('/api/settings/ev')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          make: 'Tesla',
          model: 'Model 3',
          chargingSpeedKw: 400, // Too high
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Charging speed must be between 0 and 350 kW');
    });

    it('should reject invalid average daily miles', async () => {
      const response = await request(app)
        .post('/api/settings/ev')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          make: 'Tesla',
          model: 'Model 3',
          averageDailyMiles: 600, // Too high
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Average daily miles must be between 0 and 500');
    });

    it('should reject invalid battery capacity', async () => {
      const response = await request(app)
        .post('/api/settings/ev')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          make: 'Tesla',
          model: 'Model 3',
          batteryCapacityKwh: 250, // Too high
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Battery capacity must be between 0 and 200 kWh');
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/settings/ev')
        .send({
          make: 'Tesla',
          model: 'Model 3',
        });

      expect(response.status).toBe(401);
    });

    it('should allow multiple EVs for same user', async () => {
      // Create first EV
      const response1 = await request(app)
        .post('/api/settings/ev')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          make: 'Tesla',
          model: 'Model 3',
        });

      expect(response1.status).toBe(201);

      // Create second EV
      const response2 = await request(app)
        .post('/api/settings/ev')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          make: 'Nissan',
          model: 'Leaf',
        });

      expect(response2.status).toBe(201);
      expect(response2.body.vehicleId).not.toBe(response1.body.vehicleId);

      // Verify both exist
      const evs = await prisma.electricVehicle.findMany({
        where: { userId },
      });

      expect(evs.length).toBe(2);
    });
  });

  describe('PUT /api/settings/ev/:vehicleId', () => {
    let vehicleId: string;

    beforeEach(async () => {
      // Create test EV
      const ev = await prisma.electricVehicle.create({
        data: {
          userId,
          make: 'Tesla',
          model: 'Model 3',
          batteryCapacityKwh: 75,
          chargingSpeedKw: 11,
          averageDailyMiles: 40,
        },
      });

      vehicleId = ev.id;
    });

    it('should update EV charging speed', async () => {
      const response = await request(app)
        .put(`/api/settings/ev/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chargingSpeedKw: 7,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const ev = await prisma.electricVehicle.findUnique({
        where: { id: vehicleId },
      });

      expect(ev?.chargingSpeedKw).toBe(7);
      expect(ev?.make).toBe('Tesla'); // Unchanged
      expect(ev?.model).toBe('Model 3'); // Unchanged
    });

    it('should update EV average daily miles', async () => {
      const response = await request(app)
        .put(`/api/settings/ev/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          averageDailyMiles: 50,
        });

      expect(response.status).toBe(200);

      const ev = await prisma.electricVehicle.findUnique({
        where: { id: vehicleId },
      });

      expect(ev?.averageDailyMiles).toBe(50);
    });

    it('should update EV make and model with re-inference', async () => {
      const response = await request(app)
        .put(`/api/settings/ev/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          make: 'Nissan',
          model: 'Leaf',
        });

      expect(response.status).toBe(200);

      const ev = await prisma.electricVehicle.findUnique({
        where: { id: vehicleId },
      });

      expect(ev?.make).toBe('Nissan');
      expect(ev?.model).toBe('Leaf');
      expect(ev?.batteryCapacityKwh).toBe(40); // Re-inferred
    });

    it('should update EV with explicit battery capacity', async () => {
      const response = await request(app)
        .put(`/api/settings/ev/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          batteryCapacityKwh: 80,
        });

      expect(response.status).toBe(200);

      const ev = await prisma.electricVehicle.findUnique({
        where: { id: vehicleId },
      });

      expect(ev?.batteryCapacityKwh).toBe(80);
    });

    it('should reject update for non-existent EV', async () => {
      const response = await request(app)
        .put('/api/settings/ev/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chargingSpeedKw: 7,
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('EV not found');
    });

    it('should reject update for EV owned by different user', async () => {
      // Create another user
      const otherUser = await prisma.userProfile.create({
        data: {
          email: 'other@test.com',
          passwordHash: 'hashedpassword',
          energyAccountId: 'ACC002',
        },
      });

      const otherToken = generateToken(otherUser.id, otherUser.email);

      const response = await request(app)
        .put(`/api/settings/ev/${vehicleId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          chargingSpeedKw: 7,
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Not authorized');
    });

    it('should reject invalid charging speed', async () => {
      const response = await request(app)
        .put(`/api/settings/ev/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chargingSpeedKw: -5,
        });

      expect(response.status).toBe(400);
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .put(`/api/settings/ev/${vehicleId}`)
        .send({
          chargingSpeedKw: 7,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/settings/ev/:vehicleId', () => {
    let vehicleId: string;

    beforeEach(async () => {
      // Create test EV
      const ev = await prisma.electricVehicle.create({
        data: {
          userId,
          make: 'Tesla',
          model: 'Model 3',
          batteryCapacityKwh: 75,
          chargingSpeedKw: 11,
          averageDailyMiles: 40,
        },
      });

      vehicleId = ev.id;
    });

    it('should delete EV', async () => {
      const response = await request(app)
        .delete(`/api/settings/ev/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify deletion
      const ev = await prisma.electricVehicle.findUnique({
        where: { id: vehicleId },
      });

      expect(ev).toBeNull();
    });

    it('should reject deletion for non-existent EV', async () => {
      const response = await request(app)
        .delete('/api/settings/ev/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('EV not found');
    });

    it('should reject deletion for EV owned by different user', async () => {
      // Create another user
      const otherUser = await prisma.userProfile.create({
        data: {
          email: 'other@test.com',
          passwordHash: 'hashedpassword',
          energyAccountId: 'ACC002',
        },
      });

      const otherToken = generateToken(otherUser.id, otherUser.email);

      const response = await request(app)
        .delete(`/api/settings/ev/${vehicleId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Not authorized');
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .delete(`/api/settings/ev/${vehicleId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/settings/profile - EV integration', () => {
    it('should include EVs in profile response', async () => {
      // Create multiple EVs
      await prisma.electricVehicle.create({
        data: {
          userId,
          make: 'Tesla',
          model: 'Model 3',
          batteryCapacityKwh: 75,
          chargingSpeedKw: 11,
          averageDailyMiles: 40,
        },
      });

      await prisma.electricVehicle.create({
        data: {
          userId,
          make: 'Nissan',
          model: 'Leaf',
          batteryCapacityKwh: 40,
          chargingSpeedKw: 7,
          averageDailyMiles: 25,
        },
      });

      const response = await request(app)
        .get('/api/settings/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.evs).toHaveLength(2);
      expect(response.body.evs[0]).toHaveProperty('vehicleId');
      expect(response.body.evs[0]).toHaveProperty('make');
      expect(response.body.evs[0]).toHaveProperty('model');
      expect(response.body.evs[0]).toHaveProperty('batteryCapacityKwh');
      expect(response.body.evs[0]).toHaveProperty('chargingSpeedKw');
      expect(response.body.evs[0]).toHaveProperty('averageDailyMiles');
    });
  });
});
