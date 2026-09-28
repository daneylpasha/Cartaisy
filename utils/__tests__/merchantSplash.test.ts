import { cachedSplashMatchesConfiguredStore } from "@/utils/merchantSplash";

describe("cachedSplashMatchesConfiguredStore", () => {
  const storeId = "507f1f77bcf86cd799439011";

  it("matches when the cached splash was saved for the configured store", () => {
    expect(cachedSplashMatchesConfiguredStore(storeId, storeId)).toBe(true);
    expect(
      cachedSplashMatchesConfiguredStore(`  ${storeId}  `, storeId)
    ).toBe(true);
  });

  it("fails closed when the store id is missing or belongs to another store", () => {
    expect(cachedSplashMatchesConfiguredStore(undefined, storeId)).toBe(false);
    expect(cachedSplashMatchesConfiguredStore("", storeId)).toBe(false);
    expect(cachedSplashMatchesConfiguredStore("   ", storeId)).toBe(false);
    expect(cachedSplashMatchesConfiguredStore(storeId, undefined)).toBe(false);
    expect(cachedSplashMatchesConfiguredStore(storeId, "")).toBe(false);
    expect(
      cachedSplashMatchesConfiguredStore(storeId, "aaaaaaaaaaaaaaaaaaaaaaaa")
    ).toBe(false);
  });
});