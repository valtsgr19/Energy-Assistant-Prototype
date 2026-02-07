/**
 * Energy Events Routes
 * 
 * Handles energy event retrieval and participation tracking
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticateToken } from '../lib/auth.js';

const router = Router();

/**
 * GET /api/energy-events/active
 * 
 * Retrieves active energy events for the authenticated user
 * Returns events that overlap with the specified date range
 */
router.get('/active', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'startDate and endDate query parameters are required' 
      });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    // Find events that overlap with the requested date range
    const events = await prisma.energyEvent.findMany({
      where: {
        AND: [
          { startTime: { lte: end } },
          { endTime: { gte: start } },
          {
            OR: [
              { targetUserIds: { contains: userId } },
              { targetUserIds: { equals: 'ALL' } }
            ]
          }
        ]
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    // Parse targetUserIds and filter
    const filteredEvents = events.filter(event => {
      if (event.targetUserIds === 'ALL') return true;
      const targetIds = event.targetUserIds.split(',').map(id => id.trim());
      return targetIds.includes(userId);
    });

    res.json({
      events: filteredEvents.map(event => ({
        eventId: event.id,
        eventType: event.eventType,
        startTime: event.startTime.toISOString(),
        endTime: event.endTime.toISOString(),
        incentiveDescription: event.incentiveDescription,
        incentiveAmountDollars: event.incentiveAmountDollars
      }))
    });
  } catch (error) {
    console.error('Error fetching active events:', error);
    res.status(500).json({ error: 'Failed to fetch active events' });
  }
});

/**
 * GET /api/energy-events/participation-history
 * 
 * Retrieves user's event participation history
 */
router.get('/participation-history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { limit = '10' } = req.query;

    const participations = await prisma.eventParticipation.findMany({
      where: { userId },
      include: {
        event: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit as string)
    });

    res.json({
      participations: participations.map(p => ({
        participationId: p.id,
        eventType: p.event.eventType,
        eventStartTime: p.event.startTime.toISOString(),
        eventEndTime: p.event.endTime.toISOString(),
        baselineConsumptionKwh: p.baselineConsumptionKwh,
        actualConsumptionKwh: p.actualConsumptionKwh,
        performanceDeltaKwh: p.performanceDeltaKwh,
        earnedIncentiveDollars: p.earnedIncentiveDollars,
        participatedAt: p.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('Error fetching participation history:', error);
    res.status(500).json({ error: 'Failed to fetch participation history' });
  }
});

/**
 * POST /api/energy-events/record-participation
 * 
 * Records user participation in an energy event
 * Calculates performance delta and earned incentive
 */
router.post('/record-participation', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { eventId, baselineConsumptionKwh, actualConsumptionKwh } = req.body;

    if (!eventId || baselineConsumptionKwh === undefined || actualConsumptionKwh === undefined) {
      return res.status(400).json({ 
        error: 'eventId, baselineConsumptionKwh, and actualConsumptionKwh are required' 
      });
    }

    // Get event details
    const event = await prisma.energyEvent.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Calculate performance delta
    let performanceDeltaKwh: number;
    let earnedIncentiveDollars: number;

    if (event.eventType === 'INCREASE_CONSUMPTION') {
      // For increase events, positive delta means more consumption (good)
      performanceDeltaKwh = actualConsumptionKwh - baselineConsumptionKwh;
      earnedIncentiveDollars = performanceDeltaKwh > 0 
        ? (performanceDeltaKwh / baselineConsumptionKwh) * event.incentiveAmountDollars 
        : 0;
    } else {
      // For decrease events, negative delta means less consumption (good)
      performanceDeltaKwh = baselineConsumptionKwh - actualConsumptionKwh;
      earnedIncentiveDollars = performanceDeltaKwh > 0 
        ? (performanceDeltaKwh / baselineConsumptionKwh) * event.incentiveAmountDollars 
        : 0;
    }

    // Record participation
    const participation = await prisma.eventParticipation.upsert({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      },
      update: {
        baselineConsumptionKwh,
        actualConsumptionKwh,
        performanceDeltaKwh,
        earnedIncentiveDollars
      },
      create: {
        userId,
        eventId,
        baselineConsumptionKwh,
        actualConsumptionKwh,
        performanceDeltaKwh,
        earnedIncentiveDollars
      }
    });

    res.json({
      participationId: participation.id,
      performanceDeltaKwh,
      earnedIncentiveDollars
    });
  } catch (error) {
    console.error('Error recording participation:', error);
    res.status(500).json({ error: 'Failed to record participation' });
  }
});

export default router;
