import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { generateToken, authenticateToken, AuthRequest } from '../lib/auth.js';
import { encrypt } from '../lib/encryption.js';
import { validateEnergyAccountCredentials } from '../lib/mockEnergyProviderApi.js';
import { seedTestData } from '../lib/seedTestData.js';
import prisma from '../lib/prisma.js';

const router = Router();

const SALT_ROUNDS = 10;

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const linkEnergyAccountSchema = z.object({
  energyAccountId: z.string().min(1, 'Energy account ID is required'),
  energyAccountPassword: z.string().min(1, 'Energy account password is required'),
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    // Validate request body
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      });
    }

    const { email, password } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.userProfile.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user profile
    const user = await prisma.userProfile.create({
      data: {
        email,
        passwordHash,
        lastLoginAt: new Date(),
      },
    });

    // Automatically seed demo data for new users
    try {
      console.log(`Seeding demo data for new user: ${user.id}`);
      await seedTestData(user.id, false); // false = no EV by default
      console.log(`Demo data seeded successfully for user: ${user.id}`);
    } catch (seedError) {
      console.error('Failed to seed demo data:', seedError);
      // Don't fail registration if seeding fails - user can still use the app
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    res.status(201).json({
      userId: user.id,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    // Validate request body
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      });
    }

    const { email, password } = validation.data;

    // Find user by email
    const user = await prisma.userProfile.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login time
    await prisma.userProfile.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    res.status(200).json({
      userId: user.id,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/link-energy-account
router.post('/link-energy-account', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Validate request body
    const validation = linkEnergyAccountSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      });
    }

    const { energyAccountId, energyAccountPassword } = validation.data;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate credentials against mock external energy provider API
    const validationResult = await validateEnergyAccountCredentials(
      energyAccountId,
      energyAccountPassword
    );

    if (!validationResult.success) {
      return res.status(401).json({ 
        error: 'Energy account validation failed',
        message: validationResult.message 
      });
    }

    // Encrypt the credentials before storing
    const encryptedCredentials = encrypt(energyAccountPassword);

    // Update user profile with energy account information
    await prisma.userProfile.update({
      where: { id: userId },
      data: {
        energyAccountId,
        energyAccountCredentials: encryptedCredentials,
      },
    });

    res.status(200).json({
      success: true,
      accountLinked: true,
    });
  } catch (error) {
    console.error('Energy account linking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
