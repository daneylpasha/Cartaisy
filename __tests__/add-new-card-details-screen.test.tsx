/**
 * Covers app/addNewCardDetails.tsx's runtime-branding wiring — same
 * source/fallbackName pattern already proven for HomeHeader.tsx (PR #106),
 * app/splash.tsx (PR #107), and the auth screens (PR #109). Like those
 * screens, today's bundled logo here is tinted ($primary), and that tint
 * must NOT be carried over onto a real merchant's uploaded logo.
 *
 * The rest of the screen (Stripe card entry, address form, DOB bottom
 * sheet) is mocked out heavily since this ticket only touches the card
 * mockup's logo; those mocks let the screen render without a Stripe
 * provider or a real bottom-sheet/gesture-handler stack.
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

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

jest.mock("@stripe/stripe-react-native", () => {
  const ReactActual = require("react");
  return {
    useStripe: () => ({ createPaymentMethod: jest.fn() }),
    CardField: () => null,
    // Only used as a type import in the real file; a stub keeps the
    // require from throwing if anything touches it at runtime.
    CardFieldInput: {},
  };
});

jest.mock("@/api/generated/payment-methods/payment-methods", () => ({
  useAddPaymentMethod: () => ({ mutate: jest.fn(), isPending: false }),
  useListPaymentMethods: () => ({ data: { data: { paymentMethods: [] } } }),
}));

jest.mock("@/components/molecules/bottom-sheets", () => {
  const ReactActual = require("react");
  return {
    BottomSheetModalWithView: ReactActual.forwardRef(() => null),
  };
});

jest.mock("@/components/organisms/paymentmethod/CardLinkModal", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("react-native-calendars", () => ({
  Calendar: () => null,
}));

jest.mock("react-native-keyboard-aware-scroll-view", () => {
  const ReactActual = require("react");
  const { ScrollView } = require("react-native");
  return {
    KeyboardAwareScrollView: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
    }) => ReactActual.createElement(ScrollView, props, children),
  };
});

import React from "react";
import { Image } from "react-native";

import AddNewCardDetails from "@/app/addNewCardDetails";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

const MOCK_LOGO_ASSET = 77;
const DEFAULT_PRIMARY_HEX = "#A82A50"; // tamagui/token.ts PRIMARY_COLOR

describe("Add New Card Details screen — runtime logo", () => {
  beforeEach(() => {
    useStoreConfigStore.setState({
      primaryColor: undefined,
      secondaryColor: undefined,
      logoUrl: undefined,
    });
  });

  it("renders the bundled logo tinted $primary when the store has no branding set (today's default)", () => {
    const { UNSAFE_getAllByType } = renderWithTamagui(<AddNewCardDetails />);

    const logoImage = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source === MOCK_LOGO_ASSET
    );
    expect(logoImage).toBeTruthy();
    expect(logoImage!.props.tintColor).toBe(DEFAULT_PRIMARY_HEX);
  });

  it("tints the bundled fallback logo with the runtime primaryColor when set but logoUrl is absent", () => {
    useStoreConfigStore.setState({ primaryColor: "#123456" });

    const { UNSAFE_getAllByType } = renderWithTamagui(<AddNewCardDetails />);

    const logoImage = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source === MOCK_LOGO_ASSET
    );
    expect(logoImage).toBeTruthy();
    expect(logoImage!.props.tintColor).toBe("#123456");
  });

  it("renders the runtime logo untinted when logoUrl is present, never applying $primary or the runtime primaryColor to it", () => {
    const logoUrl = "https://cdn.cartaisy.com/stores/acme/logo.png";
    useStoreConfigStore.setState({ logoUrl, primaryColor: "#123456" });

    const { UNSAFE_getAllByType } = renderWithTamagui(<AddNewCardDetails />);

    const images = UNSAFE_getAllByType(Image);
    const remoteLogo = images.find(
      (img) =>
        typeof img.props.source === "object" &&
        img.props.source?.uri === logoUrl
    );
    expect(remoteLogo).toBeTruthy();
    expect(remoteLogo!.props.tintColor).toBeUndefined();
  });

  it("gives the runtime logo an explicit height so a real network image can actually size itself (caught in review, PR #111)", () => {
    const logoUrl = "https://cdn.cartaisy.com/stores/acme/logo.png";
    useStoreConfigStore.setState({ logoUrl });

    const { UNSAFE_getAllByType } = renderWithTamagui(<AddNewCardDetails />);

    const remoteLogo = UNSAFE_getAllByType(Image).find(
      (img) =>
        typeof img.props.source === "object" &&
        img.props.source?.uri === logoUrl
    );
    expect(remoteLogo).toBeTruthy();
    // Regression guard for the width-only bug: without an explicit height,
    // React Native cannot size a network <Image>, so it renders at zero
    // height and is effectively invisible. width-only "worked" for the
    // bundled fallback only because that's a local require()'d asset with
    // build-time-known dimensions — not true for this remote path.
    const resolvedStyle = Object.assign({}, ...[].concat(remoteLogo!.props.style));
    expect(resolvedStyle.height).toBe(24);
  });

  it("falls back to the bundled cartaisyColorlogo when the runtime logoUrl fails to load", () => {
    const logoUrl = "https://cdn.cartaisy.com/stores/acme/unreachable-logo.png";
    useStoreConfigStore.setState({ logoUrl });

    const { UNSAFE_getAllByType } = renderWithTamagui(<AddNewCardDetails />);

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

    // Same disclosed tradeoff as the auth screens: AppImage applies one
    // tintColor to both the remote image and the fallback overlay, and the
    // runtime call passes none — so this fallback-on-error render is
    // untinted too, unlike the "no logoUrl at all" bundled branch above.
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
