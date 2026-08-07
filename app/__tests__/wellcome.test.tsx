/**
 * Reactivity coverage for TICKETwiremerchantstorenameintocompanynamestrings.md.
 *
 * The welcome screen's brand mark applies `.toUpperCase()` to the company
 * name — the ticket explicitly asked to confirm this still reads sensibly
 * against a dynamic value rather than assuming it's interchangeable with
 * the static "Cartaisy" string. `.toUpperCase()` works on any string, so no
 * special-casing was needed; this test confirms that live.
 */
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}));

import React from "react";

import WellcomeScreen from "@/app/wellcome";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

describe("wellcome screen companyName brand mark", () => {
  beforeEach(() => {
    useStoreConfigStore.setState({ storeName: "" });
  });

  it("hides the brand mark entirely when storeName is empty, instead of leaking the bundled 'CARTAISY' name (fail-closed per docs/MOBILE_BRANDED_BUILD_CHECKLIST.md — Codex P1 finding on PR #120)", () => {
    const { queryByText } = renderWithTamagui(<WellcomeScreen />);
    expect(queryByText("CARTAISY")).toBeNull();
  });

  it("uppercases the merchant's real storeName instead of the hardcoded Cartaisy string", () => {
    useStoreConfigStore.setState({ storeName: "Acme Outfitters" });

    const { getByText } = renderWithTamagui(<WellcomeScreen />);
    expect(getByText("ACME OUTFITTERS")).toBeTruthy();
  });

  it("constrains a long merchant name to one line with ellipsis instead of wrapping or overflowing past the sign-up/login controls on this non-scrollable screen (Codex P2 finding on PR #120)", () => {
    // The store-config contract places no length limit on `name`, and this
    // label had no numberOfLines/ellipsizeMode constraint — a long real
    // merchant name could previously wrap to multiple lines or overflow,
    // pushing the sign-up/login controls off-screen (the former hardcoded
    // "Cartaisy" was always short enough that this never showed up). Same
    // fix as the notification preview card and HomeHeader's search row.
    const longName = "Acme Outfitters International Trading Company Ltd.";
    useStoreConfigStore.setState({ storeName: longName });

    const { getByText } = renderWithTamagui(<WellcomeScreen />);
    const brandText = getByText(longName.toUpperCase());

    expect(brandText.props.numberOfLines).toBe(1);
    expect(brandText.props.ellipsizeMode).toBe("tail");
  });
});
