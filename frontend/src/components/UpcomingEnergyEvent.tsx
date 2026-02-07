/**
 * Upcoming Energy Event Component
 * 
 * Displays information about the next upcoming energy event
 */

import { EnergyEventInfo } from '../api/dailyAssistant';

interface UpcomingEnergyEventProps {
  events: EnergyEventInfo[];
}

export default function UpcomingEnergyEvent({ events }: UpcomingEnergyEventProps) {
  if (events.length === 0) {
    return null;
  }

  // Find the next upcoming event (earliest start time)
  const now = new Date();
  const upcomingEvents = events
    .filter(event => new Date(event.startTime) > now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  if (upcomingEvents.length === 0) {
    return null;
  }

  const nextEvent = upcomingEvents[0];
  const isIncrease = nextEvent.eventType === 'INCREASE_CONSUMPTION';

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 mb-4 sm:mb-6">
      <div className="flex items-start">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 ${
          isIncrease ? 'bg-blue-100' : 'bg-orange-100'
        }`}>
          <svg className={`w-6 h-6 sm:w-7 sm:h-7 ${isIncrease ? 'text-blue-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isIncrease ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            )}
          </svg>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Upcoming Energy Event</h2>
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full whitespace-nowrap">
              ${nextEvent.incentiveAmountDollars.toFixed(2)} credit
            </span>
          </div>
          
          <div className="text-xs sm:text-sm text-gray-600 mb-3">
            <span className="font-medium">{formatDate(nextEvent.startTime)}</span>
            {' • '}
            <span>{formatTime(nextEvent.startTime)} - {formatTime(nextEvent.endTime)}</span>
          </div>

          <div className={`p-3 rounded-lg ${isIncrease ? 'bg-blue-50' : 'bg-orange-50'}`}>
            <p className="text-sm sm:text-base font-medium text-gray-900 mb-1">
              {isIncrease ? '↑ Increase your consumption' : '↓ Reduce your consumption'}
            </p>
            <p className="text-xs sm:text-sm text-gray-700">
              {isIncrease ? (
                <>Top-up your EV, run high-energy appliances, or charge your battery to help use excess renewable energy.</>
              ) : (
                <>Reduce usage during peak demand. If you have a battery, consider exporting stored energy to the grid.</>
              )}
            </p>
          </div>

          <p className="text-xs text-gray-500 mt-2 italic">{nextEvent.incentiveDescription}</p>
        </div>
      </div>
    </div>
  );
}
