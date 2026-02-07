# Energy Usage Assistant - Testing Checklist

## Test Environment
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001
- **Test User:** test@example.com / password123

## 1. Onboarding Flow ✓

### Energy Account Login
- [ ] Can access onboarding page
- [ ] Can enter email and password
- [ ] Login validation works
- [ ] Error messages display correctly
- [ ] Successful login proceeds to next step

### Solar Configuration
- [ ] Can select "I have solar"
- [ ] Can enter system size, tilt, orientation
- [ ] Can select "I don't have solar"
- [ ] Validation works for all fields
- [ ] Can proceed to next step

### Product Explanation
- [ ] Explanation screen displays
- [ ] Can complete onboarding
- [ ] Redirects to Daily Assistant

## 2. Daily Assistant View ✓

### Navigation & Layout
- [ ] Page loads without errors
- [ ] Day toggle (Today/Tomorrow) works
- [ ] Bottom navigation visible and functional
- [ ] Responsive on mobile/tablet/desktop

### Current Status (Today only)
- [ ] Displays solar generation state
- [ ] Displays consumption state
- [ ] Displays current price
- [ ] Action prompt is relevant

### Upcoming Energy Event
- [ ] Shows next upcoming event
- [ ] Displays correct event type (increase/decrease)
- [ ] Shows time range
- [ ] Shows incentive amount
- [ ] Provides clear action guidance

### Energy Charts
- [ ] "Your Energy" chart displays
- [ ] Solar generation (yellow) shows correctly
- [ ] Consumption (blue line) shows correctly
- [ ] Energy events (blue shading) show correctly
- [ ] Current time indicator shows (today only)
- [ ] "Your Tariff" chart displays
- [ ] Tariff pricing shows correctly
- [ ] Indicator bar below charts shows
- [ ] Green (good time) indicators show
- [ ] Red (avoid high usage) indicators show
- [ ] Indicators align with chart x-axis
- [ ] Legends display correctly
- [ ] Charts are responsive

### Energy Advice
- [ ] "Home Energy Advice" section displays
- [ ] Section is expandable/collapsible
- [ ] Summary shows top advice + savings
- [ ] Expanded view shows top 3 recommendations
- [ ] Each advice card shows time, savings, priority
- [ ] "Electric Vehicle" section shows (if EV configured)
- [ ] "Home Battery" section shows (if battery configured)

## 3. Energy Insights View ✓

### Navigation
- [ ] Can navigate to Energy Insights from bottom nav
- [ ] Page loads without errors
- [ ] Responsive layout works

### Consumption Disaggregation
- [ ] Section displays with icon and title
- [ ] Usage bars show for all categories
- [ ] Percentages add up correctly
- [ ] Total consumption displays
- [ ] EV pattern detection alert shows (if detected and no EV configured)

### Solar Performance (if solar configured)
- [ ] Section displays
- [ ] Total generation shows
- [ ] Self-consumption percentage shows
- [ ] Export metrics show
- [ ] Recommendations display
- [ ] Recommendations are relevant

### Household Comparison
- [ ] Section displays
- [ ] Energy personality shows with emoji
- [ ] Personality description is clear
- [ ] User average vs similar households shows
- [ ] Comparison percentage displays
- [ ] Comparison bar visualizes correctly
- [ ] Event history shows (if events participated)

## 4. Settings View ✓

### Navigation
- [ ] Can navigate to Settings from bottom nav
- [ ] Page loads without errors

### Account Section
- [ ] Email displays correctly
- [ ] Account info is readable

### Solar System Settings
- [ ] Current configuration displays
- [ ] Can edit solar settings
- [ ] Can toggle "I have solar" / "I don't have solar"
- [ ] Validation works
- [ ] Save button works
- [ ] Success message displays
- [ ] Changes reflect in Daily Assistant

### Electric Vehicle Section
- [ ] Can add new EV
- [ ] Make/model dropdown works
- [ ] Battery capacity infers correctly
- [ ] Can edit existing EV
- [ ] Can delete EV
- [ ] Changes reflect in advice

### Home Battery Section
- [ ] Can add new battery
- [ ] Power and capacity fields work
- [ ] Validation works
- [ ] Can edit existing battery
- [ ] Can delete battery
- [ ] Changes reflect in advice

## 5. Cross-Feature Testing ✓

### Data Consistency
- [ ] Solar settings changes update forecasts
- [ ] EV configuration updates advice
- [ ] Battery configuration updates advice
- [ ] Energy events show in charts and advice
- [ ] Consumption data consistent across views

### Navigation Flow
- [ ] Can navigate between all three main views
- [ ] Active tab indicator works
- [ ] State persists when switching views
- [ ] Back button behavior is correct

### Responsive Design
- [ ] Mobile view (< 640px) works
- [ ] Tablet view (640-1024px) works
- [ ] Desktop view (> 1024px) works
- [ ] Charts scale appropriately
- [ ] Text is readable at all sizes
- [ ] Touch targets are adequate on mobile

### Error Handling
- [ ] Network errors display user-friendly messages
- [ ] Missing data handled gracefully
- [ ] Invalid inputs show validation errors
- [ ] Loading states display correctly

## 6. Accessibility ✓

### Keyboard Navigation
- [ ] Can tab through all interactive elements
- [ ] Focus indicators are visible
- [ ] Can activate buttons with Enter/Space
- [ ] Skip to main content link works

### Screen Reader
- [ ] Page titles are descriptive
- [ ] Buttons have clear labels
- [ ] Form inputs have labels
- [ ] Error messages are announced
- [ ] Charts have text alternatives

### Visual
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] Text is readable
- [ ] Icons have text labels
- [ ] Information not conveyed by color alone

## 7. Performance ✓

### Load Times
- [ ] Initial page load < 3 seconds
- [ ] Navigation between views is instant
- [ ] Charts render smoothly
- [ ] No visible lag or jank

### Data Refresh
- [ ] Midnight refresh works (if kept open overnight)
- [ ] Periodic refresh works (every 15 min)
- [ ] Visibility-based refresh works

## Issues Found

### Critical (Blocks Demo)
- [ ] None identified

### High Priority (Should Fix Before Demo)
- [ ] 

### Medium Priority (Nice to Have)
- [ ] 

### Low Priority (Future Enhancement)
- [ ] 

## Demo Readiness Checklist

- [ ] All critical issues resolved
- [ ] Test data is realistic and representative
- [ ] Demo script prepared
- [ ] Screenshots captured
- [ ] Talking points documented
- [ ] Known limitations documented
- [ ] Feedback collection method ready

## Notes

Add any observations, edge cases, or feedback here:

---

**Last Updated:** [Date]
**Tested By:** [Name]
