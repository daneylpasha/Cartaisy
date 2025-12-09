import { AppImage } from "@/components/atoms/AppImage";
import useAuthStore from "@/store/useAuthStore";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
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
      backgroundColor="$primary"
      justifyContent="center"
      alignItems="center"
    >
      <AppImage width={70} height={79} name={"bagWhite"} />
    </YStack>
  );
};

export default Splash;
