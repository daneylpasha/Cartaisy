/**
 * Reactivity coverage for TICKETmobilereactivitygapsharedprimitives.md.
 *
 * OpTouch's own `getTokenValue()` helper used to read `tokens.color`
 * directly — a plain snapshot, not a subscription — so backgroundColor/
 * borderColor/shadowColor never picked up a merchant's runtime
 * primaryColor/secondaryColor (applied via updateTheme(), see
 * hooks/useDynamicPrimaryTheme.ts). This directly affected 3 merchant-visible
 * buttons that pass `backgroundColor="primary"` straight through (see
 * docs/STATUS.md), and every PrimaryButton instance via PrimaryButton's own
 * "primary" default (see PrimaryButton.test.tsx for that cascade).
 */
import { act } from "@testing-library/react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { updateTheme } from "tamagui";

import { OpTouch } from "@/components/atoms/OpTouch";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

const DEFAULT_PRIMARY_HEX = "#A82A50"; // tamagui/token.ts PRIMARY_COLOR — keep in sync
const DEFAULT_SECONDARY = "rgba(75, 85, 99, 1)"; // tamagui/token.ts SECONDARY_COLOR — keep in sync

// TouchableOpacity (which OpTouch wraps) renders its own internal View
// hierarchy rather than passing [customStyle, style] straight through as a
// single node's props, so — matching the same discipline
// hooks/__tests__/useDynamicPrimaryTheme.test.tsx already used — find the
// rendered View that actually carries the flattened style we're asserting
// on, instead of assuming a fixed index/shape.
const findViewWithStyle = (
  getAllByType: any,
  predicate: (flat: any) => boolean
) => {
  const views = getAllByType(View) as any[];
  const match = views.find((v) => predicate(StyleSheet.flatten(v.props.style)));
  return match ? StyleSheet.flatten(match.props.style) : undefined;
};

describe("OpTouch color reactivity", () => {
  afterEach(() => {
    act(() => {
      updateTheme({
        name: "light",
        theme: { primary: DEFAULT_PRIMARY_HEX, secondary: DEFAULT_SECONDARY },
      });
    });
  });

  it("resolves backgroundColor=\"primary\" to the bundled color when no merchant override is set (the exact prop shape onboardingSlides.tsx's nav arrows and profile.tsx's Sign-in button use)", () => {
    const { UNSAFE_getAllByType } = renderWithTamagui(
      <OpTouch backgroundColor="primary" onPress={() => {}}>
        <View />
      </OpTouch>
    );
    const style = findViewWithStyle(
      UNSAFE_getAllByType,
      (s) => typeof s.backgroundColor === "string" && s.backgroundColor.startsWith("#")
    );
    expect(style?.backgroundColor).toBe(DEFAULT_PRIMARY_HEX);
  });

  it("cascades a merchant primaryColor to backgroundColor with no rebuild — this is the Sign-in-button case documented as broken in the 2026-08-06 integration run", () => {
    const { UNSAFE_getAllByType } = renderWithTamagui(
      <OpTouch backgroundColor="primary" onPress={() => {}}>
        <View />
      </OpTouch>
    );

    act(() => {
      updateTheme({ name: "light", theme: { primary: "#123456" } });
    });

    const style = findViewWithStyle(
      UNSAFE_getAllByType,
      (s) => s.backgroundColor === "#123456"
    );
    expect(style?.backgroundColor).toBe("#123456");
  });

  it("cascades a merchant secondaryColor to borderColor/shadowColor with no rebuild", () => {
    const { UNSAFE_getAllByType } = renderWithTamagui(
      <OpTouch
        backgroundColor="white"
        borderColor="secondary"
        shadowColor="secondary"
        onPress={() => {}}
      >
        <View />
      </OpTouch>
    );

    act(() => {
      updateTheme({ name: "light", theme: { secondary: "#00A86B" } });
    });

    const style = findViewWithStyle(
      UNSAFE_getAllByType,
      (s) => s.borderColor === "#00A86B"
    );
    expect(style?.borderColor).toBe("#00A86B");
    expect(style?.shadowColor).toBe("#00A86B");
  });

  it("still resolves \"space\"/\"radius\" tokens correctly (unaffected by the color-reactivity change)", () => {
    const { UNSAFE_getAllByType } = renderWithTamagui(
      <OpTouch
        backgroundColor="white"
        padding="md"
        borderRadius="lg"
        onPress={() => {}}
      >
        <View />
      </OpTouch>
    );

    const style = findViewWithStyle(
      UNSAFE_getAllByType,
      (s) => s.padding === 16
    );
    expect(style?.padding).toBe(16); // tokens.space.md
    expect(style?.borderRadius).toBe(10); // tokens.radius.lg
  });
});
