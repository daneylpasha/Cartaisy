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
    // isLoaded: false matches the store's post-rehydration/pre-fetch
    // default (see useStoreConfigStore.ts's onRehydrateStorage reset).
    useStoreConfigStore.setState({ storeName: "", isLoaded: false });
  });

  it("falls back to a bare 'Search' placeholder (no name) when storeName is empty — never leaks the bundled 'Cartaisy' name (Codex P1 finding on PR #120)", () => {
    const { getByPlaceholderText } = renderWithTamagui(<SearchBar />);
    expect(getByPlaceholderText("Search")).toBeTruthy();
  });

  it("uses the merchant's real storeName in the placeholder once isLoaded is true, instead of the hardcoded Cartaisy string", () => {
    useStoreConfigStore.setState({ storeName: "Acme Outfitters", isLoaded: true });

    const { getByPlaceholderText } = renderWithTamagui(<SearchBar />);
    expect(getByPlaceholderText("Search Acme Outfitters")).toBeTruthy();
  });
});
