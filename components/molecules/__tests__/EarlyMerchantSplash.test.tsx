jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve(true)),
  hideAsync: jest.fn(() => Promise.resolve(true)),
}));

jest.mock("@/api/config/mobileConfig", () => ({
  mobileConfig: {
    apiBaseUrl: "https://api.example.test/api/v1",
    storeId: "507f1f77bcf86cd799439011",
  },
}));

import React from "react";
import { Image } from "react-native";
import { act, render } from "@testing-library/react-native";
import * as SplashScreen from "expo-splash-screen";

import { EarlyMerchantSplash } from "@/components/molecules/EarlyMerchantSplash";
import useStoreConfigStore from "@/store/useStoreConfigStore";

const CONFIGURED_STORE_ID = "507f1f77bcf86cd799439011";

describe("EarlyMerchantSplash", () => {
  beforeEach(() => {
    jest.mocked(SplashScreen.hideAsync).mockClear();
    useStoreConfigStore.setState({
      splashUrl: undefined,
      iconUrl: undefined,
      logoUrl: undefined,
      storeId: undefined,
      _hasHydrated: false,
    });
  });

  it("leaves the native splash up when no merchant splash is stored", () => {
    useStoreConfigStore.setState({ _hasHydrated: true });

    const { queryByTestId, UNSAFE_queryAllByType } = render(
      <EarlyMerchantSplash />
    );

    expect(queryByTestId("merchant-splash")).toBeNull();
    expect(UNSAFE_queryAllByType(Image)).toHaveLength(0);
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
  });

  it("shows the persisted merchant splash and hides the native splash only after it loads", () => {
    const splashUrl = "https://cdn.example.com/stores/acme/splash.png";
    useStoreConfigStore.setState({
      splashUrl,
      storeId: CONFIGURED_STORE_ID,
      _hasHydrated: true,
    });

    const { getByTestId, UNSAFE_getAllByType } = render(<EarlyMerchantSplash />);
    const splash = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source?.uri === splashUrl
    );

    expect(getByTestId("merchant-splash")).toBeTruthy();
    expect(splash).toBeTruthy();
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();

    act(() => {
      splash!.props.onLoad();
    });

    expect(SplashScreen.hideAsync).toHaveBeenCalled();
  });

  it("keeps the native splash when the cached splash belongs to another store", () => {
    useStoreConfigStore.setState({
      splashUrl: "https://cdn.example.com/stores/other/splash.png",
      storeId: "aaaaaaaaaaaaaaaaaaaaaaaa",
      _hasHydrated: true,
    });

    const { queryByTestId, UNSAFE_queryAllByType } = render(
      <EarlyMerchantSplash />
    );

    expect(queryByTestId("merchant-splash")).toBeNull();
    expect(UNSAFE_queryAllByType(Image)).toHaveLength(0);
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
  });

  it("keeps the native splash when the cached splash has no store id", () => {
    useStoreConfigStore.setState({
      splashUrl: "https://cdn.example.com/stores/acme/splash.png",
      storeId: undefined,
      _hasHydrated: true,
    });

    const { queryByTestId } = render(<EarlyMerchantSplash />);

    expect(queryByTestId("merchant-splash")).toBeNull();
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
  });

  it("does not hide the native splash when the merchant image fails", () => {
    const splashUrl = "https://cdn.example.com/stores/acme/splash.png";
    useStoreConfigStore.setState({
      splashUrl,
      storeId: CONFIGURED_STORE_ID,
      _hasHydrated: true,
    });

    const { queryByTestId, UNSAFE_getAllByType } = render(
      <EarlyMerchantSplash />
    );
    const splash = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source?.uri === splashUrl
    );

    act(() => {
      splash!.props.onError();
    });

    expect(queryByTestId("merchant-splash")).toBeNull();
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
  });

  it("does not paint a splash URL before store config hydrates", () => {
    useStoreConfigStore.setState({
      splashUrl: "https://cdn.example.com/stores/acme/splash.png",
      _hasHydrated: false,
    });

    const { queryByTestId } = render(<EarlyMerchantSplash />);

    expect(queryByTestId("merchant-splash")).toBeNull();
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
  });

  it("does not render or reveal a token-shaped splash URL", () => {
    useStoreConfigStore.setState({
      splashUrl: "https://cdn.example.com/splash.png?access_token=shpat_secret",
      _hasHydrated: true,
    });

    const { queryByTestId } = render(<EarlyMerchantSplash />);

    expect(queryByTestId("merchant-splash")).toBeNull();
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
  });
});
