import { fireEvent } from "@testing-library/react-native";
import React from "react";

import { CatalogUnavailableState } from "@/components/molecules/CatalogUnavailableState";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

// The shared unavailable-state UI used by the cart, wishlist, and checkout
// screens when the backend signals a store/catalog unavailable condition.

const catalogUnavailableError = {
  response: { status: 403, data: { code: "STORE_INACTIVE" } },
};

const controlledMessage =
  "This store's catalog is temporarily unavailable. Please try again later.";

describe("CatalogUnavailableState", () => {
  it("renders the controlled message derived from a catalog-unavailable API error", () => {
    const { getByText } = renderWithTamagui(
      <CatalogUnavailableState error={catalogUnavailableError} title="Cart unavailable" />
    );

    expect(getByText("Cart unavailable")).toBeTruthy();
    expect(getByText(controlledMessage)).toBeTruthy();
  });

  it("falls back to a generic message for errors that are not catalog-unavailable", () => {
    const { getByText } = renderWithTamagui(<CatalogUnavailableState error={new Error("boom")} />);

    expect(getByText("Catalog unavailable")).toBeTruthy();
    expect(getByText("We couldn't load this catalog. Please try again.")).toBeTruthy();
  });

  it("shows a retry button only when onRetry is provided, and wires it up", () => {
    const onRetry = jest.fn();
    const { getByText, queryByText, rerender } = renderWithTamagui(
      <CatalogUnavailableState error={catalogUnavailableError} onRetry={onRetry} />
    );

    fireEvent.press(getByText("Try again"));
    expect(onRetry).toHaveBeenCalledTimes(1);

    rerender(<CatalogUnavailableState error={catalogUnavailableError} />);
    expect(queryByText("Try again")).toBeNull();
  });
});
