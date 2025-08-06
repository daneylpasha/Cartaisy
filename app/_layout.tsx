import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TamaguiProvider } from "tamagui";

import { useColorScheme } from "@/hooks/useColorScheme";
import config from "@/tamagui.config";

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
    <SafeAreaProvider>
      <TamaguiProvider config={config} defaultTheme={colorScheme ?? "light"}>
        <Stack screenOptions={{ headerShown: false }} initialRouteName="splash">
          <Stack.Screen name="splash" />
          <Stack.Screen name="wellcome" />
          <Stack.Screen name="onboardingSlides" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="notification" />
          <Stack.Screen name="fullName" />
          <Stack.Screen name="phoneNumber" />
          <Stack.Screen
            name="_modal"
            options={{ presentation: "modal", headerShown: false }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        {/* <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        </SafeAreaView> */}
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
