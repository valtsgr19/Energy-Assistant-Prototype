/**
 * EV Battery Capacity Lookup
 * 
 * Provides battery capacity inference for common EV makes and models.
 * Battery capacities are approximate usable capacity in kWh.
 */

interface EVBatteryData {
  make: string;
  model: string;
  batteryCapacityKwh: number;
}

// Common EV battery capacities (usable capacity)
const EV_BATTERY_DATABASE: EVBatteryData[] = [
  // Tesla
  { make: 'Tesla', model: 'Model 3 Standard Range', batteryCapacityKwh: 54 },
  { make: 'Tesla', model: 'Model 3 Long Range', batteryCapacityKwh: 75 },
  { make: 'Tesla', model: 'Model 3 Performance', batteryCapacityKwh: 75 },
  { make: 'Tesla', model: 'Model Y Standard Range', batteryCapacityKwh: 54 },
  { make: 'Tesla', model: 'Model Y Long Range', batteryCapacityKwh: 75 },
  { make: 'Tesla', model: 'Model Y Performance', batteryCapacityKwh: 75 },
  { make: 'Tesla', model: 'Model S', batteryCapacityKwh: 95 },
  { make: 'Tesla', model: 'Model X', batteryCapacityKwh: 95 },
  
  // Chevrolet
  { make: 'Chevrolet', model: 'Bolt EV', batteryCapacityKwh: 60 },
  { make: 'Chevrolet', model: 'Bolt EUV', batteryCapacityKwh: 60 },
  
  // Nissan
  { make: 'Nissan', model: 'Leaf', batteryCapacityKwh: 40 },
  { make: 'Nissan', model: 'Leaf Plus', batteryCapacityKwh: 60 },
  { make: 'Nissan', model: 'Ariya', batteryCapacityKwh: 63 },
  
  // Ford
  { make: 'Ford', model: 'Mustang Mach-E Standard Range', batteryCapacityKwh: 68 },
  { make: 'Ford', model: 'Mustang Mach-E Extended Range', batteryCapacityKwh: 88 },
  { make: 'Ford', model: 'F-150 Lightning Standard Range', batteryCapacityKwh: 98 },
  { make: 'Ford', model: 'F-150 Lightning Extended Range', batteryCapacityKwh: 131 },
  
  // Volkswagen
  { make: 'Volkswagen', model: 'ID.4', batteryCapacityKwh: 77 },
  { make: 'Volkswagen', model: 'ID.4 Pro', batteryCapacityKwh: 77 },
  
  // Hyundai
  { make: 'Hyundai', model: 'Ioniq 5 Standard Range', batteryCapacityKwh: 58 },
  { make: 'Hyundai', model: 'Ioniq 5 Long Range', batteryCapacityKwh: 77 },
  { make: 'Hyundai', model: 'Kona Electric', batteryCapacityKwh: 64 },
  
  // Kia
  { make: 'Kia', model: 'EV6 Standard Range', batteryCapacityKwh: 58 },
  { make: 'Kia', model: 'EV6 Long Range', batteryCapacityKwh: 77 },
  { make: 'Kia', model: 'Niro EV', batteryCapacityKwh: 64 },
  
  // BMW
  { make: 'BMW', model: 'i3', batteryCapacityKwh: 37 },
  { make: 'BMW', model: 'i4 eDrive40', batteryCapacityKwh: 80 },
  { make: 'BMW', model: 'iX xDrive50', batteryCapacityKwh: 105 },
  
  // Audi
  { make: 'Audi', model: 'e-tron', batteryCapacityKwh: 86 },
  { make: 'Audi', model: 'e-tron GT', batteryCapacityKwh: 84 },
  { make: 'Audi', model: 'Q4 e-tron', batteryCapacityKwh: 77 },
  
  // Mercedes-Benz
  { make: 'Mercedes-Benz', model: 'EQS', batteryCapacityKwh: 107 },
  { make: 'Mercedes-Benz', model: 'EQE', batteryCapacityKwh: 90 },
  
  // Rivian
  { make: 'Rivian', model: 'R1T', batteryCapacityKwh: 135 },
  { make: 'Rivian', model: 'R1S', batteryCapacityKwh: 135 },
  
  // Polestar
  { make: 'Polestar', model: 'Polestar 2 Standard Range', batteryCapacityKwh: 64 },
  { make: 'Polestar', model: 'Polestar 2 Long Range', batteryCapacityKwh: 78 },
];

/**
 * Infer battery capacity from EV make and model
 * Uses fuzzy matching to find the closest match in the database
 * 
 * @param make - EV manufacturer
 * @param model - EV model name
 * @returns Battery capacity in kWh, or null if not found
 */
export function inferBatteryCapacity(make: string, model: string): number | null {
  const makeLower = make.toLowerCase().trim();
  const modelLower = model.toLowerCase().trim();
  
  // Try exact match first
  const exactMatch = EV_BATTERY_DATABASE.find(
    ev => ev.make.toLowerCase() === makeLower && ev.model.toLowerCase() === modelLower
  );
  
  if (exactMatch) {
    return exactMatch.batteryCapacityKwh;
  }
  
  // Try partial match on make and model
  const partialMatch = EV_BATTERY_DATABASE.find(
    ev => ev.make.toLowerCase() === makeLower && ev.model.toLowerCase().includes(modelLower)
  );
  
  if (partialMatch) {
    return partialMatch.batteryCapacityKwh;
  }
  
  // Try fuzzy match on model only (for same make)
  const sameMakeMatches = EV_BATTERY_DATABASE.filter(
    ev => ev.make.toLowerCase() === makeLower
  );
  
  if (sameMakeMatches.length > 0) {
    // Find the model with the most similar name
    const fuzzyMatch = sameMakeMatches.find(
      ev => modelLower.includes(ev.model.toLowerCase().split(' ')[0])
    );
    
    if (fuzzyMatch) {
      return fuzzyMatch.batteryCapacityKwh;
    }
  }
  
  // No match found
  return null;
}

/**
 * Get all available EV makes
 */
export function getAvailableMakes(): string[] {
  const makes = new Set(EV_BATTERY_DATABASE.map(ev => ev.make));
  return Array.from(makes).sort();
}

/**
 * Get all available models for a specific make
 */
export function getAvailableModels(make: string): string[] {
  const makeLower = make.toLowerCase().trim();
  const models = EV_BATTERY_DATABASE
    .filter(ev => ev.make.toLowerCase() === makeLower)
    .map(ev => ev.model);
  return models.sort();
}

/**
 * Get default battery capacity if inference fails
 * Returns a reasonable default based on vehicle type
 */
export function getDefaultBatteryCapacity(model: string): number {
  const modelLower = model.toLowerCase();
  
  // Trucks and large SUVs
  if (modelLower.includes('truck') || modelLower.includes('f-150') || 
      modelLower.includes('r1t') || modelLower.includes('r1s')) {
    return 100;
  }
  
  // Large sedans and SUVs
  if (modelLower.includes('model s') || modelLower.includes('model x') || 
      modelLower.includes('eqs') || modelLower.includes('ix')) {
    return 90;
  }
  
  // Mid-size vehicles (most common)
  return 65;
}
