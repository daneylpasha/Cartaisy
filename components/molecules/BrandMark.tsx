import { useCompanyName } from "@/hooks/useCompanyName";
import useStoreConfigStore from "@/store/useStoreConfigStore";
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
 * Uses the public logo when the store published one. Otherwise the store
 * name, or a quiet ink monogram when the name is also missing.
 * Never renders the bundled Cartaisy wordmark.
 */
export const BrandMark = ({
  tone = "onLight",
  size = "standard",
  logoWidth,
  logoHeight,
}: BrandMarkProps) => {
  const logoUrl = useStoreConfigStore((state) => state.logoUrl);
  const primaryColor = useStoreConfigStore((state) => state.primaryColor);
  const companyName = useCompanyName();
  const trimmedLogo = logoUrl?.trim() ?? "";
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [trimmedLogo]);

  const defaults = SIZE_DEFAULTS[size];
  const width = logoWidth ?? defaults.logoWidth;
  const height = logoHeight ?? defaults.logoHeight;
  const showLogo = Boolean(trimmedLogo) && !failed;
  const ink = tone === "onColor" ? "$white" : primaryColor || "$primary";

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
      {showLogo ? (
        <Image
          testID="brand-mark-logo"
          accessibilityLabel={companyName || "Store logo"}
          source={{ uri: trimmedLogo }}
          resizeMode="contain"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={[
            styles.logo,
            {
              width,
              height,
              opacity: loaded ? 1 : 0,
              position: loaded ? "relative" : "absolute",
            },
          ]}
        />
      ) : null}
      {showLogo && loaded ? null : wordmark}
    </YStack>
  );
};

const styles = StyleSheet.create({
  logo: {
    alignSelf: "center",
  },
});
