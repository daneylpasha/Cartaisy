# Mobile Status

Last updated: 2026-07-01.

This file is a human/agent-maintained snapshot. It is not an automatically guaranteed source of truth. Verify current behavior in code before implementation work.

## Current State

Current state: The mobile app engine is an Expo/React Native app with routed shopping, auth, account, cart, checkout, home, catalog, notification, and profile surfaces.

Current state: The repo has useful mobile docs for environment variables, branded builds, branding/config boundaries, dynamic app config migration, home API usage, and runtime branding contracts.

Current state: Public API base URL and store ID configuration are validated in `api/config/mobileConfig.ts`, and backend API calls include `X-Store-ID`.

Current state: Store config currently loads `currency`, `timezone`, and `name` from `/store/config` with local fallbacks.

Current state: `package.json` exposes `start`, `android`, `ios`, `web`, `lint`, `typecheck`, `test`, and `generate:api` scripts. The `test` script currently reports that no mobile test runner is configured.

## Readiness Snapshot

Current state: App engine readiness is partial. Core Expo Router, Tamagui, React Query, Zustand, Orval, Firebase messaging, and Stripe dependencies are present.

Current state: Store/tenant config is partial. `EXPO_PUBLIC_STORE_ID` and `X-Store-ID` behavior are present, but the store ID is public client configuration and backend tenant checks remain authoritative.

Current state: Branding/theme is partial. Static app identity, bundled logos, and Tamagui colors are present; runtime branding is documented but not fully wired.

Current state: Home modules/content are partial to implemented. The app uses `GET /customer/homescreen` generated hooks and renders backend-driven layout sections, but exact backend content availability depends on tenant data.

Current state: Product listing/detail is partial to implemented. Generated product, search, recommendation, and collection clients exist, with catalog behavior dependent on backend responses.

Current state: Cart/checkout is partial and high-risk. Cart state, unified cart calls, checkout initialization, and checkout completion clients exist. Checkout/payment changes require human review.

Current state: Customer account/auth is partial to implemented. Login, signup, password reset, profile, token refresh, guest session, and persisted auth state exist. Auth refresh changes are high-risk.

Current state: Native app identity/builds are partial. Static `app.json`, checked-in iOS/Android projects, Firebase files, EAS config, and native plugins exist. Existing audits list native identity mismatches and production readiness gaps.

Current state: Environment variable/secrets safety is partial to strong. `MOBILE_ENV_VARIABLES.md` documents safe/forbidden values, and `mobileConfig` validates required public values and known forbidden public Shopify/secret-looking keys.

Current state: Testing/CI is partial. Lint and TypeScript scripts exist; no real mobile test runner is configured by the `test` script. CI exists under `.github/workflows/ci.yml`, but this status file does not verify every CI behavior.

Current state: Release readiness is partial. A branded build checklist exists, but release readiness still depends on merchant identity, native assets, Firebase config, store-scoped backend setup, validation, and store submission checks.

## Target State

Target state: Mobile SaaS readiness means each merchant-branded build has verified public app configuration, native identity, Firebase/native services, backend tenant scoping, public runtime store config, safe branding, and validated checkout/payment behavior.

Target state: Runtime Shopify/catalog/store data should come from the Cartaisy backend, with Shopify Admin/private credentials kept off device.

Target state: Dynamic app config and runtime branding should be implemented only through explicit follow-up issues and validated contracts.

Target state: Testing should include lint, typecheck, meaningful unit/integration coverage where available, platform smoke testing, and release-specific iOS/Android validation.

## Known Gaps

Known gap: Dynamic app config is planned/audited but not implemented.

Known gap: Runtime branding contract is documented but not fully implemented.

Known gap: Native identity, Firebase, Apple Pay, and push notification mismatches identified in audits need dedicated release or implementation work.

Known gap: The package `test` script is a placeholder and does not run a real test suite.

Known gap: CI and build readiness should be verified before release; do not assume this exists unless verified in code and pipeline results.

## Current Priority Areas

- Keep mobile secrets safety strict, especially around Shopify Admin/private credentials.
- Preserve backend-owned tenant isolation and store-scoped API usage.
- Resolve native identity/build mismatches before production branded releases.
- Implement dynamic app config and runtime branding only through scoped follow-up issues.
- Add real mobile tests when backend/mobile behavior changes.

## Related Docs And Issues

- `CARTAISY_CONTEXT.md`
- `docs/ARCHITECTURE.md`
- `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`
- `docs/MOBILE_ENV_VARIABLES.md`
- `docs/MOBILE_BRANDING_CONFIG_AUDIT.md`
- `docs/DYNAMIC_APP_CONFIG_MIGRATION_AUDIT.md`
- `docs/MOBILE_RUNTIME_BRANDING_CONTRACT.md`
- GitHub issue #40
