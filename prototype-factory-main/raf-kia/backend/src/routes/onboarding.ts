import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { StorageService } from '../storage';
import { OnboardingSession, OEMSession } from '../types';

const router = Router();

// Validation schemas
const oemSessionSchema = z.object({
  user_id: z.string().min(1),
  device_id: z.string().min(1),
  device_type: z.enum(['EV', 'CHARGER', 'BATTERY']),
  market: z.string().length(2),
  locale: z.string().min(2),
  theme_config: z.object({
    primary_color: z.string().optional(),
    secondary_color: z.string().optional(),
    font_family: z.string().optional(),
    button_style: z.enum(['rounded', 'square', 'pill']).optional(),
    border_radius: z.number().optional(),
    logo_url: z.string().url().optional()
  }).optional()
});

const tariffProfileSchema = z.object({
  supplier: z.string().min(1),
  tariffName: z.string().min(1),
  rateType: z.enum(['flat', 'tou']),
  rates: z.array(z.object({
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    pricePerKwh: z.number().positive()
  })).min(1),
  standingCharge: z.number().optional(),
  region: z.string().optional(),
  postcode: z.string().optional(),
  confidence: z.number().min(0).max(1).optional()
});

const optimisationPreferencesSchema = z.object({
  mode: z.enum(['fully_managed', 'events_only'])
});

export function createOnboardingRoutes(storage: StorageService) {
  /**
   * POST /api/sessions/init
   * Initialize a new onboarding session from OEM app
   */
  router.post('/sessions/init', async (req: Request, res: Response) => {
    try {
      const oemContext = oemSessionSchema.parse(req.body);
      
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const session: OnboardingSession = {
        session_id: sessionId,
        oem_context: oemContext as OEMSession,
        current_step: 'value-confirmation',
        completed_steps: [],
        created_at: new Date(),
        updated_at: new Date()
      };

      await storage.createSession(session);

      res.json({
        success: true,
        session_id: sessionId,
        current_step: 'value-confirmation'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error('Session init error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * GET /api/sessions/:sessionId
   * Get session details
   */
  router.get('/sessions/:sessionId', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getSession(sessionId);

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json(session);
    } catch (error) {
      console.error('Get session error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * POST /api/sessions/:sessionId/confirm-value
   * User confirms value proposition and proceeds
   */
  router.post('/sessions/:sessionId/confirm-value', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      await storage.completeStep(sessionId, 'value-confirmation');
      await storage.updateCurrentStep(sessionId, 'bill-capture');

      res.json({ success: true, next_step: 'bill-capture' });
    } catch (error) {
      console.error('Confirm value error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * POST /api/sessions/:sessionId/tariff
   * Save tariff profile
   */
  router.post('/sessions/:sessionId/tariff', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const tariffData = tariffProfileSchema.parse(req.body);

      await storage.saveTariffProfile(sessionId, tariffData);
      await storage.completeStep(sessionId, 'tariff-confirmation');
      await storage.updateCurrentStep(sessionId, 'optimisation-preferences');

      res.json({ success: true, next_step: 'optimisation-preferences' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error('Save tariff error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * GET /api/sessions/:sessionId/tariff
   * Get tariff profile
   */
  router.get('/sessions/:sessionId/tariff', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const tariff = await storage.getTariffProfile(sessionId);

      if (!tariff) {
        return res.status(404).json({ error: 'Tariff not found' });
      }

      res.json(tariff);
    } catch (error) {
      console.error('Get tariff error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * POST /api/sessions/:sessionId/preferences
   * Save optimisation preferences
   */
  router.post('/sessions/:sessionId/preferences', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const prefsData = optimisationPreferencesSchema.parse(req.body);

      await storage.saveOptimisationPreferences(sessionId, prefsData);
      await storage.completeStep(sessionId, 'optimisation-preferences');

      // Create device binding
      const session = await storage.getSession(sessionId);
      if (session) {
        await storage.saveDeviceBinding(sessionId, {
          device_id: session.oem_context.device_id,
          user_id: session.oem_context.user_id,
          device_type: session.oem_context.device_type,
          bound_at: new Date()
        });
      }

      await storage.updateCurrentStep(sessionId, 'completion');

      res.json({ success: true, next_step: 'completion' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error('Save preferences error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * POST /api/sessions/:sessionId/complete
   * Mark session as complete and generate callback
   */
  router.post('/sessions/:sessionId/complete', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getSession(sessionId);

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      await storage.completeStep(sessionId, 'completion');

      const callback = {
        status: 'completed' as const,
        session_id: sessionId,
        device_id: session.oem_context.device_id,
        tariff_status: session.tariff_profile ? 'confirmed' as const : 'pending' as const,
        timestamp: new Date()
      };

      res.json({
        success: true,
        callback
      });
    } catch (error) {
      console.error('Complete session error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
