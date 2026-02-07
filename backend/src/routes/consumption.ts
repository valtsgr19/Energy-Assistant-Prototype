/**
 * Consumption Data Routes
 * 
 * Endpoints for managing consumption data
 */

import express, { Request, Response } from 'express';
import { authenticateToken } from '../lib/auth.js';
import {
  syncConsumptionData,
  getConsumptionForDate,
  getConsumptionWithGaps,
  hasConsumptionData,
} from '../lib/consumption.js';

const router = express.Router();

/**
 * POST /api/consumption/sync
 * Sync consumption data from external API
 */
router.post('/sync', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const daysToSync = req.body.days || 7;

    if (daysToSync < 1 || daysToSync > 90) {
      return res.status(400).json({
        error: 'Days to sync must be between 1 and 90'
      });
    }

    const result = await syncConsumptionData(userId, daysToSync);

    if (result.errors.length > 0) {
      return res.status(207).json({
        success: true,
        synced: result.synced,
        errors: result.errors,
        message: 'Sync completed with errors'
      });
    }

    res.json({
      success: true,
      synced: result.synced,
      message: `Successfully synced ${result.synced} data points`
    });
  } catch (error) {
    console.error('Error syncing consumption data:', error);
    res.status(500).json({
      error: 'Failed to sync consumption data'
    });
  }
});

/**
 * GET /api/consumption/date/:date
 * Get consumption data for a specific date
 */
router.get('/date/:date', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const date = new Date(req.params.date);

    if (isNaN(date.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format'
      });
    }

    const includeGaps = req.query.includeGaps === 'true';

    let data;
    if (includeGaps) {
      data = await getConsumptionWithGaps(userId, date);
    } else {
      data = await getConsumptionForDate(userId, date);
    }

    const hasData = await hasConsumptionData(userId, date);

    res.json({
      date: date.toISOString().split('T')[0],
      dataPoints: data,
      hasData,
      count: data.length
    });
  } catch (error) {
    console.error('Error retrieving consumption data:', error);
    res.status(500).json({
      error: 'Failed to retrieve consumption data'
    });
  }
});

/**
 * GET /api/consumption/check/:date
 * Check if consumption data exists for a date
 */
router.get('/check/:date', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const date = new Date(req.params.date);

    if (isNaN(date.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format'
      });
    }

    const hasData = await hasConsumptionData(userId, date);

    res.json({
      date: date.toISOString().split('T')[0],
      hasData
    });
  } catch (error) {
    console.error('Error checking consumption data:', error);
    res.status(500).json({
      error: 'Failed to check consumption data'
    });
  }
});

export default router;
