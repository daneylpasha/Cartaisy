/**
 * Focused screen test for app/(tabs)/wishlist.tsx (GitHub issue #65):
 * the catalog/store unavailable state renders when the favorites query
 * fails with a controlled unavailable error, and retry refetches.
 *
 * Lives outside app/ on purpose: expo-router treats app/ as the route
 * tree, so test files must not be added there.
 */
import { fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-router", () => {
  const ReactActual = require("react");
  return {
    router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
    useFocusEffect: (callback: () => void | (() => void)) => {
      ReactActual.useEffect(callback, [callback]);
    },
  };
});

jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");
  return {
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    SafeAreaView: View,
  };
});

const mockFavoritesQuery = {
  data: undefined as unknown,
  error: null as unknown,
  isFetching: false,
  isLoading: false,
  refetch: jest.fn(),
};
jest.mock("@/api/generated/favorites/favorites", () => ({
  useGetDetailedFavorites: () => mockFavoritesQuery,
}));

jest.mock("@/components/molecules/ProductCard", () => ({ ProductCard: () => null }));

import WishlistScreen from "@/app/(tabs)/wishlist";
import useAuthStore from "@/store/useAuthStore";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

const controlledMessage =
  "This store's catalog is temporarily unavailable. Please try again later.";

describe("wishlist screen unavailable state", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ token: "fabricated-jwt", isGuest: false, _hasHydrated: true });
    mockFavoritesQuery.error = null;
    mockFavoritesQuery.isLoading = false;
    mockFavoritesQuery.isFetching = false;
  });

  it("renders the unavailable state with retry when favorites fail with a controlled error", async () => {
    mockFavoritesQuery.error = {
      response: { status: 403, data: { code: "STORE_INACTIVE" } },
    };

    const { getByText } = renderWithTamagui(<WishlistScreen />);

    await waitFor(() => expect(getByText("Wishlist unavailable")).toBeTruthy());
    expect(getByText(controlledMessage)).toBeTruthy();

    // The screen also refetches on focus, so assert the retry press adds a call.
    const callsBeforeRetry = mockFavoritesQuery.refetch.mock.calls.length;
    fireEvent.press(getByText("Try again"));
    expect(mockFavoritesQuery.refetch).toHaveBeenCalledTimes(callsBeforeRetry + 1);
  });

  it("does not render the unavailable state for a generic favorites error", () => {
    mockFavoritesQuery.error = new Error("network hiccup");

    const { queryByText } = renderWithTamagui(<WishlistScreen />);

    expect(queryByText("Wishlist unavailable")).toBeNull();
  });
});
