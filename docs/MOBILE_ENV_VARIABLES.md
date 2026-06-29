# Mobile Environment Variables

Cartaisy mobile apps are branded builds for individual Shopify merchants. Any environment variable prefixed with `EXPO_PUBLIC_` is bundled into the mobile JavaScript that ships to devices, so these values must be treated as public build-time configuration, not secrets.

Use mobile environment variables only for values that are safe for customers, app reviewers, or reverse engineers to see. Keep private credentials and merchant secrets on the backend.

## Safe Public Build Variables

These values may be included in branded mobile build configuration when they contain only public, non-sensitive data.

| Variable | Purpose | Timing |
| --- | --- | --- |
| `EXPO_PUBLIC_API_BASE_URL` | Public URL for the Cartaisy backend API used by the app. | Build-time value for the shipped app bundle. |
| `EXPO_PUBLIC_STORE_ID` | Store identifier sent to the backend so requests are scoped to the branded merchant build. | Build-time value for the shipped app bundle. |
| `EXPO_PUBLIC_APP_VARIANT` | Public build variant name, if used by release tooling to distinguish merchant, staging, preview, or production builds. | Build-time value for the shipped app bundle. |
| `EXPO_PUBLIC_APP_NAME` | Public app or merchant display name used in supported client-side labels. | Build-time value for the shipped app bundle. |
| `EXPO_PUBLIC_APP_SCHEME` | Public deep-link URL scheme used by client integrations that read it from JavaScript. | Build-time value for the shipped app bundle. |
| `EXPO_PUBLIC_IOS_BUNDLE_ID` | Public iOS bundle identifier for build/release tracking when used by build tooling. | Build-time value; currently documented for branded build setup. |
| `EXPO_PUBLIC_ANDROID_PACKAGE` | Public Android application ID for build/release tracking when used by build tooling. | Build-time value; currently documented for branded build setup. |
| `EXPO_PUBLIC_SHOPIFY_STORE_URL` | Public Shopify storefront domain only, if a build path still needs to identify the storefront from client code. | Build-time public value; does not authorize Shopify access. |
| `EXPO_PUBLIC_SHOPIFY_API_VERSION` | Public Shopify API version string only, if used by client-side Shopify helpers. | Build-time public value; does not authorize Shopify access. |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key, if the branded build uses client-side Stripe initialization. | Build-time public value; tenant-specific but not secret. |
| `EXPO_PUBLIC_STRIPE_MERCHANT_ID` | Apple Pay merchant identifier, if wallet payments are configured for the branded build. | Build-time public value that must match native payment configuration. |

If a value would be unsafe to paste into a public issue or support ticket, it is unsafe for an `EXPO_PUBLIC_*` variable.

## Forbidden Mobile Variables

Never include private credentials, access tokens, or backend secrets in mobile build configuration, even if the variable name starts with `EXPO_PUBLIC_`.

Forbidden examples include:

- Shopify Admin API access tokens.
- Shopify private app tokens or custom app secrets.
- Shopify Storefront tokens that are not explicitly approved as public client tokens.
- `EXPO_PUBLIC_SHOPIFY_ACCESS_TOKEN` when it contains any merchant Admin token, private token, or secret Storefront credential.
- Stripe secret keys, webhook secrets, restricted keys, or account-level credentials.
- JWT signing secrets, auth refresh secrets, session secrets, or password reset secrets.
- Database URLs, database passwords, Redis URLs, or queue credentials.
- Backend service API keys, internal admin keys, or tenant-isolation secrets.
- Firebase private keys, service account JSON, or private push notification credentials.
- Merchant-specific credentials that grant write, admin, checkout, order, customer, or payment access.

Do not expose Shopify Admin credentials to the mobile app. Mobile requests for Shopify-backed data should go through the backend so the backend can use store-specific credentials and tenant-scoped authorization.

## Build-Time vs Runtime Values

`EXPO_PUBLIC_*` values are build-time inputs for the JavaScript bundle. Changing them requires a new build or republished JavaScript bundle, depending on the release path. They are appropriate for stable public identifiers such as API base URL, store ID, app variant/name, URL scheme, and public publishable payment keys.

Runtime or backend-driven values should be loaded from tenant-scoped backend responses instead of mobile environment variables. Examples include:

- Storefront content and product/catalog data.
- Merchant settings that may change after the app is released.
- Feature flags or availability rules.
- Branding metadata loaded through supported backend configuration.
- Shopify credentials, payment secrets, and any private tenant configuration.

When in doubt, keep the value out of the mobile build and serve it through a backend endpoint that scopes every request to the correct store.
