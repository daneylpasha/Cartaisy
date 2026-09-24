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

const MOCK_LOGO_ASSET = 77;
const DEFAULT_PRIMARY_HEX = "#A82A50"; // tamagui/token.ts PRIMARY_COLOR

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
    const { getByText, queryByText } = renderWithTamagui(<Login />);
    expect(getByText("Sign in")).toBeTruthy();
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

  it("renders the bundled logo tinted $primary when the store has no branding set (today's default)", () => {
    const { UNSAFE_getAllByType } = renderWithTamagui(<Login />);

    const logoImage = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source === MOCK_LOGO_ASSET
    );
    expect(logoImage).toBeTruthy();
    expect(logoImage!.props.tintColor).toBe(DEFAULT_PRIMARY_HEX);
  });

  it("tints the bundled fallback logo with the runtime primaryColor when set but logoUrl is absent", () => {
    useStoreConfigStore.setState({ primaryColor: "#123456" });

    const { UNSAFE_getAllByType } = renderWithTamagui(<Login />);

    const logoImage = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source === MOCK_LOGO_ASSET
    );
    expect(logoImage).toBeTruthy();
    expect(logoImage!.props.tintColor).toBe("#123456");
  });

  it("renders the runtime logo untinted when logoUrl is present, never applying $primary or the runtime primaryColor to it", () => {
    const logoUrl = "https://cdn.cartaisy.com/stores/acme/logo.png";
    useStoreConfigStore.setState({ logoUrl, primaryColor: "#123456" });

    const { UNSAFE_getAllByType } = renderWithTamagui(<Login />);

    const images = UNSAFE_getAllByType(Image);
    const remoteLogo = images.find(
      (img) =>
        typeof img.props.source === "object" &&
        img.props.source?.uri === logoUrl
    );
    expect(remoteLogo).toBeTruthy();
    expect(remoteLogo!.props.tintColor).toBeUndefined();
  });

  it("falls back to the bundled cartaisyColorlogo when the runtime logoUrl fails to load", () => {
    const logoUrl = "https://cdn.cartaisy.com/stores/acme/unreachable-logo.png";
    useStoreConfigStore.setState({ logoUrl });

    const { UNSAFE_getAllByType } = renderWithTamagui(<Login />);

    const remoteLogoBefore = UNSAFE_getAllByType(Image).find(
      (img) =>
        typeof img.props.source === "object" &&
        img.props.source?.uri === logoUrl
    );
    expect(remoteLogoBefore).toBeTruthy();

    const { act } = require("@testing-library/react-native");
    act(() => {
      remoteLogoBefore!.props.onError();
    });

    // Falls back to the bundled logo, not a blank space — this is
    // AppImage's fallbackName path (see AppImage.test.tsx), exercised here
    // through Login's actual wiring. NOTE: because the runtime AppImage
    // call intentionally passes no tintColor (Section 1's mandate — a real
    // merchant logo must never be tinted), and AppImage.tsx applies a
    // single tintColor to both its remote image AND this fallback overlay,
    // this fallback-on-error render is untinted too, unlike the "no
    // logoUrl at all" bundled branch above. This is a disclosed,
    // accepted tradeoff — see the PR description.
    const logoImage = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source === MOCK_LOGO_ASSET
    );
    expect(logoImage).toBeTruthy();
    expect(logoImage!.props.tintColor).toBeUndefined();
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
