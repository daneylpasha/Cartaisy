import { Router } from "expo-router";
import {
  BETA_CHECKOUT_ENTRY_ROUTE,
  isLegacyNativeCheckoutEnabled,
} from "@/utils/checkoutFlowGate";

/**
 * Deep link types supported by the app
 */
export type DeepLinkType =
  | "product"
  | "collection"
  | "cart"
  | "order"
  | "orders"
  | "wishlist"
  | "profile"
  | "checkout"
  | "search"
  | "screen"
  | "home"
  | "reset-password";

/**
 * Deep link data structure from notification payload
 */
export interface DeepLinkData {
  type: DeepLinkType;
  id?: string; // Product ID, Collection ID, Order ID, etc.
  screen?: string; // Custom screen path for generic navigation
  params?: Record<string, string>; // Additional query params
}

/**
 * Notification data structure with deep link
 */
export interface NotificationDeepLinkPayload {
  notificationId?: string;
  deepLink?: DeepLinkData | string; // Can be object or JSON string
  // Legacy support for simple link format
  link?: string;
  type?: string;
  action?: string;
  productId?: string;
  collectionId?: string;
  orderId?: string;
}

/**
 * Parse deep link data from notification payload
 * Handles both structured deepLink object and legacy formats
 */
export function parseDeepLink(data: NotificationDeepLinkPayload): DeepLinkData | null {
  // Handle structured deepLink object
  if (data.deepLink) {
    if (typeof data.deepLink === "string") {
      try {
        return JSON.parse(data.deepLink) as DeepLinkData;
      } catch {
        // If it's a plain URL string, treat as screen type
        return { type: "screen", screen: data.deepLink };
      }
    }
    return data.deepLink;
  }

  // Handle legacy link format (plain URL)
  if (data.link) {
    return { type: "screen", screen: data.link };
  }

  // Handle legacy format with type and IDs at root level
  if (data.type) {
    const legacyType = data.type.toLowerCase() as DeepLinkType;
    return {
      type: legacyType,
      id: data.productId || data.collectionId || data.orderId,
    };
  }

  // Check for individual ID fields without type
  if (data.productId) {
    return { type: "product", id: data.productId };
  }
  if (data.collectionId) {
    return { type: "collection", id: data.collectionId };
  }
  if (data.orderId) {
    return { type: "order", id: data.orderId };
  }

  return null;
}

/**
 * Handle deep link navigation
 * Routes to the appropriate screen based on deep link data
 */
export function handleDeepLink(
  deepLink: DeepLinkData,
  router: Router,
  options?: {
    replace?: boolean; // Use replace instead of push
    delay?: number; // Delay before navigation (for cold start)
  }
): void {
  const { replace = false, delay = 0 } = options || {};

  const navigate = () => {
    const navigationMethod = replace ? router.replace : router.push;

    console.log("[DeepLink] Navigating to:", deepLink.type, deepLink.id || deepLink.screen || "");

    switch (deepLink.type) {
      case "product":
        if (deepLink.id) {
          navigationMethod({
            pathname: "/products/[id]",
            params: { id: deepLink.id, ...deepLink.params },
          });
        } else {
          console.warn("[DeepLink] Product deep link missing ID");
          navigationMethod("/(tabs)");
        }
        break;

      case "collection":
        if (deepLink.id) {
          navigationMethod({
            pathname: "/products",
            params: { collectionId: deepLink.id, ...deepLink.params },
          });
        } else {
          console.warn("[DeepLink] Collection deep link missing ID");
          navigationMethod("/(tabs)");
        }
        break;

      case "cart":
        navigationMethod("/(tabs)/cart");
        break;

      case "order":
        if (deepLink.id) {
          navigationMethod({
            pathname: "/ordersDetails",
            params: { orderId: deepLink.id, ...deepLink.params },
          });
        } else {
          // No ID, go to orders list
          navigationMethod("/orders");
        }
        break;

      case "orders":
        navigationMethod("/orders");
        break;

      case "wishlist":
        navigationMethod("/(tabs)/wishlist");
        break;

      case "profile":
        navigationMethod("/(tabs)/profile");
        break;

      case "checkout":
        navigationMethod(
          isLegacyNativeCheckoutEnabled()
            ? "/checkout"
            : BETA_CHECKOUT_ENTRY_ROUTE
        );
        break;

      case "search":
        navigationMethod({
          pathname: "/search",
          params: deepLink.params,
        });
        break;

      case "screen":
        if (deepLink.screen) {
          try {
            // Validate the screen path starts with /
            const screenPath = deepLink.screen.startsWith("/")
              ? deepLink.screen
              : `/${deepLink.screen}`;
            navigationMethod(screenPath as any);
          } catch (error) {
            console.error("[DeepLink] Invalid screen path:", deepLink.screen, error);
            navigationMethod("/(tabs)");
          }
        } else {
          console.warn("[DeepLink] Screen deep link missing path");
          navigationMethod("/(tabs)");
        }
        break;

      case "reset-password":
        // Handle password reset deep link with token
        if (deepLink.params?.token) {
          navigationMethod({
            pathname: "/newPassword",
            params: { token: deepLink.params.token, flow: "reset" },
          });
        } else {
          console.warn("[DeepLink] Reset password deep link missing token");
          navigationMethod("/(auth)/login");
        }
        break;

      case "home":
      default:
        navigationMethod("/(tabs)");
        break;
    }
  };

  if (delay > 0) {
    setTimeout(navigate, delay);
  } else {
    navigate();
  }
}

/**
 * Handle deep link from notification data
 * Combines parsing and navigation
 */
export function handleNotificationDeepLink(
  notificationData: NotificationDeepLinkPayload | undefined,
  router: Router,
  options?: {
    replace?: boolean;
    delay?: number;
  }
): boolean {
  if (!notificationData) {
    console.log("[DeepLink] No notification data provided");
    return false;
  }

  const deepLink = parseDeepLink(notificationData);

  if (!deepLink) {
    console.log("[DeepLink] No deep link found in notification data");
    return false;
  }

  console.log("[DeepLink] Parsed deep link:", JSON.stringify(deepLink));
  handleDeepLink(deepLink, router, options);
  return true;
}

/**
 * Check if notification data contains a valid deep link
 */
export function hasDeepLink(notificationData: NotificationDeepLinkPayload | undefined): boolean {
  if (!notificationData) return false;
  return parseDeepLink(notificationData) !== null;
}

export default {
  parseDeepLink,
  handleDeepLink,
  handleNotificationDeepLink,
  hasDeepLink,
};
