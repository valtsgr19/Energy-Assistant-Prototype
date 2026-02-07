/**
 * Tests for Solar Forecast Service
 */

import {
  generateSolarForecast,
  generateDailyForecasts,
  calculateTotalGeneration,
  getGenerationAtTime,
} from '../solarForecast.js';

describe('Solar Forecast Service', () => {
  describe('generateSolarForecast', () => {
    it('should generate 48 intervals for a 24-hour period', () => {
      const config = {
        hasSolar: true,
        systemSizeKw: 5.0,
        tiltDegrees: 30.0,
        orientation: 'S',
      };
      
      const date = new Date('2024-06-21'); // Summer solstice
      const forecast = generateSolarForecast(config, date);
      
      expect(forecast.intervals).toHaveLength(48);
      expect(forecast.date).toEqual(date);
    });
    
    it('should return zero generation when hasSolar is false', () => {
      const config = {
        hasSolar: false,
        systemSizeKw: null,
        tiltDegrees: null,
        orientation: null,
      };
      
      const forecast = generateSolarForecast(config);
      
      expect(forecast.intervals).toHaveLength(48);
      forecast.intervals.forEach(interval => {
        expect(interval.generationKwh).toBe(0);
      });
    });
    
    it('should return zero generation for nighttime hours', () => {
      const config = {
        hasSolar: true,
        systemSizeKw: 5.0,
        tiltDegrees: 30.0,
        orientation: 'S',
      };
      
      const date = new Date('2024-06-21');
      const forecast = generateSolarForecast(config, date);
      
      // Check midnight hours (0:00-4:00)
      const nightIntervals = forecast.intervals.slice(0, 8);
      nightIntervals.forEach(interval => {
        expect(interval.generationKwh).toBe(0);
      });
      
      // Check late night hours (22:00-24:00)
      const lateNightIntervals = forecast.intervals.slice(44, 48);
      lateNightIntervals.forEach(interval => {
        expect(interval.generationKwh).toBe(0);
      });
    });
    
    it('should generate positive values during daylight hours', () => {
      const config = {
        hasSolar: true,
        systemSizeKw: 5.0,
        tiltDegrees: 30.0,
        orientation: 'S',
      };
      
      const date = new Date('2024-06-21');
      const forecast = generateSolarForecast(config, date);
      
      // Check midday hours (11:00-14:00) - should have generation
      const middayIntervals = forecast.intervals.slice(22, 28);
      middayIntervals.forEach(interval => {
        expect(interval.generationKwh).toBeGreaterThan(0);
      });
    });
    
    it('should scale generation proportionally with system size', () => {
      const smallSystem = {
        hasSolar: true,
        systemSizeKw: 5.0,
        tiltDegrees: 30.0,
        orientation: 'S',
      };
      
      const largeSystem = {
        hasSolar: true,
        systemSizeKw: 10.0,
        tiltDegrees: 30.0,
        orientation: 'S',
      };
      
      const date = new Date('2024-06-21');
      const smallForecast = generateSolarForecast(smallSystem, date);
      const largeForecast = generateSolarForecast(largeSystem, date);
      
      // Check noon interval (should have maximum generation)
      const noonIndex = 24; // 12:00
      const smallGen = smallForecast.intervals[noonIndex].generationKwh;
      const largeGen = largeForecast.intervals[noonIndex].generationKwh;
      
      // Large system should generate approximately 2x the small system
      expect(largeGen).toBeCloseTo(smallGen * 2, 1);
    });
    
    it('should apply orientation factor correctly', () => {
      const southFacing = {
        hasSolar: true,
        systemSizeKw: 5.0,
        tiltDegrees: 30.0,
        orientation: 'S',
      };
      
      const northFacing = {
        hasSolar: true,
        systemSizeKw: 5.0,
        tiltDegrees: 30.0,
        orientation: 'N',
      };
      
      const date = new Date('2024-06-21');
      const southForecast = generateSolarForecast(southFacing, date);
      const northForecast = generateSolarForecast(northFacing, date);
      
      const noonIndex = 24;
      const southGen = southForecast.intervals[noonIndex].generationKwh;
      const northGen = northForecast.intervals[noonIndex].generationKwh;
      
      // South-facing should generate more than north-facing
      expect(southGen).toBeGreaterThan(northGen);
      
      // North-facing should be approximately 70% of south-facing
      expect(northGen).toBeCloseTo(southGen * 0.7, 1);
    });
    
    it('should generate intervals with correct timestamps', () => {
      const config = {
        hasSolar: true,
        systemSizeKw: 5.0,
        tiltDegrees: 30.0,
        orientation: 'S',
      };
      
      const date = new Date('2024-06-21');
      date.setHours(0, 0, 0, 0);
      const forecast = generateSolarForecast(config, date);
      
      // Check first interval
      expect(forecast.intervals[0].startTime.getHours()).toBe(0);
      expect(forecast.intervals[0].startTime.getMinutes()).toBe(0);
      expect(forecast.intervals[0].endTime.getHours()).toBe(0);
      expect(forecast.intervals[0].endTime.getMinutes()).toBe(30);
      
      // Check last interval
      expect(forecast.intervals[47].startTime.getHours()).toBe(23);
      expect(forecast.intervals[47].startTime.getMinutes()).toBe(30);
      expect(forecast.intervals[47].endTime.getHours()).toBe(0);
      expect(forecast.intervals[47].endTime.getMinutes()).toBe(0);
    });
    
    it('should handle all valid orientations', () => {
      const orientations = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const date = new Date('2024-06-21');
      
      orientations.forEach(orientation => {
        const config = {
          hasSolar: true,
          systemSizeKw: 5.0,
          tiltDegrees: 30.0,
          orientation,
        };
        
        const forecast = generateSolarForecast(config, date);
        expect(forecast.intervals).toHaveLength(48);
        
        // Should have some generation during the day
        const totalGen = calculateTotalGeneration(forecast);
        expect(totalGen).toBeGreaterThan(0);
      });
    });
    
    it('should apply tilt factor correctly', () => {
      const optimalTilt = {
        hasSolar: true,
        systemSizeKw: 5.0,
        tiltDegrees: 40.0, // Close to optimal for latitude 40
        orientation: 'S',
      };
      
      const flatTilt = {
        hasSolar: true,
        systemSizeKw: 5.0,
        tiltDegrees: 0.0, // Flat
        orientation: 'S',
      };
      
      const date = new Date('2024-06-21');
      const optimalForecast = generateSolarForecast(optimalTilt, date);
      const flatForecast = generateSolarForecast(flatTilt, date);
      
      const optimalTotal = calculateTotalGeneration(optimalForecast);
      const flatTotal = calculateTotalGeneration(flatForecast);
      
      // Optimal tilt should generate more than flat
      expect(optimalTotal).toBeGreaterThan(flatTotal);
    });
  });
  
  describe('generateDailyForecasts', () => {
    it('should generate forecasts for today and tomorrow', () => {
      const config = {
        hasSolar: true,
        systemSizeKw: 5.0,
        tiltDegrees: 30.0,
        orientation: 'S',
      };
      
      const forecasts = generateDailyForecasts(config);
      
      expect(forecasts.today).toBeDefined();
      expect(forecasts.tomorrow).toBeDefined();
      expect(forecasts.today.intervals).toHaveLength(48);
      expect(forecasts.tomorrow.intervals).toHaveLength(48);
      
      // Tomorrow's date should be one day after today
      const dayDiff = forecasts.tomorrow.date.getTime() - forecasts.today.date.getTime();
      expect(dayDiff).toBe(24 * 60 * 60 * 1000); // 24 hours in milliseconds
    });
    
    it('should return zero generation for both days when hasSolar is false', () => {
      const config = {
        hasSolar: false,
        systemSizeKw: null,
        tiltDegrees: null,
        orientation: null,
      };
      
      const forecasts = generateDailyForecasts(config);
      
      const todayTotal = calculateTotalGeneration(forecasts.today);
      const tomorrowTotal = calculateTotalGeneration(forecasts.tomorrow);
      
      expect(todayTotal).toBe(0);
      expect(tomorrowTotal).toBe(0);
    });
  });
  
  describe('calculateTotalGeneration', () => {
    it('should sum all interval generations', () => {
      const config = {
        hasSolar: true,
        systemSizeKw: 5.0,
        tiltDegrees: 30.0,
        orientation: 'S',
      };
      
      const forecast = generateSolarForecast(config);
      const total = calculateTotalGeneration(forecast);
      
      // Manual sum
      const manualTotal = forecast.intervals.reduce(
        (sum, interval) => sum + interval.generationKwh,
        0
      );
      
      expect(total).toBe(manualTotal);
      expect(total).toBeGreaterThan(0);
    });
    
    it('should return zero for no solar system', () => {
      const config = {
        hasSolar: false,
        systemSizeKw: null,
        tiltDegrees: null,
        orientation: null,
      };
      
      const forecast = generateSolarForecast(config);
      const total = calculateTotalGeneration(forecast);
      
      expect(total).toBe(0);
    });
  });
  
  describe('getGenerationAtTime', () => {
    it('should return generation for a specific time', () => {
      const config = {
        hasSolar: true,
        systemSizeKw: 5.0,
        tiltDegrees: 30.0,
        orientation: 'S',
      };
      
      const date = new Date('2024-06-21');
      date.setHours(0, 0, 0, 0);
      const forecast = generateSolarForecast(config, date);
      
      // Check noon
      const noonTime = new Date(date);
      noonTime.setHours(12, 15, 0, 0); // 12:15 PM
      const noonGen = getGenerationAtTime(forecast, noonTime);
      
      expect(noonGen).toBeGreaterThan(0);
    });
    
    it('should return zero for nighttime', () => {
      const config = {
        hasSolar: true,
        systemSizeKw: 5.0,
        tiltDegrees: 30.0,
        orientation: 'S',
      };
      
      const date = new Date('2024-06-21');
      date.setHours(0, 0, 0, 0);
      const forecast = generateSolarForecast(config, date);
      
      // Check midnight
      const midnightTime = new Date(date);
      midnightTime.setHours(2, 0, 0, 0); // 2:00 AM
      const midnightGen = getGenerationAtTime(forecast, midnightTime);
      
      expect(midnightGen).toBe(0);
    });
    
    it('should return zero for time outside forecast range', () => {
      const config = {
        hasSolar: true,
        systemSizeKw: 5.0,
        tiltDegrees: 30.0,
        orientation: 'S',
      };
      
      const date = new Date('2024-06-21');
      const forecast = generateSolarForecast(config, date);
      
      // Check time from different day
      const differentDay = new Date('2024-06-22');
      differentDay.setHours(12, 0, 0, 0);
      const gen = getGenerationAtTime(forecast, differentDay);
      
      expect(gen).toBe(0);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle minimum system size', () => {
      const config = {
        hasSolar: true,
        systemSizeKw: 0.1,
        tiltDegrees: 30.0,
        orientation: 'S',
      };
      
      const forecast = generateSolarForecast(config);
      const total = calculateTotalGeneration(forecast);
      
      expect(total).toBeGreaterThan(0);
      expect(total).toBeLessThan(5); // Small system, small generation
    });
    
    it('should handle maximum system size', () => {
      const config = {
        hasSolar: true,
        systemSizeKw: 100.0,
        tiltDegrees: 30.0,
        orientation: 'S',
      };
      
      const forecast = generateSolarForecast(config);
      const total = calculateTotalGeneration(forecast);
      
      expect(total).toBeGreaterThan(100); // Large system, large generation
    });
    
    it('should handle extreme tilt angles', () => {
      const flatConfig = {
        hasSolar: true,
        systemSizeKw: 5.0,
        tiltDegrees: 0.0,
        orientation: 'S',
      };
      
      const verticalConfig = {
        hasSolar: true,
        systemSizeKw: 5.0,
        tiltDegrees: 90.0,
        orientation: 'S',
      };
      
      const flatForecast = generateSolarForecast(flatConfig);
      const verticalForecast = generateSolarForecast(verticalConfig);
      
      const flatTotal = calculateTotalGeneration(flatForecast);
      const verticalTotal = calculateTotalGeneration(verticalForecast);
      
      // Both should generate something
      expect(flatTotal).toBeGreaterThan(0);
      expect(verticalTotal).toBeGreaterThan(0);
    });
    
    it('should handle winter vs summer generation differences', () => {
      const config = {
        hasSolar: true,
        systemSizeKw: 5.0,
        tiltDegrees: 30.0,
        orientation: 'S',
      };
      
      const summerDate = new Date('2024-06-21'); // Summer solstice
      const winterDate = new Date('2024-12-21'); // Winter solstice
      
      const summerForecast = generateSolarForecast(config, summerDate);
      const winterForecast = generateSolarForecast(config, winterDate);
      
      const summerTotal = calculateTotalGeneration(summerForecast);
      const winterTotal = calculateTotalGeneration(winterForecast);
      
      // Summer should generate more than winter
      expect(summerTotal).toBeGreaterThan(winterTotal);
    });
  });
});
