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

Current state: `npm test` maps to `jest` using the `jest-expo` preset (`jest.config.js`). It runs real test suites matched by `**/__tests__/**/*.test.ts` (currently `utils/__tests__/`, `api/config/__tests__/`, `api/__tests__/` for auth refresh interceptor behavior, and `store/__tests__/` for cart and auth store state).

Current state: `scripts/smoke/` holds manual smoke suites that drive the real mobile API client against a live backend sandbox. They are deliberately outside the CI `testMatch` pattern and run only via an explicit `npx jest --testMatch '**/scripts/smoke/<suite>.smoke.test.ts'` with `EXPO_PUBLIC_API_BASE_URL`/`EXPO_PUBLIC_STORE_ID` pointed at a seeded sandbox — never a real merchant backend. `backend-api.smoke.test.ts` covers the cross-repo API/tenant contract (recipe and results in `docs/CROSS_REPO_SMOKE_TEST.md`); `checkout-orders.smoke.test.ts` covers the cart/checkout/payment/orders private-beta scenarios, including a manual UI checklist for the flows currently blocked by backend issues (recipe and results in `docs/CHECKOUT_ORDERS_SMOKE_TEST.md`).

Current state: `npm run android` maps to `expo run:android`, and `npm run ios` maps to `expo run:ios`.

Current state: `eas.json` includes `development`, `preview`, and `production` build profiles. The development and preview Android profiles build APKs; production uses default EAS settings unless configured elsewhere.

## Target State

Target state: Before mobile PRs, run the most relevant available checks for the changed surface and document any skipped checks in the PR.

Target state: Docs-only PRs should at minimum run markdown/diff sanity checks when available, confirm no runtime files changed, and avoid changing package files, CI, tests, secrets, native signing/certificates, checkout/payment logic, or app behavior.

Target state: Runtime code changes should run lint and typecheck, and should add or update tests for backend/mobile behavior when risk warrants it.

Target state: Release/build work should validate iOS and Android behavior on clean simulator/emulator or device installs, and should verify Expo/EAS config, native identity, Firebase/native service files, environment values, and store-scoped API behavior.

## Known Gaps

Known gap: Jest coverage spans pure logic modules (`utils`, `api/config`), the API client auth refresh interceptors (`api/__tests__/`), and cart/auth store state (`store/__tests__/`). Component/screen behavior — including the checkout/cart unavailable-state UI blocking in `app/checkout.tsx` and `app/(tabs)/cart.tsx` — is not covered by automated tests; `testMatch` only picks up `.test.ts` files and no React Native testing library is installed.

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
