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

### Dynamic App Config Is Implemented Via app.config.ts

Date: 2026-07-01 (implemented; originally recorded as planned with date unknown / historical).

Decision: Dynamic Expo app config is implemented. `app.config.ts` generates app identity (name, slug, scheme, version, icons, iOS bundle identifier, Android package, Firebase file paths, Apple Pay merchant ID, EAS project metadata) from environment variables with cartaisy defaults. Static `app.json` was removed.

Reason: Merchant app builds need repeatable build-time identity plumbing, and static config drifted from documented environment values.

Impact: Branded builds set identity through environment values at build time. Merchant-branded build output is not yet proven end-to-end; verify `npx expo config --type public` and EAS output with per-merchant values before release.

Related docs: `docs/DYNAMIC_APP_CONFIG_MIGRATION_AUDIT.md`, `docs/MOBILE_ENV_VARIABLES.md`, `app.config.ts`.

### Jest Is The Mobile Test Runner

Date: 2026-07-01.

Decision: Jest with the `jest-expo` preset (`jest.config.js`) is the mobile test runner, invoked by `npm test`. Test files live under `**/__tests__/**/*.test.ts`.

Reason: Reproducible validation requires a real test suite instead of a placeholder `test` script, starting with pure logic modules.

Impact: Current coverage spans `utils/__tests__/`, `api/config/__tests__/`, `api/__tests__/` (auth refresh interceptor behavior), and `store/__tests__/` (cart/auth store state). Extend coverage when backend/mobile behavior changes; do not claim broader automated coverage than exists.

Related docs: `docs/TESTING.md`, `jest.config.js`.

### npm Is The Authoritative Package Manager

Date: 2026-07-02.

Decision: npm is the authoritative package manager. `package.json` declares `"packageManager": "npm@10.8.2"`, `package-lock.json` is the only committed lockfile, and `yarn.lock` was removed and gitignored.

Reason: A stale `yarn.lock` alongside `package-lock.json` made local validation irreproducible and inconsistent with CI, which installs with `npm ci`.

Impact: Use `npm ci` for clean installs and `npm install` only for intentional dependency changes. Do not reintroduce yarn or pnpm lockfiles.

Related docs: `docs/TESTING.md`, `.github/workflows/ci.yml`.

### Generated API Client Syncs From A Committed Backend Spec Snapshot

Date: 2026-07-02.

Decision: The Orval-generated API client (`api/generated/`) is produced only by `npm run generate:api` from the committed spec snapshot `api-spec/swagger.json`. That snapshot is refreshed from the backend repo (`cartaisy-backend`, `npm run generate:spec` / `tsoa spec` output in `public/swagger.json`), and the spec and regenerated client are committed together. Generated files must never be edited by hand; `clean: true` deletes manual additions on the next run. Mobile-side view types the spec cannot express yet live in `api/types.ts`, and untyped endpoint responses (currently `GET /customer/search`) are narrowed at the consuming call site.

Reason: Orval previously read a now-dead production URL, `api-spec/swagger.json` was stale, and generated files carried hand-edits that any regeneration would silently destroy, reintroducing type errors and contract drift.

Impact: Regeneration is deterministic and repeatable offline. To sync after a backend API change: regenerate the backend spec, copy it to `api-spec/swagger.json`, run `npm run generate:api`, run `npm run typecheck` and `npm test`, and commit spec plus generated output in the same change. Fix type gaps in the backend spec or `api/types.ts`, never in `api/generated/`.

Related docs: `orval.config.ts`, `api-spec/swagger.json`, `api/types.ts`, backend repo `tsoa.json`.

### EAS Builds Regenerate Native Projects From app.config.ts

Date: 2026-07-03.

Decision: All EAS builds use Continuous Native Generation. `.easignore` excludes the checked-in `ios/` and `android/` projects from the EAS build archive, so the EAS build worker runs `npx expo prebuild` and generates native projects from `app.config.ts` with the environment values configured for that build. The checked-in native projects remain in the repo for local Cartaisy development (`npx expo run:ios` / `npx expo run:android`).

Reason: With native directories present in the build archive, EAS treats the app as bare workflow and ignores `app.config.ts` identity values, so merchant builds would silently ship Cartaisy identity (GitHub issue #60; blocker recorded in `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md` on 2026-07-02). Excluding them at archive time removes that bypass for every EAS build path without deleting the local development projects.

Impact: Merchant builds must deliver identity env values (and merchant Firebase files) to the EAS worker through EAS environment variables or an `eas.json` profile `env` block on the merchant's own EAS project; locally exported shell variables are not forwarded to EAS build workers. Cartaisy default EAS builds are also prebuild-generated now and resolve to Cartaisy identity through `app.config.ts` defaults. Because `.easignore` replaces `.gitignore` for EAS archive filtering, the `.gitignore` rules are mirrored in `.easignore` and the two files must stay in sync (guarded by `scripts/__tests__/easignore.test.ts`). Native customizations made by hand-editing `ios/`/`android/` will not appear in EAS builds; express them through `app.config.ts` or config plugins instead.

Related docs: `.easignore`, `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`, `docs/RELEASE_CHECKLIST.md`, GitHub issue #60.

### Cross-Repo Smoke Tests Run Against An Ephemeral Local Backend Sandbox

Date: 2026-07-03.

Decision: Cross-repo mobile/backend runtime verification uses `scripts/smoke/backend-api.smoke.test.ts`, a manual Jest suite (outside CI `testMatch`) that drives the real mobile API client against a disposable local backend sandbox: backend source at a pinned commit, `mongodb-memory-server` for storage, fabricated stores/products/customers, no Shopify/Stripe credentials and no real merchant data. Each row asserts observed behavior and flags contract mismatches, so reruns detect backend behavior changes. Results are documented in `docs/CROSS_REPO_SMOKE_TEST.md`.

Reason: No deployed backend is reachable (both configured Railway URLs are dead as of 2026-07-03), and the 2026-07-03 run for GitHub issue #62 proved spec-level sync does not imply runtime compatibility — backend HEAD fails to register its tsoa routes at startup, so spec-described search/product-detail/cart/checkout endpoints 404 while express-only routes work.

Impact: Mobile client compatibility claims must distinguish spec sync (verified by `npm run generate:api` against the snapshot) from runtime availability (verified only by this smoke suite or a live sandbox). Point the suite only at seeded sandboxes, never at a real merchant backend. Re-run after backend route/spec fixes and before relying on search/product-detail/cart/checkout flows.

Related docs: `docs/CROSS_REPO_SMOKE_TEST.md`, `docs/TESTING.md`, `scripts/smoke/backend-api.smoke.test.ts`, GitHub issue #62.

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
