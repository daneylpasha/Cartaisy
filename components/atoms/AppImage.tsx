import Icons from "@/assets/Icons";
import type { AppConfig } from "@/tamagui/config";
import { tokens } from "@/tamagui/token";
import React from "react";
import { Image, ImageResizeMode } from "react-native";
import type { SvgProps } from "react-native-svg";
import { styled } from "tamagui";

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
  const finalWidth = size || width;
  const finalHeight = size || height;

  const finalTintColor =
    tintColor && tokens.color[tintColor as keyof typeof tokens.color]
      ? tokens.color[tintColor as keyof typeof tokens.color]
      : tintColor;

  let finalSource;
  let isSvgComponent = false;

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
    } else {
      finalSource = source?.uri ? source : undefined;
    }
  }

  if (!finalSource) {
    return null;
  }

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

  // Render regular image
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
