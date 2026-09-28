# Mobile Environment Variables

Cartaisy mobile apps are branded builds for individual Shopify merchants. Any environment variable prefixed with `EXPO_PUBLIC_` is bundled into the mobile JavaScript that ships to devices, so these values must be treated as public build-time configuration, not secrets.

Use mobile environment variables only for values that are safe for customers, app reviewers, or reverse engineers to see. Keep private credentials and merchant secrets on the backend.

## Native Build Identity Variables

`app.config.ts` reads these non-public build-time variables to generate merchant-specific Expo config. Each value has the current Cartaisy default, so existing Cartaisy builds continue to work when none of them are set.

| Variable | Purpose | Default |
| --- | --- | --- |
| `APP_NAME` | Native and Expo app display name. Falls back to `EXPO_PUBLIC_APP_NAME` when unset. | `cartaisy` |
| `APP_SLUG` | Expo slug for the branded build. | `cartaisy` |
| `APP_SCHEME` | Native deep-link URL scheme. Falls back to `EXPO_PUBLIC_APP_SCHEME` when unset. | `cartaisy` |
| `APP_VERSION` | App marketing version. | `1.0.0` |
| `IOS_BUILD_NUMBER` | iOS build number. | `1` |
| `IOS_BUNDLE_IDENTIFIER` | iOS bundle identifier. Falls back to `EXPO_PUBLIC_IOS_BUNDLE_ID` when unset. | `com.rendernext.cartaisy` |
| `IOS_GOOGLE_SERVICES_FILE` | iOS Firebase plist used by Expo config. | `./GoogleService-Info.plist` |
| `IOS_APPLE_PAY_MERCHANT_ID` | Apple Pay merchant identifier used by iOS entitlements and the Stripe config plugin. Falls back to `EXPO_PUBLIC_STRIPE_MERCHANT_ID` when unset. | `merchant.com.cartaisy` |
| `ANDROID_PACKAGE` | Android package/application ID. Falls back to `EXPO_PUBLIC_ANDROID_PACKAGE` when unset. | `com.rendernext.cartaisy` |
| `ANDROID_VERSION_CODE` | Android version code. | `1` |
| `ANDROID_GOOGLE_SERVICES_FILE` | Android Firebase JSON used by Expo config. | `./google-services.json` |
| `APP_ICON_PATH` | Web favicon path. The native launcher icon uses `ICON_IMAGE_PATH` / `ICON_IMAGE_URL`. | `./assets/images/cartaisy-color-logo.png` |
| `ICON_IMAGE_PATH` | Native launcher icon. Repo-relative PNG/JPEG, or an absolute path from an EAS file environment variable. Takes precedence over `ICON_IMAGE_URL`. | Cartaisy square icon (`assets/images/icon.png`) on the default Cartaisy identity; `assets/images/neutral-icon.png` on any other identity |
| `ICON_IMAGE_URL` | Public `https` URL of the merchant launcher icon. Downloaded while `app.config.ts` evaluates on the EAS worker. Not read by app JavaScript. Not an `EXPO_PUBLIC_` variable. | Unset |
| `APP_NOTIFICATION_ICON_PATH` | Notification icon path. Falls back to `APP_ICON_PATH` when unset. | `./assets/images/cartaisy-color-logo.png` |
| `APP_NOTIFICATION_COLOR` | Android notification accent color. | `#8B5CF6` |
| `ANDROID_ADAPTIVE_ICON_PATH` | Android adaptive icon foreground. A merchant build that leaves this unset, or points it at `assets/images/adaptive-icon.png`, uses the resolved launcher icon instead. | `./assets/images/adaptive-icon.png` on the default Cartaisy identity |
| `ANDROID_ADAPTIVE_ICON_BACKGROUND` | Android adaptive icon background color. | `#ffffff` |
| `SPLASH_IMAGE_PATH` | Pre-JS native splash image. Repo-relative PNG/JPEG, or an absolute path from an EAS file environment variable. Takes precedence over `SPLASH_IMAGE_URL`. | Cartaisy wordmark on the default Cartaisy identity; `assets/images/neutral-splash.png` on any other identity |
| `SPLASH_IMAGE_URL` | Public `https` URL of the merchant splash. Downloaded while `app.config.ts` evaluates on the EAS worker. Not read by app JavaScript. | Unset |
| `SPLASH_BACKGROUND_COLOR` | Native splash screen background color. | `#ffffff` |
| `EAS_PROJECT_ID` | EAS project ID for the branded app. | Cartaisy project ID |
| `EXPO_OWNER` | Expo account owner. | `rendernext` |

For the checked-in Cartaisy native project, the iOS bundle identifier, Android package, and Firebase files are aligned to the Cartaisy defaults. EAS builds regenerate native projects from `app.config.ts` because `.easignore` excludes the checked-in `ios/` and `android/` directories from the build archive (see `docs/DECISIONS.md`); merchant builds must set these variables on the EAS build itself (EAS environment variables or `eas.json` profile `env` — locally exported shell values are not forwarded to EAS workers) and supply matching Firebase files.

### Native splash and icon assets

The native launcher icon (iOS App Icon and the Android icon) is separate from the web favicon and from the runtime in-app mark (`BrandMark` / `iconUrl`). Supply it in one of these ways:

1. `ICON_IMAGE_PATH` — a PNG or JPEG in the repo, or an EAS file environment variable with that name.
2. `ICON_IMAGE_URL` — a public `https` URL for the merchant icon (for example a Cartaisy backend branding CDN URL). `scripts/resolveNativeIcon.js`, called from `app.config.ts`, downloads it while config evaluates, including on the EAS worker during prebuild. No `Authorization` header is sent. The URL is not an `EXPO_PUBLIC_` variable, so it is not bundled into JavaScript.

`ICON_IMAGE_URL` must be `https`, must use a public hostname, and must not carry userinfo or credential query parameters (`token`, `access_token`, `key`, `secret`, Shopify token prefixes, and similar). A missing file, a rejected URL, or a failed download resolves the launcher icon to `assets/images/neutral-icon.png` on any build that is not the default Cartaisy identity (and on a Cartaisy build that explicitly set an icon asset which then failed). The Cartaisy square icon (`assets/images/icon.png`) remains the launcher icon only for the default Cartaisy identity when no icon path or URL is set. `ICON_IMAGE_PATH` wins when it is set; a path that does not point at a PNG or JPEG also resolves to the neutral image and does not continue on to the URL.

Android adaptive foreground uses `ANDROID_ADAPTIVE_ICON_PATH` when that value is a PNG or JPEG other than the Cartaisy default `assets/images/adaptive-icon.png`. Otherwise it uses the resolved launcher icon, so a merchant build does not inherit the Cartaisy adaptive wordmark. The default Cartaisy identity keeps `assets/images/adaptive-icon.png` when no separate merchant adaptive file is set. `APP_ICON_SQUARE_PATH` is not read. `APP_ICON_PATH` is the web favicon only. Notification icons are unchanged.

The pre-JS native splash is separate from the icon and from the runtime JS splash (`app/splash.tsx`). Supply it in one of these ways:

1. `SPLASH_IMAGE_PATH` — a PNG or JPEG in the repo, or an EAS file environment variable with that name.
2. `SPLASH_IMAGE_URL` — a public `https` URL for the merchant splash (for example a Cartaisy backend branding CDN URL). `scripts/resolveNativeSplash.js`, called from `app.config.ts`, downloads it while config evaluates, including on the EAS worker during prebuild. No `Authorization` header is sent. The URL is not an `EXPO_PUBLIC_` variable, so it is not bundled into JavaScript.
3. `SPLASH_BACKGROUND_COLOR` — the solid color behind that image.

`SPLASH_IMAGE_URL` must be `https`, must use a public hostname, and must not carry userinfo or credential query parameters (`token`, `access_token`, `key`, `secret`, Shopify token prefixes, and similar). A missing file, a rejected URL, or a failed download resolves the native splash to `assets/images/neutral-splash.png` on any build that is not the default Cartaisy identity (and on a Cartaisy build that explicitly set a splash asset which then failed). The Cartaisy wordmark remains the splash only for the default Cartaisy identity when no splash path or URL is set.

The runtime JS icon and splash still come from store config through `BrandMark`. These downloads do not change that path and do not put Shopify tokens on the device.

## Safe Public Build Variables

These values may be included in branded mobile build configuration when they contain only public, non-sensitive data.

| Variable | Purpose | Timing |
| --- | --- | --- |
| `EXPO_PUBLIC_API_BASE_URL` | Public URL for the Cartaisy backend API used by the app. | Build-time value for the shipped app bundle. |
| `EXPO_PUBLIC_STORE_ID` | Store identifier sent to the backend so requests are scoped to the branded merchant build. | Build-time value for the shipped app bundle. |
| `EXPO_PUBLIC_APP_VARIANT` | Public build variant name, if used by release tooling to distinguish merchant, staging, preview, or production builds. | Build-time value for the shipped app bundle. |
| `EXPO_PUBLIC_APP_NAME` | Public app or merchant display name used in supported client-side labels. Also used as an `APP_NAME` compatibility fallback by `app.config.ts`. | Build-time value for the shipped app bundle. |
| `EXPO_PUBLIC_APP_SCHEME` | Public deep-link URL scheme used by client integrations that read it from JavaScript. Also used as an `APP_SCHEME` compatibility fallback by `app.config.ts`. | Build-time value for the shipped app bundle. |
| `EXPO_PUBLIC_IOS_BUNDLE_ID` | Public iOS bundle identifier for build/release tracking when used by build tooling. Also used as an `IOS_BUNDLE_IDENTIFIER` compatibility fallback by `app.config.ts`. | Build-time value for the shipped app bundle. |
| `EXPO_PUBLIC_ANDROID_PACKAGE` | Public Android application ID for build/release tracking when used by build tooling. Also used as an `ANDROID_PACKAGE` compatibility fallback by `app.config.ts`. | Build-time value for the shipped app bundle. |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key, if the branded build uses client-side Stripe initialization. | Build-time public value; tenant-specific but not secret. |
| `EXPO_PUBLIC_STRIPE_MERCHANT_ID` | Apple Pay merchant identifier, if wallet payments are configured for the branded build. | Build-time public value that must match native payment configuration. |

If a value would be unsafe to paste into a public issue or support ticket, it is unsafe for an `EXPO_PUBLIC_*` variable.

## Forbidden Mobile Variables

Never include private credentials, access tokens, or backend secrets in mobile build configuration, even if the variable name starts with `EXPO_PUBLIC_`.

Forbidden examples include:

- Shopify Admin API access tokens.
- Shopify private app tokens or custom app secrets.
- Shopify Storefront access tokens.
- Legacy public Shopify variables: `EXPO_PUBLIC_SHOPIFY_ACCESS_TOKEN`, `EXPO_PUBLIC_SHOPIFY_STORE_URL`, and `EXPO_PUBLIC_SHOPIFY_API_VERSION`; do not define these for local development, sample env files, or branded mobile builds.
- Stripe secret keys, webhook secrets, restricted keys, or account-level credentials.
- JWT signing secrets, auth refresh secrets, session secrets, or password reset secrets.
- Database URLs, database passwords, Redis URLs, or queue credentials.
- Backend service API keys, internal admin keys, or tenant-isolation secrets.
- Firebase private keys, service account JSON, or private push notification credentials.
- Merchant-specific credentials that grant write, admin, checkout, order, customer, or payment access.

Do not expose Shopify credentials to the mobile app. Mobile requests for Shopify-backed data should go through the backend so the backend can use store-specific credentials and tenant-scoped authorization. The legacy direct-client Shopify credential path is retired and must not be restored in local `.env` files, `.env.example`, docs examples, EAS environment variables, or `EXPO_PUBLIC_*` values.

Development-mode warnings are a blocker to clean up, not permission to keep real tokens locally. If a real Shopify token or Storefront token was ever placed in a mobile `EXPO_PUBLIC_*` variable or uploaded in an EAS archive, the operator TODO is to rotate that token in Shopify and remove the legacy variable everywhere without copying the token into issues, docs, commits, or build logs.

## Build-Time vs Runtime Values

`EXPO_PUBLIC_*` values are build-time inputs for the JavaScript bundle. Changing them requires a new build or republished JavaScript bundle, depending on the release path. They are appropriate for stable public identifiers such as API base URL, store ID, app variant/name, URL scheme, and public publishable payment keys. Prefer the non-public native build identity variables above for values that only `app.config.ts` needs.

Runtime or backend-driven values should be loaded from tenant-scoped backend responses instead of mobile environment variables. Examples include:

- Storefront content and product/catalog data.
- Merchant settings that may change after the app is released.
- Feature flags or availability rules.
- Branding metadata loaded through supported backend configuration.
- Shopify credentials, payment secrets, and any private tenant configuration.

When in doubt, keep the value out of the mobile build and serve it through a backend endpoint that scopes every request to the correct store.
