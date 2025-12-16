import { queryClient } from "@/api/config/queryClient";
import { AppInitializer } from "@/components/providers/AppInitializer";
import { HEADER_CONFIGS } from "@/constants/headers";
import { AuthGuardProvider } from "@/contexts/AuthGuardContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import config from "@/tamagui.config";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { StripeProvider } from "@stripe/stripe-react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TamaguiProvider } from "tamagui";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (!Device.isDevice) {
    console.log("Must use physical device for Push Notifications");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Permission not granted for push notifications!");
    return;
  }

  try {
    // Get the project ID from app config
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    if (projectId) {
      // Use Expo Push Token if projectId is available
      const expoPushToken = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      token = expoPushToken.data;
      console.log("Expo Push Token:", token);
    } else {
      // Fallback to native FCM token for Android
      const devicePushToken = await Notifications.getDevicePushTokenAsync();
      token = devicePushToken.data;
      console.log("Device Push Token (FCM):", token);
    }
  } catch (error) {
    console.log("Error getting push token:", error);
  }

  return token;
}
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [expoPushToken, setExpoPushToken] = useState("");

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("📩 Notification Received:", notification);
      }
    );

    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("👉 User interacted:", response);
      }
    );

    return () => {
      subscription.remove();
      responseSub.remove();
    };
  }, []);
  // useEffect(() => {
  //   // Register for push notifications
  //   const subscription = Notifications.addNotificationReceivedListener(
  //     (notification) => {
  //       console.log("Notification received:", notification);
  //     }
  //   );

  //   const responseSubscription =
  //     Notifications.addNotificationResponseReceivedListener((response) => {
  //       console.log("Notification response:", response);
  //     });

  //   return () => {
  //     subscription.remove();
  //     responseSubscription.remove();
  //   };
  // }, []);

  const [loaded] = useFonts({
    "Figtree-Regular": require("../assets/fonts/Figtree-Regular.ttf"),
    "Figtree-Medium": require("../assets/fonts/Figtree-Medium.ttf"),
    "Figtree-Bold": require("../assets/fonts/Figtree-Bold.ttf"),
    "Figtree-SemiBold": require("../assets/fonts/Figtree-SemiBold.ttf"),
    "Figtree-ExtraBold": require("../assets/fonts/Figtree-ExtraBold.ttf"),
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AppInitializer />
          <StripeProvider
            publishableKey={
              process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
            }
            urlScheme={process.env.EXPO_PUBLIC_APP_SCHEME || "cartaisy"}
            merchantIdentifier={
              process.env.EXPO_PUBLIC_STRIPE_MERCHANT_ID || "merchant.com.cartaisy"
            }
          >
            <TamaguiProvider
              config={config}
              defaultTheme={colorScheme ?? "light"}
            >
              <BottomSheetModalProvider>
                <AuthGuardProvider>
                  <Stack
                    screenOptions={{ headerShown: false }}
                    initialRouteName="splash"
                  >
                    <Stack.Screen name="splash" />
                    <Stack.Screen name="wellcome" />
                    <Stack.Screen name="onboardingSlides" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="notification" />
                    <Stack.Screen name="fullName" />
                    <Stack.Screen name="phoneNumber" />
                    <Stack.Screen name="search" />
                    <Stack.Screen name="cancelOrder" />
                    <Stack.Screen
                      name="addAddress"
                      options={HEADER_CONFIGS.addAddress}
                    />
                    <Stack.Screen
                      name="personalInfo"
                      options={HEADER_CONFIGS.personalInfo}
                    />
                    <Stack.Screen
                      name="notificationSettings"
                      options={HEADER_CONFIGS.notificationSettings}
                    />
                    <Stack.Screen
                      name="paymentMethod"
                      options={HEADER_CONFIGS.paymentMethod}
                    />
                    <Stack.Screen
                      name="securitySettings"
                      options={HEADER_CONFIGS.securitySettings}
                    />
                    <Stack.Screen
                      name="changePassword"
                      options={HEADER_CONFIGS.changePassword}
                    />
                    <Stack.Screen
                      name="newPassword"
                      options={HEADER_CONFIGS.newPassword}
                    />
                    <Stack.Screen
                      name="addNewCardDetails"
                      options={HEADER_CONFIGS.addNewCardDetails}
                    />
                    <Stack.Screen
                      name="checkout"
                      options={HEADER_CONFIGS.checkout}
                    />
                    <Stack.Screen
                      name="order-success"
                      options={{ presentation: "modal", headerShown: false }}
                    />
                    <Stack.Screen name="orders" options={HEADER_CONFIGS.orders} />
                    <Stack.Screen
                      name="ordersDetails"
                      options={HEADER_CONFIGS.ordersDetails}
                    />
                    <Stack.Screen
                      name="allAddressList"
                      options={HEADER_CONFIGS.allAddressList}
                    />

                    <Stack.Screen
                      name="_modal"
                      options={{ presentation: "modal", headerShown: false }}
                    />
                    <Stack.Screen name="+not-found" />

                    <Stack.Screen name="products" />
                  </Stack>
                </AuthGuardProvider>
              </BottomSheetModalProvider>
            </TamaguiProvider>
          </StripeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
