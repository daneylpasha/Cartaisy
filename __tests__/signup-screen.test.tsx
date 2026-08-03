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

const MOCK_LOGO_ASSET = 77;
const DEFAULT_PRIMARY_HEX = "#A82A50"; // tamagui/token.ts PRIMARY_COLOR

describe("SignUp screen — runtime logo", () => {
  beforeEach(() => {
    useStoreConfigStore.setState({
      primaryColor: undefined,
      secondaryColor: undefined,
      logoUrl: undefined,
    });
  });

  it("renders the bundled logo tinted $primary when the store has no branding set (today's default)", () => {
    const { UNSAFE_getAllByType } = renderWithTamagui(<SignUp />);

    const logoImage = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source === MOCK_LOGO_ASSET
    );
    expect(logoImage).toBeTruthy();
    expect(logoImage!.props.tintColor).toBe(DEFAULT_PRIMARY_HEX);
  });

  it("tints the bundled fallback logo with the runtime primaryColor when set but logoUrl is absent", () => {
    useStoreConfigStore.setState({ primaryColor: "#123456" });

    const { UNSAFE_getAllByType } = renderWithTamagui(<SignUp />);

    const logoImage = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source === MOCK_LOGO_ASSET
    );
    expect(logoImage).toBeTruthy();
    expect(logoImage!.props.tintColor).toBe("#123456");
  });

  it("renders the runtime logo untinted when logoUrl is present, never applying $primary or the runtime primaryColor to it", () => {
    const logoUrl = "https://cdn.cartaisy.com/stores/acme/logo.png";
    useStoreConfigStore.setState({ logoUrl, primaryColor: "#123456" });

    const { UNSAFE_getAllByType } = renderWithTamagui(<SignUp />);

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

    const { UNSAFE_getAllByType } = renderWithTamagui(<SignUp />);

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

    // Falls back to the bundled logo, not a blank space. Untinted (not
    // "bundled+tinted") because the runtime AppImage call intentionally
    // passes no tintColor and AppImage.tsx shares one tintColor between its
    // remote image and this fallback overlay — see login-screen.test.tsx's
    // matching case and the PR description for the full explanation.
    const logoImage = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source === MOCK_LOGO_ASSET
    );
    expect(logoImage).toBeTruthy();
    expect(logoImage!.props.tintColor).toBeUndefined();
  });

  // See login-screen.test.tsx for why a remount/key regression test isn't
  // included: written, run against this file with both `key` props
  // removed, and it still passed — same synchronous-effect-flushing
  // limitation PR #107/#108 already documented for this test harness.
});
