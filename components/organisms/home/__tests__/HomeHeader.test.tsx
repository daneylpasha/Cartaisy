/**
 * Covers HomeHeader.tsx's runtime-branding wiring (PR #104's data layer,
 * first real rendering surface): the header falls back to today's exact
 * bundled logo / $primary background when the store has no branding set,
 * and renders the runtime logo/color when both are present.
 *
 * `@/assets/Icons` is partially mocked so `cartaisyWhitelogo` resolves to a
 * distinguishable numeric sentinel instead of jest-expo's `{ testUri }`
 * asset-transform shape — see AppImage.test.tsx for why that transform
 * shape can't be resolved by AppImage's bundled-icon lookup under test.
 * Every other icon key is left as the real (transformed) value; this test
 * doesn't assert on them.
 */
jest.mock("@/assets/Icons", () => {
  const actual = jest.requireActual("@/assets/Icons").default;
  return {
    __esModule: true,
    default: { ...actual, cartaisyWhitelogo: 42 },
  };
});

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}));

import React from "react";
import { Animated, Image, StyleSheet, View } from "react-native";

import { HomeHeader } from "@/components/organisms/home/HomeHeader";
import useCartStore from "@/store/useCartStore";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import useUserStore from "@/store/useUserStore";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

const MOCK_LOGO_ASSET = 42;
const DEFAULT_PRIMARY_HEX = "#A82A50"; // tamagui/token.ts PRIMARY_COLOR

const renderHeader = () =>
  renderWithTamagui(
    <HomeHeader
      topInset={0}
      rotateAnim={new Animated.Value(0)}
      onAddressPress={jest.fn()}
    />
  );

describe("HomeHeader", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
    useUserStore.setState({ defaultAddress: null });
    useStoreConfigStore.setState({
      primaryColor: undefined,
      secondaryColor: undefined,
      logoUrl: undefined,
      storeName: "",
      // isLoaded: false matches the store's post-rehydration/pre-fetch
      // default (see useStoreConfigStore.ts's onRehydrateStorage reset).
      isLoaded: false,
    });
  });

  it("renders the bundled logo and $primary background when the store has no branding set (today's default)", () => {
    const { UNSAFE_getAllByType } = renderHeader();

    const logoImage = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source === MOCK_LOGO_ASSET
    );
    expect(logoImage).toBeTruthy();

    const rootView = UNSAFE_getAllByType(View)[0];
    const flatStyle = StyleSheet.flatten(rootView.props.style);
    expect(flatStyle.backgroundColor).toBe(DEFAULT_PRIMARY_HEX);
  });

  it("renders the primary color background immediately and the bundled logo while the runtime logo is still loading", () => {
    const logoUrl = "https://cdn.cartaisy.com/stores/acme/logo.png";
    const primaryColor = "#123456";

    useStoreConfigStore.setState({
      primaryColor,
      logoUrl,
    });

    const { UNSAFE_getAllByType } = renderHeader();

    // Per MOBILE_RUNTIME_BRANDING_CONTRACT.md ("keep current bundled
    // assets visible until a remote logo finishes loading"), the bundled
    // logo is what's shown while the remote one is still loading — not a
    // generic shimmer — while the real remote image stays mounted
    // underneath so it can finish loading in the background.
    const images = UNSAFE_getAllByType(Image);
    const remoteLogo = images.find(
      (img) =>
        typeof img.props.source === "object" &&
        img.props.source?.uri === logoUrl
    );
    expect(remoteLogo).toBeTruthy();
    expect(images.some((img) => img.props.source === MOCK_LOGO_ASSET)).toBe(
      true
    );

    // Background color doesn't wait on the logo — it applies immediately.
    const rootView = UNSAFE_getAllByType(View)[0];
    const flatStyle = StyleSheet.flatten(rootView.props.style);
    expect(flatStyle.backgroundColor).toBe(primaryColor);
  });

  it("swaps to the runtime logo once it finishes loading successfully", () => {
    const logoUrl = "https://cdn.cartaisy.com/stores/acme/logo.png";
    useStoreConfigStore.setState({ logoUrl });

    const { UNSAFE_getAllByType } = renderHeader();

    const remoteLogoBefore = UNSAFE_getAllByType(Image).find(
      (img) =>
        typeof img.props.source === "object" &&
        img.props.source?.uri === logoUrl
    );

    const { act } = require("@testing-library/react-native");
    act(() => {
      remoteLogoBefore!.props.onLoadEnd();
    });

    const images = UNSAFE_getAllByType(Image);
    expect(images.some((img) => img.props.source === MOCK_LOGO_ASSET)).toBe(
      false
    );
    expect(
      images.some(
        (img) =>
          typeof img.props.source === "object" &&
          img.props.source?.uri === logoUrl
      )
    ).toBe(true);
  });

  it("falls back to the bundled logo when the runtime logoUrl fails to load", () => {
    const logoUrl = "https://cdn.cartaisy.com/stores/acme/unreachable-logo.png";
    useStoreConfigStore.setState({ logoUrl });

    const { UNSAFE_getAllByType } = renderHeader();

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

    // Failed to load: falls back to the bundled Cartaisy logo, not a blank
    // space — this is AppImage's fallbackName path (see AppImage.test.tsx),
    // exercised here through HomeHeader's actual wiring.
    const logoImage = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source === MOCK_LOGO_ASSET
    );
    expect(logoImage).toBeTruthy();
  });

  it("keeps the bundled logo/$primary background when only one of primaryColor/logoUrl is set", () => {
    useStoreConfigStore.setState({ primaryColor: "#123456", logoUrl: undefined });

    const { UNSAFE_getAllByType } = renderHeader();

    const logoImage = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source === MOCK_LOGO_ASSET
    );
    expect(logoImage).toBeTruthy();

    const rootView = UNSAFE_getAllByType(View)[0];
    const flatStyle = StyleSheet.flatten(rootView.props.style);
    expect(flatStyle.backgroundColor).toBe("#123456");
  });

  describe("search placeholder companyName (TICKETwiremerchantstorenameintocompanynamestrings.md)", () => {
    it("falls back to a bare 'Search' (no name) when storeName is empty (today's initial state before AppInitializer's fetch resolves) — never leaks the bundled 'Cartaisy' name (Codex P1 finding on PR #120)", () => {
      const { getByText } = renderHeader();
      expect(getByText("Search")).toBeTruthy();
    });

    it("reads the merchant's real storeName once isLoaded is true, instead of the hardcoded Cartaisy string", () => {
      useStoreConfigStore.setState({ storeName: "Acme Outfitters", isLoaded: true });

      const { getByText } = renderHeader();
      expect(getByText("Search Acme Outfitters")).toBeTruthy();
    });

    it("constrains a long merchant name to one line with ellipsis instead of extending past the fixed-width header (Codex review finding on PR #120)", () => {
      // The store-config contract places no length limit on `name`, and
      // this row had neither flexShrink nor numberOfLines — a long real
      // merchant name could previously push the search row wider than the
      // header instead of staying a single-line search affordance (the
      // former hardcoded "Cartaisy" was always short enough that this
      // never showed up). Same fix as the notification preview card.
      const longName = "Acme Outfitters International Trading Company Ltd.";
      useStoreConfigStore.setState({ storeName: longName, isLoaded: true });

      const { getByText } = renderHeader();
      const searchText = getByText(`Search ${longName}`);

      expect(searchText.props.numberOfLines).toBe(1);
      expect(searchText.props.ellipsizeMode).toBe("tail");
    });
  });
});
