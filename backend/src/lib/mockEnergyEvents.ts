/**
 * Mock Energy Events
 * 
 * Creates sample energy events for testing and development
 */

import { prisma } from './prisma.js';

export async function seedEnergyEvents() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Clear existing events
  await prisma.energyEvent.deleteMany({});

  const events = [];

  // Create events for the next 30 days, occurring every other day
  for (let dayOffset = 0; dayOffset < 30; dayOffset += 2) {
    const eventDate = new Date(today);
    eventDate.setDate(eventDate.getDate() + dayOffset);

    // Alternate between INCREASE and DECREASE events
    const isIncreaseEvent = (dayOffset / 2) % 2 === 0;

    if (isIncreaseEvent) {
      // Solar surplus event (11 AM - 1 PM)
      events.push({
        eventType: 'INCREASE_CONSUMPTION',
        startTime: new Date(eventDate.getTime() + 11 * 60 * 60 * 1000), // 11 AM
        endTime: new Date(eventDate.getTime() + 13 * 60 * 60 * 1000),   // 1 PM
        incentiveDescription: 'Solar Surplus Event - Use excess renewable energy',
        incentiveAmountDollars: 3.00,
        targetUserIds: 'ALL'
      });
    } else {
      // Evening peak reduction (9 PM - 10 PM)
      events.push({
        eventType: 'DECREASE_CONSUMPTION',
        startTime: new Date(eventDate.getTime() + 21 * 60 * 60 * 1000), // 9 PM
        endTime: new Date(eventDate.getTime() + 22 * 60 * 60 * 1000),   // 10 PM
        incentiveDescription: 'Evening Peak Reduction - Reduce consumption during high demand',
        incentiveAmountDollars: 4.50,
        targetUserIds: 'ALL'
      });
    }
  }

  for (const event of events) {
    await prisma.energyEvent.create({
      data: event
    });
  }

  console.log(`Seeded ${events.length} energy events (every other day for 30 days)`);
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedEnergyEvents()
    .then(() => {
      console.log('Energy events seeded successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error seeding energy events:', error);
      process.exit(1);
    });
}
