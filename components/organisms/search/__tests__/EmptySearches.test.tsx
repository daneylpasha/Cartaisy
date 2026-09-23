/**
 * The empty-search state used to offer Fashion / Electronics / Offers /
 * Automotive chips that do not navigate and are not the merchant's catalog.
 */
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import React from "react";

import { EmptySearches } from "@/components/organisms/search/EmptySearches";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

describe("EmptySearches", () => {
  it("stays industry-neutral and points back to search or the catalog", () => {
    const { getByText, queryByText } = renderWithTamagui(<EmptySearches />);

    expect(getByText("Try another search, or browse the catalog.")).toBeTruthy();
    expect(queryByText("Fashion")).toBeNull();
    expect(queryByText("Electronics")).toBeNull();
    expect(queryByText("Offers")).toBeNull();
    expect(queryByText("Automative")).toBeNull();
  });
});
