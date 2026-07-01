# Mobile Decisions

This file records mobile-relevant Cartaisy product and architecture decisions. Verify implementation in code before changing behavior.

## Current State

Current state: These decisions are collected from existing repo rules, docs, audits, and inspected mobile code for GitHub issue #40.

Current state: Dates are marked `unknown / historical` when the original decision date was not available in the inspected docs.

## Target State

Target state: New mobile decisions should be added here with date, decision, reason, impact, and related docs.

Target state: Decisions should distinguish implemented behavior from target architecture and known gaps.

## Known Gaps

Known gap: This file does not prove implementation state. Do not assume this exists unless verified in code.

Known gap: Some decisions describe target guardrails or desired direction and still require code/pipeline validation.

## Decisions

### Mobile Must Not Expose Shopify Admin Or Private Credentials

Date: unknown / historical.

Decision: Mobile must not contain Shopify Admin tokens, Shopify private app credentials, Shopify custom app secrets, backend secrets, Stripe secret keys, Firebase private credentials, signing credentials, or merchant-private credentials.

Reason: Mobile bundles can be inspected by customers, reviewers, and reverse engineers. Private credentials must remain server-side.

Impact: All Shopify-backed catalog, store, order, and tenant data should flow through the Cartaisy backend unless a task explicitly says otherwise and is reviewed for safety.

Related docs: `AGENTS.md`, `docs/MOBILE_ENV_VARIABLES.md`, backend repo `docs/cartaisy/README.md`.

### Mobile Should Rely On Cartaisy Backend For SaaS-Safe Store Data

Date: unknown / historical.

Decision: Mobile should rely on the Cartaisy backend for SaaS-safe Shopify, catalog, store, cart, checkout, customer, and tenant-scoped data.

Reason: The backend is responsible for store-scoped credentials, tenant isolation, Shopify API policy, and server-side authorization.

Impact: Mobile requests include public tenant selection such as `X-Store-ID`, but backend authorization and tenant checks remain authoritative.

Related docs: `docs/ARCHITECTURE.md`, `docs/MOBILE_ENV_VARIABLES.md`, backend repo `docs/cartaisy/README.md`.

### Store Identity And API URL Are Public Build-Time Mobile Config

Date: unknown / historical.

Decision: `EXPO_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_STORE_ID` are public mobile configuration values used by the app. They must be handled carefully for branded merchant apps.

Reason: Expo public variables are bundled into client JavaScript and are visible on device.

Impact: Public store ID can select the intended branded store but cannot be treated as a security boundary. Backend tenant isolation must enforce access.

Related docs: `docs/MOBILE_ENV_VARIABLES.md`, `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`, `api/config/mobileConfig.ts`.

### Native App Identity Is Build-Time And High-Risk

Date: unknown / historical.

Decision: App name, slug, scheme, bundle ID, Android package, icons, splash assets, Firebase files, native payment capabilities, EAS project ownership, signing certificates, and app-store identity are build-time/release concerns.

Reason: These values affect installed app identity, platform registrations, push, deep links, wallet payments, signing, and store submissions.

Impact: Native identity/signing/build changes require human review and a dedicated issue. Do not change native signing/certificates or app behavior in docs-only work.

Related docs: `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`, `docs/MOBILE_BRANDING_CONFIG_AUDIT.md`, `docs/DYNAMIC_APP_CONFIG_MIGRATION_AUDIT.md`.

### Runtime Branding Is Desirable But Contract-Bound

Date: unknown / historical.

Decision: Runtime branding is desirable for public display values such as store name, validated colors, and public logo URLs, but it must follow a backend/mobile contract with validation and fallbacks.

Reason: Runtime branding can reduce rebuilds for public display metadata, but unvalidated remote input can break UI, accessibility, or tenant boundaries.

Impact: Runtime branding should not include native app identity, checkout/payment capabilities, Firebase files, private assets, Shopify credentials, or merchant secrets.

Related docs: `docs/MOBILE_RUNTIME_BRANDING_CONTRACT.md`, `docs/MOBILE_BRANDING_CONFIG_AUDIT.md`.

### Dynamic App Config Is Planned Or Partial, Not Current Shipped Behavior

Date: unknown / historical.

Decision: Dynamic Expo app config is a target migration for branded builds, but the inspected repo currently uses static `app.json`.

Reason: Merchant app builds need repeatable build-time identity plumbing, and static config can drift from documented environment values.

Impact: Do not claim `app.config.ts` exists or that public app identity env vars drive native config unless code verifies it. Implement migration only in a scoped follow-up issue.

Related docs: `docs/DYNAMIC_APP_CONFIG_MIGRATION_AUDIT.md`, `app.json`.

### Checkout And Payment Changes Are High-Risk

Date: unknown / historical.

Decision: Checkout and payment implementation changes require human review and should stay out of docs-only issues.

Reason: Checkout/payment affects orders, money movement, wallet capabilities, payment method handling, and merchant/customer trust.

Impact: Docs may describe current state and risks, but implementation changes to checkout, payment, Stripe, wallet flows, or native payment capabilities need a dedicated issue and validation plan.

Related docs: `AGENTS.md`, `docs/MOBILE_BRANDING_CONFIG_AUDIT.md`, `docs/DYNAMIC_APP_CONFIG_MIGRATION_AUDIT.md`.

### Auth Refresh And Tenant Boundaries Are Security-Sensitive

Date: unknown / historical.

Decision: Auth, auth refresh, tenant isolation, and credential handling are security-sensitive mobile/backend boundaries.

Reason: Mistakes can leak customer data, break sessions, or cross tenant boundaries.

Impact: Avoid changing auth refresh or tenant-scoping behavior unless the issue explicitly asks for it. Add tests when backend logic changes.

Related docs: `AGENTS.md`, `docs/ARCHITECTURE.md`.

## Related Docs And Issues

- `CARTAISY_CONTEXT.md`
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/MOBILE_ENV_VARIABLES.md`
- `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`
- `docs/MOBILE_RUNTIME_BRANDING_CONTRACT.md`
- GitHub issue #40
