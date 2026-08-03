/**
 * Covers app/(tabs)/profile.tsx's runtime-branding wiring — same
 * source/fallbackName pattern already proven for HomeHeader.tsx (PR #106),
 * app/splash.tsx (PR #107), and the auth screens (PR #109), with one
 * difference specific to this surface: today's bundled footer logo renders
 * untinted (no tintColor at all), and neither branch below should gain one
 * as a side effect of this ticket — see the ticket's Section 1.
 *
 * The rest of the screen (orders, wishlist, addresses, auth state) is
 * mocked out heavily since this ticket only touches the footer logo; a
 * guest, logged-out render is enough surface to exercise the
 * ListFooterComponent both branches live in.
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

jest.mock("expo-router", () => {
  const ReactActual = require("react");
  return {
    router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
    useFocusEffect: (callback: () => void | (() => void)) => {
      ReactActual.useEffect(callback, []);
    },
  };
});

jest.mock("@react-navigation/native", () => {
  const ReactActual = require("react");
  return {
    useFocusEffect: (callback: () => void | (() => void)) => {
      ReactActual.useEffect(callback, []);
    },
  };
});

jest.mock("@/api/generated/customer-authentication/customer-authentication", () => ({
  useCustomerGetProfile: () => ({
    data: undefined,
    isLoading: false,
    refetch: jest.fn(),
  }),
}));

jest.mock("@/api/hooks/useAddresses", () => ({
  useAuthenticatedAddresses: () => ({ addresses: [] }),
}));

jest.mock("@/api/hooks/useOrders", () => ({
  useOrders: () => ({ data: undefined, refetch: jest.fn() }),
}));

jest.mock("@/contexts/AuthGuardContext", () => ({
  useAuthGuard: () => ({ showLoginModal: jest.fn() }),
}));

jest.mock("@/components/molecules/CustomAlert", () => ({
  useCustomAlert: () => ({ showAlert: jest.fn(), AlertComponent: () => null }),
}));

// Profile's own list sections aren't relevant to the footer-logo wiring
// this ticket touches; mocked out so the guest render stays lightweight.
jest.mock("@/components/molecules/profile/ActiveOrders", () => ({
  ActiveOrders: () => null,
}));
jest.mock("@/components/organisms/profile/ActiveListItems", () => ({
  ActiveListItem: () => null,
}));
jest.mock("@/components/organisms/profile/DangerZoneListItems", () => ({
  DangerZoneListItem: () => null,
}));
jest.mock("@/components/organisms/profile/GeneralListItems", () => ({
  GeneralListItems: () => null,
}));
jest.mock("@/components/organisms/profile/PaymentListItems", () => ({
  PaymentListItem: () => null,
}));
jest.mock("@/components/organisms/profile/SecurityListItems", () => ({
  SecurityListItem: () => null,
}));
jest.mock("@/components/organisms/profile/WishListCarousel", () => ({
  WishlistCarousel: () => null,
}));

import React from "react";
import { Image } from "react-native";

import ProfileScreen from "@/app/(tabs)/profile";
import useAuthStore from "@/store/useAuthStore";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

const MOCK_LOGO_ASSET = 77;

describe("Profile screen — runtime logo", () => {
  beforeEach(() => {
    useStoreConfigStore.setState({
      primaryColor: undefined,
      secondaryColor: undefined,
      logoUrl: undefined,
    });
    // Guest state — _hasHydrated must be true or the screen renders only
    // the loading spinner, never reaching the FlatList/footer at all.
    useAuthStore.setState({
      isGuest: true,
      token: null,
      _hasHydrated: true,
    } as any);
  });

  it("renders the bundled footer logo untinted when the store has no branding set (today's default)", () => {
    const { UNSAFE_getAllByType } = renderWithTamagui(<ProfileScreen />);

    const logoImage = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source === MOCK_LOGO_ASSET
    );
    expect(logoImage).toBeTruthy();
    expect(logoImage!.props.tintColor).toBeUndefined();
  });

  it("does not tint the bundled footer logo even when a runtime primaryColor is set — this surface has no tint today and shouldn't gain one", () => {
    useStoreConfigStore.setState({ primaryColor: "#123456" });

    const { UNSAFE_getAllByType } = renderWithTamagui(<ProfileScreen />);

    const logoImage = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source === MOCK_LOGO_ASSET
    );
    expect(logoImage).toBeTruthy();
    expect(logoImage!.props.tintColor).toBeUndefined();
  });

  it("renders the runtime footer logo untinted when logoUrl is present", () => {
    const logoUrl = "https://cdn.cartaisy.com/stores/acme/logo.png";
    useStoreConfigStore.setState({ logoUrl });

    const { UNSAFE_getAllByType } = renderWithTamagui(<ProfileScreen />);

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

    const { UNSAFE_getAllByType } = renderWithTamagui(<ProfileScreen />);

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

    const logoImage = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source === MOCK_LOGO_ASSET
    );
    expect(logoImage).toBeTruthy();
    expect(logoImage!.props.tintColor).toBeUndefined();
  });

  // NOTE on the remount/key regression: same finding as PRs #107/#108/#109
  // — this codebase's Jest/react-test-renderer setup flushes passive
  // effects synchronously even for state updates outside `act()`, so a
  // test simulating logoUrl arriving after mount (or one non-empty
  // logoUrl swapping to a different one) would still pass on a build with
  // the `key` props removed or de-suffixed. Not included here for the
  // same reason those tickets gave; the `key`s are applied per the
  // established, review-proven pattern regardless.
});
