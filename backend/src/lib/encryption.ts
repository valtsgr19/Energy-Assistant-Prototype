import crypto from 'crypto';

// Encryption key - in production, this should be stored securely (e.g., environment variable)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key!!';
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Encrypts a string using AES-256-CBC
 * @param text - The text to encrypt
 * @returns The encrypted text in format: iv:encryptedData
 */
export function encrypt(text: string): string {
  // Ensure the key is 32 bytes for AES-256
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  
  // Generate a random initialization vector
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return IV and encrypted data separated by colon
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a string that was encrypted with the encrypt function
 * @param encryptedText - The encrypted text in format: iv:encryptedData
 * @returns The decrypted text
 */
export function decrypt(encryptedText: string): string {
  // Ensure the key is 32 bytes for AES-256
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  
  // Split the IV and encrypted data
  const parts = encryptedText.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted text format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  // Decrypt the text
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
