/**
 * Advice List Component
 * 
 * Displays personalized energy advice recommendations in distinct sections:
 * - Household advice (general energy usage)
 * - EV advice (only shown if EVs are configured)
 * - Battery advice (only shown if batteries are configured)
 * 
 * Each section is expandable with a summary at the top
 */

import { useState } from 'react';
import { AdviceResponse, EnergyAdvice } from '../api/dailyAssistant';

interface AdviceListProps {
  advice: AdviceResponse;
}

export default function AdviceList({ advice }: AdviceListProps) {
  const [expandedSections, setExpandedSections] = useState<{
    household: boolean;
    ev: boolean;
    battery: boolean;
  }>({
    household: false,
    ev: false,
    battery: false,
  });

  const toggleSection = (section: 'household' | 'ev' | 'battery') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const hasAnyAdvice = 
    advice.generalAdvice.length > 0 || 
    advice.evAdvice.length > 0 || 
    advice.batteryAdvice.length > 0;

  if (!hasAnyAdvice) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Energy Advice</h2>
        <div className="text-center py-6 sm:py-8">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-sm sm:text-base text-gray-600">No advice available at this time</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">Check back later for personalized recommendations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Household Advice Section */}
      {advice.generalAdvice.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={() => toggleSection('household')}
            className="w-full p-3 sm:p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Home Energy Advice</h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                    {getSummary(advice.generalAdvice)}
                  </p>
                </div>
              </div>
              <svg 
                className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${expandedSections.household ? 'transform rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {expandedSections.household && (
            <div className="px-3 pb-3 sm:px-6 sm:pb-6 pt-0 space-y-3 sm:space-y-4 border-t border-gray-100">
              <p className="text-xs sm:text-sm text-gray-600 italic pt-3">Top 3 recommendations:</p>
              {advice.generalAdvice.slice(0, 3).map((item, index) => (
                <AdviceCard key={index} advice={item} index={index} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* EV Advice Section - Only show if EVs are configured */}
      {advice.evAdvice.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={() => toggleSection('ev')}
            className="w-full p-3 sm:p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Electric Vehicle</h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                    {getSummary(advice.evAdvice)}
                  </p>
                </div>
              </div>
              <svg 
                className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${expandedSections.ev ? 'transform rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {expandedSections.ev && (
            <div className="px-3 pb-3 sm:px-6 sm:pb-6 pt-0 space-y-3 sm:space-y-4 border-t border-gray-100">
              <p className="text-xs sm:text-sm text-gray-600 italic pt-3">Top 3 recommendations:</p>
              {advice.evAdvice.slice(0, 3).map((item, index) => (
                <AdviceCard key={index} advice={item} index={index} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Battery Advice Section - Only show if batteries are configured */}
      {advice.batteryAdvice.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={() => toggleSection('battery')}
            className="w-full p-3 sm:p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Home Battery</h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                    {getSummary(advice.batteryAdvice)}
                  </p>
                </div>
              </div>
              <svg 
                className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${expandedSections.battery ? 'transform rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {expandedSections.battery && (
            <div className="px-3 pb-3 sm:px-6 sm:pb-6 pt-0 space-y-3 sm:space-y-4 border-t border-gray-100">
              <p className="text-xs sm:text-sm text-gray-600 italic pt-3">Top 3 recommendations:</p>
              {advice.batteryAdvice.slice(0, 3).map((item, index) => (
                <AdviceCard key={index} advice={item} index={index} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Generate a summary from advice items
 */
function getSummary(adviceItems: EnergyAdvice[]): string {
  if (adviceItems.length === 0) return '';
  
  const topAdvice = adviceItems[0];
  const totalSavings = adviceItems.reduce((sum, item) => sum + item.estimatedSavings, 0);
  
  return `${topAdvice.title} • Save up to $${totalSavings.toFixed(2)} today`;
}

interface AdviceCardProps {
  advice: EnergyAdvice;
  index: number;
}

function AdviceCard({ advice, index }: AdviceCardProps) {
  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800',
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900">{advice.title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{advice.description}</p>
          </div>
        </div>
        <span className={`flex-shrink-0 px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full whitespace-nowrap ${getPriorityBadge(advice.priority)}`}>
          {advice.priority}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center text-xs sm:text-sm text-gray-600">
          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="truncate">
            {advice.recommendedTimeStart} - {advice.recommendedTimeEnd}
          </span>
        </div>
        <div className="flex items-center text-xs sm:text-sm font-medium text-green-600">
          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Save ${advice.estimatedSavings.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
