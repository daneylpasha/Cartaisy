/**
 * Reactivity coverage for TICKETwiremerchantstorenameintocompanynamestrings.md.
 *
 * SearchInput's own default placeholder (used whenever a caller doesn't
 * pass an explicit `placeholder` prop — today's only caller, SearchBar,
 * always does, but this default is still part of the component's public
 * contract and the ticket's explicit read-first scope) fell back to the
 * hardcoded `t("common.companyName")` instead of the merchant's real
 * `storeName`.
 */
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import React from "react";

import { SearchInput } from "@/components/molecules/SearchInput";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

describe("SearchInput default companyName placeholder", () => {
  beforeEach(() => {
    useStoreConfigStore.setState({ storeName: "" });
  });

  it("falls back to a bare 'Search' default placeholder (no name) when no placeholder prop is passed and storeName is empty — never leaks the bundled 'Cartaisy' name (Codex P1 finding on PR #120)", () => {
    const { getByPlaceholderText } = renderWithTamagui(
      <SearchInput value="" onChangeText={() => {}} />
    );
    expect(getByPlaceholderText("Search")).toBeTruthy();
  });

  it("uses the merchant's real storeName in the default placeholder instead of the hardcoded Cartaisy string", () => {
    useStoreConfigStore.setState({ storeName: "Acme Outfitters" });

    const { getByPlaceholderText } = renderWithTamagui(
      <SearchInput value="" onChangeText={() => {}} />
    );
    expect(getByPlaceholderText("Search Acme Outfitters")).toBeTruthy();
  });

  it("an explicit placeholder prop still overrides the companyName default entirely", () => {
    useStoreConfigStore.setState({ storeName: "Acme Outfitters" });

    const { getByPlaceholderText, queryByPlaceholderText } = renderWithTamagui(
      <SearchInput value="" onChangeText={() => {}} placeholder="Find products" />
    );
    expect(getByPlaceholderText("Find products")).toBeTruthy();
    expect(queryByPlaceholderText("Search Acme Outfitters")).toBeNull();
  });
});
