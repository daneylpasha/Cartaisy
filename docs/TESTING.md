# Mobile Testing And Validation

This document explains current mobile validation commands and expectations. Verify commands from `package.json` before using them.

## Current State

Current state: The package manager is npm as implied by existing README commands and `package-lock.json` in the repo.

Current state: Common commands from `package.json` are:

```bash
npm install
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

Current state: `npm test` currently prints `No mobile test runner configured yet`; it does not run a real test suite.

Current state: `npm run android` maps to `expo run:android`, and `npm run ios` maps to `expo run:ios`.

Current state: `eas.json` includes `development`, `preview`, and `production` build profiles. The development and preview Android profiles build APKs; production uses default EAS settings unless configured elsewhere.

## Target State

Target state: Before mobile PRs, run the most relevant available checks for the changed surface and document any skipped checks in the PR.

Target state: Docs-only PRs should at minimum run markdown/diff sanity checks when available, confirm no runtime files changed, and avoid changing package files, CI, tests, secrets, native signing/certificates, checkout/payment logic, or app behavior.

Target state: Runtime code changes should run lint and typecheck, and should add or update tests for backend/mobile behavior when risk warrants it.

Target state: Release/build work should validate iOS and Android behavior on clean simulator/emulator or device installs, and should verify Expo/EAS config, native identity, Firebase/native service files, environment values, and store-scoped API behavior.

## Known Gaps

Known gap: No real mobile test runner is configured by the current `test` script. Do not claim automated test coverage exists unless verified in code or CI.

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
