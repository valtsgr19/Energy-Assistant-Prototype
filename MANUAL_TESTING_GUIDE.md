# Manual Testing Guide - Energy Usage Assistant

**Date:** February 3, 2026  
**Status:** Ready for Testing

---

## Quick Start

### Servers Running:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001

Both servers are already running in the background!

---

## Test Credentials

### For Onboarding:
**Email:** `test@example.com`  
**Password:** `password123`

**Energy Account:**
- **Account ID:** Any value (e.g., `ACC-12345`)
- **Password:** Any value (e.g., `pass123`)

**Note:** The mock API accepts any credentials for development.

---

## Testing Checklist

### 1. Onboarding Flow ✓
**URL:** http://localhost:3000/onboarding

**Test Steps:**
1. Enter email and password
2. Enter energy account credentials
3. Click "Continue"
4. Select "Yes, I have solar panels" or "No, I don't have solar"
5. If yes, enter solar system details:
   - System Size: 5.0 kW
   - Panel Tilt: 30 degrees
   - Orientation: South
6. Click "Continue"
7. Review product explanation
8. Click "Get Started"

**Expected Result:**
- Redirects to Daily Assistant
- No errors
- Smooth transitions

---

### 2. Daily Assistant - Today View ✓
**URL:** http://localhost:3000/daily-assistant

**Test Steps:**
1. Verify "Today" is selected
2. Check Current Status section:
   - Solar generation state
   - Consumption state
   - Current price
   - Action prompt
3. Check Energy Overview chart:
   - 24-hour chart displays
   - Solar generation (green area)
   - Consumption (blue line)
   - Price (purple line)
   - Current time indicator (red dashed line)
   - Chart shading (green/yellow/red)
4. Check Energy Advice section:
   - Household Energy advice
   - EV advice (if configured)
   - Battery advice (if configured)

**Expected Result:**
- All data displays correctly
- Chart is interactive
- Advice is relevant
- No "N/A" values

---

### 3. Daily Assistant - Tomorrow View ✓
**Test Steps:**
1. Click "Tomorrow" button
2. Verify Current Status section disappears
3. Check Energy Overview chart:
   - Shows tomorrow's forecast
   - No current time indicator
   - Consumption shows estimated values
4. Check Energy Advice:
   - Shows tomorrow's recommendations

**Expected Result:**
- Tomorrow's data displays
- No current time line
- Advice is forward-looking

---

### 4. Navigation System ✓
**Test Steps:**
1. Click bottom navigation icons:
   - Daily Assistant (📊)
   - Energy Insights (💡) - should show "Coming Soon"
   - Settings (⚙️)
2. Verify active indicator (blue highlight + bottom border)
3. Navigate between pages
4. Check that state persists

**Expected Result:**
- Navigation works smoothly
- Active page clearly indicated
- Energy Insights shows placeholder
- No page reload

---

### 5. Settings - Solar System ✓
**URL:** http://localhost:3000/settings

**Test Steps:**
1. Click "Edit" on Solar System section
2. Modal opens with current configuration
3. Try changing values:
   - System Size: 8.0 kW
   - Panel Tilt: 35 degrees
   - Orientation: Southwest
4. Click "Save Changes"
5. Verify success message
6. Navigate to Daily Assistant
7. Check if solar forecast updated

**Expected Result:**
- Modal opens/closes smoothly
- Values update successfully
- Success message appears
- Solar forecast regenerates

---

### 6. Settings - Add EV ✓
**Test Steps:**
1. Click "Add Electric Vehicle"
2. Fill in form:
   - Make: Tesla
   - Model: Model 3
   - Year: 2023
   - Battery Capacity: (should auto-fill ~75 kWh)
   - Charging Power: 7.4 kW
   - Average Daily Miles: 30
3. Click "Add EV"
4. Verify EV appears in list
5. Navigate to Daily Assistant
6. Check for EV charging advice

**Expected Result:**
- Battery capacity auto-fills
- EV saves successfully
- Appears in Settings list
- EV advice section appears in Daily Assistant

---

### 7. Settings - Add Battery ✓
**Test Steps:**
1. Click "Add Home Battery"
2. Fill in form:
   - Brand: Tesla
   - Model: Powerwall 2
   - Capacity: 13.5 kWh
   - Power Rating: 5 kW
3. Click "Add Battery"
4. Verify battery appears in list
5. Navigate to Daily Assistant
6. Check for battery charging advice

**Expected Result:**
- Battery saves successfully
- Appears in Settings list
- Battery advice section appears in Daily Assistant

---

### 8. Settings - Edit/Remove Assets ✓
**Test Steps:**
1. Click "Edit" on EV
2. Change charging power to 11 kW
3. Save changes
4. Verify update
5. Click "Remove" on EV
6. Verify EV removed
7. Navigate to Daily Assistant
8. Verify EV advice section disappears

**Expected Result:**
- Edit works correctly
- Remove works correctly
- Advice sections update dynamically

---

### 9. Error Handling ✓
**Test Network Error:**
1. Open DevTools (F12)
2. Go to Network tab
3. Set throttling to "Offline"
4. Try to load Daily Assistant
5. Observe error message

**Expected Result:**
- Orange error box appears
- Message: "Unable to connect to the server..."
- Retry button visible
- Network icon displayed

**Test Validation Error:**
1. Go to Settings
2. Try to add EV with charging speed 0 kW
3. Submit form

**Expected Result:**
- Yellow error box appears
- Message: "Charging speed must be between 0.1 and 350 kW"
- Warning icon displayed

---

### 10. Responsive Design ✓

**Mobile Testing (375px):**
1. Open DevTools (F12)
2. Toggle device toolbar (Cmd+Shift+M / Ctrl+Shift+M)
3. Select "iPhone SE" or set width to 375px
4. Test all pages:
   - Onboarding
   - Daily Assistant
   - Settings
   - Energy Insights

**Check:**
- No horizontal scrolling
- Text readable
- Buttons touch-friendly (44x44px)
- Chart displays correctly
- Navigation accessible

**Tablet Testing (768px):**
1. Set width to 768px (iPad)
2. Test all pages

**Check:**
- Two-column layouts work
- Charts display well
- All features accessible

**Desktop Testing (1920px):**
1. Set width to 1920px
2. Test all pages

**Check:**
- Multi-column layouts
- Generous spacing
- Charts full-featured

---

### 11. Accessibility ✓

**Keyboard Navigation:**
1. Use Tab key to navigate
2. Use Enter/Space to activate buttons
3. Use Escape to close modals
4. Check focus indicators (blue outline)

**Expected Result:**
- All interactive elements reachable
- Clear focus indicators
- Logical tab order
- Modals trap focus

**Screen Reader (Optional):**
1. Enable VoiceOver (Mac: Cmd+F5) or NVDA (Windows)
2. Navigate through pages
3. Check announcements

**Expected Result:**
- All content announced
- ARIA labels read correctly
- Semantic structure clear

---

### 12. Loading States ✓
**Test Steps:**
1. Navigate to Daily Assistant
2. Observe loading spinner
3. Navigate to Settings
4. Observe loading spinner

**Expected Result:**
- Consistent spinner animation
- Clear loading message
- Centered on screen
- No layout shifts

---

## Common Issues to Look For

### Visual Issues:
- [ ] Text too small on mobile
- [ ] Buttons too small to tap
- [ ] Horizontal scrolling
- [ ] Overlapping elements
- [ ] Poor color contrast
- [ ] Missing icons

### Functional Issues:
- [ ] Data not loading
- [ ] Navigation not working
- [ ] Forms not submitting
- [ ] Errors not displaying
- [ ] Charts not rendering
- [ ] Advice not showing

### Performance Issues:
- [ ] Slow page loads
- [ ] Laggy animations
- [ ] Delayed interactions
- [ ] Memory leaks
- [ ] Console errors

---

## Reporting Issues

When you find an issue, please note:
1. **What:** Description of the issue
2. **Where:** Which page/component
3. **When:** What action triggered it
4. **Expected:** What should happen
5. **Actual:** What actually happened
6. **Screenshot:** If visual issue

---

## Quick Commands

### Restart Servers:
```bash
# Stop servers
npm run stop

# Start servers
npm run dev
```

### View Logs:
```bash
# Backend logs
npm run dev:backend

# Frontend logs
npm run dev:frontend
```

### Run Tests:
```bash
# All tests
npm test

# Backend only
npm run test:backend

# Frontend only
npm run test:frontend
```

---

## Browser DevTools Tips

### Console (Cmd+Option+J / Ctrl+Shift+J):
- Check for JavaScript errors
- View network requests
- Inspect API responses

### Network Tab:
- Monitor API calls
- Check response times
- Simulate slow connections

### Elements Tab:
- Inspect HTML structure
- Check CSS styles
- Verify ARIA attributes

### Lighthouse (Audit):
- Performance score
- Accessibility score
- Best practices
- SEO

---

## Next Steps After Testing

1. **Document Issues:** Note any problems found
2. **Prioritize:** Categorize as critical/important/nice-to-have
3. **Discuss:** Share findings
4. **Refine:** Make necessary improvements
5. **Retest:** Verify fixes work

---

## Success Criteria

The app is ready for production when:
- ✅ All core features work correctly
- ✅ No critical bugs
- ✅ Mobile experience is good
- ✅ Accessibility is functional
- ✅ Performance is acceptable
- ✅ Error handling works
- ✅ Navigation is intuitive

---

**Happy Testing!** 🧪

Let me know what you find and we can refine anything that needs improvement!

