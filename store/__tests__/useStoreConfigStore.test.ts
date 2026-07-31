/**
 * Covers the runtime branding fields added to store/useStoreConfigStore.ts:
 * persistence when present, and — the important safety behavior — that a
 * setConfig call with branding fields absent (e.g. after a failed refetch
 * falls back to bare currency/timezone/name defaults) never clears branding
 * that was already persisted from an earlier successful fetch.
 */
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import useStoreConfigStore from "@/store/useStoreConfigStore";

const baseState = {
  currency: "USD",
  timezone: "UTC",
  storeName: "",
  primaryColor: undefined,
  secondaryColor: undefined,
  logoUrl: undefined,
  isLoaded: false,
};

describe("useStoreConfigStore", () => {
  beforeEach(() => {
    useStoreConfigStore.setState({ ...baseState });
  });

  it("setConfig persists all three branding fields when present and valid", () => {
    useStoreConfigStore.getState().setConfig({
      currency: "USD",
      timezone: "UTC",
      storeName: "Acme Outfitters",
      primaryColor: "#A82A50",
      secondaryColor: "#4B5563",
      logoUrl: "https://cdn.cartaisy.com/stores/acme/logo.png",
    });

    const state = useStoreConfigStore.getState();
    expect(state.primaryColor).toBe("#A82A50");
    expect(state.secondaryColor).toBe("#4B5563");
    expect(state.logoUrl).toBe("https://cdn.cartaisy.com/stores/acme/logo.png");
    expect(state.isLoaded).toBe(true);
  });

  it("leaves branding as undefined when a config call never included any (today's default store)", () => {
    useStoreConfigStore.getState().setConfig({
      currency: "USD",
      timezone: "UTC",
      storeName: "Cartaisy",
    });

    const state = useStoreConfigStore.getState();
    expect(state.primaryColor).toBeUndefined();
    expect(state.secondaryColor).toBeUndefined();
    expect(state.logoUrl).toBeUndefined();
    expect(state.currency).toBe("USD");
    expect(state.storeName).toBe("Cartaisy");
  });

  it("keeps previously persisted branding when a later setConfig call omits it (failed refetch)", () => {
    // First startup: backend returns full branding.
    useStoreConfigStore.getState().setConfig({
      currency: "USD",
      timezone: "UTC",
      storeName: "Acme Outfitters",
      primaryColor: "#A82A50",
      secondaryColor: "#4B5563",
      logoUrl: "https://cdn.cartaisy.com/stores/acme/logo.png",
    });

    // Second startup: fetch fails, caller passes through bare defaults with
    // no branding fields at all (mirroring getStoreConfig()'s catch path).
    useStoreConfigStore.getState().setConfig({
      currency: "USD",
      timezone: "UTC",
      storeName: "",
    });

    const state = useStoreConfigStore.getState();
    expect(state.primaryColor).toBe("#A82A50");
    expect(state.secondaryColor).toBe("#4B5563");
    expect(state.logoUrl).toBe("https://cdn.cartaisy.com/stores/acme/logo.png");
  });

  it("updates a single branding field on a later call without disturbing the others", () => {
    useStoreConfigStore.getState().setConfig({
      currency: "USD",
      timezone: "UTC",
      storeName: "Acme Outfitters",
      primaryColor: "#A82A50",
      secondaryColor: "#4B5563",
      logoUrl: "https://cdn.cartaisy.com/stores/acme/logo.png",
    });

    // Only the logo changed on this fetch (e.g. merchant updated their logo).
    useStoreConfigStore.getState().setConfig({
      currency: "USD",
      timezone: "UTC",
      storeName: "Acme Outfitters",
      logoUrl: "https://cdn.cartaisy.com/stores/acme/logo-v2.png",
    });

    const state = useStoreConfigStore.getState();
    expect(state.primaryColor).toBe("#A82A50");
    expect(state.secondaryColor).toBe("#4B5563");
    expect(state.logoUrl).toBe("https://cdn.cartaisy.com/stores/acme/logo-v2.png");
  });

  it("reset clears branding along with the rest of the config", () => {
    useStoreConfigStore.getState().setConfig({
      currency: "USD",
      timezone: "UTC",
      storeName: "Acme Outfitters",
      primaryColor: "#A82A50",
      secondaryColor: "#4B5563",
      logoUrl: "https://cdn.cartaisy.com/stores/acme/logo.png",
    });

    useStoreConfigStore.getState().reset();

    const state = useStoreConfigStore.getState();
    expect(state.primaryColor).toBeUndefined();
    expect(state.secondaryColor).toBeUndefined();
    expect(state.logoUrl).toBeUndefined();
    expect(state.currency).toBe("USD");
    expect(state.isLoaded).toBe(false);
  });
});
