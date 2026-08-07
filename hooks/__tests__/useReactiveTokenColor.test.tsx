/**
 * Cascade test for the shared reactive-color mechanism used by
 * TICKETmobilereactivitygapsharedprimitives.md's five fixed components
 * (OpTouch, SecondaryButton, FormInput, AppImage — PrimaryButton needs no
 * direct fix, see its own file).
 *
 * Proves `useReactiveTokenColor()` actually re-renders a consumer when
 * `updateTheme()` fires — the same mechanism useDynamicPrimaryTheme.ts /
 * useDynamicSecondaryTheme.ts use to broadcast a merchant color — rather
 * than asserting on the hook's internals. This is a real
 * TamaguiProvider-mounted render + `updateTheme()` call + resolved-style
 * assertion, not a mocked store, matching the discipline
 * hooks/__tests__/useDynamicPrimaryTheme.test.tsx already established.
 */
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import React from "react";
import { View } from "react-native";
import { act } from "@testing-library/react-native";
import { updateTheme } from "tamagui";

import { useReactiveTokenColor } from "@/hooks/useReactiveTokenColor";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

const DEFAULT_PRIMARY_HEX = "#A82A50"; // tamagui/token.ts PRIMARY_COLOR — keep in sync
const DEFAULT_SECONDARY = "rgba(75, 85, 99, 1)"; // tamagui/token.ts SECONDARY_COLOR — keep in sync

// A tiny harness mirroring how each of the five fixed components calls the
// hook: unconditionally at the top, then uses the returned resolver on a
// plain (non-Tamagui-JSX) style prop — the exact case a static tokens.color
// read couldn't ever pick up a runtime change.
const ColorProbe = ({ token }: { token: string }) => {
  const getReactiveColor = useReactiveTokenColor();
  return <View testID="probe" style={{ backgroundColor: getReactiveColor(token) }} />;
};

const resetTheme = () => {
  act(() => {
    updateTheme({
      name: "light",
      theme: { primary: DEFAULT_PRIMARY_HEX, secondary: DEFAULT_SECONDARY },
    });
  });
};

describe("useReactiveTokenColor", () => {
  afterEach(() => {
    // updateTheme() mutates a module-level singleton registry shared across
    // tests in this file — reset it so one test's mutation can't leak into
    // the next test's "bundled default" assertion.
    resetTheme();
  });

  it("resolves the bundled primary color when no runtime override has been applied", () => {
    const { getByTestId } = renderWithTamagui(<ColorProbe token="primary" />);
    expect(getByTestId("probe").props.style.backgroundColor).toBe(DEFAULT_PRIMARY_HEX);
  });

  it("cascades a runtime primaryColor change from updateTheme() with no per-component wiring (accepts the $-prefixed form too)", () => {
    const { getByTestId } = renderWithTamagui(<ColorProbe token="$primary" />);

    act(() => {
      updateTheme({ name: "light", theme: { primary: "#123456" } });
    });

    expect(getByTestId("probe").props.style.backgroundColor).toBe("#123456");
  });

  it("cascades a runtime secondaryColor change", () => {
    const { getByTestId } = renderWithTamagui(<ColorProbe token="secondary" />);

    act(() => {
      updateTheme({ name: "light", theme: { secondary: "#00A86B" } });
    });

    expect(getByTestId("probe").props.style.backgroundColor).toBe("#00A86B");
  });

  it("reverts to the bundled color when the theme is reset (e.g. store clears the merchant override)", () => {
    const { getByTestId } = renderWithTamagui(<ColorProbe token="primary" />);

    act(() => {
      updateTheme({ name: "light", theme: { primary: "#654321" } });
    });
    expect(getByTestId("probe").props.style.backgroundColor).toBe("#654321");

    resetTheme();
    expect(getByTestId("probe").props.style.backgroundColor).toBe(DEFAULT_PRIMARY_HEX);
  });

  it("leaves a static, non-branded token (white) untouched by a primary/secondary theme update", () => {
    const { getByTestId } = renderWithTamagui(<ColorProbe token="white" />);

    act(() => {
      updateTheme({ name: "light", theme: { primary: "#ABCDEF", secondary: "#FEDCBA" } });
    });

    expect(getByTestId("probe").props.style.backgroundColor).toBe("#FFFFFF");
  });
});
