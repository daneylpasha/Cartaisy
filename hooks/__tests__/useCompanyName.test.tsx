/**
 * Cascade test for the shared merchant-storeName resolver
 * (TICKETwiremerchantstorenameintocompanynamestrings.md), mirroring the
 * discipline PRs #118/#119 established: verify the shared hook's own
 * fallback behavior in isolation, before touching any of the five
 * components that consume it.
 */
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import { act } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

import { useCompanyName } from "@/hooks/useCompanyName";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

const BUNDLED_FALLBACK = "Cartaisy"; // translations/en.json's common.companyName

const CompanyNameProbe = () => <Text testID="probe">{useCompanyName()}</Text>;

describe("useCompanyName", () => {
  beforeEach(() => {
    useStoreConfigStore.setState({ storeName: "" });
  });

  it("falls back to the bundled 'Cartaisy' name when storeName is empty (the store's actual initial value, before AppInitializer's fetch resolves)", () => {
    const { getByTestId } = renderWithTamagui(<CompanyNameProbe />);
    expect(getByTestId("probe").props.children).toBe(BUNDLED_FALLBACK);
  });

  it("returns the merchant's real storeName once it's populated", () => {
    useStoreConfigStore.setState({ storeName: "Acme Outfitters" });

    const { getByTestId } = renderWithTamagui(<CompanyNameProbe />);
    expect(getByTestId("probe").props.children).toBe("Acme Outfitters");
  });

  it("falls back to 'Cartaisy' again after a failed fetch explicitly clears storeName back to '' (AppInitializer.tsx's catch block)", () => {
    useStoreConfigStore.setState({ storeName: "Acme Outfitters" });
    const { getByTestId, rerender } = renderWithTamagui(<CompanyNameProbe />);
    expect(getByTestId("probe").props.children).toBe("Acme Outfitters");

    act(() => {
      useStoreConfigStore.setState({ storeName: "" });
    });
    rerender(<CompanyNameProbe />);
    expect(getByTestId("probe").props.children).toBe(BUNDLED_FALLBACK);
  });
});
