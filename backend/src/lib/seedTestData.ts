/**
 * Seed Test Data
 * 
 * Creates realistic test data for development and testing
 */

import { prisma } from './prisma.js';

export async function seedTestData(userId: string, includeEV: boolean = false) {
  console.log('Seeding test data for user:', userId);
  console.log('Include EV charging:', includeEV);

  // Create solar system configuration
  await prisma.solarSystem.upsert({
    where: { userId },
    update: {
      hasSolar: true,
      systemSizeKw: 5.0,
      tiltDegrees: 30,
      orientation: 'N'
    },
    create: {
      userId,
      hasSolar: true,
      systemSizeKw: 5.0,
      tiltDegrees: 30,
      orientation: 'N'
    }
  });

  console.log('✅ Solar system configured');

  // Create consumption data for the last 30 days
  const now = new Date();
  const dataPoints = [];

  // Target consumption:
  // Without EV: 700 kWh/month (23.3 kWh/day, ~0.49 kWh per interval)
  // With EV: 900 kWh/month (30 kWh/day, ~0.63 kWh per interval)
  const targetDailyKwh = includeEV ? 30 : 23.3;

  for (let day = 0; day < 30; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);

    // Generate 48 half-hour intervals for each day
    for (let interval = 0; interval < 48; interval++) {
      const timestamp = new Date(date);
      timestamp.setMinutes(interval * 30);

      const hour = Math.floor(interval / 2);
      
      // Create realistic consumption patterns
      let consumption = 0.2; // Base load (always-on devices: fridge, router, etc.)

      // HVAC usage (moderate, mainly during day and evening)
      if (hour >= 8 && hour < 22) {
        consumption += 0.3 + Math.random() * 0.2; // 0.3-0.5 kWh
      }

      // Water heater peaks (morning and evening showers)
      if ((hour >= 6 && hour < 9) || (hour >= 18 && hour < 21)) {
        consumption += 0.4 + Math.random() * 0.2; // 0.4-0.6 kWh
      }

      // Cooking and discretionary usage (evening)
      if (hour >= 17 && hour < 21) {
        consumption += 0.3 + Math.random() * 0.3; // 0.3-0.6 kWh
      }

      // Occasional high usage (washing machine, dryer, dishwasher)
      if (hour >= 10 && hour < 20 && Math.random() > 0.85) {
        consumption += 0.5 + Math.random() * 0.5; // 0.5-1.0 kWh
      }

      // EV charging (overnight, if enabled)
      if (includeEV && (hour >= 23 || hour < 6)) {
        // Charge 3-4 nights per week
        if (Math.random() > 0.5) {
          consumption += 2.5 + Math.random() * 1.0; // 2.5-3.5 kWh (7kW charger for 30 min)
        }
      }

      // Add some random variation
      consumption += Math.random() * 0.1 - 0.05; // ±0.05 kWh
      
      // Ensure non-negative
      consumption = Math.max(0.1, consumption);

      dataPoints.push({
        userId,
        timestamp,
        consumptionKwh: consumption
      });
    }
  }

  // Delete existing consumption data for this user
  await prisma.consumptionDataPoint.deleteMany({
    where: { userId }
  });

  // Insert new consumption data in batches
  const batchSize = 100;
  for (let i = 0; i < dataPoints.length; i += batchSize) {
    const batch = dataPoints.slice(i, i + batchSize);
    await prisma.consumptionDataPoint.createMany({
      data: batch
    });
  }

  console.log(`✅ Created ${dataPoints.length} consumption data points`);

  // Create tariff structure
  // First, delete existing tariff structures for this user
  await prisma.tariffStructure.deleteMany({
    where: { userId }
  });

  // Create new tariff structure with periods
  // Weekdays: off-peak (22:00-06:00), shoulder (06:00-16:00), peak (16:00-22:00)
  // Weekends: off-peak (22:00-06:00), shoulder (06:00-22:00)
  await prisma.tariffStructure.create({
    data: {
      userId,
      effectiveDate: new Date(),
      periods: {
        create: [
          // Off-peak: All days 22:00-06:00
          {
            name: 'off-peak',
            startTime: '22:00',
            endTime: '06:00',
            pricePerKwh: 0.10,
            daysOfWeek: 'MON,TUE,WED,THU,FRI,SAT,SUN'
          },
          // Shoulder: Weekdays 06:00-16:00
          {
            name: 'shoulder',
            startTime: '06:00',
            endTime: '16:00',
            pricePerKwh: 0.20,
            daysOfWeek: 'MON,TUE,WED,THU,FRI'
          },
          // Shoulder: Weekends 06:00-22:00
          {
            name: 'shoulder',
            startTime: '06:00',
            endTime: '22:00',
            pricePerKwh: 0.20,
            daysOfWeek: 'SAT,SUN'
          },
          // Peak: Weekdays only 16:00-22:00
          {
            name: 'peak',
            startTime: '16:00',
            endTime: '22:00',
            pricePerKwh: 0.35,
            daysOfWeek: 'MON,TUE,WED,THU,FRI'
          }
        ]
      }
    }
  });

  console.log('✅ Tariff structure created');

  // Create energy events (at least 1 every 2 days for the next 30 days)
  // Delete existing events for this user
  await prisma.energyEvent.deleteMany({
    where: {
      targetUserIds: userId
    }
  });
  
  // One-time cleanup: delete old 'ALL' events (from before we made events user-specific)
  await prisma.energyEvent.deleteMany({
    where: {
      targetUserIds: 'ALL'
    }
  });

  const events = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create events for next 30 days (1 event every 2 days)
  for (let day = 0; day < 30; day += 2) {
    const eventDate = new Date(today);
    eventDate.setDate(eventDate.getDate() + day);
    
    // Alternate between INCREASE and DECREASE events
    // INCREASE: during solar generation (10:00-14:00)
    // DECREASE: during peak demand (18:00-22:00)
    const eventType = day % 4 === 0 ? 'INCREASE_CONSUMPTION' : 'DECREASE_CONSUMPTION';
    
    let startHour: number;
    let duration: number;
    
    if (eventType === 'INCREASE_CONSUMPTION') {
      // INCREASE events: 10:00-14:00, max 2 hours duration
      startHour = 10 + Math.floor(Math.random() * 3); // 10, 11, or 12
      duration = Math.random() < 0.5 ? 1 : 2; // 50% chance of 1 or 2 hours
      // Ensure event doesn't go past 14:00
      const endHour = startHour + duration;
      if (endHour > 14) {
        duration = 14 - startHour;
      }
    } else {
      // DECREASE events: 18:00-22:00, max 2 hours duration
      startHour = 18 + Math.floor(Math.random() * 3); // 18, 19, or 20
      duration = Math.random() < 0.5 ? 1 : 2; // 50% chance of 1 or 2 hours
      // Ensure event doesn't go past 22:00
      const endHour = startHour + duration;
      if (endHour > 22) {
        duration = 22 - startHour;
      }
    }
    
    const startTime = new Date(eventDate);
    startTime.setUTCHours(startHour, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setUTCHours(startTime.getUTCHours() + duration);
    
    events.push({
      eventType,
      startTime,
      endTime,
      incentiveDescription: eventType === 'DECREASE_CONSUMPTION' 
        ? 'Reduce your energy usage during peak demand to earn rewards'
        : 'Increase your energy usage during excess renewable generation',
      incentiveAmountDollars: 5.0 + Math.random() * 10.0, // $5-$15
      targetUserIds: userId // Target this specific user
    });
  }

  // Create events in database
  for (const event of events) {
    await prisma.energyEvent.create({
      data: event
    });
  }

  console.log(`✅ Created ${events.length} energy events`);

  console.log('✅ Test data seeding complete!');
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const userId = process.argv[2];
  const includeEV = process.argv[3] === 'true' || process.argv[3] === 'ev';
  
  if (!userId) {
    console.error('Usage: npx tsx src/lib/seedTestData.ts <userId> [ev]');
    console.error('Example: npx tsx src/lib/seedTestData.ts abc-123-def');
    console.error('Example with EV: npx tsx src/lib/seedTestData.ts abc-123-def ev');
    process.exit(1);
  }

  seedTestData(userId, includeEV)
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error seeding test data:', error);
      process.exit(1);
    });
}
