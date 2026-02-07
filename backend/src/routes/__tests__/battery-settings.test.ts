/**
 * Battery Settings Tests
 * 
 * Tests for battery configuration endpoints (POST, PUT, DELETE)
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

describe('Battery Settings', () => {
  let userId: string;
  let authToken: string;

  beforeEach(async () => {
    await setupTest();

    // Create test user
    const user = await prisma.userProfile.create({
      data: {
        email: 'batteryowner@test.com',
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

  describe('POST /api/settings/battery', () => {
    it('should create battery with valid specifications', async () => {
      const response = await request(app)
        .post('/api/settings/battery')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          powerKw: 5,
          capacityKwh: 13.5,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.batteryId).toBeDefined();

      // Verify in database
      const battery = await prisma.homeBattery.findUnique({
        where: { id: response.body.batteryId },
      });

      expect(battery).toBeDefined();
      expect(battery?.powerKw).toBe(5);
      expect(battery?.capacityKwh).toBe(13.5);
      expect(battery?.userId).toBe(userId);
    });

    it('should create battery with large capacity', async () => {
      const response = await request(app)
        .post('/api/settings/battery')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          powerKw: 10,
          capacityKwh: 100,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should create battery with small capacity', async () => {
      const response = await request(app)
        .post('/api/settings/battery')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          powerKw: 3,
          capacityKwh: 5,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should reject missing power rating', async () => {
      const response = await request(app)
        .post('/api/settings/battery')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          capacityKwh: 13.5,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Power rating and capacity are required');
    });

    it('should reject missing capacity', async () => {
      const response = await request(app)
        .post('/api/settings/battery')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          powerKw: 5,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Power rating and capacity are required');
    });

    it('should reject invalid power rating (too high)', async () => {
      const response = await request(app)
        .post('/api/settings/battery')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          powerKw: 100,
          capacityKwh: 13.5,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Power rating must be between 0 and 50 kW');
    });

    it('should reject invalid power rating (zero)', async () => {
      const response = await request(app)
        .post('/api/settings/battery')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          powerKw: 0,
          capacityKwh: 13.5,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Power rating must be between 0 and 50 kW');
    });

    it('should reject invalid capacity (too high)', async () => {
      const response = await request(app)
        .post('/api/settings/battery')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          powerKw: 5,
          capacityKwh: 250,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Capacity must be between 0 and 200 kWh');
    });

    it('should reject invalid capacity (zero)', async () => {
      const response = await request(app)
        .post('/api/settings/battery')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          powerKw: 5,
          capacityKwh: 0,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Capacity must be between 0 and 200 kWh');
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/settings/battery')
        .send({
          powerKw: 5,
          capacityKwh: 13.5,
        });

      expect(response.status).toBe(401);
    });

    it('should allow multiple batteries for same user', async () => {
      // Create first battery
      const response1 = await request(app)
        .post('/api/settings/battery')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          powerKw: 5,
          capacityKwh: 13.5,
        });

      expect(response1.status).toBe(201);

      // Create second battery
      const response2 = await request(app)
        .post('/api/settings/battery')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          powerKw: 10,
          capacityKwh: 20,
        });

      expect(response2.status).toBe(201);
      expect(response2.body.batteryId).not.toBe(response1.body.batteryId);

      // Verify both exist
      const batteries = await prisma.homeBattery.findMany({
        where: { userId },
      });

      expect(batteries.length).toBe(2);
    });
  });

  describe('PUT /api/settings/battery/:batteryId', () => {
    let batteryId: string;

    beforeEach(async () => {
      // Create test battery
      const battery = await prisma.homeBattery.create({
        data: {
          userId,
          powerKw: 5,
          capacityKwh: 13.5,
        },
      });

      batteryId = battery.id;
    });

    it('should update battery power rating', async () => {
      const response = await request(app)
        .put(`/api/settings/battery/${batteryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          powerKw: 7,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const battery = await prisma.homeBattery.findUnique({
        where: { id: batteryId },
      });

      expect(battery?.powerKw).toBe(7);
      expect(battery?.capacityKwh).toBe(13.5); // Unchanged
    });

    it('should update battery capacity', async () => {
      const response = await request(app)
        .put(`/api/settings/battery/${batteryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          capacityKwh: 20,
        });

      expect(response.status).toBe(200);

      const battery = await prisma.homeBattery.findUnique({
        where: { id: batteryId },
      });

      expect(battery?.capacityKwh).toBe(20);
      expect(battery?.powerKw).toBe(5); // Unchanged
    });

    it('should update both power and capacity', async () => {
      const response = await request(app)
        .put(`/api/settings/battery/${batteryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          powerKw: 10,
          capacityKwh: 25,
        });

      expect(response.status).toBe(200);

      const battery = await prisma.homeBattery.findUnique({
        where: { id: batteryId },
      });

      expect(battery?.powerKw).toBe(10);
      expect(battery?.capacityKwh).toBe(25);
    });

    it('should reject update for non-existent battery', async () => {
      const response = await request(app)
        .put('/api/settings/battery/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          powerKw: 7,
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Battery not found');
    });

    it('should reject update for battery owned by different user', async () => {
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
        .put(`/api/settings/battery/${batteryId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          powerKw: 7,
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Not authorized');
    });

    it('should reject invalid power rating', async () => {
      const response = await request(app)
        .put(`/api/settings/battery/${batteryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          powerKw: -5,
        });

      expect(response.status).toBe(400);
    });

    it('should reject invalid capacity', async () => {
      const response = await request(app)
        .put(`/api/settings/battery/${batteryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          capacityKwh: 300,
        });

      expect(response.status).toBe(400);
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .put(`/api/settings/battery/${batteryId}`)
        .send({
          powerKw: 7,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/settings/battery/:batteryId', () => {
    let batteryId: string;

    beforeEach(async () => {
      // Create test battery
      const battery = await prisma.homeBattery.create({
        data: {
          userId,
          powerKw: 5,
          capacityKwh: 13.5,
        },
      });

      batteryId = battery.id;
    });

    it('should delete battery', async () => {
      const response = await request(app)
        .delete(`/api/settings/battery/${batteryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify deletion
      const battery = await prisma.homeBattery.findUnique({
        where: { id: batteryId },
      });

      expect(battery).toBeNull();
    });

    it('should reject deletion for non-existent battery', async () => {
      const response = await request(app)
        .delete('/api/settings/battery/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Battery not found');
    });

    it('should reject deletion for battery owned by different user', async () => {
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
        .delete(`/api/settings/battery/${batteryId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Not authorized');
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .delete(`/api/settings/battery/${batteryId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/settings/profile - Battery integration', () => {
    it('should include batteries in profile response', async () => {
      // Create multiple batteries
      await prisma.homeBattery.create({
        data: {
          userId,
          powerKw: 5,
          capacityKwh: 13.5,
        },
      });

      await prisma.homeBattery.create({
        data: {
          userId,
          powerKw: 10,
          capacityKwh: 20,
        },
      });

      const response = await request(app)
        .get('/api/settings/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.batteries).toHaveLength(2);
      expect(response.body.batteries[0]).toHaveProperty('batteryId');
      expect(response.body.batteries[0]).toHaveProperty('powerKw');
      expect(response.body.batteries[0]).toHaveProperty('capacityKwh');
    });
  });
});
