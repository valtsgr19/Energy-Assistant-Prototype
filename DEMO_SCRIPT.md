# Energy Usage Assistant - Demo Script

## Overview
This demo showcases a residential energy management application that helps consumers reduce costs and carbon footprint through actionable, personalized advice.

**Duration:** 10-15 minutes  
**Audience:** Stakeholders, potential users, investors  
**Demo Environment:** http://localhost:3000

---

## Demo Flow

### 1. Introduction (1 min)
**What to say:**
> "Today I'll show you the Energy Usage Assistant - an application that helps residential customers optimize their energy usage, reduce costs, and participate in grid flexibility programs. The app provides personalized advice based on their solar generation, time-of-use tariffs, and flexible assets like EVs and batteries."

**Key Points:**
- Targets residential electricity customers
- Focuses on actionable advice, not automation
- Integrates solar, EVs, batteries, and grid events
- Educational and advisory

---

### 2. Onboarding Flow (2 min)

**Navigate to:** http://localhost:3000/onboarding

**What to show:**
1. **Energy Account Login**
   - "Users start by linking their energy provider account"
   - Enter: test@example.com / password123
   - "This gives us access to their consumption data and tariff structure"

2. **Solar Configuration**
   - "Next, we capture their solar system details"
   - Show: System size, tilt, orientation options
   - "Users can also indicate they don't have solar - the app adapts"
   - Select: "I have solar" → 5 kW, 30°, North

3. **Product Explanation**
   - "We explain what the app does and set expectations"
   - Click through to complete onboarding

**Key Points:**
- Simple, guided onboarding
- Adapts to user's setup (solar/no solar)
- Sets clear expectations

---

### 3. Daily Assistant - Core Value Proposition (5 min)

**Navigate to:** Daily Assistant (should auto-navigate)

#### A. Current Status
**What to show:**
- "The app shows real-time status - current solar generation, consumption, and price"
- Point out the action prompt
- "This helps users make immediate decisions"

#### B. Upcoming Energy Event
**What to show:**
- "Here's an upcoming grid flexibility event"
- Point out: Time, type (increase/decrease), incentive amount
- "The app tells users exactly what to do and how much they can earn"

**Key Points:**
- Clear, actionable guidance
- Financial incentive is prominent
- Explains what actions to take (charge EV, run appliances, etc.)

#### C. Energy Charts
**What to show:**
1. **Your Energy Chart**
   - "This 24-hour view shows solar generation in yellow and consumption in blue"
   - Point out: Blue shaded areas = energy events
   - "The current time indicator helps users see where they are"
   - Toggle to Tomorrow: "Users can plan ahead"

2. **Your Tariff Chart**
   - "This shows their time-of-use pricing throughout the day"
   - "Peak prices are in the evening, off-peak overnight"

3. **Indicator Bar**
   - "Below the chart, green shows good times to use energy"
   - "Red shows times to avoid high usage"
   - "This makes it easy to see at a glance"

**Key Points:**
- Visual, easy to understand
- Combines multiple data sources (solar, consumption, price, events)
- Helps users plan their day

#### D. Energy Advice
**What to show:**
1. **Home Energy Advice**
   - "The app provides top 3 recommendations"
   - Click to expand
   - Point out: Time windows, estimated savings, priority
   - "Each piece of advice is specific and actionable"

2. **EV/Battery Sections** (if configured)
   - "If users have an EV or battery, they get specialized advice"
   - "For example: optimal charging windows based on solar and pricing"

**Key Points:**
- Prioritized by savings potential
- Specific time windows
- Adapts to user's assets (EV, battery)

---

### 4. Energy Insights - Understanding Usage (4 min)

**Navigate to:** Energy Insights tab

#### A. Consumption Disaggregation
**What to show:**
- "This breaks down energy usage by category"
- Point out: HVAC, Water Heater, EV Charging, Baseload, Discretionary
- "Users can see where their energy goes"
- **If EV pattern detected:** "The app even detects EV charging patterns and prompts users to add their EV for better advice"

**Key Points:**
- Helps identify savings opportunities
- Pattern detection is intelligent
- Percentages make it easy to understand

#### B. Solar Performance (if solar configured)
**What to show:**
- "For solar customers, we show performance metrics"
- Point out: Total generation, self-consumption %, export
- "Recommendations help optimize solar usage"
- Example: "Consider a battery if exporting a lot"

**Key Points:**
- Validates solar investment
- Identifies optimization opportunities
- Personalized recommendations

#### C. Household Comparison
**What to show:**
- "Users get an energy personality based on their patterns"
- Point out: Personality emoji and description
- "They can see how they compare to similar households"
- "Event participation history shows their impact"

**Key Points:**
- Gamification element
- Social comparison motivates behavior change
- Tracks participation in grid events

---

### 5. Settings - Flexibility & Control (2 min)

**Navigate to:** Settings tab

**What to show:**
1. **Solar Settings**
   - "Users can update their solar configuration anytime"
   - "The app recalculates forecasts immediately"

2. **EV Management**
   - "Adding an EV is simple - we infer battery capacity from make/model"
   - Show: Add EV flow
   - "This unlocks EV-specific charging advice"

3. **Battery Management**
   - "Same for home batteries"
   - "The app provides battery charging strategies"

**Key Points:**
- Easy to manage assets
- Changes immediately affect advice
- Flexible as user's situation changes

---

### 6. Key Features Summary (1 min)

**What to say:**
> "To summarize, the Energy Usage Assistant provides:
> 1. **Real-time guidance** - Know what to do right now
> 2. **24-hour planning** - See the full day ahead with visual charts
> 3. **Personalized advice** - Top 3 recommendations based on your setup
> 4. **Grid participation** - Earn incentives through energy events
> 5. **Usage insights** - Understand where your energy goes
> 6. **Solar optimization** - Maximize your solar investment
> 7. **Asset management** - Optimize EV and battery usage"

---

## Q&A Preparation

### Expected Questions

**Q: How does it get consumption data?**
A: "It connects to the user's energy provider account. We're currently using mock data for demonstration, but the architecture supports integration with major provider APIs."

**Q: What about privacy and security?**
A: "Energy account credentials are encrypted. Users control what data they share. The app only accesses what's needed for advice generation."

**Q: Does it control devices automatically?**
A: "No, this version is advisory only. It tells users what to do, but they maintain control. This builds trust and understanding before any automation."

**Q: What energy providers does it support?**
A: "The architecture is provider-agnostic. We can integrate with any provider that offers an API or data export. Initial focus would be on [specific region/providers]."

**Q: How accurate is the solar forecasting?**
A: "We use a physics-based model considering system size, orientation, and tilt. For production, we'd integrate with weather APIs for more accuracy."

**Q: Can users without solar use this?**
A: "Absolutely! The app adapts. Users without solar still get tariff-based advice, event participation, and consumption insights."

**Q: What's the business model?**
A: "Several options: B2C subscription, B2B2C through energy providers, or revenue share from grid event participation. Open to discussion based on your strategy."

---

## Demo Tips

### Before the Demo
- [ ] Clear browser cache and cookies
- [ ] Ensure both servers are running
- [ ] Test the full flow once
- [ ] Have backup screenshots ready
- [ ] Prepare for network issues (have offline screenshots)

### During the Demo
- **Pace yourself** - Don't rush through screens
- **Pause for questions** - Especially after each major section
- **Use the mouse deliberately** - Point to specific elements
- **Narrate your actions** - "Now I'm clicking on..."
- **Highlight key numbers** - Savings amounts, percentages, etc.

### After the Demo
- **Ask for feedback** - "What resonates most with you?"
- **Discuss next steps** - Pilot users, specific providers, etc.
- **Document feedback** - Take notes on suggestions
- **Follow up** - Send summary and next steps

---

## Success Metrics

What to listen for in feedback:
- ✅ "This would be useful for our customers"
- ✅ "The advice is clear and actionable"
- ✅ "I can see myself using this"
- ✅ "The insights are valuable"
- ⚠️ "I'm not sure I understand [feature]" → Needs clearer explanation
- ⚠️ "Would it also do [X]?" → Feature request to consider
- ❌ "I don't see the value" → Fundamental issue to address

---

## Next Steps After Demo

Based on feedback:
1. **Positive reception** → Plan pilot with real users
2. **Feature requests** → Prioritize and iterate
3. **Integration questions** → Research specific provider APIs
4. **Business model discussion** → Prepare detailed proposal

---

**Demo Prepared By:** [Your Name]  
**Date:** [Date]  
**Version:** 1.0
