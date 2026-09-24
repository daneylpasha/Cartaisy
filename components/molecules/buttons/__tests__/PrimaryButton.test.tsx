/**
 * Reactivity coverage for TICKETmobilereactivitygapsharedprimitives.md.
 *
 * PrimaryButton itself needed no direct code change — its default
 * `background="primary"` flows straight into OpTouch's `backgroundColor`
 * prop, and fixing OpTouch's own resolver (see OpTouch.test.tsx) was
 * sufficient (confirmed here at PrimaryButton's own level, per the ticket's
 * "confirm and don't add a redundant second fix if so" instruction).
 * 35 of PrimaryButton's ~38 production instances rely on this default
 * (checkout, authentication, address, and product actions —
 * docs/STATUS.md), so this is real, high-leverage coverage.
 */
import { act } from "@testing-library/react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { updateTheme } from "tamagui";

import { PrimaryButton } from "@/components/molecules/buttons/PrimaryButton";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

const DEFAULT_PRIMARY_HEX = "#1C1917"; // tamagui/token.ts PRIMARY_COLOR — keep in sync

const findBackgroundColor = (getAllByType: any) => {
  const views = getAllByType(View) as any[];
  const match = views
    .map((v) => StyleSheet.flatten(v.props.style))
    .find(
      (s) => typeof s.backgroundColor === "string" && s.backgroundColor.startsWith("#")
    );
  return match?.backgroundColor;
};

describe("PrimaryButton color reactivity (via OpTouch's default background=\"primary\")", () => {
  afterEach(() => {
    act(() => {
      updateTheme({ name: "light", theme: { primary: DEFAULT_PRIMARY_HEX } });
    });
  });

  it("resolves the default background to the bundled primary color when no merchant override is set", () => {
    const { UNSAFE_getAllByType } = renderWithTamagui(
      <PrimaryButton onPress={() => {}} label="Checkout" />
    );
    expect(findBackgroundColor(UNSAFE_getAllByType)).toBe(DEFAULT_PRIMARY_HEX);
  });

  it("cascades a merchant primaryColor to the CTA background with no rebuild — no PrimaryButton-level code change was needed, this proves the OpTouch fix alone closes it", () => {
    const { UNSAFE_getAllByType } = renderWithTamagui(
      <PrimaryButton onPress={() => {}} label="Checkout" />
    );

    act(() => {
      updateTheme({ name: "light", theme: { primary: "#123456" } });
    });

    expect(findBackgroundColor(UNSAFE_getAllByType)).toBe("#123456");
  });
});
