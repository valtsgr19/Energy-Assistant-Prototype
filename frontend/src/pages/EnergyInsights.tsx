/**
 * Energy Insights View
 * 
 * Displays consumption disaggregation, solar performance, and household comparison
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { energyInsightsApi, EnergyInsightsResponse } from '../api/energyInsights';
import { apiClient } from '../api/client';
import BottomNav from '../components/BottomNav';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { parseError, ErrorDetails } from '../utils/errorHandler';

export default function EnergyInsights() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<EnergyInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorDetails | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!apiClient.getToken()) {
      navigate('/onboarding');
      return;
    }

    loadInsights();
  }, [navigate]);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await energyInsightsApi.getInsights();
      setInsights(data);
    } catch (err) {
      const errorDetails = parseError(err);
      setError(errorDetails);
      
      if (errorDetails.type === 'authentication') {
        setTimeout(() => navigate('/onboarding'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your energy insights..." fullScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorMessage error={error} onRetry={loadInsights} />
        </div>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  const { disaggregation, solarPerformance, householdComparison } = insights;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Demo Mode Banner */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2">
          <div className="flex items-center justify-center gap-2 text-sm text-blue-800">
            <span className="text-lg">🎭</span>
            <span className="font-medium">Demo Mode</span>
            <span className="hidden sm:inline">- Exploring with simulated energy data</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Energy Insights</h1>
              <p className="text-xs sm:text-sm text-gray-600">Understand your energy usage patterns</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Consumption Disaggregation */}
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Energy Usage Breakdown</h2>
              <p className="text-sm text-gray-600">Last 30 days</p>
            </div>
          </div>

          {disaggregation.totalKwh > 0 ? (
            <>
              <div className="space-y-3 mb-4">
                <UsageBar 
                  label="Heating & Cooling" 
                  kwh={disaggregation.heatingCoolingKwh} 
                  percentage={disaggregation.heatingCoolingPercentage}
                  color="bg-orange-500"
                  description="Largest energy consumer"
                />
                <UsageBar 
                  label="Hot Water Systems" 
                  kwh={disaggregation.hotWaterKwh} 
                  percentage={disaggregation.hotWaterPercentage}
                  color="bg-red-500"
                  description="Major consistent contributor"
                />
                <UsageBar 
                  label="Appliances & Equipment" 
                  kwh={disaggregation.appliancesKwh} 
                  percentage={disaggregation.appliancesPercentage}
                  color="bg-blue-500"
                  description="Fridges, dryers, TVs, etc."
                />
                <div className="ml-6 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>• Fridges/Freezers</span>
                    <span>{disaggregation.fridgeFreezerPercentage.toFixed(0)}% ({disaggregation.fridgeFreezerKwh.toFixed(1)} kWh)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Clothes Dryers</span>
                    <span>{disaggregation.clothesDryerPercentage.toFixed(0)}% ({disaggregation.clothesDryerKwh.toFixed(1)} kWh)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• TVs & Electronics</span>
                    <span>{disaggregation.tvElectronicsPercentage.toFixed(0)}% ({disaggregation.tvElectronicsKwh.toFixed(1)} kWh)</span>
                  </div>
                </div>
                <UsageBar 
                  label="Lighting & Others" 
                  kwh={disaggregation.lightingOtherKwh} 
                  percentage={disaggregation.lightingOtherPercentage}
                  color="bg-yellow-500"
                  description="Lighting and miscellaneous"
                />
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-700">Total Consumption</span>
                  <span className="text-gray-900">{disaggregation.totalKwh.toFixed(1)} kWh</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-600 text-center py-8">No consumption data available for the last 30 days</p>
          )}
        </div>

        {/* Solar Performance */}
        {solarPerformance && (
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Solar Performance</h2>
                <p className="text-sm text-gray-600">Last 30 days</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <MetricCard 
                label="Total Generation" 
                value={`${solarPerformance.totalGenerationKwh.toFixed(1)} kWh`}
                icon="☀️"
              />
              <MetricCard 
                label="Self-Consumption" 
                value={`${solarPerformance.selfConsumptionPercentage.toFixed(0)}%`}
                icon="🏠"
              />
              <MetricCard 
                label="Grid Export" 
                value={`${solarPerformance.totalExportKwh.toFixed(1)} kWh`}
                icon="⚡"
              />
              <MetricCard 
                label="Export Rate" 
                value={`${solarPerformance.exportPercentage.toFixed(0)}%`}
                icon="📊"
              />
            </div>

            {solarPerformance.recommendations.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Recommendations</h3>
                <ul className="space-y-2">
                  {solarPerformance.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-700">
                      <svg className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Household Comparison */}
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Household Comparison</h2>
              <p className="text-sm text-gray-600">How you compare</p>
            </div>
          </div>

          {/* Energy Personality */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex items-center mb-2">
              <span className="text-4xl mr-3">{householdComparison.personality.visual}</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{householdComparison.personality.personality.replace(/_/g, ' ')}</h3>
                <p className="text-sm text-gray-700">{householdComparison.personality.description}</p>
              </div>
            </div>
          </div>

          {/* Comparison Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Your Average</p>
              <p className="text-lg font-semibold text-gray-900">{householdComparison.userAverageDailyKwh.toFixed(1)} kWh/day</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Similar Households</p>
              <p className="text-lg font-semibold text-gray-900">{householdComparison.similarHouseholdAverageKwh.toFixed(1)} kWh/day</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">Comparison</span>
              <span className={`text-sm font-medium ${householdComparison.comparisonPercentage > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {householdComparison.comparisonPercentage > 0 ? '+' : ''}{householdComparison.comparisonPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${householdComparison.comparisonPercentage > 0 ? 'bg-orange-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(Math.abs(householdComparison.comparisonPercentage), 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {householdComparison.comparisonPercentage > 0 
                ? 'You use more energy than similar households' 
                : 'You use less energy than similar households'}
            </p>
          </div>

          {/* Event History */}
          {householdComparison.eventHistory.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Energy Event History</h3>
              <div className="space-y-2">
                {householdComparison.eventHistory.slice(0, 5).map((event) => (
                  <div key={event.eventId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center flex-1 min-w-0">
                      <span className="text-lg mr-2">
                        {event.eventType === 'INCREASE_CONSUMPTION' ? '↑' : '↓'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{event.eventDate}</p>
                        <p className="text-xs text-gray-600">
                          {event.performanceDeltaKwh > 0 ? '+' : ''}{event.performanceDeltaKwh.toFixed(2)} kWh
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-green-600 ml-2">
                      ${event.incentiveEarned.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

interface UsageBarProps {
  label: string;
  kwh: number;
  percentage: number;
  color: string;
  description?: string;
}

function UsageBar({ label, kwh, percentage, color, description }: UsageBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {description && <span className="text-xs text-gray-500 ml-2">({description})</span>}
        </div>
        <span className="text-sm text-gray-600">{kwh.toFixed(1)} kWh ({percentage.toFixed(0)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: string;
}

function MetricCard({ label, value, icon }: MetricCardProps) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center mb-1">
        <span className="text-lg mr-2">{icon}</span>
        <p className="text-xs text-gray-600">{label}</p>
      </div>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}
