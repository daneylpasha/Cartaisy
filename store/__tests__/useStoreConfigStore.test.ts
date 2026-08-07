/**
 * Covers the runtime branding fields added to store/useStoreConfigStore.ts:
 * persistence when present, clearing when a successful fetch genuinely has
 * no branding (e.g. a merchant removed their custom colors), and — the
 * important safety behavior — that only a setConfig call explicitly marked
 * fetchSucceeded: false (a real fetch failure) preserves previously
 * persisted branding instead of clearing it.
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
  _hasHydrated: false,
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

  it("leaves branding as undefined on a successful config call that never included any (today's default store)", () => {
    useStoreConfigStore.getState().setConfig({
      currency: "USD",
      timezone: "UTC",
      storeName: "Cartaisy",
      // fetchSucceeded omitted — defaults to true, matching a genuine
      // successful fetch that simply has no branding set.
    });

    const state = useStoreConfigStore.getState();
    expect(state.primaryColor).toBeUndefined();
    expect(state.secondaryColor).toBeUndefined();
    expect(state.logoUrl).toBeUndefined();
    expect(state.currency).toBe("USD");
    expect(state.storeName).toBe("Cartaisy");
  });

  it("clears previously persisted branding when a later SUCCESSFUL fetch genuinely has none (merchant removed their branding)", () => {
    useStoreConfigStore.getState().setConfig({
      currency: "USD",
      timezone: "UTC",
      storeName: "Acme Outfitters",
      primaryColor: "#A82A50",
      secondaryColor: "#4B5563",
      logoUrl: "https://cdn.cartaisy.com/stores/acme/logo.png",
    });

    // A later successful fetch (fetchSucceeded defaults to true) that no
    // longer includes branding must clear it, not keep the stale value
    // forever — this is the P1 Greptile/Codex both flagged.
    useStoreConfigStore.getState().setConfig({
      currency: "USD",
      timezone: "UTC",
      storeName: "Acme Outfitters",
    });

    const state = useStoreConfigStore.getState();
    expect(state.primaryColor).toBeUndefined();
    expect(state.secondaryColor).toBeUndefined();
    expect(state.logoUrl).toBeUndefined();
  });

  it("keeps previously persisted branding when a later setConfig call is explicitly marked fetchSucceeded: false (real fetch failure)", () => {
    // First startup: backend returns full branding.
    useStoreConfigStore.getState().setConfig({
      currency: "USD",
      timezone: "UTC",
      storeName: "Acme Outfitters",
      primaryColor: "#A82A50",
      secondaryColor: "#4B5563",
      logoUrl: "https://cdn.cartaisy.com/stores/acme/logo.png",
    });

    // Second startup: fetch genuinely failed. Caller passes through bare
    // defaults with no branding fields, explicitly marked as a failure —
    // this must preserve branding rather than clear it.
    useStoreConfigStore.getState().setConfig({
      currency: "USD",
      timezone: "UTC",
      storeName: "",
      fetchSucceeded: false,
    });

    const state = useStoreConfigStore.getState();
    expect(state.primaryColor).toBe("#A82A50");
    expect(state.secondaryColor).toBe("#4B5563");
    expect(state.logoUrl).toBe("https://cdn.cartaisy.com/stores/acme/logo.png");
    // currency/timezone/storeName are unaffected by fetchSucceeded — they
    // keep their existing overwrite-on-every-call behavior, unchanged from
    // before this ticket.
    expect(state.currency).toBe("USD");
    expect(state.storeName).toBe("");
  });

  it("updates branding to whatever a later successful fetch's full response contains (e.g. merchant updated their logo)", () => {
    useStoreConfigStore.getState().setConfig({
      currency: "USD",
      timezone: "UTC",
      storeName: "Acme Outfitters",
      primaryColor: "#A82A50",
      secondaryColor: "#4B5563",
      logoUrl: "https://cdn.cartaisy.com/stores/acme/logo.png",
    });

    // GET /store/config always returns the store's whole current branding
    // together, not a partial diff — so a later successful call carries all
    // three fields again, with only the logo actually changed.
    useStoreConfigStore.getState().setConfig({
      currency: "USD",
      timezone: "UTC",
      storeName: "Acme Outfitters",
      primaryColor: "#A82A50",
      secondaryColor: "#4B5563",
      logoUrl: "https://cdn.cartaisy.com/stores/acme/logo-v2.png",
    });

    const state = useStoreConfigStore.getState();
    expect(state.primaryColor).toBe("#A82A50");
    expect(state.secondaryColor).toBe("#4B5563");
    expect(state.logoUrl).toBe("https://cdn.cartaisy.com/stores/acme/logo-v2.png");
  });

  it("starts with _hasHydrated false and flips to true via setHasHydrated (called by onRehydrateStorage once AsyncStorage read completes)", () => {
    expect(useStoreConfigStore.getState()._hasHydrated).toBe(false);

    useStoreConfigStore.getState().setHasHydrated(true);

    expect(useStoreConfigStore.getState()._hasHydrated).toBe(true);
  });

  it("still marks hydration complete when AsyncStorage rehydration fails (corrupt JSON, storage read error)", () => {
    // On a failed rehydration, zustand's persist middleware calls
    // onRehydrateStorage's returned callback with state=undefined and an
    // error, instead of the hydrated state. If that path didn't set
    // _hasHydrated, AppInitializer's fetch effect (gated on this flag)
    // would stay blocked for the rest of the session and /store/config
    // would never be requested — worse than the race this flag exists to
    // prevent. Simulate that failure path directly via the persist API.
    const onRehydrateStorage = useStoreConfigStore.persist.getOptions().onRehydrateStorage;
    expect(onRehydrateStorage).toBeDefined();

    const rehydrateCallback = onRehydrateStorage!(useStoreConfigStore.getState());
    expect(rehydrateCallback).toBeDefined();

    rehydrateCallback!(undefined, new Error("AsyncStorage read failed"));

    expect(useStoreConfigStore.getState()._hasHydrated).toBe(true);
  });

  it("reset does not affect _hasHydrated — it's a one-time hydration flag, not part of the config being reset", () => {
    useStoreConfigStore.getState().setHasHydrated(true);
    useStoreConfigStore.getState().setConfig({
      currency: "USD",
      timezone: "UTC",
      storeName: "Acme Outfitters",
      primaryColor: "#A82A50",
    });

    useStoreConfigStore.getState().reset();

    expect(useStoreConfigStore.getState()._hasHydrated).toBe(true);
    expect(useStoreConfigStore.getState().primaryColor).toBeUndefined();
  });

  it("revalidateBranding clears fields that no longer pass current validation rules, keeping the ones that still do", () => {
    // Simulates branding that was persisted under older/looser validation
    // rules (or written directly to AsyncStorage) and no longer clears
    // today's contrast guardrails.
    useStoreConfigStore.setState({
      primaryColor: "#FFFFFF", // fails hasSufficientContrastForPrimary
      secondaryColor: "#4B5563", // still passes
      logoUrl: "https://cdn.cartaisy.com/stores/acme/logo.png",
    });

    useStoreConfigStore.getState().revalidateBranding();

    const state = useStoreConfigStore.getState();
    expect(state.primaryColor).toBeUndefined();
    expect(state.secondaryColor).toBe("#4B5563");
    expect(state.logoUrl).toBe("https://cdn.cartaisy.com/stores/acme/logo.png");
  });

  it("revalidateBranding clears a secondaryColor that only fails the newer cross-field $primarylight check", () => {
    // #737373 clears the flat $background check on its own but fails
    // against the $primarylight derived from primaryColor #000000 — the
    // exact scenario a pre-upgrade persisted pair could be stuck in.
    useStoreConfigStore.setState({
      primaryColor: "#000000",
      secondaryColor: "#737373",
    });

    useStoreConfigStore.getState().revalidateBranding();

    const state = useStoreConfigStore.getState();
    expect(state.primaryColor).toBe("#000000");
    expect(state.secondaryColor).toBeUndefined();
  });

  it("onRehydrateStorage's success path calls revalidateBranding before setHasHydrated, clearing a stale invalid persisted color on app upgrade", () => {
    // Caught in Codex review: branding persisted before an app update
    // shipped a stricter validation rule was valid at write time but is
    // restored completely unvalidated on rehydration. If the very next
    // /store/config fetch then fails, setConfig's fetchSucceeded:false path
    // preserves whatever's already in the store indefinitely — so without
    // this, a stale invalid color could stick around for the whole session.
    useStoreConfigStore.setState({
      primaryColor: "#A82A50",
      secondaryColor: "#FFFFFF", // invalid under current rules
      _hasHydrated: false,
    });

    const onRehydrateStorage = useStoreConfigStore.persist.getOptions().onRehydrateStorage;
    expect(onRehydrateStorage).toBeDefined();

    const rehydrateCallback = onRehydrateStorage!(useStoreConfigStore.getState());
    expect(rehydrateCallback).toBeDefined();

    // No error — this is the successful-rehydration path.
    rehydrateCallback!(useStoreConfigStore.getState(), undefined);

    const state = useStoreConfigStore.getState();
    expect(state.secondaryColor).toBeUndefined();
    expect(state.primaryColor).toBe("#A82A50");
    expect(state._hasHydrated).toBe(true);
  });

  it("onRehydrateStorage's success path resets isLoaded to false even when a previous session's persisted state had it true, so a stale/prior-tenant storeName can't be exposed via useCompanyName() before THIS session's fetch resolves (Codex review finding on PR #120)", () => {
    // Simulates a previous session that completed its /store/config fetch
    // (isLoaded: true, a real storeName persisted) followed by a cold
    // relaunch: zustand's persist middleware merges that persisted state
    // back in first, then onRehydrateStorage runs. Without the explicit
    // reset, isLoaded would still read true immediately post-rehydration —
    // before the current session's own AppInitializer fetch has even
    // started — letting useCompanyName() expose last session's (possibly
    // stale, or wrong-tenant) storeName.
    useStoreConfigStore.setState({
      storeName: "Acme Outfitters",
      isLoaded: true,
      _hasHydrated: false,
    });

    const onRehydrateStorage = useStoreConfigStore.persist.getOptions().onRehydrateStorage;
    expect(onRehydrateStorage).toBeDefined();

    const rehydrateCallback = onRehydrateStorage!(useStoreConfigStore.getState());
    expect(rehydrateCallback).toBeDefined();

    // No error — this is the successful-rehydration path.
    rehydrateCallback!(useStoreConfigStore.getState(), undefined);

    const state = useStoreConfigStore.getState();
    expect(state.isLoaded).toBe(false);
    // storeName itself is left alone by this reset — only isLoaded (the
    // gate useCompanyName() reads) is forced back to false; AppInitializer's
    // own fetch is what will overwrite storeName with the current session's
    // real value once it resolves.
    expect(state.storeName).toBe("Acme Outfitters");
    expect(state._hasHydrated).toBe(true);
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
