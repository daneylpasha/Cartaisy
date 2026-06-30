# Dynamic App Config Migration Audit

Audit source: GitHub issue #27, "Audit dynamic app config migration for branded builds".

This is a documentation-only audit. It does not change runtime behavior, native identifiers, signing, store configuration, checkout, payments, backend code, or API contracts.

## Current State

The app still uses a static `app.json`; there is no checked-in `app.config.ts` or `app.config.js`. Branded build identity is therefore split across Expo config, generated native projects, Firebase files, JavaScript `EXPO_PUBLIC_*` values, and bundled assets.

## Hardcoded Values

### Expo config

`app.json` hardcodes:

| Field | Value |
| --- | --- |
| `expo.name` | `cartaisy` |
| `expo.slug` | `cartaisy` |
| `expo.scheme` | `cartaisy` |
| `expo.icon` | `./assets/images/cartaisy-color-logo.png` |
| `expo.notification.icon` | `./assets/images/cartaisy-color-logo.png` |
| `expo.notification.color` | `#8B5CF6` |
| `expo.ios.bundleIdentifier` | `com.rendernext.cartaisy` |
| `expo.ios.entitlements.com.apple.developer.in-app-payments` | `merchant.com.cartaisy` |
| `expo.android.package` | `com.rendernext.cartaisy` |
| `expo.android.adaptiveIcon.foregroundImage` | `./assets/images/adaptive-icon.png` |
| `expo.android.adaptiveIcon.backgroundColor` | `#ffffff` |
| `expo.android.googleServicesFile` | `./google-services.json` |
| `@stripe/stripe-react-native` `merchantIdentifier` | `merchant.com.cartaisy` |
| `expo.owner` | `rendernext` |
| `expo.extra.eas.projectId` | `eabf3411-284b-4bd8-88eb-8d89a8a4ee14` |

`.env.example` documents `EXPO_PUBLIC_APP_NAME`, `EXPO_PUBLIC_APP_SCHEME`, `EXPO_PUBLIC_IOS_BUNDLE_ID`, and `EXPO_PUBLIC_ANDROID_PACKAGE`, but those values do not currently drive `app.json`.

### iOS native project

The checked-in iOS project hardcodes or derives:

| File | Field | Value |
| --- | --- | --- |
| `ios/cartaisy/Info.plist` | `CFBundleDisplayName` | `cartaisy` |
| `ios/cartaisy/Info.plist` | `CFBundleURLSchemes` | `cartaisy`, `com.cartaisy.app`, `exp+cartaisy` |
| `ios/cartaisy.xcodeproj/project.pbxproj` | `PRODUCT_BUNDLE_IDENTIFIER` | `com.cartaisy.app` |
| `ios/cartaisy.xcodeproj/project.pbxproj` | `PRODUCT_NAME` | `cartaisy` |
| `ios/cartaisy/cartaisy.entitlements` | `aps-environment` | `development` |

The checked-in entitlement file does not include `com.apple.developer.in-app-payments`, even though `app.json` declares `merchant.com.cartaisy`.

### Android native project

The checked-in Android project hardcodes:

| File | Field | Value |
| --- | --- | --- |
| `android/app/build.gradle` | `namespace` | `com.rendernext.cartaisy` |
| `android/app/build.gradle` | `applicationId` | `com.rendernext.cartaisy` |
| `android/app/src/main/res/values/strings.xml` | `app_name` | `cartaisy` |
| `android/app/src/main/AndroidManifest.xml` | deep link schemes | `cartaisy`, `exp+cartaisy` |
| `android/app/src/main/AndroidManifest.xml` | Google Pay metadata | enabled |

### Firebase files

| File | App identity value |
| --- | --- |
| `GoogleService-Info.plist` | `BUNDLE_ID` is `com.rendernext.cartaisy` |
| `google-services.json` | Android package is `com.rendernext.cartaisy` |
| `android/app/google-services.json` | Android package is `com.rendernext.cartaisy` |

The root `google-services.json` and `android/app/google-services.json` currently contain the same Android Firebase app registration.

## Mismatch Risks

Confirmed risks:

- iOS bundle identifier mismatch: `app.json` and `GoogleService-Info.plist` use `com.rendernext.cartaisy`, but the checked-in Xcode project uses `com.cartaisy.app`.
- iOS URL scheme mismatch: `app.json` declares `cartaisy`, while `Info.plist` also includes `com.cartaisy.app`. This may preserve an older identifier and should be deliberately confirmed or removed during migration.
- Apple Pay entitlement mismatch: `app.json` and the Stripe plugin declare `merchant.com.cartaisy`, but `ios/cartaisy/cartaisy.entitlements` does not include the Apple Pay merchant entitlement.
- iOS push environment hardcoded to development: `ios/cartaisy/cartaisy.entitlements` sets `aps-environment` to `development`. TestFlight and App Store distribution builds require `production` (or the auto-managed value produced by `expo prebuild`); shipping the `development` value silently breaks push notifications in distribution builds.
- Static config mismatch: `.env.example` documents app identity variables, but the static `app.json` ignores them, so branded builds can easily diverge from documented values.
- Firebase iOS mismatch: `GoogleService-Info.plist` is registered for `com.rendernext.cartaisy`; builds using the checked-in Xcode bundle ID `com.cartaisy.app` would not match that Firebase iOS app.

Ruled out in the current committed files:

- Android package mismatch is not present. `app.json`, `android/app/build.gradle`, `google-services.json`, and `android/app/google-services.json` all use `com.rendernext.cartaisy`.
- The static Expo config does not introduce direct Shopify API calls or Shopify token exposure by itself.

## Recommended `app.config.ts` Shape

Implement the migration as a dedicated follow-up after choosing the source of truth for branded build inputs. Keep the first implementation limited to build-time identity plumbing and do not change runtime API behavior.

Recommended shape:

```ts
import type { ExpoConfig } from "expo/config";

const required = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required app config env var: ${key}`);
  return value;
};

const config: ExpoConfig = {
  name: required("APP_NAME"),
  slug: required("APP_SLUG"),
  scheme: required("APP_SCHEME"),
  version: process.env.APP_VERSION ?? "1.0.0",
  orientation: "portrait",
  icon: required("APP_ICON_PATH"),
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  notification: {
    icon: required("APP_NOTIFICATION_ICON_PATH"),
    color: process.env.APP_NOTIFICATION_COLOR ?? "#8B5CF6",
    androidMode: "default",
    androidCollapsedTitle: "{{unread_count}} new notifications",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: required("IOS_BUNDLE_IDENTIFIER"),
    googleServicesFile: process.env.IOS_GOOGLE_SERVICES_FILE,
    infoPlist: {
      UIBackgroundModes: ["remote-notification"],
    },
    entitlements: {
      "com.apple.developer.in-app-payments": [
        required("IOS_APPLE_PAY_MERCHANT_ID"),
      ],
    },
  },
  android: {
    package: required("ANDROID_PACKAGE"),
    googleServicesFile: required("ANDROID_GOOGLE_SERVICES_FILE"),
    adaptiveIcon: {
      foregroundImage: required("ANDROID_ADAPTIVE_ICON_PATH"),
      backgroundColor: process.env.ANDROID_ADAPTIVE_ICON_BACKGROUND ?? "#ffffff",
    },
    edgeToEdgeEnabled: true,
    permissions: ["NOTIFICATIONS", "VIBRATE"],
  },
  plugins: [
    [
      "expo-splash-screen",
      {
        backgroundColor: process.env.SPLASH_BACKGROUND_COLOR ?? "#ffffff",
        android: {
          backgroundColor: process.env.SPLASH_BACKGROUND_COLOR ?? "#ffffff",
        },
      },
    ],
    "expo-router",
    "expo-mail-composer",
    [
      "expo-notifications",
      {
        icon: required("APP_NOTIFICATION_ICON_PATH"),
        color: process.env.APP_NOTIFICATION_COLOR ?? "#8B5CF6",
        sounds: [],
      },
    ],
    "@react-native-firebase/app",
    "@react-native-firebase/messaging",
    [
      "@stripe/stripe-react-native",
      {
        merchantIdentifier: required("IOS_APPLE_PAY_MERCHANT_ID"),
        enableGooglePay: true,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: required("EAS_PROJECT_ID"),
    },
    router: {},
  },
  owner: process.env.EXPO_OWNER ?? "rendernext",
};

export default config;
```

Do not put private secrets in `app.config.ts`, `extra`, or any `EXPO_PUBLIC_*` value. Only expose values to client JavaScript when the app already needs them at runtime and they are safe to ship publicly.

## Required Build-Time Environment Variables

Prefer non-`EXPO_PUBLIC_*` names for native build identity so they are consumed by `app.config.ts` without being automatically exposed to JavaScript:

| Variable | Purpose |
| --- | --- |
| `APP_NAME` | Expo/iOS/Android display name for the branded build |
| `APP_SLUG` | Expo slug |
| `APP_SCHEME` | Native deep link scheme |
| `APP_VERSION` | Optional marketing version; falls back to `1.0.0` when unset |
| `APP_ICON_PATH` | Expo app icon asset |
| `APP_NOTIFICATION_ICON_PATH` | Notification icon asset |
| `APP_NOTIFICATION_COLOR` | Notification accent color |
| `SPLASH_BACKGROUND_COLOR` | Native splash background |
| `IOS_BUNDLE_IDENTIFIER` | iOS bundle identifier |
| `IOS_GOOGLE_SERVICES_FILE` | Branded iOS Firebase plist path |
| `IOS_APPLE_PAY_MERCHANT_ID` | Apple Pay merchant identifier, matching signed entitlements |
| `ANDROID_PACKAGE` | Android package/application ID |
| `ANDROID_GOOGLE_SERVICES_FILE` | Branded Android Firebase JSON path |
| `ANDROID_ADAPTIVE_ICON_PATH` | Android adaptive icon foreground |
| `ANDROID_ADAPTIVE_ICON_BACKGROUND` | Android adaptive icon background |
| `EAS_PROJECT_ID` | EAS project ID for the branded app |
| `EXPO_OWNER` | Expo account owner when different from the default |

Keep existing public JavaScript values separate:

| Variable | Boundary |
| --- | --- |
| `EXPO_PUBLIC_API_BASE_URL` | Public backend URL used by mobile API clients |
| `EXPO_PUBLIC_STORE_ID` | Public store identifier sent to the Cartaisy backend |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public Stripe publishable key |
| `EXPO_PUBLIC_STRIPE_MERCHANT_ID` | Public JS value that must match the native Apple Pay merchant ID |
| `EXPO_PUBLIC_APP_SCHEME` | Public JS value currently used by `StripeProvider` URL scheme |
| `EXPO_PUBLIC_APP_NAME` | Public JS value currently used for wallet payment labels |

Do not add Shopify Admin tokens, private API keys, signing credentials, store passwords, Stripe secret keys, Firebase private credentials, or merchant secrets to any mobile build env file.

## Manual Verification Steps

Before merging a future `app.config.ts` implementation:

1. Run `npx expo config --type public` with a sample branded env file and confirm app name, slug, scheme, icons, notification color, bundle ID, Android package, Firebase file paths, Stripe merchant identifier, EAS project ID, and owner.
2. Run `npx expo prebuild --clean --no-install` in a disposable worktree and confirm generated iOS and Android identifiers match the same branded env inputs.
3. Confirm `ios/*/Info.plist` URL schemes contain the intended app scheme and no stale bundle ID scheme unless deliberately required for backwards compatibility.
4. Confirm generated iOS entitlements include the Apple Pay merchant ID only when Apple Pay is in scope for the branded build.
5. Confirm the iOS `aps-environment` entitlement resolves to `production` for TestFlight and App Store builds, not the checked-in `development` value.
6. Confirm the iOS Firebase plist `BUNDLE_ID` matches the generated iOS bundle identifier.
7. Confirm Android Gradle `namespace` and `applicationId` match the Expo Android package.
8. Confirm Android Firebase `package_name` matches the Expo Android package.
9. Confirm launcher icons, adaptive icon, notification icon, splash background, and app display name render correctly in simulator/emulator builds.
10. Confirm no `EXPO_PUBLIC_*` value contains merchant secrets or direct Shopify credentials.
11. Confirm mobile catalog and store data still flow through the Cartaisy backend rather than direct Shopify API calls.

## Follow-Up Implementation Issue

Create a follow-up issue to implement the migration once the branded build source of truth is approved:

Title: `Implement dynamic app.config.ts for branded mobile builds`

Scope:

- Replace `app.json` with `app.config.ts`.
- Load only safe build-time identity values from non-public environment variables.
- Keep public runtime JavaScript values under explicit `EXPO_PUBLIC_*` names.
- Add validation that fails fast when required identity values are missing or malformed.
- Align generated iOS bundle ID, Android package, Firebase file paths, scheme, app display name, icons, notification config, and Stripe merchant identifier.
- Preserve existing mobile runtime behavior and Cartaisy backend API usage.
- Do not change checkout, auth refresh, backend code, signing certificates, App Store/Play Store settings, or payment behavior.
