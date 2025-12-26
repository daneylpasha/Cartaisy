import { axiosInstance } from "../apiClient";

/**
 * Save Shopify cartId to customer profile for persistence across sessions
 * Called after cart creation/update when user is authenticated
 * This enables abandoned cart notifications with fresh cart data
 */
export const saveCartToProfile = async (cartId: string): Promise<void> => {
  console.log("[CartAPI] Syncing cart to backend:", cartId);
  try {
    // POST /cart/saved with cartId in body for abandoned cart tracking
    const response = await axiosInstance.post('/cart/saved', { cartId });
    console.log("[CartAPI] Cart synced successfully:", response?.data);
  } catch (error: any) {
    // Don't throw - this is a background operation
    // Cart will still work locally, backend just won't have latest data
    console.warn("[CartAPI] Failed to sync cart:", error?.response?.data?.message || error?.message);
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
