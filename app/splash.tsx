import { AppImage } from "@/components/atoms/AppImage";
import useAuthStore from "@/store/useAuthStore";
import {
  resetDeepLinkState,
  wasDeepLinkHandled,
} from "@/utils/navigationState";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { StatusBar } from "react-native";
import { YStack } from "tamagui";

const SPLASH_DURATION = 3000;

const Splash = () => {
  const hasNavigated = useRef(false);

  useEffect(() => {
    // Only navigate once on initial mount
    if (hasNavigated.current) return;

    const timer = setTimeout(() => {
      if (hasNavigated.current) return;
      hasNavigated.current = true;

      // Check if deep link navigation was already handled (cold start)
      // If so, don't override it with default navigation
      if (wasDeepLinkHandled()) {
        console.log(
          "[Splash] Deep link already handled, skipping default navigation"
        );
        resetDeepLinkState(); // Reset for next time
        return;
      }

      // Get current state at navigation time (not stale closure values)
      const { token, isProfileComplete, enableGuestMode, initializeDeviceId } =
        useAuthStore.getState();

      // Initialize device ID for tracking
      initializeDeviceId();

      if (token && isProfileComplete) {
        // User is logged in and profile is complete
        router.replace("/(tabs)");
      } else if (token && !isProfileComplete) {
        // User is logged in but profile is incomplete - continue signup flow
        router.replace("/fullName");
      } else {
        // User is not logged in - enable guest mode and go to main app
        // This allows guests to browse and add to cart without signing up
        enableGuestMode();
        router.replace("/(tabs)");
      }
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, []); // Empty dependency - only run once on mount

  return (
    <YStack
      flex={1}
      backgroundColor="$white"
      justifyContent="center"
      alignItems="center"
    >
      <StatusBar hidden={true} />
      <AppImage width={270} height={79} name={"cartaisyColorlogo"} />
    </YStack>
  );
};

export default Splash;
