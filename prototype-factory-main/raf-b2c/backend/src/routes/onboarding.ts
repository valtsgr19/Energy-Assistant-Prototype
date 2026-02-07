import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { StorageService } from '../storage';

const router = Router();

// Validation schemas
const siteSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  postcode: z.string().min(1, 'Postcode is required'),
  country: z.string().min(1, 'Country is required'),
  consentGranted: z.boolean()
});

const tariffSchema = z.object({
  supplier: z.string().min(1, 'Supplier is required'),
  tariffName: z.string().min(1, 'Tariff name is required'),
  rateType: z.enum(['flat', 'tou']),
  rates: z.array(z.object({
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
    pricePerKwh: z.number().positive('Price must be positive')
  })).min(1, 'At least one rate is required')
});

const preferencesSchema = z.object({
  readyByTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  minimumSocPercent: z.number().int().min(0).max(100, 'SoC must be between 0 and 100'),
  mode: z.enum(['fully_managed', 'events_only'])
});

const manufacturerSchema = z.object({
  manufacturer: z.string().min(1, 'Manufacturer is required')
});

export function createOnboardingRoutes(storage: StorageService) {
  /**
   * POST /api/onboarding/:userId/site
   * Save site address and consent
   */
  router.post('/:userId/site', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const siteData = siteSchema.parse(req.body);

      if (!siteData.consentGranted) {
        return res.status(400).json({ error: 'Consent must be granted to proceed' });
      }

      const site = {
        siteId: `site-${Date.now()}`,
        address: siteData.address,
        postcode: siteData.postcode,
        country: siteData.country,
        consentGranted: siteData.consentGranted,
        consentTimestamp: new Date()
      };

      await storage.saveSite(userId, site);
      await storage.completeStep(userId, 'address-consent');
      await storage.updateProgress(userId, 'tariff-confirmation', {});

      res.json({ success: true, site });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error('Save site error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * GET /api/onboarding/:userId/site
   * Get site data
   */
  router.get('/:userId/site', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const site = await storage.getSite(userId);

      if (!site) {
        return res.status(404).json({ error: 'Site not found' });
      }

      res.json(site);
    } catch (error) {
      console.error('Get site error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * POST /api/onboarding/:userId/tariff
   * Save tariff data
   */
  router.post('/:userId/tariff', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const tariffData = tariffSchema.parse(req.body);

      await storage.saveTariff(userId, tariffData);
      await storage.completeStep(userId, 'tariff-confirmation');
      await storage.updateProgress(userId, 'charging-preferences', {});

      res.json({ success: true, tariff: tariffData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error('Save tariff error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * GET /api/onboarding/:userId/tariff
   * Get tariff data
   */
  router.get('/:userId/tariff', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const tariff = await storage.getTariff(userId);

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
   * POST /api/onboarding/:userId/preferences
   * Save charging preferences
   */
  router.post('/:userId/preferences', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const prefsData = preferencesSchema.parse(req.body);

      await storage.savePreferences(userId, prefsData);
      await storage.completeStep(userId, 'charging-preferences');
      await storage.updateProgress(userId, 'manufacturer-selection', {});

      res.json({ success: true, preferences: prefsData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error('Save preferences error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * GET /api/onboarding/:userId/preferences
   * Get charging preferences
   */
  router.get('/:userId/preferences', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const prefs = await storage.getPreferences(userId);

      if (!prefs) {
        return res.status(404).json({ error: 'Preferences not found' });
      }

      res.json(prefs);
    } catch (error) {
      console.error('Get preferences error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * POST /api/onboarding/:userId/manufacturer
   * Save manufacturer selection
   */
  router.post('/:userId/manufacturer', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { manufacturer } = manufacturerSchema.parse(req.body);

      await storage.saveManufacturer(userId, manufacturer);
      await storage.completeStep(userId, 'manufacturer-selection');

      res.json({ success: true, manufacturer });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error('Save manufacturer error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * POST /api/onboarding/:userId/activate
   * Activate vehicle
   */
  router.post('/:userId/activate', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      await storage.activateVehicle(userId);
      await storage.completeStep(userId, 'activated');
      await storage.updateProgress(userId, 'activated', {});

      res.json({ success: true, status: 'ACTIVE' });
    } catch (error) {
      console.error('Activate vehicle error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * GET /api/manufacturers
   * Get list of supported manufacturers
   */
  router.get('/manufacturers', async (req: Request, res: Response) => {
    const manufacturers = [
      { id: 'tesla', name: 'Tesla' },
      { id: 'volkswagen', name: 'Volkswagen' },
      { id: 'bmw', name: 'BMW' },
      { id: 'audi', name: 'Audi' },
      { id: 'mini', name: 'Mini' },
      { id: 'kia', name: 'Kia' },
      { id: 'hyundai', name: 'Hyundai' },
      { id: 'fiat', name: 'Fiat' },
      { id: 'peugeot', name: 'Peugeot' },
      { id: 'renault', name: 'Renault' }
    ];

    res.json({ manufacturers });
  });

  return router;
}
