# Product Spec: Retailer-Agnostic Flex B2C Onboarding

## Version
v1.0 – EV OEM–based onboarding (import-only, smart charging)

## Status
Draft – Ready for design + frontend implementation

---

## 1. Purpose & Scope

This product enables **residential EV owners** to enrol their vehicle into a **Virtual Power Plant (VPP)** via secure authorisation with their **EV manufacturer (OEM)**.

The onboarding flow:
- Verifies user eligibility (EV + smart meter)
- Collects consent for smart meter data access
- Ingests electricity **import tariff** data
- Securely connects to the EV OEM cloud
- Captures charging preferences (ready-by time, minimum SoC)
- Activates the EV as a controllable DER for smart charging

This spec covers the **end-to-end onboarding flow**, from landing page through OEM authorisation and activation.

---

## 2. Primary User & Assumptions

### Primary User
- Residential electricity customer
- Owns a compatible EV
- Has a smart meter installed
- Has access to a recent electricity bill (PDF or image)
- Has login credentials for their EV manufacturer account

### Core Assumptions
- Platform operates as a third-party EV aggregator
- Only **import tariffs** are required (no export / V2G questions)
- Charging control is OEM-approved and API-based
- Battery health limits are enforced by OEM constraints
- EV location data is **not** collected
- Use the Kaluza brand and theme guidelines available in prototype-factory folder for the experience

---

## 3. High-Level Flow Overview

```
Landing
→ Signup Overview
→ Email Capture
→ Bill Upload
→ Bill Processing
→ Address & Meter Consent
→ Tariff Confirmation (Import Only)
→ Charging Preferences
→ EV Manufacturer Selection
→ OEM Authorisation
→ Authorisation Return
→ Activated Vehicle
```

Each step is resumable and idempotent.

---

## 4. Core Entities (Data Model)

### User
```json
{
  "id": "uuid",
  "email": "string",
  "created_at": "timestamp"
}
```

### Site
```json
{
  "site_id": "uuid",
  "address": "string",
  "postcode": "string",
  "country": "string"
}
```

### Meter
```json
{
  "meter_id": "string",
  "interval_minutes": 30,
  "data_consent": true
}
```

### Tariff (Import Only)
```json
{
  "supplier": "string",
  "tariff_name": "string",
  "rate_type": "flat | tou",
  "rates": [
    { "start_time": "HH:MM", "end_time": "HH:MM", "price": "p/kWh" }
  ]
}
```

### Vehicle
```json
{
  "manufacturer": "string",
  "model": "string",
  "battery_capacity_kwh": "number",
  "supports_smart_charging": true
}
```

### ChargingPreferences
```json
{
  "ready_by_time": "HH:MM",
  "minimum_soc_percent": 60,
  "mode": "balanced | maximise_rewards | charge_immediately"
}
```

### Authorisation
```json
{
  "provider": "ev_oem",
  "scopes_granted": ["read_soc", "control_charging"],
  "authorised_at": "timestamp",
  "revocable": true
}
```

---

## 5. Screen-by-Screen Specification

### 5.1 Landing
**Purpose:** Introduce the VPP programme and build trust.

**Content**
- Headline: *Make your EV work smarter with the grid*
- Benefits:
  - Earn rewards for flexible charging
  - Always ready when you need it
  - Manufacturer-approved control
- “How it works” (3 steps)
- OEM trust logos

**Primary CTA**
- Get started

---

### 5.2 Signup Overview
**Purpose:** Set expectations and reduce drop-off.

**Content**
- Checklist:
  - EV manufacturer login
  - Electricity bill
  - Charging habits
- Time estimate: 5 minutes

**CTA**
- Continue

---

### 5.3 Email Capture
**Purpose:** Create user identity and enable resumability.

**Inputs**
- Email address (required)

**Behaviour**
- Send magic link or verification code
- Persist partial onboarding state

---

### 5.4 Bill Upload
**Purpose:** Extract electricity **import tariff** and meter metadata.

**Inputs**
- File upload (PDF / JPG / PNG)

**Fallback**
- Manual tariff entry

---

### 5.5 Bill Processing
**Purpose:** OCR and tariff parsing.

**States**
- Loading
- Success
- Failure → retry / manual entry

---

### 5.6 Address & Meter Consent
**Purpose:** Obtain explicit consent for smart meter data use.

**Inputs**
- Address confirmation
- Consent checkbox (required)

**Consent Copy**
> I consent to sharing my half-hourly smart meter data for EV charging optimisation.

---

### 5.7 Tariff Confirmation (Import Only)
**Purpose:** Validate price signals for optimisation.

**Content**
- Supplier
- Tariff name
- Rate breakdown (flat / TOU)

---

### 5.8 Optimisation Preferences
**Purpose:** Enable customer to choose how they want grid service monetisation to work

**Content**
- General Explanation to customer: "How would you like us to manage your smart charging? Choose how much control you'd like"
- Option 1: Fully Managed Optimisation
 - Explanation: "Kaluza manages your EV charging. Maximise bill savings while participating in grid events"
- Option 2: Events only
 - Explanation: "Set your own charging schedule. Kaluza will try and generate revenue through specific grid events while respecting that schedule" 


---

### 5.9 EV Manufacturer Selection
**Purpose:** Route to correct OEM authorisation flow.

**Content**
- Grid of EV OEMs
- EV brands, list them in a menu with logos if possible: Tesla, Volkswagen, BMW, Audi, Mini, Kia, Hyundai, Fiat, Peugeot, Renault
- Search for others

---

### 5.10 OEM Authorisation
**Purpose:** Secure, OEM-hosted consent for vehicle control.

**Permissions**
- Read: State of charge, plug-in status
- Write: Schedule charging, pause/resume

---

### 5.11 Authorisation Return
**Purpose:** Confirm successful connection.

---

### 5.12 Activated Vehicle
**Purpose:** Confirm completion and orient the user.

**Content**
- Success confirmation
- Summary cards
- Next steps

---

## 6. Non-Functional Requirements

### Security
- No OEM credentials stored
- OAuth tokens encrypted at rest
- Scope minimisation enforced

### Resilience
- Each step resumable
- Clear retry paths

### Trust & Compliance
- Plain-language consent
- Transparent control boundaries
- Easy revocation messaging

---

## 7. Success Criteria

An EV is successfully onboarded when:
- Email verified
- Smart meter consent granted
- Import tariff confirmed
- Charging preferences saved
- OEM authorisation completed
- Vehicle status = ACTIVE
