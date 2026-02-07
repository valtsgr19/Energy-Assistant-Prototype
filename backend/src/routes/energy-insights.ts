/**
 * Energy Insights Routes
 * 
 * Provides endpoints for consumption disaggregation, solar performance,
 * and household comparison data
 */

import express from 'express';
import { authenticateToken, AuthRequest } from '../lib/auth.js';
import { disaggregateConsumption } from '../lib/consumptionDisaggregation.js';
import { calculateSolarPerformance } from '../lib/solarPerformance.js';
import { calculateHouseholdComparison } from '../lib/householdComparison.js';

const router = express.Router();

/**
 * GET /api/energy-insights
 * Get comprehensive energy insights including disaggregation, solar performance, and household comparison
 */
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Calculate insights for the last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Get all insights in parallel
    const [disaggregation, solarPerformance, householdComparison] = await Promise.all([
      disaggregateConsumption(userId, startDate, endDate),
      calculateSolarPerformance(userId, startDate, endDate),
      calculateHouseholdComparison(userId)
    ]);

    res.json({
      disaggregation,
      solarPerformance,
      householdComparison
    });
  } catch (error) {
    console.error('Error fetching energy insights:', error);
    res.status(500).json({ error: 'Failed to fetch energy insights' });
  }
});

/**
 * GET /api/energy-insights/disaggregation
 * Get consumption disaggregation only
 */
router.get('/disaggregation', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const disaggregation = await disaggregateConsumption(userId, startDate, endDate);

    res.json(disaggregation);
  } catch (error) {
    console.error('Error fetching disaggregation:', error);
    res.status(500).json({ error: 'Failed to fetch consumption disaggregation' });
  }
});

/**
 * GET /api/energy-insights/solar-performance
 * Get solar performance metrics only
 */
router.get('/solar-performance', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const solarPerformance = await calculateSolarPerformance(userId, startDate, endDate);

    res.json(solarPerformance);
  } catch (error) {
    console.error('Error fetching solar performance:', error);
    res.status(500).json({ error: 'Failed to fetch solar performance' });
  }
});

/**
 * GET /api/energy-insights/household-comparison
 * Get household comparison and energy personality only
 */
router.get('/household-comparison', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const householdComparison = await calculateHouseholdComparison(userId);

    res.json(householdComparison);
  } catch (error) {
    console.error('Error fetching household comparison:', error);
    res.status(500).json({ error: 'Failed to fetch household comparison' });
  }
});

export default router;
