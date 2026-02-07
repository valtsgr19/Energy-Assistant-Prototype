/**
 * Error Message Component
 * 
 * Displays user-friendly error messages with retry option
 */

import { ErrorDetails } from '../utils/errorHandler';

interface ErrorMessageProps {
  error: ErrorDetails | string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function ErrorMessage({ error, onRetry, onDismiss }: ErrorMessageProps) {
  const errorDetails = typeof error === 'string' 
    ? { message: error, type: 'unknown' as const, retryable: false }
    : error;

  const getIcon = () => {
    switch (errorDetails.type) {
      case 'network':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
        );
      case 'authentication':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      case 'validation':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getBackgroundColor = () => {
    switch (errorDetails.type) {
      case 'network':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'authentication':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'validation':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  return (
    <div className={`p-4 border rounded-md ${getBackgroundColor()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium whitespace-pre-line">
            {errorDetails.message}
          </p>
          {errorDetails.retryable && onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium underline hover:no-underline focus:outline-none"
            >
              Try Again
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-3 flex-shrink-0 focus:outline-none"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
