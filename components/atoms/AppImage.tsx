import Icons from "@/assets/Icons";
import type { AppConfig } from "@/tamagui/config";
import { tokens } from "@/tamagui/token";
import React, { useState } from "react";
import { Image, ImageResizeMode } from "react-native";
import { Shimmer, ShimmerProvider } from "react-native-fast-shimmer";
import { Easing } from "react-native-reanimated";
import type { SvgProps } from "react-native-svg";
import { styled, YStack } from "tamagui";

type AppImageProps = {
  name?: keyof typeof Icons;
  source?: string | { uri: string };
  size?: number;
  width?: number | string;
  radius?: keyof AppConfig["tokens"]["space"] | number;
  height?: number;
  style?: any;
  tintColor?: keyof AppConfig["tokens"]["color"] | string;
  resizeMode?: ImageResizeMode;
};

// Styled wrapper using Tamagui
const StyledImage = styled(Image, {
  resizeMode: "contain",
});

export const AppImage: React.FC<AppImageProps> = ({
  name,
  source,
  size,
  width,
  radius,
  height,
  style,
  tintColor,
  resizeMode = "contain",
}) => {
  // Determine if source is remote
  const isRemoteSource =
    (typeof source === "string" && source.trim()) ||
    (typeof source === "object" && source?.uri);

  const sourceKey = typeof source === "string" ? source : source?.uri || "";

  const [isLoading, setIsLoading] = useState(!!isRemoteSource);
  const [hasError, setHasError] = useState(false);

  // Reset loading state when source changes
  React.useEffect(() => {
    if (sourceKey && isRemoteSource) {
      console.log("🔄 Setting loading=true for:", sourceKey);
      setIsLoading(true);
      setHasError(false);

      // Fallback: Hide shimmer after 5 seconds even if onLoadEnd doesn't fire
      const timeout = setTimeout(() => {
        console.log("⏱️ Timeout: Forcing shimmer hide for", sourceKey);
        setIsLoading(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [sourceKey, isRemoteSource]);

  // Debug: Log loading state changes
  React.useEffect(() => {
    console.log(`📊 [${sourceKey}] isLoading state:`, isLoading);
  }, [isLoading, sourceKey]);

  const finalWidth = size || width;
  const finalHeight = size || height;

  const finalTintColor =
    tintColor && tokens.color[tintColor as keyof typeof tokens.color]
      ? tokens.color[tintColor as keyof typeof tokens.color]
      : tintColor;

  let finalSource;
  let isSvgComponent = false;
  let isRemoteImage = false;

  if (name) {
    const iconSource = Icons[name];

    if (typeof iconSource === "function") {
      isSvgComponent = true;
      finalSource = iconSource;
    } else if (
      iconSource &&
      (typeof iconSource === "number" ||
        (typeof iconSource === "object" && iconSource.uri))
    ) {
      finalSource = iconSource;
    }
  } else if (source) {
    if (typeof source === "string") {
      // Only create URI object if string is not empty
      finalSource = source.trim() ? { uri: source } : undefined;
      isRemoteImage = !!finalSource;
      console.log("🖼️ [AppImage] String source:", source, "finalSource:", finalSource);
    } else {
      finalSource = source?.uri ? source : undefined;
      isRemoteImage = !!finalSource;
      console.log("🖼️ [AppImage] Object source:", source, "finalSource:", finalSource);
    }
  }

  if (!finalSource) {
    console.log("❌ [AppImage] No finalSource, returning null");
    return null;
  }

  console.log("✅ [AppImage] Rendering - isRemoteImage:", isRemoteImage, "finalSource:", finalSource);

  // Render SVG component
  if (isSvgComponent) {
    const SvgComponent = finalSource as React.FC<SvgProps>;
    return (
      <SvgComponent
        width={finalWidth}
        height={finalHeight}
        style={style}
        fill={finalTintColor}
        color={finalTintColor}
      />
    );
  }

  // Render regular image with shimmer placeholder for remote images
  if (isRemoteImage) {
    console.log(`🎨 Rendering image - isLoading: ${isLoading}, sourceKey: ${sourceKey}`);

    return (
      <YStack
        width={finalWidth as any}
        height={finalHeight}
        position="relative"
      >
        {/* Shimmer Placeholder - Only visible while loading */}
        {isLoading ? (
          <ShimmerProvider key={`shimmer-${sourceKey}`} duration={1000}>
            <YStack
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              width={finalWidth as any}
              height={finalHeight}
              backgroundColor="$grey"
              overflow="hidden"
              zIndex={10}
            >
              <Shimmer easing={Easing.linear} speed={0.5} />
            </YStack>
          </ShimmerProvider>
        ) : null}

        {/* Actual Image */}
        <StyledImage
          key={sourceKey}
          source={finalSource}
          style={[
            {
              width: finalWidth,
              height: finalHeight,
              borderRadius: radius,
            },
            style,
          ]}
          tintColor={finalTintColor}
          resizeMode={resizeMode}
          onLoadStart={() => {
            console.log("🖼️ Loading:", sourceKey);
            setIsLoading(true);
            setHasError(false);
          }}
          onLoadEnd={() => {
            console.log("✅ Loaded:", sourceKey);
            setIsLoading(false);
          }}
          onError={() => {
            console.log("❌ Error:", sourceKey);
            setIsLoading(false);
            setHasError(true);
          }}
        />
      </YStack>
    );
  }

  // Render regular image without shimmer (for local/non-remote images)
  return (
    <StyledImage
      source={finalSource}
      style={[
        {
          width: finalWidth,
          height: finalHeight,
          borderRadius: radius,
        },
        style,
      ]}
      tintColor={finalTintColor}
      resizeMode={resizeMode}
    />
  );
};
