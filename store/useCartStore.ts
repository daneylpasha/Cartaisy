import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/utils/storage';

export interface CartItem {
  lineItemId?: string; // Cart line item ID from Shopify (needed for updates/deletes)
  productId: string;
  variantId: string;
  merchandiseId: string; // Same as variantId (Shopify term)
  title: string;
  variantTitle: string;
  image: string | null;
  price: number;
  compareAtPrice?: number | null;
  currency: string;
  quantity: number;
  quantityAvailable: number;
  selectedOptions: Array<{ name: string; value: string }>;
  brandName?: string; // Brand name from product metafields
  metafields?: Array<{
    key: string;
    value: string;
    namespace?: string;
    type?: string;
  }>;
}

interface CartState {
  cartId: string | null;
  items: CartItem[];

  // Actions
  setCartId: (cartId: string | null) => void;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  syncWithApiResponse: (cartData: { cartId: string; items: CartItem[] }) => void;

  // Getters
  getItem: (variantId: string) => CartItem | undefined;
  getTotalQuantity: () => number;
  getTotalPrice: () => number;
  isInCart: (variantId: string) => boolean;
}

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartId: null,
      items: [],

      setCartId: (cartId) =>
        set({
          cartId,
        }),

      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.variantId === item.variantId
          );

          if (existingItem) {
            // Update quantity and merge new data (like brandName) if item already exists
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? {
                      ...i,
                      ...item, // Merge all new item data
                      quantity: i.quantity + item.quantity, // But keep accumulated quantity
                      lineItemId: i.lineItemId, // Preserve line item ID
                    }
                  : i
              ),
            };
          }

          // Add new item
          return {
            items: [...state.items, item],
          };
        }),

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        })),

      updateQuantity: (variantId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            return {
              items: state.items.filter((item) => item.variantId !== variantId),
            };
          }

          return {
            items: state.items.map((item) =>
              item.variantId === variantId ? { ...item, quantity } : item
            ),
          };
        }),

      clearCart: () =>
        set({
          cartId: null,
          items: [],
        }),

      syncWithApiResponse: (cartData) => {
        console.log('[Store] syncWithApiResponse called with:', {
          itemsCount: cartData.items.length,
          firstItem: cartData.items[0],
          hasMetafields: !!cartData.items[0]?.metafields,
          metafields: cartData.items[0]?.metafields,
        });

        set({
          cartId: cartData.cartId,
          items: cartData.items,
        });
      },

      getItem: (variantId) => {
        return get().items.find((item) => item.variantId === variantId);
      },

      getTotalQuantity: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      isInCart: (variantId) => {
        return get().items.some((item) => item.variantId === variantId);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

export default useCartStore;
