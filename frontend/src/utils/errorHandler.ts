/**
 * Error Handling Utilities
 * 
 * Provides user-friendly error messages and retry logic
 */

export interface ErrorDetails {
  message: string;
  type: 'network' | 'validation' | 'authentication' | 'server' | 'unknown';
  retryable: boolean;
  statusCode?: number;
}

/**
 * Parse error and return user-friendly message with details
 */
export function parseError(error: unknown): ErrorDetails {
  // Network errors (fetch failed, no internet, etc.)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      type: 'network',
      retryable: true,
    };
  }

  // Error object with message
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Authentication errors
    if (message.includes('unauthorized') || message.includes('invalid credentials')) {
      return {
        message: 'Invalid email or password. Please check your credentials and try again.',
        type: 'authentication',
        retryable: false,
      };
    }

    if (message.includes('already registered')) {
      return {
        message: 'This email is already registered. Please login instead or use a different email.',
        type: 'validation',
        retryable: false,
      };
    }

    if (message.includes('token') || message.includes('session expired')) {
      return {
        message: 'Your session has expired. Please login again.',
        type: 'authentication',
        retryable: false,
      };
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid')) {
      return {
        message: error.message,
        type: 'validation',
        retryable: false,
      };
    }

    // Network timeout
    if (message.includes('timeout') || message.includes('aborted')) {
      return {
        message: 'Request timed out. The server is taking too long to respond. Please try again.',
        type: 'network',
        retryable: true,
      };
    }

    // Server errors
    if (message.includes('internal server error') || message.includes('500')) {
      return {
        message: 'Something went wrong on our end. Please try again in a few moments.',
        type: 'server',
        retryable: true,
      };
    }

    // Generic error with message
    return {
      message: error.message,
      type: 'unknown',
      retryable: true,
    };
  }

  // Unknown error type
  return {
    message: 'An unexpected error occurred. Please try again.',
    type: 'unknown',
    retryable: true,
  };
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const errorDetails = parseError(error);

      // Don't retry if error is not retryable
      if (!errorDetails.retryable) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        throw error;
      }

      // Wait with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Check if user is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Format validation errors from Zod
 */
export function formatValidationErrors(errors: Array<{ path: string[]; message: string }>): string {
  if (errors.length === 0) return 'Validation failed';
  if (errors.length === 1) return errors[0].message;
  
  return 'Please fix the following errors:\n' + errors.map(e => `• ${e.message}`).join('\n');
}
