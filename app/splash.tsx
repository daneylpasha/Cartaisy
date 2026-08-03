import { AppImage } from "@/components/atoms/AppImage";
import useAuthStore from "@/store/useAuthStore";
import useStoreConfigStore from "@/store/useStoreConfigStore";
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

  // Runtime branding (PR #104's data layer), same pattern PR #106 shipped
  // for HomeHeader — already validated (HTTPS-only logo URL) before it
  // lands in the store, so no extra validation needed beyond a non-empty
  // check. Absent falls back to today's exact bundled appearance.
  const logoUrl = useStoreConfigStore((state) => state.logoUrl);
  const hasLogoUrl = Boolean(logoUrl && logoUrl.trim());

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
      {hasLogoUrl ? (
        // Distinct `key`s on these two branches are load-bearing, not
        // decorative: without them, React treats both branches as the same
        // <AppImage> element at this position and reuses the existing
        // instance (and its state) when logoUrl arrives asynchronously
        // after mount (e.g. from AppInitializer's startup fetch, which
        // resolves after this screen has already rendered the bundled
        // logo). That reused instance's `isLoading` state is still `false`
        // from its initial bundled-icon render, so the first render with
        // the new `source` prop has no fallback overlay and briefly shows
        // a blank/unloaded image until AppImage's own effect catches up on
        // a subsequent render. A `key` forces a full remount on that
        // transition instead, so the new instance's `isLoading` initializes
        // correctly (via its own useState(!!isRemoteSource)) from its very
        // first render — the bundled logo stays visible with no gap.
        <AppImage
          key="runtime-logo"
          source={logoUrl}
          fallbackName="cartaisyColorlogo"
          width={270}
          height={79}
        />
      ) : (
        <AppImage
          key="bundled-logo"
          width={270}
          height={79}
          name={"cartaisyColorlogo"}
        />
      )}
    </YStack>
  );
};

export default Splash;
