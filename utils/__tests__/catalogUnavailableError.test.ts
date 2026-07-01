import {
  getCatalogUnavailableMessage,
  isCatalogUnavailableError,
} from "../catalogUnavailableError";

const unavailableMessage =
  "This store's catalog is temporarily unavailable. Please try again later.";

const apiError = (status: number, data: Record<string, unknown>) => ({
  response: {
    status,
    data,
  },
});

describe("catalog unavailable error classification", () => {
  it.each([
    "STORE_INACTIVE",
    "STORE_UNAVAILABLE",
    "STORE_NOT_FOUND",
    "STORE_CONFIGURATION_ERROR",
    "STORE_CONFIG_MISSING",
  ])("classifies %s as a catalog unavailable error", (code) => {
    const error = apiError(403, { code });

    expect(getCatalogUnavailableMessage(error)).toBe(unavailableMessage);
    expect(isCatalogUnavailableError(error)).toBe(true);
  });

  it.each([
    "SHOPIFY_CONFIG_MISSING",
    "SHOPIFY_CREDENTIALS_MISSING",
    "SHOPIFY_CONFIGURATION_ERROR",
    "SHOPIFY_UNAVAILABLE",
    "CATALOG_UNAVAILABLE",
  ])("classifies %s as a catalog unavailable error", (code) => {
    const error = apiError(503, { code });

    expect(getCatalogUnavailableMessage(error)).toBe(unavailableMessage);
    expect(isCatalogUnavailableError(error)).toBe(true);
  });

  it("classifies catalog unavailable errors from response messages", () => {
    const error = apiError(503, {
      message: "Catalog is unavailable for this store",
    });

    expect(getCatalogUnavailableMessage(error)).toBe(unavailableMessage);
    expect(isCatalogUnavailableError(error)).toBe(true);
  });

  it("does not classify unrelated API errors as catalog unavailable", () => {
    const error = apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected server error",
    });

    expect(getCatalogUnavailableMessage(error)).toBeNull();
    expect(isCatalogUnavailableError(error)).toBe(false);
  });
});
