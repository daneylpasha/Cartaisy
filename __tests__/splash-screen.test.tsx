/**
 * Covers app/splash.tsx's runtime-branding wiring — same conditional
 * source/fallbackName pattern PR #106 shipped for HomeHeader.tsx, applied
 * to the React splash route: falls back to today's exact bundled
 * `cartaisyColorlogo` when the store has no branding set, and renders the
 * runtime logo (with `cartaisyColorlogo` as AppImage's fallbackName) when
 * `logoUrl` is present.
 *
 * Lives outside app/ on purpose: expo-router treats app/ as the route
 * tree, so test files must not be added there (see
 * __tests__/wishlist-screen.test.tsx for the same note).
 *
 * `@/assets/Icons` is partially mocked so `cartaisyColorlogo` resolves to
 * a distinguishable numeric sentinel instead of jest-expo's `{ testUri }`
 * asset-transform shape — see components/atoms/__tests__/AppImage.test.tsx
 * for why that transform shape can't be resolved by AppImage's
 * bundled-icon lookup under test. Every other icon key is left as the
 * real (transformed) value; this test doesn't assert on them.
 */
jest.mock("@/assets/Icons", () => {
  const actual = jest.requireActual("@/assets/Icons").default;
  return {
    __esModule: true,
    default: { ...actual, cartaisyColorlogo: 99 },
  };
});

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

import React from "react";
import { Image } from "react-native";

import Splash from "@/app/splash";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

const MOCK_LOGO_ASSET = 99;

describe("Splash", () => {
  beforeEach(() => {
    useStoreConfigStore.setState({
      primaryColor: undefined,
      secondaryColor: undefined,
      logoUrl: undefined,
    });
  });

  it("renders the bundled cartaisyColorlogo when the store has no branding set (today's default)", () => {
    const { UNSAFE_getAllByType } = renderWithTamagui(<Splash />);

    const logoImage = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source === MOCK_LOGO_ASSET
    );
    expect(logoImage).toBeTruthy();
  });

  it("renders the runtime logo (with cartaisyColorlogo as fallbackName) when logoUrl is present", () => {
    const logoUrl = "https://cdn.cartaisy.com/stores/acme/logo.png";
    useStoreConfigStore.setState({ logoUrl });

    const { UNSAFE_getAllByType } = renderWithTamagui(<Splash />);

    const images = UNSAFE_getAllByType(Image);
    const remoteLogo = images.find(
      (img) =>
        typeof img.props.source === "object" &&
        img.props.source?.uri === logoUrl
    );
    expect(remoteLogo).toBeTruthy();

    // Per AppImage's fallback overlay behavior (PR #106), the bundled logo
    // is shown while the remote one is still loading — not absent.
    expect(images.some((img) => img.props.source === MOCK_LOGO_ASSET)).toBe(
      true
    );
  });

  it("falls back to the bundled logo when the runtime logoUrl fails to load", () => {
    const logoUrl = "https://cdn.cartaisy.com/stores/acme/unreachable-logo.png";
    useStoreConfigStore.setState({ logoUrl });

    const { UNSAFE_getAllByType } = renderWithTamagui(<Splash />);

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

    const logoImage = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source === MOCK_LOGO_ASSET
    );
    expect(logoImage).toBeTruthy();
  });
});
