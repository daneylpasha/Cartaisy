import { mobileConfig } from "@/api/config/mobileConfig";
import { BrandMark } from "@/components/molecules/BrandMark";
import { MerchantSplashImage } from "@/components/molecules/MerchantSplashImage";
import useAuthStore from "@/store/useAuthStore";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { isValidPublicBrandImageUrl } from "@/utils/brandingValidation";
import { cachedSplashMatchesConfiguredStore } from "@/utils/merchantSplash";
import {
  resetDeepLinkState,
  wasDeepLinkHandled,
} from "@/utils/navigationState";
import * as SplashScreen from "expo-splash-screen";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, StatusBar } from "react-native";
import { YStack } from "tamagui";

const SPLASH_DURATION = 3000;
const SPLASH_LOAD_TIMEOUT = 2500;

const Splash = () => {
  const hasNavigated = useRef(false);
  const splashReadyRef = useRef(false);
  const hydrated = useStoreConfigStore((state) => state._hasHydrated);
  const splashUrl = useStoreConfigStore((state) => state.splashUrl);
  const cachedStoreId = useStoreConfigStore((state) => state.storeId);
  const safeSplash = isValidPublicBrandImageUrl(splashUrl)
    ? splashUrl.trim()
    : "";
  const splashBelongsToStore = cachedSplashMatchesConfiguredStore(
    cachedStoreId,
    mobileConfig.storeId,
  );
  const [splashFailed, setSplashFailed] = useState(false);
  const showMerchantSplash =
    Boolean(safeSplash) && splashBelongsToStore && !splashFailed;

  useEffect(() => {
    splashReadyRef.current = false;
    setSplashFailed(false);

    if (!hydrated || !safeSplash || !splashBelongsToStore) return;

    const timer = setTimeout(() => {
      if (!splashReadyRef.current) {
        setSplashFailed(true);
      }
    }, SPLASH_LOAD_TIMEOUT);

    return () => clearTimeout(timer);
  }, [hydrated, safeSplash, splashBelongsToStore]);

  useEffect(() => {
    if (!hydrated || showMerchantSplash) return;
    SplashScreen.hideAsync().catch(() => {});
  }, [hydrated, showMerchantSplash]);

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

  const { width, height } = Dimensions.get("window");

  if (!hydrated) {
    return (
      <YStack
        width={width}
        height={height}
        backgroundColor="$white"
        testID="splash-pending"
      >
        <StatusBar hidden={true} />
      </YStack>
    );
  }

  return (
    <YStack
      width={width}
      height={height}
      backgroundColor="$white"
      justifyContent="center"
      alignItems="center"
      overflow="hidden"
    >
      <StatusBar hidden={true} />
      {showMerchantSplash ? (
        <MerchantSplashImage
          uri={safeSplash}
          onLoad={() => {
            splashReadyRef.current = true;
            SplashScreen.hideAsync().catch(() => {});
          }}
          onError={() => setSplashFailed(true)}
        />
      ) : (
        <BrandMark size="hero" tone="onLight" />
      )}
    </YStack>
  );
};

export default Splash;
