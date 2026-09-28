jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve(true)),
  hideAsync: jest.fn(() => Promise.resolve(true)),
}));

import React from "react";
import { Image } from "react-native";
import { render } from "@testing-library/react-native";
import * as SplashScreen from "expo-splash-screen";

import { EarlyMerchantSplash } from "@/components/molecules/EarlyMerchantSplash";
import useStoreConfigStore from "@/store/useStoreConfigStore";

describe("EarlyMerchantSplash", () => {
  beforeEach(() => {
    jest.mocked(SplashScreen.hideAsync).mockClear();
    useStoreConfigStore.setState({
      splashUrl: undefined,
      iconUrl: undefined,
      logoUrl: undefined,
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

  it("shows the persisted merchant splash and hides the native splash once hydrated", () => {
    const splashUrl = "https://cdn.example.com/stores/acme/splash.png";
    useStoreConfigStore.setState({ splashUrl, _hasHydrated: true });

    const { getByTestId, UNSAFE_getAllByType } = render(<EarlyMerchantSplash />);
    const splash = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source?.uri === splashUrl
    );

    expect(getByTestId("merchant-splash")).toBeTruthy();
    expect(splash).toBeTruthy();
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
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
