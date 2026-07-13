/**
 * Focused screen tests for app/checkout.tsx:
 * - private-beta gate: the legacy native checkout route renders a disabled
 *   state and does not mount checkout steps or legacy checkout mutations.
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
const mockUseCompleteCheckout = jest.fn(() => ({ mutate: jest.fn() }));
jest.mock("@/api/generated/checkout/checkout", () => ({
  useCompleteCheckout: () => mockUseCompleteCheckout(),
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
import {
  BETA_CHECKOUT_ENTRY_ROUTE,
  legacyNativeCheckoutDisabledMessage,
} from "@/utils/checkoutFlowGate";

const { router } = jest.requireMock("expo-router");

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config}>
    <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
  </TamaguiProvider>
);

const renderCheckout = () => render(<CheckoutScreen />, { wrapper: Wrapper });

describe("checkout screen private-beta gate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthGuard.isAuthenticated = true;
    useCartStore.setState({ cartId: "cart-1", items: [] });
  });

  it("disables the legacy native checkout route for beta", () => {
    mockAuthGuard.isAuthenticated = false;

    const { getByText, queryByTestId } = renderCheckout();

    expect(getByText("Checkout unavailable")).toBeTruthy();
    expect(getByText(legacyNativeCheckoutDisabledMessage)).toBeTruthy();
    expect(queryByTestId("checkout-stepper")).toBeNull();
    expect(mockAuthGuard.requireAuth).not.toHaveBeenCalled();
    expect(router.back).not.toHaveBeenCalled();
    expect(mockUseCompleteCheckout).not.toHaveBeenCalled();
  });

  it("sends direct checkout route visitors back to the cart entry", () => {
    const { getByText } = renderCheckout();

    fireEvent.press(getByText("Go to Cart"));
    expect(router.replace).toHaveBeenCalledWith(BETA_CHECKOUT_ENTRY_ROUTE);
  });
});
