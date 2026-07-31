const mockGet = jest.fn();

jest.mock("../../apiClient", () => ({
  axiosInstance: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

import { getStoreConfig } from "../storeConfig";

describe("getStoreConfig", () => {
  beforeEach(() => {
    mockGet.mockReset();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("passes through all three branding fields when the backend includes them, flat on data", async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        data: {
          currency: "USD",
          timezone: "UTC",
          name: "Acme Outfitters",
          primaryColor: "#A82A50",
          secondaryColor: "#4B5563",
          logoUrl: "https://cdn.cartaisy.com/stores/acme/logo.png",
        },
      },
    });

    const config = await getStoreConfig();

    expect(config).toEqual({
      currency: "USD",
      timezone: "UTC",
      name: "Acme Outfitters",
      primaryColor: "#A82A50",
      secondaryColor: "#4B5563",
      logoUrl: "https://cdn.cartaisy.com/stores/acme/logo.png",
    });
  });

  it("returns branding fields as undefined when the backend response omits them entirely (today's default Cartaisy store)", async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        data: {
          currency: "USD",
          timezone: "UTC",
          name: "Cartaisy",
        },
      },
    });

    const config = await getStoreConfig();

    expect(config.primaryColor).toBeUndefined();
    expect(config.secondaryColor).toBeUndefined();
    expect(config.logoUrl).toBeUndefined();
    expect(config.currency).toBe("USD");
    expect(config.name).toBe("Cartaisy");
  });

  it("rejects on fetch failure instead of silently falling back to defaults", async () => {
    // getStoreConfig() used to catch this internally and resolve to bare
    // defaults, which made a genuine fetch failure indistinguishable from a
    // successful response with no branding — both looked like the same
    // plain object to the caller. It now lets the error propagate so
    // AppInitializer's catch block can tell the two apart and only
    // preserve previously persisted branding on a real failure (see
    // store/useStoreConfigStore.ts's `fetchSucceeded` flag).
    const networkError = new Error("network error");
    mockGet.mockRejectedValueOnce(networkError);

    await expect(getStoreConfig()).rejects.toThrow("network error");
  });
});
