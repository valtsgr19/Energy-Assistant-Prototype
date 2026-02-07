import { Router } from 'express';
import { generateChartData } from '../lib/dailyAssistant.js';
import { generateEnergyAdvice } from '../lib/adviceGeneration.js';
import { authenticateToken, AuthRequest } from '../lib/auth.js';

const router = Router();

// GET /api/daily-assistant/chart-data
router.get('/chart-data', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get date from query params (default to today)
    const dateParam = req.query.date as string;
    let date: Date;

    if (dateParam === 'tomorrow') {
      date = new Date();
      date.setDate(date.getDate() + 1);
      date.setHours(0, 0, 0, 0);
    } else {
      // Default to today
      date = new Date();
      date.setHours(0, 0, 0, 0);
    }

    const chartData = await generateChartData(userId, date);
    
    // Add no-cache headers to prevent browser caching
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    
    res.json(chartData);
  } catch (error) {
    console.error('Error generating chart data:', error);
    res.status(500).json({ 
      error: 'Failed to generate chart data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/daily-assistant/advice
router.get('/advice', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get date from query params (default to today)
    const dateParam = req.query.date as string;
    let date: Date;

    if (dateParam === 'tomorrow') {
      date = new Date();
      date.setDate(date.getDate() + 1);
      date.setHours(0, 0, 0, 0);
    } else {
      // Default to today
      date = new Date();
      date.setHours(0, 0, 0, 0);
    }

    const advice = await generateEnergyAdvice(userId, date);
    res.json(advice);
  } catch (error) {
    console.error('Error generating advice:', error);
    res.status(500).json({ 
      error: 'Failed to generate advice',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
