/**
 * Gallery dots used to default to the bundled tokens.color.primary, which
 * never follows a merchant primaryColor applied through updateTheme().
 */
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import { act } from "@testing-library/react-native";
import React from "react";
import { updateTheme } from "tamagui";

import ProductCarousel from "@/components/molecules/product/pdp/ProductCarousel";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

const DEFAULT_PRIMARY_HEX = "#1C1917";
const DEFAULT_SECONDARY = "rgba(75, 85, 99, 1)";

describe("ProductCarousel branding", () => {
  afterEach(() => {
    act(() => {
      updateTheme({
        name: "light",
        theme: { primary: DEFAULT_PRIMARY_HEX, secondary: DEFAULT_SECONDARY },
      });
    });
  });

  it("paints the active dot with the runtime primary color", () => {
    const { getByTestId } = renderWithTamagui(
      <ProductCarousel images={["https://cdn.example.com/tee.jpg"]} />
    );

    expect(getByTestId("product-carousel-active-dot").props.style.backgroundColor).toBe(
      DEFAULT_PRIMARY_HEX
    );

    act(() => {
      updateTheme({ name: "light", theme: { primary: "#0F6E56" } });
    });

    expect(getByTestId("product-carousel-active-dot").props.style.backgroundColor).toBe(
      "#0F6E56"
    );
  });
});
