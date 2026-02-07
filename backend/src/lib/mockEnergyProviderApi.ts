/**
 * Mock External Energy Provider API
 * 
 * This simulates an external energy provider's API for development purposes.
 * In production, this would be replaced with actual API calls to the energy provider.
 */

interface ValidationResult {
  success: boolean;
  message?: string;
}

// Mock valid accounts for testing
const MOCK_VALID_ACCOUNTS = new Map<string, string>([
  ['ACC001', 'password123'],
  ['ACC002', 'securepass456'],
  ['ACC003', 'energyuser789'],
  ['TEST123', 'testpass'],
]);

/**
 * Validates energy account credentials against the mock external API
 * 
 * @param energyAccountId - The energy account ID
 * @param energyAccountPassword - The energy account password
 * @returns Promise resolving to validation result
 */
export async function validateEnergyAccountCredentials(
  energyAccountId: string,
  energyAccountPassword: string
): Promise<ValidationResult> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // For development: Accept any account ID and password
  // In production, this would validate against real API
  if (!energyAccountId || !energyAccountPassword) {
    return {
      success: false,
      message: 'Account ID and password are required',
    };
  }
  
  // Auto-register any new account for development
  if (!MOCK_VALID_ACCOUNTS.has(energyAccountId)) {
    MOCK_VALID_ACCOUNTS.set(energyAccountId, energyAccountPassword);
  }
  
  // Validate password
  const storedPassword = MOCK_VALID_ACCOUNTS.get(energyAccountId);
  if (storedPassword !== energyAccountPassword) {
    return {
      success: false,
      message: 'Invalid credentials',
    };
  }
  
  return {
    success: true,
    message: 'Account validated successfully',
  };
}

/**
 * Adds a mock account for testing purposes
 * This is useful for tests that need specific account configurations
 * 
 * @param accountId - The account ID to add
 * @param password - The password for the account
 */
export function addMockAccount(accountId: string, password: string): void {
  MOCK_VALID_ACCOUNTS.set(accountId, password);
}

/**
 * Removes a mock account
 * 
 * @param accountId - The account ID to remove
 */
export function removeMockAccount(accountId: string): void {
  MOCK_VALID_ACCOUNTS.delete(accountId);
}

/**
 * Clears all mock accounts except the default ones
 */
export function resetMockAccounts(): void {
  MOCK_VALID_ACCOUNTS.clear();
  MOCK_VALID_ACCOUNTS.set('ACC001', 'password123');
  MOCK_VALID_ACCOUNTS.set('ACC002', 'securepass456');
  MOCK_VALID_ACCOUNTS.set('ACC003', 'energyuser789');
  MOCK_VALID_ACCOUNTS.set('TEST123', 'testpass');
}

/**
 * Retrieves consumption data for a date range
 * Generates mock half-hourly consumption data
 * 
 * @param energyAccountId - The energy account ID
 * @param startDate - Start date for data retrieval
 * @param endDate - End date for data retrieval
 * @returns Promise resolving to array of consumption data points
 */
export async function getConsumptionData(
  energyAccountId: string,
  startDate: Date,
  endDate: Date
): Promise<Array<{ timestamp: Date; consumptionKwh: number }>> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // For development: Accept any account ID
  // In production, this would validate against real API
  if (!energyAccountId) {
    throw new Error('Energy account ID is required');
  }

  const dataPoints: Array<{ timestamp: Date; consumptionKwh: number }> = [];
  const currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // Generate mock data for each half-hour interval
  while (currentDate <= end) {
    // Generate realistic consumption pattern
    const hour = currentDate.getHours();
    const minute = currentDate.getMinutes();
    const baseConsumption = getBaseConsumption(hour, minute);
    
    // Add some randomness (±10% for more realistic variation)
    const randomFactor = 0.9 + Math.random() * 0.2;
    const consumption = baseConsumption * randomFactor;

    dataPoints.push({
      timestamp: new Date(currentDate),
      consumptionKwh: Math.round(consumption * 100) / 100 // Round to 2 decimals
    });

    // Move to next half-hour interval
    currentDate.setMinutes(currentDate.getMinutes() + 30);
  }

  return dataPoints;
}

/**
 * Get base consumption for a given hour and half-hour interval
 * Uses realistic household consumption pattern
 */
function getBaseConsumption(hour: number, minute: number): number {
  // Specific pattern for each half-hour interval (48 intervals per day)
  const intervalIndex = hour * 2 + (minute >= 30 ? 1 : 0);
  
  // Realistic household consumption pattern (kWh per half-hour)
  const consumptionPattern = [
    0.25, 0.22, 0.20, 0.20, 0.20, 0.20, 0.20, 0.20, // 00:00-04:00 (1-8)
    0.22, 0.25, 0.30, 0.40, 0.60, 0.85, 1.10, 1.15, // 04:00-08:00 (9-16)
    0.90, 0.70, 0.50, 0.45, 0.40, 0.40, 0.35, 0.35, // 08:00-12:00 (17-24)
    0.35, 0.35, 0.40, 0.40, 0.45, 0.55, 0.65, 0.75, // 12:00-16:00 (25-32)
    0.90, 1.10, 1.40, 1.65, 1.80, 1.75, 1.60, 1.40, // 16:00-20:00 (33-40)
    1.20, 1.00, 0.80, 0.60, 0.45, 0.35, 0.30, 0.25  // 20:00-24:00 (41-48)
  ];
  
  return consumptionPattern[intervalIndex] || 0.4;
}

export const mockEnergyProviderApi = {
  validateEnergyAccountCredentials,
  getConsumptionData,
  addMockAccount,
  removeMockAccount,
  resetMockAccounts
};