import { StorageService } from './StorageService';
import { InMemoryStorageService } from './InMemoryStorageService';

/**
 * Initialize and return the appropriate storage service based on configuration.
 */
export function createStorageService(): StorageService {
  const storageMode = process.env.STORAGE_MODE || 'memory';

  if (storageMode === 'memory') {
    console.log('📦 Using in-memory storage');
    return new InMemoryStorageService();
  }

  // PostgreSQL mode would be implemented here
  throw new Error(`Unsupported storage mode: ${storageMode}`);
}

export { StorageService } from './StorageService';
export { InMemoryStorageService } from './InMemoryStorageService';
