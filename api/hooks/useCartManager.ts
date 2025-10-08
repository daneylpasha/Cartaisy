import { useState } from 'react';
import { useCreateCart, useAddItems, getCart, useUpdateItemQuantity, useRemoveItem } from '../generated/cart/cart';
import useCartStore, { CartItem } from '@/store/useCartStore';
import type { CartLineItem } from '../generated/cartaisyAPI.schemas';

interface AddToCartParams {
  productId: string;
  variantId: string;
  merchandiseId: string;
  title: string;
  variantTitle: string;
  image: string | null;
  price: number;
  compareAtPrice?: number | null;
  currency: string;
  quantity: number;
  quantityAvailable: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface UseCartManagerReturn {
  addToCart: (item: AddToCartParams) => Promise<void>;
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
  syncCart: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to manage cart operations with automatic cart validation and recovery
 *
 * Flow:
 * 1. Check if cartId exists in Zustand store
 * 2. If exists, validate it via API
 * 3. If expired/invalid, create new cart with all existing items + new item
 * 4. If valid, add new item to existing cart
 * 5. Only update Zustand on successful API response
 */
export const useCartManager = (): UseCartManagerReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { cartId, items, syncWithApiResponse } = useCartStore();

  const createCartMutation = useCreateCart();
  const addItemsMutation = useAddItems();
  const updateItemQuantityMutation = useUpdateItemQuantity();
  const removeItemMutation = useRemoveItem();

  /**
   * Validate if cartId is still valid by attempting to fetch cart
   */
  const validateCartId = async (cartId: string): Promise<boolean> => {
    try {
      const response = await getCart(encodeURIComponent(cartId));
      return response.success;
    } catch (err) {
      // Cart is expired or invalid
      console.log('[useCartManager] Cart validation failed:', err);
      return false;
    }
  };

  /**
   * Convert numeric variant ID to Shopify GID format
   */
  const toShopifyGid = (variantId: string): string => {
    // If already in GID format, return as is
    if (variantId.startsWith('gid://')) {
      return variantId;
    }
    // Convert numeric ID to Shopify GID format
    return `gid://shopify/ProductVariant/${variantId}`;
  };

  /**
   * Convert Zustand CartItem to API CartItemInput format
   */
  const convertToCartItemInput = (item: CartItem | AddToCartParams) => ({
    merchandiseId: toShopifyGid(item.merchandiseId),
    quantity: item.quantity,
  });

  /**
   * Convert API CartLineItem to Zustand CartItem format
   */
  const convertApiItemToCartItem = (apiItem: CartLineItem): CartItem => ({
    lineItemId: apiItem.id, // Store the line item ID for future updates/deletes
    productId: apiItem.productId,
    variantId: apiItem.merchandiseId, // API uses merchandiseId as variantId
    merchandiseId: apiItem.merchandiseId,
    title: apiItem.title,
    variantTitle: apiItem.variantTitle,
    image: apiItem.image,
    price: apiItem.price,
    compareAtPrice: apiItem.compareAtPrice,
    currency: 'USD', // Default, should come from API
    quantity: apiItem.quantity,
    quantityAvailable: apiItem.quantityAvailable,
    selectedOptions: [], // API doesn't return this, would need to store separately
  });

  /**
   * Main function to add item to cart with validation and recovery
   */
  const addToCart = async (newItem: AddToCartParams): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      let currentCartId = cartId;
      let needsRecovery = false;

      // Step 1: Validate existing cartId if present
      if (currentCartId) {
        const isValid = await validateCartId(currentCartId);

        if (!isValid) {
          console.log('[useCartManager] CartId expired, recovery needed');
          needsRecovery = true;
          currentCartId = null;
        }
      }

      // Step 2: Create new cart or recover
      if (!currentCartId || needsRecovery) {
        console.log('[useCartManager] Creating new cart');

        // Prepare items: all existing items from Zustand + new item
        const itemsToAdd = needsRecovery
          ? [...items.map(convertToCartItemInput), convertToCartItemInput(newItem)]
          : [convertToCartItemInput(newItem)];

        console.log('[useCartManager] Items to add:', JSON.stringify(itemsToAdd, null, 2));

        const createResponse = await createCartMutation.mutateAsync({
          data: {
            items: itemsToAdd,
          },
        });

        if (!createResponse?.success) {
          throw new Error('Failed to create cart');
        }

        // Convert API items to Zustand format
        const convertedItems = createResponse.data.items.map(convertApiItemToCartItem);

        // Update Zustand with new cart data
        syncWithApiResponse({
          cartId: createResponse.data.cartId,
          items: convertedItems,
        });

        console.log('[useCartManager] Cart created successfully:', createResponse.data.cartId);
      } else {
        // Step 3: Add item to existing valid cart
        console.log('[useCartManager] Adding to existing cart:', currentCartId);

        const addResponse = await addItemsMutation.mutateAsync({
          cartId: encodeURIComponent(currentCartId),
          data: {
            items: [convertToCartItemInput(newItem)],
          },
        });

        if (!addResponse?.success) {
          throw new Error('Failed to add item to cart');
        }

        // Convert API items to Zustand format
        const convertedItems = addResponse.data.items.map(convertApiItemToCartItem);

        // Update Zustand with updated cart data
        syncWithApiResponse({
          cartId: addResponse.data.cartId,
          items: convertedItems,
        });

        console.log('[useCartManager] Item added successfully');
      }

    } catch (err: any) {
      console.error('[useCartManager] Error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to add item to cart';
      setError(errorMessage);
      throw err; // Re-throw to let caller handle
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update quantity of an item in the cart
   */
  const updateQuantity = async (lineItemId: string, quantity: number): Promise<void> => {
    if (!cartId) {
      throw new Error('No active cart found');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useCartManager] Updating item quantity:', { lineItemId, quantity });

      const updateResponse = await updateItemQuantityMutation.mutateAsync({
        cartId: encodeURIComponent(cartId),
        lineItemId: encodeURIComponent(lineItemId),
        data: { quantity },
      });

      if (!updateResponse?.success) {
        throw new Error('Failed to update item quantity');
      }

      // Convert API items to Zustand format
      const convertedItems = updateResponse.data.items.map(convertApiItemToCartItem);

      // Update Zustand with updated cart data
      syncWithApiResponse({
        cartId: updateResponse.data.cartId,
        items: convertedItems,
      });

      console.log('[useCartManager] Item quantity updated successfully');
    } catch (err: any) {
      console.error('[useCartManager] Update quantity error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update quantity';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Remove an item from the cart
   */
  const removeItem = async (lineItemId: string): Promise<void> => {
    if (!cartId) {
      throw new Error('No active cart found');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useCartManager] Removing item:', lineItemId);

      const removeResponse = await removeItemMutation.mutateAsync({
        cartId: encodeURIComponent(cartId),
        lineItemId: encodeURIComponent(lineItemId),
      });

      if (!removeResponse?.success) {
        throw new Error('Failed to remove item');
      }

      // Convert API items to Zustand format
      const convertedItems = removeResponse.data.items.map(convertApiItemToCartItem);

      // Update Zustand with updated cart data
      syncWithApiResponse({
        cartId: removeResponse.data.cartId,
        items: convertedItems,
      });

      console.log('[useCartManager] Item removed successfully');
    } catch (err: any) {
      console.error('[useCartManager] Remove item error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to remove item';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sync cart with API to ensure lineItemIds are populated
   * Call this on app load if cartId exists
   */
  const syncCart = async (): Promise<void> => {
    if (!cartId) {
      console.log('[useCartManager] No cartId to sync');
      return;
    }

    try {
      console.log('[useCartManager] Syncing cart with API:', cartId);
      const cartResponse = await getCart(encodeURIComponent(cartId));

      if (!cartResponse?.success) {
        console.log('[useCartManager] Cart sync failed, cart may be expired');
        return;
      }

      // Convert API items to Zustand format
      const convertedItems = cartResponse.data.items.map(convertApiItemToCartItem);

      // Update Zustand with synced cart data
      syncWithApiResponse({
        cartId: cartResponse.data.cartId,
        items: convertedItems,
      });

      console.log('[useCartManager] Cart synced successfully');
    } catch (err: any) {
      console.error('[useCartManager] Cart sync error:', err);
      // Don't throw - this is a background sync operation
    }
  };

  return {
    addToCart,
    updateQuantity,
    removeItem,
    syncCart,
    isLoading,
    error,
  };
};
