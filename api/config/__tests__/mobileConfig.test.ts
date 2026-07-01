const validEnv = {
  EXPO_PUBLIC_API_BASE_URL: "https://api.cartaisy.test",
  EXPO_PUBLIC_STORE_ID: "64f0c0ffee00000000000001",
};

const originalEnv = process.env;

const loadValidateMobileConfig = () => {
  jest.resetModules();
  process.env = {
    NODE_ENV: "test",
    ...validEnv,
  };

  return require("../mobileConfig").validateMobileConfig as typeof import("../mobileConfig").validateMobileConfig;
};

afterEach(() => {
  process.env = originalEnv;
});

describe("validateMobileConfig", () => {
  it("accepts a fully valid mobile config", () => {
    const validateMobileConfig = loadValidateMobileConfig();

    const result = validateMobileConfig(validEnv);

    expect(result.errors).toEqual([]);
    expect(result.isValid).toBe(true);
  });

  it("reports a missing API base URL", () => {
    const validateMobileConfig = loadValidateMobileConfig();

    const result = validateMobileConfig({
      ...validEnv,
      EXPO_PUBLIC_API_BASE_URL: "",
    });

    expect(result.missingRequiredConfig).toContain("EXPO_PUBLIC_API_BASE_URL");
    expect(result.isValid).toBe(false);
  });

  it("reports an invalid API base URL", () => {
    const validateMobileConfig = loadValidateMobileConfig();

    const result = validateMobileConfig({
      ...validEnv,
      EXPO_PUBLIC_API_BASE_URL: "ftp://api.cartaisy.test",
    });

    expect(result.invalidRequiredConfig).toContainEqual(
      expect.objectContaining({ key: "EXPO_PUBLIC_API_BASE_URL" })
    );
    expect(result.isValid).toBe(false);
  });

  it("reports a missing Store ID", () => {
    const validateMobileConfig = loadValidateMobileConfig();

    const result = validateMobileConfig({
      ...validEnv,
      EXPO_PUBLIC_STORE_ID: " ",
    });

    expect(result.missingRequiredConfig).toContain("EXPO_PUBLIC_STORE_ID");
    expect(result.isValid).toBe(false);
  });

  it("reports an invalid Store ID", () => {
    const validateMobileConfig = loadValidateMobileConfig();

    const result = validateMobileConfig({
      ...validEnv,
      EXPO_PUBLIC_STORE_ID: "not-a-store-id",
    });

    expect(result.invalidRequiredConfig).toContainEqual(
      expect.objectContaining({ key: "EXPO_PUBLIC_STORE_ID" })
    );
    expect(result.isValid).toBe(false);
  });

  it("reports forbidden public Shopify config keys", () => {
    const validateMobileConfig = loadValidateMobileConfig();

    const result = validateMobileConfig({
      ...validEnv,
      EXPO_PUBLIC_SHOPIFY_ACCESS_TOKEN: "public-shopify-token",
    });

    expect(result.forbiddenPublicConfig).toContainEqual(
      expect.objectContaining({ key: "EXPO_PUBLIC_SHOPIFY_ACCESS_TOKEN" })
    );
    expect(result.isValid).toBe(false);
  });

  it("reports secret-looking public env keys", () => {
    const validateMobileConfig = loadValidateMobileConfig();

    const result = validateMobileConfig({
      ...validEnv,
      EXPO_PUBLIC_CLIENT_SECRET: "client-secret",
    });

    expect(result.secretLikePublicConfig).toContainEqual(
      expect.objectContaining({ key: "EXPO_PUBLIC_CLIENT_SECRET" })
    );
    expect(result.isValid).toBe(false);
  });
});
