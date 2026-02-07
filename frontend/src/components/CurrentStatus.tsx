/**
 * Current Status Component
 * 
 * Displays current solar generation, consumption, and price
 * with an action prompt for the user.
 */

import { CurrentStatus as CurrentStatusType } from '../api/dailyAssistant';

interface CurrentStatusProps {
  status: CurrentStatusType;
}

export default function CurrentStatus({ status }: CurrentStatusProps) {
  const getStateColor = (state: string) => {
    switch (state) {
      case 'high':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'high':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        );
      case 'medium':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
      case 'low':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getPromptStyle = () => {
    if (status.actionPrompt.toLowerCase().includes('turn it up') || 
        status.actionPrompt.toLowerCase().includes('good time')) {
      return 'bg-green-50 border-green-200 text-green-800';
    } else if (status.actionPrompt.toLowerCase().includes('reduce') || 
               status.actionPrompt.toLowerCase().includes('peak')) {
      return 'bg-red-50 border-red-200 text-red-800';
    }
    return 'bg-blue-50 border-blue-200 text-blue-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Current Status</h2>
        <div className="text-xs sm:text-sm text-gray-600">
          {new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
        {/* Solar Generation */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className={`p-2 sm:p-3 rounded-lg ${getStateColor(status.solarState)}`}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-gray-600 truncate">Solar Generation</p>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className={`text-sm sm:text-base font-semibold capitalize ${getStateColor(status.solarState).split(' ')[0]}`}>
                {status.solarState}
              </span>
              <span className="flex-shrink-0">
                {getStateIcon(status.solarState)}
              </span>
            </div>
          </div>
        </div>

        {/* Consumption */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className={`p-2 sm:p-3 rounded-lg ${getStateColor(status.consumptionState)}`}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-gray-600 truncate">Consumption</p>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className={`text-sm sm:text-base font-semibold capitalize ${getStateColor(status.consumptionState).split(' ')[0]}`}>
                {status.consumptionState}
              </span>
              <span className="flex-shrink-0">
                {getStateIcon(status.consumptionState)}
              </span>
            </div>
          </div>
        </div>

        {/* Current Price */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="p-2 sm:p-3 rounded-lg bg-purple-50 text-purple-600">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-gray-600 truncate">Current Price</p>
            <p className="text-sm sm:text-base font-semibold text-purple-600">
              ${status.currentPrice.toFixed(2)}/kWh
            </p>
          </div>
        </div>
      </div>

      {/* Action Prompt */}
      <div className={`p-3 sm:p-4 rounded-lg border-2 ${getPromptStyle()}`}>
        <div className="flex items-start space-x-2 sm:space-x-3">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="min-w-0 flex-1">
            <p className="text-sm sm:text-base font-medium">Right Now</p>
            <p className="text-xs sm:text-sm mt-1">{status.actionPrompt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
