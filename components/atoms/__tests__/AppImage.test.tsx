/**
 * Covers the fallback fix to AppImage.tsx.
 *
 * A remote image (`source` prop) that fails to load previously kept
 * rendering the broken remote <Image> forever (`hasError` was set but
 * never read). It also showed a generic gray shimmer while loading, even
 * for callers with a known-good bundled default — contradicting
 * MOBILE_RUNTIME_BRANDING_CONTRACT.md's "keep current bundled assets
 * visible until a remote logo finishes loading" (flagged by review on
 * PR #106 after the initial error-only fallback fix shipped).
 *
 * With `fallbackName` provided, AppImage now shows that bundled icon as an
 * overlay both while the remote image is loading AND if it fails, while
 * the real remote <Image> stays mounted (just visually covered) so it can
 * still finish loading or error in the background — swapping to the real
 * image only once it loads successfully. Callers that don't pass
 * `fallbackName` keep today's exact shimmer-while-loading,
 * blank-on-error behavior, unchanged — this must stay true for every
 * existing `<AppImage source={...}>` call site in the app.
 *
 * `@/assets/Icons` is mocked here with a plain number for
 * `cartaisyWhitelogo`, matching what `require(".png")` actually resolves to
 * at runtime (a numeric module ID) — jest-expo's asset transform instead
 * returns `{ testUri: ... }` under test, which doesn't match either the
 * number or the `{ uri }` branch AppImage's bundled-icon resolution checks
 * for, and would make every bundled (`name=`) icon render nothing under
 * test regardless of this fix. That's a pre-existing gap in the test
 * environment's asset mocking, unrelated to this change, so it's worked
 * around here rather than silently masked.
 */
import { act } from "@testing-library/react-native";
import React from "react";
import { Image } from "react-native";
import { updateTheme } from "tamagui";

const MOCK_LOGO_ASSET = 42;

jest.mock("@/assets/Icons", () => ({
  __esModule: true,
  default: { cartaisyWhitelogo: 42 },
}));

import { AppImage } from "@/components/atoms/AppImage";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

const REMOTE_URL = "https://cdn.cartaisy.com/logo.png";

const findBundled = (images: ReturnType<typeof Array.prototype.filter>) =>
  images.find((img: any) => img.props.source === MOCK_LOGO_ASSET);
const findRemote = (images: ReturnType<typeof Array.prototype.filter>) =>
  images.find(
    (img: any) =>
      typeof img.props.source === "object" && img.props.source?.uri === REMOTE_URL
  );

describe("AppImage", () => {
  it("shows the bundled icon while the remote image is still loading, when fallbackName is provided", () => {
    const { UNSAFE_getAllByType } = renderWithTamagui(
      <AppImage
        source={REMOTE_URL}
        fallbackName="cartaisyWhitelogo"
        width={75}
        height={26}
      />
    );

    // Loading hasn't resolved yet: the bundled icon is visible as an
    // overlay, and the real remote image stays mounted underneath so it
    // can still finish loading in the background.
    const images = UNSAFE_getAllByType(Image);
    expect(findBundled(images)).toBeTruthy();
    expect(findRemote(images)).toBeTruthy();
  });

  it("swaps to the loaded remote image once it finishes loading successfully, when fallbackName is provided", () => {
    const { UNSAFE_getAllByType } = renderWithTamagui(
      <AppImage
        source={REMOTE_URL}
        fallbackName="cartaisyWhitelogo"
        width={75}
        height={26}
      />
    );

    act(() => {
      findRemote(UNSAFE_getAllByType(Image))!.props.onLoadEnd();
    });

    // Loaded successfully: the bundled overlay is gone, only the real
    // image remains.
    const images = UNSAFE_getAllByType(Image);
    expect(findBundled(images)).toBeFalsy();
    expect(findRemote(images)).toBeTruthy();
  });

  it("keeps showing the bundled icon if the remote image fails to load, when fallbackName is provided", () => {
    const { UNSAFE_getAllByType } = renderWithTamagui(
      <AppImage
        source={REMOTE_URL}
        fallbackName="cartaisyWhitelogo"
        width={75}
        height={26}
      />
    );

    act(() => {
      findRemote(UNSAFE_getAllByType(Image))!.props.onError();
    });

    // Failed to load: the bundled icon stays visible, never a blank slot.
    const images = UNSAFE_getAllByType(Image);
    expect(findBundled(images)).toBeTruthy();
  });

  it("keeps rendering the broken remote image when fallbackName is not provided (today's unchanged behavior)", () => {
    const { UNSAFE_getByType } = renderWithTamagui(
      <AppImage source={REMOTE_URL} width={75} height={26} />
    );

    expect(UNSAFE_getByType(Image).props.source).toEqual({ uri: REMOTE_URL });

    act(() => {
      UNSAFE_getByType(Image).props.onError();
    });

    // No fallbackName was passed, so nothing swaps or overlays — the
    // component still tries to render the same broken remote source, and
    // there's still only ever one Image node in the tree, exactly as
    // before this fix. This is the "no behavior change for existing call
    // sites" guarantee the fix must preserve.
    expect(UNSAFE_getByType(Image).props.source).toEqual({ uri: REMOTE_URL });
  });

  it("renders a bundled icon by name unaffected by the fallback logic (unchanged path)", () => {
    const { UNSAFE_getByType } = renderWithTamagui(
      <AppImage name="cartaisyWhitelogo" width={75} height={26} />
    );

    expect(UNSAFE_getByType(Image).props.source).toBe(MOCK_LOGO_ASSET);
  });

  it("renders nothing when neither name nor a usable source is provided", () => {
    const { toJSON } = renderWithTamagui(<AppImage />);
    expect(toJSON()).toBeNull();
  });

  describe("tintColor reactivity (TICKETmobilereactivitygapsharedprimitives.md)", () => {
    const DEFAULT_PRIMARY_HEX = "#1C1917"; // tamagui/token.ts PRIMARY_COLOR — keep in sync

    afterEach(() => {
      // updateTheme() mutates a module-level singleton shared across tests —
      // reset it so this describe block can't leak into a later test file
      // run in the same worker.
      act(() => {
        updateTheme({ name: "light", theme: { primary: DEFAULT_PRIMARY_HEX } });
      });
    });

    it("resolves a $primary tintColor to the bundled color when no merchant override is set", () => {
      const { UNSAFE_getByType } = renderWithTamagui(
        <AppImage name="cartaisyWhitelogo" tintColor="$primary" width={20} height={20} />
      );
      expect(UNSAFE_getByType(Image).props.tintColor).toBe(DEFAULT_PRIMARY_HEX);
    });

    it("picks up a merchant primaryColor applied via updateTheme() with no rebuild — previously AppImage's tintColor stayed on the bundled default even after this (the exact case reproduced live in the 2026-08-06 integration run)", () => {
      const { UNSAFE_getByType } = renderWithTamagui(
        <AppImage name="cartaisyWhitelogo" tintColor="$primary" width={20} height={20} />
      );

      act(() => {
        updateTheme({ name: "light", theme: { primary: "#123456" } });
      });

      expect(UNSAFE_getByType(Image).props.tintColor).toBe("#123456");
    });

    it("still passes through a raw, non-token color string unchanged (unrecognized-token fallback behavior preserved)", () => {
      const { UNSAFE_getByType } = renderWithTamagui(
        <AppImage name="cartaisyWhitelogo" tintColor="#00FF00" width={20} height={20} />
      );
      expect(UNSAFE_getByType(Image).props.tintColor).toBe("#00FF00");
    });
  });
});
