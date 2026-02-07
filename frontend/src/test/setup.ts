import '@testing-library/jest-dom';
import { afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock localStorage
const localStorageMock = {
  getItem: (_key: string) => null,
  setItem: (_key: string, _value: string) => {},
  removeItem: (_key: string) => {},
  clear: () => {},
};

beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});
