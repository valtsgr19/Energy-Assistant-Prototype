/**
 * Solar Generation Forecast Service
 * 
 * Calculates solar generation forecasts based on system specifications,
 * time of day, and seasonal factors.
 */

interface SolarSystemConfig {
  hasSolar: boolean;
  systemSizeKw: number | null;
  tiltDegrees: number | null;
  orientation: string | null;
}

interface SolarInterval {
  startTime: Date;
  endTime: Date;
  generationKwh: number;
}

interface SolarForecast {
  date: Date;
  intervals: SolarInterval[];
}

// Constants
const BASE_EFFICIENCY = 0.85; // Accounts for inverter losses, temperature effects
const PEAK_IRRADIANCE = 1.0; // kW/m² (standard test conditions)
const DEFAULT_LATITUDE = 40.0; // Default latitude for calculations (can be made configurable)

/**
 * Get orientation factor based on panel direction
 * South-facing panels get maximum sunlight in Northern Hemisphere
 */
function getOrientationFactor(orientation: string): number {
  const factors: Record<string, number> = {
    'N': 0.7,   // North-facing
    'NE': 0.8,  // Northeast
    'NW': 0.8,  // Northwest
    'E': 0.85,  // East
    'W': 0.85,  // West
    'SE': 0.95, // Southeast
    'SW': 0.95, // Southwest
    'S': 1.0,   // South-facing (optimal)
  };
  
  return factors[orientation] || 0.85;
}

/**
 * Calculate tilt factor based on panel angle and latitude
 * Optimal tilt is approximately equal to latitude ± 15 degrees
 */
function getTiltFactor(tiltDegrees: number, latitude: number = DEFAULT_LATITUDE): number {
  const optimalTilt = latitude; // Simplified: optimal tilt ≈ latitude
  const tiltDifference = Math.abs(tiltDegrees - optimalTilt);
  
  // Factor = 1.0 - (|actualTilt - optimalTilt| / 90) × 0.3
  // This gives a range from 0.7 to 1.0
  const factor = 1.0 - (tiltDifference / 90) * 0.3;
  
  // Ensure factor is at least 0.7 (even worst case should generate something)
  return Math.max(0.7, Math.min(1.0, factor));
}

/**
 * Calculate sunrise and sunset times for a given date
 * Simplified calculation - in production, use a library like suncalc
 */
function getSunriseSunset(date: Date, latitude: number = DEFAULT_LATITUDE): { sunrise: number; sunset: number } {
  // Simplified calculation based on day of year
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // Approximate day length variation (hours)
  const dayLengthVariation = 4 * Math.sin((dayOfYear - 80) * 2 * Math.PI / 365);
  const baseDayLength = 12; // 12 hours at equinox
  const dayLength = baseDayLength + dayLengthVariation;
  
  const sunrise = 12 - dayLength / 2; // Hours from midnight
  const sunset = 12 + dayLength / 2;
  
  return { sunrise, sunset };
}

/**
 * Calculate solar irradiance factor for a given time
 * Returns a value between 0 and 1 representing the fraction of peak irradiance
 */
function getIrradianceFactor(hour: number, sunrise: number, sunset: number): number {
  // No generation before sunrise or after sunset
  if (hour < sunrise || hour >= sunset) {
    return 0;
  }
  
  // Sinusoidal curve from sunrise to sunset
  const solarAngle = ((hour - sunrise) / (sunset - sunrise)) * Math.PI;
  const irradianceFactor = Math.sin(solarAngle);
  
  return Math.max(0, irradianceFactor);
}

/**
 * Generate solar forecast for a specific date
 * Returns 48 half-hour intervals covering a 24-hour period
 */
export function generateSolarForecast(
  config: SolarSystemConfig,
  date: Date = new Date()
): SolarForecast {
  const intervals: SolarInterval[] = [];
  
  // If no solar system, return zero generation for all intervals
  if (!config.hasSolar || config.systemSizeKw === null || config.tiltDegrees === null || !config.orientation) {
    for (let i = 0; i < 48; i++) {
      const startTime = new Date(date);
      startTime.setHours(Math.floor(i / 2), (i % 2) * 30, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 30);
      
      intervals.push({
        startTime,
        endTime,
        generationKwh: 0,
      });
    }
    
    return { date, intervals };
  }
  
  // Get sunrise and sunset times
  const { sunrise, sunset } = getSunriseSunset(date);
  
  // Calculate factors
  const orientationFactor = getOrientationFactor(config.orientation);
  const tiltFactor = getTiltFactor(config.tiltDegrees);
  
  // Generate 48 half-hour intervals
  for (let i = 0; i < 48; i++) {
    const startTime = new Date(date);
    startTime.setHours(Math.floor(i / 2), (i % 2) * 30, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 30);
    
    // Calculate hour (middle of interval)
    const hour = Math.floor(i / 2) + ((i % 2) * 0.5) + 0.25; // Middle of 30-min interval
    
    // Calculate irradiance factor
    const irradianceFactor = getIrradianceFactor(hour, sunrise, sunset);
    
    // Calculate generation for this interval
    // generation = systemSize × irradiance × efficiency × orientation × tilt
    // For 30-minute interval, divide by 2 to get kWh
    const generationKw = config.systemSizeKw * 
                         PEAK_IRRADIANCE * 
                         irradianceFactor * 
                         BASE_EFFICIENCY * 
                         orientationFactor * 
                         tiltFactor;
    
    const generationKwh = generationKw * 0.5; // 30 minutes = 0.5 hours
    
    intervals.push({
      startTime,
      endTime,
      generationKwh: Math.max(0, generationKwh), // Ensure non-negative
    });
  }
  
  return { date, intervals };
}

/**
 * Generate forecasts for today and tomorrow
 */
export function generateDailyForecasts(config: SolarSystemConfig): {
  today: SolarForecast;
  tomorrow: SolarForecast;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return {
    today: generateSolarForecast(config, today),
    tomorrow: generateSolarForecast(config, tomorrow),
  };
}

/**
 * Calculate total generation for a forecast
 */
export function calculateTotalGeneration(forecast: SolarForecast): number {
  return forecast.intervals.reduce((total, interval) => total + interval.generationKwh, 0);
}

/**
 * Get generation for a specific time
 */
export function getGenerationAtTime(forecast: SolarForecast, time: Date): number {
  const interval = forecast.intervals.find(
    (int) => time >= int.startTime && time < int.endTime
  );
  
  return interval?.generationKwh || 0;
}
