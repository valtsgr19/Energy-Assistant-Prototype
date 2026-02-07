# Implementation Plan: Energy Usage Assistant

## Overview

This implementation plan breaks down the Energy Usage Assistant into discrete coding tasks. The application will be built using:

**Frontend:**
- React + TypeScript with Vite
- Tailwind CSS for styling
- Recharts for chart visualization

**Backend:**
- Node.js + TypeScript with Express
- Prisma ORM with SQLite for data persistence
- REST JSON API under `/api/...`

**Authentication:**
- Simple email + password login
- JWT-based session management

The implementation follows an incremental approach, building core functionality first, then adding features for EVs, batteries, and insights. Each task includes property-based tests to validate correctness properties from the design document.

## Tasks

- [x] 1. Set up project structure and core infrastructure
  - Initialize monorepo with frontend (Vite + React + TypeScript) and backend (Node.js + Express + TypeScript)
  - Configure Tailwind CSS for frontend styling
  - Set up testing frameworks (Jest, fast-check for property-based testing)
  - Initialize Prisma with SQLite database
  - Create Prisma schema for user profiles, configurations, and consumption data
  - Set up Express API gateway with basic routing under `/api/...`
  - Configure CORS for local development
  - _Requirements: Foundation for all features_

- [ ] 2. Implement authentication service
  - [x] 2.1 Create user registration and login endpoints
    - Implement password hashing with bcrypt
    - Generate JWT tokens for session management
    - Create user profile using Prisma
    - _Requirements: 1.2, 1.3_
  
  - [ ]* 2.2 Write property test for authentication
    - **Property 1: Authentication Success Links Account**
    - **Property 2: Authentication Failure Handling**
    - **Validates: Requirements 1.2, 1.3**
  
  - [x] 2.3 Implement energy account linking
    - Create endpoint to validate and store energy account credentials
    - Implement encrypted credential storage
    - Mock external energy provider API for development
    - _Requirements: 1.2_


- [ ] 3. Implement solar system configuration and forecasting
  - [x] 3.1 Create solar system configuration endpoints
    - Implement POST endpoint for solar configuration
    - Implement GET endpoint to retrieve configuration
    - Add Prisma operations for solar system storage
    - _Requirements: 1.5, 12.2_
  
  - [x] 3.2 Write property test for solar configuration persistence
    - **Property 3: Solar Configuration Persistence**
    - **Validates: Requirements 1.5**
  
  - [x] 3.3 Implement solar generation forecast calculation
    - Create solar irradiance model based on time of day
    - Implement orientation and tilt factor calculations
    - Generate 48 half-hour interval forecasts
    - Return zero generation for all intervals when hasSolar = false
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 3.4 Write property tests for solar forecasting
    - **Property 4: Solar Forecast Generation Completeness**
    - **Property 5: Nighttime Zero Generation**
    - **Property 6: No Solar System Zero Generation**
    - **Property 7: Daylight Generation Proportionality**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

- [ ] 4. Implement tariff data management
  - [x] 4.1 Create tariff structure data model and storage
    - Define tariff period in Prisma schema
    - Implement Prisma operations for tariff storage
    - Create endpoint to retrieve tariff for user
    - _Requirements: 3.1, 3.2_
  
  - [x] 4.2 Implement tariff-to-interval mapping
    - Create function to map tariff periods to 48 half-hour intervals
    - Calculate price for each interval based on time of day
    - _Requirements: 3.3, 3.4_
  
  - [x] 4.3 Write property tests for tariff mapping
    - **Property 7: Tariff Interval Mapping Completeness**
    - **Property 8: Price Display Unit Consistency**
    - **Validates: Requirements 3.3, 3.4**

- [ ] 5. Implement consumption data service
  - [x] 5.1 Create consumption data retrieval and storage
    - Implement endpoint to fetch consumption from external API (mocked)
    - Create Prisma operations for consumption data
    - Implement data retention policy (30 days minimum)
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ] 5.2 Write property test for consumption data retention
    - **Property 9: Consumption Data Retention**
    - **Validates: Requirements 4.3**
  
  - [x] 5.3 Implement consumption data error handling
    - Handle missing data gaps gracefully
    - Implement retry logic for API failures
    - _Requirements: 4.4_

- [x] 6. Checkpoint - Ensure core data services work
  - Verify authentication, solar forecasting, tariff mapping, and consumption retrieval
  - Run all property tests
  - Ask the user if questions arise

- [x] 7. Implement Daily Assistant chart data endpoint
  - [x] 7.1 Create chart data aggregation service
    - Combine solar forecast, consumption, and tariff data for selected day
    - Generate 48-interval chart data structure
    - Implement shading logic (green, yellow, red)
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [ ]* 7.2 Write property tests for chart data
    - **Property 10: Chart Interval Count**
    - **Property 11: Chart Data Overlay Completeness**
    - **Property 12: Chart Shading Logic**
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5, 5.6**
  
  - [x] 7.3 Implement current status calculation
    - Calculate current solar generation state (High/Medium/Low)
    - Calculate current consumption state
    - Determine current electricity price
    - Generate action prompts based on conditions
    - _Requirements: 5.7, 18.1, 18.2, 18.3, 18.4, 18.5_
  
  - [ ]* 7.4 Write property tests for current status
    - **Property 13: Current Status Display Completeness**
    - **Property 51: High Solar Low Consumption Prompt**
    - **Property 52: Peak Price Reduction Prompt**
    - **Validates: Requirements 5.7, 18.1, 18.2, 18.3, 18.4, 18.5**

- [x] 8. Implement general energy advice generation
  - [x] 8.1 Create advice generation service
    - Implement rule-based advice generation logic
    - Identify optimal times for high-energy activities
    - Prioritize advice by cost savings
    - Limit output to top 3 recommendations
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 5.8_
  
  - [x]* 8.2 Write property tests for advice generation
    - **Property 14: Advice Display Limit**
    - **Property 15: Solar Surplus Advice**
    - **Property 16: Off-Peak Advice**
    - **Property 17: Peak Avoidance Advice**
    - **Property 18: Advice Priority Ordering**
    - **Validates: Requirements 5.8, 6.1, 6.2, 6.3, 6.4, 6.5**

- [ ] 9. Implement frontend onboarding flow
  - [x] 9.1 Create onboarding UI components
    - Build energy account login screen
    - Build solar system configuration form with "I don't have solar" option
    - Build product explanation screen
    - Implement navigation between onboarding steps
    - _Requirements: 1.1, 1.4, 1.5, 1.6, 1.7, 1.8_
  
  - [ ] 9.2 Implement form validation
    - Add client-side validation for solar configuration
    - Skip solar validation when "I don't have solar" is selected
    - Display validation errors clearly
    - Prevent submission of invalid data
    - _Requirements: 1.6, 17.1, 17.2, 17.3, 17.8, 17.9_
  
  - [ ]* 9.3 Write unit tests for onboarding flow
    - Test successful onboarding completion with solar
    - Test successful onboarding completion without solar
    - Test validation error display
    - Test navigation between steps
    - _Requirements: 1.1, 1.4, 1.5, 1.6, 1.7, 1.8_

- [ ] 10. Implement frontend Daily Assistant view
  - [x] 10.1 Create Daily Assistant UI components with React
    - Build day selection toggle (today/tomorrow)
    - Build 24-hour chart component using Recharts with 48 intervals
    - Implement chart shading visualization with Tailwind CSS
    - Display current status section
    - Display advice list
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_
  
  - [x] 10.2 Integrate chart with backend API
    - Fetch chart data from API
    - Handle loading and error states
    - Update chart when day selection changes
    - _Requirements: 5.1, 5.2_
  
  - [ ]* 10.3 Write unit tests for Daily Assistant UI
    - Test day selection toggle
    - Test chart rendering with sample data
    - Test advice display
    - _Requirements: 5.1, 5.2, 5.8_

- [x] 11. Checkpoint - Ensure basic app flow works
  - Test complete flow: onboarding → Daily Assistant
  - Verify chart displays correctly with shading
  - Verify advice generation works
  - Ask the user if questions arise

- [ ] 12. Implement EV configuration management
  - [x] 12.1 Create EV configuration endpoints
    - Implement POST endpoint to add EV
    - Implement PUT endpoint to edit EV
    - Implement DELETE endpoint to remove EV
    - Create Prisma operations for EV storage
    - _Requirements: 7.1, 7.2, 7.4, 7.5_
  
  - [x] 12.2 Implement EV battery capacity inference
    - Create lookup table for common EV makes/models
    - Implement inference logic based on make and model
    - _Requirements: 7.3_
  
  - [x]* 12.3 Write property tests for EV configuration
    - **Property 19: EV Battery Capacity Inference**
    - **Property 20: EV Configuration Persistence**
    - **Property 21: EV CRUD Operations**
    - **Validates: Requirements 7.3, 7.4, 7.5**

- [ ] 13. Implement EV charging advice generation
  - [x] 13.1 Create EV charging advice logic
    - Calculate required charging duration
    - Identify optimal charging windows (overnight, midday solar)
    - Prioritize windows by cost
    - Generate EV-specific advice items
    - _Requirements: 7.6, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [x]* 13.2 Write property tests for EV advice
    - **Property 22: EV Advice Generation**
    - **Property 23: EV Charging Duration Calculation**
    - **Property 24: Overnight Charging Recommendation**
    - **Property 25: Solar Charging Recommendation**
    - **Property 26: Charging Window Prioritization**
    - **Validates: Requirements 7.6, 8.1, 8.2, 8.3, 8.4, 8.6**

- [ ] 14. Implement home battery configuration management
  - [x] 14.1 Create battery configuration endpoints
    - Implement POST endpoint to add battery
    - Implement PUT endpoint to edit battery
    - Implement DELETE endpoint to remove battery
    - Create Prisma operations for battery storage
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [x]* 14.2 Write property tests for battery configuration
    - **Property 27: Battery Configuration Persistence**
    - **Property 28: Battery CRUD Operations**
    - **Validates: Requirements 9.3, 9.4**

- [ ] 15. Implement battery charging advice generation
  - [x] 15.1 Create battery charging advice logic
    - Analyze tomorrow's solar forecast
    - Calculate expected surplus/deficit
    - Generate battery-specific advice based on forecast
    - Consider battery capacity and power rating
    - _Requirements: 9.5, 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x]* 15.2 Write property tests for battery advice
    - **Property 29: Battery Advice Generation**
    - **Property 30: High Solar Forecast Battery Advice**
    - **Property 31: Low Solar Forecast Battery Advice**
    - **Validates: Requirements 9.5, 10.1, 10.2, 10.3**

- [ ] 16. Implement frontend Settings view
  - [x] 16.1 Create Settings UI components with React and Tailwind CSS
    - Build account overview section
    - Build solar system settings form with option to add/edit solar or indicate no solar
    - Build EV management section (add/edit/remove)
    - Build battery management section (add/edit/remove)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.6, 7.1, 9.1_
  
  - [x] 16.2 Implement settings form validation
    - Add validation for all input fields
    - Display validation errors and warnings
    - Implement save functionality with API integration
    - _Requirements: 12.3, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9_
  
  - [ ]* 16.3 Write property test for input validation
    - **Property 48: Input Validation Bounds**
    - **Property 49: Validation Error Display**
    - **Property 50: Unusual Value Warning**
    - **Validates: Requirements 17.1-17.9**
  
  - [x] 16.4 Implement solar settings modification trigger
    - Trigger forecast regeneration when solar settings saved
    - Display loading indicator during regeneration
    - Update Daily Assistant with new forecasts
    - _Requirements: 12.4_
  
  - [ ]* 16.5 Write property test for forecast regeneration
    - **Property 37: Solar Settings Modification Triggers Forecast Regeneration**
    - **Validates: Requirements 12.4**

- [x] 17. Checkpoint - Ensure EV and battery features work
  - Test adding, editing, and removing EVs and batteries
  - Verify EV and battery advice appears in Daily Assistant
  - Verify settings validation works correctly
  - Ask the user if questions arise

- [ ] 18. Implement energy events service
  - [x] 18.1 Create energy events data model and endpoints
    - Define energy event in Prisma schema
    - Implement endpoint to retrieve active events
    - Create Prisma operations for events
    - _Requirements: 11.1, 11.2_
  
  - [x] 18.2 Integrate events into chart display
    - Add red shading for event intervals
    - Display event information (time, type, incentive)
    - _Requirements: 11.1, 11.2_
  
  - [ ]* 18.3 Write property tests for energy events
    - **Property 32: Energy Event Display**
    - **Property 33: Energy Event Information Completeness**
    - **Validates: Requirements 11.1, 11.2**
  
  - [x] 18.4 Implement event-based advice generation
    - Generate advice for increase events
    - Generate advice for decrease events
    - _Requirements: 11.3, 11.4_
  
  - [ ]* 18.5 Write property tests for event advice
    - **Property 34: Increase Event Advice Alignment**
    - **Property 35: Decrease Event Advice Alignment**
    - **Validates: Requirements 11.3, 11.4**
  
  - [x] 18.6 Implement event participation tracking
    - Calculate baseline consumption
    - Track actual consumption during event
    - Calculate performance delta
    - Store participation records
    - _Requirements: 11.5_
  
  - [ ]* 18.7 Write property test for participation tracking
    - **Property 36: Event Participation Tracking**
    - **Validates: Requirements 11.5**

- [ ] 19. Implement consumption disaggregation service
  - [x] 19.1 Create pattern detection algorithms
    - Implement HVAC cycle detection
    - Implement water heater peak detection
    - Implement EV charging pattern detection
    - Calculate baseload and discretionary load
    - _Requirements: 14.2_
  
  - [x] 19.2 Create disaggregation endpoint
    - Aggregate consumption by category
    - Calculate percentages
    - Detect EV usage patterns
    - _Requirements: 14.1, 14.2, 14.3_
  
  - [ ]* 19.3 Write property test for disaggregation
    - **Property 40: Consumption Disaggregation Completeness**
    - **Property 41: EV Pattern Detection Prompt**
    - **Validates: Requirements 14.2, 14.3**

- [ ] 20. Implement solar performance insights
  - [x] 20.1 Create solar performance calculation service
    - Calculate total generation and export
    - Calculate self-consumption percentage
    - Generate recommendations based on export levels
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_
  
  - [ ]* 20.2 Write property tests for solar insights
    - **Property 42: Solar Performance Metrics Display**
    - **Property 43: High Export Battery Suggestion**
    - **Property 44: High Export EV Suggestion**
    - **Validates: Requirements 15.2, 15.3, 15.4**

- [ ] 21. Implement household comparison and energy personality
  - [x] 21.1 Create energy personality assignment logic
    - Calculate consumption ratios (peak, off-peak)
    - Calculate solar self-consumption
    - Implement personality type assignment
    - _Requirements: 16.2_
  
  - [ ]* 21.2 Write property test for personality assignment
    - **Property 45: Energy Personality Assignment**
    - **Validates: Requirements 16.2**
  
  - [x] 21.3 Create household comparison endpoint
    - Calculate user average consumption
    - Compare to similar household average
    - Return personality with visual and description
    - Return event participation history
    - _Requirements: 16.1, 16.3, 16.4, 16.5_
  
  - [ ]* 21.4 Write property tests for insights display
    - **Property 46: Energy Personality Display Completeness**
    - **Property 47: Event History Display Completeness**
    - **Validates: Requirements 16.3, 16.4, 16.5**

- [ ] 22. Implement frontend Energy Insights view
  - [x] 22.1 Create Energy Insights UI components with React and Tailwind CSS
    - Build consumption disaggregation display
    - Build solar performance summary
    - Build household comparison section
    - Build energy personality display
    - Build event history display
    - _Requirements: 14.1, 15.1, 16.1_
  
  - [x] 22.2 Integrate insights with backend API
    - Fetch disaggregation data
    - Fetch solar performance data
    - Fetch household comparison data
    - Handle loading and error states
    - _Requirements: 14.1, 15.1, 16.1_
  
  - [ ]* 22.3 Write unit tests for Energy Insights UI
    - Test disaggregation display
    - Test solar performance display
    - Test personality display
    - _Requirements: 14.1, 15.1, 16.1_

- [x] 23. Implement navigation system
  - [x] 23.1 Create bottom navigation bar component
    - Build navigation bar with three options
    - Implement view switching logic
    - Add active section indicator
    - Maintain state when switching views
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [ ]* 23.2 Write property tests for navigation
    - **Property 38: Navigation View Switching**
    - **Property 39: Navigation State Persistence**
    - **Validates: Requirements 13.3, 13.4, 13.5**

- [ ] 24. Checkpoint - Ensure complete app functionality
  - Test all three main views (Daily Assistant, Energy Insights, Settings)
  - Test navigation between views
  - Test energy events display and participation
  - Test insights calculations
  - Ask the user if questions arise

- [x] 25. Implement error handling and edge cases
  - [x] 25.1 Add authentication error handling
    - Handle invalid credentials gracefully
    - Implement session expiration handling
    - Add rate limiting for login attempts
    - _Requirements: 1.3_
  
  - [x] 25.2 Add data retrieval error handling
    - Handle missing consumption data gaps
    - Handle tariff data unavailable scenarios
    - Handle solar forecast calculation errors
    - _Requirements: 4.4_
  
  - [x] 25.3 Add validation and network error handling
    - Handle out-of-range values
    - Handle invalid data types
    - Handle network errors during save
    - _Requirements: 17.8_
  
  - [ ]* 25.4 Write unit tests for error handling
    - Test authentication failures
    - Test missing data handling
    - Test validation errors
    - _Requirements: 1.3, 4.4, 17.8_

- [x] 26. Implement responsive design and accessibility
  - [x] 26.1 Add responsive styles for mobile and tablet
    - Optimize chart rendering for small screens
    - Adjust navigation for mobile devices
    - Ensure forms work well on touch devices
    - _Requirements: All UI requirements_
  
  - [x] 26.2 Implement accessibility features
    - Add keyboard navigation support
    - Add ARIA labels and roles
    - Ensure color contrast meets WCAG 2.1
    - Add screen reader support
    - _Requirements: All UI requirements_
  
  - [ ]* 26.3 Write accessibility tests
    - Test keyboard navigation
    - Test screen reader compatibility
    - Test color contrast ratios
    - _Requirements: All UI requirements_

- [ ] 27. Final integration and end-to-end testing
  - [ ] 27.1 Write end-to-end tests
    - Test complete onboarding flow
    - Test adding EV and verifying advice
    - Test adding battery and verifying advice
    - Test event participation flow
    - Test settings modification flow
    - _Requirements: All requirements_
  
  - [ ] 27.2 Performance optimization
    - Optimize chart rendering performance
    - Optimize API response times
    - Implement caching where appropriate
    - _Requirements: All requirements_
  
  - [ ]* 27.3 Run full test suite
    - Execute all unit tests
    - Execute all property-based tests
    - Execute all integration tests
    - Execute all end-to-end tests
    - _Requirements: All requirements_

- [ ] 28. Final checkpoint - Complete application ready
  - Verify all features work end-to-end
  - Verify all tests pass
  - Verify error handling works correctly
  - Verify responsive design on multiple devices
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation throughout development
- The implementation uses React + TypeScript with Vite for the frontend
- Tailwind CSS is used for styling
- Recharts is used for chart visualization
- Backend uses Node.js + Express + TypeScript
- Prisma ORM with SQLite for data persistence
- Fast-check library is used for property-based testing with minimum 100 iterations per test
