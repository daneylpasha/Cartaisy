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
- Apple Developer Program membership for the iOS app — the merchant's own, per the ownership decision in Step 3.
- An App Store Connect invitation from the merchant, accepted before you start. Ask for the `Developer` role: it is the least-privileged role that can both upload builds and manage TestFlight groups, and it carries no control over pricing or store listing metadata. Without this, Step 3 signing and any TestFlight distribution are blocked. See `docs/IOS_PROVISIONING_SCOPE.md` for the role breakdown.
- A Google Play developer account is NOT needed for development/internal builds; it becomes relevant at store submission (out of scope here).
- Stripe dashboard access for the merchant's Stripe account, if wallet payments are in scope.
- Cartaisy backend admin access to confirm the merchant's store record and API environment.

## Step 0 — Collect Merchant Identity Inputs

Everything downstream depends on these values. Record them in the "Merchant Build Record" section of `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md` before touching any console.

| Input | Environment variable (consumed by `app.config.ts`) | Rules |
| --- | --- | --- |
| App display name | `APP_NAME` | Merchant-approved; also the store listing name later. Prefer the `APP_NAME` line from **Copy all EAS env** (see Handoff below). The `APP_NAME=…` control is the single-field fallback and pastes `APP_NAME=<exact name>` with no quotes. A blank control is not filled with `cartaisy`. |
| Expo slug | `APP_SLUG` | Lowercase, hyphenated, unique within the Expo owner account. |
| Deep-link URL scheme | `APP_SCHEME` | Lowercase alphanumeric, unique enough to avoid collisions with other installed apps. |
| Marketing version | `APP_VERSION` | Semver-style string. |
| iOS bundle identifier | `IOS_BUNDLE_IDENTIFIER` | Reverse-DNS (e.g. `com.merchantdomain.appname`). Permanent once the app ships; choose carefully. |
| iOS build number | `IOS_BUILD_NUMBER` | Positive integer string. |
| Android package | `ANDROID_PACKAGE` | Reverse-DNS. Permanent once the app ships. Usually equal to the iOS bundle ID. |
| Android version code | `ANDROID_VERSION_CODE` | Positive integer. |
| Apple Pay merchant ID | `IOS_APPLE_PAY_MERCHANT_ID` | `merchant.`-prefixed reverse-DNS; only if wallet payments are in scope (Step 5). |
| App icon | `ICON_IMAGE_PATH` or `ICON_IMAGE_URL` | PNG/JPEG. Path may be a repo file or an EAS file env. URL must be public `https` with no credentials (scripted download in `app.config.ts`, no auth header, not `EXPO_PUBLIC_*`). A missing asset resolves to `assets/images/neutral-icon.png`. |
| Web favicon | `APP_ICON_PATH` | Separate from the native launcher icon. |
| Notification icon / color | `APP_NOTIFICATION_ICON_PATH`, `APP_NOTIFICATION_COLOR` | Only if push is in scope. |
| Adaptive icon | `ANDROID_ADAPTIVE_ICON_PATH`, `ANDROID_ADAPTIVE_ICON_BACKGROUND` | Merchant-approved foreground, or omit the path to reuse the resolved launcher icon. Naming `assets/images/adaptive-icon.png` on a merchant build does not keep the Cartaisy wordmark. |
| Native splash image | `SPLASH_IMAGE_PATH` or `SPLASH_IMAGE_URL` | PNG/JPEG. Path may be a repo file or an EAS file env. URL must be public `https` with no credentials (scripted download in `app.config.ts`). A missing asset resolves to `assets/images/neutral-splash.png`. |
| Native splash background | `SPLASH_BACKGROUND_COLOR` | Merchant-approved. Shown behind the splash image, including the neutral fallback. |
| EAS project | `EAS_PROJECT_ID`, `EXPO_OWNER` | Produced by Step 2, not chosen by the merchant. |
| Backend API URL | `EXPO_PUBLIC_API_BASE_URL` | Public; must point at the intended Cartaisy backend environment. |
| Store ID | `EXPO_PUBLIC_STORE_ID` | Public; the merchant's 24-character hex Mongo ObjectId (validated by `api/config/mobileConfig.ts`). Not a security boundary — backend tenant isolation is authoritative. Prefer the `EXPO_PUBLIC_STORE_ID` line from **Copy all EAS env** (see Handoff below). The `EXPO_PUBLIC_STORE_ID=…` control is the single-field fallback and pastes `EXPO_PUBLIC_STORE_ID=<exact store.id>` with no quotes. A missing or invalid id stays empty. |
| Public app name/scheme mirrors | `EXPO_PUBLIC_APP_NAME`, `EXPO_PUBLIC_APP_SCHEME` | Same values as `APP_NAME`/`APP_SCHEME`, readable from app JavaScript. |
| Stripe publishable key | `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public by design; per-merchant; only if Stripe is in scope. |
| Stripe merchant ID mirror | `EXPO_PUBLIC_STRIPE_MERCHANT_ID` | Same value as `IOS_APPLE_PAY_MERCHANT_ID`. |

All of these are non-secret build-time values. Anything not in this table — tokens, keys, credentials — does not belong in mobile configuration at all (see "What Must Never Be Committed").

### How splash and icon files reach the build

The native launcher icon uses the same two inputs as the pre-JS splash. Set `ICON_IMAGE_PATH` to a PNG or JPEG in the repo, or upload that file as an EAS file-type environment variable with the same name (the worker exposes it as an absolute path). To take the image from merchant branding without committing it, set `ICON_IMAGE_URL` to the public `https` URL the Cartaisy backend already publishes for that icon. `app.config.ts` downloads it during config evaluation (local `npx expo config` and the EAS worker's prebuild). The request sends no auth header. Do not copy the URL into an `EXPO_PUBLIC_*` variable. Rejected URLs — anything other than public `https`, plus URLs with userinfo or token-like query parameters — and failed downloads resolve to `assets/images/neutral-icon.png` so the Cartaisy wordmark is not compiled into the launcher. `ICON_IMAGE_PATH` wins when it is set; a path that does not point at a PNG or JPEG also resolves to the neutral image and does not continue on to the URL.

`ANDROID_ADAPTIVE_ICON_PATH` is still a local file (repo path or EAS file env) when the merchant has a separate adaptive foreground. If it is unset, or it names `assets/images/adaptive-icon.png`, a merchant build uses the resolved launcher icon instead. Notification icons (`APP_NOTIFICATION_ICON_PATH`) stay local files. `APP_ICON_PATH` is the web favicon only. `APP_ICON_SQUARE_PATH` is not read.

The pre-JS native splash uses the same file-env pattern when you set `SPLASH_IMAGE_PATH`. To take the image from merchant branding without committing it, set `SPLASH_IMAGE_URL` to the public `https` URL the Cartaisy backend already publishes for that splash. `app.config.ts` downloads it during config evaluation (local `npx expo config` and the EAS worker's prebuild). The request sends no auth header. Rejected URLs — anything other than public `https`, plus URLs with userinfo or token-like query parameters — and failed downloads resolve to `assets/images/neutral-splash.png` so the Cartaisy wordmark is not compiled into the pre-JS frame. `SPLASH_IMAGE_PATH` wins when it is set; a path that does not point at a PNG or JPEG also resolves to the neutral image and does not continue on to the URL.

Do not place Shopify Admin, Storefront, or custom-app tokens in `ICON_IMAGE_URL`, `SPLASH_IMAGE_URL`, in any other mobile env var, or on the device. The runtime JS icon and splash (`BrandMark`, `app/splash.tsx`) still load store branding after JavaScript starts; this step does not change that path.

The fictional Acme sample sets `ICON_IMAGE_PATH` to `./assets/images/acme-outfitters-logo.png` and `SPLASH_IMAGE_URL` to `https://cdn.example.com/stores/acme-outfitters/splash.png`. That splash URL does not resolve, so sample config evaluation uses the neutral splash. Replace either value for a real merchant. No additional EAS release pipeline is required for this wiring.

### Handoff from Cartaisy ops queue

Use this when a merchant has a display name, a store id, and uploaded branding and you are about to set env on that merchant's EAS project. The queue is the copy source for `APP_NAME`, `EXPO_PUBLIC_STORE_ID`, the icon URL, and the splash URL. Prefer **Copy all EAS env** and paste that one block. The four single-field controls are the fallback when you need a single assignment. The queue does not start an EAS build. Self-serve EAS is not built; Step 8 is still a manual `eas build` after the dry run below.

**Where the copy controls are.** Open `/dashboard/admin/build-requests` as a platform operator. That page is recorded in the `cartaisy-dashboard` repo's `docs/STATUS.md` and in `docs/DECISIONS.md` under "The ops build queue shows public icon and splash URLs" (dashboard issue #43, PR #44), "Ops copies the icon as ICON_IMAGE_URL" (dashboard issue #45, PR #47), "Ops copies the merchant display name as APP_NAME" (dashboard issue #49, PR #50), "Ops copies the merchant store id as EXPO_PUBLIC_STORE_ID" (dashboard issue #51, PR #52), and "Ops copies every launcher assignment as one EAS env block" (dashboard issue #55, PR #57). A store owner, including `super_admin`, gets a 403 empty state and is not a source for these values.

Each row shows the merchant name, icon, and splash when `GET /api/v1/admin/build-requests` includes them. `store.appName`, `store.iconUrl`, and `store.splashUrl` are optional. That contract is cartaisy-backend issue #177, in the `cartaisy-backend` repo's `docs/cartaisy/BUILD_REQUEST_API.md`. The list returns a URL only when it is absolute `https` and not token-shaped. Missing or unsafe branding is null. The API does not invent a Cartaisy CDN URL, does not invent an app name, and does not select Shopify tokens. The same stored image fields are on admin branding GET (`iconUrl` / `appIconUrl`, `splashUrl` / `splashImageUrl`) if you need to confirm a row. The same list already includes `store.id`, the merchant store ObjectId. Prefer the queue so you do not open Settings or Mongo to find the name, the store id, or the URL.

**Copy shape.**

**Copy all EAS env** is the primary paste. When at least one launcher assignment is copyable, the control labeled `Copy all EAS env` copies every available assignment as one multiline block. One assignment per line, `KEY=value`, no quotes, LF newlines. Omit any line whose single-field control would already be absent. Do not leave a blank line for a missing field. The order is fixed:

```
APP_NAME=<trimmed store.appName>
ICON_IMAGE_URL=<public https icon>
SPLASH_IMAGE_URL=<public https splash>
EXPO_PUBLIC_STORE_ID=<24-char hex store.id>
```

A row with all four present copies those four lines. A row with a subset copies only the lines that qualify, in that same order. If zero lines qualify, there is no Copy all control. The queue shows the calm empty states for the missing fields and does not invent a name, a URL, or a store id. It does not fall back to Cartaisy, the shop domain, or the build-request id.

The four single-field controls stay as the fallback. Use one when you need a single assignment, or when Copy all is absent because nothing on the row qualifies. Each control copies one env assignment. Paste that assignment onto the merchant EAS project. Do not strip the variable name, and do not add quotes.

- App name: when `store.appName` is a non-empty trimmed string, the control labeled `APP_NAME=…` copies `APP_NAME=<that exact name>` with no quotes. The value is the trimmed name only. That same line is the `APP_NAME` line inside Copy all.
- Icon: the icon button copies `ICON_IMAGE_URL=<url>`.
- Splash: the splash button copies `SPLASH_IMAGE_URL=<url>`.
- Store id: when `store.id` is a valid 24-character hex Mongo ObjectId, the control labeled `EXPO_PUBLIC_STORE_ID=…` copies `EXPO_PUBLIC_STORE_ID=<that exact id>` with no quotes. The value is that id only.

**Paste.**

1. On the merchant's row, use **Copy all EAS env** when that control is present. Paste the whole block onto the merchant EAS project as plain-visibility env. Keep each `KEY=value` line, the fixed order, and the LF newlines. Do not add quotes. Do not retype the values from memory.
2. To paste one field, use the matching single-field control. Copy the app name when the `APP_NAME=…` control is present and paste `APP_NAME=<exact name>` as `APP_NAME`. Copy the icon when the icon button is present and paste `ICON_IMAGE_URL=<url>` as `ICON_IMAGE_URL`. The value is the public `https` URL only. Copy splash when the splash button is present and paste `SPLASH_IMAGE_URL=<url>` as `SPLASH_IMAGE_URL` the same way. Copy the store id when the `EXPO_PUBLIC_STORE_ID=…` control is present and paste `EXPO_PUBLIC_STORE_ID=<exact 24-character hex>` as `EXPO_PUBLIC_STORE_ID`. Do not wrap the name or the id in quotes. Do not retype either from memory.
3. If the `APP_NAME=…` control is absent, Copy all omits the `APP_NAME` line. The name is missing, blank, or whitespace-only. The queue shows a calm empty state and no copy button for that field. It does not invent a name and does not fall back to Cartaisy, the shop domain, or a store id. Do not set `APP_NAME` to `cartaisy` or `Cartaisy` to fill that gap. Record on the Merchant Build Record that the display name is still required, and set `APP_NAME` only from a merchant-approved name before the build. Leaving `APP_NAME` unset, with `EXPO_PUBLIC_APP_NAME` also unset, makes `app.config.ts` resolve `name` to `cartaisy`.
4. If an icon or splash button is absent, Copy all omits that line. That asset has no public `https` URL. Supply `ICON_IMAGE_PATH` or `SPLASH_IMAGE_PATH` (repo file or EAS file env), or write on the Merchant Build Record that the neutral image is intentional (`assets/images/neutral-icon.png` or `assets/images/neutral-splash.png`). Do not substitute the Cartaisy wordmark.
5. If the `EXPO_PUBLIC_STORE_ID=…` control is absent, Copy all omits that line. `store.id` is missing or is not a 24-character hex Mongo ObjectId. The queue shows a calm empty state and no copy button for that field. It does not invent an id and does not fall back to the build-request id, the shop domain, or the app name. Do not set `EXPO_PUBLIC_STORE_ID` from any of those. Record on the Merchant Build Record that the store id is still required, and set it only from the merchant's real store ObjectId before the build.
6. Leave `ICON_IMAGE_PATH` unset when `ICON_IMAGE_URL` should win, and leave `SPLASH_IMAGE_PATH` unset when `SPLASH_IMAGE_URL` should win. A set path that is missing or is not a PNG or JPEG resolves to the neutral image and does not continue on to the URL.
7. The queue does not copy `EXPO_PUBLIC_APP_NAME`, and Copy all does not include it. If you also set that public mirror, use the same merchant name as `APP_NAME`. `EXPO_PUBLIC_STORE_ID` is the store-id assignment the queue does copy, either as its own line in Copy all or from the single-field control. Do not copy either URL into an `EXPO_PUBLIC_*` variable. Do not put Shopify Admin, Storefront, or custom-app tokens in these variables or anywhere else in mobile env. Do not commit the real URL or a real store id.

**Dry run before `eas build`.** Export the merchant env in a file kept outside the repo (use `docs/examples/sample-merchant.env` only as the shape) and run Step 7 (`npx expo config --type public`). When `APP_NAME` is set, `name` equals that merchant display name. It must not be `cartaisy`. For a non-default identity, `icon` and the `expo-splash-screen` plugin `image` must be the downloaded merchant file or `./assets/images/neutral-icon.png` / `./assets/images/neutral-splash.png`. They must not be `./assets/images/icon.png`, `./assets/images/adaptive-icon.png`, or `./assets/images/cartaisy-color-logo.png`. The same checks are checkboxes in `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`. `EXPO_PUBLIC_STORE_ID` is not in that Expo config output. With it set, `api/config/mobileConfig.ts` reads that same value and requires a 24-character hex Mongo ObjectId (`docs/MOBILE_ENV_VARIABLES.md`). Do not treat `npx expo config` as a store-id check.

Fictional clipboard shape only (no quotes around the name or the store id). This is the block **Copy all EAS env** writes when all four lines qualify. A missing line is omitted; the lines that remain stay in this order:

```
APP_NAME=Acme Outfitters
ICON_IMAGE_URL=https://cdn.example.com/stores/acme-outfitters/icon.png
SPLASH_IMAGE_URL=https://cdn.example.com/stores/acme-outfitters/splash.png
EXPO_PUBLIC_STORE_ID=507f1f77bcf86cd799439011
```

The Acme sample splash host does not serve an image, so sample config evaluation uses the neutral splash. That is expected for the sample. A merchant who uploaded branding should show the downloaded file instead. With `APP_NAME=Acme Outfitters`, the same dry run shows `name` as `Acme Outfitters`, not `cartaisy`. The store id in the block above is the fictional id already in `docs/examples/sample-merchant.env`. `npx expo config` does not print it. `api/config/mobileConfig.ts` accepts that 24-character hex shape.

Manual today: yes. The queue does not push EAS env. Copy all is a clipboard paste, and the rest of Step 0 is still gathered by hand. The download itself runs inside config evaluation once the URL or file env is set.

## Step 1 — Confirm the Backend Store Record

1. Confirm the merchant's store exists in the target Cartaisy backend environment. Its store ID is `EXPO_PUBLIC_STORE_ID`, pasted from "Handoff from Cartaisy ops queue" in Step 0: the matching line in **Copy all EAS env**, or the `EXPO_PUBLIC_STORE_ID=…` control when you paste that field alone. Do not look the id up in Mongo, and do not use the build-request id, the shop domain, or the app name.
2. Confirm the backend environment URL that the branded app should use (`EXPO_PUBLIC_API_BASE_URL`).
3. Confirm the store's runtime config endpoint (`/store/config`) returns the merchant's currency, timezone, and name.

The mobile app gets all Shopify/catalog/store data through the Cartaisy backend. Provisioning never involves giving the mobile app Shopify tokens, Shopify API access, or backend secrets.

Manual today: yes.

## Step 2 — Create the Merchant's EAS Project

Ownership model: one EAS project per merchant app. The Cartaisy `rendernext` EAS project is for the Cartaisy default app only and must never be reused for a merchant build (see `docs/DECISIONS.md`).

Account ownership: merchant EAS projects live under a **Cartaisy-managed Expo organization**, one EAS project per merchant app. This is settled, not open — recorded 2026-07-23 in the `cartaisy-backend` repo's `docs/DECISIONS.md` under "Merchant EAS/Expo projects live under a Cartaisy-managed Expo organization": *"Merchant mobile builds run from a Cartaisy-managed Expo/EAS organization, with one EAS project per merchant app inside it. Merchant-owned Expo accounts are a documented, separately priced exception for merchants who explicitly require full infrastructure ownership — never the default."* Provisioning sample, internal, and real merchant projects under the Cartaisy-managed Expo account is therefore the settled default, not a stopgap pending a decision. Note the deliberate contrast with Step 3: Expo/EAS is build machinery and stays Cartaisy-owned, while the Apple Developer team is app identity and stays merchant-owned.

1. Log in to the owning Expo account: `eas login` / verify with `eas whoami`. Two org requirements apply before you do, per the same 2026-07-23 decision: the Cartaisy Expo organization requires **hardware-key 2FA** on accounts that can reach it, and any automation touching the org must authenticate with a **scoped organization token**, never full-account credentials. Sort both out before starting this step rather than discovering them mid-provisioning.
2. Create the project (Expo dashboard, or `eas project:init` run with `APP_SLUG`/`EXPO_OWNER` exported so it initializes against the merchant identity, from a checkout you do not commit). Use a disposable checkout because `eas project:init` may write the generated project ID into an `app.json`; this repo reads `EAS_PROJECT_ID` from the environment via `app.config.ts`, and a committed `app.json` carrying one merchant's project ID would silently override that for anyone building without the merchant env exported.
3. Record the generated project ID as `EAS_PROJECT_ID` and the owning account as `EXPO_OWNER`.
4. Set every identity variable from Step 0 as an EAS environment variable on the merchant project (plain visibility is fine — they are non-secret). Take `APP_NAME`, `ICON_IMAGE_URL`, `SPLASH_IMAGE_URL`, and `EXPO_PUBLIC_STORE_ID` from "Handoff from Cartaisy ops queue" in Step 0. Prefer **Copy all EAS env**. The four single-field controls are the fallback. Do not type the display name, those URLs, or the store id from memory. Locally exported shell values are NOT forwarded to EAS build workers; only EAS environment variables or an `eas.json` profile `env` block reach the worker where `app.config.ts` is re-evaluated during prebuild.

Manual today: yes. Automation opportunity: a provisioning script that creates the EAS project and pushes the env set from a merchant record.

## Step 3 — Signing / Credential Ownership

Model: use EAS-managed (remote) credentials, stored in the merchant's EAS project — never in this repository.

- iOS: the Apple Developer Program membership of record is the **merchant's own account**, not Cartaisy's. This is settled, not open — recorded 2026-07-17 in the `cartaisy-backend` repo's `docs/DECISIONS.md` under "Merchants own their app-store developer accounts": *"Each merchant enrolls in and owns their own Apple Developer and Google Play developer accounts. Cartaisy performs the setup, provisioning, build, and submission work inside those accounts as part of the paid onboarding/setup service."* EAS therefore generates and stores the distribution certificate and provisioning profile against the merchant-owned Apple Developer team. A Cartaisy-controlled team is still acceptable for genuinely internal development builds — ones that are not merchant-branded and are never submitted to the App Store — but never for a merchant-branded or store-bound build. Merchant Apple enrollment lead time, App Store Connect setup, and the on-device distribution path are scoped in `docs/IOS_PROVISIONING_SCOPE.md`.
- Android: let EAS generate and store the upload keystore for the merchant project. Do not generate local keystores.

The first `eas build` for each platform walks through credential generation interactively; run it from a terminal, not CI, the first time.

Manual today: yes (interactive on first build). Automation opportunity: `credentials.json`-free EAS remote credentials are already mostly automated after the first interactive run.

### Offboarding — Handing Back What Cartaisy Holds

The rest of this runbook covers onboarding. This subsection covers the reverse, and lives here because what has to be handed back is exactly what this step creates. Required by the 2026-07-23 decision in the `cartaisy-backend` repo's `docs/DECISIONS.md`: *"the merchant offboarding path (hand over keystore + bundle IDs) must be written into the onboarding runbook and merchant agreement."*

**What Cartaisy holds on the merchant's behalf, and must hand back:**

- **The Android upload keystore.** EAS generated it and stores it in the merchant's EAS project, which sits inside the Cartaisy-managed Expo organization — so it is in Cartaisy's custody, not the merchant's. It is what signs updates to the merchant's existing Play listing, so handing it back is what keeps the app portable to another provider.
- **The bundle identifiers.** `IOS_BUNDLE_IDENTIFIER` and `ANDROID_PACKAGE` from Step 0, already recorded in the "Merchant Build Record" section of `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`. Not secret, but permanent and tied to the merchant's shipped apps, so the merchant needs them written down somewhere they own.

**What does not transfer, because it was never Cartaisy's to transfer:** the Apple Developer Program account and the Google Play developer account. Both are merchant-owned per the 2026-07-17 decision ("Merchants own their app-store developer accounts"). There is no ownership handover for these — the only offboarding action is Cartaisy losing its own access.

**What the merchant does not receive:** the EAS project itself. Expo/EAS is Cartaisy build machinery under the 2026-07-23 decision (see Step 2), so the project stays in the Cartaisy organization. The keystore inside it is the merchant's; the project around it is not.

**Steps:**

1. Export the Android upload keystore from the merchant's EAS project. Per Expo's current documentation this is an interactive menu rather than a single flag: run `eas credentials`, select the Android platform and build profile, choose *"credentials.json: Upload/Download credentials between EAS servers and your local json"*, then *"Download credentials from EAS to credentials.json"*. Confirm the exact wording against EAS's CLI docs when you actually run this — menu labels move between `eas-cli` versions, so treat the path above as a pointer, not a guarantee.
2. Treat the exported keystore as secret material. Expo's guidance is explicit: *"Your application's keystore should be kept private. Under no circumstances should you check it into your repository."* Transfer it over a channel the merchant controls, and delete local copies once the merchant confirms receipt.
3. Hand over the bundle identifiers from the Merchant Build Record.
4. **Delete the remote credentials from the merchant's EAS project once the merchant confirms receipt.** Exporting the keystore copies it; it does not remove it. Leaving it in place means Cartaisy keeps the ability to sign releases for a merchant it no longer serves, which is precisely what handing it back was meant to end. The same applies to the EAS-managed iOS distribution certificate and provisioning profile. Use the `eas credentials` menu for each platform, and only after the merchant has confirmed they hold a working copy of the keystore — deleting it first is unrecoverable and would cost the merchant their Play update path.
5. **Transfer Firebase, then leave it.** If push was in scope (Step 4), the merchant's Firebase project is a separate per-merchant project. Grant the merchant Owner on it, have them confirm they can administer it independently, then remove every Cartaisy account from its IAM members. Handing over the project details without transferring administrative control leaves the merchant unable to manage their own push infrastructure, and leaves former Cartaisy staff with continued access to it.
6. Revoke Cartaisy's access to the merchant's Apple Developer and Google Play accounts. For the App Store Connect side specifically, see the access note in `docs/IOS_PROVISIONING_SCOPE.md` — Cartaisy staff are invited as users on the merchant's team during provisioning, and that invitation is what gets withdrawn here.
7. Record what was handed over, what was deleted, and what access was revoked, against the merchant's build record.

**Out of scope for this runbook:** the merchant agreement. The same 2026-07-23 decision requires offboarding to be written into the contract as well as here, and that is a business and legal task for Daniyal — not something this document covers and not something an agent should draft.

Manual today: yes, and appropriately so — this runs once per merchant relationship and moves secret material. Automation opportunity: none worth building.

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

Manual today: yes. Automation opportunity: low — but no longer gated on a pending decision. Apple account ownership was settled on 2026-07-17 (`cartaisy-backend` repo, `docs/DECISIONS.md`, "Merchants own their app-store developer accounts"), so that is not the reason this step stays manual. The reason is the nature of the step: the `.p8` key is secret material created inside the merchant's own Apple Developer account and hand-carried into the merchant's Firebase console, and routing a secret like that through automation buys little for the risk it adds.

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

Confirm in the output: `name`, `slug`, `scheme`, `version`, `ios.bundleIdentifier`, `ios.buildNumber`, `android.package`, `android.versionCode`, the Firebase file paths, the Apple Pay merchant ID in both the entitlements and the Stripe plugin block, `extra.eas.projectId` / `owner`, the launcher `icon`, and the `expo-splash-screen` plugin `image`. When `APP_NAME` is set, `name` equals that merchant display name and is not `cartaisy`. For a merchant build the icon is the local icon file, the downloaded file, or `./assets/images/neutral-icon.png`. The splash image is the local splash file, the downloaded file, or `./assets/images/neutral-splash.png`. On a non-default identity those two paths must not be the Cartaisy assets `./assets/images/icon.png`, `./assets/images/adaptive-icon.png`, or `./assets/images/cartaisy-color-logo.png`. If the ops queue had no public URL for one of them, the matching `neutral-*` file is the expected result and should already be recorded as intentional in the handoff above. This check is the dry run; it is not an EAS build. `EXPO_PUBLIC_STORE_ID` is not in this output. `api/config/mobileConfig.ts` reads the pasted value and requires a 24-character hex Mongo ObjectId (`docs/MOBILE_ENV_VARIABLES.md`). Do not treat this command as a store-id check.

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

A dry run of this runbook using the fictional merchant in `docs/examples/sample-merchant.env`. Items marked *simulated* cannot be completed for a fictional merchant and are the exact items a real merchant needs. Updated 2026-08-07 after a full Steps 0–8 rehearsal attempt (see `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`'s "Full Provisioning Runbook Rehearsal (2026-08-07)" entry for the complete log) — this rehearsal ran from an environment with repo/CLI access but no EAS/Firebase account login and no physical device, so it closes some items for real and leaves others open for a session that has that access.

- [x] Step 0: identity inputs collected — provided by `docs/examples/sample-merchant.env` (`Acme Outfitters`, `com.example.acmeoutfitters`, scheme `acmeoutfitters`, store ID `507f1f77bcf86cd799439011`). Re-checked field-by-field against `eas.json`'s `sample-merchant-development` profile 2026-08-07: real drift found — `APP_ICON_PATH`, `APP_NOTIFICATION_ICON_PATH`, and `ANDROID_ADAPTIVE_ICON_PATH` in `eas.json` point at the real `acme-outfitters-*.png` assets (added in PR #112, commit `85b47ae`), while `docs/examples/sample-merchant.env` still points at the generic `cartaisy-color-logo.png`/`adaptive-icon.png` placeholders — PR #112 updated one file and missed the other. Every other Step 0 field matches across both files. Not yet fixed (this is a rehearsal-finds-and-logs task, not a fix-inline task); needs its own small follow-up.
- [ ] Step 1: backend store record confirmed — still *simulated*, not newly resolved: this rehearsal deliberately tried to close this for real by standing up a local `cartaisy-backend` against a real local MongoDB (`mongodb-memory-server`, which downloads and runs an actual `mongod` binary), but the download (`fastdl.mongodb.org`) is blocked by this environment's network egress (`403`, confirmed with multiple MongoDB versions and directly with `curl`). No real backend was reachable, so `docs/examples/sample-merchant.env`'s `EXPO_PUBLIC_API_BASE_URL`/`EXPO_PUBLIC_STORE_ID` remain the fictional placeholders described in Section 1. A session with unrestricted network egress (or an existing real backend/MongoDB already running, as the 2026-08-06 Phase 3 live run had) can close this.
- [x] Step 2: EAS project created and env set — real internal sample project `@rendernext/acme-outfitters` created for GitHub issue #86, with non-secret `EAS_PROJECT_ID` and `EXPO_OWNER` recorded in `docs/examples/sample-merchant.env` and the `sample-merchant-development` profile. Real merchant releases follow the same model — one EAS project per merchant inside the Cartaisy-managed Expo organization, settled 2026-07-23 (see Step 2); no per-merchant project/owner decision is outstanding. Not re-verified 2026-08-07: confirming hardware-key 2FA/scoped-org-token enforcement and that every Step 0 variable is genuinely set as an EAS environment variable (not just in the local `eas.json`) both require an authenticated `eas whoami`/EAS dashboard session, which this rehearsal's environment doesn't have.
- [x] Step 3 (Android half): Android upload keystore provisioned in EAS — **no longer blocked**, correcting the stale note below. The keystore was generated in a later live session and used to produce the signed `sample-merchant-development` Android build verified on a physical device 2026-08-04 (Phase 2's gate-closing evidence — see `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`'s "Physical Device Install Verification (2026-08-04)"). — [ ] Step 3 (iOS half): still *simulated* and structurally blocked — requires a real Apple Developer Program membership, which doesn't exist for any merchant yet (Phase 2's other open item, iOS build proof).
- [ ] Step 4: Firebase apps created, files stored as EAS file env vars — still *simulated* (sample points at the committed Cartaisy files only so config evaluation works; a real merchant must use their own files or Android builds fail at the Google Services Gradle step). The Android half was explicitly in scope to close for real in this rehearsal, but creating a Firebase project/app requires interactive Firebase console (Google account) access this environment doesn't have.
- [ ] Step 5: push registration — still *simulated*; depends on Step 4's Android Firebase app existing first.
- [x] Step 6: Apple Pay/Stripe — **skipped by design**, not blocked (sample uses `pk_test_sample_placeholder` and a fictional merchant ID). Per this runbook's own Step 6 text, this is explicitly skippable for a development build that doesn't exercise wallet payments.
- [x] Step 7: `npx expo config --type public` with the sample env exported resolves the full Acme identity — re-verified live 2026-08-07 (previously last verified 2026-07-08). Confirms `name`, `slug`, `scheme`, `version`, `ios.bundleIdentifier`/`buildNumber`, `android.package`/`versionCode`, both Firebase file paths, the Apple Pay merchant ID in both `ios.entitlements` and the Stripe plugin block (matching, no mismatch), and `extra.eas.projectId`/`owner` all resolve — see `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`'s new rehearsal entry for the full field list.
- [ ] Step 8: EAS development build — attempted 2026-07-08 and 2026-07-09 for Android with placeholder EAS metadata, then attempted again on 2026-07-13 against the real internal sample project, blocked at the time on uninitialized Android remote credentials/keystore in `--non-interactive` mode. **That specific blocker is stale — it was cleared in the 2026-08-04 physical-device session** (see Step 3 above), so this line no longer describes the real state. Still unattempted as a fresh run: the 2026-08-07 rehearsal could not run `eas build` at all (no authenticated EAS session in this environment) and had no physical device/emulator to install a resulting artifact on, so Step 8 is blocked on device/account access, not on credentials. Results are recorded in `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md` and `docs/RELEASE_CHECKLIST.md`.

## Manual Steps Today vs Automation Opportunities

Manual today (every step, in practice):

- Collecting merchant identity inputs and recording the build record (Step 0), including the ops-queue paste. Prefer **Copy all EAS env** for `APP_NAME`, `ICON_IMAGE_URL`, `SPLASH_IMAGE_URL`, and `EXPO_PUBLIC_STORE_ID`. The four single-field controls are the fallback.
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
4. A single "provision merchant" pipeline chaining 2–3. Ready to ticket and prioritize — the ownership decisions this item used to wait on are both recorded (see below). Not built and not scoped here.

No longer blocked on decisions: both ownership questions are settled and recorded in the `cartaisy-backend` repo's `docs/DECISIONS.md` — Apple Developer account ownership on 2026-07-17 ("Merchants own their app-store developer accounts") and Expo/EAS organization ownership on 2026-07-23 ("Merchant EAS/Expo projects live under a Cartaisy-managed Expo organization"). The 2026-07-23 entry states directly that store-facing provisioning automation "is now unblocked and may be ticketed." The numbered pipeline above is still unbuilt. Store-admin build dispatch is separate: `cartaisy-backend` runs `.eas/workflows/store-build.yml` when its EAS env vars are set (`docs/EAS_STORE_BUILD_WORKFLOW.md`). This runbook records that state; it does not schedule the work.

## Related Docs

- `docs/EAS_STORE_BUILD_WORKFLOW.md`
- `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`
- `docs/RELEASE_CHECKLIST.md`
- `docs/MOBILE_ENV_VARIABLES.md`
- `docs/DECISIONS.md`
- `docs/examples/sample-merchant.env`
- `app.config.ts`
- `cartaisy-dashboard` `docs/STATUS.md` and `docs/DECISIONS.md` ("The ops build queue shows public icon and splash URLs", issue #43 / PR #44; "Ops copies the icon as ICON_IMAGE_URL", issue #45 / PR #47; "Ops copies the merchant display name as APP_NAME", issue #49 / PR #50; "Ops copies the merchant store id as EXPO_PUBLIC_STORE_ID", issue #51 / PR #52; "Ops copies every launcher assignment as one EAS env block", issue #55 / PR #57)
- `cartaisy-backend` `docs/cartaisy/BUILD_REQUEST_API.md` (issue #177)
- GitHub issues #60, #61, #133, #135, #137, #139, #141, #143, #145, #149
