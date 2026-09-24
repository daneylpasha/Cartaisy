/**
 * Covers app/(auth)/login.tsx's runtime-branding wiring — same
 * source/fallbackName pattern already proven for HomeHeader.tsx (PR #106),
 * app/splash.tsx (PR #107), with one difference specific to this surface
 * (and signUp.tsx / LoginBottomSheet.tsx, which share it): today's bundled
 * logo is rendered with `tintColor={"$primary"}` (a solid silhouette), and
 * that tint must NOT be carried over onto a real merchant's uploaded logo —
 * see this file's sibling call sites and the ticket's Section 1 for why.
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
  useLogin: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
}));

jest.mock("@/api/generated/cart/cart", () => ({
  getCart: jest.fn(),
}));

import React from "react";
import { Image } from "react-native";

import Login from "@/app/(auth)/login";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

describe("Login screen — runtime logo", () => {
  beforeEach(() => {
    useStoreConfigStore.setState({
      primaryColor: undefined,
      secondaryColor: undefined,
      logoUrl: undefined,
      storeName: "",
      isLoaded: false,
    });
  });

  it("does not put a Cartaisy wordmark in the sign-in title when the store name is not loaded", () => {
    useStoreConfigStore.setState({ storeName: "", isLoaded: false });
    const { getAllByText, queryByText } = renderWithTamagui(<Login />);
    expect(getAllByText("Sign in").length).toBeGreaterThan(0);
    expect(queryByText(/cartaisy/i)).toBeNull();
  });

  it("uses the merchant store name in the sign-in title once config has loaded", () => {
    useStoreConfigStore.setState({
      storeName: "Northwind Goods",
      isLoaded: true,
    });
    const { getByText } = renderWithTamagui(<Login />);
    expect(getByText("Sign in to Northwind Goods")).toBeTruthy();
  });

  it("shows a neutral monogram instead of a Cartaisy wordmark when no logo or name is set", () => {
    const { getByTestId, queryByText } = renderWithTamagui(<Login />);

    expect(getByTestId("brand-mark-monogram")).toBeTruthy();
    expect(queryByText(/cartaisy/i)).toBeNull();
  });

  it("shows the store name when branding has no logo", () => {
    useStoreConfigStore.setState({
      storeName: "Northwind Goods",
      isLoaded: true,
      primaryColor: "#123456",
    });

    const { getAllByText, queryByTestId } = renderWithTamagui(<Login />);

    expect(getAllByText("Northwind Goods").length).toBeGreaterThan(0);
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

    const { UNSAFE_getAllByType } = renderWithTamagui(<Login />);
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
      <Login />
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

  // NOTE on the remount/key regression: a test simulating logoUrl arriving
  // after mount was written and deliberately run against this file with
  // both `key` props removed first. It still passed on the broken code —
  // same root cause PR #107/#108 already documented: this codebase's
  // Jest/react-test-renderer setup flushes passive effects synchronously
  // even for state updates outside `act()`, papering over the exact timing
  // gap the bug lives in. Per that established standard, no such test is
  // included here since it would pass regardless of whether the `key`
  // props are present.
  //
  // Same finding for the URL-to-URL variant of this bug (review caught,
  // PR #109, before merge): the runtime branch's key is suffixed with
  // `logoUrl` itself so switching between two different non-empty URLs
  // also remounts, not just the absent-to-present transition. A test
  // simulating a loaded logoUrl swapping to a different logoUrl was
  // written and run against a build with that suffix reverted to the
  // bare "runtime-logo" constant — it still passed, same synchronous-
  // effect-flushing reason. Not included for the same reason.
});
