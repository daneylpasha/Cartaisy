# Mobile Status

Last updated: 2026-07-03 (cross-repo smoke test findings added; see `docs/CROSS_REPO_SMOKE_TEST.md`).

This file is a human/agent-maintained snapshot. It is not an automatically guaranteed source of truth. Verify current behavior in code before implementation work.

## Current State

Current state: The mobile app engine is an Expo/React Native app with routed shopping, auth, account, cart, checkout, home, catalog, notification, and profile surfaces.

Current state: The repo has useful mobile docs for environment variables, branded builds, per-merchant provisioning (`docs/MOBILE_MERCHANT_PROVISIONING_RUNBOOK.md`), branding/config boundaries, dynamic app config migration, home API usage, and runtime branding contracts.

Current state: Public API base URL and store ID configuration are validated in `api/config/mobileConfig.ts`, and backend API calls include `X-Store-ID`.

Current state: Store config currently loads `currency`, `timezone`, and `name` from `/store/config` with local fallbacks.

Current state: `package.json` exposes `start`, `android`, `ios`, `web`, `lint`, `typecheck`, `test`, and `generate:api` scripts. `npm test` runs Jest (`jest-expo` preset via `jest.config.js`) with real suites in `utils/__tests__/`, `api/config/__tests__/`, `api/__tests__/` (auth refresh), and `store/__tests__/` (cart/auth stores).

Current state: npm is the authoritative package manager. `package.json` declares `"packageManager": "npm@10.8.2"`, `package-lock.json` is the only committed lockfile, and `yarn.lock` was removed and gitignored. As of 2026-07-02, a clean checkout validates with `npm ci`, `npm run lint`, `npm run typecheck`, and `npm test`, matching CI.

## Readiness Snapshot

Current state: App engine readiness is partial. Core Expo Router, Tamagui, React Query, Zustand, Orval, Firebase messaging, and Stripe dependencies are present.

Current state: Store/tenant config is partial. `EXPO_PUBLIC_STORE_ID` and `X-Store-ID` behavior are present, but the store ID is public client configuration and backend tenant checks remain authoritative.

Current state: Branding/theme is partial. App identity is generated at build time by dynamic `app.config.ts` from environment variables with cartaisy defaults; bundled logos and Tamagui colors are static. Runtime branding is documented as a contract but not implemented.

Current state: Home modules/content are partial to implemented. The app uses `GET /customer/homescreen` generated hooks and renders backend-driven layout sections, but exact backend content availability depends on tenant data.

Current state: Product listing/detail is partial to implemented on the mobile side, but a 2026-07-03 cross-repo smoke test (`docs/CROSS_REPO_SMOKE_TEST.md`) found that at backend HEAD the tsoa-generated routes these clients target — `/customer/search`, `/products/{id}`, plus `/cart/*`, `/checkout/*`, `/favorites` — fail to register at backend startup and return 404, and the express `GET /products` listing 500s. Catalog/search/checkout flows are not servable by backend HEAD until that is fixed.

Current state: Cart/checkout is partial and high-risk. Cart state, unified cart calls, checkout initialization, and checkout completion clients exist. The hand-written `/unified-cart` guest flow works against backend HEAD; the generated `/cart/*` and `/checkout/*` clients target routes backend HEAD does not serve (see above). Checkout/payment changes require human review.

Current state: Customer account/auth is partial to implemented. Login, signup, password reset, profile, token refresh, guest session, and persisted auth state exist. Auth refresh changes are high-risk.

Current state: Native app identity/builds are partial. Dynamic `app.config.ts` (env-driven identity; static `app.json` removed), checked-in iOS/Android projects, Firebase files, EAS config, and native plugins exist. Merchant identity resolution was verified through `npx expo config` and `npx expo prebuild` with a sample merchant (2026-07-02). As of 2026-07-03 (GitHub issue #60), `.easignore` excludes the checked-in native projects from EAS build archives, so EAS builds regenerate native projects from `app.config.ts` and can no longer silently ship Cartaisy identity; local `expo run:*` still uses the checked-in projects. No EAS or signed merchant build has been produced, and existing audits list native identity mismatches and production readiness gaps.

Current state: Environment variable/secrets safety is partial to strong. `MOBILE_ENV_VARIABLES.md` documents safe/forbidden values, and `mobileConfig` validates required public values and known forbidden public Shopify/secret-looking keys.

Current state: Testing/CI is partial. Lint, TypeScript, and Jest scripts exist, with Jest coverage limited to pure logic modules (`utils`, `api/config`). CI (`.github/workflows/ci.yml`) runs `npm ci`, typecheck, lint, and tests on pull requests against `main`.

Current state: Release readiness is partial. A branded build checklist exists, but release readiness still depends on merchant identity, native assets, Firebase config, store-scoped backend setup, validation, and store submission checks.

## Target State

Target state: Mobile SaaS readiness means each merchant-branded build has verified public app configuration, native identity, Firebase/native services, backend tenant scoping, public runtime store config, safe branding, and validated checkout/payment behavior.

Target state: Runtime Shopify/catalog/store data should come from the Cartaisy backend, with Shopify Admin/private credentials kept off device.

Target state: Runtime branding should be implemented only through explicit follow-up issues and validated contracts. Dynamic app config is implemented; its per-merchant build output should be validated before branded releases.

Target state: Testing should include lint, typecheck, meaningful unit/integration coverage where available, platform smoke testing, and release-specific iOS/Android validation.

## Known Gaps

Known gap: Dynamic app config is implemented via `app.config.ts` and verified through `npx expo config` and `npx expo prebuild` with a sample merchant env (2026-07-02, see `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`), but no EAS or signed merchant build has been produced. The checked-in-native-projects bypass was resolved on 2026-07-03 via `.easignore` (GitHub issue #60). Remaining blockers: merchants need matching Firebase files, their own EAS project/owner, and signing credentials.

Known gap: Runtime branding contract is documented but not implemented.

Known gap: Native identity, Firebase, Apple Pay, and push notification mismatches identified in audits need dedicated release or implementation work.

Known gap: Jest coverage includes pure logic modules, API client auth refresh interceptors, and cart/auth store state, but component, screen, navigation, and integration behavior is not covered by automated tests.

Known gap: CI and build readiness should be verified before release; do not assume this exists unless verified in code and pipeline results.

## Unknowns

Unknown: Deployed backend availability. As of 2026-07-03 both configured Railway backend URLs return platform-level "Application not found" — no deployed backend is reachable. The spec snapshot tracks the backend source repo; the 2026-07-03 cross-repo smoke test (`docs/CROSS_REPO_SMOKE_TEST.md`) verified the snapshot is an exact additive subset of a fresh backend-source spec (missing only the new `POST /checkout/handoff`), but also proved spec-level sync does not imply runtime availability: backend HEAD fails to register its tsoa routes at startup, so the spec-described search/product-detail/cart/checkout endpoints all 404 while express-only routes (store config, homescreen, unified cart, orders) work.

Unknown: Whether real EAS/signed merchant builds succeed end-to-end (signing, store submission, on-device identity). Config evaluation and local prebuild output were verified with a sample merchant on 2026-07-02, but no EAS build was run.

## Current Priority Areas

- Backend (critical, cross-repo): fix tsoa route registration at backend HEAD so search, product detail, cart, and checkout endpoints actually serve; the mobile search and checkout screens currently target dead routes (`docs/CROSS_REPO_SMOKE_TEST.md`).
- Keep mobile secrets safety strict, especially around Shopify Admin/private credentials.
- Preserve backend-owned tenant isolation and store-scoped API usage.
- Resolve native identity/build mismatches before production branded releases.
- Implement runtime branding only through scoped follow-up issues; prove merchant-branded build output end-to-end.
- Extend Jest coverage when backend/mobile behavior changes.

## Related Docs And Issues

- `CARTAISY_CONTEXT.md`
- `docs/ARCHITECTURE.md`
- `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`
- `docs/MOBILE_ENV_VARIABLES.md`
- `docs/MOBILE_BRANDING_CONFIG_AUDIT.md`
- `docs/DYNAMIC_APP_CONFIG_MIGRATION_AUDIT.md`
- `docs/MOBILE_RUNTIME_BRANDING_CONTRACT.md`
- GitHub issue #40
