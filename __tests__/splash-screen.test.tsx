/**
 * Splash identity comes from the connected store: logo when published,
 * store name otherwise, and a neutral monogram when both are missing.
 * It must not render the bundled Cartaisy wordmark.
 *
 * Lives outside app/ on purpose: expo-router treats app/ as the route tree.
 */
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve(true)),
  hideAsync: jest.fn(() => Promise.resolve(true)),
}));

import React from "react";
import { Image } from "react-native";

import Splash from "@/app/splash";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

describe("Splash", () => {
  beforeEach(() => {
    useStoreConfigStore.setState({
      primaryColor: undefined,
      secondaryColor: undefined,
      logoUrl: undefined,
      iconUrl: undefined,
      splashUrl: undefined,
      storeName: "",
      isLoaded: false,
      _hasHydrated: true,
    });
  });

  it("shows a neutral monogram when the store has no logo or name", () => {
    const { getByTestId, queryByText } = renderWithTamagui(<Splash />);

    expect(getByTestId("brand-mark-monogram")).toBeTruthy();
    expect(queryByText(/cartaisy/i)).toBeNull();
  });

  it("shows the store name when config has loaded without a logo", () => {
    useStoreConfigStore.setState({
      storeName: "Northwind Goods",
      isLoaded: true,
    });

    const { getByText, queryByTestId } = renderWithTamagui(<Splash />);

    expect(getByText("Northwind Goods")).toBeTruthy();
    expect(queryByTestId("brand-mark-logo")).toBeNull();
  });

  it("renders the runtime logo untinted when logoUrl is present", () => {
    const logoUrl = "https://cdn.example.com/stores/acme/logo.png";
    useStoreConfigStore.setState({
      logoUrl,
      storeName: "Acme Outfitters",
      isLoaded: true,
    });

    const { getByText, UNSAFE_getAllByType } = renderWithTamagui(<Splash />);
    const remoteLogo = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source?.uri === logoUrl
    );

    expect(remoteLogo).toBeTruthy();
    expect(remoteLogo!.props.tintColor).toBeUndefined();
    expect(getByText("Acme Outfitters")).toBeTruthy();
  });

  it("falls back to the store name when the runtime logo fails to load", () => {
    const logoUrl = "https://cdn.example.com/stores/acme/unreachable-logo.png";
    useStoreConfigStore.setState({
      logoUrl,
      storeName: "Acme Outfitters",
      isLoaded: true,
    });

    const { getByText, queryByText, UNSAFE_getAllByType } = renderWithTamagui(
      <Splash />
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

  it("shows the merchant splash and no Cartaisy mark when splashUrl is set", () => {
    const splashUrl = "https://cdn.example.com/stores/acme/splash.png";
    useStoreConfigStore.setState({
      splashUrl,
      logoUrl: "https://cdn.example.com/stores/acme/logo.png",
      iconUrl: "https://cdn.example.com/stores/acme/icon.png",
      storeName: "Acme Outfitters",
      isLoaded: true,
      _hasHydrated: true,
    });

    const { getByTestId, queryByTestId, queryByText, UNSAFE_getAllByType } =
      renderWithTamagui(<Splash />);
    const splash = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source?.uri === splashUrl
    );

    expect(getByTestId("merchant-splash")).toBeTruthy();
    expect(splash).toBeTruthy();
    expect(splash!.props.resizeMode).toBe("cover");
    expect(queryByTestId("brand-mark")).toBeNull();
    expect(queryByTestId("brand-mark-logo")).toBeNull();
    expect(queryByText(/cartaisy/i)).toBeNull();
  });

  it("accepts an http splash URL and ignores a token-shaped one", () => {
    useStoreConfigStore.setState({
      splashUrl: "http://cdn.example.com/stores/acme/splash.png",
      storeName: "Acme Outfitters",
      isLoaded: true,
      _hasHydrated: true,
    });

    const { getByTestId, queryByTestId, rerender } = renderWithTamagui(
      <Splash />
    );
    expect(getByTestId("merchant-splash")).toBeTruthy();

    useStoreConfigStore.setState({
      splashUrl: "https://cdn.example.com/splash.png?access_token=shpat_secret",
    });
    rerender(<Splash />);

    expect(queryByTestId("merchant-splash")).toBeNull();
    expect(getByTestId("brand-mark")).toBeTruthy();
    expect(queryByTestId("brand-mark")).not.toBeNull();
  });

  it("falls back to the store mark when the merchant splash fails to load", () => {
    const splashUrl = "https://cdn.example.com/stores/acme/missing-splash.png";
    useStoreConfigStore.setState({
      splashUrl,
      storeName: "Acme Outfitters",
      isLoaded: true,
      _hasHydrated: true,
    });

    const { getByText, getByTestId, queryByTestId, UNSAFE_getAllByType } =
      renderWithTamagui(<Splash />);
    const splash = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source?.uri === splashUrl
    );

    const { act } = require("@testing-library/react-native");
    act(() => {
      splash!.props.onError();
    });

    expect(queryByTestId("merchant-splash")).toBeNull();
    expect(getByTestId("brand-mark")).toBeTruthy();
    expect(getByText("Acme Outfitters")).toBeTruthy();
  });

  it("uses the app icon on the splash mark when no splash image or logo is set", () => {
    const iconUrl = "https://cdn.example.com/stores/acme/icon.png";
    useStoreConfigStore.setState({
      iconUrl,
      storeName: "Acme Outfitters",
      isLoaded: true,
      _hasHydrated: true,
    });

    const { getByTestId, queryByTestId, UNSAFE_getAllByType } =
      renderWithTamagui(<Splash />);
    const icon = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source?.uri === iconUrl
    );

    expect(queryByTestId("merchant-splash")).toBeNull();
    expect(getByTestId("brand-mark-icon")).toBeTruthy();
    expect(icon!.props.tintColor).toBeUndefined();
  });

  it("holds a blank field until store config hydrates", () => {
    useStoreConfigStore.setState({
      _hasHydrated: false,
      splashUrl: "https://cdn.example.com/stores/acme/splash.png",
      storeName: "Acme Outfitters",
      isLoaded: true,
    });

    const { getByTestId, queryByTestId, queryByText } = renderWithTamagui(
      <Splash />
    );

    expect(getByTestId("splash-pending")).toBeTruthy();
    expect(queryByTestId("merchant-splash")).toBeNull();
    expect(queryByTestId("brand-mark")).toBeNull();
    expect(queryByText(/cartaisy/i)).toBeNull();
  });
});
