/**
 * Onboarding Flow
 * 
 * Simplified onboarding with auto-seeding:
 * 1. Sign up / Login
 * 2. Auto-seed demo data
 * 3. Redirect to dashboard
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { parseError, ErrorDetails } from '../utils/errorHandler';
import ErrorMessage from '../components/ErrorMessage';

type AuthMode = 'signup' | 'login';

export default function Onboarding() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('signup');
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [loading, setLoading] = useState(false);

  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        // Register new user - backend will auto-seed demo data
        await authApi.register({ email, password });
      } else {
        // Login existing user
        await authApi.login({ email, password });
      }

      // Redirect to dashboard
      navigate('/daily-assistant');
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Demo Mode Banner */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🎭</span>
            <div>
              <p className="text-sm font-medium text-blue-900">Demo Mode</p>
              <p className="text-xs text-blue-700">Sign up to explore with simulated energy data</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4">
            <ErrorMessage 
              error={error} 
              onRetry={() => handleSubmit(new Event('submit') as any)}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {mode === 'signup' ? 'Welcome!' : 'Welcome Back!'}
          </h1>
          <p className="text-gray-600 mb-6">
            {mode === 'signup' 
              ? 'Create an account to start exploring your energy usage' 
              : 'Sign in to continue'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
              {mode === 'signup' && (
                <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? (mode === 'signup' ? 'Creating Account...' : 'Signing In...') 
                : (mode === 'signup' ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setMode(mode === 'signup' ? 'login' : 'signup');
                setError(null);
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {mode === 'signup' 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"}
            </button>
          </div>

          {mode === 'signup' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                By signing up, you'll get instant access to a demo with:
              </p>
              <ul className="mt-2 space-y-1 text-xs text-gray-600">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  30 days of simulated energy data
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Solar system with realistic generation
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Time-of-use tariff structure
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Personalized energy-saving advice
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
