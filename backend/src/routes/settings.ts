import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../lib/auth.js';
import prisma from '../lib/prisma.js';
import { inferBatteryCapacity, getDefaultBatteryCapacity } from '../lib/evBatteryLookup.js';

const router = Router();

// GET /api/settings/profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Fetch user profile with all related data
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
      include: {
        solarSystem: true,
        electricVehicles: true,
        homeBatteries: true,
      },
    });

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Format the response
    res.status(200).json({
      userId: userProfile.id,
      energyAccountId: userProfile.energyAccountId,
      solarSystem: userProfile.solarSystem ? {
        hasSolar: userProfile.solarSystem.hasSolar,
        systemSizeKw: userProfile.solarSystem.systemSizeKw,
        tiltDegrees: userProfile.solarSystem.tiltDegrees,
        orientation: userProfile.solarSystem.orientation,
      } : null,
      evs: userProfile.electricVehicles.map(ev => ({
        vehicleId: ev.id,
        make: ev.make,
        model: ev.model,
        batteryCapacityKwh: ev.batteryCapacityKwh,
        chargingSpeedKw: ev.chargingSpeedKw,
        averageDailyMiles: ev.averageDailyMiles,
      })),
      batteries: userProfile.homeBatteries.map(battery => ({
        batteryId: battery.id,
        powerKw: battery.powerKw,
        capacityKwh: battery.capacityKwh,
      })),
    });
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/settings/solar-system
router.put('/solar-system', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { hasSolar, systemSizeKw, tiltDegrees, orientation } = req.body;

    // Validate required field
    if (hasSolar === undefined) {
      return res.status(400).json({ error: 'hasSolar is required' });
    }

    // If hasSolar is true, validate solar system parameters
    if (hasSolar) {
      if (!systemSizeKw || !tiltDegrees || !orientation) {
        return res.status(400).json({ error: 'Solar system parameters are required when hasSolar is true' });
      }

      if (systemSizeKw <= 0 || systemSizeKw > 100) {
        return res.status(400).json({ error: 'System size must be between 0 and 100 kW' });
      }

      if (tiltDegrees < 0 || tiltDegrees > 90) {
        return res.status(400).json({ error: 'Tilt degrees must be between 0 and 90' });
      }

      const validOrientations = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      if (!validOrientations.includes(orientation)) {
        return res.status(400).json({ error: 'Invalid orientation' });
      }
    }

    // Check if solar system exists
    const existingSolarSystem = await prisma.solarSystem.findUnique({
      where: { userId },
    });

    if (existingSolarSystem) {
      // Update existing solar system
      await prisma.solarSystem.update({
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
      await prisma.solarSystem.create({
        data: {
          userId,
          hasSolar,
          systemSizeKw: hasSolar ? systemSizeKw : null,
          tiltDegrees: hasSolar ? tiltDegrees : null,
          orientation: hasSolar ? orientation : null,
        },
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Solar system update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/settings/ev
router.post('/ev', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { make, model, chargingSpeedKw, averageDailyMiles, batteryCapacityKwh } = req.body;

    // Validate required fields
    if (!make || !model) {
      return res.status(400).json({ error: 'Make and model are required' });
    }

    if (chargingSpeedKw !== undefined && (chargingSpeedKw <= 0 || chargingSpeedKw > 350)) {
      return res.status(400).json({ error: 'Charging speed must be between 0 and 350 kW' });
    }

    if (averageDailyMiles !== undefined && (averageDailyMiles < 0 || averageDailyMiles > 500)) {
      return res.status(400).json({ error: 'Average daily miles must be between 0 and 500' });
    }

    // Infer battery capacity if not provided
    let capacity = batteryCapacityKwh;
    if (!capacity) {
      capacity = inferBatteryCapacity(make, model);
      if (!capacity) {
        capacity = getDefaultBatteryCapacity(model);
      }
    }

    // Validate battery capacity
    if (capacity <= 0 || capacity > 200) {
      return res.status(400).json({ error: 'Battery capacity must be between 0 and 200 kWh' });
    }

    // Create EV configuration
    const ev = await prisma.electricVehicle.create({
      data: {
        userId,
        make,
        model,
        batteryCapacityKwh: capacity,
        chargingSpeedKw: chargingSpeedKw || 7.0, // Default to 7kW (Level 2 charging)
        averageDailyMiles: averageDailyMiles || 30, // Default to 30 miles/day
      },
    });

    res.status(201).json({
      success: true,
      vehicleId: ev.id,
      batteryCapacityKwh: ev.batteryCapacityKwh,
    });
  } catch (error) {
    console.error('EV configuration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/settings/ev/:vehicleId
router.put('/ev/:vehicleId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { vehicleId } = req.params;
    const { make, model, chargingSpeedKw, averageDailyMiles, batteryCapacityKwh } = req.body;

    // Check if EV exists and belongs to user
    const existingEV = await prisma.electricVehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!existingEV) {
      return res.status(404).json({ error: 'EV not found' });
    }

    if (existingEV.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to modify this EV' });
    }

    // Validate fields if provided
    if (chargingSpeedKw !== undefined && (chargingSpeedKw <= 0 || chargingSpeedKw > 350)) {
      return res.status(400).json({ error: 'Charging speed must be between 0 and 350 kW' });
    }

    if (averageDailyMiles !== undefined && (averageDailyMiles < 0 || averageDailyMiles > 500)) {
      return res.status(400).json({ error: 'Average daily miles must be between 0 and 500' });
    }

    if (batteryCapacityKwh !== undefined && (batteryCapacityKwh <= 0 || batteryCapacityKwh > 200)) {
      return res.status(400).json({ error: 'Battery capacity must be between 0 and 200 kWh' });
    }

    // Build update data
    const updateData: any = {};
    if (make) updateData.make = make;
    if (model) updateData.model = model;
    if (chargingSpeedKw !== undefined) updateData.chargingSpeedKw = chargingSpeedKw;
    if (averageDailyMiles !== undefined) updateData.averageDailyMiles = averageDailyMiles;
    if (batteryCapacityKwh !== undefined) updateData.batteryCapacityKwh = batteryCapacityKwh;

    // If make/model changed, re-infer battery capacity if not explicitly provided
    if ((make || model) && batteryCapacityKwh === undefined) {
      const newMake = make || existingEV.make;
      const newModel = model || existingEV.model;
      const inferredCapacity = inferBatteryCapacity(newMake, newModel);
      if (inferredCapacity) {
        updateData.batteryCapacityKwh = inferredCapacity;
      }
    }

    // Update EV
    const updatedEV = await prisma.electricVehicle.update({
      where: { id: vehicleId },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      vehicleId: updatedEV.id,
      batteryCapacityKwh: updatedEV.batteryCapacityKwh,
    });
  } catch (error) {
    console.error('EV update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/settings/ev/:vehicleId
router.delete('/ev/:vehicleId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { vehicleId } = req.params;

    // Check if EV exists and belongs to user
    const existingEV = await prisma.electricVehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!existingEV) {
      return res.status(404).json({ error: 'EV not found' });
    }

    if (existingEV.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this EV' });
    }

    // Delete EV
    await prisma.electricVehicle.delete({
      where: { id: vehicleId },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('EV deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/settings/battery
router.post('/battery', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { powerKw, capacityKwh } = req.body;

    // Validate required fields
    if (powerKw === undefined || capacityKwh === undefined) {
      return res.status(400).json({ error: 'Power rating and capacity are required' });
    }

    // Validate power rating (typical range: 1-20 kW for home batteries)
    if (powerKw <= 0 || powerKw > 50) {
      return res.status(400).json({ error: 'Power rating must be between 0 and 50 kW' });
    }

    // Validate capacity (typical range: 5-100 kWh for home batteries)
    if (capacityKwh <= 0 || capacityKwh > 200) {
      return res.status(400).json({ error: 'Capacity must be between 0 and 200 kWh' });
    }

    // Create battery configuration
    const battery = await prisma.homeBattery.create({
      data: {
        userId,
        powerKw,
        capacityKwh,
      },
    });

    res.status(201).json({
      success: true,
      batteryId: battery.id,
    });
  } catch (error) {
    console.error('Battery configuration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/settings/battery/:batteryId
router.put('/battery/:batteryId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { batteryId } = req.params;
    const { powerKw, capacityKwh } = req.body;

    // Check if battery exists and belongs to user
    const existingBattery = await prisma.homeBattery.findUnique({
      where: { id: batteryId },
    });

    if (!existingBattery) {
      return res.status(404).json({ error: 'Battery not found' });
    }

    if (existingBattery.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to modify this battery' });
    }

    // Validate fields if provided
    if (powerKw !== undefined && (powerKw <= 0 || powerKw > 50)) {
      return res.status(400).json({ error: 'Power rating must be between 0 and 50 kW' });
    }

    if (capacityKwh !== undefined && (capacityKwh <= 0 || capacityKwh > 200)) {
      return res.status(400).json({ error: 'Capacity must be between 0 and 200 kWh' });
    }

    // Build update data
    const updateData: any = {};
    if (powerKw !== undefined) updateData.powerKw = powerKw;
    if (capacityKwh !== undefined) updateData.capacityKwh = capacityKwh;

    // Update battery
    const updatedBattery = await prisma.homeBattery.update({
      where: { id: batteryId },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      batteryId: updatedBattery.id,
    });
  } catch (error) {
    console.error('Battery update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/settings/battery/:batteryId
router.delete('/battery/:batteryId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { batteryId } = req.params;

    // Check if battery exists and belongs to user
    const existingBattery = await prisma.homeBattery.findUnique({
      where: { id: batteryId },
    });

    if (!existingBattery) {
      return res.status(404).json({ error: 'Battery not found' });
    }

    if (existingBattery.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this battery' });
    }

    // Delete battery
    await prisma.homeBattery.delete({
      where: { id: batteryId },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Battery deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
