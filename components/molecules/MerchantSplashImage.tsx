import React from "react";
import { Image, StyleSheet } from "react-native";

type MerchantSplashImageProps = {
  uri: string;
  onError: () => void;
  onLoad?: () => void;
};

/**
 * Full-bleed merchant splash. Callers pass a URL that already passed
 * `isValidPublicBrandImageUrl`. A load failure is reported so the caller
 * can fall back to the in-app mark.
 */
export function MerchantSplashImage({
  uri,
  onError,
  onLoad,
}: MerchantSplashImageProps) {
  return (
    <Image
      testID="merchant-splash"
      accessibilityLabel="Store splash"
      accessible
      source={{ uri }}
      resizeMode="cover"
      fadeDuration={0}
      onError={onError}
      onLoad={onLoad}
      style={StyleSheet.absoluteFillObject}
    />
  );
}
