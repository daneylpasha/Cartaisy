jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import React from "react";
import { Image } from "react-native";
import { act } from "@testing-library/react-native";

import { BrandMark } from "@/components/molecules/BrandMark";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

describe("BrandMark", () => {
  beforeEach(() => {
    useStoreConfigStore.setState({
      logoUrl: undefined,
      iconUrl: undefined,
      splashUrl: undefined,
      storeName: "Acme Outfitters",
      isLoaded: true,
      primaryColor: undefined,
    });
  });

  it("uses the square app icon when the store has no logo", () => {
    const iconUrl = "https://cdn.example.com/stores/acme/icon.png";
    useStoreConfigStore.setState({ iconUrl });

    const { getByTestId, queryByTestId, UNSAFE_getAllByType } =
      renderWithTamagui(<BrandMark />);
    const icon = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source?.uri === iconUrl
    );

    expect(getByTestId("brand-mark-icon")).toBeTruthy();
    expect(queryByTestId("brand-mark-logo")).toBeNull();
    expect(icon!.props.tintColor).toBeUndefined();
  });

  it("keeps the logo when both a logo and an app icon are published", () => {
    const logoUrl = "https://cdn.example.com/stores/acme/logo.png";
    useStoreConfigStore.setState({
      logoUrl,
      iconUrl: "https://cdn.example.com/stores/acme/icon.png",
    });

    const { getByTestId, queryByTestId, UNSAFE_getAllByType } =
      renderWithTamagui(<BrandMark />);
    const logo = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source?.uri === logoUrl
    );

    expect(getByTestId("brand-mark-logo")).toBeTruthy();
    expect(queryByTestId("brand-mark-icon")).toBeNull();
    expect(logo).toBeTruthy();
  });

  it("does not render a token-shaped icon URL", () => {
    useStoreConfigStore.setState({
      iconUrl: "https://cdn.example.com/icon.png?access_token=shpat_secret",
    });

    const { getByText, queryByTestId } = renderWithTamagui(<BrandMark />);

    expect(queryByTestId("brand-mark-icon")).toBeNull();
    expect(getByText("Acme Outfitters")).toBeTruthy();
  });

  it("falls back to the app icon when the logo fails to load", () => {
    const logoUrl = "https://cdn.example.com/stores/acme/logo.png";
    const iconUrl = "https://cdn.example.com/stores/acme/icon.png";
    useStoreConfigStore.setState({ logoUrl, iconUrl });

    const { getByTestId, queryByTestId, UNSAFE_getAllByType } =
      renderWithTamagui(<BrandMark />);
    const logo = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source?.uri === logoUrl
    );

    const { act } = require("@testing-library/react-native");
    act(() => {
      logo!.props.onError();
    });

    expect(queryByTestId("brand-mark-logo")).toBeNull();
    expect(getByTestId("brand-mark-icon")).toBeTruthy();
  });

  it("falls back to the store name when the app icon fails to load", () => {
    const iconUrl = "https://cdn.example.com/stores/acme/icon.png";
    useStoreConfigStore.setState({ iconUrl });

    const { getByText, queryByTestId, UNSAFE_getAllByType } = renderWithTamagui(
      <BrandMark />
    );
    const icon = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source?.uri === iconUrl
    );

    const { act } = require("@testing-library/react-native");
    act(() => {
      icon!.props.onError();
    });

    expect(queryByTestId("brand-mark-icon")).toBeNull();
    expect(getByText("Acme Outfitters")).toBeTruthy();
  });

  it("keeps a loaded logo visible when only the unused icon URL changes", () => {
    const logoUrl = "https://cdn.example.com/stores/acme/logo.png";
    useStoreConfigStore.setState({
      logoUrl,
      iconUrl: "https://cdn.example.com/stores/acme/icon.png",
    });

    const { getByTestId, queryByTestId, UNSAFE_getAllByType } =
      renderWithTamagui(<BrandMark />);
    const logo = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source?.uri === logoUrl
    );

    act(() => {
      logo!.props.onLoad();
    });

    expect(getByTestId("brand-mark-logo").props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ opacity: 1 })])
    );

    act(() => {
      useStoreConfigStore.setState({
        iconUrl: "https://cdn.example.com/stores/acme/icon-v2.png",
      });
    });

    const logoAfter = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source?.uri === logoUrl
    );

    expect(getByTestId("brand-mark-logo")).toBeTruthy();
    expect(queryByTestId("brand-mark-icon")).toBeNull();
    expect(queryByTestId("brand-mark-name")).toBeNull();
    expect(logoAfter!.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ opacity: 1 })])
    );
  });
});
