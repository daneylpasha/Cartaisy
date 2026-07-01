import React from "react";
import { ActivityIndicatorProps } from "react-native";
import { LoaderKitView } from "react-native-loader-kit";
import { getTokenValue } from "tamagui";

export interface LoaderProps {
  size?: ActivityIndicatorProps["size"];
  color?: string;
  width?: number;
  height?: number;
}

/**
 * Reusable Loader component
 * Wraps React Native's ActivityIndicator for consistent styling across the app
 *
 * @param size - "small" or "large" (default: "small") - used if width/height not provided
 * @param color - Color token or hex value (default: "$primary")
 * @param width - Custom width (overrides size)
 * @param height - Custom height (overrides size)
 */
export const Loader = ({
  size = "small",
  color = "$primary",
  width,
  height,
}: LoaderProps) => {
  // If color starts with $, resolve it from tokens, otherwise use as-is
  const resolvedColor = color.startsWith("$") ? getTokenValue(color as any) : color;

  // Map size prop to dimensions (only used if width/height not provided)
  const defaultSize = 22;
  const loaderWidth = width ?? defaultSize;
  const loaderHeight = height ?? defaultSize;

  return (
    <LoaderKitView
      shouldRasterizeIOS
      style={{ width: loaderWidth, height: loaderHeight }}
      name={"BallClipRotate"}
      animationSpeedMultiplier={1.0}
      color={resolvedColor}
    />
  );
};
