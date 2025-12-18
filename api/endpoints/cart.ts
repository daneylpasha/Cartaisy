import { axiosInstance } from "../apiClient";

/**
 * Save Shopify cartId to customer profile for persistence across sessions
 * Called after cart creation when user is authenticated
 */
export const saveCartToProfile = async (cartId: string): Promise<void> => {
  console.log("[DEBUG] saveCartToProfile called with:", cartId);
  try {
    const encodedCartId = encodeURIComponent(cartId);
    console.log("[DEBUG] Making POST to:", `/cart/${encodedCartId}/save`);
    const response = await axiosInstance.post(`/cart/${encodedCartId}/save`);
    console.log("[DEBUG] saveCartToProfile response:", response?.data);
    console.log("[CartAPI] Cart saved to profile:", cartId);
  } catch (error: any) {
    // Don't throw - this is a background operation
    // Cart will still work locally, just won't persist across logout/login
    console.error("[DEBUG] saveCartToProfile error:", error?.response?.data || error?.message || error);
    console.warn("[CartAPI] Failed to save cart to profile:", error);
  }
};

/**
 * Clear saved cartId from customer profile
 * Called after successful checkout
 */
export const clearSavedCart = async (): Promise<void> => {
  try {
    await axiosInstance.delete("/cart/saved");
    console.log("[CartAPI] Saved cart cleared from profile");
  } catch (error) {
    // Don't throw - background cleanup operation
    console.warn("[CartAPI] Failed to clear saved cart:", error);
  }
};
