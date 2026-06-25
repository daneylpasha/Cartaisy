# Mobile Branded Build Configuration Checklist

Use this checklist when preparing a merchant-specific Cartaisy mobile app build. It separates values that must be baked into the native build from values that should continue to come from backend runtime configuration.

This is a release checklist only. Do not change application behavior, API response shapes, checkout, auth, orders, cart mutations, dashboard logic, or credential handling as part of completing it.

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

### Public Build Environment Values

- [ ] `EXPO_PUBLIC_API_BASE_URL`
- [ ] `EXPO_PUBLIC_STORE_ID`
- [ ] `EXPO_PUBLIC_APP_NAME`
- [ ] `EXPO_PUBLIC_APP_SCHEME`
- [ ] `EXPO_PUBLIC_IOS_BUNDLE_ID`
- [ ] `EXPO_PUBLIC_ANDROID_PACKAGE`

Treat all `EXPO_PUBLIC_*` values as public. Do not put Shopify Admin tokens, Stripe secret keys, Firebase private credentials, or any merchant secret in mobile build configuration.

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
- [ ] Build-time public environment values are set for the target environment.
- [ ] Runtime backend configuration is present for the merchant store.
- [ ] Backend tenant-scoped Shopify Storefront access is confirmed.
- [ ] Validation results are attached to the release ticket or pull request.
