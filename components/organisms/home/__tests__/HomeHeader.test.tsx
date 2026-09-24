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

const DEFAULT_PRIMARY_HEX = "#1C1917"; // tamagui/token.ts PRIMARY_COLOR

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

  it("shows a neutral monogram and the fallback primary when the store has no branding", () => {
    const { getByTestId, queryByText, UNSAFE_getAllByType } = renderHeader();

    expect(getByTestId("brand-mark-monogram")).toBeTruthy();
    expect(queryByText(/cartaisy/i)).toBeNull();

    const rootView = UNSAFE_getAllByType(View)[0];
    const flatStyle = StyleSheet.flatten(rootView.props.style);
    expect(flatStyle.backgroundColor).toBe(DEFAULT_PRIMARY_HEX);
  });

  it("shows the store name in the header when a logo was not published", () => {
    useStoreConfigStore.setState({
      storeName: "Northwind Goods",
      isLoaded: true,
      primaryColor: "#123456",
    });

    const { getByText, queryByTestId, queryByText, UNSAFE_getAllByType } =
      renderHeader();

    expect(getByText("Northwind Goods")).toBeTruthy();
    expect(queryByTestId("brand-mark-logo")).toBeNull();
    expect(queryByText(/cartaisy/i)).toBeNull();

    const rootView = UNSAFE_getAllByType(View)[0];
    expect(StyleSheet.flatten(rootView.props.style).backgroundColor).toBe(
      "#123456"
    );
  });

  it("renders the merchant logo untinted once it loads, and keeps the name visible until then", () => {
    const logoUrl = "https://cdn.example.com/stores/acme/logo.png";
    useStoreConfigStore.setState({
      logoUrl,
      primaryColor: "#123456",
      storeName: "Acme Outfitters",
      isLoaded: true,
    });

    const { getByText, queryByText, UNSAFE_getAllByType } = renderHeader();
    const remoteLogo = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source?.uri === logoUrl
    );
    expect(remoteLogo).toBeTruthy();
    expect(remoteLogo!.props.tintColor).toBeUndefined();
    expect(getByText("Acme Outfitters")).toBeTruthy();

    const { act } = require("@testing-library/react-native");
    act(() => {
      remoteLogo!.props.onLoad();
    });

    expect(queryByText("Acme Outfitters")).toBeNull();
    expect(
      UNSAFE_getAllByType(Image).some((img) => img.props.source?.uri === logoUrl)
    ).toBe(true);
  });

  it("falls back to the store name when the logo fails, never a Cartaisy wordmark", () => {
    const logoUrl = "https://cdn.example.com/stores/acme/unreachable-logo.png";
    useStoreConfigStore.setState({
      logoUrl,
      storeName: "Acme Outfitters",
      isLoaded: true,
    });

    const { getByText, queryByText, UNSAFE_getAllByType } = renderHeader();
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
