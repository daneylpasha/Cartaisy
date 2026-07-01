import type { ExpoConfig } from "@expo/config-types";

const readEnv = (names: string[], fallback: string) => {
  for (const name of names) {
    const value = process.env[name]?.trim();

    if (value) {
      return value;
    }
  }

  return fallback;
};

const readPositiveInteger = (names: string[], fallback: number) => {
  const rawValue = readEnv(names, String(fallback));
  const value = Number(rawValue);

  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${names[0]} must be a positive integer.`);
  }

  return value;
};

const appName = readEnv(["APP_NAME", "EXPO_PUBLIC_APP_NAME"], "cartaisy");
const appSlug = readEnv(["APP_SLUG"], "cartaisy");
const appScheme = readEnv(["APP_SCHEME", "EXPO_PUBLIC_APP_SCHEME"], "cartaisy");
const appVersion = readEnv(["APP_VERSION"], "1.0.0");
const appIconPath = readEnv(
  ["APP_ICON_PATH"],
  "./assets/images/cartaisy-color-logo.png"
);
const notificationIconPath = readEnv(
  ["APP_NOTIFICATION_ICON_PATH", "APP_ICON_PATH"],
  "./assets/images/cartaisy-color-logo.png"
);
const notificationColor = readEnv(["APP_NOTIFICATION_COLOR"], "#8B5CF6");
const splashBackgroundColor = readEnv(["SPLASH_BACKGROUND_COLOR"], "#ffffff");
const iosBundleIdentifier = readEnv(
  ["IOS_BUNDLE_IDENTIFIER", "EXPO_PUBLIC_IOS_BUNDLE_ID"],
  "com.rendernext.cartaisy"
);
const iosBuildNumber = readEnv(["IOS_BUILD_NUMBER"], "1");
const iosGoogleServicesFile = readEnv(
  ["IOS_GOOGLE_SERVICES_FILE"],
  "./GoogleService-Info.plist"
);
const applePayMerchantId = readEnv(
  [
    "IOS_APPLE_PAY_MERCHANT_ID",
    "STRIPE_MERCHANT_ID",
    "EXPO_PUBLIC_STRIPE_MERCHANT_ID",
  ],
  "merchant.com.cartaisy"
);
const androidPackage = readEnv(
  ["ANDROID_PACKAGE", "EXPO_PUBLIC_ANDROID_PACKAGE"],
  "com.rendernext.cartaisy"
);
const androidVersionCode = readPositiveInteger(["ANDROID_VERSION_CODE"], 1);
const androidGoogleServicesFile = readEnv(
  ["ANDROID_GOOGLE_SERVICES_FILE"],
  "./google-services.json"
);
const androidAdaptiveIconPath = readEnv(
  ["ANDROID_ADAPTIVE_ICON_PATH"],
  "./assets/images/adaptive-icon.png"
);
const androidAdaptiveIconBackground = readEnv(
  ["ANDROID_ADAPTIVE_ICON_BACKGROUND"],
  "#ffffff"
);
const easProjectId = readEnv(
  ["EAS_PROJECT_ID"],
  "eabf3411-284b-4bd8-88eb-8d89a8a4ee14"
);
const expoOwner = readEnv(["EXPO_OWNER"], "rendernext");

const config: ExpoConfig = {
  name: appName,
  slug: appSlug,
  version: appVersion,
  orientation: "portrait",
  icon: appIconPath,
  scheme: appScheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  notification: {
    icon: notificationIconPath,
    color: notificationColor,
    androidMode: "default",
    androidCollapsedTitle: "{{unread_count}} new notifications",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: iosBundleIdentifier,
    buildNumber: iosBuildNumber,
    googleServicesFile: iosGoogleServicesFile,
    infoPlist: {
      UIBackgroundModes: ["remote-notification"],
    },
    entitlements: {
      "com.apple.developer.in-app-payments": [applePayMerchantId],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: androidAdaptiveIconPath,
      backgroundColor: androidAdaptiveIconBackground,
    },
    edgeToEdgeEnabled: true,
    package: androidPackage,
    versionCode: androidVersionCode,
    googleServicesFile: androidGoogleServicesFile,
    permissions: ["NOTIFICATIONS", "VIBRATE"],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: appIconPath,
  },
  plugins: [
    [
      "expo-splash-screen",
      {
        backgroundColor: splashBackgroundColor,
        android: {
          backgroundColor: splashBackgroundColor,
        },
      },
    ],
    "expo-router",
    "expo-mail-composer",
    [
      "expo-notifications",
      {
        icon: notificationIconPath,
        color: notificationColor,
        sounds: [],
      },
    ],
    "@react-native-firebase/app",
    "@react-native-firebase/messaging",
    [
      "@stripe/stripe-react-native",
      {
        merchantIdentifier: applePayMerchantId,
        enableGooglePay: true,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: easProjectId,
    },
    router: {},
  },
  owner: expoOwner,
};

export default config;
