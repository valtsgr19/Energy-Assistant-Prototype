# Requirements Document: EV Virtual Power Plant Onboarding

## Introduction

This document specifies the requirements for an EV Virtual Power Plant (VPP) onboarding application that enables residential EV owners to enroll their vehicles into a VPP program via secure OEM authorization. The system collects user information, electricity tariff data, charging preferences, and establishes secure connections with EV manufacturer APIs to enable smart charging optimization.

## Glossary

- **VPP (Virtual Power Plant)**: A network of distributed energy resources (in this case, EVs) that can be controlled collectively to provide grid services
- **OEM (Original Equipment Manufacturer)**: The vehicle manufacturer (e.g., Tesla, BMW, Volkswagen)
- **Smart_Meter**: A digital electricity meter that records consumption in intervals and communicates data remotely
- **Import_Tariff**: The price structure for electricity purchased from the grid
- **SoC (State of Charge)**: The current battery charge level expressed as a percentage
- **TOU (Time of Use)**: A tariff structure with different rates at different times of day
- **DER (Distributed Energy Resource)**: A small-scale power generation or storage resource connected to the grid
- **Onboarding_System**: The complete application system handling user enrollment
- **User**: A residential electricity customer enrolling in the VPP program
- **Bill_Parser**: The component that extracts tariff information from uploaded electricity bills
- **Authorization_Service**: The component that handles OAuth flows with EV manufacturers

## Requirements

### Requirement 1: User Identity and Session Management

**User Story:** As a user, I want to create an account with my email address, so that I can save my progress and resume onboarding later.

#### Acceptance Criteria

1. WHEN a user provides an email address, THE Onboarding_System SHALL create a unique user identity
2. WHEN a user provides an email address, THE Onboarding_System SHALL send a verification code or magic link to that email
3. WHEN a user verifies their email, THE Onboarding_System SHALL authenticate the user session
4. WHEN a user returns with a valid session, THE Onboarding_System SHALL resume from their last completed step
5. THE Onboarding_System SHALL persist partial onboarding state for each user

### Requirement 2: Electricity Bill Processing

**User Story:** As a user, I want to upload my electricity bill, so that the system can automatically extract my tariff information.

#### Acceptance Criteria

1. WHEN a user uploads a bill file, THE Bill_Parser SHALL accept PDF, JPG, and PNG formats
2. WHEN a bill file is uploaded, THE Bill_Parser SHALL extract the supplier name, tariff name, and rate structure
3. WHEN a bill contains time-of-use rates, THE Bill_Parser SHALL extract all rate periods with start time, end time, and price per kWh
4. WHEN a bill contains flat rates, THE Bill_Parser SHALL extract the single price per kWh
5. IF bill parsing fails, THEN THE Onboarding_System SHALL provide a manual tariff entry option
6. WHEN bill parsing completes successfully, THE Onboarding_System SHALL present extracted data for user confirmation

### Requirement 3: Address and Smart Meter Consent

**User Story:** As a user, I want to provide my address and consent to smart meter data sharing, so that the system can access my electricity consumption data.

#### Acceptance Criteria

1. WHEN a user provides their address, THE Onboarding_System SHALL validate the address format including postcode and country
2. THE Onboarding_System SHALL display clear consent language explaining smart meter data usage
3. WHEN a user grants consent, THE Onboarding_System SHALL record the consent timestamp and scope
4. THE Onboarding_System SHALL require explicit consent before proceeding to tariff confirmation
5. WHEN a user confirms their address, THE Onboarding_System SHALL associate the address with their user account

### Requirement 4: Import Tariff Validation

**User Story:** As a user, I want to review and confirm my electricity tariff details, so that the system can optimize my charging based on accurate pricing.

#### Acceptance Criteria

1. WHEN tariff data is available, THE Onboarding_System SHALL display the supplier name, tariff name, and rate type
2. WHEN the tariff is time-of-use, THE Onboarding_System SHALL display all rate periods with their respective prices
3. WHEN the tariff is flat rate, THE Onboarding_System SHALL display the single price per kWh
4. THE Onboarding_System SHALL allow users to edit tariff information if incorrect
5. WHEN a user confirms tariff accuracy, THE Onboarding_System SHALL persist the tariff data for optimization

### Requirement 5: Charging Preferences Configuration

**User Story:** As a user, I want to set my charging preferences, so that my vehicle is charged according to my needs while participating in the VPP.

#### Acceptance Criteria

1. WHEN a user sets preferences, THE Onboarding_System SHALL accept a ready-by time in HH:MM format
2. WHEN a user sets preferences, THE Onboarding_System SHALL accept a minimum state of charge percentage between 0 and 100
3. WHEN a user sets preferences, THE Onboarding_System SHALL offer charging mode options: balanced, maximize rewards, or charge immediately
4. THE Onboarding_System SHALL validate that ready-by time is a valid 24-hour time format
5. WHEN preferences are saved, THE Onboarding_System SHALL persist them for use in charging optimization

### Requirement 6: EV Manufacturer Selection

**User Story:** As a user, I want to select my EV manufacturer, so that the system can connect to the correct OEM authorization service.

#### Acceptance Criteria

1. THE Onboarding_System SHALL display a selection interface for the following manufacturers: Tesla, Volkswagen, BMW, Audi, Mini, Kia, Hyundai, Fiat, Peugeot, Renault
2. WHEN a user selects a manufacturer, THE Onboarding_System SHALL route to the appropriate OEM authorization flow
3. THE Onboarding_System SHALL display manufacturer logos for visual identification
4. THE Onboarding_System SHALL provide a search capability for finding manufacturers
5. WHEN a manufacturer is selected, THE Onboarding_System SHALL persist the selection before initiating authorization

### Requirement 7: OEM Authorization

**User Story:** As a user, I want to securely authorize the VPP to access my vehicle data and control charging, so that I can participate in smart charging programs.

#### Acceptance Criteria

1. WHEN authorization begins, THE Authorization_Service SHALL redirect to the OEM's authorization page
2. THE Authorization_Service SHALL request the following scopes: read state of charge, read plug-in status, schedule charging, pause/resume charging
3. WHEN authorization succeeds, THE Authorization_Service SHALL receive and store OAuth tokens encrypted at rest
4. WHEN authorization fails, THEN THE Onboarding_System SHALL display an error message and allow retry
5. THE Authorization_Service SHALL NOT store OEM login credentials
6. WHEN authorization completes, THE Authorization_Service SHALL redirect back to the onboarding flow

### Requirement 8: Vehicle Activation

**User Story:** As a user, I want confirmation that my vehicle is successfully enrolled, so that I know the onboarding is complete and my vehicle is active in the VPP.

#### Acceptance Criteria

1. WHEN all onboarding steps are complete, THE Onboarding_System SHALL set the vehicle status to ACTIVE
2. WHEN activation succeeds, THE Onboarding_System SHALL display a success confirmation screen
3. THE Onboarding_System SHALL display a summary of: email, address, tariff, charging preferences, and connected vehicle
4. WHEN a vehicle is activated, THE Onboarding_System SHALL record the activation timestamp
5. THE Onboarding_System SHALL provide information about next steps and how to manage the enrollment

### Requirement 9: Data Persistence and Resumability

**User Story:** As a user, I want to be able to stop and resume the onboarding process, so that I can complete it at my convenience.

#### Acceptance Criteria

1. WHEN a user completes a step, THE Onboarding_System SHALL persist the step completion status
2. WHEN a user returns to the onboarding flow, THE Onboarding_System SHALL resume from the first incomplete step
3. THE Onboarding_System SHALL allow users to navigate back to previous completed steps to review or edit
4. WHEN a user edits a previous step, THE Onboarding_System SHALL update the persisted data
5. THE Onboarding_System SHALL maintain data consistency when steps are edited

### Requirement 10: Security and Privacy

**User Story:** As a user, I want my personal and vehicle data to be secure, so that I can trust the VPP service with my information.

#### Acceptance Criteria

1. THE Onboarding_System SHALL encrypt OAuth tokens at rest using industry-standard encryption
2. THE Onboarding_System SHALL NOT store OEM login credentials
3. THE Onboarding_System SHALL transmit all data over HTTPS
4. THE Onboarding_System SHALL implement scope minimization for OEM authorization requests
5. WHEN storing personal data, THE Onboarding_System SHALL comply with data protection regulations
6. THE Onboarding_System SHALL provide clear information about data usage and retention

### Requirement 11: User Interface and Experience

**User Story:** As a user, I want a clear and intuitive onboarding experience, so that I can easily complete the enrollment process.

#### Acceptance Criteria

1. THE Onboarding_System SHALL use the Kaluza brand theme including colors, typography, and layout guidelines
2. THE Onboarding_System SHALL display progress indicators showing completed and remaining steps
3. THE Onboarding_System SHALL provide clear error messages when validation fails
4. THE Onboarding_System SHALL display loading states during asynchronous operations
5. WHEN displaying forms, THE Onboarding_System SHALL provide inline validation feedback
6. THE Onboarding_System SHALL be responsive and functional on mobile and desktop devices

### Requirement 12: Backend API and Data Storage

**User Story:** As a system administrator, I want a robust backend API with flexible storage options, so that the system can be deployed in different environments.

#### Acceptance Criteria

1. THE Onboarding_System SHALL provide a RESTful API for all onboarding operations
2. THE Onboarding_System SHALL support PostgreSQL database mode for production deployments
3. THE Onboarding_System SHALL support in-memory storage mode for development and testing
4. WHEN in PostgreSQL mode, THE Onboarding_System SHALL persist all data to the database
5. WHEN in in-memory mode, THE Onboarding_System SHALL maintain data in memory for the session duration
6. THE Onboarding_System SHALL provide API endpoints for: user creation, bill upload, consent recording, tariff confirmation, preference setting, manufacturer selection, authorization callback, and activation status

### Requirement 13: Bill Upload and Storage

**User Story:** As a user, I want to upload my electricity bill securely, so that the system can process it without exposing my personal information.

#### Acceptance Criteria

1. WHEN a user uploads a bill, THE Onboarding_System SHALL validate the file size is within acceptable limits
2. WHEN a user uploads a bill, THE Onboarding_System SHALL validate the file type is PDF, JPG, or PNG
3. THE Onboarding_System SHALL store uploaded bills securely with access controls
4. WHEN bill processing begins, THE Onboarding_System SHALL display a processing indicator
5. IF bill processing takes longer than expected, THEN THE Onboarding_System SHALL provide status updates

### Requirement 14: Error Handling and Recovery

**User Story:** As a user, I want clear guidance when errors occur, so that I can resolve issues and complete onboarding.

#### Acceptance Criteria

1. WHEN an error occurs, THE Onboarding_System SHALL display a user-friendly error message
2. WHEN a recoverable error occurs, THE Onboarding_System SHALL provide clear retry instructions
3. IF OEM authorization fails, THEN THE Onboarding_System SHALL allow the user to retry authorization
4. IF bill parsing fails, THEN THE Onboarding_System SHALL offer manual tariff entry as an alternative
5. WHEN network errors occur, THE Onboarding_System SHALL preserve user data and allow continuation when connectivity is restored

### Requirement 15: Onboarding Flow Navigation

**User Story:** As a user, I want to understand where I am in the onboarding process, so that I know how much is left to complete.

#### Acceptance Criteria

1. THE Onboarding_System SHALL display the complete onboarding flow: Landing → Email → Bill Upload → Address/Consent → Tariff → Preferences → Manufacturer → Authorization → Activation
2. THE Onboarding_System SHALL indicate which steps are completed, current, and upcoming
3. THE Onboarding_System SHALL allow navigation to previous completed steps
4. THE Onboarding_System SHALL prevent skipping required steps
5. WHEN a user completes a step, THE Onboarding_System SHALL automatically advance to the next step
