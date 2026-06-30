export type MobileRequiredConfigKey = "EXPO_PUBLIC_API_BASE_URL" | "EXPO_PUBLIC_STORE_ID";

declare const __DEV__: boolean;

type MobileConfig = {
  apiBaseUrl: string;
  storeId: string;
};

type MobilePublicEnv = Record<string, string | undefined>;

type MobileConfigValidationIssue = {
  key: string;
  message: string;
};

type MobileConfigValidation = {
  missingRequiredConfig: MobileRequiredConfigKey[];
  invalidRequiredConfig: MobileConfigValidationIssue[];
  forbiddenPublicConfig: MobileConfigValidationIssue[];
  secretLikePublicConfig: MobileConfigValidationIssue[];
  errors: MobileConfigValidationIssue[];
  isValid: boolean;
};

const configLabels: Record<MobileRequiredConfigKey, string> = {
  EXPO_PUBLIC_API_BASE_URL: "API base URL",
  EXPO_PUBLIC_STORE_ID: "Store ID",
};

const mongoObjectIdPattern = /^[a-f\d]{24}$/i;
const secretLikePublicConfigPattern =
  /(^|_)(SECRET|PASSWORD|PRIVATE_KEY|ACCESS_TOKEN|REFRESH_TOKEN|ADMIN_TOKEN|CLIENT_SECRET)($|_)/;
const isDevelopmentBuild = typeof __DEV__ === "undefined" ? process.env.NODE_ENV !== "production" : __DEV__;

const requiredConfigKeys: MobileRequiredConfigKey[] = [
  "EXPO_PUBLIC_API_BASE_URL",
  "EXPO_PUBLIC_STORE_ID",
];

const getRequiredConfig = (env: MobilePublicEnv): Record<MobileRequiredConfigKey, string | undefined> => ({
  EXPO_PUBLIC_API_BASE_URL: env.EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_STORE_ID: env.EXPO_PUBLIC_STORE_ID,
});

const getMissingRequiredConfig = (requiredConfig: Record<MobileRequiredConfigKey, string | undefined>) =>
  requiredConfigKeys.filter((key) => !requiredConfig[key]?.trim());

const getInvalidRequiredConfig = (
  requiredConfig: Record<MobileRequiredConfigKey, string | undefined>,
  missingRequiredConfig: MobileRequiredConfigKey[]
): MobileConfigValidationIssue[] => {
  const missingConfig = new Set(missingRequiredConfig);
  const invalidConfig: MobileConfigValidationIssue[] = [];
  const apiBaseUrl = requiredConfig.EXPO_PUBLIC_API_BASE_URL?.trim();
  const storeId = requiredConfig.EXPO_PUBLIC_STORE_ID?.trim();

  if (apiBaseUrl && !missingConfig.has("EXPO_PUBLIC_API_BASE_URL")) {
    try {
      const parsedUrl = new URL(apiBaseUrl);

      if (!["http:", "https:"].includes(parsedUrl.protocol) || !parsedUrl.hostname) {
        invalidConfig.push({
          key: "EXPO_PUBLIC_API_BASE_URL",
          message: "API base URL must be an absolute HTTP or HTTPS URL.",
        });
      }
    } catch {
      invalidConfig.push({
        key: "EXPO_PUBLIC_API_BASE_URL",
        message: "API base URL must be an absolute HTTP or HTTPS URL.",
      });
    }
  }

  if (storeId && !missingConfig.has("EXPO_PUBLIC_STORE_ID") && !mongoObjectIdPattern.test(storeId)) {
    invalidConfig.push({
      key: "EXPO_PUBLIC_STORE_ID",
      message: "Store ID must be a 24-character Mongo ObjectId.",
    });
  }

  return invalidConfig;
};

const getForbiddenPublicConfig = (env: MobilePublicEnv): MobileConfigValidationIssue[] =>
  Object.keys(env)
    .filter((key) => /^EXPO_PUBLIC_SHOPIFY_/i.test(key))
    .map((key) => ({
      key,
      message: "Shopify credentials and Shopify API config must not be exposed to the mobile app.",
    }));

const getSecretLikePublicConfig = (env: MobilePublicEnv): MobileConfigValidationIssue[] =>
  Object.keys(env)
    .filter(
      (key) =>
        key.startsWith("EXPO_PUBLIC_") &&
        !/^EXPO_PUBLIC_SHOPIFY_/i.test(key) &&
        secretLikePublicConfigPattern.test(key)
    )
    .map((key) => ({
      key,
      message: "Secret-looking public config names must not be exposed through EXPO_PUBLIC_*.",
    }));

export const validateMobileConfig = (env: MobilePublicEnv): MobileConfigValidation => {
  const requiredConfig = getRequiredConfig(env);
  const missingRequiredConfig = getMissingRequiredConfig(requiredConfig);
  const invalidRequiredConfig = getInvalidRequiredConfig(requiredConfig, missingRequiredConfig);
  const forbiddenPublicConfig = getForbiddenPublicConfig(env);
  const secretLikePublicConfig = getSecretLikePublicConfig(env);
  const errors = [
    ...missingRequiredConfig.map((key) => ({
      key,
      message: `${configLabels[key]} (${key}) is required.`,
    })),
    ...invalidRequiredConfig,
    ...forbiddenPublicConfig,
    ...secretLikePublicConfig,
  ];

  return {
    missingRequiredConfig,
    invalidRequiredConfig,
    forbiddenPublicConfig,
    secretLikePublicConfig,
    errors,
    isValid: errors.length === 0,
  };
};

const formatConfigErrors = (errors: MobileConfigValidationIssue[]) =>
  errors.map((error) => `${error.key}: ${error.message}`).join(" ");

const reportInvalidMobileConfig = (validation: MobileConfigValidation) => {
  if (validation.isValid) {
    return;
  }

  const message =
    `[Mobile Config] Invalid public config. ${formatConfigErrors(validation.errors)} ` +
    "Branded builds must define safe EXPO_PUBLIC_* values before making API requests.";

  if (!isDevelopmentBuild) {
    throw new Error(message);
  }

  console.error(message);
};

const requiredConfig = getRequiredConfig(process.env);
const mobileConfigValidation = validateMobileConfig(process.env);
const invalidRequiredConfigKeys = new Set(mobileConfigValidation.invalidRequiredConfig.map((issue) => issue.key));

reportInvalidMobileConfig(mobileConfigValidation);

export const mobileConfig: MobileConfig = {
  apiBaseUrl: invalidRequiredConfigKeys.has("EXPO_PUBLIC_API_BASE_URL")
    ? ""
    : requiredConfig.EXPO_PUBLIC_API_BASE_URL || "",
  storeId: invalidRequiredConfigKeys.has("EXPO_PUBLIC_STORE_ID") ? "" : requiredConfig.EXPO_PUBLIC_STORE_ID || "",
};

export { mobileConfigValidation };
