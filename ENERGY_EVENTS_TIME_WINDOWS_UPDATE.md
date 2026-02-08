# Energy Events Time Windows Update

## ✅ Changes Implemented

Updated energy event scheduling to be more realistic and aligned with actual grid conditions:

### Event Time Windows

**INCREASE Consumption Events:**
- **Time Window**: 10:00 - 14:00
- **Duration**: 1-2 hours (randomly selected)
- **Purpose**: Encourage energy use during high solar generation
- **Incentive**: "Increase your energy usage during excess renewable generation"
- **Arrow**: ↑ (up arrow on chart)

**DECREASE Consumption Events:**
- **Time Window**: 18:00 - 22:00
- **Duration**: 1-2 hours (randomly selected)
- **Purpose**: Reduce demand during peak evening hours
- **Incentive**: "Reduce your energy usage during peak demand to earn rewards"
- **Arrow**: ↓ (down arrow on chart)

### Event Distribution

- **Frequency**: 1 event every 2 days
- **Total**: 15 events over 30 days
- **Pattern**: Alternates between INCREASE and DECREASE events
  - Days 0, 4, 8, 12, 16, 20, 24, 28: INCREASE events (10:00-14:00)
  - Days 2, 6, 10, 14, 18, 22, 26: DECREASE events (18:00-22:00)

### Incentive Amounts

- Random between $5.00 and $15.00 per event
- Displayed in the "Upcoming Energy Event" card

## 🔧 Technical Changes

### Backend (`backend/src/lib/seedTestData.ts`)

1. **Time Window Logic**:
   ```typescript
   if (eventType === 'INCREASE_CONSUMPTION') {
     startHour = 10 + Math.floor(Math.random() * 3); // 10, 11, or 12
     duration = Math.random() < 0.5 ? 1 : 2; // 1 or 2 hours
     // Ensure event doesn't go past 14:00
     if (startHour + duration > 14) {
       duration = 14 - startHour;
     }
   } else {
     startHour = 18 + Math.floor(Math.random() * 3); // 18, 19, or 20
     duration = Math.random() < 0.5 ? 1 : 2; // 1 or 2 hours
     // Ensure event doesn't go past 22:00
     if (startHour + duration > 22) {
       duration = 22 - startHour;
     }
   }
   ```

2. **User-Specific Events**:
   - Changed from `targetUserIds: 'ALL'` to `targetUserIds: userId`
   - Each user gets their own set of events
   - Prevents interference between test users

3. **Cleanup Logic**:
   - Deletes old 'ALL' events on first user registration
   - Ensures clean slate for new event system

### Frontend

- Removed debug logging (was added for troubleshooting)
- Arrow display logic unchanged (already working correctly)
- Event card display unchanged (already working correctly)

## 📊 Test Results

Verified with `test-energy-events.sh`:

```
✅ Event type: INCREASE_CONSUMPTION
✅ Time: 11:00-12:00 (within 10:00-14:00 window)
✅ Duration: 1 hour (max 2 hours)
✅ Red intervals: 2 (1 hour = 2 half-hour intervals)
✅ Arrow displayed: ↑
```

## 🎯 Why These Time Windows?

### INCREASE Events (10:00-14:00)
- **Solar Peak**: Maximum solar generation occurs around midday
- **Grid Benefit**: Helps absorb excess renewable energy
- **User Benefit**: Incentivizes using cheap/free solar energy
- **Real-World Example**: Charge EV, run dishwasher, do laundry

### DECREASE Events (18:00-22:00)
- **Peak Demand**: Evening hours when everyone gets home
- **Grid Benefit**: Reduces strain on grid during peak
- **User Benefit**: Avoids high peak rates, earns incentives
- **Real-World Example**: Delay high-energy tasks, export battery power

## 🚀 Deployment

All changes deployed to:
- **Backend**: Railway (auto-deploy from GitHub)
- **Frontend**: Vercel (auto-deploy from GitHub)

## 🧪 Testing

To verify the new time windows:

1. **Create a new account** (old accounts won't have updated events)
2. **Check Today's view** - Look for events in the correct time windows
3. **Check Tomorrow's view** - Verify alternating pattern
4. **Look for arrows** - ↑ during 10:00-14:00, ↓ during 18:00-22:00

Or run the test script:
```bash
./test-energy-events.sh
```

## 📝 Files Modified

- `backend/src/lib/seedTestData.ts` - Event creation logic
- `frontend/src/components/EnergyChart.tsx` - Removed debug logs
- `test-energy-events.sh` - Updated documentation
- `ENERGY_EVENTS_TROUBLESHOOTING.md` - Updated time windows
- `ENERGY_EVENTS_FIX_SUMMARY.md` - Updated time windows

## ✨ User Experience

Users will now see:
1. **Morning/Midday**: INCREASE events encouraging energy use during solar peak
2. **Evening**: DECREASE events encouraging conservation during peak demand
3. **Realistic timing**: Events align with actual grid conditions
4. **Clear incentives**: $5-$15 rewards for participation
5. **Visual indicators**: Arrows and blue shading on chart

This makes the demo more realistic and educational about how demand response programs work in the real world!
