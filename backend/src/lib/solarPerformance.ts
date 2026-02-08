/**
 * Solar Performance Service
 * 
 * Calculates solar performance metrics and generates recommendations
 */

import { prisma } from './prisma.js';

export interface SolarPerformanceResult {
  totalGenerationKwh: number;
  totalConsumptionKwh: number;
  totalExportKwh: number;
  selfConsumptionKwh: number;
  selfConsumptionPercentage: number;
  exportPercentage: number;
  recommendations: string[];
}

/**
 * Calculate solar performance metrics
 */
export async function calculateSolarPerformance(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<SolarPerformanceResult | null> {
  // Check if user has solar configured
  const solarConfig = await prisma.solarSystem.findUnique({
    where: { userId }
  });

  if (!solarConfig || !solarConfig.hasSolar) {
    return null; // No solar system configured
  }

  // Get consumption data
  const consumptionData = await prisma.consumptionDataPoint.findMany({
    where: {
      userId,
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  if (consumptionData.length === 0) {
    return getEmptyResult();
  }

  // For this prototype, we'll estimate solar generation based on the forecast model
  // In a real system, this would come from actual solar generation data
  const totalConsumptionKwh = consumptionData.reduce((sum, dp) => sum + dp.consumptionKwh, 0);
  
  // Estimate solar generation (simplified - in reality would use actual generation data)
  const totalGenerationKwh = estimateSolarGeneration(solarConfig, startDate, endDate);
  
  // Calculate self-consumption and export
  // In real-life scenarios, typical self-consumption is 40-60%
  // This depends on when solar generates vs when household consumes
  
  // Estimate realistic self-consumption (40-60% of generation)
  const selfConsumptionRatio = 0.45 + (Math.random() * 0.15); // Random between 0.45-0.60
  const selfConsumptionKwh = totalGenerationKwh * selfConsumptionRatio;
  const totalExportKwh = totalGenerationKwh - selfConsumptionKwh;
  
  const selfConsumptionPercentage = (selfConsumptionKwh / totalGenerationKwh) * 100;
  const exportPercentage = (totalExportKwh / totalGenerationKwh) * 100;

  // Generate recommendations
  const recommendations = generateRecommendations(
    exportPercentage,
    selfConsumptionPercentage,
    userId
  );

  return {
    totalGenerationKwh,
    totalConsumptionKwh,
    totalExportKwh,
    selfConsumptionKwh,
    selfConsumptionPercentage,
    exportPercentage,
    recommendations: await recommendations
  };
}

/**
 * Estimate solar generation for a period (simplified model)
 */
function estimateSolarGeneration(
  solarConfig: { systemSizeKw: number | null },
  startDate: Date,
  endDate: Date
): number {
  if (!solarConfig.systemSizeKw) return 0;

  // Simplified estimation: assume 4 peak sun hours per day on average
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const peakSunHoursPerDay = 4;
  const systemEfficiency = 0.85; // 85% efficiency
  
  return solarConfig.systemSizeKw * peakSunHoursPerDay * days * systemEfficiency;
}

/**
 * Generate recommendations based on solar performance
 */
async function generateRecommendations(
  exportPercentage: number,
  selfConsumptionPercentage: number,
  userId: string
): Promise<string[]> {
  const recommendations: string[] = [];

  // Check if user has battery or EV configured
  const [batteries, evs] = await Promise.all([
    prisma.homeBattery.findMany({ where: { userId } }),
    prisma.electricVehicle.findMany({ where: { userId } })
  ]);

  const hasBattery = batteries.length > 0;
  const hasEV = evs.length > 0;

  // High export recommendations
  if (exportPercentage > 50) {
    if (!hasBattery) {
      recommendations.push(
        'Consider adding a home battery to store excess solar energy instead of exporting it to the grid'
      );
    }
    
    if (!hasEV) {
      recommendations.push(
        'Consider an electric vehicle to utilize your excess solar generation during the day'
      );
    }

    if (hasBattery || hasEV) {
      recommendations.push(
        'Shift more of your energy usage to midday hours when solar generation is highest'
      );
    }
  }

  // Low self-consumption recommendations
  if (selfConsumptionPercentage < 30 && exportPercentage > 40) {
    recommendations.push(
      'Your solar self-consumption is low. Try running appliances like dishwashers and washing machines during peak solar hours (10 AM - 3 PM)'
    );
  }

  // Moderate export with no storage
  if (exportPercentage > 30 && exportPercentage <= 50 && !hasBattery) {
    recommendations.push(
      'You\'re exporting a significant amount of solar. A home battery could help you use more of your own generation'
    );
  }

  // Good performance
  if (selfConsumptionPercentage > 70) {
    recommendations.push(
      'Great job! You\'re using most of your solar generation directly, minimizing grid reliance'
    );
  }

  return recommendations;
}

/**
 * Get empty result when no data is available
 */
function getEmptyResult(): SolarPerformanceResult {
  return {
    totalGenerationKwh: 0,
    totalConsumptionKwh: 0,
    totalExportKwh: 0,
    selfConsumptionKwh: 0,
    selfConsumptionPercentage: 0,
    exportPercentage: 0,
    recommendations: []
  };
}
