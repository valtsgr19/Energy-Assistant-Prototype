# Requirements Document: Energy Usage Assistant

## Introduction

The Energy Usage Assistant is a residential electricity management application that helps consumers reduce energy costs and carbon footprint through actionable advice. The system consumes half-hourly electricity consumption data, time-of-use tariff information, and rooftop solar generation forecasts to provide scheduling recommendations. Users can optionally add flexible energy assets (Electric Vehicles and home batteries) to receive tailored scheduling advice. This initial version is educational and advisory only, without direct device control or automated optimization.

## Glossary

- **System**: The Energy Usage Assistant application
- **User**: A residential electricity customer using the application
- **Energy_Account**: The user's electricity provider account containing tariff and consumption data
- **Solar_System**: A rooftop solar panel installation with specified capacity, tilt, and orientation
- **EV**: Electric Vehicle with battery capacity and charging characteristics
- **Home_Battery**: A stationary battery storage system with power and capacity specifications
- **Half_Hour_Interval**: A 30-minute time period used for consumption and generation measurements
- **Tariff_Period**: A time range with associated electricity pricing (off-peak, shoulder, peak)
- **Energy_Event**: A time-bound incentive program encouraging consumption increase or decrease
- **Consumption_Data**: Historical half-hourly electricity usage measurements
- **Solar_Forecast**: Predicted solar generation for future time periods
- **Energy_Advice**: Actionable recommendations for when to increase or reduce electricity usage

## Requirements

### Requirement 1: User Onboarding

**User Story:** As a new user, I want to complete an onboarding process, so that the system can access my energy data and provide personalized advice.

#### Acceptance Criteria

1. WHEN a new user accesses the application, THE System SHALL display an energy account login screen
2. WHEN a user provides valid Energy_Account credentials, THE System SHALL authenticate and link the account to the user profile
3. WHEN authentication fails, THE System SHALL display an error message and allow retry
4. WHEN authentication succeeds, THE System SHALL proceed to solar system configuration
5. WHEN a user selects "I don't have solar", THE System SHALL skip solar configuration and set solar generation to zero for all forecasts
6. WHEN a user provides Solar_System details (size in kW, tilt in degrees, orientation), THE System SHALL validate and store the configuration
7. WHEN solar configuration is complete or skipped, THE System SHALL display a product explanation screen
8. WHEN the product explanation is acknowledged, THE System SHALL complete onboarding and navigate to the Daily Assistant view

### Requirement 2: Solar Generation Forecasting

**User Story:** As a user with rooftop solar, I want the system to forecast my solar generation, so that I can plan energy usage around solar availability.

#### Acceptance Criteria

1. WHEN Solar_System details are configured, THE System SHALL generate 24-hour solar generation forecasts
2. WHEN a user has selected "I don't have solar", THE System SHALL set all solar generation values to zero
3. WHEN generating forecasts, THE System SHALL calculate output for each Half_Hour_Interval based on system size, tilt, and orientation
4. WHEN the time of day is between sunset and sunrise, THE System SHALL forecast zero solar generation
5. WHEN the time of day is during daylight hours, THE System SHALL forecast generation proportional to solar irradiance and system capacity
6. THE System SHALL provide forecasts for both today and tomorrow

### Requirement 3: Tariff Data Management

**User Story:** As a user, I want the system to understand my electricity tariff, so that it can identify expensive and cheap periods.

#### Acceptance Criteria

1. WHEN an Energy_Account is linked, THE System SHALL retrieve the associated time-of-use tariff structure
2. THE System SHALL store tariff rates for each Tariff_Period (off-peak, shoulder, peak)
3. THE System SHALL map each Half_Hour_Interval to its corresponding electricity price
4. WHEN displaying pricing information, THE System SHALL show rates in dollars per kilowatt-hour
5. THE System SHALL support tariff structures with multiple pricing periods per day

### Requirement 4: Consumption Data Retrieval

**User Story:** As a user, I want the system to access my historical consumption data, so that it can provide insights based on my actual usage patterns.

#### Acceptance Criteria

1. WHEN an Energy_Account is linked, THE System SHALL retrieve half-hourly Consumption_Data
2. THE System SHALL store consumption measurements for each Half_Hour_Interval
3. THE System SHALL maintain at least 30 days of historical Consumption_Data
4. WHEN consumption data is unavailable for a period, THE System SHALL handle the gap gracefully
5. THE System SHALL display consumption in kilowatt-hours per half-hour interval

### Requirement 5: Daily Assistant View

**User Story:** As a user, I want to view a 24-hour energy chart with recommendations, so that I can make informed decisions about when to use electricity.

#### Acceptance Criteria

1. WHEN a user navigates to the Daily Assistant, THE System SHALL display a day selection toggle for today and tomorrow
2. WHEN a day is selected, THE System SHALL display a 24-hour chart with 48 Half_Hour_Intervals
3. THE System SHALL overlay solar generation, home consumption, and electricity price on the chart
4. WHEN a Half_Hour_Interval has low electricity prices or high solar generation, THE System SHALL shade it green
5. WHEN a Half_Hour_Interval has high electricity prices, THE System SHALL shade it yellow
6. WHEN a Half_Hour_Interval contains an Energy_Event, THE System SHALL shade it red
7. WHEN today is selected, THE System SHALL display current status including solar generation state, consumption state, and current price
8. THE System SHALL display up to 3 high-impact Energy_Advice items below the chart

### Requirement 6: General Energy Advice Generation

**User Story:** As a user, I want to receive actionable energy advice, so that I can reduce costs and carbon footprint.

#### Acceptance Criteria

1. WHEN generating Energy_Advice, THE System SHALL identify optimal times for high-energy activities
2. WHEN solar generation is forecasted to be high, THE System SHALL recommend scheduling activities during those periods
3. WHEN off-peak tariff periods are available, THE System SHALL recommend scheduling activities during those periods
4. WHEN peak tariff periods are identified, THE System SHALL recommend avoiding high-energy activities
5. THE System SHALL prioritize advice by potential cost savings
6. THE System SHALL limit displayed advice to the top 3 recommendations

### Requirement 7: Electric Vehicle Management

**User Story:** As an EV owner, I want to add my vehicle details, so that I can receive charging schedule recommendations.

#### Acceptance Criteria

1. WHEN a user navigates to Settings, THE System SHALL provide an option to add an EV
2. WHEN adding an EV, THE System SHALL request make, model, charging speed, and average daily mileage
3. WHEN EV make and model are provided, THE System SHALL infer battery capacity
4. WHEN an EV is configured, THE System SHALL store the vehicle details
5. THE System SHALL allow users to edit or remove configured EVs
6. WHERE an EV is configured, THE System SHALL generate EV-specific charging advice

### Requirement 8: EV Charging Advice

**User Story:** As an EV owner, I want charging schedule recommendations, so that I can charge at optimal times.

#### Acceptance Criteria

1. WHERE an EV is configured, WHEN generating Energy_Advice, THE System SHALL include EV charging recommendations
2. WHEN calculating charging duration, THE System SHALL use average daily mileage, battery capacity, and charging speed
3. WHEN off-peak periods are available overnight, THE System SHALL recommend overnight charging
4. WHEN solar generation is forecasted to exceed home consumption, THE System SHALL recommend midday charging
5. THE System SHALL display estimated charging duration required
6. THE System SHALL prioritize charging windows by cost savings

### Requirement 9: Home Battery Management

**User Story:** As a battery owner, I want to add my battery details, so that I can receive charging and discharge recommendations.

#### Acceptance Criteria

1. WHEN a user navigates to Settings, THE System SHALL provide an option to add a Home_Battery
2. WHEN adding a Home_Battery, THE System SHALL request power rating in kW and capacity in kWh
3. WHEN a Home_Battery is configured, THE System SHALL store the battery specifications
4. THE System SHALL allow users to edit or remove configured batteries
5. WHERE a Home_Battery is configured, THE System SHALL generate battery-specific advice

### Requirement 10: Battery Charging Advice

**User Story:** As a battery owner, I want charging recommendations, so that I can optimize battery usage for cost savings.

#### Acceptance Criteria

1. WHERE a Home_Battery is configured, WHEN generating Energy_Advice, THE System SHALL include battery recommendations
2. WHEN tomorrow's solar forecast is high, THE System SHALL recommend leaving battery capacity for solar charging
3. WHEN tomorrow's solar forecast is low, THE System SHALL recommend overnight battery charging during off-peak periods
4. WHEN peak tariff periods are approaching, THE System SHALL recommend pre-charging the battery
5. THE System SHALL consider battery capacity and power rating in recommendations

### Requirement 11: Energy Events

**User Story:** As a user, I want to participate in energy events with incentives, so that I can earn rewards while helping grid stability.

#### Acceptance Criteria

1. WHEN an Energy_Event is scheduled, THE System SHALL display it on the 24-hour chart with red shading
2. WHEN displaying an Energy_Event, THE System SHALL show the event time range, type (increase or decrease), and incentive details
3. WHEN an Energy_Event requests increased consumption, THE System SHALL recommend high-energy activities during the event window
4. WHEN an Energy_Event requests decreased consumption, THE System SHALL recommend avoiding activities during the event window
5. THE System SHALL track user participation in Energy_Events for historical display

### Requirement 12: Settings Management

**User Story:** As a user, I want to view and modify my configuration, so that I can keep my profile accurate.

#### Acceptance Criteria

1. WHEN a user navigates to Settings, THE System SHALL display the Energy_Account ID as read-only
2. WHERE a Solar_System is configured, THE System SHALL allow editing of Solar_System size, tilt, and orientation
3. WHERE no Solar_System is configured, THE System SHALL provide an option to add solar system details
4. WHEN Solar_System settings are modified, THE System SHALL validate the new values
5. WHEN Solar_System settings are saved, THE System SHALL regenerate solar forecasts
6. THE System SHALL provide sections for adding and managing EVs and Home_Batteries

### Requirement 13: Navigation

**User Story:** As a user, I want to navigate between app sections, so that I can access different features easily.

#### Acceptance Criteria

1. THE System SHALL display a persistent bottom navigation bar
2. THE System SHALL provide navigation options for Daily Assistant, Energy Insights, and Settings
3. WHEN a navigation option is selected, THE System SHALL switch to the corresponding view
4. THE System SHALL indicate the currently active section in the navigation bar
5. THE System SHALL maintain navigation state when switching between sections

### Requirement 14: Energy Insights - Consumption Disaggregation

**User Story:** As a user, I want to see how my energy is used by device category, so that I can identify opportunities for savings.

#### Acceptance Criteria

1. WHEN a user navigates to Energy Insights, THE System SHALL display consumption disaggregation
2. THE System SHALL estimate energy usage by device category based on Consumption_Data patterns
3. WHEN EV usage patterns are detected and no EV is configured, THE System SHALL prompt the user to add EV details
4. THE System SHALL display consumption breakdown as percentages or absolute values
5. THE System SHALL use historical data to improve disaggregation accuracy

### Requirement 15: Energy Insights - Solar Performance

**User Story:** As a user with solar, I want to see my solar performance summary, so that I can understand my system's effectiveness.

#### Acceptance Criteria

1. WHERE a Solar_System is configured, WHEN viewing Energy Insights, THE System SHALL display solar performance metrics
2. THE System SHALL show total solar generation and export levels
3. WHEN solar export levels are high, THE System SHALL suggest considering a Home_Battery
4. WHEN solar export levels are high, THE System SHALL suggest considering an EV for solar utilization
5. WHEN solar utilization is low relative to consumption, THE System SHALL suggest increasing system size

### Requirement 16: Energy Insights - Household Comparison

**User Story:** As a user, I want to compare my usage to similar households, so that I can understand my relative performance.

#### Acceptance Criteria

1. WHEN viewing Energy Insights, THE System SHALL display a comparison to average household consumption
2. THE System SHALL assign an Energy Personality based on consumption patterns
3. WHEN displaying Energy Personality, THE System SHALL show a visual representation and descriptive text
4. THE System SHALL display Energy_Event participation history with dates, types, and performance metrics
5. WHEN an Energy_Event was completed, THE System SHALL show the consumption change in kWh

### Requirement 17: Data Validation

**User Story:** As a user, I want the system to validate my inputs, so that I receive accurate advice based on correct data.

#### Acceptance Criteria

1. WHEN a user enters Solar_System size, THE System SHALL validate it is a positive number not exceeding 100 kW
2. WHEN a user enters panel tilt, THE System SHALL validate it is between 0 and 90 degrees inclusive
3. WHEN a user enters panel orientation, THE System SHALL validate it is one of the eight cardinal directions (N, NE, E, SE, S, SW, W, NW)
4. WHEN a user enters EV charging speed, THE System SHALL validate it is a positive number not exceeding 50 kW
5. WHEN a user enters average daily mileage, THE System SHALL validate it is a positive number not exceeding 500 miles
6. WHEN a user enters battery power, THE System SHALL validate it is a positive number not exceeding 100 kW
7. WHEN a user enters battery capacity, THE System SHALL validate it is a positive number not exceeding 500 kWh
8. WHEN validation fails, THE System SHALL display a clear error message and prevent saving invalid data
9. WHEN Solar_System size is below 1 kW or above 50 kW, THE System SHALL display a warning suggesting the user verify the value

### Requirement 18: Current Status Display

**User Story:** As a user viewing today's data, I want to see current conditions, so that I can make immediate decisions.

#### Acceptance Criteria

1. WHEN today is selected in Daily Assistant, THE System SHALL display current solar generation state (High, Medium, Low)
2. WHEN today is selected, THE System SHALL display current consumption state (High, Medium, Low)
3. WHEN today is selected, THE System SHALL display the current electricity price
4. WHEN solar generation is high and consumption is low, THE System SHALL display a prompt to increase usage
5. WHEN electricity price is at peak rates, THE System SHALL display a prompt to reduce usage
