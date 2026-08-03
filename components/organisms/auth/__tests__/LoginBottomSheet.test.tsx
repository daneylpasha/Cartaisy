/**
 * Covers LoginBottomSheet.tsx's runtime-branding wiring — see
 * __tests__/login-screen.test.tsx's header comment for the shared context
 * (same pattern, same tint-split design decision) and why the remount/key
 * regression is not covered by an automated test.
 *
 * `@/assets/Icons` is partially mocked so `cartaisyColorlogo` resolves to a
 * distinguishable numeric sentinel instead of jest-expo's `{ testUri }`
 * asset-transform shape — see AppImage.test.tsx for why that transform
 * shape can't be resolved by AppImage's bundled-icon lookup under test.
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

jest.mock("@/api/hooks/useAuth", () => ({
  useLogin: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
}));

jest.mock("@/api/generated/cart/cart", () => ({
  getCart: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// The real @gorhom/bottom-sheet stack needs react-native-gesture-handler's
// native `install()` call and reanimated worklets to actually animate a
// sheet open — neither is mocked anywhere in this codebase (confirmed:
// nothing else here renders GestureHandlerRootView or BottomSheetModal
// under test; contexts/__tests__/AuthGuardContext.test.tsx mocks
// LoginBottomSheet out entirely rather than deal with it). Since none of
// this ticket's changes touch bottom-sheet internals — only what's inside
// the sheet's own content — @gorhom/bottom-sheet is mocked to a plain
// always-rendered View here so the actual logo-rendering logic under test
// runs for real, unblocked by a third-party animation library's own jest
// setup requirements.
jest.mock("@gorhom/bottom-sheet", () => {
  const ReactActual = require("react");
  const { View } = require("react-native");
  const BottomSheetModal = ReactActual.forwardRef(
    ({ children }: { children: React.ReactNode }, ref: React.Ref<unknown>) => {
      ReactActual.useImperativeHandle(ref, () => ({
        present: () => {},
        dismiss: () => {},
        expand: () => {},
        close: () => {},
      }));
      return <View>{children}</View>;
    }
  );
  return {
    __esModule: true,
    BottomSheetModal,
    BottomSheetModalProvider: ({ children }: { children: React.ReactNode }) =>
      children,
    BottomSheetScrollView: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
    BottomSheetBackdrop: () => null,
    BottomSheetFooter: () => null,
  };
});

import React from "react";
import { Image } from "react-native";

import {
  LoginBottomSheet,
  LoginBottomSheetRef,
} from "@/components/organisms/auth/LoginBottomSheet";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

const MOCK_LOGO_ASSET = 77;
const DEFAULT_PRIMARY_HEX = "#A82A50"; // tamagui/token.ts PRIMARY_COLOR

// The mocked BottomSheetModal above always renders its children (no
// present()-gating), so this sheet's content — including the logo block
// under test — is present from the initial render.
const renderSheet = () => {
  const ref = React.createRef<LoginBottomSheetRef>();
  return renderWithTamagui(<LoginBottomSheet ref={ref} />);
};

describe("LoginBottomSheet — runtime logo", () => {
  beforeEach(() => {
    useStoreConfigStore.setState({
      primaryColor: undefined,
      secondaryColor: undefined,
      logoUrl: undefined,
    });
  });

  it("renders the bundled logo tinted $primary when the store has no branding set (today's default)", () => {
    const { UNSAFE_getAllByType } = renderSheet();

    const logoImage = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source === MOCK_LOGO_ASSET
    );
    expect(logoImage).toBeTruthy();
    expect(logoImage!.props.tintColor).toBe(DEFAULT_PRIMARY_HEX);
  });

  it("tints the bundled fallback logo with the runtime primaryColor when set but logoUrl is absent", () => {
    useStoreConfigStore.setState({ primaryColor: "#123456" });

    const { UNSAFE_getAllByType } = renderSheet();

    const logoImage = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source === MOCK_LOGO_ASSET
    );
    expect(logoImage).toBeTruthy();
    expect(logoImage!.props.tintColor).toBe("#123456");
  });

  it("renders the runtime logo untinted when logoUrl is present, never applying $primary or the runtime primaryColor to it", () => {
    const logoUrl = "https://cdn.cartaisy.com/stores/acme/logo.png";
    useStoreConfigStore.setState({ logoUrl, primaryColor: "#123456" });

    const { UNSAFE_getAllByType } = renderSheet();

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

    const { UNSAFE_getAllByType } = renderSheet();

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

    // Falls back to the bundled logo, not a blank space. Untinted (not
    // "bundled+tinted") for the same reason documented in
    // login-screen.test.tsx: the runtime AppImage call intentionally
    // passes no tintColor, and AppImage.tsx shares one tintColor between
    // its remote image and this fallback overlay.
    const logoImage = UNSAFE_getAllByType(Image).find(
      (img) => img.props.source === MOCK_LOGO_ASSET
    );
    expect(logoImage).toBeTruthy();
    expect(logoImage!.props.tintColor).toBeUndefined();
  });

  // See __tests__/login-screen.test.tsx for why a remount/key regression
  // test isn't included: written, run against this component with both
  // `key` props removed, and it still passed — same synchronous-effect-
  // flushing limitation PR #107/#108 already documented for this harness.
});
