import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { StorageService } from '../storage';

const router = Router();

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email('Invalid email format')
});

const verifyEmailSchema = z.object({
  code: z.string().min(6, 'Verification code must be at least 6 characters')
});

/**
 * POST /api/users
 * Create a new user and send verification code
 */
export function createUserRoutes(storage: StorageService) {
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { email } = createUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Create user
      const user = await storage.createUser(email);

      // In a real implementation, send verification email here
      // For now, we'll use a simple code: '123456'
      console.log(`📧 Verification code for ${email}: 123456`);

      res.status(201).json({
        userId: user.id,
        email: user.email,
        verificationSent: true
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * POST /api/users/:userId/verify
   * Verify email with code
   */
  router.post('/:userId/verify', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { code } = verifyEmailSchema.parse(req.body);

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Simple verification - in production, check against stored code
      if (code !== '123456') {
        return res.status(400).json({ error: 'Invalid verification code' });
      }

      // Update user as verified
      const updatedUser = await storage.updateUser(userId, { emailVerified: true });

      // Generate simple token (in production, use JWT)
      const token = `token-${userId}`;

      res.json({
        token,
        userId: updatedUser.id,
        email: updatedUser.email,
        emailVerified: true
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error('Verify email error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * GET /api/users/:userId/progress
   * Get user's onboarding progress
   */
  router.get('/:userId/progress', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const progress = await storage.getProgress(userId);

      res.json({
        userId: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        currentStep: progress.currentStep,
        completedSteps: progress.completedSteps,
        data: progress.data
      });
    } catch (error) {
      console.error('Get progress error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
