import Icons from "@/assets/Icons";
import type { AppConfig } from "@/tamagui/config";
import { tokens } from "@/tamagui/token";
import React from "react";
import { Image, ImageResizeMode } from "react-native";
import { styled } from "tamagui";

type AppImageProps = {
  name?: keyof typeof Icons;
  source?: string;
  size?: number;
  width?: number | string;
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

  const finalSource = name ? Icons[name] : source ? { uri: source } : undefined;

  return (
    <StyledImage
      source={finalSource}
      style={[
        {
          width: finalWidth,
          height: finalHeight,
        },
        style,
      ]}
      tintColor={finalTintColor}
      resizeMode={resizeMode}
    />
  );
};
