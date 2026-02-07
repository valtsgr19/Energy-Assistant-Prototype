/**
 * Energy Chart Component
 * 
 * Displays two separate 24-hour charts:
 * 1. Energy Chart: Solar generation and consumption
 * 2. Tariff Chart: Time-of-use pricing
 */

import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import { ChartDataResponse } from '../api/dailyAssistant';

interface EnergyChartProps {
  data: ChartDataResponse;
  showCurrentTime?: boolean; // Show current time line for today
}

export default function EnergyChart({ data, showCurrentTime = false }: EnergyChartProps) {
  // Transform data for Recharts
  const chartData = data.intervals.map((interval, index) => ({
    time: interval.startTime,
    solar: interval.solarGenerationKwh,
    consumption: interval.consumptionKwh,
    price: interval.pricePerKwh,
    shading: interval.shading,
    index,
  }));

  // Create a map to track which intervals should show "avoid high usage" 
  // This is based on high prices, independent of energy events
  const avoidHighUsageMap = new Map<string, boolean>();
  
  data.intervals.forEach(interval => {
    // Mark as "avoid" if base shading is yellow (high prices)
    if (interval.baseShading === 'yellow') {
      avoidHighUsageMap.set(interval.startTime, true);
    }
  });

  // Create a map to track which intervals should show "good time"
  // This is based on low prices and/or solar generation, independent of energy events
  const goodTimeMap = new Map<string, boolean>();
  
  data.intervals.forEach(interval => {
    // Mark as "good time" if base shading is green
    if (interval.baseShading === 'green') {
      goodTimeMap.set(interval.startTime, true);
    }
  });

  // Create a map of time intervals to event types
  const eventTypeMap = new Map<string, 'INCREASE_CONSUMPTION' | 'DECREASE_CONSUMPTION'>();
  
  data.energyEvents?.forEach(event => {
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);
    
    // Mark all intervals that overlap with this event
    data.intervals.forEach(interval => {
      const [hours, minutes] = interval.startTime.split(':').map(Number);
      const intervalDate = new Date(data.date);
      intervalDate.setHours(hours, minutes, 0, 0);
      const intervalEnd = new Date(intervalDate);
      intervalEnd.setMinutes(intervalEnd.getMinutes() + 30);
      
      if (eventStart < intervalEnd && eventEnd > intervalDate) {
        eventTypeMap.set(interval.startTime, event.eventType);
      }
    });
  });

  // Calculate current time position for the vertical line
  const getCurrentTimePosition = () => {
    if (!showCurrentTime) return null;
    
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Find the interval index (0-47)
    const intervalIndex = hours * 2 + (minutes >= 30 ? 1 : 0);
    
    // Return the time string for the current interval
    return chartData[intervalIndex]?.time || null;
  };

  const currentTimePosition = getCurrentTimePosition();

  // Custom tooltip for energy chart
  const EnergyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{data.time}</p>
          <div className="space-y-1 text-sm">
            <p className="text-yellow-600">
              Solar: {data.solar.toFixed(2)} kWh
            </p>
            <p className="text-blue-600">
              Consumption: {data.consumption !== null ? data.consumption.toFixed(2) : 'N/A'} kWh
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for tariff chart
  const TariffTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{data.time}</p>
          <div className="space-y-1 text-sm">
            <p className="text-purple-600">
              Price: ${data.price.toFixed(2)}/kWh
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Get shading color
  const getShadingColor = (shading: string) => {
    switch (shading) {
      case 'green':
        return 'rgba(34, 197, 94, 0.25)'; // green-500 with higher opacity
      case 'yellow':
        return 'rgba(249, 115, 22, 0.25)'; // orange-500 - Avoid high usage
      case 'red':
        return 'rgba(59, 130, 246, 0.25)'; // blue-500 - Energy event (changed from red)
      default:
        return 'transparent';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Energy Chart Section */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Your Energy</h3>
        
        {/* Energy Legend */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 text-xs sm:text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded mr-1 sm:mr-2"></div>
            <span className="text-gray-700">Solar Generation</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded mr-1 sm:mr-2"></div>
            <span className="text-gray-700">Consumption</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 border border-blue-300 rounded mr-1 sm:mr-2"></div>
            <span className="text-gray-700">Energy event</span>
          </div>
        </div>

        {/* Mobile Energy Chart */}
        <ResponsiveContainer width="100%" height={250} className="sm:hidden">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10 }}
              interval={5}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            
            <YAxis 
              tick={{ fontSize: 10 }}
              width={40}
              label={{ value: 'kWh', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
            />
            
            <Tooltip content={<EnergyTooltip />} />
            
            {/* Background shading areas - ONLY RED (energy events) */}
            {chartData.map((item, index) => {
              if (item.shading === 'red' && index < chartData.length - 1) {
                const eventType = eventTypeMap.get(item.time);
                const arrow = eventType === 'INCREASE_CONSUMPTION' ? '↑' : eventType === 'DECREASE_CONSUMPTION' ? '↓' : '';
                
                return (
                  <ReferenceArea
                    key={`shading-area-${index}`}
                    x1={item.time}
                    x2={chartData[index + 1].time}
                    fill={getShadingColor(item.shading)}
                    fillOpacity={1}
                    ifOverflow="extendDomain"
                    label={arrow ? { value: arrow, position: 'insideTop', fill: '#1e40af', fontSize: 16, fontWeight: 'bold' } : undefined}
                  />
                );
              }
              return null;
            })}
            
            {/* Current time indicator */}
            {currentTimePosition && (
              <ReferenceLine
                x={currentTimePosition}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ 
                  value: 'Now', 
                  position: 'top',
                  fill: '#ef4444',
                  fontSize: 10,
                  fontWeight: 'bold'
                }}
              />
            )}
            
            {/* Solar generation area */}
            <Area
              type="monotone"
              dataKey="solar"
              fill="#eab308"
              fillOpacity={0.3}
              stroke="#eab308"
              strokeWidth={2}
              name="Solar"
            />
            
            {/* Consumption line */}
            <Line
              type="monotone"
              dataKey="consumption"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Consumption"
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Desktop/Tablet Energy Chart */}
        <ResponsiveContainer width="100%" height={300} className="hidden sm:block">
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              interval={3}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            
            <YAxis 
              label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
              tick={{ fontSize: 12 }}
            />
            
            <Tooltip content={<EnergyTooltip />} />
            
            {/* Background shading areas - ONLY RED (energy events) */}
            {chartData.map((item, index) => {
              if (item.shading === 'red' && index < chartData.length - 1) {
                const eventType = eventTypeMap.get(item.time);
                const arrow = eventType === 'INCREASE_CONSUMPTION' ? '↑' : eventType === 'DECREASE_CONSUMPTION' ? '↓' : '';
                
                return (
                  <ReferenceArea
                    key={`shading-area-${index}`}
                    x1={item.time}
                    x2={chartData[index + 1].time}
                    fill={getShadingColor(item.shading)}
                    fillOpacity={1}
                    ifOverflow="extendDomain"
                    label={arrow ? { value: arrow, position: 'insideTop', fill: '#1e40af', fontSize: 18, fontWeight: 'bold' } : undefined}
                  />
                );
              }
              return null;
            })}
            
            {/* Current time indicator */}
            {currentTimePosition && (
              <ReferenceLine
                x={currentTimePosition}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ 
                  value: 'Now', 
                  position: 'top',
                  fill: '#ef4444',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}
              />
            )}
            
            {/* Solar generation area */}
            <Area
              type="monotone"
              dataKey="solar"
              fill="#eab308"
              fillOpacity={0.3}
              stroke="#eab308"
              strokeWidth={2}
              name="Solar"
            />
            
            {/* Consumption line */}
            <Line
              type="monotone"
              dataKey="consumption"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Consumption"
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Indicator blocks below chart - Mobile */}
        <div className="mt-2 relative sm:hidden" style={{ height: '24px', marginLeft: '20px', marginRight: '10px' }}>
          <div className="absolute inset-0 flex">
            {chartData.map((item, index) => {
              const width = `${100 / 48}%`;
              const left = `${(index / 48) * 100}%`;
              
              let bgColor = 'transparent';
              
              // Priority: avoid high usage (red) > good time (green)
              // Check both maps to show indicators even during energy events
              if (avoidHighUsageMap.get(item.time)) {
                bgColor = '#ef4444'; // red-500 - bright red for avoid high usage
              } else if (goodTimeMap.get(item.time)) {
                bgColor = '#86efac'; // green-300
              }
              
              return (
                <div
                  key={`indicator-${index}`}
                  className="absolute"
                  style={{
                    left,
                    width,
                    height: '100%',
                    backgroundColor: bgColor,
                    borderRight: index < 47 ? '1px solid rgba(255,255,255,0.3)' : 'none'
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Indicator Legend - Mobile */}
        <div className="flex flex-wrap gap-2 mt-2 text-xs sm:hidden">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-300 rounded mr-1"></div>
            <span className="text-gray-700">Good time</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
            <span className="text-gray-700">Avoid high usage</span>
          </div>
        </div>

        {/* Indicator blocks below chart - Desktop/Tablet */}
        <div className="mt-2 relative hidden sm:block" style={{ height: '24px', marginLeft: '60px', marginRight: '30px' }}>
          <div className="absolute inset-0 flex">
            {chartData.map((item, index) => {
              const width = `${100 / 48}%`;
              const left = `${(index / 48) * 100}%`;
              
              let bgColor = 'transparent';
              
              // Priority: avoid high usage (red) > good time (green)
              // Check both maps to show indicators even during energy events
              if (avoidHighUsageMap.get(item.time)) {
                bgColor = '#ef4444'; // red-500 - bright red for avoid high usage
              } else if (goodTimeMap.get(item.time)) {
                bgColor = '#86efac'; // green-300
              }
              
              return (
                <div
                  key={`indicator-${index}`}
                  className="absolute"
                  style={{
                    left,
                    width,
                    height: '100%',
                    backgroundColor: bgColor,
                    borderRight: index < 47 ? '1px solid rgba(255,255,255,0.3)' : 'none'
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Indicator Legend - Desktop/Tablet */}
        <div className="hidden sm:flex flex-wrap gap-4 mt-2 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-300 rounded mr-2"></div>
            <span className="text-gray-700">Good time</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span className="text-gray-700">Avoid high usage</span>
          </div>
        </div>

        {/* Time period labels */}
        <div className="mt-2 sm:mt-4 flex justify-between text-xs text-gray-500">
          <span>12 AM</span>
          <span className="hidden sm:inline">6 AM</span>
          <span>Noon</span>
          <span className="hidden sm:inline">6 PM</span>
          <span>12 AM</span>
        </div>
      </div>

      {/* Tariff Chart Section */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Your Tariff</h3>
        
        {/* Tariff Legend */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 text-xs sm:text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-500 rounded mr-1 sm:mr-2"></div>
            <span className="text-gray-700">Price per kWh</span>
          </div>
        </div>

        {/* Mobile Tariff Chart */}
        <ResponsiveContainer width="100%" height={150} className="sm:hidden">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10 }}
              interval={5}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            
            <YAxis 
              tick={{ fontSize: 10 }}
              width={40}
              label={{ value: '$/kWh', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
            />
            
            <Tooltip content={<TariffTooltip />} />
            
            {/* Current time indicator */}
            {currentTimePosition && (
              <ReferenceLine
                x={currentTimePosition}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ 
                  value: 'Now', 
                  position: 'top',
                  fill: '#ef4444',
                  fontSize: 10,
                  fontWeight: 'bold'
                }}
              />
            )}
            
            {/* Price area */}
            <Area
              type="stepAfter"
              dataKey="price"
              fill="#a855f7"
              fillOpacity={0.2}
              stroke="#a855f7"
              strokeWidth={2}
              name="Price"
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Desktop/Tablet Tariff Chart */}
        <ResponsiveContainer width="100%" height={180} className="hidden sm:block">
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              interval={3}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            
            <YAxis 
              label={{ value: 'Price ($/kWh)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
              tick={{ fontSize: 12 }}
            />
            
            <Tooltip content={<TariffTooltip />} />
            
            {/* Current time indicator */}
            {currentTimePosition && (
              <ReferenceLine
                x={currentTimePosition}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ 
                  value: 'Now', 
                  position: 'top',
                  fill: '#ef4444',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}
              />
            )}
            
            {/* Price area */}
            <Area
              type="stepAfter"
              dataKey="price"
              fill="#a855f7"
              fillOpacity={0.2}
              stroke="#a855f7"
              strokeWidth={2}
              name="Price"
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Time period labels */}
        <div className="mt-2 sm:mt-4 flex justify-between text-xs text-gray-500">
          <span>12 AM</span>
          <span className="hidden sm:inline">6 AM</span>
          <span>Noon</span>
          <span className="hidden sm:inline">6 PM</span>
          <span>12 AM</span>
        </div>
      </div>
    </div>
  );
}
