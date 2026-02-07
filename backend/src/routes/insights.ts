import { Router } from 'express';

const router = Router();

// GET /api/insights/consumption-disaggregation
router.get('/consumption-disaggregation', async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// GET /api/insights/solar-performance
router.get('/solar-performance', async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

// GET /api/insights/household-comparison
router.get('/household-comparison', async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
