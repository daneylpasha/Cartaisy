const CONTROLLED_CATALOG_ERROR_CODES = new Set([
  "STORE_INACTIVE",
  "STORE_UNAVAILABLE",
  "STORE_NOT_FOUND",
  "STORE_CONFIGURATION_ERROR",
  "STORE_CONFIG_MISSING",
  "SHOPIFY_CREDENTIALS_MISSING",
  "SHOPIFY_CONFIG_MISSING",
  "SHOPIFY_CONFIGURATION_ERROR",
  "SHOPIFY_UNAVAILABLE",
  "CATALOG_UNAVAILABLE",
]);

const CATALOG_UNAVAILABLE_STATUSES = new Set([403, 423, 503]);

type ErrorPayload = {
  code?: unknown;
  message?: unknown;
  error?: unknown;
  details?: unknown;
};

const extractNamedErrorStrings = (payload?: ErrorPayload): string[] => {
  if (!payload) return [];

  return [
    payload.code,
    payload.message,
    payload.error,
    payload.details,
  ].flatMap(collectErrorFieldStrings);
};

const collectErrorFieldStrings = (value: unknown): string[] => {
  if (!value) return [];

  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectErrorFieldStrings);
  }

  if (typeof value === "object") {
    const nested = value as ErrorPayload;
    return [nested.code, nested.message, nested.error, nested.details].flatMap(
      collectErrorFieldStrings
    );
  }

  return [];
};

const getResponsePayload = (error: unknown): ErrorPayload | undefined => {
  if (!error || typeof error !== "object") return undefined;

  const response = (error as { response?: { data?: ErrorPayload } }).response;
  return response?.data;
};

const getResponseStatus = (error: unknown): number | undefined => {
  if (!error || typeof error !== "object") return undefined;

  return (error as { response?: { status?: number } }).response?.status;
};

export const getCatalogUnavailableMessage = (
  error: unknown
): string | null => {
  const payload = getResponsePayload(error);
  const status = getResponseStatus(error);
  const strings = extractNamedErrorStrings(payload);
  const normalized = strings.map((value) => value.toLowerCase());
  const codes = strings.map((value) => value.toUpperCase());

  const hasControlledCode = codes.some((code) =>
    CONTROLLED_CATALOG_ERROR_CODES.has(code)
  );

  const mentionsCatalogContext = normalized.some(
    (value) =>
      value.includes("store") ||
      value.includes("shopify") ||
      value.includes("catalog")
  );

  const mentionsUnavailableState = normalized.some(
    (value) =>
      value.includes("unavailable") ||
      value.includes("inactive") ||
      value.includes("disabled") ||
      value.includes("credential") ||
      value.includes("configuration") ||
      value.includes("configured") ||
      value.includes("missing")
  );

  if (
    hasControlledCode ||
    (status !== undefined &&
      CATALOG_UNAVAILABLE_STATUSES.has(status) &&
      mentionsCatalogContext &&
      mentionsUnavailableState)
  ) {
    return "This store's catalog is temporarily unavailable. Please try again later.";
  }

  return null;
};

export const isCatalogUnavailableError = (error: unknown): boolean =>
  getCatalogUnavailableMessage(error) !== null;
