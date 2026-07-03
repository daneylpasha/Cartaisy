/**
 * Focused screen tests for app/checkout.tsx (GitHub issue #65):
 * - auth gate: guests are blocked (login modal requested + routed back)
 * - catalog/store unavailable state replaces the checkout steps and
 *   blocks the Continue action until retry
 *
 * Lives outside app/ on purpose: expo-router treats app/ as the route
 * tree, so test files must not be added there.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { TamaguiProvider } from "tamagui";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

jest.mock("@stripe/stripe-react-native", () => ({
  usePlatformPay: () => ({ createPlatformPayPaymentMethod: jest.fn() }),
  PlatformPay: { PaymentType: { Immediate: "Immediate" } },
}));

jest.mock("@good-react-native/keyboard-avoider", () => ({
  KeyboardAvoiderView: ({ children }: { children: React.ReactNode }) => children,
  KeyboardAvoiderInsets: () => null,
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@/api/endpoints/cart", () => ({ clearSavedCart: jest.fn() }));
jest.mock("@/api/generated/cart/cart", () => ({
  useClearCart: () => ({ mutate: jest.fn() }),
}));
jest.mock("@/api/generated/checkout/checkout", () => ({
  useCompleteCheckout: () => ({ mutate: jest.fn() }),
}));

jest.mock("@/components/molecules/CustomAlert", () => ({
  useCustomAlert: () => ({ showAlert: jest.fn(), AlertComponent: () => null }),
}));

// Mutable auth-gate double; the real gate mechanism has its own test in
// contexts/__tests__/AuthGuardContext.test.tsx.
const mockAuthGuard = { isAuthenticated: true, requireAuth: jest.fn() };
jest.mock("@/contexts/AuthGuardContext", () => ({
  useAuthGuard: () => mockAuthGuard,
}));

// Checkout step children are heavy (addresses, Stripe payment sheet). The
// screen hands them onError={handleCheckoutStepError}; the Shipping double
// exposes buttons that fire that callback like a real failing step would.
jest.mock("@/components/molecules/checkout/CheckoutStepper", () => {
  const { Text } = require("react-native");
  return {
    CheckoutStepper: () => <Text testID="checkout-stepper">stepper</Text>,
  };
});
jest.mock("@/components/molecules/checkout/Confirmation", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("@/components/molecules/checkout/Payment", () => {
  const ReactActual = require("react");
  return { __esModule: true, default: ReactActual.forwardRef(() => null) };
});
jest.mock("@/components/molecules/checkout/Shipping", () => {
  const ReactActual = require("react");
  const { Pressable, Text } = require("react-native");
  const Shipping = ReactActual.forwardRef(
    ({ onError }: { onError: (error?: unknown) => void }, _ref: unknown) => (
      <>
        <Pressable
          testID="shipping-unavailable-error"
          onPress={() =>
            onError({ response: { status: 503, data: { code: "CATALOG_UNAVAILABLE" } } })
          }
        >
          <Text>trigger unavailable</Text>
        </Pressable>
        <Pressable testID="shipping-generic-error" onPress={() => onError(new Error("boom"))}>
          <Text>trigger generic</Text>
        </Pressable>
      </>
    )
  );
  return { __esModule: true, default: Shipping };
});

import CheckoutScreen from "@/app/checkout";
import useCartStore from "@/store/useCartStore";
import config from "@/tamagui.config";

const { router } = jest.requireMock("expo-router");

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config}>
    <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
  </TamaguiProvider>
);

const renderCheckout = () => render(<CheckoutScreen />, { wrapper: Wrapper });

const controlledMessage =
  "This store's catalog is temporarily unavailable. Please try again later.";

describe("checkout screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthGuard.isAuthenticated = true;
    useCartStore.setState({ cartId: "cart-1", items: [] });
  });

  it("blocks guests: requests the login modal and routes back to the cart", () => {
    mockAuthGuard.isAuthenticated = false;

    renderCheckout();

    expect(mockAuthGuard.requireAuth).toHaveBeenCalledWith(
      expect.objectContaining({ type: "checkout" })
    );
    expect(router.back).toHaveBeenCalled();
  });

  it("does not gate authenticated customers and shows the checkout flow", () => {
    const { getByText, getByTestId } = renderCheckout();

    expect(mockAuthGuard.requireAuth).not.toHaveBeenCalled();
    expect(router.back).not.toHaveBeenCalled();
    expect(getByTestId("checkout-stepper")).toBeTruthy();
    expect(getByText("Continue")).toBeTruthy();
  });

  it("replaces steps and blocks the Continue action when a step reports catalog unavailable", () => {
    const { getByText, getByTestId, queryByText, queryByTestId } = renderCheckout();

    fireEvent.press(getByTestId("shipping-unavailable-error"));

    expect(getByText("Checkout unavailable")).toBeTruthy();
    expect(getByText(controlledMessage)).toBeTruthy();
    expect(queryByText("Continue")).toBeNull();
    expect(queryByTestId("checkout-stepper")).toBeNull();

    fireEvent.press(getByText("Try again"));
    expect(getByText("Continue")).toBeTruthy();
  });

  it("does not enter the unavailable state for a generic step error", () => {
    const { getByText, getByTestId, queryByText } = renderCheckout();

    fireEvent.press(getByTestId("shipping-generic-error"));

    expect(queryByText("Checkout unavailable")).toBeNull();
    expect(getByText("Continue")).toBeTruthy();
  });
});
