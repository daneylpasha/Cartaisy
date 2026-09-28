import React from "react";
import { Dimensions, Image, StyleSheet } from "react-native";

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
  const { width, height } = Dimensions.get("window");

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
      style={[styles.image, { width, height }]}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});
