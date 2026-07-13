# Mobile Branding and Configuration Boundary Audit

Audit source: GitHub issue #6, "Audit mobile branding and configuration boundaries".

This is a documentation-only audit. It does not change app behavior.

Status update (2026-07-02): This audit was written against static `app.json`, which has since been replaced by dynamic `app.config.ts` (static `app.json` was removed). References to `app.json` values below correspond to `app.config.ts` defaults, and app identity env values (`APP_NAME`, `IOS_BUNDLE_IDENTIFIER`, `ANDROID_PACKAGE`, and their `EXPO_PUBLIC_*` fallbacks) now do drive Expo config — see `docs/MOBILE_ENV_VARIABLES.md`. The native identity mismatch risks flagged below (checked-in iOS project, Firebase iOS config, Apple Pay entitlements) still require verification before release. Migration details: `docs/DYNAMIC_APP_CONFIG_MIGRATION_AUDIT.md`.

## Executive Summary

Cartaisy is currently configured as a branded Expo/React Native mobile app with native iOS and Android projects checked in. Most app identity and launch-surface branding is build-time only: app name, icons, splash assets, bundle IDs/package names, notification icons/colors, Firebase app files, Apple Pay merchant entitlement, and Android package metadata all require a native rebuild and store submission.

The app has a small runtime store configuration path through `GET /store/config`, but today that runtime config is limited to currency, timezone, and store name. Visual branding is mostly hard-coded through bundled assets and Tamagui tokens.

The `EXPO_PUBLIC_*` environment variables are build-time JavaScript inputs for shipped binaries. They are not secret runtime configuration, and changing them requires rebuilding or republishing the JavaScript bundle. Because native updates are disabled in the checked-in Android manifest and no Expo Updates runtime config is visible in `app.json`, these values should be treated as build-time for installed app binaries.

## Inspected Files

- `app.json`
- `eas.json`
- `.env.example`
- `package.json`
- `api/apiClient.ts`
- `api/config/axios.ts`
- `api/config/products.ts`
- `api/endpoints/storeConfig.ts`
- `api/hooks/useProducts.ts`
- `components/providers/AppInitializer.tsx`
- `store/useStoreConfigStore.ts`
- `app/_layout.tsx`
- `app/checkout.tsx`
- `components/molecules/checkout/WalletPaymentButtons.tsx`
- `tamagui/config.ts`
- `tamagui/theme.ts`
- `tamagui/token.ts`
- `tamagui/fonts.ts`
- `assets/Icons.ts`
- `android/app/build.gradle`
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/res/values/strings.xml`
- `android/app/src/main/res/values/colors.xml`
- `android/app/src/main/res/values/styles.xml`
- `android/app/src/main/res/drawable/splashscreen_logo.xml`
- `android/app/google-services.json`
- `google-services.json`
- `ios/cartaisy/Info.plist`
- `ios/cartaisy.xcodeproj/project.pbxproj`
- `ios/cartaisy/cartaisy.entitlements`
- `ios/cartaisy/SplashScreen.storyboard`
- `ios/cartaisy/Images.xcassets/*`
- `GoogleService-Info.plist`

## App Config

`app.json` is static JSON, not a dynamic `app.config.ts` or `app.config.js`. It sets:

- Expo app name and slug: `cartaisy`.
- Version: `1.0.0`.
- App scheme: `cartaisy`.
- Main icon: `./assets/images/cartaisy-color-logo.png`.
- Notification icon and color: `./assets/images/cartaisy-color-logo.png`, `#8B5CF6`.
- iOS bundle identifier: `com.rendernext.cartaisy`.
- iOS Apple Pay entitlement in Expo config: `merchant.com.cartaisy`.
- Android package: `com.rendernext.cartaisy`.
- Android adaptive icon foreground: `./assets/images/adaptive-icon.png`.
- Android adaptive icon background: `#ffffff`.
- Android Google services file: `./google-services.json`.
- Splash plugin background: `#ffffff`, with no image configured in the plugin block.
- Stripe plugin merchant identifier: `merchant.com.cartaisy`, Google Pay enabled.
- EAS project ID and owner.

Because this is static JSON, the app identity values listed in `.env.example` are not wired into Expo config. `EXPO_PUBLIC_APP_NAME`, `EXPO_PUBLIC_APP_SCHEME`, `EXPO_PUBLIC_IOS_BUNDLE_ID`, and `EXPO_PUBLIC_ANDROID_PACKAGE` do not currently drive `app.json`.

## Environment Usage

`.env.example` defines these public variables:

| Variable | Current use | Boundary |
| --- | --- | --- |
| `EXPO_PUBLIC_API_BASE_URL` | Used by API clients and `AppInitializer`. | Build-time JS constant for a shipped binary. |
| `EXPO_PUBLIC_STORE_ID` | Sent as `X-Store-ID` by API clients. | Build-time JS constant for a shipped binary. |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Passed to `StripeProvider`. | Build-time JS constant; publishable but tenant-specific. |
| `EXPO_PUBLIC_STRIPE_MERCHANT_ID` | Passed to `StripeProvider`; logged by wallet payment buttons. | Build-time JS constant and must match native Apple Pay entitlement. |
| `EXPO_PUBLIC_APP_SCHEME` | Passed to `StripeProvider` `urlScheme`. | Build-time JS constant; native deep link schemes still require native config. |
| `EXPO_PUBLIC_APP_NAME` | Used as wallet payment label/merchant name. | Build-time JS constant. |
| `EXPO_PUBLIC_IOS_BUNDLE_ID` | Defined in example only. | Not currently consumed by app config or native project. |
| `EXPO_PUBLIC_ANDROID_PACKAGE` | Defined in example only. | Not currently consumed by app config or native project. |

Important boundary: `EXPO_PUBLIC_*` values are available in client code and must not contain secrets. Legacy direct Shopify variables such as `EXPO_PUBLIC_SHOPIFY_STORE_URL`, `EXPO_PUBLIC_SHOPIFY_ACCESS_TOKEN`, and `EXPO_PUBLIC_SHOPIFY_API_VERSION` are not part of `.env.example` and must not be reintroduced for local development, sample env files, or branded builds. Mobile Shopify, catalog, checkout, order, and store data should continue to flow through the Cartaisy backend.

## Runtime Configuration

The app already fetches backend store configuration through:

- `api/endpoints/storeConfig.ts`
- `components/providers/AppInitializer.tsx`
- `store/useStoreConfigStore.ts`

Current runtime fields:

- `currency`
- `timezone`
- `name`, stored locally as `storeName`

Observed runtime consumers:

- Product detail, cart, checkout, shipping, confirmation, and price formatting use the store currency from `useStoreConfigStore`.

Current runtime config does not control:

- Native app name.
- Home-screen icon.
- Splash screen asset or color.
- Bundle ID or package name.
- Firebase app files.
- Apple Pay merchant entitlement.
- Android Google Pay manifest metadata.
- Tamagui primary color or theme tokens.
- In-app Cartaisy logo assets.
- Notification icon or notification color.

## Theme Setup

Theme setup is static and bundled:

- `tamagui/config.ts` creates a Tamagui config with `defaultTheme: "light"`.
- `tamagui/theme.ts` defines `light` and `dark` themes.
- `tamagui/token.ts` defines a hard-coded `PRIMARY_COLOR = "#A82A50"` and derived `primarylight`.
- `assets/colors.ts` re-exports Tamagui token colors.
- `app/_layout.tsx` wraps the app with `<TamaguiProvider config={config} defaultTheme="light">`.

Theme tokens are not loaded from backend config. Changing app-wide primary color, typography, radii, spacing, or most reusable visual tokens requires a code change and rebuild/republish.

## Icons

Build-time/native icons:

- Expo icon: `./assets/images/cartaisy-color-logo.png`.
- Android adaptive icon foreground: `./assets/images/adaptive-icon.png`.
- Android generated launcher icons live under `android/app/src/main/res/mipmap-*`.
- iOS AppIcon assets live under `ios/cartaisy/Images.xcassets/AppIcon.appiconset`.
- Notification icon assets live under `android/app/src/main/res/drawable-*`.
- Notification color is configured as `#8B5CF6` in `app.json` and generated Android resources.

In-app logo/icon assets:

- `assets/Icons.ts` maps `cartaisyColorlogo` to `assets/images/cartaisy-color-logo.png`.
- `assets/Icons.ts` maps `cartaisyWhitelogo` to `assets/images/cartaisy-white-logo.png`.
- These are used in splash, auth, profile, payment, and home header surfaces.

Changing native icons requires a native build. Changing in-app logo assets requires at least a JavaScript/assets update, and for installed binaries without OTA updates this should also be treated as requiring a new build.

## Splash

Expo config:

- `expo-splash-screen` plugin sets `backgroundColor: "#ffffff"`.
- No splash image is declared in the plugin block.

iOS native project:

- `ios/cartaisy/SplashScreen.storyboard` uses `SplashScreenLogo`.
- `ios/cartaisy/Images.xcassets/SplashScreenLogo.imageset` contains `image.png`, `image@2x.png`, and `image@3x.png`.
- `ios/cartaisy/Images.xcassets/SplashScreenBackground.colorset` is white.

Android native project:

- `android/app/src/main/res/values/styles.xml` uses `Theme.App.SplashScreen`.
- Splash background is `@color/splashscreen_background`, currently white.
- `windowSplashScreenAnimatedIcon` points to `@drawable/splashscreen_logo`.
- `android/app/src/main/res/drawable/splashscreen_logo.xml` is a white shape, not a branded bitmap logo.

The app also has a React route splash screen:

- `app/index.tsx` renders `app/splash.tsx`.
- `app/splash.tsx` displays the bundled `cartaisyColorlogo` asset.

Native splash changes require a native rebuild. The React splash screen asset is bundled app code/assets and is not backend-configurable today.

## Bundle IDs and Package Names

Configured values are inconsistent across layers:

| Surface | Value |
| --- | --- |
| `app.json` iOS `bundleIdentifier` | `com.rendernext.cartaisy` |
| `GoogleService-Info.plist` iOS bundle ID | `com.rendernext.cartaisy` |
| Xcode `PRODUCT_BUNDLE_IDENTIFIER` | `com.cartaisy.app` |
| `app.json` Android `package` | `com.rendernext.cartaisy` |
| Android Gradle `namespace` | `com.rendernext.cartaisy` |
| Android Gradle `applicationId` | `com.rendernext.cartaisy` |
| Android `google-services.json` package | `com.rendernext.cartaisy` |

The checked-in iOS native project currently differs from Expo config and Firebase iOS config. If builds use the checked-in native iOS project as-is, the effective iOS bundle identifier is `com.cartaisy.app`. If a clean prebuild is generated from `app.json`, Expo config would attempt to use `com.rendernext.cartaisy`.

Bundle IDs and package names are build-time only. They cannot safely move to backend config because app stores, Firebase native app registrations, push certificates, deep links, wallet capabilities, and installed app identity all depend on them.

## Firebase Config

Files present:

- Root `GoogleService-Info.plist`
- Root `google-services.json`
- Android copy `android/app/google-services.json`

The Android app applies `com.google.gms.google-services` in `android/app/build.gradle` and uses package `com.rendernext.cartaisy`.

`app.json` includes:

- `@react-native-firebase/app`
- `@react-native-firebase/messaging`
- Android `googleServicesFile: "./google-services.json"`

`app/_layout.tsx` imports `@react-native-firebase/app` and `@react-native-firebase/messaging`.

Firebase project identifiers, app IDs, sender IDs, API keys, storage buckets, and package/bundle associations are native Firebase app configuration. They are public client config, not secrets, but they are build-time app registration boundaries. Changing them requires replacing native config files and rebuilding.

Audit note: iOS Firebase config references `com.rendernext.cartaisy`, while the checked-in Xcode project uses `com.cartaisy.app`. That mismatch should be resolved before relying on iOS Firebase messaging in a production branded app.

## Stripe Config

Build-time/native Stripe config:

- `app.json` configures `@stripe/stripe-react-native` with `merchantIdentifier: "merchant.com.cartaisy"` and `enableGooglePay: true`.
- `app.json` also declares iOS in-app payment entitlement `merchant.com.cartaisy`.
- Android manifest includes `com.google.android.gms.wallet.api.enabled = true`.

Runtime JS Stripe values:

- `app/_layout.tsx` passes `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `StripeProvider`.
- `app/_layout.tsx` passes `EXPO_PUBLIC_APP_SCHEME` to `StripeProvider`.
- `app/_layout.tsx` passes `EXPO_PUBLIC_STRIPE_MERCHANT_ID` to `StripeProvider`, defaulting to `merchant.com.cartaisy`.
- Checkout wallet payment labels use `EXPO_PUBLIC_APP_NAME`.

Native entitlement note:

- `ios/cartaisy/cartaisy.entitlements` currently contains only `aps-environment` and does not include `com.apple.developer.in-app-payments`.

The Stripe publishable key can be tenant-specific and can safely come from backend config if the app initializes payment UI after config load. The Apple Pay merchant identifier is more constrained: the JS value must match an entitlement present in the signed iOS binary, so changing it for a branded iOS app requires a native build and Apple developer configuration.

## Store ID Usage

`EXPO_PUBLIC_STORE_ID` is used in:

- `api/apiClient.ts`
- `api/config/axios.ts`

The store ID is sent as `X-Store-ID` on API requests and used as the mobile tenant selector. It is currently build-time/public client config.

This is appropriate for a single-tenant branded binary. It should not be treated as a security boundary by itself, because it is visible to the client. Backend authorization and tenant checks must remain authoritative.

For multi-brand or preview tooling, the selected store could come from backend discovery, deep link, invite code, or authenticated account context. For a production branded store app, a fixed build-time store ID is simpler and safer.

## Build-Time Only

These should remain build-time for branded app binaries:

- iOS bundle identifier.
- Android package/application ID.
- App display name shown by the OS launcher.
- App scheme and native deep link schemes.
- iOS AppIcon and Android launcher/adaptive icons.
- Native splash screen assets and colors.
- Firebase `GoogleService-Info.plist` and `google-services.json`.
- Push notification native configuration, icons, colors, and entitlements.
- Apple Pay merchant entitlement.
- Android Google Pay manifest capability.
- EAS project ownership/project ID.
- Store submission metadata and platform certificates/profiles.
- Native permissions and background modes.

These values are tied to app store identity, OS registration, native resources, signing, capabilities, or third-party native app registrations. They should not be fetched from backend config at runtime.

## Runtime-Configurable Today

Runtime-configurable through existing backend store config:

- Store currency.
- Store timezone.
- Store display name in persisted store config, though current UI usage appears limited.

Runtime-ish but still build-time for installed binaries:

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_STORE_ID`
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_STRIPE_MERCHANT_ID`
- `EXPO_PUBLIC_APP_SCHEME`
- `EXPO_PUBLIC_APP_NAME`
- Shopify public env values

These are read from `process.env` in client code, so they can vary per build environment but are not live backend settings in an installed binary.

## Can Safely Move to Backend Config

Good candidates to move behind `/store/config` or a related public store bootstrap endpoint:

- Store display name used inside app UI and payment labels.
- Store currency and timezone, already implemented.
- Public support/contact links.
- Public policy URLs.
- Feature flags for non-native, non-security UI capabilities.
- Home/content merchandising settings.
- Public brand metadata for in-app surfaces, such as display logo URL, short name, and theme colors, if loaded before affected screens render.
- Stripe publishable key, if each branded app may point to a tenant-specific Stripe account and payment UI waits for config.
- Payment merchant display name and country/currency display values, while keeping native wallet entitlements build-time.
- Non-secret Shopify storefront identifiers, if the mobile app ever needs them directly.

These values can be changed by backend/dashboard without app store resubmission as long as the app treats backend config as untrusted public data, validates formats, and has stable fallbacks.

## Should Not Move to Backend Config

Do not move these to backend runtime config for branded production apps:

- Shopify Admin API access token or any merchant secret.
- Stripe secret key.
- Firebase private/admin credentials.
- Native bundle identifier or Android package name.
- Native app icons, native splash resources, notification icon resources, or notification channel identity.
- Apple Pay merchant entitlement.
- Deep link scheme registration.
- Native permissions, capabilities, and background modes.
- API base URL if the backend host itself is part of the app trust boundary and release process.

## Recommendations

1. Keep native identity and store-distribution boundaries build-time.
2. Treat `EXPO_PUBLIC_*` values as public build-time config, not as secrets and not as live runtime config.
3. Remove any dependency on public Shopify Admin credentials in mobile code in a separate behavior-changing task; all Admin API access should stay server-side.
4. Expand `/store/config` only for safe public branding and settings that affect in-app rendering, such as display name, logo URL, public colors, support links, policy URLs, and feature flags.
5. Keep the fixed `EXPO_PUBLIC_STORE_ID` model for single-tenant branded binaries unless there is a product requirement for runtime tenant switching.
6. Resolve the iOS bundle identifier mismatch between `app.json`, `GoogleService-Info.plist`, and the checked-in Xcode project before production iOS Firebase/push/payment work.
7. Resolve the Apple Pay entitlement mismatch between `app.json` and `ios/cartaisy/cartaisy.entitlements` before relying on Apple Pay in signed iOS builds.
8. If runtime branding is added, keep a branded build-time fallback so first launch, offline launch, failed config fetches, and app review flows remain polished.
