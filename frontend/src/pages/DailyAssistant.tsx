/**
 * Daily Assistant View
 * 
 * Displays 24-hour energy chart with solar generation, consumption,
 * and pricing data, along with personalized energy advice.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dailyAssistantApi, ChartDataResponse, AdviceResponse } from '../api/dailyAssistant';
import { apiClient } from '../api/client';
import EnergyChart from '../components/EnergyChart.tsx';
import CurrentStatus from '../components/CurrentStatus.tsx';
import UpcomingEnergyEvent from '../components/UpcomingEnergyEvent.tsx';
import AdviceList from '../components/AdviceList.tsx';
import BottomNav from '../components/BottomNav';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { parseError, ErrorDetails } from '../utils/errorHandler';

export default function DailyAssistant() {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>('today');
  const [chartData, setChartData] = useState<ChartDataResponse | null>(null);
  const [advice, setAdvice] = useState<AdviceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorDetails | null>(null);
  const lastRefreshDate = useRef<string>(new Date().toDateString());
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const midnightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!apiClient.getToken()) {
      navigate('/onboarding');
      return;
    }

    loadData();

    // Set up periodic refresh every 15 minutes
    refreshIntervalRef.current = setInterval(() => {
      loadData();
    }, 15 * 60 * 1000); // 15 minutes

    // Set up midnight refresh
    setupMidnightRefresh();

    // Set up visibility change listener
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Check if date has changed while tab was hidden
        const currentDate = new Date().toDateString();
        if (currentDate !== lastRefreshDate.current) {
          lastRefreshDate.current = currentDate;
          loadData();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (midnightTimeoutRef.current) {
        clearTimeout(midnightTimeoutRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedDay, navigate]);

  const setupMidnightRefresh = () => {
    // Clear existing timeout
    if (midnightTimeoutRef.current) {
      clearTimeout(midnightTimeoutRef.current);
    }

    // Calculate time until midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    // Set timeout to refresh at midnight
    midnightTimeoutRef.current = setTimeout(() => {
      lastRefreshDate.current = new Date().toDateString();
      loadData();
      // Set up next midnight refresh
      setupMidnightRefresh();
    }, timeUntilMidnight);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [chartResponse, adviceResponse] = await Promise.all([
        dailyAssistantApi.getChartData(selectedDay),
        dailyAssistantApi.getAdvice(selectedDay),
      ]);

      setChartData(chartResponse);
      setAdvice(adviceResponse);
    } catch (err) {
      const errorDetails = parseError(err);
      setError(errorDetails);
      
      // If unauthorized, redirect to onboarding
      if (errorDetails.type === 'authentication') {
        setTimeout(() => navigate('/onboarding'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (day: 'today' | 'tomorrow') => {
    setSelectedDay(day);
  };

  if (loading) {
    return <LoadingSpinner message="Loading your energy data..." fullScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorMessage error={error} onRetry={loadData} />
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Daily Assistant</h1>
              <p className="text-xs sm:text-sm text-gray-600">Your personalized energy guide</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  navigate('/onboarding');
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Day Selection Toggle */}
        <div className="mb-4 sm:mb-6">
          <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1 w-full sm:w-auto">
            <button
              onClick={() => handleDayChange('today')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedDay === 'today'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handleDayChange('tomorrow')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedDay === 'tomorrow'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Tomorrow
            </button>
          </div>
        </div>

        {/* Current Status (only for today) */}
        {selectedDay === 'today' && chartData?.currentStatus && (
          <CurrentStatus status={chartData.currentStatus} />
        )}

        {/* Upcoming Energy Event */}
        {chartData?.energyEvents && chartData.energyEvents.length > 0 && (
          <UpcomingEnergyEvent events={chartData.energyEvents} />
        )}

        {/* Energy Chart */}
        {chartData && (
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              24-Hour Energy Overview
            </h2>
            <EnergyChart data={chartData} showCurrentTime={selectedDay === 'today'} />
          </div>
        )}

        {/* Energy Advice */}
        {advice && (
          <AdviceList advice={advice} />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
