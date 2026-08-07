/**
 * Reactivity coverage for TICKETwiremerchantstorenameintocompanynamestrings.md.
 *
 * SearchBar's placeholder passed the hardcoded `t("common.companyName")`
 * ("Cartaisy") straight through to SearchInput, ignoring the merchant's real
 * `storeName` (already fetched and available via `useStoreConfigStore`).
 */
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import React from "react";

import { SearchBar } from "@/components/organisms/SearchBar";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

describe("SearchBar companyName placeholder", () => {
  beforeEach(() => {
    useStoreConfigStore.setState({ storeName: "" });
  });

  it("falls back to the bundled 'Search Cartaisy' placeholder when storeName is empty", () => {
    const { getByPlaceholderText } = renderWithTamagui(<SearchBar />);
    expect(getByPlaceholderText("Search Cartaisy")).toBeTruthy();
  });

  it("uses the merchant's real storeName in the placeholder instead of the hardcoded Cartaisy string", () => {
    useStoreConfigStore.setState({ storeName: "Acme Outfitters" });

    const { getByPlaceholderText } = renderWithTamagui(<SearchBar />);
    expect(getByPlaceholderText("Search Acme Outfitters")).toBeTruthy();
  });
});
