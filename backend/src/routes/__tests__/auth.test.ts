import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import express from 'express';
import authRouter from '../auth.js';
import { decrypt } from '../../lib/encryption.js';
import { addMockAccount, removeMockAccount } from '../../lib/mockEnergyProviderApi.js';
import { setupTest, teardownTest, getPrismaClient } from '../../__tests__/testSetup.js';

// Create a test app instance
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

const prisma = getPrismaClient();

// Clean up database before and after tests
beforeEach(async () => {
  await setupTest();
});

afterAll(async () => {
  await teardownTest();
});

describe('POST /api/auth/register', () => {
  it('should register a new user with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('userId');
    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.userId).toBe('string');
    expect(typeof response.body.token).toBe('string');

    // Verify user was created in database
    const user = await prisma.userProfile.findUnique({
      where: { email: 'test@example.com' },
    });
    expect(user).not.toBeNull();
    expect(user?.email).toBe('test@example.com');
    expect(user?.passwordHash).not.toBe('password123'); // Should be hashed
  });

  it('should hash the password using bcrypt', async () => {
    const password = 'mySecurePassword';
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'hash-test@example.com',
        password,
      });

    expect(response.status).toBe(201);

    const user = await prisma.userProfile.findUnique({
      where: { email: 'hash-test@example.com' },
    });

    // Verify password is hashed
    expect(user?.passwordHash).not.toBe(password);
    const isValidHash = await bcrypt.compare(password, user!.passwordHash);
    expect(isValidHash).toBe(true);
  });

  it('should return a valid JWT token', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'jwt-test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(201);
    const { token, userId } = response.body;

    // Verify token is valid
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    expect(decoded.userId).toBe(userId);
    expect(decoded.email).toBe('jwt-test@example.com');
  });

  it('should reject registration with duplicate email', async () => {
    // Register first user
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'duplicate@example.com',
        password: 'password123',
      });

    // Try to register with same email
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'duplicate@example.com',
        password: 'differentPassword',
      });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('already registered');
  });

  it('should reject registration with invalid email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'not-an-email',
        password: 'password123',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should reject registration with short password', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: '12345', // Less than 6 characters
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should reject registration with missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        // Missing password
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Create a test user
    const passwordHash = await bcrypt.hash('password123', 10);
    await prisma.userProfile.create({
      data: {
        email: 'login-test@example.com',
        passwordHash,
      },
    });
  });

  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login-test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('userId');
    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.userId).toBe('string');
    expect(typeof response.body.token).toBe('string');
  });

  it('should return a valid JWT token on login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login-test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    const { token, userId } = response.body;

    // Verify token is valid
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    expect(decoded.userId).toBe(userId);
    expect(decoded.email).toBe('login-test@example.com');
  });

  it('should update lastLoginAt on successful login', async () => {
    const userBefore = await prisma.userProfile.findUnique({
      where: { email: 'login-test@example.com' },
    });
    const lastLoginBefore = userBefore?.lastLoginAt;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login-test@example.com',
        password: 'password123',
      });

    const userAfter = await prisma.userProfile.findUnique({
      where: { email: 'login-test@example.com' },
    });
    const lastLoginAfter = userAfter?.lastLoginAt;

    expect(lastLoginAfter).not.toEqual(lastLoginBefore);
    if (lastLoginBefore && lastLoginAfter) {
      expect(lastLoginAfter.getTime()).toBeGreaterThan(lastLoginBefore.getTime());
    }
  });

  it('should reject login with invalid email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid credentials');
  });

  it('should reject login with invalid password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login-test@example.com',
        password: 'wrongPassword',
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid credentials');
  });

  it('should reject login with missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login-test@example.com',
        // Missing password
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should not reveal whether email or password was incorrect', async () => {
    const responseInvalidEmail = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

    const responseInvalidPassword = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login-test@example.com',
        password: 'wrongPassword',
      });

    // Both should return the same error message
    expect(responseInvalidEmail.status).toBe(401);
    expect(responseInvalidPassword.status).toBe(401);
    expect(responseInvalidEmail.body.error).toBe(responseInvalidPassword.body.error);
  });
});

describe('POST /api/auth/link-energy-account', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create a test user and get auth token
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = await prisma.userProfile.create({
      data: {
        email: 'energy-link-test@example.com',
        passwordHash,
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

  it('should link energy account with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/link-energy-account')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        energyAccountId: 'ACC001',
        energyAccountPassword: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      accountLinked: true,
    });

    // Verify energy account was linked in database
    const user = await prisma.userProfile.findUnique({
      where: { id: userId },
    });
    expect(user?.energyAccountId).toBe('ACC001');
    expect(user?.energyAccountCredentials).toBeTruthy();
    expect(user?.energyAccountCredentials).not.toBe('password123'); // Should be encrypted
  });

  it('should encrypt energy account credentials before storing', async () => {
    const energyPassword = 'password123';
    
    await request(app)
      .post('/api/auth/link-energy-account')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        energyAccountId: 'ACC001',
        energyAccountPassword: energyPassword,
      });

    const user = await prisma.userProfile.findUnique({
      where: { id: userId },
    });

    // Verify credentials are encrypted
    expect(user?.energyAccountCredentials).toBeTruthy();
    expect(user?.energyAccountCredentials).not.toBe(energyPassword);
    
    // Verify we can decrypt them back
    const decrypted = decrypt(user!.energyAccountCredentials!);
    expect(decrypted).toBe(energyPassword);
  });

  it('should reject linking without authentication token', async () => {
    const response = await request(app)
      .post('/api/auth/link-energy-account')
      .send({
        energyAccountId: 'ACC001',
        energyAccountPassword: 'password123',
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('token');
  });

  it('should reject linking with invalid authentication token', async () => {
    const response = await request(app)
      .post('/api/auth/link-energy-account')
      .set('Authorization', 'Bearer invalid-token')
      .send({
        energyAccountId: 'ACC001',
        energyAccountPassword: 'password123',
      });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error');
  });

  it('should reject linking with invalid energy account credentials', async () => {
    const response = await request(app)
      .post('/api/auth/link-energy-account')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        energyAccountId: 'ACC001',
        energyAccountPassword: 'wrongPassword',
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('validation failed');

    // Verify energy account was NOT linked
    const user = await prisma.userProfile.findUnique({
      where: { id: userId },
    });
    expect(user?.energyAccountId).toBeNull();
    expect(user?.energyAccountCredentials).toBeNull();
  });

  it('should accept any energy account for development', async () => {
    // In development mode, the mock API accepts any account credentials
    const response = await request(app)
      .post('/api/auth/link-energy-account')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        energyAccountId: 'ANY_ACCOUNT_ID',
        energyAccountPassword: 'any_password',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);

    // Verify energy account was linked
    const user = await prisma.userProfile.findUnique({
      where: { id: userId },
    });
    expect(user?.energyAccountId).toBe('ANY_ACCOUNT_ID');
    expect(user?.energyAccountCredentials).toBeTruthy();
  });

  it('should reject linking with missing energyAccountId', async () => {
    const response = await request(app)
      .post('/api/auth/link-energy-account')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        energyAccountPassword: 'password123',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Validation failed');
  });

  it('should reject linking with missing energyAccountPassword', async () => {
    const response = await request(app)
      .post('/api/auth/link-energy-account')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        energyAccountId: 'ACC001',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Validation failed');
  });

  it('should allow updating energy account credentials', async () => {
    // Link first account
    await request(app)
      .post('/api/auth/link-energy-account')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        energyAccountId: 'ACC001',
        energyAccountPassword: 'password123',
      });

    // Link different account
    const response = await request(app)
      .post('/api/auth/link-energy-account')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        energyAccountId: 'ACC002',
        energyAccountPassword: 'securepass456',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify new account is linked
    const user = await prisma.userProfile.findUnique({
      where: { id: userId },
    });
    expect(user?.energyAccountId).toBe('ACC002');
    
    const decrypted = decrypt(user!.energyAccountCredentials!);
    expect(decrypted).toBe('securepass456');
  });
});
