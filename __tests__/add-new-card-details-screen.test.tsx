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

describe("Add New Card Details screen — runtime logo", () => {
  beforeEach(() => {
    useStoreConfigStore.setState({
      primaryColor: undefined,
      secondaryColor: undefined,
      logoUrl: undefined,
      storeName: "",
      isLoaded: false,
    });
  });

  it("shows a neutral monogram instead of a Cartaisy wordmark when no logo or name is set", () => {
    const { getByTestId, queryByText } = renderWithTamagui(<AddNewCardDetails />);

    expect(getByTestId("brand-mark-monogram")).toBeTruthy();
    expect(queryByText(/cartaisy/i)).toBeNull();
  });

  it("shows the store name on the card when branding has no logo", () => {
    useStoreConfigStore.setState({
      storeName: "Northwind Goods",
      isLoaded: true,
      primaryColor: "#123456",
    });

    const { getByText, queryByTestId } = renderWithTamagui(<AddNewCardDetails />);

    expect(getByText("Northwind Goods")).toBeTruthy();
    expect(queryByTestId("brand-mark-logo")).toBeNull();
  });

  it("renders the runtime logo untinted when logoUrl is present", () => {
    const logoUrl = "https://cdn.example.com/stores/acme/logo.png";
    useStoreConfigStore.setState({
      logoUrl,
      primaryColor: "#123456",
      storeName: "Acme",
      isLoaded: true,
    });

    const { UNSAFE_getAllByType } = renderWithTamagui(<AddNewCardDetails />);
    const remoteLogo = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source?.uri === logoUrl
    );

    expect(remoteLogo).toBeTruthy();
    expect(remoteLogo!.props.tintColor).toBeUndefined();
  });

  it("gives the runtime logo an explicit height so a real network image can actually size itself", () => {
    const logoUrl = "https://cdn.example.com/stores/acme/logo.png";
    useStoreConfigStore.setState({ logoUrl });

    const { UNSAFE_getAllByType } = renderWithTamagui(<AddNewCardDetails />);

    const remoteLogo = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source?.uri === logoUrl
    );
    expect(remoteLogo).toBeTruthy();
    const resolvedStyle = Object.assign({}, ...[].concat(remoteLogo!.props.style));
    expect(resolvedStyle.height).toBe(24);
  });

  it("falls back to a neutral monogram when the runtime logoUrl fails and no name is loaded", () => {
    const logoUrl = "https://cdn.example.com/stores/acme/unreachable-logo.png";
    useStoreConfigStore.setState({ logoUrl });

    const { getByTestId, queryByText, UNSAFE_getAllByType } = renderWithTamagui(
      <AddNewCardDetails />
    );
    const remoteLogo = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source?.uri === logoUrl
    );

    const { act } = require("@testing-library/react-native");
    act(() => {
      remoteLogo!.props.onError();
    });

    expect(getByTestId("brand-mark-monogram")).toBeTruthy();
    expect(queryByText(/cartaisy/i)).toBeNull();
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
