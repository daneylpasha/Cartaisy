import { axiosInstance } from "../apiClient";

// Types for the express-served unified cart API.
export interface UnifiedCartItem {
  productId: string;
  variantId?: string;
  merchandiseId?: string;
  title: string;
  variantTitle?: string;
  image?: string | null;
  price: number;
  compareAtPrice?: number;
  currency?: string;
  quantity: number;
  quantityAvailable?: number;
}

export interface UnifiedCart {
  sessionId?: string;
  customerId?: string;
  items: UnifiedCartItem[];
  itemCount: number;
  currency?: string;
  isGuest?: boolean;
  guestCheckoutInfo?: {
    email: string;
    phone: string;
    fullName: string;
  };
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddToCartRequest {
  productId: string;
  variantId?: string;
  merchandiseId: string;
  quantity: number;
  title: string;
  variantTitle?: string;
  image?: string | null;
  price: number;
  compareAtPrice?: number;
  currency?: string;
  quantityAvailable?: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface GuestCheckoutInfoRequest {
  email: string;
  phone: string;
  fullName: string;
}

export interface UnifiedCartResponse {
  status: "success" | "error";
  data: {
    cart: UnifiedCart;
  };
  message?: string;
}

export interface SessionInfoResponse {
  status: "success" | "error";
  data: {
    sessionId: string;
    isGuest: boolean;
    cartItemsCount: number;
    expiresAt?: string;
  };
}

export const getUnifiedCartFromResponse = (
  response: UnifiedCartResponse
): UnifiedCart => response.data.cart;

// Unified Cart API endpoints (work for both guest and authenticated users)
const unifiedCartApi = {
  // Get cart (creates one if doesn't exist)
  getCart: () =>
    axiosInstance.get<UnifiedCartResponse>("/unified-cart"),

  // Add item to cart
  addToCart: (data: AddToCartRequest) =>
    axiosInstance.post<UnifiedCartResponse>("/unified-cart", data),

  // Update item quantity
  updateCartItem: (itemId: string, data: UpdateCartItemRequest) =>
    axiosInstance.patch<UnifiedCartResponse>(`/unified-cart/${itemId}`, data),

  // Remove item from cart
  removeFromCart: (itemId: string) =>
    axiosInstance.delete<UnifiedCartResponse>(`/unified-cart/${itemId}`),

  // Clear entire cart
  clearCart: () =>
    axiosInstance.delete<UnifiedCartResponse>("/unified-cart"),

  // Save guest checkout info (email, phone, name)
  saveGuestCheckoutInfo: (data: GuestCheckoutInfoRequest) =>
    axiosInstance.post<UnifiedCartResponse>("/unified-cart/guest-checkout-info", data),

  // Get session info
  getSessionInfo: () =>
    axiosInstance.get<SessionInfoResponse>("/unified-cart/session-info"),
};

export default unifiedCartApi;
