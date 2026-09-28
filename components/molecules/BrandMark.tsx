import { useCompanyName } from "@/hooks/useCompanyName";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import {
  isValidLogoUrl,
  isValidPublicBrandImageUrl,
} from "@/utils/brandingValidation";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet } from "react-native";
import { Text, YStack } from "tamagui";

type BrandMarkSize = "compact" | "standard" | "hero";

type BrandMarkProps = {
  /**
   * `onColor` sits on a filled primary header (white type).
   * `onLight` sits on white or the page background (primary type).
   */
  tone?: "onLight" | "onColor";
  size?: BrandMarkSize;
  logoWidth?: number;
  logoHeight?: number;
};

const SIZE_DEFAULTS: Record<
  BrandMarkSize,
  { logoWidth: number; logoHeight: number; fontSize: number; mark: number }
> = {
  compact: { logoWidth: 88, logoHeight: 28, fontSize: 16, mark: 22 },
  standard: { logoWidth: 140, logoHeight: 48, fontSize: 22, mark: 36 },
  hero: { logoWidth: 220, logoHeight: 72, fontSize: 34, mark: 56 },
};

/**
 * Store identity for headers, splash, auth, and account.
 * Uses the public logo when the store published one. Otherwise the square
 * app icon (`iconUrl`), then the store name, then a quiet ink monogram.
 * Never renders the bundled Cartaisy wordmark or a token-shaped image URL.
 */
export const BrandMark = ({
  tone = "onLight",
  size = "standard",
  logoWidth,
  logoHeight,
}: BrandMarkProps) => {
  const logoUrl = useStoreConfigStore((state) => state.logoUrl);
  const iconUrl = useStoreConfigStore((state) => state.iconUrl);
  const primaryColor = useStoreConfigStore((state) => state.primaryColor);
  const companyName = useCompanyName();
  const safeLogo = isValidLogoUrl(logoUrl) ? logoUrl.trim() : "";
  const safeIcon = isValidPublicBrandImageUrl(iconUrl) ? iconUrl.trim() : "";
  const [logoFailed, setLogoFailed] = useState(false);
  const [iconFailed, setIconFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLogoFailed(false);
  }, [safeLogo]);

  useEffect(() => {
    setIconFailed(false);
  }, [safeIcon]);

  const defaults = SIZE_DEFAULTS[size];
  const showLogo = Boolean(safeLogo) && !logoFailed;
  const showIcon = !showLogo && Boolean(safeIcon) && !iconFailed;
  const imageUrl = showLogo ? safeLogo : showIcon ? safeIcon : "";
  const iconSize = defaults.mark * 2;
  const width = showIcon ? iconSize : logoWidth ?? defaults.logoWidth;
  const height = showIcon ? iconSize : logoHeight ?? defaults.logoHeight;
  const ink = tone === "onColor" ? "$white" : primaryColor || "$primary";

  useEffect(() => {
    setLoaded(false);
  }, [imageUrl]);

  const wordmark = companyName ? (
    <Text
      testID="brand-mark-name"
      color={ink}
      fontFamily="$figtree"
      fontWeight="700"
      fontSize={defaults.fontSize}
      letterSpacing={size === "hero" ? 0.6 : 0.2}
      numberOfLines={1}
      ellipsizeMode="tail"
      maxWidth={Math.max(width + 48, 160)}
      textAlign="center"
    >
      {companyName}
    </Text>
  ) : (
    <YStack
      testID="brand-mark-monogram"
      width={defaults.mark}
      height={defaults.mark}
      borderRadius={size === "hero" ? 16 : 8}
      borderWidth={1.5}
      borderColor={ink}
      alignItems="center"
      justifyContent="center"
      accessibilityLabel="Store"
    >
      <YStack
        width={size === "hero" ? 8 : 5}
        height={size === "hero" ? 8 : 5}
        borderRadius={999}
        backgroundColor={ink}
      />
    </YStack>
  );

  return (
    <YStack
      testID="brand-mark"
      alignItems="center"
      justifyContent="center"
      minHeight={height}
      maxWidth={Math.max(width + 48, 180)}
    >
      {imageUrl ? (
        <Image
          testID={showIcon ? "brand-mark-icon" : "brand-mark-logo"}
          accessibilityLabel={
            companyName || (showIcon ? "Store icon" : "Store logo")
          }
          source={{ uri: imageUrl }}
          resizeMode="contain"
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (showLogo) {
              setLogoFailed(true);
            } else {
              setIconFailed(true);
            }
          }}
          style={[
            styles.logo,
            showIcon ? styles.icon : null,
            {
              width,
              height,
              borderRadius: showIcon ? Math.round(iconSize * 0.22) : 0,
              opacity: loaded ? 1 : 0,
              position: loaded ? "relative" : "absolute",
            },
          ]}
        />
      ) : null}
      {imageUrl && loaded ? null : wordmark}
    </YStack>
  );
};

const styles = StyleSheet.create({
  logo: {
    alignSelf: "center",
  },
  icon: {
    overflow: "hidden",
  },
});
