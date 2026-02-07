import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import express from 'express';
import onboardingRouter from '../onboarding.js';
import { setupTest, teardownTest, getPrismaClient } from '../../__tests__/testSetup.js';

// Create a test app instance
const app = express();
app.use(express.json());
app.use('/api/onboarding', onboardingRouter);

const prisma = getPrismaClient();

// Clean up database before and after tests
beforeEach(async () => {
  await setupTest();
});

afterAll(async () => {
  await teardownTest();
});

describe('POST /api/onboarding/solar-system', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create a test user and get auth token
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = await prisma.userProfile.create({
      data: {
        email: 'solar-test@example.com',
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

  describe('User with solar system', () => {
    it('should create solar system configuration with valid data', async () => {
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          systemSizeKw: 5.5,
          tiltDegrees: 30.0,
          orientation: 'S',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('solarSystemId');
      expect(typeof response.body.solarSystemId).toBe('string');

      // Verify solar system was created in database
      const solarSystem = await prisma.solarSystem.findUnique({
        where: { userId },
      });
      expect(solarSystem).not.toBeNull();
      expect(solarSystem?.hasSolar).toBe(true);
      expect(solarSystem?.systemSizeKw).toBe(5.5);
      expect(solarSystem?.tiltDegrees).toBe(30.0);
      expect(solarSystem?.orientation).toBe('S');
    });

    it('should accept all valid orientations', async () => {
      const validOrientations = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

      for (const orientation of validOrientations) {
        const response = await request(app)
          .post('/api/onboarding/solar-system')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            hasSolar: true,
            systemSizeKw: 5.0,
            tiltDegrees: 25.0,
            orientation,
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        const solarSystem = await prisma.solarSystem.findUnique({
          where: { userId },
        });
        expect(solarSystem?.orientation).toBe(orientation);
      }
    });

    it('should accept minimum valid system size (0.1 kW)', async () => {
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          systemSizeKw: 0.1,
          tiltDegrees: 20.0,
          orientation: 'S',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const solarSystem = await prisma.solarSystem.findUnique({
        where: { userId },
      });
      expect(solarSystem?.systemSizeKw).toBe(0.1);
    });

    it('should accept maximum valid system size (100 kW)', async () => {
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          systemSizeKw: 100.0,
          tiltDegrees: 20.0,
          orientation: 'S',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const solarSystem = await prisma.solarSystem.findUnique({
        where: { userId },
      });
      expect(solarSystem?.systemSizeKw).toBe(100.0);
    });

    it('should accept minimum valid tilt (0 degrees)', async () => {
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          systemSizeKw: 5.0,
          tiltDegrees: 0.0,
          orientation: 'S',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const solarSystem = await prisma.solarSystem.findUnique({
        where: { userId },
      });
      expect(solarSystem?.tiltDegrees).toBe(0.0);
    });

    it('should accept maximum valid tilt (90 degrees)', async () => {
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          systemSizeKw: 5.0,
          tiltDegrees: 90.0,
          orientation: 'S',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const solarSystem = await prisma.solarSystem.findUnique({
        where: { userId },
      });
      expect(solarSystem?.tiltDegrees).toBe(90.0);
    });

    it('should update existing solar system configuration', async () => {
      // Create initial configuration
      await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          systemSizeKw: 5.0,
          tiltDegrees: 25.0,
          orientation: 'S',
        });

      // Update configuration
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          systemSizeKw: 7.5,
          tiltDegrees: 35.0,
          orientation: 'SE',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify only one solar system exists with updated values
      const solarSystems = await prisma.solarSystem.findMany({
        where: { userId },
      });
      expect(solarSystems.length).toBe(1);
      expect(solarSystems[0].systemSizeKw).toBe(7.5);
      expect(solarSystems[0].tiltDegrees).toBe(35.0);
      expect(solarSystems[0].orientation).toBe('SE');
    });

    it('should reject when hasSolar is true but systemSizeKw is missing', async () => {
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          tiltDegrees: 25.0,
          orientation: 'S',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject when hasSolar is true but tiltDegrees is missing', async () => {
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          systemSizeKw: 5.0,
          orientation: 'S',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject when hasSolar is true but orientation is missing', async () => {
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          systemSizeKw: 5.0,
          tiltDegrees: 25.0,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject system size below minimum (< 0.1 kW)', async () => {
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          systemSizeKw: 0.05,
          tiltDegrees: 25.0,
          orientation: 'S',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject system size above maximum (> 100 kW)', async () => {
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          systemSizeKw: 101.0,
          tiltDegrees: 25.0,
          orientation: 'S',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject tilt below minimum (< 0 degrees)', async () => {
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          systemSizeKw: 5.0,
          tiltDegrees: -1.0,
          orientation: 'S',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject tilt above maximum (> 90 degrees)', async () => {
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          systemSizeKw: 5.0,
          tiltDegrees: 91.0,
          orientation: 'S',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject invalid orientation', async () => {
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          systemSizeKw: 5.0,
          tiltDegrees: 25.0,
          orientation: 'INVALID',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('User without solar system', () => {
    it('should create configuration when user has no solar', async () => {
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: false,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('solarSystemId');

      // Verify solar system was created with null values
      const solarSystem = await prisma.solarSystem.findUnique({
        where: { userId },
      });
      expect(solarSystem).not.toBeNull();
      expect(solarSystem?.hasSolar).toBe(false);
      expect(solarSystem?.systemSizeKw).toBeNull();
      expect(solarSystem?.tiltDegrees).toBeNull();
      expect(solarSystem?.orientation).toBeNull();
    });

    it('should ignore solar parameters when hasSolar is false', async () => {
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: false,
          systemSizeKw: 5.0,
          tiltDegrees: 25.0,
          orientation: 'S',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify solar parameters are stored as null
      const solarSystem = await prisma.solarSystem.findUnique({
        where: { userId },
      });
      expect(solarSystem?.hasSolar).toBe(false);
      expect(solarSystem?.systemSizeKw).toBeNull();
      expect(solarSystem?.tiltDegrees).toBeNull();
      expect(solarSystem?.orientation).toBeNull();
    });

    it('should update from solar to no solar', async () => {
      // Create initial configuration with solar
      await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          systemSizeKw: 5.0,
          tiltDegrees: 25.0,
          orientation: 'S',
        });

      // Update to no solar
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: false,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify solar parameters are now null
      const solarSystem = await prisma.solarSystem.findUnique({
        where: { userId },
      });
      expect(solarSystem?.hasSolar).toBe(false);
      expect(solarSystem?.systemSizeKw).toBeNull();
      expect(solarSystem?.tiltDegrees).toBeNull();
      expect(solarSystem?.orientation).toBeNull();
    });

    it('should update from no solar to solar', async () => {
      // Create initial configuration without solar
      await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: false,
        });

      // Update to have solar
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          systemSizeKw: 6.0,
          tiltDegrees: 30.0,
          orientation: 'SW',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify solar parameters are now set
      const solarSystem = await prisma.solarSystem.findUnique({
        where: { userId },
      });
      expect(solarSystem?.hasSolar).toBe(true);
      expect(solarSystem?.systemSizeKw).toBe(6.0);
      expect(solarSystem?.tiltDegrees).toBe(30.0);
      expect(solarSystem?.orientation).toBe('SW');
    });
  });

  describe('Authentication', () => {
    it('should reject request without authentication token', async () => {
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .send({
          hasSolar: true,
          systemSizeKw: 5.0,
          tiltDegrees: 25.0,
          orientation: 'S',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('token');
    });

    it('should reject request with invalid authentication token', async () => {
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          hasSolar: true,
          systemSizeKw: 5.0,
          tiltDegrees: 25.0,
          orientation: 'S',
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Validation', () => {
    it('should reject request with missing hasSolar field', async () => {
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          systemSizeKw: 5.0,
          tiltDegrees: 25.0,
          orientation: 'S',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject request with non-boolean hasSolar', async () => {
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: 'yes',
          systemSizeKw: 5.0,
          tiltDegrees: 25.0,
          orientation: 'S',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject request with non-numeric systemSizeKw', async () => {
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          systemSizeKw: 'five',
          tiltDegrees: 25.0,
          orientation: 'S',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject request with non-numeric tiltDegrees', async () => {
      const response = await request(app)
        .post('/api/onboarding/solar-system')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasSolar: true,
          systemSizeKw: 5.0,
          tiltDegrees: 'twenty-five',
          orientation: 'S',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });
});
