/**
 * Reactivity coverage for TICKETmobilereactivitygapsharedprimitives.md.
 *
 * SecondaryButton's own local `getTokenValue()` resolved `borderColor` from
 * the static `tokens.color` object directly — never subscribed to
 * updateTheme(), so the border stayed on the bundled color after a merchant
 * primaryColor change (docs/STATUS.md: 19 files render this button). The
 * label text was already correct before this fix — it's passed straight to
 * TextMDSemiBold's Tamagui `color` style prop, a genuine reactive Tamagui
 * binding — so this suite also asserts that path keeps working, per the
 * ticket's explicit "text already works — don't touch it, just confirm it
 * still does" instruction.
 */
import { act } from "@testing-library/react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { updateTheme } from "tamagui";

import { SecondaryButton } from "@/components/molecules/buttons/SecondaryButton";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

const DEFAULT_PRIMARY_HEX = "#A82A50"; // tamagui/token.ts PRIMARY_COLOR — keep in sync

const findBorderColor = (getAllByType: any) => {
  const views = getAllByType(View) as any[];
  const match = views
    .map((v) => StyleSheet.flatten(v.props.style))
    .find((s) => typeof s.borderColor === "string" && s.borderColor.startsWith("#"));
  return match?.borderColor;
};

describe("SecondaryButton color reactivity", () => {
  afterEach(() => {
    act(() => {
      updateTheme({ name: "light", theme: { primary: DEFAULT_PRIMARY_HEX } });
    });
  });

  it("resolves the default $primary border to the bundled color when no merchant override is set", () => {
    const { UNSAFE_getAllByType } = renderWithTamagui(
      <SecondaryButton onPress={() => {}} label="Continue" />
    );
    expect(findBorderColor(UNSAFE_getAllByType)).toBe(DEFAULT_PRIMARY_HEX);
  });

  it("cascades a merchant primaryColor to the border with no rebuild", () => {
    const { UNSAFE_getAllByType } = renderWithTamagui(
      <SecondaryButton onPress={() => {}} label="Continue" />
    );

    act(() => {
      updateTheme({ name: "light", theme: { primary: "#123456" } });
    });

    expect(findBorderColor(UNSAFE_getAllByType)).toBe("#123456");
  });

  it("keeps the label text reactive too (already worked before this fix — confirming it still does, per the ticket's explicit instruction not to touch it)", () => {
    const { getByText } = renderWithTamagui(
      <SecondaryButton onPress={() => {}} label="Continue" />
    );

    act(() => {
      updateTheme({ name: "light", theme: { primary: "#123456" } });
    });

    const textStyle = StyleSheet.flatten(getByText("Continue").props.style);
    expect(textStyle.color).toBe("#123456");
  });
});
