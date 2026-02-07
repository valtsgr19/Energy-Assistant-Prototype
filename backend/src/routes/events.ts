import { Router } from 'express';

const router = Router();

// GET /api/events/active
router.get('/active', async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

export default router;
