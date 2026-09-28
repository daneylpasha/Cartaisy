import { MerchantSplashImage } from "@/components/molecules/MerchantSplashImage";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { isValidPublicBrandImageUrl } from "@/utils/brandingValidation";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { StatusBar, StyleSheet, View } from "react-native";

/**
 * Painted before fonts finish loading, while the native splash is still up.
 * When the persisted store config already has a merchant splash, this hides
 * the native Cartaisy splash and shows that image. With no splash URL it
 * renders nothing so the native splash stays until the JS splash route.
 */
export function EarlyMerchantSplash() {
  const hydrated = useStoreConfigStore((state) => state._hasHydrated);
  const splashUrl = useStoreConfigStore((state) => state.splashUrl);
  const safeSplash = isValidPublicBrandImageUrl(splashUrl)
    ? splashUrl.trim()
    : "";
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [safeSplash]);

  const visible = hydrated && Boolean(safeSplash) && !failed;

  useEffect(() => {
    if (!visible) return;
    SplashScreen.hideAsync().catch(() => {});
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.fill}>
      <StatusBar hidden />
      <MerchantSplashImage uri={safeSplash} onError={() => setFailed(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
