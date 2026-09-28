/**
 * Fail-closed belt for leftover native-checkout entry points.
 *
 * Shopify-hosted handoff is the only shopper checkout path. This module
 * does not read environment variables and does not expose a switch that
 * can mount Stripe card collection, Platform Pay, or in-app payment
 * confirmation in a SaaS or production build.
 */
export const BETA_CHECKOUT_ENTRY_ROUTE = "/(tabs)/cart" as const;

export const legacyNativeCheckoutDisabledMessage =
  "Checkout starts from the cart with Shopify-hosted checkout.";

/** Always false. Not an environment flag, and not a way to remount Stripe. */
export const isLegacyNativeCheckoutEnabled = (): false => false;

const LEGACY_PAYMENT_SCREENS = [
  "/checkout",
  "/addNewCardDetails",
  "/paymentMethod",
  "/order-success",
] as const;

export function isLegacyPaymentScreen(screenPath: string): boolean {
  const withSlash = screenPath.startsWith("/") ? screenPath : `/${screenPath}`;
  const pathOnly = withSlash.split("?")[0].replace(/\/+$/, "") || "/";
  return LEGACY_PAYMENT_SCREENS.some(
    (legacyPath) =>
      pathOnly === legacyPath || pathOnly.startsWith(`${legacyPath}/`)
  );
}
