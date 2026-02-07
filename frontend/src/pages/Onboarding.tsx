/**
 * Onboarding Flow
 * 
 * Multi-step onboarding process:
 * 1. Energy account login
 * 2. Solar system configuration
 * 3. Product explanation
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { onboardingApi } from '../api/onboarding';
import { parseError, ErrorDetails } from '../utils/errorHandler';
import ErrorMessage from '../components/ErrorMessage';

type OnboardingStep = 'account' | 'solar' | 'explanation';

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('account');
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [loading, setLoading] = useState(false);

  // Account step state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [energyAccountId, setEnergyAccountId] = useState('');
  const [energyAccountPassword, setEnergyAccountPassword] = useState('');

  // Solar step state
  const [hasSolar, setHasSolar] = useState<boolean | null>(null);
  const [systemSizeKw, setSystemSizeKw] = useState('');
  const [tiltDegrees, setTiltDegrees] = useState('');
  const [orientation, setOrientation] = useState('');

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Try to register first
      try {
        await authApi.register({ email, password });
      } catch (registerError) {
        // If email already registered, try to login instead
        const errorDetails = parseError(registerError);
        if (errorDetails.message.includes('already registered')) {
          await authApi.login({ email, password });
        } else {
          throw registerError;
        }
      }

      // Link energy account
      await authApi.linkEnergyAccount({
        energyAccountId,
        energyAccountPassword,
      });

      setCurrentStep('solar');
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSolarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (hasSolar === null) {
        setError({
          message: 'Please select whether you have solar panels',
          type: 'validation',
          retryable: false,
        });
        setLoading(false);
        return;
      }

      // Configure solar system
      await onboardingApi.configureSolarSystem({
        hasSolar,
        systemSizeKw: hasSolar ? parseFloat(systemSizeKw) : undefined,
        tiltDegrees: hasSolar ? parseFloat(tiltDegrees) : undefined,
        orientation: hasSolar ? orientation : undefined,
      });

      // Set up default tariff structure
      const today = new Date().toISOString().split('T')[0];
      const tariffResponse = await fetch('http://localhost:3001/api/tariff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          effectiveDate: today,
          periods: [
            {
              name: 'off-peak',
              startTime: '00:00',
              endTime: '07:00',
              pricePerKwh: 0.08,
              daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
            },
            {
              name: 'shoulder',
              startTime: '07:00',
              endTime: '17:00',
              pricePerKwh: 0.15,
              daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
            },
            {
              name: 'peak',
              startTime: '17:00',
              endTime: '21:00',
              pricePerKwh: 0.35,
              daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI']
            },
            {
              name: 'off-peak',
              startTime: '21:00',
              endTime: '00:00',
              pricePerKwh: 0.08,
              daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
            }
          ]
        })
      });

      if (!tariffResponse.ok) {
        console.error('Failed to set up tariff:', await tariffResponse.text());
      }

      // Sync consumption data
      const syncResponse = await fetch('http://localhost:3001/api/consumption/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ days: 7 })
      });

      if (!syncResponse.ok) {
        console.error('Failed to sync consumption data:', await syncResponse.text());
      }

      setCurrentStep('explanation');
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    navigate('/daily-assistant');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className={`flex-1 h-2 rounded-full ${currentStep === 'account' ? 'bg-blue-500' : 'bg-green-500'}`} />
            <div className={`flex-1 h-2 rounded-full mx-2 ${currentStep === 'solar' ? 'bg-blue-500' : currentStep === 'explanation' ? 'bg-green-500' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 rounded-full ${currentStep === 'explanation' ? 'bg-blue-500' : 'bg-gray-200'}`} />
          </div>
          <p className="text-sm text-gray-600 text-center">
            Step {currentStep === 'account' ? '1' : currentStep === 'solar' ? '2' : '3'} of 3
          </p>
        </div>

        {error && (
          <div className="mb-4">
            <ErrorMessage 
              error={error} 
              onRetry={currentStep === 'account' ? () => handleAccountSubmit(new Event('submit') as any) : () => handleSolarSubmit(new Event('submit') as any)}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {/* Account Step */}
        {currentStep === 'account' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h1>
            <p className="text-gray-600 mb-6">
              Let's get started by connecting your energy account
            </p>

            <form onSubmit={handleAccountSubmit} className="space-y-4">
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
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Energy Provider Account
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account ID
                    </label>
                    <input
                      type="text"
                      value={energyAccountId}
                      onChange={(e) => setEnergyAccountId(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ACC123456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Password
                    </label>
                    <input
                      type="password"
                      value={energyAccountPassword}
                      onChange={(e) => setEnergyAccountPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Connecting...' : 'Continue'}
              </button>
            </form>
          </div>
        )}

        {/* Solar Step */}
        {currentStep === 'solar' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Solar System</h1>
            <p className="text-gray-600 mb-6">
              Tell us about your solar panels (if you have them)
            </p>

            <form onSubmit={handleSolarSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Do you have solar panels?
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setHasSolar(true)}
                    className={`w-full px-4 py-3 border-2 rounded-md text-left transition-colors ${
                      hasSolar === true
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium">Yes, I have solar panels</div>
                    <div className="text-sm text-gray-600">I'll provide system details</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasSolar(false)}
                    className={`w-full px-4 py-3 border-2 rounded-md text-left transition-colors ${
                      hasSolar === false
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium">No, I don't have solar</div>
                    <div className="text-sm text-gray-600">Skip solar configuration</div>
                  </button>
                </div>
              </div>

              {hasSolar === true && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      System Size (kW)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="100"
                      value={systemSizeKw}
                      onChange={(e) => setSystemSizeKw(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5.0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Panel Tilt (degrees)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="90"
                      value={tiltDegrees}
                      onChange={(e) => setTiltDegrees(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Orientation
                    </label>
                    <select
                      value={orientation}
                      onChange={(e) => setOrientation(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select orientation</option>
                      <option value="N">North</option>
                      <option value="NE">Northeast</option>
                      <option value="E">East</option>
                      <option value="SE">Southeast</option>
                      <option value="S">South</option>
                      <option value="SW">Southwest</option>
                      <option value="W">West</option>
                      <option value="NW">Northwest</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || hasSolar === null}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Continue'}
              </button>
            </form>
          </div>
        )}

        {/* Explanation Step */}
        {currentStep === 'explanation' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h1>
            <p className="text-gray-600 mb-6">
              Here's how the Energy Usage Assistant helps you save money
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Smart Energy Timing</h3>
                  <p className="text-sm text-gray-600">
                    We show you the best times to use electricity based on your tariff and solar generation
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Solar Optimization</h3>
                  <p className="text-sm text-gray-600">
                    {hasSolar 
                      ? 'Maximize your solar usage by scheduling activities during peak generation'
                      : 'Track your consumption patterns and get personalized energy-saving tips'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Actionable Advice</h3>
                  <p className="text-sm text-gray-600">
                    Get up to 3 personalized recommendations daily to reduce your energy costs
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
