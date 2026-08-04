/**
 * Covers the Phase 3 dynamic-runtime-theming mechanism: useDynamicPrimaryTheme
 * mutates the live Tamagui theme (via `updateTheme`, the same public API that
 * powers light/dark mode switching) whenever the store's `primaryColor`
 * changes, so `$primary`/`$primarylight`-styled surfaces reflect the
 * merchant's brand color even though they never manually read the store.
 *
 * The two components rendered here (ToggleSwitch, OrderTimeline) were never
 * wired for branding by any prior ticket — they're picked specifically
 * *because* they're ordinary, untouched `$primary`/`$primarylight` consumers,
 * to prove the mechanism actually cascades rather than asserting on the
 * mechanism's own internals.
 */
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import React from "react";
import { StyleSheet, View } from "react-native";
import { act } from "@testing-library/react-native";

import { ToggleSwitch } from "@/components/molecules/ToggleSwitch";
import OrderTimeline from "@/components/molecules/orders/OrderTrackingTimeline";
import { useDynamicPrimaryTheme } from "@/hooks/useDynamicPrimaryTheme";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

const DEFAULT_PRIMARY_HEX = "#A82A50"; // tamagui/token.ts PRIMARY_COLOR — keep in sync

// A tiny harness that mounts the hook exactly like AppInitializer does,
// alongside a real, previously-unwired $primary consumer.
const ThemeSyncHarness = ({ children }: { children: React.ReactNode }) => {
  useDynamicPrimaryTheme();
  return <>{children}</>;
};

const renderToggleOn = () =>
  renderWithTamagui(
    <ThemeSyncHarness>
      <ToggleSwitch value onValueChange={jest.fn()} />
    </ThemeSyncHarness>
  );

const getToggleTrackColor = (getAllByType: any) => {
  // ToggleSwitch wraps its $primary/$grey-styled XStack in OpTouch
  // (TouchableOpacity, which renders its own unstyled wrapper View first),
  // so don't assume index 0 — find the rendered View whose flattened style
  // actually carries a hex backgroundColor (the knob's Animated.View is a
  // sibling with a plain "white" background, not hex, so this is unambiguous).
  const views = getAllByType(View) as any[];
  const withHexBackground = views
    .map((v) => StyleSheet.flatten(v.props.style).backgroundColor)
    .find((color: unknown) => typeof color === "string" && color.startsWith("#"));
  return withHexBackground;
};

describe("useDynamicPrimaryTheme", () => {
  beforeEach(() => {
    useStoreConfigStore.setState({
      primaryColor: undefined,
      secondaryColor: undefined,
      logoUrl: undefined,
    });
  });

  it("leaves $primary at the bundled Cartaisy color when no merchant primaryColor is set (fallback discipline)", () => {
    const { UNSAFE_getAllByType } = renderToggleOn();
    expect(getToggleTrackColor(UNSAFE_getAllByType)).toBe(DEFAULT_PRIMARY_HEX);
  });

  it("cascades a merchant primaryColor to a previously-unwired $primary consumer (ToggleSwitch) with no per-component change", () => {
    useStoreConfigStore.setState({ primaryColor: "#123456" });

    const { UNSAFE_getAllByType } = renderToggleOn();
    expect(getToggleTrackColor(UNSAFE_getAllByType)).toBe("#123456");
  });

  it("cascades to a second, unrelated previously-unwired consumer (OrderTimeline's $primary/$primarylight circles)", () => {
    useStoreConfigStore.setState({ primaryColor: "#00A86B" });

    const { UNSAFE_getAllByType } = renderWithTamagui(
      <ThemeSyncHarness>
        <OrderTimeline />
      </ThemeSyncHarness>
    );

    // The default `steps` data includes at least one "completed" step,
    // which renders a $primary-bordered/backgrounded circle.
    const views = UNSAFE_getAllByType(View);
    const styles = views.map((v: any) => StyleSheet.flatten(v.props.style));
    expect(
      styles.some((s: any) => s.backgroundColor === "#00A86B")
    ).toBe(true);
  });

  it("reverts to the bundled Cartaisy color when primaryColor is cleared (e.g. a later fetch has nothing configured)", () => {
    useStoreConfigStore.setState({ primaryColor: "#654321" });
    const { UNSAFE_getAllByType, rerender } = renderToggleOn();
    expect(getToggleTrackColor(UNSAFE_getAllByType)).toBe("#654321");

    act(() => {
      useStoreConfigStore.setState({ primaryColor: undefined });
    });
    rerender(
      <ThemeSyncHarness>
        <ToggleSwitch value onValueChange={jest.fn()} />
      </ThemeSyncHarness>
    );

    // UNSAFE_getAllByType stays bound to the same render tree across
    // rerender() calls and reflects the latest output.
    expect(getToggleTrackColor(UNSAFE_getAllByType)).toBe(
      DEFAULT_PRIMARY_HEX
    );
  });
});
