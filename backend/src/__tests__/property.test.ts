import { describe, it } from '@jest/globals';
import * as fc from 'fast-check';

describe('Property-Based Testing Infrastructure', () => {
  it('should verify fast-check is working with basic property', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return n + 0 === n;
      }),
      { numRuns: 100 }
    );
  });

  it('should verify array reversal property', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const reversed = [...arr].reverse();
        const doubleReversed = [...reversed].reverse();
        return JSON.stringify(arr) === JSON.stringify(doubleReversed);
      }),
      { numRuns: 100 }
    );
  });
});
