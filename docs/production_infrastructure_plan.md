# Implementation Plan: Production Operational Hardening

This plan addresses the final technical requirements for a "flawless" production deployment, moving beyond local development to a hardened cloud environment.

## User Review Required

> [!IMPORTANT]
> This phase requires the user to have a Firebase project with a Blaze (pay-as-you-go) plan to support Vertex AI and Cloud Functions.
> You will need to run `firebase functions:secrets:set` for all production keys.

## Proposed Changes

### [Backend] Secret Management & Hardening
#### [MODIFY] [env.ts](file:///Users/jesseniacintron/Desktop/GitHub/The-Living-Muse/functions/src/config/env.ts)
- Switch from `process.env` to Firebase `defineSecret` for `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
- Upgrade configuration to use `defineString` and `defineInt` for non-secret parameters.

#### [MODIFY] [All Functions](file:///Users/jesseniacintron/Desktop/GitHub/The-Living-Muse/functions/src/functions/)
- Update all `onCall` functions to include `secrets` array in their options to ensure they can access the production keys.
- Enforce `enforceAppCheck: true` if App Check is configured (recommended).

### [Infrastructure] Deployment Automation
#### [NEW] [preflight_check.ts](file:///Users/jesseniacintron/Desktop/GitHub/The-Living-Muse/functions/src/scripts/preflight_check.ts)
- A script to verify:
    - Connectivity to Vertex AI APIs.
    - Validity of the Stripe secret key.
    - Existence of the `memories` vector index.

## Verification Plan

### Automated Tests
- Run `npm run build` in the functions directory to ensure all secret references are typesafe.
- Execute `preflight_check.ts` (using local credentials) to simulate production connectivity.

### Manual Verification
- Deploy a single "Health Check" function to production to verify secret injection.
