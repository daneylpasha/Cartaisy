/**
 * Cascade test for the shared merchant-storeName resolver
 * (TICKETwiremerchantstorenameintocompanynamestrings.md), mirroring the
 * discipline PRs #118/#119 established: verify the shared hook's own
 * behavior in isolation, before touching any of the five components that
 * consume it.
 *
 * The hook deliberately returns the raw (possibly empty) `storeName` and
 * does NOT fall back to the bundled "Cartaisy" translation — see
 * hooks/useCompanyName.ts's doc comment and
 * docs/MOBILE_BRANDED_BUILD_CHECKLIST.md's fail-closed requirement (Codex
 * P1 finding on PR #120: baking in a Cartaisy fallback here would leak
 * Cartaisy's name onto a merchant's own branded build). Each call site
 * decides its own empty-state UI treatment instead.
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

const CompanyNameProbe = () => <Text testID="probe">{useCompanyName()}</Text>;

describe("useCompanyName", () => {
  beforeEach(() => {
    useStoreConfigStore.setState({ storeName: "" });
  });

  it("returns an empty string when storeName is empty (the store's actual initial value, before AppInitializer's fetch resolves) — never the bundled 'Cartaisy' name", () => {
    const { getByTestId } = renderWithTamagui(<CompanyNameProbe />);
    expect(getByTestId("probe").props.children).toBe("");
  });

  it("returns the merchant's real storeName once it's populated", () => {
    useStoreConfigStore.setState({ storeName: "Acme Outfitters" });

    const { getByTestId } = renderWithTamagui(<CompanyNameProbe />);
    expect(getByTestId("probe").props.children).toBe("Acme Outfitters");
  });

  it("goes back to an empty string after a failed fetch explicitly clears storeName back to '' (AppInitializer.tsx's catch block) — not the bundled Cartaisy name", () => {
    useStoreConfigStore.setState({ storeName: "Acme Outfitters" });
    const { getByTestId, rerender } = renderWithTamagui(<CompanyNameProbe />);
    expect(getByTestId("probe").props.children).toBe("Acme Outfitters");

    act(() => {
      useStoreConfigStore.setState({ storeName: "" });
    });
    rerender(<CompanyNameProbe />);
    expect(getByTestId("probe").props.children).toBe("");
  });
});
