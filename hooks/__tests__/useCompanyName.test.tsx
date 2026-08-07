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
 *
 * It also gates on `isLoaded` so a persisted `storeName` from a PREVIOUS
 * session (zustand's `persist` middleware rehydrates it before this
 * session's own fetch runs) never leaks through either — a second Codex
 * finding on the same PR, since a stale/prior-tenant name on disk is the
 * same category of leak as the bundled Cartaisy fallback was.
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
    // isLoaded: false matches the store's own reset-on-rehydration default
    // (see useStoreConfigStore.ts's onRehydrateStorage) — the pre-fetch
    // state every real cold launch starts from.
    useStoreConfigStore.setState({ storeName: "", isLoaded: false });
  });

  it("returns an empty string when storeName is empty and isLoaded is false (the store's actual initial value, before AppInitializer's fetch resolves) — never the bundled 'Cartaisy' name", () => {
    const { getByTestId } = renderWithTamagui(<CompanyNameProbe />);
    expect(getByTestId("probe").props.children).toBe("");
  });

  it("returns the merchant's real storeName once isLoaded flips true (AppInitializer's setConfig() call resolving)", () => {
    useStoreConfigStore.setState({ storeName: "Acme Outfitters", isLoaded: true });

    const { getByTestId } = renderWithTamagui(<CompanyNameProbe />);
    expect(getByTestId("probe").props.children).toBe("Acme Outfitters");
  });

  it("goes back to an empty string after a failed fetch explicitly clears storeName back to '' (AppInitializer.tsx's catch block, which still sets isLoaded: true) — not the bundled Cartaisy name", () => {
    useStoreConfigStore.setState({ storeName: "Acme Outfitters", isLoaded: true });
    const { getByTestId, rerender } = renderWithTamagui(<CompanyNameProbe />);
    expect(getByTestId("probe").props.children).toBe("Acme Outfitters");

    act(() => {
      useStoreConfigStore.setState({ storeName: "" });
    });
    rerender(<CompanyNameProbe />);
    expect(getByTestId("probe").props.children).toBe("");
  });

  it("does not expose a storeName persisted from a PREVIOUS session while isLoaded is still false, even though the raw value is already sitting in the store post-rehydration (Codex review finding on PR #120)", () => {
    // Simulates zustand's persist middleware having already merged a
    // previous session's storeName back into the store (this happens
    // before AppInitializer's own fetch runs) — isLoaded staying false
    // (freshly reset by onRehydrateStorage) is what should keep this
    // gated, not the presence/absence of storeName itself.
    useStoreConfigStore.setState({ storeName: "Acme Outfitters", isLoaded: false });

    const { getByTestId, rerender } = renderWithTamagui(<CompanyNameProbe />);
    expect(getByTestId("probe").props.children).toBe("");

    // Once THIS session's fetch actually completes (setConfig() flips
    // isLoaded true), the confirmed-current value is exposed.
    act(() => {
      useStoreConfigStore.setState({ isLoaded: true });
    });
    rerender(<CompanyNameProbe />);
    expect(getByTestId("probe").props.children).toBe("Acme Outfitters");
  });
});
