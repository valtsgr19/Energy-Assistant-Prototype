/**
 * Tariff Management Routes
 * 
 * Endpoints for managing user tariff structures
 */

import express, { Request, Response } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../lib/auth.js';
import {
  storeTariffStructure,
  getTariffStructure,
  getDefaultTariffStructure,
  type TariffStructure,
} from '../lib/tariff.js';

const router = express.Router();

// Validation schemas
const tariffPeriodSchema = z.object({
  name: z.string().min(1),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), // HH:MM format (00:00 to 23:59)
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),   // HH:MM format (00:00 to 23:59)
  pricePerKwh: z.number().min(0).max(10),
  daysOfWeek: z.array(z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']))
});

const storeTariffSchema = z.object({
  effectiveDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  periods: z.array(tariffPeriodSchema).min(1)
});

/**
 * POST /api/tariff
 * Store a tariff structure for the authenticated user
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const validation = storeTariffSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid tariff structure',
        details: validation.error.errors
      });
    }

    const { effectiveDate, periods } = validation.data;

    const tariff: TariffStructure = {
      userId,
      effectiveDate: new Date(effectiveDate),
      periods
    };

    await storeTariffStructure(tariff);

    res.status(201).json({
      success: true,
      message: 'Tariff structure stored successfully'
    });
  } catch (error) {
    console.error('Error storing tariff structure:', error);
    res.status(500).json({
      error: 'Failed to store tariff structure'
    });
  }
});

/**
 * GET /api/tariff
 * Retrieve the current tariff structure for the authenticated user
 * Returns default tariff if none is configured
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    let tariff = await getTariffStructure(userId);
    const isDefault = !tariff;

    // If no tariff is configured, return default
    if (!tariff) {
      tariff = getDefaultTariffStructure(userId);
    }

    res.json({
      userId: tariff.userId,
      effectiveDate: tariff.effectiveDate,
      periods: tariff.periods,
      isDefault
    });
  } catch (error) {
    console.error('Error retrieving tariff structure:', error);
    res.status(500).json({
      error: 'Failed to retrieve tariff structure'
    });
  }
});

export default router;
