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

  it("falls back to the bundled, uppercased 'CARTAISY' brand mark when storeName is empty", () => {
    const { getByText } = renderWithTamagui(<WellcomeScreen />);
    expect(getByText("CARTAISY")).toBeTruthy();
  });

  it("uppercases the merchant's real storeName instead of the hardcoded Cartaisy string", () => {
    useStoreConfigStore.setState({ storeName: "Acme Outfitters" });

    const { getByText } = renderWithTamagui(<WellcomeScreen />);
    expect(getByText("ACME OUTFITTERS")).toBeTruthy();
  });
});
