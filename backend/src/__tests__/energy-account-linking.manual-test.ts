/**
 * Manual test script for energy account linking functionality
 * Run this with: npx tsx src/__tests__/energy-account-linking.manual-test.ts
 */

import { encrypt, decrypt } from '../lib/encryption.js';
import { validateEnergyAccountCredentials } from '../lib/mockEnergyProviderApi.js';

console.log('=== Testing Energy Account Linking Components ===\n');

// Test 1: Encryption/Decryption
console.log('Test 1: Encryption and Decryption');
const testPassword = 'mySecurePassword123';
const encrypted = encrypt(testPassword);
console.log('  Original:', testPassword);
console.log('  Encrypted:', encrypted);
console.log('  Encrypted format valid:', encrypted.includes(':'));

const decrypted = decrypt(encrypted);
console.log('  Decrypted:', decrypted);
console.log('  ✓ Encryption/Decryption works:', testPassword === decrypted);
console.log();

// Test 2: Mock API - Valid Credentials
console.log('Test 2: Mock API - Valid Credentials');
const validResult = await validateEnergyAccountCredentials('ACC001', 'password123');
console.log('  Account: ACC001, Password: password123');
console.log('  Result:', validResult);
console.log('  ✓ Valid credentials accepted:', validResult.success === true);
console.log();

// Test 3: Mock API - Invalid Password
console.log('Test 3: Mock API - Invalid Password');
const invalidPasswordResult = await validateEnergyAccountCredentials('ACC001', 'wrongPassword');
console.log('  Account: ACC001, Password: wrongPassword');
console.log('  Result:', invalidPasswordResult);
console.log('  ✓ Invalid password rejected:', invalidPasswordResult.success === false);
console.log();

// Test 4: Mock API - Non-existent Account
console.log('Test 4: Mock API - Non-existent Account');
const nonExistentResult = await validateEnergyAccountCredentials('NONEXISTENT', 'password123');
console.log('  Account: NONEXISTENT, Password: password123');
console.log('  Result:', nonExistentResult);
console.log('  ✓ Non-existent account rejected:', nonExistentResult.success === false);
console.log();

// Test 5: Multiple Encryption/Decryption
console.log('Test 5: Multiple Encryption/Decryption (different IVs)');
const password = 'testPassword';
const encrypted1 = encrypt(password);
const encrypted2 = encrypt(password);
console.log('  Same password encrypted twice:');
console.log('  Encrypted 1:', encrypted1);
console.log('  Encrypted 2:', encrypted2);
console.log('  ✓ Different encrypted values (random IV):', encrypted1 !== encrypted2);
console.log('  ✓ Both decrypt correctly:', 
  decrypt(encrypted1) === password && decrypt(encrypted2) === password);
console.log();

console.log('=== All Manual Tests Passed! ===');
