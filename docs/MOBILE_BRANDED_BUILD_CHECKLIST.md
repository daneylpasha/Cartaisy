# Mobile Branded Build Configuration Checklist

Use this checklist when preparing a merchant-specific Cartaisy mobile app build. It separates values that must be baked into the native build from values that should continue to come from backend runtime configuration.

To produce the inputs this checklist verifies — Firebase apps and config files, the merchant EAS project, signing credentials, push registration, and payment/native identity — follow `docs/MOBILE_MERCHANT_PROVISIONING_RUNBOOK.md` first.

This is a release checklist only. Do not change application behavior, API response shapes, checkout, auth, orders, cart mutations, dashboard logic, or credential handling as part of completing it.

## Branded Build Flow (decided 2026-07-03)

Decision for GitHub issue #60 (recorded in `docs/DECISIONS.md`): every EAS build regenerates native projects from `app.config.ts` (Continuous Native Generation). `.easignore` excludes the checked-in `ios/` and `android/` directories from the EAS build archive, so the EAS worker always runs `npx expo prebuild` and applies the identity env values configured for that build. Merchant identity can no longer be silently overridden by the checked-in Cartaisy native projects.

The Cartaisy default development flow is unchanged locally: `npx expo start`, `npx expo run:ios`, and `npx expo run:android` still use the checked-in Cartaisy native projects. Cartaisy default EAS builds are prebuild-generated and resolve to the same Cartaisy identity through the `app.config.ts` defaults when no identity env values are set.

Merchant development/internal build flow:

1. Create or select the merchant's own EAS project and Expo owner; set `EAS_PROJECT_ID` and `EXPO_OWNER` to match. Do not reuse the Cartaisy `rendernext` EAS project for merchant builds.
2. Configure the merchant identity values from "Build Environment Values" below as EAS environment variables on the merchant EAS project (plain visibility is acceptable — they are non-secret), or in an `eas.json` build profile `env` block. Locally exported shell variables are not forwarded to EAS build workers.
3. Supply merchant Firebase config files matching the merchant bundle ID/package as EAS file-type environment variables for `IOS_GOOGLE_SERVICES_FILE` and `ANDROID_GOOGLE_SERVICES_FILE`. Do not commit real merchant Firebase files.
4. Verify identity locally before building: export the merchant env in a shell (see `docs/examples/sample-merchant.env` for the pattern) and run `npx expo config --type public`.
5. Run `eas build --profile development` (or `preview`) for the target platform.

For the fictional Acme sample, `eas.json` includes `sample-merchant-development`, a non-secret profile that mirrors `docs/examples/sample-merchant.env` so EAS workers receive the same sample identity through a profile `env` block. As of 2026-07-13 (GitHub issue #86), the profile points at the real internal sample EAS project `@rendernext/acme-outfitters` (`EAS_PROJECT_ID=a9a1dd2e-adfe-4020-9f10-6b561859f119`). This is separate from the default Cartaisy app project. The Firebase file paths still point at committed Cartaisy files only so config evaluation works; a successful installed merchant build still needs matching sample/internal Firebase files supplied through secure EAS file environment variables.

`.easignore` replaces `.gitignore` for EAS archive filtering, so it mirrors the `.gitignore` rules; keep the two in sync (guarded by `scripts/__tests__/easignore.test.ts`).

Verification (2026-07-03): `eas build:inspect --platform android --profile development --stage archive` confirmed the EAS build archive excludes `ios/`, `android/`, `node_modules/`, and `.env` while keeping the committed default Firebase files, so the EAS worker will prebuild from `app.config.ts`. `npx expo config --type public` resolves Cartaisy defaults with no env set and full sample-merchant identity with `docs/examples/sample-merchant.env` exported. A real EAS cloud build was not run: the sample merchant's EAS project ID is a deliberate placeholder, per-merchant EAS ownership and signing credentials remain undecided (see Release Blockers below), and generating signing credentials on the Cartaisy EAS project is outside the scope of this build-flow decision.

## Full Provisioning Runbook Rehearsal (2026-08-07)

First attempt to rehearse `docs/MOBILE_MERCHANT_PROVISIONING_RUNBOOK.md` Steps 0–8 in order, in one sitting, for the Phase 2 roadmap item requiring it (not a re-confirmation of individual pieces already touched elsewhere — see the entries below this one for those). Run from an environment with full repo/CLI access but **no EAS or Firebase account login and no physical device or emulator** — that access gap is itself the main finding and shapes what could and couldn't be closed here. Distinct from the 2026-08-04 physical-device entry below, which covered only the on-device identity checks for an already-built artifact.

### Step-by-step outcome

- **Step 0 (identity inputs) — done for real.** Compared every field in `eas.json`'s `sample-merchant-development` profile against `docs/examples/sample-merchant.env` directly (not assumed matching). Found real drift: `APP_ICON_PATH`, `APP_NOTIFICATION_ICON_PATH`, and `ANDROID_ADAPTIVE_ICON_PATH` differ between the two files. `eas.json` was updated in PR #112 (commit `85b47ae`, "add placeholder branding assets for sample-merchant EAS profile") to point at the real `acme-outfitters-logo.png`/`acme-outfitters-adaptive-icon.png` assets; `docs/examples/sample-merchant.env` was never updated to match and still points at the generic `cartaisy-color-logo.png`/`adaptive-icon.png` placeholders. Every other field (name, slug, scheme, version, bundle ID/package, build/version numbers, Firebase file paths, Apple Pay merchant ID, EAS project ID/owner) matches exactly across both files. Not fixed inline, per this rehearsal's own rule against fixing findings inline — needs a small follow-up to sync `sample-merchant.env`'s three asset paths to `eas.json`'s.
- **Step 1 (backend store record) — still blocked, attempted for real, not simulated.** Tried to close this the way the 2026-08-06 Phase 3 live run did: stood up a local `cartaisy-backend` checkout pointed at a real local MongoDB via `mongodb-memory-server` (downloads and runs an actual `mongod` binary — a real database, not a mock). The `mongod` binary download from `fastdl.mongodb.org` returned `403 Forbidden` for every version tried (7.0.14, 6.0.9), and a direct `curl -I` to the same URL confirmed it — this environment's network egress does not allow that host (`registry.npmjs.org` and general HTTPS worked fine in the same session, so this is a specific block, not a general outage). No local `mongod` binary or Docker daemon was available as a fallback (`docker ps` failed — no daemon socket in this sandbox). Per the ticket's own instruction not to fake this, Step 1 stays logged as blocked, with the specific reason recorded here instead of repeating the old "sample values are fictional" note with no new information.
- **Step 2 (EAS project) — partially re-confirmed, partially blocked.** The real internal project `@rendernext/acme-outfitters` and its recorded `EAS_PROJECT_ID`/`EXPO_OWNER` were already established (GitHub issue #86) and are unchanged. Could not re-verify from this session: whether hardware-key 2FA and scoped-org-token enforcement (2026-07-23 decision) are actually being enforced today, and whether every Step 0 variable is genuinely present as an EAS environment variable on the project (vs. only in the local `eas.json` file) — both require an authenticated `eas whoami`/EAS dashboard session. `npx eas-cli whoami` was attempted and, as expected with no stored credentials, did not resolve to a logged-in account.
- **Step 3 (signing), Android half — confirmed resolved, checklist corrected.** The Android upload keystore exists and was already used successfully: the signed `sample-merchant-development` Android build verified on a physical device 2026-08-04 (see "Physical Device Install Verification" below) used EAS-managed Android credentials generated in that session. The runbook's own checklist previously still described this as blocked on "uninitialized Android remote credentials/keystore" — that line was stale and has been corrected in `docs/MOBILE_MERCHANT_PROVISIONING_RUNBOOK.md`.
- **Step 3, iOS half — explicitly blocked, not attempted.** Requires a real Apple Developer Program membership, which doesn't exist yet for any merchant (sample or real) — Phase 2's separate, already-tracked open item (iOS build proof). Per this rehearsal's exclusions, not attempted.
- **Step 4 (Firebase), Android half — not closed, blocked on console access.** This was flagged as a genuine opportunity to close a real gap (create an actual per-merchant Firebase project + Android app for Acme Outfitters, rather than reusing Cartaisy's committed files), but Firebase project/app creation happens through the Firebase console under a Google account — this session has no interactive browser/account access to do that. `sample-merchant-development` still resolves the committed Cartaisy `google-services.json`/`GoogleService-Info.plist` files as a config-evaluation placeholder only, unchanged from prior entries.
- **Step 4, iOS half — blocked, same reason as Step 3's iOS half** (no Apple bundle ID to register against with confidence, no APNs key without an Apple account).
- **Step 5 (push registration), Android half — blocked, depends on Step 4.** Not reachable without a real Firebase Android app in place first.
- **Step 6 (Apple Pay/Stripe) — skipped by design, not blocked.** Per the runbook's own text, explicitly skippable for a development build that doesn't exercise wallet payments. Logged as skipped, not attempted.
- **Step 7 (verify resolved config) — done for real.** Ran `npx expo config --type public` live with `docs/examples/sample-merchant.env` sourced (`set -a; source ...; set +a`). Confirmed every field the runbook's Step 7 lists resolves correctly: `name` (`Acme Outfitters`), `slug` (`acme-outfitters`), `scheme` (`acmeoutfitters`), `version` (`1.2.0`), `ios.bundleIdentifier` (`com.example.acmeoutfitters`), `ios.buildNumber` (`12`), `android.package` (`com.example.acmeoutfitters`), `android.versionCode` (`12`), both Firebase file paths (`./GoogleService-Info.plist`, `./google-services.json`), the Apple Pay merchant ID appearing identically in both `ios.entitlements['com.apple.developer.in-app-payments']` and the Stripe plugin's `merchantIdentifier` (`merchant.com.example.acmeoutfitters` — no mismatch), and `extra.eas.projectId`/top-level `owner` matching `EAS_PROJECT_ID`/`EXPO_OWNER`. Also visible in this output: the icon/adaptive-icon paths resolve to the generic Cartaisy placeholders (`cartaisy-color-logo.png`, `adaptive-icon.png`), which is the live confirmation of the Step 0 drift finding above, not a separate issue.
- **Step 8 (EAS build) — blocked, no artifact produced.** No authenticated EAS session was available (see Step 2), so `eas build` could not be run at all this session, and no physical device or emulator was available to install a resulting artifact on even if a build had succeeded. This is a different blocker than the one recorded in the runbook's stale checklist ("uninitialized Android remote credentials/keystore," resolved 2026-08-04) — the current blocker for a from-scratch attempt in an environment like this one is account/device access, not credentials.

### Friction log

Wall-clock timing for the parts of Steps 0–8 that could actually be executed in this environment: Step 0's field-by-field drift check and its root-cause trace (git blame to PR #112) took under 10 minutes once the two source files were open side by side — the runbook's own instruction to "note any drift" made this fast to check but it had never actually been checked before. Step 7's config verification is a single command and resolved on the first try with no undocumented workaround; the one thing the runbook doesn't say explicitly is that the sample env must be re-sourced in the same shell invocation as the `npx expo config` call (`set -a; source ...; set +a; npx expo config ...`), not sourced in a prior step — this is implied by the example but easy to get wrong on a first read. The Step 1 backend attempt (installing `mongodb-memory-server`, discovering the download block, confirming it wasn't version-specific, checking for a Docker/mongod fallback) took roughly 15–20 minutes and produced a real, reusable finding (the exact blocked host) rather than a completed step.

This rehearsal cannot supply timing for Steps 2–6 and 8's account/device-dependent work (EAS login and env verification, Firebase console project/app creation, APNs/FCM registration, an actual `eas build` run, and physical-device install/verification) — none of that ran in this environment, and inventing numbers for steps that weren't performed would misrepresent what "onboarding time" actually is. That timing can only come from a session that has EAS credentials, Firebase console access, and a physical device, run start-to-finish. What this rehearsal narrows down for that future run: Steps 0 and 7 are now confirmed fast and low-friction (minutes, not an open question), Step 1 is blocked on a specific, fixable-elsewhere network/access issue rather than an unknown, and Steps 3 (Android)/6 have no remaining work at all (resolved / skip-by-design) — so a real timed run should budget its effort almost entirely against Steps 2 (EAS account verification), 4–5 (Firebase Android setup), and 8 (the build + device install itself), which is a smaller and more specific scope than "the whole runbook."

## Physical Device Install Verification (2026-08-04)

First verification of the `sample-merchant-development` profile on a real physical Android device (prior attempts were emulator-only or blocked before producing an installable artifact). Installed via the EAS-hosted APK download link; connected to a local `npx expo start --dev-client` session (WiFi, manual URL entry — mDNS auto-discovery did not traverse the local network).

### Verified Working

Verified on-device: launcher icon (gold "AO"), launcher name ("Acme Outfitters"), native splash (icon + `#0A2540` background), and the `acmeoutfitters://` deep link scheme (confirmed via a QR code opened through the phone's Camera app).

### Build Result

Not device-verified: notification icon (simulation-verified only in PR #112; no live push trigger available).

Confirmed Cartaisy-branding leak on this build, not merely unverified: the in-app JS splash screen (`app/splash.tsx`) renders the bundled Cartaisy logo for ~3 seconds on every launch, because its runtime `logoUrl` (fetched from `/store/config`) can never resolve — `EXPO_PUBLIC_API_BASE_URL` is a non-resolving `api.staging.example.com` placeholder, not a real backend, so this reproduces on every clean install, not just this session. This is a real gap against "zero Cartaisy identity leakage" and is not covered by this ticket's build-time/native-config verification above. Reviewed live with Daniyal during the session; deliberately not fixed here — `app/splash.tsx` is a shared file that also serves Cartaisy's own production splash, and changing its fallback logic without a scoped ticket risked regressing that. Tracked as its own follow-up, not silently dropped.

Other backend-driven surfaces (`/store/config` store name, catalog load) fail closed to an empty/error state rather than leaking Cartaisy branding — expected given the same non-resolving API URL, not a Phase 2 blocker.

Found and fixed locally during the session (not a repo change): a stale `.env.local` left over from the Jul 31 attempt was silently overriding shell-exported env vars and still pointed icon paths at Cartaisy's own logo. Recreating `.env.local` to match the current `eas.json` profile resolved it.

## Sample-Merchant Android APK Install — Emulator (2026-07-31)

First real Android APK produced and installed for the `sample-merchant-development` profile, verified on an emulator (no physical device available at the time).

### Verified Working

Verified: app name, deep-link scheme, and splash background color all correctly showed Acme Outfitters branding.

### Build Result

Not yet correct: app icon and splash image still showed Cartaisy's own logo — no non-Cartaisy placeholder art existed yet at this point. This gap was closed by PR #112 (2026-08-03, new `acme-outfitters-*` placeholder assets) and PR #113 (2026-08-03, fixed the underlying center-crop bug in the icon generator).

## Internal Sample Android EAS Build Attempt (2026-07-13, GitHub issue #86)

The Acme sample profile now targets a real internal sample EAS project, `@rendernext/acme-outfitters`, created under the accessible `rendernext` account. No runtime branding, checkout/payment code, backend code, production signing secrets, real merchant credentials, private Firebase files, service-account files, or Shopify/Stripe secrets were changed or committed.

### Commands Run

- `eas project:init --force --non-interactive` from a disposable temporary Expo config for `@rendernext/acme-outfitters`
- `env EXPO_NO_DOTENV=1 EXPO_OWNER=rendernext APP_SLUG=acme-outfitters EAS_PROJECT_ID=a9a1dd2e-adfe-4020-9f10-6b561859f119 npx eas-cli project:info --json`
- `zsh -lc 'set -a; source docs/examples/sample-merchant.env; set +a; EXPO_NO_DOTENV=1 npx expo config --type public --json'`
- `npx eas-cli build:inspect --platform android --profile sample-merchant-development --stage archive --output /private/tmp/cartaisy-eas-inspect-86 --force`
- `npm ci` in the clean temporary worktree, because EAS local validation needs installed dependencies to detect `expo-dev-client`
- `npx eas-cli build --profile sample-merchant-development --platform android --non-interactive`

Note: bare `npx eas --version` failed locally with `npm ERR! could not determine executable to run`, so the EAS commands used `npx eas-cli`, which resolved to EAS CLI 18.0.4 and satisfies the repo's `>= 16.0.0` CLI constraint.

### Verified Working

Verified: the real internal sample project exists and is accessible: `@rendernext/acme-outfitters`, project ID `a9a1dd2e-adfe-4020-9f10-6b561859f119`.

Verified: `npx expo config --type public --json` with `docs/examples/sample-merchant.env` exported resolves the Acme identity: app name `Acme Outfitters`, slug `acme-outfitters`, scheme `acmeoutfitters`, version `1.2.0`, iOS bundle ID `com.example.acmeoutfitters`, iOS build number `12`, Android package `com.example.acmeoutfitters`, Android version code `12`, Firebase file paths `./GoogleService-Info.plist` and `./google-services.json`, Apple Pay merchant ID `merchant.com.example.acmeoutfitters`, EAS project ID `a9a1dd2e-adfe-4020-9f10-6b561859f119`, and Expo owner `rendernext`.

Verified: `eas build:inspect` completed from a clean temporary git worktree and wrote the inspected archive copy to `/private/tmp/cartaisy-eas-inspect-86`. The inspected copy excluded `ios/`, `android/`, `node_modules/`, `.env`, and the unrelated untracked local report artifacts from the main checkout, so the EAS archive path still uses Continuous Native Generation from `app.config.ts`.

### Build Result

Attempted: Android EAS development build with `sample-merchant-development` and `--non-interactive` from the clean temporary worktree.

Blocked: the build stopped during Android remote credential setup before producing an artifact. EAS reported `Generating a new Keystore is not supported in --non-interactive mode`. No build artifact URL was produced, and no APK was available to install.

Install validation: not run because there was no build artifact. Launcher name, Android package, scheme, API base URL, store ID, and Firebase association remain unverified on an installed binary.

Firebase association: not reached. The sample profile still points at committed Cartaisy Firebase files for local config evaluation. A real installable sample/internal merchant build still needs Firebase config files matching `com.example.acmeoutfitters` supplied through secure EAS file environment variables, not committed to the repo.

Remaining blockers before a successful installable internal sample build:

- Initialize Android remote credentials/keystore for `@rendernext/acme-outfitters` through an approved interactive EAS credentials flow or another secure non-repo credential process.
- Supply matching sample/internal Firebase config files through EAS file-type environment variables; do not commit private Firebase files.
- Re-run the Android EAS development build from a clean working tree.
- Install the produced APK on an emulator/device and verify launcher name, Android package, scheme, API base URL, store ID, and Firebase association where practical.

## Sample Merchant EAS Attempt (2026-07-08)

The fictional Acme sample from `docs/examples/sample-merchant.env` was used for the first merchant development-build attempt for GitHub issue #73. No runtime app code, checkout/payment code, backend code, real credentials, Firebase files, signing files, or production secrets were changed or committed.

### Verified Working

Verified: `npx expo config --type public --json` with `docs/examples/sample-merchant.env` exported resolves the Acme identity: app name `Acme Outfitters`, slug `acme-outfitters`, scheme `acmeoutfitters`, version `1.2.0`, iOS bundle ID `com.example.acmeoutfitters`, iOS build number `12`, Android package `com.example.acmeoutfitters`, Android version code `12`, Firebase file paths `./GoogleService-Info.plist` and `./google-services.json`, Apple Pay merchant ID `merchant.com.example.acmeoutfitters` in both entitlements and the Stripe plugin block, EAS project ID `00000000-0000-0000-0000-000000000000`, and Expo owner `example-merchant-owner`.

Verified: `eas.json` now has a `sample-merchant-development` profile extending `development` with the same fictional, non-secret Acme values in `env`, which is the EAS-supported path for passing these values to the build worker. The profile is suitable for config verification only until a real sample/internal merchant EAS project and matching Firebase files exist.

Verified: `eas build:inspect --platform android --profile sample-merchant-development --stage archive --output /private/tmp/cartaisy-eas-inspect --force` completed locally, and the inspect copy excluded `ios/`, `android/`, `node_modules/`, and `.env` while keeping `eas.json`. This confirms the sample profile uses the intended EAS archive path where the worker would regenerate native projects from `app.config.ts`.

### Build Result

Attempted: an Android EAS development build command was attempted with the sample merchant environment and `--non-interactive`, but this workspace blocked the command before uploading repository contents to Expo's external EAS service. No EAS artifact was produced, so installed app identity could not be verified.

Blocked: `eas project:info --json` with the sample environment failed with `Experience with id '00000000-0000-0000-0000-000000000000' does not exist.`, confirming the sample EAS metadata is still placeholder-only.

Remaining blockers before a real merchant development build can complete:

- Create or select an accessible sample/internal merchant EAS project and replace the placeholder `EAS_PROJECT_ID` / `EXPO_OWNER` outside committed sample placeholders.
- Provide merchant-matching Firebase config files through EAS file-type environment variables; the committed Cartaisy files are only sample config-evaluation placeholders and would not match `com.example.acmeoutfitters`.
- Complete EAS remote credential/signing setup for the target platform.
- Run the remote EAS build from an approved environment that may upload the build archive to Expo, then install the artifact and verify launcher name, scheme, bundle ID/package, Firebase associations, backend URL, and store ID.

## Internal Sample Merchant EAS Attempt (2026-07-09, GitHub issue #81)

The fictional Acme sample from `docs/examples/sample-merchant.env` and the committed `sample-merchant-development` profile were used for another development-build attempt. No runtime branding, checkout/payment code, backend code, production signing secrets, real merchant credentials, private Firebase files, or service-account files were changed or committed.

### Commands Run

- `set -a; source docs/examples/sample-merchant.env; set +a; npx expo config --type public --json`
- `npx eas build:inspect --platform android --profile sample-merchant-development --stage archive --output /private/tmp/cartaisy-eas-inspect-81 --force`
- `npx eas whoami`
- `set -a; source docs/examples/sample-merchant.env; set +a; npx eas project:info --json`
- `npx eas build --profile sample-merchant-development --platform android --non-interactive`

### Verified Working

Verified: `npx expo config --type public --json` resolves the Acme identity from `docs/examples/sample-merchant.env`: app name `Acme Outfitters`, slug `acme-outfitters`, scheme `acmeoutfitters`, version `1.2.0`, iOS bundle ID `com.example.acmeoutfitters`, iOS build number `12`, Android package `com.example.acmeoutfitters`, Android version code `12`, Firebase file paths `./GoogleService-Info.plist` and `./google-services.json`, Apple Pay merchant ID `merchant.com.example.acmeoutfitters`, EAS project ID `00000000-0000-0000-0000-000000000000`, and Expo owner `example-merchant-owner`.

Verified: `eas build:inspect` completed with the sample profile and wrote the inspected archive copy to `/private/tmp/cartaisy-eas-inspect-81`. The inspected copy excluded `ios/`, `android/`, `node_modules/`, and `.env`, so the EAS archive path still uses Continuous Native Generation from `app.config.ts`.

Observed hygiene note: the inspected archive copy included existing unrelated untracked local report artifacts because they were present in the working tree and not ignored. They were not committed in this issue. Before a real build upload, run from a clean working tree or remove unrelated local artifacts so the EAS archive contains only intended project files.

### Build Result

Attempted: Android EAS development build with `sample-merchant-development` and `--non-interactive`.

Blocked: the build failed before archive upload because Expo rejected the placeholder sample project ID: `Experience with id '00000000-0000-0000-0000-000000000000' does not exist.` No EAS artifact was produced, so no device or simulator install validation could be performed.

Blocked: `eas project:info --json` with the sample environment failed for the same nonexistent project ID. EAS CLI authentication was available locally, but no real/internal sample merchant EAS project ID and owner were configured for this repo/profile.

Install validation: not run because there was no build artifact. Launcher name, bundle ID/package, scheme, Firebase association, API URL, and store ID remain unverified on an installed binary.

Remaining blockers before a successful real/internal development build:

- Create or select an accessible sample/internal merchant EAS project and configure its real non-secret `EAS_PROJECT_ID` and `EXPO_OWNER` for the build environment without committing production credentials.
- Supply Firebase config files that match the sample/internal bundle ID and Android package through EAS file-type environment variables; do not commit private Firebase files.
- Complete EAS remote credentials/signing setup for the target platform.
- Re-run the EAS development build from a clean working tree, then install the artifact and verify app name, bundle ID/package, scheme, Firebase app association, API URL, and store ID.

## Sample Merchant Verification (2026-07-02)

A fictional sample merchant ("Acme Outfitters", `docs/examples/sample-merchant.env`) was verified against dynamic `app.config.ts` for GitHub issue #52. Method: `npx expo config --type public`, `npx expo config --type introspect`, and `npx expo prebuild --no-install` for both platforms in a disposable copy of the repo (the checked-in `ios/` and `android/` projects were not touched). No EAS or signed build was run.

### Verified Working

Verified: All scoped values resolve from environment variables through `app.config.ts` into Expo config output: app name, slug, scheme, version, iOS bundle identifier and build number, Android package and version code, Firebase file paths, icon/splash/adaptive-icon/notification references, Apple Pay merchant ID (entitlements and Stripe plugin), EAS project ID, and Expo owner. `EXPO_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_STORE_ID` are consumed by app JavaScript (validated by `api/config/mobileConfig.ts`, which requires a 24-character Mongo ObjectId store ID), not by Expo config.

Verified: `npx expo prebuild` generates merchant-correct native projects from the sample env: Android `applicationId`/`namespace`, `app_name`, and manifest deep-link scheme; iOS `PRODUCT_BUNDLE_IDENTIFIER` and entitlements including `com.apple.developer.in-app-payments` with the merchant ID.

### Release Blockers Found

Blocker (resolved 2026-07-03, GitHub issue #60): The checked-in `ios/` and `android/` projects bypassed dynamic config. Because native directories existed in the repo (and there was no `.easignore`), EAS builds and `expo run:*` used the checked-in Cartaisy-identity projects and ignored `app.config.ts` identity values. Resolution: `.easignore` now excludes `ios/` and `android/` from EAS build archives, so every EAS build regenerates native projects from `app.config.ts`; see "Branded Build Flow" above. Local `expo run:*` still uses the checked-in Cartaisy projects by design and must not be used for merchant builds.

Blocker: Firebase files must match the merchant identity, and the mismatch fails concretely. Prebuild copies the env-referenced Firebase files as-is; with the Cartaisy defaults, the generated Android project contained a `google-services.json` whose `package_name` (`com.rendernext.cartaisy`) does not match the merchant `applicationId`, which fails the Google Services Gradle step at build time. The iOS plist has the same mismatch, which breaks Firebase/push registration at runtime. Each merchant needs Firebase apps registered for their bundle ID/package and their own config files supplied via `IOS_GOOGLE_SERVICES_FILE`/`ANDROID_GOOGLE_SERVICES_FILE`.

Blocker: Per-merchant EAS ownership is undecided. The defaults point at the Cartaisy `rendernext` EAS project; a branded build with a different slug/owner needs its own EAS project ID, and the sample's placeholder project ID would fail an actual EAS build. Signing certificates, provisioning profiles, and store accounts per merchant are similarly undecided and out of scope for this verification.

### Risks To Verify At Release Time

Risk: The checked-in iOS entitlements (`ios/cartaisy/cartaisy.entitlements`) contain only `aps-environment: development` and no Apple Pay entitlement, while `app.config.ts` declares one. Any build path that uses the checked-in iOS project ships without the Apple Pay entitlement. Prebuild-generated entitlements also carry `aps-environment: development`; confirm EAS/signing replaces this correctly for production distribution.

Risk: Push (APNs/FCM), Apple Pay merchant registration with Apple, and Stripe account configuration are external registrations that config plumbing cannot verify. They must be confirmed per merchant during release validation.

Risk (updated 2026-08-04): a signed Android development-distribution build (`sample-merchant-development`) was produced and installed on a physical device — see "Physical Device Install Verification" above — proving on-device identity (launcher icon, name, native splash, deep-link scheme) for that build. Still unproven: production/store-distribution signing and keystore setup (the 2026-07-13 non-interactive keystore blocker was specific to that flow, not exercised by this internal-distribution build), Play/App Store submission behavior, and Firebase association with a merchant-specific (non-Cartaisy) Firebase project — this build still uses the committed Cartaisy `google-services.json`/`GoogleService-Info.plist` files as a config-evaluation placeholder, per "Firebase and Push" above.

## Merchant Build Record

- [ ] Merchant name:
- [ ] Store ID:
- [ ] Backend API base URL:
- [ ] iOS bundle identifier:
- [ ] Android package name:
- [ ] App display name:
- [ ] App scheme:
- [ ] Target platforms: iOS / Android
- [ ] Build owner:
- [ ] Release target:

## Build-Time Configuration

These values are packaged into the binary or native project. Changing them requires a new native build and, for store-distributed apps, a store submission or update.

### App Identity

- [ ] Confirm the merchant-facing app display name.
- [ ] Confirm the Expo app name and slug for the branded build.
- [ ] Confirm the iOS bundle identifier.
- [ ] Confirm the Android package/application ID.
- [ ] Confirm the app URL scheme and any native deep link schemes.
- [ ] Confirm app store listing names match the branded app identity.

### Tenant Selection and API Target

- [ ] Set the merchant `storeId` used by the branded binary.
- [ ] Set the public API base URL for the backend environment this build should use.
- [ ] Confirm mobile requests continue to identify the tenant through the expected store-scoped request path or headers.
- [ ] Confirm backend tenant isolation remains authoritative; the mobile `storeId` is public client configuration, not a security boundary.

### Native Assets

- [ ] Provide the iOS AppIcon asset set at all required sizes.
- [ ] Provide the Android launcher and adaptive icon assets.
- [ ] Provide the native splash screen logo and background color.
- [ ] Provide any in-app bundled logo assets needed before runtime config loads.
- [ ] Provide notification icon assets and notification color, if push notifications are enabled.
- [ ] Verify assets are merchant-approved and do not include another merchant's branding.

### Firebase and Push

- [ ] Create or confirm the iOS Firebase app for the merchant bundle identifier.
- [ ] Add the merchant `GoogleService-Info.plist`.
- [ ] Create or confirm the Android Firebase app for the merchant package name.
- [ ] Add the merchant `google-services.json`.
- [ ] Confirm Firebase sender ID, app IDs, and package/bundle associations match the branded app.
- [ ] Confirm APNs keys/certificates and Android notification setup are configured for the merchant app, if push is in scope.

### Native Capabilities

- [ ] Confirm signing certificates, provisioning profiles, and team ownership for iOS.
- [ ] Confirm Android keystore and signing configuration.
- [ ] Confirm native permissions, associated domains, and background modes needed by the merchant app.
- [ ] Confirm wallet/payment native capabilities only if they are explicitly in scope for the release.

### Build Environment Values

- [ ] `APP_NAME`
- [ ] `APP_SLUG`
- [ ] `APP_SCHEME`
- [ ] `APP_VERSION`
- [ ] `IOS_BUNDLE_IDENTIFIER`
- [ ] `IOS_BUILD_NUMBER`
- [ ] `IOS_GOOGLE_SERVICES_FILE`
- [ ] `IOS_APPLE_PAY_MERCHANT_ID`
- [ ] `ANDROID_PACKAGE`
- [ ] `ANDROID_VERSION_CODE`
- [ ] `ANDROID_GOOGLE_SERVICES_FILE`
- [ ] `APP_ICON_PATH`
- [ ] `APP_NOTIFICATION_ICON_PATH`
- [ ] `APP_NOTIFICATION_COLOR`
- [ ] `ANDROID_ADAPTIVE_ICON_PATH`
- [ ] `ANDROID_ADAPTIVE_ICON_BACKGROUND`
- [ ] `SPLASH_BACKGROUND_COLOR`
- [ ] `EAS_PROJECT_ID`
- [ ] `EXPO_OWNER`
- [ ] `EXPO_PUBLIC_API_BASE_URL`
- [ ] `EXPO_PUBLIC_STORE_ID`
- [ ] `EXPO_PUBLIC_APP_NAME`
- [ ] `EXPO_PUBLIC_APP_SCHEME`
- [ ] `EXPO_PUBLIC_IOS_BUNDLE_ID`
- [ ] `EXPO_PUBLIC_ANDROID_PACKAGE`

Treat all values used by mobile build tooling as non-secret, and treat all `EXPO_PUBLIC_*` values as public. Do not put Shopify Admin tokens, Stripe secret keys, Firebase private credentials, or any merchant secret in mobile build configuration.

## Runtime Configuration

These values should be loaded from the backend at runtime through the existing store configuration path or another tenant-scoped backend endpoint. They should not require a native rebuild when changed.

### Store Settings Loaded From Backend

- [ ] Store display name used inside the app, where supported.
- [ ] Currency.
- [ ] Timezone.
- [ ] Public support or contact URLs, if exposed by backend config.
- [ ] Public policy URLs, if exposed by backend config.
- [ ] Non-sensitive feature flags for UI behavior, if exposed by backend config.
- [ ] Public in-app branding metadata, such as logo URL or theme colors, only if the app has explicit runtime support for them.

### Shopify Data Boundary

- [ ] Confirm mobile app requests use the backend for tenant-owned Shopify data.
- [ ] Confirm the backend uses the existing tenant-scoped Shopify Storefront client/helper for the merchant store.
- [ ] Confirm Shopify Admin credentials remain server-side only.
- [ ] Confirm no Shopify access tokens or merchant secrets are shipped in the mobile app.

### Runtime Safety Checks

- [ ] Confirm runtime config has stable fallbacks for first launch, offline launch, failed config fetches, and app review flows.
- [ ] Confirm the app validates public runtime values before using them for rendering or navigation.
- [ ] Confirm backend responses preserve the existing API response shape expected by the app.

## Release Verification

- [ ] Confirm `.easignore` still excludes `/ios` and `/android` so the EAS build regenerates native projects from `app.config.ts`; builds from the checked-in Cartaisy projects (including local `expo run:*`) ignore merchant identity values.
- [ ] Confirm the merchant identity env values are set on the EAS build (EAS environment variables or `eas.json` profile `env`), not only in a local shell.
- [ ] Run `npx expo config --type public` with the merchant environment set and verify name, slug, scheme, bundle ID, package, Firebase file paths, and payment merchant ID.
- [ ] Build iOS with the merchant bundle identifier and Firebase file.
- [ ] Build Android with the merchant package name and Firebase file.
- [ ] Install each build on a clean device or simulator.
- [ ] Verify launcher name, launcher icon, and splash screen.
- [ ] Verify the app connects to the intended backend API URL.
- [ ] Verify the app loads data for the intended store ID only.
- [ ] Verify currency, timezone, and store name display from runtime config where those fields are used.
- [ ] Verify push notification registration if push is in scope.
- [ ] Verify no merchant secrets are present in mobile config files or diffs.

## Handoff Checklist

- [ ] Merchant identity values are recorded.
- [ ] Required assets are approved and committed or supplied through the build pipeline.
- [ ] Firebase files match the merchant bundle ID/package name.
- [ ] `app.config.ts` resolves to the intended merchant app name, scheme, bundle ID, Android package, Firebase file paths, and payment merchant ID.
- [ ] Build-time public environment values are set for the target environment.
- [ ] Runtime backend configuration is present for the merchant store.
- [ ] Backend tenant-scoped Shopify Storefront access is confirmed.
- [ ] Validation results are attached to the release ticket or pull request.
