export type MobileRequiredConfigKey = "EXPO_PUBLIC_API_BASE_URL" | "EXPO_PUBLIC_STORE_ID";

type MobileConfig = {
  apiBaseUrl: string;
  storeId: string;
};

const requiredConfig: Record<MobileRequiredConfigKey, string | undefined> = {
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_STORE_ID: process.env.EXPO_PUBLIC_STORE_ID,
};

const configLabels: Record<MobileRequiredConfigKey, string> = {
  EXPO_PUBLIC_API_BASE_URL: "API base URL",
  EXPO_PUBLIC_STORE_ID: "Store ID",
};

const getMissingRequiredConfig = () =>
  (Object.keys(requiredConfig) as MobileRequiredConfigKey[]).filter(
    (key) => !requiredConfig[key]?.trim()
  );

const warnMissingRequiredConfig = (missingConfig: MobileRequiredConfigKey[]) => {
  if (!__DEV__ || missingConfig.length === 0) {
    return;
  }

  const missingLabels = missingConfig
    .map((key) => `${configLabels[key]} (${key})`)
    .join(", ");

  console.error(
    `[Mobile Config] Missing required public config: ${missingLabels}. ` +
      "Branded builds must define these EXPO_PUBLIC_* values before making API requests."
  );
};

const missingRequiredConfig = getMissingRequiredConfig();

warnMissingRequiredConfig(missingRequiredConfig);

export const mobileConfig: MobileConfig = {
  apiBaseUrl: requiredConfig.EXPO_PUBLIC_API_BASE_URL || "",
  storeId: requiredConfig.EXPO_PUBLIC_STORE_ID || "",
};

export const mobileConfigValidation = {
  missingRequiredConfig,
  isValid: missingRequiredConfig.length === 0,
};
