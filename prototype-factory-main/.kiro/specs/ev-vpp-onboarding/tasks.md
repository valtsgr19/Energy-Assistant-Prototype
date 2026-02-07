# Implementation Plan: EV Virtual Power Plant Onboarding

## Overview

This implementation plan breaks down the EV VPP onboarding application into incremental, testable steps. The approach follows a bottom-up strategy: building core services first, then API endpoints, then frontend components, and finally integrating everything together. Each major component includes optional property-based tests to validate correctness properties from the design document.

The implementation uses React + TypeScript for the frontend, Express + TypeScript for the backend, and supports both PostgreSQL and in-memory storage modes.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Create monorepo structure with frontend and backend packages
  - Initialize TypeScript configuration for both packages
  - Install core dependencies: React, Express, pg, fast-check, jest
  - Set up build scripts and development environment
  - Configure ESLint and Prettier for code quality
  - _Requirements: 12.1_

- [-] 2. Implement storage abstraction layer
  - [x] 2.1 Create StorageService interface with all required methods
    - Define interface for user, progress, tariff, preferences, and authorization operations
    - Include TypeScript types for all data models
    - _Requirements: 12.1, 12.2, 12.3_
  
  - [x] 2.2 Implement InMemoryStorageService
    - Use Map data structures for all entities
    - Implement all CRUD operations
    - Ensure data isolation between users
    - _Requirements: 12.3, 12.5_
  
  - [ ] 2.3 Implement PostgresStorageService
    - Create database connection pool
    - Implement all CRUD operations using pg library
    - Add proper error handling and connection management
    - _Requirements: 12.2, 12.4_
  
  - [ ]* 2.4 Write property test for data persistence round trip
    - **Property 3: Onboarding Progress Persistence (Round Trip)**
    - **Validates: Requirements 1.5, 3.5, 4.5, 5.5, 6.5, 9.1, 9.4**
  
  - [ ]* 2.5 Write property test for data isolation
    - **Property 34: Storage Mode Data Isolation**
    - **Validates: Requirements 12.4, 12.5**
  
  - [ ]* 2.6 Write unit tests for storage services
    - Test both PostgreSQL and in-memory implementations
    - Test error handling and edge cases
    - _Requirements: 12.2, 12.3_

- [ ] 3. Implement encryption service
  - [ ] 3.1 Create EncryptionService with AES-256-GCM
    - Implement encrypt and decrypt methods
    - Use crypto module with proper IV and auth tag handling
    - Load encryption key from environment variable
    - _Requirements: 10.1_
  
  - [ ]* 3.2 Write property test for encryption round trip
    - **Property 19: OAuth Token Encryption**
    - **Validates: Requirements 7.3, 10.1**
  
  - [ ]* 3.3 Write unit tests for encryption edge cases
    - Test with empty strings, special characters, long strings
    - Test error handling for invalid ciphertext
    - _Requirements: 10.1_

- [x] 4. Implement user management and authentication
  - [x] 4.1 Create user creation endpoint (POST /api/users)
    - Validate email format
    - Generate unique user ID
    - Send verification code/magic link
    - _Requirements: 1.1, 1.2_
  
  - [x] 4.2 Create email verification endpoint (POST /api/users/:userId/verify)
    - Validate verification code
    - Set emailVerified flag
    - Generate authentication token
    - _Requirements: 1.3_
  
  - [x] 4.3 Create progress retrieval endpoint (GET /api/users/:userId/progress)
    - Return current step and completed steps
    - Return all saved onboarding data
    - _Requirements: 1.4, 9.2_
  
  - [ ]* 4.4 Write property test for user creation uniqueness
    - **Property 1: User Creation Uniqueness**
    - **Validates: Requirements 1.1**
  
  - [ ]* 4.5 Write property test for resumability
    - **Property 4: Resumability**
    - **Validates: Requirements 1.4, 9.2**
  
  - [ ]* 4.6 Write unit tests for user management
    - Test email validation
    - Test verification flow
    - Test authentication token generation
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 5. Checkpoint - Ensure core services work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement bill parsing service
  - [ ] 6.1 Create BillParserService interface and OCR integration
    - Integrate with OCR service (Tesseract, AWS Textract, or Google Cloud Vision)
    - Implement text extraction from PDF, JPG, PNG
    - Add pattern matching for supplier, tariff name, and rates
    - _Requirements: 2.2, 2.3, 2.4_
  
  - [ ] 6.2 Create bill upload endpoint (POST /api/users/:userId/bill)
    - Use Multer for file upload handling
    - Validate file type and size
    - Store bill securely
    - Trigger async parsing
    - _Requirements: 2.1, 13.1, 13.2, 13.3_
  
  - [ ] 6.3 Create bill status endpoint (GET /api/users/:userId/bill/:billId)
    - Return parsing status (processing, success, failed)
    - Return extracted tariff data on success
    - _Requirements: 2.6, 13.4_
  
  - [ ]* 6.4 Write property test for file type validation
    - **Property 5: File Type Validation**
    - **Validates: Requirements 2.1, 13.2**
  
  - [ ]* 6.5 Write property test for file size validation
    - **Property 6: File Size Validation**
    - **Validates: Requirements 13.1**
  
  - [ ]* 6.6 Write property test for parsing fallback
    - **Property 7: Bill Parsing Fallback**
    - **Validates: Requirements 2.5, 14.4**
  
  - [ ]* 6.7 Write unit tests for bill parsing
    - Test with sample bills (flat rate and TOU)
    - Test parsing failure scenarios
    - Test file validation edge cases
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [x] 7. Implement address, consent, and tariff endpoints
  - [ ] 7.1 Create address submission endpoint (POST /api/users/:userId/address)
    - Validate address format
    - Store address data
    - _Requirements: 3.1, 3.5_
  
  - [ ] 7.2 Create consent recording endpoint (POST /api/users/:userId/consent)
    - Record consent timestamp and scope
    - Validate consent is granted before allowing progression
    - _Requirements: 3.3, 3.4_
  
  - [ ] 7.3 Create tariff endpoints (GET/PUT /api/users/:userId/tariff)
    - GET: Retrieve saved tariff data
    - PUT: Update tariff data (manual entry or corrections)
    - _Requirements: 4.1, 4.4, 4.5_
  
  - [ ]* 7.4 Write property test for address validation
    - **Property 8: Address Validation**
    - **Validates: Requirements 3.1**
  
  - [ ]* 7.5 Write property test for consent requirement
    - **Property 9: Consent Requirement**
    - **Validates: Requirements 3.4**
  
  - [ ]* 7.6 Write property test for consent recording
    - **Property 10: Consent Recording**
    - **Validates: Requirements 3.3**
  
  - [ ]* 7.7 Write unit tests for address and tariff endpoints
    - Test validation rules
    - Test data persistence
    - Test error handling
    - _Requirements: 3.1, 3.3, 3.4, 4.4, 4.5_

- [ ] 8. Implement charging preferences endpoints
  - [ ] 8.1 Create preferences endpoints (GET/POST /api/users/:userId/preferences)
    - POST: Save charging preferences
    - GET: Retrieve saved preferences
    - Validate ready-by time format (HH:MM)
    - Validate SoC percentage (0-100)
    - Validate charging mode (balanced, maximise_rewards, charge_immediately)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 8.2 Write property test for time format validation
    - **Property 14: Ready-By Time Format Validation**
    - **Validates: Requirements 5.1, 5.4**
  
  - [ ]* 8.3 Write property test for SoC bounds validation
    - **Property 15: SoC Percentage Bounds**
    - **Validates: Requirements 5.2**
  
  - [ ]* 8.4 Write unit tests for preferences endpoints
    - Test validation for each field
    - Test data persistence
    - Test edge cases (midnight, 100% SoC, etc.)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 9. Implement OAuth service and endpoints
  - [ ] 9.1 Create EVOAuthService with manufacturer configurations
    - Configure OAuth settings for all 10 manufacturers (Tesla, VW, BMW, Audi, Mini, Kia, Hyundai, Fiat, Peugeot, Renault)
    - Implement getAuthorizationUrl method
    - Implement handleCallback method with token exchange
    - Implement state parameter generation and validation (HMAC)
    - _Requirements: 6.1, 7.1, 7.2_
  
  - [ ] 9.2 Create manufacturer endpoints
    - GET /api/manufacturers: Return list of supported manufacturers
    - POST /api/users/:userId/manufacturer: Save manufacturer selection
    - _Requirements: 6.1, 6.2, 6.5_
  
  - [ ] 9.3 Create OAuth authorization endpoint (GET /api/oauth/:manufacturer/authorize)
    - Generate authorization URL with state parameter
    - Redirect user to OEM authorization page
    - _Requirements: 7.1, 7.2_
  
  - [ ] 9.4 Create OAuth callback endpoint (GET /api/oauth/callback)
    - Validate state parameter
    - Exchange authorization code for tokens
    - Encrypt tokens before storage
    - Redirect to frontend with success/failure
    - _Requirements: 7.3, 7.4, 7.6_
  
  - [ ]* 9.5 Write property test for OAuth URL formation
    - **Property 18: OAuth Authorization URL Formation**
    - **Validates: Requirements 7.1, 7.2**
  
  - [ ]* 9.6 Write property test for OAuth scope minimization
    - **Property 21: OAuth Scope Minimization**
    - **Validates: Requirements 10.4**
  
  - [ ]* 9.7 Write property test for no credential storage
    - **Property 20: No Credential Storage**
    - **Validates: Requirements 7.5, 10.2**
  
  - [ ]* 9.8 Write unit tests for OAuth service
    - Test authorization URL generation for each manufacturer
    - Test callback handling with valid/invalid codes
    - Test state parameter validation
    - Test token encryption
    - Test error handling
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 10. Checkpoint - Ensure backend API is complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement vehicle activation endpoint
  - [ ] 11.1 Create activation endpoint (POST /api/users/:userId/activate)
    - Verify all onboarding steps are complete
    - Set vehicle status to ACTIVE
    - Record activation timestamp
    - _Requirements: 8.1, 8.4_
  
  - [ ] 11.2 Create summary endpoint (GET /api/users/:userId/summary)
    - Return complete onboarding summary
    - Include email, address, tariff, preferences, vehicle
    - _Requirements: 8.3_
  
  - [ ]* 11.3 Write property test for activation status
    - **Property 22: Vehicle Activation Status**
    - **Validates: Requirements 8.1**
  
  - [ ]* 11.4 Write property test for activation timestamp
    - **Property 24: Activation Timestamp Recording**
    - **Validates: Requirements 8.4**
  
  - [ ]* 11.5 Write property test for summary completeness
    - **Property 23: Activation Summary Completeness**
    - **Validates: Requirements 8.3**
  
  - [ ]* 11.6 Write unit tests for activation
    - Test activation with complete/incomplete onboarding
    - Test summary data completeness
    - _Requirements: 8.1, 8.3, 8.4_

- [ ] 12. Implement Kaluza theme configuration
  - [x] 12.1 Set up theme provider with Kaluza colors and typography
    - Import Kaluza theme from theme-config folder
    - Configure Material-UI or styled-components with Kaluza theme
    - Load Aspekta font from CDN
    - _Requirements: 11.1_
  
  - [ ] 12.2 Create shared UI components
    - ProgressIndicator component
    - ValidatedInput component with inline validation
    - FileUploader component with drag-and-drop
    - LoadingSpinner component
    - ErrorMessage component
    - Button component with Kaluza styling
    - _Requirements: 11.2, 11.3, 11.4, 11.5_
  
  - [ ]* 12.3 Write property test for theme application
    - **Property 28: Theme Application**
    - **Validates: Requirements 11.1**
  
  - [ ]* 12.4 Write unit tests for shared components
    - Test component rendering
    - Test validation feedback
    - Test loading states
    - _Requirements: 11.2, 11.3, 11.4, 11.5_

- [ ] 13. Implement onboarding flow orchestration
  - [ ] 13.1 Create OnboardingFlow component with step routing
    - Define OnboardingStep enum
    - Implement step navigation logic
    - Implement progress tracking
    - Handle step completion and advancement
    - _Requirements: 15.1, 15.2, 15.5_
  
  - [ ] 13.2 Implement step validation and flow control
    - Prevent skipping required steps
    - Allow back navigation to completed steps
    - Automatically advance on step completion
    - _Requirements: 15.3, 15.4, 15.5_
  
  - [ ]* 13.3 Write property test for step skipping prevention
    - **Property 39: Step Skipping Prevention**
    - **Validates: Requirements 15.4**
  
  - [ ]* 13.4 Write property test for automatic advancement
    - **Property 40: Automatic Step Advancement**
    - **Validates: Requirements 15.5**
  
  - [ ]* 13.5 Write property test for back navigation
    - **Property 26: Back Navigation**
    - **Validates: Requirements 9.3, 15.3**
  
  - [ ]* 13.6 Write unit tests for flow orchestration
    - Test step navigation
    - Test progress tracking
    - Test flow control rules
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 14. Implement landing and signup overview pages
  - [x] 14.1 Create LandingPage component
    - Display headline and benefits
    - Show "How it works" section
    - Display OEM trust logos
    - Add "Get started" CTA button
    - _Requirements: 11.1_
  
  - [ ] 14.2 Create SignupOverview component
    - Display checklist of requirements
    - Show time estimate (5 minutes)
    - Add "Continue" button
    - _Requirements: 11.1_
  
  - [ ]* 14.3 Write unit tests for landing pages
    - Test component rendering
    - Test CTA button functionality
    - Test Kaluza theme application
    - _Requirements: 11.1_

- [ ] 15. Implement email capture and verification
  - [x] 15.1 Create EmailCapture component
    - Email input field with validation
    - Submit button
    - Call POST /api/users endpoint
    - Display verification code input on success
    - _Requirements: 1.1, 1.2_
  
  - [x] 15.2 Implement email verification flow
    - Verification code input
    - Call POST /api/users/:userId/verify endpoint
    - Store authentication token
    - Advance to next step on success
    - _Requirements: 1.3_
  
  - [ ]* 15.3 Write property test for email verification flow
    - **Property 2: Email Verification Flow**
    - **Validates: Requirements 1.3**
  
  - [ ]* 15.4 Write unit tests for email capture
    - Test email validation
    - Test API integration
    - Test error handling
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 16. Implement bill upload and processing
  - [ ] 16.1 Create BillUpload component
    - File upload with drag-and-drop
    - File type and size validation
    - Call POST /api/users/:userId/bill endpoint
    - Display upload progress
    - _Requirements: 2.1, 13.1, 13.2_
  
  - [ ] 16.2 Create BillProcessing component
    - Display loading spinner
    - Poll GET /api/users/:userId/bill/:billId for status
    - Show success with extracted data
    - Show failure with manual entry option
    - _Requirements: 2.5, 2.6, 13.4, 13.5_
  
  - [ ]* 16.3 Write unit tests for bill upload
    - Test file validation
    - Test upload flow
    - Test error handling
    - Test manual entry fallback
    - _Requirements: 2.1, 2.5, 2.6, 13.1, 13.2_

- [ ] 17. Implement address, consent, and tariff confirmation
  - [ ] 17.1 Create AddressConsent component
    - Address input fields (address, postcode, country)
    - Consent checkbox with clear language
    - Call POST /api/users/:userId/address and /api/users/:userId/consent
    - Validate consent is granted before allowing submission
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 17.2 Create TariffConfirmation component
    - Display supplier, tariff name, rate type
    - Display rate periods for TOU tariffs
    - Display single price for flat tariffs
    - Allow editing with PUT /api/users/:userId/tariff
    - Confirm button to proceed
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 17.3 Write property test for tariff display completeness
    - **Property 11: Tariff Data Completeness**
    - **Validates: Requirements 4.1**
  
  - [ ]* 17.4 Write property test for TOU display completeness
    - **Property 12: TOU Tariff Display Completeness**
    - **Validates: Requirements 4.2**
  
  - [ ]* 17.5 Write unit tests for address and tariff components
    - Test address validation
    - Test consent requirement
    - Test tariff display for both rate types
    - Test tariff editing
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4_

- [ ] 18. Implement charging preferences
  - [ ] 18.1 Create ChargingPreferences component
    - Time picker for ready-by time
    - Slider for minimum SoC percentage
    - Radio buttons for charging mode
    - Validate inputs
    - Call POST /api/users/:userId/preferences
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 18.2 Write unit tests for charging preferences
    - Test time validation
    - Test SoC validation
    - Test mode selection
    - Test API integration
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 19. Implement manufacturer selection and OAuth flow
  - [ ] 19.1 Create ManufacturerSelection component
    - Display grid of 10 manufacturer cards with logos
    - Implement search functionality
    - Call POST /api/users/:userId/manufacturer on selection
    - Redirect to GET /api/oauth/:manufacturer/authorize
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ] 19.2 Create OEMAuthorization component
    - Display loading state during OAuth redirect
    - Show authorization instructions
    - _Requirements: 7.1_
  
  - [ ] 19.3 Create AuthorizationReturn component
    - Handle OAuth callback redirect
    - Display success or error message
    - Provide retry button on failure
    - Advance to next step on success
    - _Requirements: 7.4, 7.6_
  
  - [ ]* 19.4 Write property test for manufacturer routing
    - **Property 16: Manufacturer Selection Routing**
    - **Validates: Requirements 6.2**
  
  - [ ]* 19.5 Write property test for manufacturer search
    - **Property 17: Manufacturer Search**
    - **Validates: Requirements 6.4**
  
  - [ ]* 19.6 Write unit tests for manufacturer selection and OAuth
    - Test manufacturer display
    - Test search functionality
    - Test OAuth redirect
    - Test callback handling
    - Test error handling and retry
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.4, 7.6_

- [ ] 20. Implement activation and summary
  - [ ] 20.1 Create ActivatedVehicle component
    - Display success confirmation
    - Call GET /api/users/:userId/summary
    - Display summary cards for email, address, tariff, preferences, vehicle
    - Show next steps information
    - _Requirements: 8.2, 8.3, 8.5_
  
  - [ ]* 20.2 Write unit tests for activation component
    - Test summary display
    - Test data completeness
    - Test next steps information
    - _Requirements: 8.2, 8.3, 8.5_

- [ ] 21. Checkpoint - Ensure frontend is complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 22. Implement error handling and validation
  - [ ] 22.1 Create error handling middleware for backend
    - Catch and format all errors
    - Return consistent error response format
    - Log errors for debugging
    - _Requirements: 14.1, 14.2_
  
  - [ ] 22.2 Implement frontend error boundary
    - Catch React errors
    - Display user-friendly error messages
    - Provide retry mechanisms
    - _Requirements: 14.1, 14.2, 14.3_
  
  - [ ] 22.3 Add network error handling
    - Retry with exponential backoff
    - Preserve user data on network errors
    - Display connectivity error messages
    - _Requirements: 14.5_
  
  - [ ]* 22.4 Write property test for error message user-friendliness
    - **Property 36: Error Message User-Friendliness**
    - **Validates: Requirements 14.1**
  
  - [ ]* 22.5 Write property test for retry on recoverable errors
    - **Property 37: Retry on Recoverable Errors**
    - **Validates: Requirements 14.2, 14.3**
  
  - [ ]* 22.6 Write property test for data preservation on network errors
    - **Property 38: Data Preservation on Network Errors**
    - **Validates: Requirements 14.5**
  
  - [ ]* 22.7 Write unit tests for error handling
    - Test error formatting
    - Test retry logic
    - Test data preservation
    - _Requirements: 14.1, 14.2, 14.3, 14.5_

- [ ] 23. Implement database migrations and setup
  - [ ] 23.1 Create PostgreSQL database schema
    - Write migration scripts for all tables
    - Add indexes for performance
    - Add foreign key constraints
    - _Requirements: 12.2, 12.4_
  
  - [ ] 23.2 Create database setup script
    - Initialize database
    - Run migrations
    - Seed test data (optional)
    - _Requirements: 12.2_
  
  - [ ]* 23.3 Write integration tests for database
    - Test all CRUD operations
    - Test data persistence across restarts
    - Test constraints and indexes
    - _Requirements: 12.2, 12.4_

- [ ] 24. Implement configuration and environment setup
  - [ ] 24.1 Create environment configuration
    - Define environment variables for storage mode, database connection, OAuth configs, encryption key
    - Create .env.example file
    - Add configuration validation
    - _Requirements: 12.2, 12.3_
  
  - [ ] 24.2 Create startup script
    - Initialize storage service based on mode
    - Connect to database if PostgreSQL mode
    - Start Express server
    - _Requirements: 12.2, 12.3_
  
  - [ ]* 24.3 Write integration tests for both storage modes
    - Test in-memory mode
    - Test PostgreSQL mode
    - Test mode switching
    - _Requirements: 12.2, 12.3, 12.4, 12.5_

- [ ] 25. Integration and end-to-end testing
  - [ ]* 25.1 Write integration test for complete onboarding flow
    - Test full flow from email capture to activation
    - Test with both storage modes
    - Test resumability
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 9.2_
  
  - [ ]* 25.2 Write integration test for OAuth flow
    - Test manufacturer selection through authorization
    - Test callback handling
    - Test token encryption and storage
    - _Requirements: 6.2, 7.1, 7.2, 7.3, 7.6_
  
  - [ ]* 25.3 Write integration test for bill upload and parsing
    - Test file upload
    - Test parsing success and failure
    - Test manual entry fallback
    - _Requirements: 2.1, 2.2, 2.5, 2.6_
  
  - [ ]* 25.4 Write integration test for data consistency
    - Test editing previous steps
    - Test data isolation between users
    - Test progress tracking
    - _Requirements: 9.3, 9.4, 9.5_

- [ ] 26. Final checkpoint - Complete system validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows
- The implementation follows an incremental approach: services → API → frontend → integration
- Both storage modes (PostgreSQL and in-memory) are tested throughout
- OAuth integration includes all 10 EV manufacturers
- Kaluza branding is applied consistently across all UI components
