import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import express from 'express';
import authRouter from '../auth.js';
import onboardingRouter from '../onboarding.js';
import settingsRouter from '../settings.js';
import { setupTest, teardownTest, getPrismaClient } from '../../__tests__/testSetup.js';

// Create a test app instance
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/settings', settingsRouter);

const prisma = getPrismaClient();

// Clean up database before and after tests
beforeEach(async () => {
  await setupTest();
});

afterAll(async () => {
  await teardownTest();
});

describe('Solar System Configuration Integration', () => {
  it('should complete full flow: register, configure solar, retrieve profile', async () => {
    // Step 1: Register a new user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'integration-test@example.com',
        password: 'password123',
      });

    expect(registerResponse.status).toBe(201);
    const { userId, token } = registerResponse.body;
    expect(userId).toBeTruthy();
    expect(token).toBeTruthy();

    // Step 2: Configure solar system
    const solarConfigResponse = await request(app)
      .post('/api/onboarding/solar-system')
      .set('Authorization', `Bearer ${token}`)
      .send({
        hasSolar: true,
        systemSizeKw: 6.5,
        tiltDegrees: 28.0,
        orientation: 'SW',
      });

    expect(solarConfigResponse.status).toBe(200);
    expect(solarConfigResponse.body.success).toBe(true);
    expect(solarConfigResponse.body.solarSystemId).toBeTruthy();

    // Step 3: Retrieve profile and verify solar configuration
    const profileResponse = await request(app)
      .get('/api/settings/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.userId).toBe(userId);
    expect(profileResponse.body.solarSystem).toEqual({
      hasSolar: true,
      systemSizeKw: 6.5,
      tiltDegrees: 28.0,
      orientation: 'SW',
    });
  });

  it('should complete full flow: register, configure no solar, retrieve profile', async () => {
    // Step 1: Register a new user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'no-solar-test@example.com',
        password: 'password123',
      });

    expect(registerResponse.status).toBe(201);
    const { userId, token } = registerResponse.body;

    // Step 2: Configure no solar system
    const solarConfigResponse = await request(app)
      .post('/api/onboarding/solar-system')
      .set('Authorization', `Bearer ${token}`)
      .send({
        hasSolar: false,
      });

    expect(solarConfigResponse.status).toBe(200);
    expect(solarConfigResponse.body.success).toBe(true);

    // Step 3: Retrieve profile and verify no solar configuration
    const profileResponse = await request(app)
      .get('/api/settings/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.userId).toBe(userId);
    expect(profileResponse.body.solarSystem).toEqual({
      hasSolar: false,
      systemSizeKw: null,
      tiltDegrees: null,
      orientation: null,
    });
  });

  it('should allow updating solar configuration', async () => {
    // Step 1: Register a new user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'update-solar-test@example.com',
        password: 'password123',
      });

    const { token } = registerResponse.body;

    // Step 2: Configure initial solar system
    await request(app)
      .post('/api/onboarding/solar-system')
      .set('Authorization', `Bearer ${token}`)
      .send({
        hasSolar: true,
        systemSizeKw: 5.0,
        tiltDegrees: 25.0,
        orientation: 'S',
      });

    // Step 3: Update solar configuration
    const updateResponse = await request(app)
      .post('/api/onboarding/solar-system')
      .set('Authorization', `Bearer ${token}`)
      .send({
        hasSolar: true,
        systemSizeKw: 8.0,
        tiltDegrees: 35.0,
        orientation: 'SE',
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.success).toBe(true);

    // Step 4: Verify updated configuration
    const profileResponse = await request(app)
      .get('/api/settings/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.solarSystem).toEqual({
      hasSolar: true,
      systemSizeKw: 8.0,
      tiltDegrees: 35.0,
      orientation: 'SE',
    });
  });

  it('should allow switching from solar to no solar', async () => {
    // Step 1: Register a new user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'switch-to-no-solar@example.com',
        password: 'password123',
      });

    const { token } = registerResponse.body;

    // Step 2: Configure solar system
    await request(app)
      .post('/api/onboarding/solar-system')
      .set('Authorization', `Bearer ${token}`)
      .send({
        hasSolar: true,
        systemSizeKw: 5.0,
        tiltDegrees: 25.0,
        orientation: 'S',
      });

    // Step 3: Switch to no solar
    const updateResponse = await request(app)
      .post('/api/onboarding/solar-system')
      .set('Authorization', `Bearer ${token}`)
      .send({
        hasSolar: false,
      });

    expect(updateResponse.status).toBe(200);

    // Step 4: Verify no solar configuration
    const profileResponse = await request(app)
      .get('/api/settings/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.solarSystem).toEqual({
      hasSolar: false,
      systemSizeKw: null,
      tiltDegrees: null,
      orientation: null,
    });
  });
});
