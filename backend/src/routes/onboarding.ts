import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, AuthRequest } from '../lib/auth.js';
import prisma from '../lib/prisma.js';

const router = Router();

// Validation schema for solar system configuration
const solarSystemSchema = z.object({
  hasSolar: z.boolean(),
  systemSizeKw: z.number().min(0.1).max(100.0).optional(),
  tiltDegrees: z.number().min(0.0).max(90.0).optional(),
  orientation: z.enum(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']).optional(),
}).refine(
  (data) => {
    // If hasSolar is true, require the optional fields
    if (data.hasSolar) {
      return data.systemSizeKw !== undefined && 
             data.tiltDegrees !== undefined && 
             data.orientation !== undefined;
    }
    return true;
  },
  {
    message: 'When hasSolar is true, systemSizeKw, tiltDegrees, and orientation are required',
  }
);

// POST /api/onboarding/solar-system
router.post('/solar-system', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Validate request body
    const validation = solarSystemSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      });
    }

    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { hasSolar, systemSizeKw, tiltDegrees, orientation } = validation.data;

    // Check if solar system already exists for this user
    const existingSolarSystem = await prisma.solarSystem.findUnique({
      where: { userId },
    });

    let solarSystem;
    if (existingSolarSystem) {
      // Update existing solar system
      solarSystem = await prisma.solarSystem.update({
        where: { userId },
        data: {
          hasSolar,
          systemSizeKw: hasSolar ? systemSizeKw : null,
          tiltDegrees: hasSolar ? tiltDegrees : null,
          orientation: hasSolar ? orientation : null,
        },
      });
    } else {
      // Create new solar system
      solarSystem = await prisma.solarSystem.create({
        data: {
          userId,
          hasSolar,
          systemSizeKw: hasSolar ? systemSizeKw : null,
          tiltDegrees: hasSolar ? tiltDegrees : null,
          orientation: hasSolar ? orientation : null,
        },
      });
    }

    res.status(200).json({
      success: true,
      solarSystemId: solarSystem.id,
    });
  } catch (error) {
    console.error('Solar system configuration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/onboarding/status
router.get('/status', async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
