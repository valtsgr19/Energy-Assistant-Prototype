import { PrismaClient } from '@prisma/client';
import { generateEnergyAdvice } from './src/lib/adviceGeneration.js';

const prisma = new PrismaClient();

async function test() {
  try {
    // Clean database
    await prisma.consumptionDataPoint.deleteMany({});
    await prisma.tariffPeriod.deleteMany({});
    await prisma.tariffStructure.deleteMany({});
    await prisma.electricVehicle.deleteMany({});
    await prisma.solarSystem.deleteMany({});
    await prisma.userProfile.deleteMany({});

    // Create user
    const user = await prisma.userProfile.create({
      data: {
        email: 'test@test.com',
        passwordHash: 'hash',
        energyAccountId: 'ACC001',
      },
    });

    console.log('Created user:', user.id);

    // Create solar system
    await prisma.solarSystem.create({
      data: {
        userId: user.id,
        hasSolar: false,
        systemSizeKw: null,
        tiltDegrees: null,
        orientation: null,
      },
    });

    console.log('Created solar system');

    // Create tariff
    const testDate = new Date();
    testDate.setHours(0, 0, 0, 0);
    
    await prisma.tariffStructure.create({
      data: {
        userId: user.id,
        effectiveDate: testDate,
        periods: {
          create: [
            {
              name: 'off-peak',
              startTime: '00:00',
              endTime: '07:00',
              pricePerKwh: 0.08,
              daysOfWeek: JSON.stringify(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']),
            },
            {
              name: 'shoulder',
              startTime: '07:00',
              endTime: '17:00',
              pricePerKwh: 0.15,
              daysOfWeek: JSON.stringify(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']),
            },
            {
              name: 'peak',
              startTime: '17:00',
              endTime: '21:00',
              pricePerKwh: 0.35,
              daysOfWeek: JSON.stringify(['MON', 'TUE', 'WED', 'THU', 'FRI']),
            },
            {
              name: 'off-peak',
              startTime: '21:00',
              endTime: '00:00',
              pricePerKwh: 0.08,
              daysOfWeek: JSON.stringify(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']),
            },
          ],
        },
      },
    });

    console.log('Created tariff');

    // Create consumption data
    const consumptionData = [];
    
    for (let i = 0; i < 48; i++) {
      const timestamp = new Date(testDate);
      timestamp.setHours(Math.floor(i / 2), (i % 2) * 30, 0, 0);
      
      consumptionData.push({
        userId: user.id,
        timestamp,
        consumptionKwh: 0.5,
      });
    }

    await prisma.consumptionDataPoint.createMany({
      data: consumptionData,
    });

    console.log('Created consumption data');

    // Create EV
    const ev = await prisma.electricVehicle.create({
      data: {
        userId: user.id,
        make: 'Tesla',
        model: 'Model 3',
        batteryCapacityKwh: 75,
        chargingSpeedKw: 11,
        averageDailyMiles: 40,
      },
    });

    console.log('Created EV:', ev.id);

    // Generate advice
    const advice = await generateEnergyAdvice(user.id, testDate);

    console.log('\n=== ADVICE RESULTS ===');
    console.log('General advice count:', advice.generalAdvice.length);
    console.log('EV advice count:', advice.evAdvice.length);
    console.log('Battery advice count:', advice.batteryAdvice.length);

    if (advice.generalAdvice.length > 0) {
      console.log('\n=== GENERAL ADVICE ===');
      advice.generalAdvice.forEach((a, i) => {
        console.log(`\n${i + 1}. ${a.title}`);
        console.log(`   Description: ${a.description}`);
        console.log(`   Time: ${a.recommendedTimeStart} - ${a.recommendedTimeEnd}`);
        console.log(`   Savings: $${a.estimatedSavings}`);
        console.log(`   Priority: ${a.priority}`);
      });
    }

    console.log('\n=== EV ADVICE ===');
    if (advice.evAdvice.length === 0) {
      console.log('No EV advice generated');
      
      // Check if EV exists
      const evs = await prisma.electricVehicle.findMany({ where: { userId: user.id } });
      console.log('EVs in database:', evs.length);
    } else {
      advice.evAdvice.forEach((a, i) => {
        console.log(`\n${i + 1}. ${a.title}`);
        console.log(`   Description: ${a.description}`);
        console.log(`   Time: ${a.recommendedTimeStart} - ${a.recommendedTimeEnd}`);
        console.log(`   Savings: $${a.estimatedSavings}`);
        console.log(`   Priority: ${a.priority}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
