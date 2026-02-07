# Retailer Agnostic Flex OEM Initiated Flow
OEM-Initiated · Tariff Capture · White-Label Ready

## 1. Purpose

Define an embedded onboarding flow for smart charging that is:
- Initiated from an OEM (device / vehicle manufacturer) app
- Utilises the branding guidelines and app screens available from files that outline details about the specified Device manufacturer's app and style
- OEM for this spec: Kia
- Focused on capturing energy tariff details and optimisation preferences
- Device-aware by default (no device selection step)
- Brandable and customisable per OEM
- Able to cleanly exit back to the OEM app after completion

This spec is written to be consumed by an AI-enabled IDE (e.g. Kiro) and translated into UI, APIs, and orchestration logic.

---

## 2. High-Level Flow Summary

1. User initiates onboarding from OEM app via CTA  
2. OEM app hands off authenticated session + device context to a Kaluza branded experience 
3. User confirms value proposition  
4. User provides energy bill  
5. System infers tariff details and stores preferences  
6. Flow completes and returns control to OEM app  

---

## 3. Actors & Systems

### Actors
- **End User**: Customer using the OEM app  
- **OEM App**: Native device / vehicle manufacturer application  

### Systems
- **Embedded Onboarding Module (EOM)**  
  Webview / SDK-based onboarding flow  
- **Tariff Intelligence Service (TIS)**  
  Bill ingestion and tariff inference  
- **Smart Charging Orchestrator (SCO)**  
  Stores tariff, preferences, and device bindings  

---

## 4. Entry Point (OEM App)

### 4.1 Entry Location
OEM App → Smart Charging Schedule section
PDF has examples of what the OEM app screens look like
Start with "Vehicle Control", navigable to "EV Charging Control" screen and on to "Charging settings" screen. This is where we'll have the Entry CTA.

### 4.2 Entry CTA
Default label (overrideable):

> Earn money while helping the grid

Action:
- Launch Embedded Onboarding Module (EOM)
- Branding here will follow Kaluza branding guidelines.

---

## 5. Session Initialisation

### 5.1 OEM → EOM Payload

```json
{
  "user_id": "string",
  "device_id": "string",
  "device_type": "enum",
  "market": "ISO-3166 country code",
  "locale": "IETF locale tag",
  "theme_config": { }
}
```

### 5.2 Assumptions
- User is already authenticated
- Device is already associated with the user
- No account creation inside EOM

---

## 6. Step 1: Value Confirmation Screen

### Purpose
Explain why tariff information is needed and what will happen next.

### Requirements
- Headline (customisable)
- Short explanatory copy
- Single primary CTA

Primary CTA (default): **Continue**

---

## 7. Step 2: Energy Bill Capture

### Purpose
Capture sufficient data to infer electricity tariff details.

### Input Methods (configurable by market)
- Upload bill (PDF / image)
- Email forwarding
- Manual fallback (supplier + tariff name)

### Validation
- File type and size validation
- OCR readiness check

---

## 8. Tariff Inference & Preferences

### Data Extracted
- Supplier
- Tariff name
- Unit rates
- Time-of-use structure
- Standing charge
- Region / postcode (if required)

### Confidence Handling
- If confidence ≥ threshold → auto-confirm
- If confidence < threshold → request confirmation or fallback

### Optimisation Preferences
- General Explanation: "How would you like us to manage your smart charging? Choose how much control you'd like"
- Option 1: Fully Managed Optimisation
 - Explanation: "Kaluza manages your EV charging. Maximise bill savings while participating in grid events"
- Option 2: Events only
 - Explanation: "Set your own charging schedule. Kaluza will try and generate revenue through specific grid events while respecting that schedule" 


---

## 9. Data Persistence

### Stored Entities

```json
{
  "tariff_profile": { },
  "optimisation_preferences": { },
  "device_binding": {
    "device_id": "string",
    "user_id": "string"
  }
}
```

Ownership:
- Stored by Smart Charging system
- OEM informed via API or events

---

## 10. Completion Screen

### Purpose
Confirm setup and return user to OEM app.

Requirements:
- Success headline
- Confirmation copy
- Primary CTA

Primary CTA (default): **Return to app**

---

## 11. Exit & Handoff

- Embedded flow closes
- Control returns to OEM app
- OEM app refreshes smart charging state

Optional callback:

```json
{
  "status": "completed",
  "device_id": "string",
  "tariff_status": "confirmed"
}
```

---

## 12. White-Labelling & Theming

### Theme Config Object

```json
{
  "primary_color": "#HEX",
  "secondary_color": "#HEX",
  "font_family": "string",
  "button_style": "enum",
  "border_radius": "number",
  "logo_url": "string"
}
```

Customisable:
- Copy
- CTA labels
- Layout density
- Visual hierarchy

---

## 13. AI-Assisted Capabilities

- OCR + document classification
- Tariff identification with confidence scoring
- Preference inference and defaults
- Continuous learning loop

---

## 14. Non-Goals

- Device selection UI
- Account creation
- Post-setup dashboards
- OEM authentication

---

## 15. Success Metrics

- Completion rate
- Tariff inference confidence
- Time to complete onboarding
- Conversion to smart charging active

---

## 16. Open Questions

- Market-specific tariff edge cases
- Regulatory copy requirements
- OEM analytics integration
- Offline / failure handling

---
