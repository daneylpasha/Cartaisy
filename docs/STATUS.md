# Mobile Status

Last updated: 2026-07-13 (GitHub issue #86 created the real internal sample EAS project `@rendernext/acme-outfitters` and updated the sample Android development profile with its non-secret project metadata. The Android EAS development build still produced no artifact because remote Android credentials/keystore are not initialized and EAS cannot generate a new keystore in `--non-interactive` mode).

This file is a human/agent-maintained snapshot. It is not an automatically guaranteed source of truth. Verify current behavior in code before implementation work.

## Current State

Current state: The mobile app engine is an Expo/React Native app with routed shopping, auth, account, cart, checkout, home, catalog, notification, and profile surfaces.

Current state: The repo has useful mobile docs for environment variables, branded builds, per-merchant provisioning (`docs/MOBILE_MERCHANT_PROVISIONING_RUNBOOK.md`), branding/config boundaries, dynamic app config migration, home API usage, and runtime branding contracts.

Current state: Public API base URL and store ID configuration are validated in `api/config/mobileConfig.ts`, and backend API calls include `X-Store-ID`.

Current state: Store config currently loads `currency`, `timezone`, and `name` from `/store/config` with local fallbacks.

Current state: `package.json` exposes `start`, `android`, `ios`, `web`, `lint`, `typecheck`, `test`, and `generate:api` scripts. `npm test` runs Jest (`jest-expo` preset via `jest.config.js`) with a current baseline of 15 test suites / 78 tests. Coverage includes real suites in `utils/__tests__/`, `api/config/__tests__/`, `api/__tests__/` (auth refresh), `store/__tests__/` (cart/auth stores), and focused component/screen tests for unavailable states, auth gating, cart checkout handoff, checkout beta gating, legacy address-list checkout returns, and home module resilience.

Current state: npm is the authoritative package manager. `package.json` declares `"packageManager": "npm@10.8.2"`, `package-lock.json` is the only committed lockfile, and `yarn.lock` was removed and gitignored. As of 2026-07-02, a clean checkout validates with `npm ci`, `npm run lint`, `npm run typecheck`, and `npm test`, matching CI.

## Readiness Snapshot

Current state: App engine readiness is partial. Core Expo Router, Tamagui, React Query, Zustand, Orval, Firebase messaging, and Stripe dependencies are present.

Current state: Store/tenant config is partial. `EXPO_PUBLIC_STORE_ID` and `X-Store-ID` behavior are present, but the store ID is public client configuration and backend tenant checks remain authoritative.

Current state: Tenant-mismatch verification is blocked on backend sandbox availability. A 2026-07-09 issue #82 rerun of the backend and checkout/orders smoke suites reached the configured Railway backend with network access, but every route returned Railway `404 Application not found`, so correct-store, wrong-store, inactive-store, nonexistent/malformed-store, authenticated cross-store, guest-session cross-store, cart, checkout handoff, orders, product/search, and home behavior could not be freshly verified. The last backend-code run remains the historical local sandbox result in `docs/CROSS_REPO_SMOKE_TEST.md` and `docs/CHECKOUT_ORDERS_SMOKE_TEST.md`: `/store/config` enforced clean store validation, while `/customer/auth/profile`, `/customer/orders`, and `/unified-cart` still need backend tenant-mismatch hardening follow-up.

Current state: Branding/theme is partial. App identity is generated at build time by dynamic `app.config.ts` from environment variables with cartaisy defaults; bundled logos and Tamagui colors are static. Runtime branding is documented as a contract but not implemented.

Current state: Home modules/content are partial to implemented. The app uses `GET /customer/homescreen` generated hooks and renders backend-driven layout sections, but exact backend content availability depends on tenant data.

Current state: Product listing/detail is partial to implemented on the mobile side, but a 2026-07-03 cross-repo smoke test (`docs/CROSS_REPO_SMOKE_TEST.md`) found that at the tested backend commit the tsoa-generated routes these clients target — `/customer/search`, `/products/{id}`, plus `/cart/*`, `/checkout/*`, `/favorites` — failed to register at backend startup and returned 404, and the express `GET /products` listing 500ed. A fresh 2026-07-09 rerun against the currently configured Railway backend reached the platform but every API probe returned `404 Application not found`, so catalog/search/cart/checkout runtime availability remains blocked on backend sandbox availability.

Current state: Cart/checkout is partial and high-risk. For private beta, the chosen mobile cart-to-checkout pipeline is the generated `/cart/*` Storefront cart surface plus generated `POST /checkout/handoff`, which returns a Shopify-hosted checkout URL. Add/update/remove/recovery in `useCartManager` stay on the generated cart client so the cart ID is a Shopify Storefront cart ID that handoff can use. The hand-written `/unified-cart` surface remains available for its existing local guest/customer cart uses, but it is not the primary cart-to-checkout surface because its real response is a local product cart (`status`, `data.cart`, `itemCount`) and does not expose a Shopify cart ID for hosted checkout. A 2026-07-09 smoke rerun attempted generated cart create/update/remove and checkout handoff against the configured Railway backend, but all returned Railway `404 Application not found`; no Shopify-hosted checkout URL was produced. Native checkout/payment changes remain high-risk and require human review.

Current state: Customer account/auth is partial to implemented. Login, signup, password reset, profile, token refresh, guest session, and persisted auth state exist. Auth refresh changes are high-risk.

Current state: Native app identity/builds are partial. Dynamic `app.config.ts` (env-driven identity; static `app.json` removed), checked-in iOS/Android projects, Firebase files, EAS config, and native plugins exist. Merchant identity resolution was verified through `npx expo config` and `npx expo prebuild` with a sample merchant (2026-07-02), and re-verified through `npx expo config --type public --json` on 2026-07-08, 2026-07-09, and 2026-07-13. As of 2026-07-03 (GitHub issue #60), `.easignore` excludes the checked-in native projects from EAS build archives, so EAS builds regenerate native projects from `app.config.ts` and can no longer silently ship Cartaisy identity; local `expo run:*` still uses the checked-in projects. As of 2026-07-13 (GitHub issue #86), `eas.json` includes a non-secret `sample-merchant-development` profile pointing at the real internal sample EAS project `@rendernext/acme-outfitters` (`a9a1dd2e-adfe-4020-9f10-6b561859f119`). `eas build:inspect` confirms the Android sample archive path excludes the checked-in native projects and unrelated untracked local report artifacts, but no EAS or signed merchant build artifact has been produced because the sample project's Android remote credentials/keystore are not initialized for non-interactive builds.

Current state: Environment variable/secrets safety is partial to strong. `MOBILE_ENV_VARIABLES.md` documents safe/forbidden values, and `mobileConfig` validates required public values and known forbidden public Shopify/secret-looking keys.

Current state: Testing/CI is partial. Lint, TypeScript, and Jest scripts exist, with Jest coverage now spanning pure logic modules, auth refresh interceptors, cart/auth store state, and focused component/screen behavior. CI (`.github/workflows/ci.yml`) runs `npm ci`, typecheck, lint, and tests on pull requests against `main`.

Current state: Release readiness is partial. A branded build checklist exists, but release readiness still depends on merchant identity, native assets, Firebase config, store-scoped backend setup, validation, and store submission checks.

## Target State

Target state: Mobile SaaS readiness means each merchant-branded build has verified public app configuration, native identity, Firebase/native services, backend tenant scoping, public runtime store config, safe branding, and validated checkout/payment behavior.

Target state: Runtime Shopify/catalog/store data should come from the Cartaisy backend, with Shopify Admin/private credentials kept off device.

Target state: Runtime branding should be implemented only through explicit follow-up issues and validated contracts. Dynamic app config is implemented; its per-merchant build output should be validated before branded releases.

Target state: Testing should include lint, typecheck, meaningful unit/integration coverage where available, platform smoke testing, and release-specific iOS/Android validation.

## Known Gaps

Known gap: Dynamic app config is implemented via `app.config.ts` and verified through `npx expo config` and `npx expo prebuild` with a sample merchant env (2026-07-02, see `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`), with public config re-verified on 2026-07-08, 2026-07-09, and 2026-07-13. No EAS or signed merchant build artifact has been produced. The checked-in-native-projects bypass was resolved on 2026-07-03 via `.easignore` (GitHub issue #60). The 2026-07-13 Android EAS development build attempt reached the real internal sample project but was blocked because Android remote credentials/keystore are not initialized and new keystore generation is unsupported in `--non-interactive` mode. Remaining blockers: initialize sample Android remote credentials through an approved secure flow, supply matching Firebase files through EAS file environment variables, rerun from a clean working tree, and install/verify the produced artifact.

Known gap: Runtime branding contract is documented but not implemented.

Known gap: Native identity, Firebase, Apple Pay, and push notification mismatches identified in audits need dedicated release or implementation work.

Known gap: Jest coverage includes pure logic modules, API client auth refresh interceptors, cart/auth store state, and focused component/screen suites, but it remains incomplete. There is no E2E setup, no device build CI, no payment success/failure E2E coverage, and no full navigation coverage; broader screen behavior and checkout step internals still need dedicated tests.

Known gap: CI and build readiness should be verified before release; do not assume this exists unless verified in code and pipeline results.

## Unknowns

Unknown: Deployed backend availability. As of 2026-07-09, the currently configured Railway backend `https://cartaisy-backend-production.up.railway.app/api/v1` returns platform-level `404 Application not found`; no deployed backend sandbox is reachable from the mobile repo configuration. The 2026-07-03 cross-repo smoke test (`docs/CROSS_REPO_SMOKE_TEST.md`) proved spec-level sync does not imply runtime availability: the backend commit tested there failed to register its tsoa routes at startup, so the spec-described search/product-detail/cart/checkout endpoints all 404 while express-only routes (store config, homescreen, unified cart, orders) worked. As of GitHub issue #72, the mobile spec snapshot has been refreshed to include backend `POST /checkout/handoff`; issue #80 re-ran the smoke suites, but runtime validation still needs a reachable sandbox with store-scoped Shopify Storefront credentials.

Unknown: Current backend tenant-mismatch behavior. GitHub issue #82 attempted fresh tenant-mismatch verification on 2026-07-09, but without a reachable deployed or local seeded backend, the run could only confirm that the configured Railway target is not serving the Cartaisy app. Treat tenant-mismatch behavior as unverified for the current backend until a seeded sandbox with at least two test stores is available.

Unknown: Whether real EAS/signed merchant builds succeed end-to-end (signing, store submission, on-device identity). Config evaluation and local prebuild output were verified with a sample merchant on 2026-07-02, config output was re-verified on 2026-07-08, 2026-07-09, and 2026-07-13, and Android EAS development build commands were attempted on 2026-07-08, 2026-07-09, and 2026-07-13. The latest attempt reached the real internal sample EAS project but stopped at non-interactive Android keystore generation. No installable artifact exists yet.

## Current Priority Areas

- Backend/mobile runtime validation: provision or identify a reachable backend sandbox with store-scoped Shopify Storefront credentials, then re-run the cart-to-hosted-checkout smoke path so generated `/cart/*` and `/checkout/handoff` are verified beyond spec sync.
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
