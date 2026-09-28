/**
 * Focused screen tests for app/checkout.tsx:
 * direct visits to the old native checkout route render a disabled state
 * and return the shopper to the cart. The screen does not mount Stripe,
 * Platform Pay, or a native payment confirmation.
 *
 * Lives outside app/ on purpose: expo-router treats app/ as the route
 * tree, so test files must not be added there.
 */
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { TamaguiProvider } from "tamagui";

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

import CheckoutScreen from "@/app/checkout";
import config from "@/tamagui.config";
import {
  BETA_CHECKOUT_ENTRY_ROUTE,
  legacyNativeCheckoutDisabledMessage,
} from "@/utils/checkoutFlowGate";

const { router } = jest.requireMock("expo-router");

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config}>{children}</TamaguiProvider>
);

describe("checkout screen shopify handoff gate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not mount a native payment step", () => {
    const { getByText, queryByText } = render(<CheckoutScreen />, {
      wrapper: Wrapper,
    });

    expect(getByText("Checkout unavailable")).toBeTruthy();
    expect(getByText(legacyNativeCheckoutDisabledMessage)).toBeTruthy();
    expect(queryByText("Complete Order")).toBeNull();
    expect(queryByText("Continue")).toBeNull();
    expect(queryByText(/Apple Pay|Google Pay|Add card/i)).toBeNull();
  });

  it("sends direct checkout route visitors back to the cart entry", () => {
    const { getByText } = render(<CheckoutScreen />, { wrapper: Wrapper });

    fireEvent.press(getByText("Go to Cart"));
    expect(router.replace).toHaveBeenCalledWith(BETA_CHECKOUT_ENTRY_ROUTE);
    expect(router.push).not.toHaveBeenCalled();
  });
});
