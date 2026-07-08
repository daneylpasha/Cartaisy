# Mobile Testing And Validation

This document explains current mobile validation commands and expectations. Verify commands from `package.json` before using them.

## Package Manager

Current state: The authoritative package manager for this repo is npm. `package.json` declares `"packageManager": "npm@10.8.2"`, CI installs with `npm ci`, and `package-lock.json` is the only committed lockfile. Do not use yarn or pnpm, and do not commit `yarn.lock` or `pnpm-lock.yaml` (`yarn.lock` is gitignored).

Current state: `.npmrc` sets `legacy-peer-deps=true`, which is required for dependency resolution during install. It applies automatically to local installs and CI.

Current state: For a reproducible clean install (what CI does), run:

```bash
npm ci
```

Use `npm install` only when intentionally changing dependencies, and commit the resulting `package-lock.json` update.

## Current State

Current state: Common commands from `package.json` are:

```bash
npm ci
npm start
npm run android
npm run ios
npm run web
npm run lint
npm run typecheck
npm test
npm run generate:api
```

Current state: `npm run lint` maps to `expo lint`.

Current state: `npm run typecheck` maps to `tsc --noEmit`.

Current state: `npm test` maps to `jest` using the `jest-expo` preset (`jest.config.js`). It runs real test suites matched by `**/__tests__/**/*.test.ts` and `**/__tests__/**/*.test.tsx` (currently `utils/__tests__/`, `api/config/__tests__/`, `api/__tests__/` for auth refresh interceptor behavior, `store/__tests__/` for cart and auth store state, plus the component/screen suites below).

Current state: Component/screen tests use `@testing-library/react-native` (with `react-test-renderer` pinned to the React version) on top of `jest-expo`. The approach (added for GitHub issue #65): render real components inside the app's `TamaguiProvider` via `test-utils/renderWithTamagui.tsx`; mock heavy leaf children (checkout steps, cart line items, bottom sheets), storage, and generated API hooks at module boundaries; drive behavior through visible text and testIDs rather than snapshots. Screen tests live in the root `__tests__/` directory — never inside `app/`, which expo-router treats as the route tree. Current coverage: shared `CatalogUnavailableState` UI, the `AuthGuardContext` gate mechanism, checkout screen (guest auth gate; unavailable state replacing steps and blocking Continue), cart screen (unavailable state hiding checkout, retry recovery), wishlist screen (unavailable state, retry refetch), and `CollectionsGrid` home-module resilience to missing/malformed payloads.

Current state: `scripts/smoke/` holds manual smoke suites that drive the real mobile API client against a live backend sandbox. They are deliberately outside the CI `testMatch` pattern and run only via an explicit `npx jest --testMatch '**/scripts/smoke/<suite>.smoke.test.ts'` with `EXPO_PUBLIC_API_BASE_URL`/`EXPO_PUBLIC_STORE_ID` pointed at a seeded sandbox — never a real merchant backend. `backend-api.smoke.test.ts` covers the cross-repo API/tenant contract (recipe and results in `docs/CROSS_REPO_SMOKE_TEST.md`); `checkout-orders.smoke.test.ts` covers the cart/checkout/payment/orders private-beta scenarios, including a manual UI checklist for the flows currently blocked by backend issues (recipe and results in `docs/CHECKOUT_ORDERS_SMOKE_TEST.md`).

Current state: `npm run android` maps to `expo run:android`, and `npm run ios` maps to `expo run:ios`.

Current state: `eas.json` includes `development`, `sample-merchant-development`, `preview`, and `production` build profiles. The sample merchant profile extends `development` with fictional non-secret Acme env values for config/build-flow verification. The development, sample merchant, and preview Android profiles build APKs; production uses default EAS settings unless configured elsewhere.

## Dependency Audit (2026-07-03, GitHub issue #64)

Current state: `npm audit` reported 58 vulnerabilities (13 critical, 19 high, 25 moderate, 1 low). After triage, 21 moderate remain; 0 critical/high/low.

Actions taken:

- Removed stray production dependencies with no imports anywhere in the app: `@anthropic-ai/claude-code` (a development CLI that also carried its own high advisories; it does not belong in app dependencies) and `init` (unused, almost certainly an accidental install).
- Applied `npm audit fix` (semver-compatible, lockfile-only; no `--force`). Runtime-relevant fix: `axios` 1.12.x → 1.18.1 — the only vulnerable dependency actually shipped in the app bundle (SSRF via NO_PROXY normalization bypass; auth bypass via prototype-pollution gadget in `validateStatus`). Dev-tooling fixes included `orval` 7.13.2 → 7.21.0 (critical code-injection advisories in codegen), `protobufjs`, `tar`, `ws`, `form-data`, `node-forge`, `minimatch`, `picomatch`, and others.
- The `orval` bump changes generated-client output, so `npm run generate:api` was re-run and the regenerated client committed in the same change (per `docs/DECISIONS.md`); the diff is type-level only (error-type unions and version headers — no URL, method, payload, or runtime changes).
- Added a scoped `overrides` entry forcing `lodash@^4.18.1` under `@stoplight/spectral-functions` (dev-only orval codegen chain): its parent `@ibm-cloud/openapi-ruleset` pins `spectral-functions` to exactly 1.10.1 even at its latest release, which pins a lodash version with a high code-injection advisory, so no update path exists without the override.

Remaining accepted/deferred risks (all moderate severity, none in shipped app JS):

- 19 findings in the Expo SDK 53 family (`expo`, `expo-constants`, `expo-dev-client`, `expo-linking`, `expo-notifications`, `expo-splash-screen`, `jest-expo`, and their `@expo/*`/`ajv`/`postcss`/`uuid`/`xcode` transitives). The only fix npm offers is the Expo SDK 57 major upgrade, which is explicitly out of scope for dependency triage ("no broad Expo/React Native upgrades"). The advisories sit in build/config tooling chains (`@expo/config`, `@expo/cli`, prebuild/metro config), not in runtime bundle code. Deferred to a dedicated, scoped Expo SDK upgrade issue.
- `orval` → `js-yaml` (quadratic-complexity DoS in merge keys): dev-only codegen path; npm's proposed "fix" is an orval downgrade to 7.11.2, which is not sensible. Deferred until orval ships with a patched js-yaml.

Re-triage cadence: re-run `npm audit` whenever dependencies change and before each release (`docs/RELEASE_CHECKLIST.md`); update this section when the remaining items are fixed or the Expo SDK upgrade lands.

## Target State

Target state: Before mobile PRs, run the most relevant available checks for the changed surface and document any skipped checks in the PR.

Target state: Docs-only PRs should at minimum run markdown/diff sanity checks when available, confirm no runtime files changed, and avoid changing package files, CI, tests, secrets, native signing/certificates, checkout/payment logic, or app behavior.

Target state: Runtime code changes should run lint and typecheck, and should add or update tests for backend/mobile behavior when risk warrants it.

Target state: Release/build work should validate iOS and Android behavior on clean simulator/emulator or device installs, and should verify Expo/EAS config, native identity, Firebase/native service files, environment values, and store-scoped API behavior.

## Known Gaps

Known gap: Jest coverage spans pure logic modules (`utils`, `api/config`), the API client auth refresh interceptors (`api/__tests__/`), cart/auth store state (`store/__tests__/`), and the focused component/screen suites listed above (checkout/cart/wishlist unavailable states, checkout auth gate, one home module renderer). Broader screen behavior — navigation flows, checkout step internals (shipping form, payment sheet), PDP/PLP rendering — is still untested; there is no E2E setup.

Known gap: Expo/EAS builds were not run as part of this docs-only context update. Build behavior must be verified before release work.

Known gap: iOS/Android validation requires platform tooling and target devices/simulators. Do not assume this exists unless verified in code, local runs, or CI logs.

Known gap: Existing generated API clients depend on `api-spec/swagger.json` and Orval. Regeneration should be done only when API spec changes are in scope.

## Required Validation Before PR

Current state: For docs-only changes, confirm the diff contains only documentation/context files and run:

```bash
git diff --check
git status --short
```

Current state: For mobile runtime code changes, also consider:

```bash
npm run lint
npm run typecheck
npm test
```

Current state: For native/release changes, also consider:

```bash
npx expo config --type public
npx eas build --profile development --platform android
npx eas build --profile development --platform ios
```

Those EAS commands are examples to verify against project policy before running. They can consume build credits, require credentials, or depend on signing configuration.

## Related Docs And Issues

- `package.json`
- `eas.json`
- `.github/pull_request_template.md`
- `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`
- `docs/MOBILE_ENV_VARIABLES.md`
- `docs/DYNAMIC_APP_CONFIG_MIGRATION_AUDIT.md`
- GitHub issue #40
