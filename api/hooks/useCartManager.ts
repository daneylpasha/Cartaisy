import { useState } from 'react';
import { useCreateCart, useAddItems, getCart, useUpdateItemQuantity, useRemoveItem } from '../generated/cart/cart';
import useCartStore, { CartItem } from '@/store/useCartStore';
import useAuthStore from '@/store/useAuthStore';
import { saveCartToProfile, clearSavedCart } from '../endpoints/cart';
import type { CartLineItem } from '../generated/cartaisyAPI.schemas';
import { getCatalogUnavailableMessage } from '@/utils/catalogUnavailableError';

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
  syncCart: () => Promise<boolean>;
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
  const convertApiItemToCartItem = (apiItem: CartLineItem): CartItem => {
    return {
      lineItemId: apiItem.id,
      productId: apiItem.productId,
      variantId: apiItem.merchandiseId,
      merchandiseId: apiItem.merchandiseId,
      title: apiItem.title,
      variantTitle: apiItem.variantTitle,
      image: apiItem.image,
      price: apiItem.price,
      compareAtPrice: apiItem.compareAtPrice,
      currency: 'USD',
      quantity: apiItem.quantity,
      quantityAvailable: apiItem.quantityAvailable,
      selectedOptions: [],
      metafields: apiItem.metafields, // Include metafields from API response
    };
  };

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
          needsRecovery = true;
          currentCartId = null;
        }
      }

      // Step 2: Create new cart or recover
      if (!currentCartId || needsRecovery) {
        // Prepare items: all existing items from Zustand + new item
        const itemsToAdd = needsRecovery
          ? [...items.map(convertToCartItemInput), convertToCartItemInput(newItem)]
          : [convertToCartItemInput(newItem)];

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

        // Save cartId to customer profile (if logged in) for persistence across sessions
        const token = useAuthStore.getState().token;
        if (token && createResponse.data.cartId) {
          // Fire and forget - don't await, don't block cart operations
          saveCartToProfile(createResponse.data.cartId);
        }
      } else {
        // Step 3: Add item to existing valid cart
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

        // Sync cart to backend for abandoned cart tracking
        const token = useAuthStore.getState().token;
        if (token && addResponse.data.cartId) {
          saveCartToProfile(addResponse.data.cartId);
        }
      }

    } catch (err: any) {
      if (__DEV__) {
        console.log('[useCartManager] Add to cart error:', err?.response?.data || err?.message);
      }
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

      // Sync cart to backend for abandoned cart tracking
      const token = useAuthStore.getState().token;
      if (token && updateResponse.data.cartId) {
        saveCartToProfile(updateResponse.data.cartId);
      }
    } catch (err: any) {
      if (__DEV__) {
        console.log('[useCartManager] Update quantity error:', err?.response?.data || err?.message);
      }
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

      // Sync cart to backend for abandoned cart tracking
      const token = useAuthStore.getState().token;
      if (token) {
        if (convertedItems.length === 0) {
          // Cart is now empty - clear saved cart from backend
          clearSavedCart();
        } else if (removeResponse.data.cartId) {
          // Cart still has items - sync updated cart
          saveCartToProfile(removeResponse.data.cartId);
        }
      }
    } catch (err: any) {
      if (__DEV__) {
        console.log('[useCartManager] Remove item error:', err?.response?.data || err?.message);
      }
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
  const syncCart = async (): Promise<boolean> => {
    if (!cartId) {
      return true;
    }

    try {
      const cartResponse = await getCart(encodeURIComponent(cartId));

      if (!cartResponse?.success) {
        return false;
      }

      // Convert API items to Zustand format
      const convertedItems = cartResponse.data.items.map(convertApiItemToCartItem);

      // Update Zustand with synced cart data
      syncWithApiResponse({
        cartId: cartResponse.data.cartId,
        items: convertedItems,
      });

      setError(null);
      return true;
    } catch (err: any) {
      if (__DEV__) {
        console.log('[useCartManager] Cart sync error:', err?.response?.data || err?.message);
      }
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to sync cart';
      setError(errorMessage);

      if (getCatalogUnavailableMessage(err)) {
        throw err;
      }

      return false;
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
