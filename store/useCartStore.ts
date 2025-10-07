import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/utils/storage';

export interface CartItem {
  // Product identification
  productId: string;
  variantId: string;

  // Display information
  title: string;
  variantTitle: string;
  image: string;

  // Pricing
  price: number;
  compareAtPrice?: number;
  currency: string;

  // Quantity
  quantity: number;
  quantityAvailable: number;

  // Additional data
  selectedOptions: Array<{ name: string; value: string }>;
}

interface CartState {
  items: CartItem[];

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;

  // Getters
  getItem: (variantId: string) => CartItem | undefined;
  getTotalQuantity: () => number;
  getTotalPrice: () => number;
  isInCart: (variantId: string) => boolean;
}

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.variantId === item.variantId
          );

          if (existingItem) {
            // Update quantity if item already exists
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
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
          items: [],
        }),

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
