# Cartaisy Mobile Context

This is the mobile repo entrypoint for Cartaisy agents. Read this file before mobile work, then follow `AGENTS.md` and the issue scope.

## Current State

Current state: Cartaisy is a Shopify-powered SaaS for merchant-branded shopping apps. The shared product context currently lives in the backend repo at `docs/cartaisy/README.md`; in this workspace it was inspected at `/Users/daniyalpasha/Documents/cartaisy-backend/docs/cartaisy/README.md`.

Current state: This repo owns the Expo/React Native mobile app engine for iOS and Android shopping experiences. It contains screens, navigation, API clients, generated API hooks, local state, static assets, native projects, and mobile release documentation.

Current state: The mobile app should use the Cartaisy backend for SaaS-safe Shopify, catalog, store, cart, checkout, customer, and tenant-scoped data unless a task explicitly says otherwise. Mobile must not contain Shopify Admin tokens, private Shopify credentials, backend secrets, Stripe secret keys, Firebase private credentials, signing assets, or merchant-private credentials.

Current state: Mobile requests use public client configuration such as `EXPO_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_STORE_ID`. Public mobile values are not security boundaries; backend tenant isolation remains authoritative.

## Target State

Target state: Agents should use this file as the first mobile-specific context page, then read the relevant docs below before changing any mobile behavior.

Target state: Product plans, SaaS scope, tenant rules, and Shopify policy should be checked against the shared backend context pack, while repo-specific implementation facts should be verified in this mobile repo.

Target state: Branded mobile app work should keep a clear boundary between build-time app identity, public runtime metadata, backend-owned tenant data, and private credentials.

## Known Gaps

Known gap: Do not assume planned features exist unless verified in code. Dynamic app config, runtime branding, automated branded build flows, and backend-driven app configuration are documented as target or partial work in existing audits, not guaranteed implemented behavior.

Known gap: Some docs describe migration plans and release checklists. Do not treat checklist items or recommended contracts as shipped functionality unless code confirms them.

Known gap: Do not assume this exists unless verified in code.

## Related Docs And Issues

- Repo rules: `AGENTS.md`
- PR format: `.github/pull_request_template.md`
- Shared product context: backend repo `docs/cartaisy/README.md`
- Branded build checklist: `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`
- Mobile environment safety: `docs/MOBILE_ENV_VARIABLES.md`
- Branding/config audit: `docs/MOBILE_BRANDING_CONFIG_AUDIT.md`
- Home API usage: `docs/HOME_API_USAGE.md`
- Dynamic app config migration audit: `docs/DYNAMIC_APP_CONFIG_MIGRATION_AUDIT.md`
- Runtime branding contract: `docs/MOBILE_RUNTIME_BRANDING_CONTRACT.md`
- Mobile context pack issue: GitHub issue #40
