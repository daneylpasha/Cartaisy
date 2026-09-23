import { fireEvent } from "@testing-library/react-native";
import React from "react";

import { useGetInitialSearchScreen } from "@/api/generated/search/search";
import DefaultHome from "@/components/organisms/home/DefaultHome";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock("@/components/organisms/home/Placeholder", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    __esModule: true,
    default: () => React.createElement(Text, null, "Loading home"),
  };
});

jest.mock("@/components/molecules/ProductCard", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    ProductCard: ({ product }: { product: { title: string } }) =>
      React.createElement(Text, null, product.title),
  };
});

jest.mock("@/api/generated/search/search", () => ({
  useGetInitialSearchScreen: jest.fn(),
}));

const { router } = jest.requireMock("expo-router");
const useInitialSearch = useGetInitialSearchScreen as jest.Mock;

const catalog = {
  success: true,
  data: {
    trendingProducts: [
      {
        productId: "p1",
        title: "Ceramic Pour-Over",
        description: "",
        images: ["https://cdn.example/pour-over.jpg"],
        price: 42,
        compareAtPrice: 0,
        currency: "USD",
        inStock: true,
        availableQuantity: 4,
        totalQuantity: 4,
        handle: "ceramic-pour-over",
        vendor: "Northwind",
        tags: [],
        rating: 0,
        reviewsCount: 0,
      },
    ],
    trendingCollections: [
      {
        id: "gid://shopify/Collection/88",
        title: "Kitchen",
        handle: "kitchen",
        image: "https://cdn.example/kitchen.jpg",
        products: [],
      },
    ],
  },
};

describe("DefaultHome", () => {
  const refetchCatalog = jest.fn();
  const onRefreshHomescreen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useStoreConfigStore.setState({
      storeName: "Northwind Goods",
      isLoaded: true,
      logoUrl: "https://cdn.example/logo.png",
      primaryColor: "#123456",
    });
    useInitialSearch.mockReturnValue({
      data: catalog,
      isLoading: false,
      isError: false,
      error: null,
      isRefetching: false,
      refetch: refetchCatalog,
    });
  });

  it("renders a branded hero, featured products, and collections from catalog data", () => {
    const { getByText, getByTestId } = renderWithTamagui(
      <DefaultHome onRefreshHomescreen={onRefreshHomescreen} />
    );

    expect(getByTestId("default-home-hero")).toBeTruthy();
    expect(getByText("Northwind Goods")).toBeTruthy();
    expect(getByText("Selected from the shop")).toBeTruthy();
    expect(getByText("Featured")).toBeTruthy();
    expect(getByText("Ceramic Pour-Over")).toBeTruthy();
    expect(getByText("Collections")).toBeTruthy();
    expect(getByText("Kitchen")).toBeTruthy();
    expect(useInitialSearch).toHaveBeenCalledWith(
      { limit: 12 },
      expect.objectContaining({ query: expect.any(Object) })
    );
  });

  it("opens the hero collection and a collection card without editing catalog data", () => {
    const { getByTestId, getByText } = renderWithTamagui(
      <DefaultHome onRefreshHomescreen={onRefreshHomescreen} />
    );

    fireEvent.press(getByTestId("default-home-browse"));
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/products",
      params: { collectionId: "88", categoryName: "Kitchen" },
    });

    fireEvent.press(getByText("Kitchen"));
    expect(router.push).toHaveBeenLastCalledWith({
      pathname: "/products",
      params: { collectionId: "88", categoryName: "Kitchen" },
    });
  });

  it("shows a calm empty state and retries both the catalog and the homescreen", () => {
    useInitialSearch.mockReturnValue({
      data: { success: true, data: { trendingProducts: [], trendingCollections: [] } },
      isLoading: false,
      isError: false,
      error: null,
      isRefetching: false,
      refetch: refetchCatalog,
    });

    const { getByText, getByTestId } = renderWithTamagui(
      <DefaultHome onRefreshHomescreen={onRefreshHomescreen} />
    );

    expect(getByText("Nothing to show yet")).toBeTruthy();
    expect(getByText("Products will show up here once they're available.")).toBeTruthy();

    fireEvent.press(getByTestId("default-home-retry"));
    expect(refetchCatalog).toHaveBeenCalledTimes(1);
    expect(onRefreshHomescreen).toHaveBeenCalledTimes(1);
  });

  it("shows an error state with retry when the catalog request fails", () => {
    useInitialSearch.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("network"),
      isRefetching: false,
      refetch: refetchCatalog,
    });

    const { getByText } = renderWithTamagui(
      <DefaultHome onRefreshHomescreen={onRefreshHomescreen} />
    );

    expect(getByText("Unable to load home")).toBeTruthy();
    expect(getByText("We couldn't load the home. Please try again.")).toBeTruthy();

    fireEvent.press(getByText("Try again"));
    expect(refetchCatalog).toHaveBeenCalledTimes(1);
    expect(onRefreshHomescreen).toHaveBeenCalledTimes(1);
  });

  it("shows the loading placeholder before catalog data arrives", () => {
    useInitialSearch.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      isRefetching: false,
      refetch: refetchCatalog,
    });

    const { getByText, queryByTestId } = renderWithTamagui(
      <DefaultHome onRefreshHomescreen={onRefreshHomescreen} />
    );

    expect(getByText("Loading home")).toBeTruthy();
    expect(queryByTestId("default-home")).toBeNull();
  });

  it("uses a generic welcome title when the store name is not loaded", () => {
    useStoreConfigStore.setState({ storeName: "", isLoaded: false, logoUrl: undefined });

    const { getByText, queryByText } = renderWithTamagui(
      <DefaultHome onRefreshHomescreen={onRefreshHomescreen} />
    );

    expect(getByText("Welcome")).toBeTruthy();
    expect(queryByText("Cartaisy")).toBeNull();
  });
});
