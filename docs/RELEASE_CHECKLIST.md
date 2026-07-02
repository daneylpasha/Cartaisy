# Mobile Release Checklist

Use this checklist for mobile release/build readiness. It complements `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`; do not duplicate that checklist in release tickets.

## Current State

Current state: The repo includes a dynamic `app.config.ts` (env-driven app identity with cartaisy defaults; static `app.json` was removed), checked-in iOS and Android native projects, Firebase config files, EAS profiles, Stripe/native payment plugin config, and public mobile environment examples.

Current state: Existing release-oriented docs include `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`, `docs/MOBILE_ENV_VARIABLES.md`, `docs/MOBILE_BRANDING_CONFIG_AUDIT.md`, `docs/DYNAMIC_APP_CONFIG_MIGRATION_AUDIT.md`, and `docs/MOBILE_RUNTIME_BRANDING_CONTRACT.md`.

Current state: Public build-time values such as API URL, store ID, app name/scheme, Stripe publishable key, and native identity placeholders are documented in `.env.example` and `docs/MOBILE_ENV_VARIABLES.md`.

Current state: Existing audits identify native identity and payment/push readiness risks. Verify them before release.

## Target State

Target state: Every branded merchant build should have a completed merchant build record, verified app identity, safe public config, matching native service files, store-scoped backend configuration, validated assets, and documented release validation.

Target state: Release work should preserve the rule that Shopify Admin/private credentials and merchant secrets stay off device and out of `EXPO_PUBLIC_*` values.

Target state: Checkout/payment behavior, native payment capabilities, signing, certificates, app-store metadata, and Firebase/native service config should receive human review before production release.

## Checklist

### Branded Merchant App Build Checks

- Confirm the merchant, store ID, backend API base URL, target environment, target platforms, build owner, and release target.
- Link or complete `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`.
- Confirm the build is for the intended store and backend environment only.
- Confirm backend tenant isolation remains authoritative; mobile store ID is public client configuration.

### App Identity Checks

- Confirm Expo app name, slug, scheme, iOS bundle identifier, Android package/application ID, and app store listing names.
- Run `npx expo config --type public` with the merchant's environment values set and confirm the generated identity matches the intended merchant.
- Confirm checked-in native iOS and Android identifiers match the intended build path.
- Confirm any known mismatches from `docs/MOBILE_BRANDING_CONFIG_AUDIT.md` and `docs/DYNAMIC_APP_CONFIG_MIGRATION_AUDIT.md` are resolved or explicitly accepted for the release.

### Bundle ID / Package Name Checks

- Confirm iOS bundle ID matches Apple developer configuration, Firebase iOS app, push configuration, associated domains, and wallet/payment entitlements.
- Confirm Android package matches Gradle application ID, Firebase Android app, Play Console configuration, deep links, and wallet/payment metadata.

### App Icon / Splash / Assets Checks

- Confirm launcher icons, adaptive icons, notification icons, splash screen assets, in-app logos, and fallback assets are merchant-approved.
- Confirm no assets from another merchant are included.
- Confirm bundled assets still work before runtime config loads.

### API URL / Store ID / Config Checks

- Confirm `EXPO_PUBLIC_API_BASE_URL` points at the intended Cartaisy backend.
- Confirm `EXPO_PUBLIC_STORE_ID` is the intended store ID and is safe to expose publicly.
- Confirm requests include tenant/store identity such as `X-Store-ID`.
- Confirm runtime store config loads expected public fields and falls back safely.

### Firebase / Native Service Config Checks

- Confirm `GoogleService-Info.plist`, `google-services.json`, and any Android app copy match the target bundle ID/package.
- Confirm APNs, FCM, notification permissions, background modes, and notification channels are configured for the target release if push is in scope.
- Confirm Firebase private keys or service account credentials are not committed or bundled.

### Environment Variable Checks

- Confirm every `EXPO_PUBLIC_*` value is safe for customers and app reviewers to inspect.
- Confirm no Shopify Admin token, Shopify Storefront token, backend secret, Stripe secret key, Firebase private credential, database URL, signing secret, or merchant secret is present.
- Confirm mobile still uses the Cartaisy backend for Shopify/catalog/store data unless a dedicated issue explicitly says otherwise.

### Checkout / Payment Checks

- Confirm checkout and payment flows are in scope for the release validation.
- Confirm Stripe publishable key, Apple Pay merchant ID, Google Pay enablement, and native entitlements/capabilities match the signed build.
- Confirm no checkout/payment implementation changes are included unless the release issue explicitly asks for them.
- Confirm human review for checkout/payment changes.

### App Store / Play Store Readiness

- Confirm app names, icons, screenshots, privacy disclosures, permissions, support links, policy links, and merchant metadata are correct.
- Confirm version/build numbers and release notes are set according to project policy.
- Confirm store credentials and signing materials are handled outside the mobile repo according to secure release practice.

### Rollback Notes

- Record the last known good build, release channel/profile, backend environment, and store ID.
- Know whether rollback means app-store phased release halt, previous binary restore, EAS/channel change, backend config rollback, or merchant config rollback.
- Keep checkout/payment and tenant config rollback plans explicit for production releases.

## Known Gaps

Known gap: Dynamic app config is implemented via `app.config.ts`, but merchant-branded build output has not been proven end-to-end. Verify `npx expo config --type public` and EAS build output with per-merchant environment values before release.

Known gap: Runtime branding is documented as a desired contract but not implemented.

Known gap: Existing audits identify iOS bundle identifier, Firebase iOS, Apple Pay entitlement, and push entitlement risks that must be verified before production release.

Known gap: Do not assume this exists unless verified in code, local build output, EAS logs, or app-store configuration.

## Related Docs And Issues

- `docs/MOBILE_BRANDED_BUILD_CHECKLIST.md`
- `docs/MOBILE_ENV_VARIABLES.md`
- `docs/MOBILE_BRANDING_CONFIG_AUDIT.md`
- `docs/DYNAMIC_APP_CONFIG_MIGRATION_AUDIT.md`
- `docs/MOBILE_RUNTIME_BRANDING_CONTRACT.md`
- `.github/pull_request_template.md`
- GitHub issue #40
