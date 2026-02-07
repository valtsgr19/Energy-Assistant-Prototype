-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "energyAccountId" TEXT,
    "energyAccountCredentials" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" DATETIME
);

-- CreateTable
CREATE TABLE "SolarSystem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "hasSolar" BOOLEAN NOT NULL DEFAULT false,
    "systemSizeKw" REAL,
    "tiltDegrees" REAL,
    "orientation" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SolarSystem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ElectricVehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "batteryCapacityKwh" REAL NOT NULL,
    "chargingSpeedKw" REAL NOT NULL DEFAULT 7.0,
    "averageDailyMiles" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ElectricVehicle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HomeBattery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "powerKw" REAL NOT NULL,
    "capacityKwh" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HomeBattery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConsumptionDataPoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "consumptionKwh" REAL NOT NULL,
    "retrievedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConsumptionDataPoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TariffStructure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "effectiveDate" DATETIME NOT NULL,
    CONSTRAINT "TariffStructure_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TariffPeriod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tariffStructureId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "pricePerKwh" REAL NOT NULL,
    "daysOfWeek" TEXT NOT NULL,
    CONSTRAINT "TariffPeriod_tariffStructureId_fkey" FOREIGN KEY ("tariffStructureId") REFERENCES "TariffStructure" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SolarForecast" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "forecastDate" DATETIME NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SolarForecast_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SolarInterval" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "solarForecastId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "generationKwh" REAL NOT NULL,
    CONSTRAINT "SolarInterval_solarForecastId_fkey" FOREIGN KEY ("solarForecastId") REFERENCES "SolarForecast" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EnergyAdvice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "adviceType" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "recommendedTimeStart" TEXT,
    "recommendedTimeEnd" TEXT,
    "estimatedSavingsDollars" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EnergyAdvice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EnergyEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "incentiveDescription" TEXT NOT NULL,
    "incentiveAmountDollars" REAL NOT NULL,
    "targetUserIds" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EventParticipation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "baselineConsumptionKwh" REAL NOT NULL,
    "actualConsumptionKwh" REAL NOT NULL,
    "performanceDeltaKwh" REAL NOT NULL,
    "earnedIncentiveDollars" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventParticipation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "EnergyEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SolarSystem_userId_key" ON "SolarSystem"("userId");

-- CreateIndex
CREATE INDEX "ConsumptionDataPoint_userId_timestamp_idx" ON "ConsumptionDataPoint"("userId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "ConsumptionDataPoint_userId_timestamp_key" ON "ConsumptionDataPoint"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "TariffStructure_userId_effectiveDate_idx" ON "TariffStructure"("userId", "effectiveDate");

-- CreateIndex
CREATE INDEX "SolarForecast_userId_forecastDate_idx" ON "SolarForecast"("userId", "forecastDate");

-- CreateIndex
CREATE UNIQUE INDEX "SolarForecast_userId_forecastDate_key" ON "SolarForecast"("userId", "forecastDate");

-- CreateIndex
CREATE INDEX "EnergyAdvice_userId_date_idx" ON "EnergyAdvice"("userId", "date");

-- CreateIndex
CREATE INDEX "EnergyEvent_startTime_endTime_idx" ON "EnergyEvent"("startTime", "endTime");

-- CreateIndex
CREATE INDEX "EventParticipation_userId_idx" ON "EventParticipation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventParticipation_userId_eventId_key" ON "EventParticipation"("userId", "eventId");
