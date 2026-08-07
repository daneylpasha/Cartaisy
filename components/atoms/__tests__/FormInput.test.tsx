/**
 * Reactivity coverage for TICKETmobilereactivitygapsharedprimitives.md.
 *
 * FormInput's `selectionColor={colors.primary}` read `tokens.color.primary`
 * through the `assets/colors.ts` alias — a static snapshot, not a
 * subscription — so the text-cursor color stayed on the bundled primary
 * after a merchant color change (docs/STATUS.md: 34 FormInput instances
 * across 16 files).
 */
import { act } from "@testing-library/react-native";
import React from "react";
import { TextInput } from "react-native";
import { updateTheme } from "tamagui";

import { FormInput } from "@/components/atoms/FormInput";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

const DEFAULT_PRIMARY_HEX = "#A82A50"; // tamagui/token.ts PRIMARY_COLOR — keep in sync

describe("FormInput selectionColor reactivity", () => {
  afterEach(() => {
    act(() => {
      updateTheme({ name: "light", theme: { primary: DEFAULT_PRIMARY_HEX } });
    });
  });

  it("resolves selectionColor to the bundled primary color when no merchant override is set", () => {
    const { UNSAFE_getByType } = renderWithTamagui(
      <FormInput value="" onChangeText={() => {}} placeholder="Email" />
    );
    expect(UNSAFE_getByType(TextInput).props.selectionColor).toBe(
      DEFAULT_PRIMARY_HEX
    );
  });

  it("cascades a merchant primaryColor to selectionColor with no rebuild", () => {
    const { UNSAFE_getByType } = renderWithTamagui(
      <FormInput value="" onChangeText={() => {}} placeholder="Email" />
    );

    act(() => {
      updateTheme({ name: "light", theme: { primary: "#123456" } });
    });

    expect(UNSAFE_getByType(TextInput).props.selectionColor).toBe("#123456");
  });
});
