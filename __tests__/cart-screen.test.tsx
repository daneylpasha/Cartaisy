/**
 * Focused screen tests for app/(tabs)/cart.tsx (GitHub issue #65):
 * the catalog/store unavailable state replaces the cart (hiding the
 * checkout action) when cart sync fails with a controlled unavailable
 * error, and retrying restores the cart once sync succeeds.
 *
 * Lives outside app/ on purpose: expo-router treats app/ as the route
 * tree, so test files must not be added there.
 */
import { act, fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";
import { Linking } from "react-native";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-router", () => {
  const ReactActual = require("react");
  return {
    router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
    // Simulate exactly one focus event per mount ([] deps) so mid-test
    // store updates cannot re-fire the screen's on-focus cart sync.
    useFocusEffect: (callback: () => void | (() => void)) => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ReactActual.useEffect(callback, []);
    },
  };
});

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockSyncCart = jest.fn();
jest.mock("@/api/hooks/useCartManager", () => ({
  useCartManager: () => ({
    updateQuantity: jest.fn(),
    removeItem: jest.fn(),
    syncCart: mockSyncCart,
  }),
}));

const mockCheckoutHandoffMutation = jest.fn();
jest.mock("@/api/generated/checkout/checkout", () => ({
  useCheckoutHandoff: () => ({ mutate: mockCheckoutHandoffMutation }),
}));
jest.mock("@/api/generated/recommendations/recommendations", () => ({
  useGetCartRecommendations: () => ({ mutate: jest.fn(), data: undefined }),
}));

type MockAuthAction = { type: string; callback?: () => void };
const mockAuthGuard: { requireAuth: jest.Mock<boolean, [MockAuthAction]> } = {
  requireAuth: jest.fn((_action: MockAuthAction) => true),
};
jest.mock("@/contexts/AuthGuardContext", () => ({
  useAuthGuard: () => mockAuthGuard,
}));

// Heavy child components not under test here.
jest.mock("@/components/molecules/cart/CartLineItem", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("@/components/molecules/ProductCard", () => ({ ProductCard: () => null }));
jest.mock("@/components/organisms/ErrorModal", () => ({ __esModule: true, default: () => null }));

import CartScreen from "@/app/(tabs)/cart";
import useCartStore from "@/store/useCartStore";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

const catalogUnavailableError = {
  response: { status: 503, data: { code: "STORE_UNAVAILABLE" } },
};

const controlledMessage =
  "This store's catalog is temporarily unavailable. Please try again later.";

const cartItem = {
  variantId: "aurora-tee-v1",
  productId: "p1",
  merchandiseId: "aurora-tee-v1",
  title: "Aurora Tee",
  price: 19.99,
  quantity: 1,
  lineItemId: "line-1",
} as any;

describe("cart screen unavailable state", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthGuard.requireAuth.mockReturnValue(true);
    jest.spyOn(Linking, "openURL").mockResolvedValue(undefined as any);
    useCartStore.setState({ cartId: "cart-1", items: [cartItem] });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("replaces the cart and hides checkout when sync reports catalog unavailable", async () => {
    mockSyncCart.mockRejectedValue(catalogUnavailableError);

    const { getByText, queryByText } = renderWithTamagui(<CartScreen />);

    await waitFor(() => expect(getByText("Cart unavailable")).toBeTruthy());
    expect(getByText(controlledMessage)).toBeTruthy();
    expect(queryByText(/Proceed to Checkout/)).toBeNull();
  });

  it("keeps the cart (and its checkout action) for a generic sync error", async () => {
    mockSyncCart.mockRejectedValue(new Error("network hiccup"));

    const { getByText, queryByText } = renderWithTamagui(<CartScreen />);

    // Let the rejected sync and its catch block fully settle before
    // asserting, so this observes the final state rather than the moment
    // syncCart happened to be called.
    await waitFor(() => expect(mockSyncCart).toHaveBeenCalled());
    await act(async () => {});

    await waitFor(() => {
      expect(queryByText("Cart unavailable")).toBeNull();
      expect(getByText(/Proceed to Checkout/)).toBeTruthy();
    });
  });

  it("retries from the unavailable state and restores the cart when sync recovers", async () => {
    mockSyncCart.mockRejectedValueOnce(catalogUnavailableError);

    const { getByText, queryByText } = renderWithTamagui(<CartScreen />);
    await waitFor(() => expect(getByText("Cart unavailable")).toBeTruthy());

    mockSyncCart.mockResolvedValueOnce(true);
    fireEvent.press(getByText("Try again"));

    await waitFor(() => expect(queryByText("Cart unavailable")).toBeNull());
    expect(getByText(/Proceed to Checkout/)).toBeTruthy();
  });

  it("starts Shopify-hosted checkout handoff from the generated cart", async () => {
    mockSyncCart.mockResolvedValue(true);
    mockCheckoutHandoffMutation.mockImplementation((_variables, options) => {
      options.onSuccess({
        success: true,
        data: {
          checkoutUrl: "https://store.example.com/checkouts/abc",
          cartId: "cart-1",
          storeId: "store-1",
        },
      });
    });

    const { getByText } = renderWithTamagui(<CartScreen />);

    fireEvent.press(getByText(/Proceed to Checkout/));

    expect(mockAuthGuard.requireAuth).toHaveBeenCalledWith(
      expect.objectContaining({ type: "checkout" })
    );
    expect(mockCheckoutHandoffMutation).toHaveBeenCalledWith(
      { data: { cartId: "cart-1" } },
      expect.any(Object)
    );
    await waitFor(() =>
      expect(Linking.openURL).toHaveBeenCalledWith(
        "https://store.example.com/checkouts/abc"
      )
    );
  });

  it("uses the latest cart ID when the deferred auth callback runs", () => {
    let pendingCheckoutCallback: (() => void) | undefined;
    mockSyncCart.mockResolvedValue(true);
    mockAuthGuard.requireAuth.mockImplementation((action) => {
      pendingCheckoutCallback = action.callback;
      return false;
    });

    const { getByText } = renderWithTamagui(<CartScreen />);

    fireEvent.press(getByText(/Proceed to Checkout/));
    expect(mockCheckoutHandoffMutation).not.toHaveBeenCalled();

    act(() => {
      useCartStore.setState({
        cartId: "cart-after-login",
        items: [
          {
            ...cartItem,
            lineItemId: "line-after-login",
            title: "Merged Aurora Tee",
          },
        ],
      });
    });

    act(() => {
      pendingCheckoutCallback?.();
    });

    expect(mockCheckoutHandoffMutation).toHaveBeenCalledWith(
      { data: { cartId: "cart-after-login" } },
      expect.any(Object)
    );
  });
});
