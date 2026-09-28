import { mobileConfig } from "@/api/config/mobileConfig";
import { MerchantSplashImage } from "@/components/molecules/MerchantSplashImage";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { isValidPublicBrandImageUrl } from "@/utils/brandingValidation";
import { cachedSplashMatchesConfiguredStore } from "@/utils/merchantSplash";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Dimensions, StatusBar, StyleSheet, View } from "react-native";

/**
 * Painted before fonts finish loading, while the native splash is still up.
 * When the persisted splash belongs to the current store, this mounts that
 * image underneath the native splash and hides the native splash only after
 * the image has loaded. A missing, mismatched, or failed splash renders
 * nothing so the native splash stays until the JS splash route shows the mark.
 */
export function EarlyMerchantSplash() {
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
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [safeSplash]);

  const visible =
    hydrated && Boolean(safeSplash) && splashBelongsToStore && !failed;

  if (!visible) {
    return null;
  }

  const { width, height } = Dimensions.get("window");

  return (
    <View style={[styles.fill, { width, height }]}>
      <StatusBar hidden />
      <MerchantSplashImage
        uri={safeSplash}
        onLoad={() => {
          SplashScreen.hideAsync().catch(() => {});
        }}
        onError={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
});
