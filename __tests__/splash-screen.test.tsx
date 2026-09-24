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
      storeName: "",
      isLoaded: false,
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
});
