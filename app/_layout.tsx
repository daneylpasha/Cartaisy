import { HEADER_CONFIGS } from "@/constants/headers";
import { useColorScheme } from "@/hooks/useColorScheme";
import config from "@/tamagui.config";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TamaguiProvider } from "tamagui";

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
        <TamaguiProvider config={config} defaultTheme={colorScheme ?? "light"}>
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
              <Stack.Screen name="search" />
              <Stack.Screen
                name="_modal"
                options={{ presentation: "modal", headerShown: false }}
              />
              <Stack.Screen name="+not-found" />

              <Stack.Screen name="products" />
            </Stack>
          </BottomSheetModalProvider>
        </TamaguiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
