# Mobile Merchant Provisioning Runbook

This runbook is the step-by-step process for provisioning one merchant-branded Cartaisy mobile app: Firebase, EAS, signing, push, and payment/native identity. Follow it in order; each step lists its inputs, outputs, and whether it is manual today.

This is a provisioning document only. It does not change runtime app code, checkout/payment implementation, backend code, or runtime branding. Store submission is out of scope; the runbook ends at a development/internal EAS build.

How it relates to the other docs:

- `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md` — the release checklist for a branded build; this runbook is how you produce the inputs that checklist verifies.
- `docs/MOBILE_ENV_VARIABLES.md` — the authoritative reference for every variable named below.
- `docs/DECISIONS.md` — records the build-flow decision this runbook depends on: EAS builds regenerate native projects from `app.config.ts` (`.easignore` excludes the checked-in `ios/`/`android/` projects), so provisioning is done entirely through environment values and per-merchant external accounts. Local `expo run:*` uses the checked-in Cartaisy projects and must not be used for merchant builds.
- `docs/examples/sample-merchant.env` — the fictional "Acme Outfitters" merchant used for the sample walkthrough at the end.

## Access You Need Before Starting

- Firebase console access (to create the merchant's Firebase project and apps).
- An Expo account that will own the merchant's EAS project, and `eas-cli` logged in to it.
- Apple Developer Program membership for the iOS app (see the ownership decision in Step 3).
- A Google Play developer account is NOT needed for development/internal builds; it becomes relevant at store submission (out of scope here).
- Stripe dashboard access for the merchant's Stripe account, if wallet payments are in scope.
- Cartaisy backend admin access to confirm the merchant's store record and API environment.

## Step 0 — Collect Merchant Identity Inputs

Everything downstream depends on these values. Record them in the "Merchant Build Record" section of `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md` before touching any console.

| Input | Environment variable (consumed by `app.config.ts`) | Rules |
| --- | --- | --- |
| App display name | `APP_NAME` | Merchant-approved; also the store listing name later. |
| Expo slug | `APP_SLUG` | Lowercase, hyphenated, unique within the Expo owner account. |
| Deep-link URL scheme | `APP_SCHEME` | Lowercase alphanumeric, unique enough to avoid collisions with other installed apps. |
| Marketing version | `APP_VERSION` | Semver-style string. |
| iOS bundle identifier | `IOS_BUNDLE_IDENTIFIER` | Reverse-DNS (e.g. `com.merchantdomain.appname`). Permanent once the app ships; choose carefully. |
| iOS build number | `IOS_BUILD_NUMBER` | Positive integer string. |
| Android package | `ANDROID_PACKAGE` | Reverse-DNS. Permanent once the app ships. Usually equal to the iOS bundle ID. |
| Android version code | `ANDROID_VERSION_CODE` | Positive integer. |
| Apple Pay merchant ID | `IOS_APPLE_PAY_MERCHANT_ID` | `merchant.`-prefixed reverse-DNS; only if wallet payments are in scope (Step 5). |
| App icon | `APP_ICON_PATH` | Merchant-approved asset committed under `assets/` or supplied through the build pipeline. |
| Notification icon / color | `APP_NOTIFICATION_ICON_PATH`, `APP_NOTIFICATION_COLOR` | Only if push is in scope. |
| Adaptive icon / splash | `ANDROID_ADAPTIVE_ICON_PATH`, `ANDROID_ADAPTIVE_ICON_BACKGROUND`, `SPLASH_BACKGROUND_COLOR` | Merchant-approved. |
| EAS project | `EAS_PROJECT_ID`, `EXPO_OWNER` | Produced by Step 2, not chosen by the merchant. |
| Backend API URL | `EXPO_PUBLIC_API_BASE_URL` | Public; must point at the intended Cartaisy backend environment. |
| Store ID | `EXPO_PUBLIC_STORE_ID` | Public; the merchant's 24-character hex Mongo ObjectId (validated by `api/config/mobileConfig.ts`). Not a security boundary — backend tenant isolation is authoritative. |
| Public app name/scheme mirrors | `EXPO_PUBLIC_APP_NAME`, `EXPO_PUBLIC_APP_SCHEME` | Same values as `APP_NAME`/`APP_SCHEME`, readable from app JavaScript. |
| Stripe publishable key | `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public by design; per-merchant; only if Stripe is in scope. |
| Stripe merchant ID mirror | `EXPO_PUBLIC_STRIPE_MERCHANT_ID` | Same value as `IOS_APPLE_PAY_MERCHANT_ID`. |

All of these are non-secret build-time values. Anything not in this table — tokens, keys, credentials — does not belong in mobile configuration at all (see "What Must Never Be Committed").

Manual today: yes (values gathered from the merchant by hand).

## Step 1 — Confirm the Backend Store Record

1. Confirm the merchant's store exists in the target Cartaisy backend environment and note its store ID (`EXPO_PUBLIC_STORE_ID`).
2. Confirm the backend environment URL that the branded app should use (`EXPO_PUBLIC_API_BASE_URL`).
3. Confirm the store's runtime config endpoint (`/store/config`) returns the merchant's currency, timezone, and name.

The mobile app gets all Shopify/catalog/store data through the Cartaisy backend. Provisioning never involves giving the mobile app Shopify tokens, Shopify API access, or backend secrets.

Manual today: yes.

## Step 2 — Create the Merchant's EAS Project

Ownership model: one EAS project per merchant app. The Cartaisy `rendernext` EAS project is for the Cartaisy default app only and must never be reused for a merchant build (see `docs/DECISIONS.md`).

Open decision (flag to the build owner if unresolved): whether merchant EAS projects live under a Cartaisy-managed Expo organization or under an Expo account the merchant owns. Until decided, provision sample/internal merchants under a Cartaisy-managed Expo account so work can proceed; real merchant releases need this decision recorded in `docs/DECISIONS.md` first.

1. Log in to the owning Expo account: `eas login` / verify with `eas whoami`.
2. Create the project (Expo dashboard, or `eas project:init` run with `APP_SLUG`/`EXPO_OWNER` exported so it initializes against the merchant identity, from a checkout you do not commit). Use a disposable checkout because `eas project:init` may write the generated project ID into an `app.json`; this repo reads `EAS_PROJECT_ID` from the environment via `app.config.ts`, and a committed `app.json` carrying one merchant's project ID would silently override that for anyone building without the merchant env exported.
3. Record the generated project ID as `EAS_PROJECT_ID` and the owning account as `EXPO_OWNER`.
4. Set every identity variable from Step 0 as an EAS environment variable on the merchant project (plain visibility is fine — they are non-secret). Locally exported shell values are NOT forwarded to EAS build workers; only EAS environment variables or an `eas.json` profile `env` block reach the worker where `app.config.ts` is re-evaluated during prebuild.

Manual today: yes. Automation opportunity: a provisioning script that creates the EAS project and pushes the env set from a merchant record.

## Step 3 — Signing / Credential Ownership

Model: use EAS-managed (remote) credentials, stored in the merchant's EAS project — never in this repository.

- iOS: EAS generates and stores the distribution certificate and provisioning profile against an Apple Developer team. Open decision (same flag as Step 2): whether the Apple Developer Program membership of record is Cartaisy's or the merchant's. Apple's rules push toward the merchant's own membership for merchant-branded store apps; internal development builds can proceed under a Cartaisy-controlled team.
- Android: let EAS generate and store the upload keystore for the merchant project. Do not generate local keystores.

The first `eas build` for each platform walks through credential generation interactively; run it from a terminal, not CI, the first time.

Manual today: yes (interactive on first build). Automation opportunity: `credentials.json`-free EAS remote credentials are already mostly automated after the first interactive run.

## Step 4 — Firebase Provisioning (iOS + Android)

Create a separate Firebase project per merchant (do not add merchant apps to the Cartaisy Firebase project — keeps analytics, push quotas, and access isolated per tenant).

1. Firebase console → create project for the merchant.
2. Add an iOS app with the exact `IOS_BUNDLE_IDENTIFIER` from Step 0. Download `GoogleService-Info.plist`.
3. Add an Android app with the exact `ANDROID_PACKAGE`. Download `google-services.json`.
4. For push (Step 5), upload the APNs key to the Firebase iOS app settings.

Handling the two Firebase files — they are per-merchant configuration and must never be committed:

- For EAS builds: store each file as an EAS file-type environment variable on the merchant project, named exactly `IOS_GOOGLE_SERVICES_FILE` and `ANDROID_GOOGLE_SERVICES_FILE`. On the build worker the variable resolves to a file path, which is exactly what `app.config.ts` expects, so no code or config change is needed.
- For local config verification (Step 7): keep the files outside the repository (or in a git-ignored location) and point the two variables at their absolute paths in your shell.

Mismatch failure modes (why the bundle ID/package must match exactly): a `google-services.json` whose `package_name` differs from the merchant `applicationId` fails the Google Services Gradle step at build time; a mismatched `GoogleService-Info.plist` builds but breaks Firebase/push registration at runtime.

Manual today: yes (console clicks + file download + EAS env upload). Automation opportunity: Firebase project/app creation and config download via `firebase` CLI or the Firebase Management API, then pushing straight into EAS file env vars.

## Step 5 — Push Notification Registration (if push is in scope)

- iOS: push requires an APNs authentication key (`.p8`) from the Apple Developer account of record (Step 3), uploaded to the merchant's Firebase iOS app. The `aps-environment` entitlement is generated by prebuild; EAS applies the correct value through signing.
- Android: FCM registration comes with `google-services.json`; provide `APP_NOTIFICATION_ICON_PATH` and `APP_NOTIFICATION_COLOR`.
- The `.p8` key is a secret. It lives in the Apple/Firebase consoles only — never in the repo, never in an EAS plain-visibility variable.

Manual today: yes. Automation opportunity: none worth building until the Apple account ownership decision is made.

## Step 6 — Apple Pay / Stripe (if wallet payments are in scope)

1. Register the Apple Pay merchant ID (`IOS_APPLE_PAY_MERCHANT_ID`) in the Apple Developer account of record.
2. Complete Apple Pay certificate setup between Apple and the merchant's Stripe account per Stripe's documentation.
3. Set `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` (public by design) and `EXPO_PUBLIC_STRIPE_MERCHANT_ID` (same value as the Apple Pay merchant ID) in the EAS env set.
4. Stripe secret keys, restricted keys, and webhook secrets are backend-only and are never part of mobile provisioning.

`app.config.ts` injects the merchant ID into both the iOS entitlements (`com.apple.developer.in-app-payments`) and the Stripe config plugin, so one wrong value shows up in two places — verify it in Step 7 output.

Manual today: yes. This step is skippable for development builds that do not exercise wallet payments.

## Step 7 — Verify the Resolved Config Locally

Before spending a build, prove the identity resolves. From the repo root:

```sh
set -a; source <path-to-merchant>.env; set +a
npx expo config --type public
```

(Use `docs/examples/sample-merchant.env` as the template for the merchant env file; keep real merchant env files outside the repo.)

Confirm in the output: `name`, `slug`, `scheme`, `version`, `ios.bundleIdentifier`, `ios.buildNumber`, `android.package`, `android.versionCode`, the Firebase file paths, the Apple Pay merchant ID in both the entitlements and the Stripe plugin block, and `extra.eas.projectId` / `owner`.

Manual today: yes. Automation opportunity: a script that diffs this output against the merchant record and fails on mismatch.

## Step 8 — Run the Development/Internal EAS Build

```sh
eas build --profile development --platform ios
eas build --profile development --platform android
```

Run against the merchant's EAS project (the identity env set on that project drives `app.config.ts` on the worker). Because `.easignore` excludes the checked-in native projects, the worker regenerates `ios/`/`android/` from `app.config.ts` — merchant identity cannot be overridden by the checked-in Cartaisy projects. Use `--profile preview` for installable internal-distribution builds without the dev client.

Install on a device/simulator and verify launcher name, icon, splash, deep-link scheme, backend URL, and store data per the "Release Verification" section of `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`.

Manual today: partially (one command, but first-run credentials are interactive per Step 3).

## What Must Never Be Committed

These must never appear in the repository, in `EXPO_PUBLIC_*` values, or in plain-visibility EAS variables (file-type EAS env vars are acceptable for the two Firebase config files):

- Real merchant `GoogleService-Info.plist` or `google-services.json` files.
- Signing keys and certificates: keystores, `.jks`, `.p12`, `.p8` APNs keys, `.mobileprovision` profiles, `.pem` files.
- Shopify tokens of any kind (Admin, Storefront, private/custom app). Mobile gets Shopify data only through the Cartaisy backend.
- Stripe secret/restricted keys or webhook secrets (the publishable key is the only Stripe value that belongs in mobile config).
- Firebase private keys or service-account JSON.
- Backend secrets: JWT/session secrets, database URLs, internal API keys.
- Real merchant `.env` files.

`.gitignore` and `.easignore` already exclude the credential file patterns and `.env` files, and `scripts/__tests__/easignore.test.ts` guards those rules — but the ignore rules are a backstop, not permission to place real credentials in the working tree.

## Sample Merchant Provisioning Checklist (Acme Outfitters)

A dry run of this runbook using the fictional merchant in `docs/examples/sample-merchant.env`. Items marked *simulated* cannot be completed for a fictional merchant and are the exact items a real merchant needs.

- [ ] Step 0: identity inputs collected — provided by `docs/examples/sample-merchant.env` (`Acme Outfitters`, `com.example.acmeoutfitters`, scheme `acmeoutfitters`, store ID `507f1f77bcf86cd799439011`).
- [ ] Step 1: backend store record confirmed — *simulated* (sample API URL and store ID are fictional).
- [x] Step 2: EAS project created and env set — real internal sample project `@rendernext/acme-outfitters` created for GitHub issue #86, with non-secret `EAS_PROJECT_ID` and `EXPO_OWNER` recorded in `docs/examples/sample-merchant.env` and the `sample-merchant-development` profile. Real merchant releases still need their own project/owner decision.
- [ ] Step 3: signing credentials provisioned in EAS — *simulated* (needs the EAS project and an Apple team).
- [ ] Step 4: Firebase apps created, files stored as EAS file env vars — *simulated* (sample points at the committed Cartaisy files only so config evaluation works; a real merchant must use their own files or Android builds fail at the Google Services Gradle step).
- [ ] Step 5: push registration — *simulated*.
- [ ] Step 6: Apple Pay/Stripe — *simulated* (sample uses `pk_test_sample_placeholder` and a fictional merchant ID).
- [ ] Step 7: `npx expo config --type public` with the sample env exported resolves the full Acme identity — runnable today; last verified 2026-07-08 (see `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`).
- [ ] Step 8: EAS development build — attempted 2026-07-08 and 2026-07-09 for Android with placeholder EAS metadata, then attempted again on 2026-07-13 against the real internal sample project. No artifact was produced; the latest blocker is uninitialized Android remote credentials/keystore in `--non-interactive` mode. Results are recorded in `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md` and `docs/RELEASE_CHECKLIST.md`.

## Manual Steps Today vs Automation Opportunities

Manual today (every step, in practice):

- Collecting merchant identity inputs and recording the build record (Step 0).
- Confirming the backend store record (Step 1).
- Creating the EAS project and entering its env variables (Step 2).
- First-run interactive credential generation (Step 3).
- Firebase project/app creation, file download, EAS file env upload (Step 4).
- APNs key creation/upload (Step 5).
- Apple Pay registration and Stripe linkage (Step 6).
- Running config verification and reading the output (Step 7).

Automatable later (rough priority order):

1. Config verification diff: script that compares `npx expo config --type public` output against a merchant record and fails on mismatch (no external accounts needed — cheapest win).
2. EAS project bootstrap: create project + push the full env set (incl. Firebase file variables) from a merchant record via `eas-cli`.
3. Firebase provisioning: create project/apps and fetch config files via the Firebase Management API.
4. A single "provision merchant" pipeline chaining 2–3 once the EAS/Apple ownership decisions are recorded in `docs/DECISIONS.md`.

Blocked on decisions, not tooling: Apple Developer and Expo/EAS account ownership (Cartaisy-managed vs merchant-owned) must be decided and recorded before store-facing automation is worth building.

## Related Docs

- `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`
- `docs/RELEASE_CHECKLIST.md`
- `docs/MOBILE_ENV_VARIABLES.md`
- `docs/DECISIONS.md`
- `docs/examples/sample-merchant.env`
- `app.config.ts`
- GitHub issues #60, #61
