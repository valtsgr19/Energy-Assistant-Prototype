/**
 * Onboarding Flow
 * 
 * Multi-step demo onboarding:
 * 1. Sign up / Login
 * 2. Energy account entry (demo)
 * 3. Solar system configuration
 * 4. Redirect to dashboard
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { onboardingApi } from '../api/onboarding';
import { parseError, ErrorDetails } from '../utils/errorHandler';
import ErrorMessage from '../components/ErrorMessage';

type OnboardingStep = 'auth' | 'energy-account' | 'solar';

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('auth');
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [loading, setLoading] = useState(false);

  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(false);

  // Energy account state
  const [energyAccountId, setEnergyAccountId] = useState('');
  const [energyAccountPassword, setEnergyAccountPassword] = useState('');

  // Solar state
  const [hasSolar, setHasSolar] = useState<boolean | null>(null);
  const [systemSizeKw, setSystemSizeKw] = useState('5.0');
  const [tiltDegrees, setTiltDegrees] = useState('30');
  const [orientation, setOrientation] = useState('N');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await authApi.login({ email, password });
      } else {
        await authApi.register({ email, password });
      }
      setCurrentStep('energy-account');
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEnergyAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // In demo mode, we accept any credentials
      // Just validate they're not empty
      if (!energyAccountId || !energyAccountPassword) {
        throw new Error('Please enter your energy account credentials');
      }

      // Skip actual linking in demo mode
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
        throw new Error('Please select whether you have solar panels');
      }

      // Configure solar system
      await onboardingApi.configureSolarSystem({
        hasSolar,
        systemSizeKw: hasSolar ? parseFloat(systemSizeKw) : undefined,
        tiltDegrees: hasSolar ? parseFloat(tiltDegrees) : undefined,
        orientation: hasSolar ? orientation : undefined,
      });

      // Redirect to dashboard
      navigate('/daily-assistant');
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const getStepNumber = () => {
    switch (currentStep) {
      case 'auth': return 1;
      case 'energy-account': return 2;
      case 'solar': return 3;
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
              <p className="text-xs text-blue-700">Exploring with simulated energy data</p>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className={`flex-1 h-2 rounded-full ${currentStep === 'auth' ? 'bg-blue-500' : 'bg-green-500'}`} />
            <div className={`flex-1 h-2 rounded-full mx-2 ${currentStep === 'energy-account' ? 'bg-blue-500' : currentStep === 'solar' ? 'bg-green-500' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 rounded-full ${currentStep === 'solar' ? 'bg-blue-500' : 'bg-gray-200'}`} />
          </div>
          <p className="text-sm text-gray-600 text-center">
            Step {getStepNumber()} of 3
          </p>
        </div>

        {error && (
          <div className="mb-4">
            <ErrorMessage 
              error={error} 
              onRetry={() => {
                if (currentStep === 'auth') handleAuthSubmit(new Event('submit') as any);
                else if (currentStep === 'energy-account') handleEnergyAccountSubmit(new Event('submit') as any);
                else handleSolarSubmit(new Event('submit') as any);
              }}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {/* Step 1: Authentication */}
        {currentStep === 'auth' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back!' : 'Welcome!'}
            </h1>
            <p className="text-gray-600 mb-6">
              {isLogin ? 'Sign in to continue' : 'Create an account to get started'}
            </p>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
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
                {!isLogin && (
                  <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading 
                  ? (isLogin ? 'Signing In...' : 'Creating Account...') 
                  : (isLogin ? 'Sign In' : 'Continue')}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Energy Account */}
        {currentStep === 'energy-account' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Energy Account</h1>
            <p className="text-gray-600 mb-6">
              Connect your energy provider account
            </p>

            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>Demo Mode:</strong> Enter any credentials to continue. In production, this would connect to your actual energy provider.
              </p>
            </div>

            <form onSubmit={handleEnergyAccountSubmit} className="space-y-4">
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

        {/* Step 3: Solar Configuration */}
        {currentStep === 'solar' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Solar System</h1>
            <p className="text-gray-600 mb-6">
              Tell us about your solar panels
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
                    <div className="text-sm text-gray-600">Configure system details</div>
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
                {loading ? 'Saving...' : 'Get Started'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
