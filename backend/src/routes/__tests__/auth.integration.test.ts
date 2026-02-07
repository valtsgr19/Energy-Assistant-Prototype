/**
 * Integration test for authentication endpoints
 * Tests the complete flow of registration and login
 */

import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import express from 'express';
import authRouter from '../auth.js';
import { setupTest, teardownTest, getPrismaClient } from '../../__tests__/testSetup.js';

// Create a test app instance
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

const prisma = getPrismaClient();

beforeEach(async () => {
  await setupTest();
});

afterAll(async () => {
  await teardownTest();
});

describe('Authentication Integration Tests', () => {
  it('should complete full registration and login flow', async () => {
    const testEmail = 'integration-test@example.com';
    const testPassword = 'testPassword123';

    // Step 1: Register a new user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body).toHaveProperty('userId');
    expect(registerResponse.body).toHaveProperty('token');

    const userId = registerResponse.body.userId;
    const registrationToken = registerResponse.body.token;

    // Verify token is a valid string
    expect(typeof registrationToken).toBe('string');
    expect(registrationToken.length).toBeGreaterThan(0);

    // Step 2: Login with the same credentials
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty('userId');
    expect(loginResponse.body).toHaveProperty('token');
    expect(loginResponse.body.userId).toBe(userId);

    const loginToken = loginResponse.body.token;

    // Verify login token is also valid
    expect(typeof loginToken).toBe('string');
    expect(loginToken.length).toBeGreaterThan(0);

    // Step 3: Verify user exists in database
    const user = await prisma.userProfile.findUnique({
      where: { email: testEmail },
    });

    expect(user).not.toBeNull();
    expect(user?.id).toBe(userId);
    expect(user?.email).toBe(testEmail);
    expect(user?.lastLoginAt).not.toBeNull();
  });

  it('should prevent duplicate registration and allow login', async () => {
    const testEmail = 'integration-test-duplicate@example.com';
    const testPassword = 'password123';

    // Register first time
    const firstRegister = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(firstRegister.status).toBe(201);

    // Try to register again with same email
    const secondRegister = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: 'differentPassword',
      });

    expect(secondRegister.status).toBe(409);
    expect(secondRegister.body.error).toContain('already registered');

    // But login should still work with original password
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty('userId');
    expect(loginResponse.body).toHaveProperty('token');
  });
});
