# Mobile Runtime Branding Contract

Audit source: GitHub issue #34, "Audit mobile runtime branding contract for theme and logo".

This is a documentation-only audit. It does not change app behavior.

## Summary

The mobile app already loads public store metadata from `GET /store/config`, but the current contract only supports currency, timezone, and store name. Theme colors and Cartaisy logo assets are still bundled with the app through Tamagui tokens and local image assets.

Runtime branding can safely support public in-app display values such as primary color, secondary color, and logo URL as long as the app validates the response, keeps bundled fallbacks, and continues to fetch all catalog/store data through the Cartaisy backend. Native app identity, splash assets, app icons, Firebase files, package names, and checkout/payment capabilities should stay build-time.

## Current Branding Sources

Runtime store config:

- `api/endpoints/storeConfig.ts` fetches `GET /store/config` and returns `currency`, `timezone`, and `name`.
- `components/providers/AppInitializer.tsx` loads store config once after startup and writes it to `useStoreConfigStore`.
- `store/useStoreConfigStore.ts` persists `currency`, `timezone`, and `storeName` with defaults of `USD`, `UTC`, and an empty store name.
- Runtime currency is used by price formatting and commerce screens through `useStoreConfigStore`.

Static theme sources:

- `tamagui/token.ts` defines `PRIMARY_COLOR = "#A82A50"`, derives `primarylight`, and defines `secondary` as `rgba(75, 85, 99, 1)`.
- `tamagui/theme.ts` maps Tamagui light/dark theme `primary` to `tokens.color.primary`.
- `tamagui/config.ts` registers static Tamagui tokens and themes.
- `assets/colors.ts` re-exports static token colors.

Static logo and brand assets:

- `assets/Icons.ts` maps `cartaisyColorlogo` to `assets/images/cartaisy-color-logo.png`.
- `assets/Icons.ts` maps `cartaisyWhitelogo` to `assets/images/cartaisy-white-logo.png`.
- `app/splash.tsx` renders the bundled `cartaisyColorlogo`.
- Auth screens render the bundled `cartaisyColorlogo`.
- `components/organisms/home/HomeHeader.tsx` renders the bundled `cartaisyWhitelogo`.
- `app/(tabs)/profile.tsx` renders the bundled `cartaisyColorlogo`.
- `app/addNewCardDetails.tsx` renders the bundled `cartaisyColorlogo`.
- `components/atoms/AppImage.tsx` can already render remote image URLs via its `source` prop, but no runtime logo field is currently wired into branding surfaces.

Native/build branding sources:

- `app.json` sets Expo icons, notification color, package identifiers, splash plugin background, and native plugin configuration.
- iOS app icon and splash assets live under `ios/cartaisy/Images.xcassets`.
- Android launcher, notification, and splash resources live under `android/app/src/main/res`.

## Build-Time Only Values

These should remain build-time for branded binaries and are out of scope for runtime `/store/config` branding:

- iOS bundle identifier and Android package/application ID.
- Native app name, app scheme, and native deep link registration.
- App Store and Play Store listing metadata.
- iOS AppIcon and Android launcher/adaptive icons.
- Native splash screen assets and splash background color.
- Native notification icon resources, notification channel identity, and notification color.
- Firebase `GoogleService-Info.plist`, `google-services.json`, app IDs, sender IDs, and package/bundle registrations.
- Apple Pay merchant entitlement and native payment capabilities.
- Android Google Pay manifest capability.
- EAS project ownership/project ID, signing certificates, profiles, and store credentials.
- API base URL when it is part of the trusted release environment.
- Shopify Admin tokens, storefront access tokens, private app credentials, Stripe secret keys, Firebase private credentials, and any merchant secret.

## Runtime Branding Candidates

These can safely become runtime values because they are public display metadata and do not grant access to merchant systems:

- `name`: existing public display name for in-app surfaces.
- `branding.shortName`: optional compact display name for constrained UI.
- `branding.logoUrl`: public HTTPS logo URL for light backgrounds.
- `branding.logoDarkUrl`: optional public HTTPS logo URL for dark/colored backgrounds.
- `branding.primaryColor`: public hex color for primary actions, selected states, progress, and accents.
- `branding.secondaryColor`: public hex color for secondary accents or subdued brand UI.
- `branding.updatedAt` or `branding.version`: optional cache-busting metadata.

These values should be treated as untrusted public input. The mobile app should validate supported color formats, require HTTPS for remote assets outside development, enforce expected image dimensions/content type where practical, and fall back to bundled assets when a value is missing or invalid.

Runtime branding should not introduce direct Shopify calls in the mobile app. Catalog, store, and branding data should continue to come from the Cartaisy backend.

## Recommended API Response Shape

Recommended additive shape for `GET /store/config`:

```json
{
  "success": true,
  "data": {
    "name": "Merchant Store",
    "currency": "USD",
    "timezone": "UTC",
    "branding": {
      "primaryColor": "#A82A50",
      "secondaryColor": "#4B5563",
      "logoUrl": "https://cdn.cartaisy.com/stores/store-id/logo.png",
      "logoDarkUrl": "https://cdn.cartaisy.com/stores/store-id/logo-dark.png",
      "updatedAt": "2026-06-30T00:00:00.000Z"
    }
  }
}
```

Contract notes:

- Keep the existing `name`, `currency`, and `timezone` fields stable.
- Add `branding` as an optional object so older backend responses continue to work.
- Use six-digit hex colors initially, such as `#A82A50`, to keep validation and accessibility checks simple.
- Use public CDN HTTPS URLs for logos; do not embed credentials or signed URLs that expose private storage.
- Keep backend tenant scoping authoritative through the existing store context. The mobile app should not choose arbitrary tenant branding by URL.

## Recommended Mobile Fallback Behavior

Before config loads:

- Render with the existing bundled Tamagui colors from `tamagui/token.ts`.
- Render existing bundled Cartaisy logo assets from `assets/Icons.ts`.
- Continue using `USD`, `UTC`, and empty store name defaults from `useStoreConfigStore`.

When config loads successfully:

- Apply runtime colors only after validation.
- Apply runtime logo URLs only after validation.
- Keep current bundled assets visible until a remote logo finishes loading.
- Preserve the last valid persisted branding if a later startup cannot reach the backend.

When config is missing, invalid, or the logo fails to load:

- Fall back to `tokens.color.primary`, `tokens.color.secondary`, `cartaisyColorlogo`, and `cartaisyWhitelogo`.
- Do not block catalog browsing, auth, cart, or checkout on runtime branding.
- Do not show errors to shoppers for branding-only failures.

Suggested accessibility guardrails:

- Require primary color contrast to meet expected button/text usage before applying it to text or filled actions.
- Derive `primarylight` from the validated primary color using the existing `getPrimaryLight` helper.
- If contrast checks fail, keep the bundled primary color and log a development warning only.

## Mobile Files Needing Future Changes

Likely mobile implementation files for a follow-up:

- `api/endpoints/storeConfig.ts`: extend `StoreConfig` with optional `branding`.
- `store/useStoreConfigStore.ts`: persist validated branding fields and expose fallback-aware selectors.
- `components/providers/AppInitializer.tsx`: map backend `branding` into the store after validation.
- `tamagui/token.ts`, `tamagui/theme.ts`, and `tamagui/config.ts`: decide whether dynamic branding is applied through Tamagui theme overrides, a separate branding provider, or component-level selectors.
- `components/atoms/AppImage.tsx`: reuse existing remote image support, but provide a first-class local fallback path for runtime logos.
- `app/splash.tsx`: choose between runtime logo and bundled fallback for the React splash route.
- `components/organisms/home/HomeHeader.tsx`: choose runtime light/dark logo where appropriate.
- `app/(auth)/login.tsx`, `app/(auth)/signUp.tsx`, and `components/organisms/auth/LoginBottomSheet.tsx`: choose runtime logo for auth branding surfaces.
- `app/(tabs)/profile.tsx` and `app/addNewCardDetails.tsx`: choose runtime logo for current in-app logo placements.
- Components that read `tokens.color.primary` directly, such as buttons, loaders, steppers, inputs, calendars, and tab accents: migrate gradually to a runtime-aware brand color source only where the UI contract requires it.

## Backend Requirements

Future backend work should:

- Add optional public `branding` fields to `GET /store/config`.
- Source branding from store-scoped configuration only.
- Validate and normalize hex colors before returning them.
- Return public HTTPS logo URLs only.
- Avoid returning private storage URLs, signed URLs with sensitive query parameters, Shopify Admin tokens, Shopify storefront access tokens, or merchant secrets.
- Keep existing `name`, `currency`, and `timezone` response fields backward-compatible.
- Document cache headers or include `branding.updatedAt` so the mobile app can refresh stale logos safely.

## Follow-Up Implementation Issue

Create a separate implementation issue after this contract is approved.

Suggested title: `Implement runtime mobile branding from /store/config`

Suggested scope:

- Extend `/store/config` with optional public `branding` fields.
- Add mobile validation and fallback handling for runtime primary color, secondary color, and logo URLs.
- Update the focused logo/color surfaces listed above.
- Add tests for config parsing, invalid color fallback, missing logo fallback, and persisted branding behavior.
- Preserve existing behavior when `branding` is absent.
- Do not change checkout/payment flow, auth refresh logic, native app icons, native splash screen, Firebase config, signing, App Store/Play Store config, or backend API response contracts outside the additive `branding` fields.
