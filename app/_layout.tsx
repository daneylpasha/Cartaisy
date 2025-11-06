import { queryClient } from "@/api/config/queryClient";
import { AppInitializer } from "@/components/providers/AppInitializer";
import { HEADER_CONFIGS } from "@/constants/headers";
import { useColorScheme } from "@/hooks/useColorScheme";
import config from "@/tamagui.config";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { StripeProvider } from "@stripe/stripe-react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";

import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
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
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Permission not granted!");
    return;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  console.log("Expo Push Token:", tokenData.data);
  return tokenData.data;
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
            urlScheme="cartaisy"
            merchantIdentifier="merchant.com.cartaisy"
          >
            <TamaguiProvider
              config={config}
              defaultTheme={colorScheme ?? "light"}
            >
              <BottomSheetModalProvider>
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
              </BottomSheetModalProvider>
            </TamaguiProvider>
          </StripeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
