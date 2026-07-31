/**
 * Covers the fallback fix to AppImage.tsx: a remote image (`source` prop)
 * that fails to load previously kept rendering the broken remote <Image>
 * forever (`hasError` was set but never read). It now swaps to a bundled
 * icon when the caller opts in via `fallbackName`, and keeps today's exact
 * behavior (still renders the broken remote image, nothing changes) when
 * `fallbackName` isn't passed — this must stay true for every existing
 * `<AppImage source={...}>` call site in the app that doesn't pass it.
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

const MOCK_LOGO_ASSET = 42;

jest.mock("@/assets/Icons", () => ({
  __esModule: true,
  default: { cartaisyWhitelogo: 42 },
}));

import { AppImage } from "@/components/atoms/AppImage";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

const REMOTE_URL = "https://cdn.cartaisy.com/logo.png";

describe("AppImage", () => {
  it("renders the bundled fallback icon once the remote image errors, when fallbackName is provided", () => {
    const { UNSAFE_getByType } = renderWithTamagui(
      <AppImage
        source={REMOTE_URL}
        fallbackName="cartaisyWhitelogo"
        width={75}
        height={26}
      />
    );

    // Before the error: still the remote image, same as always.
    expect(UNSAFE_getByType(Image).props.source).toEqual({ uri: REMOTE_URL });

    act(() => {
      UNSAFE_getByType(Image).props.onError();
    });

    // After the error: swapped to the bundled fallback asset, not left
    // pointing at the broken remote URL.
    expect(UNSAFE_getByType(Image).props.source).toBe(MOCK_LOGO_ASSET);
  });

  it("keeps rendering the broken remote image when fallbackName is not provided (today's unchanged behavior)", () => {
    const { UNSAFE_getByType } = renderWithTamagui(
      <AppImage source={REMOTE_URL} width={75} height={26} />
    );

    expect(UNSAFE_getByType(Image).props.source).toEqual({ uri: REMOTE_URL });

    act(() => {
      UNSAFE_getByType(Image).props.onError();
    });

    // No fallbackName was passed, so nothing swaps — the component still
    // tries to render the same broken remote source, exactly as it did
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
});
