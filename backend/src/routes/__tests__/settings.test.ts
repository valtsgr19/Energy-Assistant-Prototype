import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import express from 'express';
import settingsRouter from '../settings.js';
import { setupTest, teardownTest, getPrismaClient } from '../../__tests__/testSetup.js';

// Create a test app instance
const app = express();
app.use(express.json());
app.use('/api/settings', settingsRouter);

const prisma = getPrismaClient();

// Clean up database before and after tests
beforeEach(async () => {
  await setupTest();
});

afterAll(async () => {
  await teardownTest();
});

describe('GET /api/settings/profile', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create a test user and get auth token
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = await prisma.userProfile.create({
      data: {
        email: 'profile-test@example.com',
        passwordHash,
        energyAccountId: 'ACC001',
      },
    });
    userId = user.id;

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    authToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  });

  it('should retrieve user profile with no solar system', async () => {
    const response = await request(app)
      .get('/api/settings/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      userId,
      energyAccountId: 'ACC001',
      solarSystem: null,
      evs: [],
      batteries: [],
    });
  });

  it('should retrieve user profile with solar system (hasSolar = true)', async () => {
    // Create solar system
    await prisma.solarSystem.create({
      data: {
        userId,
        hasSolar: true,
        systemSizeKw: 5.5,
        tiltDegrees: 30.0,
        orientation: 'S',
      },
    });

    const response = await request(app)
      .get('/api/settings/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.userId).toBe(userId);
    expect(response.body.energyAccountId).toBe('ACC001');
    expect(response.body.solarSystem).toEqual({
      hasSolar: true,
      systemSizeKw: 5.5,
      tiltDegrees: 30.0,
      orientation: 'S',
    });
    expect(response.body.evs).toEqual([]);
    expect(response.body.batteries).toEqual([]);
  });

  it('should retrieve user profile with solar system (hasSolar = false)', async () => {
    // Create solar system with hasSolar = false
    await prisma.solarSystem.create({
      data: {
        userId,
        hasSolar: false,
        systemSizeKw: null,
        tiltDegrees: null,
        orientation: null,
      },
    });

    const response = await request(app)
      .get('/api/settings/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.solarSystem).toEqual({
      hasSolar: false,
      systemSizeKw: null,
      tiltDegrees: null,
      orientation: null,
    });
  });

  it('should retrieve user profile with electric vehicles', async () => {
    // Create EVs
    await prisma.electricVehicle.createMany({
      data: [
        {
          userId,
          make: 'Tesla',
          model: 'Model 3',
          batteryCapacityKwh: 75.0,
          chargingSpeedKw: 11.0,
          averageDailyMiles: 40.0,
        },
        {
          userId,
          make: 'Nissan',
          model: 'Leaf',
          batteryCapacityKwh: 40.0,
          chargingSpeedKw: 7.0,
          averageDailyMiles: 25.0,
        },
      ],
    });

    const response = await request(app)
      .get('/api/settings/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.evs).toHaveLength(2);
    expect(response.body.evs[0]).toMatchObject({
      make: 'Tesla',
      model: 'Model 3',
      batteryCapacityKwh: 75.0,
      chargingSpeedKw: 11.0,
      averageDailyMiles: 40.0,
    });
    expect(response.body.evs[0]).toHaveProperty('vehicleId');
    expect(response.body.evs[1]).toMatchObject({
      make: 'Nissan',
      model: 'Leaf',
      batteryCapacityKwh: 40.0,
      chargingSpeedKw: 7.0,
      averageDailyMiles: 25.0,
    });
  });

  it('should retrieve user profile with home batteries', async () => {
    // Create batteries
    await prisma.homeBattery.createMany({
      data: [
        {
          userId,
          powerKw: 5.0,
          capacityKwh: 13.5,
        },
        {
          userId,
          powerKw: 10.0,
          capacityKwh: 20.0,
        },
      ],
    });

    const response = await request(app)
      .get('/api/settings/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.batteries).toHaveLength(2);
    expect(response.body.batteries[0]).toMatchObject({
      powerKw: 5.0,
      capacityKwh: 13.5,
    });
    expect(response.body.batteries[0]).toHaveProperty('batteryId');
    expect(response.body.batteries[1]).toMatchObject({
      powerKw: 10.0,
      capacityKwh: 20.0,
    });
  });

  it('should retrieve complete user profile with all assets', async () => {
    // Create solar system
    await prisma.solarSystem.create({
      data: {
        userId,
        hasSolar: true,
        systemSizeKw: 6.0,
        tiltDegrees: 25.0,
        orientation: 'SW',
      },
    });

    // Create EV
    await prisma.electricVehicle.create({
      data: {
        userId,
        make: 'Tesla',
        model: 'Model Y',
        batteryCapacityKwh: 75.0,
        chargingSpeedKw: 11.0,
        averageDailyMiles: 50.0,
      },
    });

    // Create battery
    await prisma.homeBattery.create({
      data: {
        userId,
        powerKw: 5.0,
        capacityKwh: 13.5,
      },
    });

    const response = await request(app)
      .get('/api/settings/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.userId).toBe(userId);
    expect(response.body.energyAccountId).toBe('ACC001');
    expect(response.body.solarSystem).toMatchObject({
      hasSolar: true,
      systemSizeKw: 6.0,
      tiltDegrees: 25.0,
      orientation: 'SW',
    });
    expect(response.body.evs).toHaveLength(1);
    expect(response.body.batteries).toHaveLength(1);
  });

  it('should reject request without authentication token', async () => {
    const response = await request(app)
      .get('/api/settings/profile');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('token');
  });

  it('should reject request with invalid authentication token', async () => {
    const response = await request(app)
      .get('/api/settings/profile')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 404 for non-existent user', async () => {
    // Create token for non-existent user
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const fakeToken = jwt.sign(
      { userId: 'non-existent-id', email: 'fake@example.com' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = await request(app)
      .get('/api/settings/profile')
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('not found');
  });

  it('should handle user with null energyAccountId', async () => {
    // Create user without energy account
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = await prisma.userProfile.create({
      data: {
        email: 'no-energy-account@example.com',
        passwordHash,
        energyAccountId: null,
      },
    });

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = await request(app)
      .get('/api/settings/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.energyAccountId).toBeNull();
  });
});
