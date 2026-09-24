/**
 * Covers app/(auth)/signUp.tsx's runtime-branding wiring — see
 * __tests__/login-screen.test.tsx's header comment for the shared context
 * (same pattern, same tint-split design decision) and why the remount/key
 * regression is not covered by an automated test.
 *
 * `@/assets/Icons` is partially mocked so `cartaisyColorlogo` resolves to a
 * distinguishable numeric sentinel instead of jest-expo's `{ testUri }`
 * asset-transform shape — see AppImage.test.tsx for why that transform
 * shape can't be resolved by AppImage's bundled-icon lookup under test.
 *
 * Lives outside app/ on purpose: expo-router treats app/ as the route
 * tree, so test files must not be added there.
 */
jest.mock("@/assets/Icons", () => {
  const actual = jest.requireActual("@/assets/Icons").default;
  return {
    __esModule: true,
    default: { ...actual, cartaisyColorlogo: 77 },
  };
});

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

jest.mock("@/api/hooks/useAuth", () => ({
  useSignUp: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
}));

import React from "react";
import { Image } from "react-native";

import SignUp from "@/app/(auth)/signUp";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

describe("SignUp screen — runtime logo", () => {
  beforeEach(() => {
    useStoreConfigStore.setState({
      primaryColor: undefined,
      secondaryColor: undefined,
      logoUrl: undefined,
      storeName: "",
      isLoaded: false,
    });
  });

  it("shows a neutral monogram instead of a Cartaisy wordmark when no logo or name is set", () => {
    const { getByTestId, queryByText } = renderWithTamagui(<SignUp />);

    expect(getByTestId("brand-mark-monogram")).toBeTruthy();
    expect(queryByText(/cartaisy/i)).toBeNull();
  });

  it("shows the store name when branding has no logo", () => {
    useStoreConfigStore.setState({
      storeName: "Northwind Goods",
      isLoaded: true,
    });

    const { getByText, queryByTestId } = renderWithTamagui(<SignUp />);

    expect(getByText("Northwind Goods")).toBeTruthy();
    expect(queryByTestId("brand-mark-logo")).toBeNull();
  });

  it("renders the runtime logo untinted when logoUrl is present", () => {
    const logoUrl = "https://cdn.example.com/stores/acme/logo.png";
    useStoreConfigStore.setState({
      logoUrl,
      primaryColor: "#123456",
      storeName: "Acme Outfitters",
      isLoaded: true,
    });

    const { UNSAFE_getAllByType } = renderWithTamagui(<SignUp />);
    const remoteLogo = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source?.uri === logoUrl
    );

    expect(remoteLogo).toBeTruthy();
    expect(remoteLogo!.props.tintColor).toBeUndefined();
  });

  it("falls back to the store name when the runtime logoUrl fails to load", () => {
    const logoUrl = "https://cdn.example.com/stores/acme/unreachable-logo.png";
    useStoreConfigStore.setState({
      logoUrl,
      storeName: "Acme Outfitters",
      isLoaded: true,
    });

    const { getByText, queryByText, UNSAFE_getAllByType } = renderWithTamagui(
      <SignUp />
    );
    const remoteLogo = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source?.uri === logoUrl
    );

    const { act } = require("@testing-library/react-native");
    act(() => {
      remoteLogo!.props.onError();
    });

    expect(getByText("Acme Outfitters")).toBeTruthy();
    expect(queryByText(/cartaisy/i)).toBeNull();
  });

  // See login-screen.test.tsx for why a remount/key regression test isn't
  // included: written, run against this file with both `key` props
  // removed, and it still passed — same synchronous-effect-flushing
  // limitation PR #107/#108 already documented for this test harness.
  //
  // Same finding for the URL-to-URL variant (review caught, PR #109,
  // before merge): the runtime branch's key is suffixed with `logoUrl`
  // itself so switching between two different non-empty URLs also
  // remounts. A test for that was attempted the same way and also passed
  // regardless of the fix — not included for the same reason.
});
