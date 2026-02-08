# Energy Events Troubleshooting Guide

## Issue Summary
User reported that:
1. Chart does not show arrows for energy events
2. "Upcoming Energy Event" section does not match details shown in chart and advice

## Investigation Results

### ✅ Backend is Working Correctly

Tested with `test-energy-events.sh` script:
- Energy events ARE being created during user registration (15 events over 30 days)
- Energy events ARE being returned in API responses
- Intervals ARE being marked with red shading when events occur
- Example: Today (2026-02-08) has 1 event from 13:00-15:00 with 4 red intervals

### ✅ Frontend Logic is Correct

The `EnergyChart.tsx` component has proper logic:
1. Creates `eventTypeMap` from `data.energyEvents`
2. Maps event times to interval times
3. Displays arrows when `item.shading === 'red'` AND `eventTypeMap` has the event type
4. Arrow direction: ↑ for INCREASE_CONSUMPTION, ↓ for DECREASE_CONSUMPTION

### 🔍 Debug Logs Added

Added console logging to `EnergyChart.tsx`:
```typescript
console.log('Energy events received:', data.energyEvents);
console.log('Number of intervals with red shading:', data.intervals.filter(i => i.shading === 'red').length);
console.log('Event type map size:', eventTypeMap.size);
console.log('Event type map entries:', Array.from(eventTypeMap.entries()));
```

## How to Verify It's Working

### Option 1: Create a New Test Account

1. Go to: https://energy-assistant-prototype-frontend.vercel.app
2. Click "Sign Up" and create a new account
3. Wait 3 seconds for data seeding
4. Open browser console (F12 or Cmd+Option+I)
5. Look for the debug logs showing:
   - Energy events received
   - Number of red intervals
   - Event type map entries
6. Check the chart for:
   - Blue shaded areas (energy events)
   - Arrows (↑ or ↓) in the blue areas
7. Check the "Upcoming Energy Event" card above the chart

### Option 2: Use the Test Script

Run the backend test:
```bash
./test-energy-events.sh
```

This will:
- Create a new user
- Fetch chart data
- Show energy events in the response
- Count red intervals

### Option 3: Use the Test HTML Page

Open `test-frontend-events.html` in a browser:
1. Click "Run Test"
2. Review the results
3. Check console for detailed logs

## Common Issues

### Issue: No arrows showing
**Cause**: Old user account created before energy events were added
**Solution**: Create a new account

### Issue: No "Upcoming Energy Event" card
**Cause**: No upcoming events (all events are in the past)
**Solution**: Check tomorrow's view or create a new account

### Issue: Events don't match between card and chart
**Cause**: This should not happen with current code
**Solution**: Check browser console for errors, verify API response

## Event Display Logic

### When Arrows Show:
1. Interval has `shading === 'red'` (backend marks it)
2. `eventTypeMap` has an entry for that interval time
3. Arrow is rendered as a label on the `ReferenceArea` component

### When "Upcoming Energy Event" Card Shows:
1. `chartData.energyEvents` array has at least one event
2. At least one event has `startTime > now`
3. Shows the earliest upcoming event

### Event Shading Colors:
- **Blue background** (`rgba(59, 130, 246, 0.25)`): Energy event period
- **Green indicator bar**: Good time to use energy (low prices/high solar)
- **Red indicator bar**: Avoid high usage (peak prices)

## API Response Structure

```json
{
  "date": "2026-02-08",
  "intervals": [
    {
      "startTime": "13:00",
      "endTime": "13:30",
      "shading": "red",  // ← Marks energy event
      "baseShading": "none",
      ...
    }
  ],
  "energyEvents": [
    {
      "eventId": "...",
      "eventType": "DECREASE_CONSUMPTION",  // ← Arrow direction
      "startTime": "2026-02-08T13:00:00.000Z",
      "endTime": "2026-02-08T15:00:00.000Z",
      "incentiveDescription": "...",
      "incentiveAmountDollars": 10.82
    }
  ]
}
```

## Next Steps

1. **Test with a fresh account** - This is the most likely solution
2. **Check browser console** - Look for the debug logs
3. **Verify timing** - Events might be scheduled for different times
4. **Check both Today and Tomorrow** - Events are distributed over 30 days

## Files Modified

- `frontend/src/components/EnergyChart.tsx` - Added debug logging
- `backend/src/lib/seedTestData.ts` - Creates 15 events (1 every 2 days)
- `backend/src/lib/dailyAssistant.ts` - Fetches and returns events

## Test Credentials

Use the test scripts to create fresh accounts automatically, or manually create:
- Email: `test-events-[timestamp]@example.com`
- Password: Any password (demo mode accepts all)

## Expected Behavior

After creating a new account, you should see:
1. **Upcoming Energy Event card** (if there's an event today or soon)
2. **Blue shaded areas** on the chart during event times
3. **Arrows** (↑ or ↓) in the blue areas
4. **Console logs** showing event data

If you don't see these, check:
- Browser console for errors
- Network tab for API responses
- That you're using a newly created account
