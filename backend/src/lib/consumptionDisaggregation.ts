/**
 * Consumption Disaggregation Service
 * 
 * Analyzes consumption patterns to estimate energy usage by device category
 */

import { prisma } from './prisma.js';

export interface DisaggregationResult {
  heatingCoolingKwh: number;
  hotWaterKwh: number;
  appliancesKwh: number;
  fridgeFreezerKwh: number;
  clothesDryerKwh: number;
  tvElectronicsKwh: number;
  lightingOtherKwh: number;
  totalKwh: number;
  heatingCoolingPercentage: number;
  hotWaterPercentage: number;
  appliancesPercentage: number;
  fridgeFreezerPercentage: number;
  clothesDryerPercentage: number;
  tvElectronicsPercentage: number;
  lightingOtherPercentage: number;
}

/**
 * Analyze consumption data to disaggregate by device category
 * Uses realistic household energy breakdown percentages
 */
export async function disaggregateConsumption(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<DisaggregationResult> {
  // Get consumption data for the period
  const dataPoints = await prisma.consumptionDataPoint.findMany({
    where: {
      userId,
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: {
      timestamp: 'asc'
    }
  });

  if (dataPoints.length === 0) {
    return getEmptyResult();
  }

  // Calculate total consumption
  const totalKwh = dataPoints.reduce((sum, dp) => sum + dp.consumptionKwh, 0);

  // Apply realistic household energy breakdown percentages
  // Heating & Cooling: 40%
  const heatingCoolingKwh = totalKwh * 0.40;
  const heatingCoolingPercentage = 40;

  // Hot Water Systems: 25%
  const hotWaterKwh = totalKwh * 0.25;
  const hotWaterPercentage = 25;

  // Appliances & Equipment: 25% total
  const appliancesTotalKwh = totalKwh * 0.25;
  
  // Breakdown of appliances:
  // - Fridges/Freezers: 7%
  const fridgeFreezerKwh = totalKwh * 0.07;
  const fridgeFreezerPercentage = 7;
  
  // - Clothes Dryers: 10%
  const clothesDryerKwh = totalKwh * 0.10;
  const clothesDryerPercentage = 10;
  
  // - TVs & Electronics: 5%
  const tvElectronicsKwh = totalKwh * 0.05;
  const tvElectronicsPercentage = 5;
  
  // - Other Appliances: 3% (25% - 7% - 10% - 5%)
  const otherAppliancesKwh = totalKwh * 0.03;
  
  const appliancesKwh = appliancesTotalKwh;
  const appliancesPercentage = 25;

  // Lighting & Others: 10%
  const lightingOtherKwh = totalKwh * 0.10;
  const lightingOtherPercentage = 10;

  return {
    heatingCoolingKwh,
    hotWaterKwh,
    appliancesKwh,
    fridgeFreezerKwh,
    clothesDryerKwh,
    tvElectronicsKwh,
    lightingOtherKwh,
    totalKwh,
    heatingCoolingPercentage,
    hotWaterPercentage,
    appliancesPercentage,
    fridgeFreezerPercentage,
    clothesDryerPercentage,
    tvElectronicsPercentage,
    lightingOtherPercentage
  };
}

/**
 * Get empty result when no data is available
 */
function getEmptyResult(): DisaggregationResult {
  return {
    heatingCoolingKwh: 0,
    hotWaterKwh: 0,
    appliancesKwh: 0,
    fridgeFreezerKwh: 0,
    clothesDryerKwh: 0,
    tvElectronicsKwh: 0,
    lightingOtherKwh: 0,
    totalKwh: 0,
    heatingCoolingPercentage: 0,
    hotWaterPercentage: 0,
    appliancesPercentage: 0,
    fridgeFreezerPercentage: 0,
    clothesDryerPercentage: 0,
    tvElectronicsPercentage: 0,
    lightingOtherPercentage: 0
  };
}
