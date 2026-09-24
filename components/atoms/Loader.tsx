import { useReactiveTokenColor } from "@/hooks/useReactiveTokenColor";
import React from "react";
import { ActivityIndicatorProps } from "react-native";
import { LoaderKitView } from "react-native-loader-kit";

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
  const getReactiveColor = useReactiveTokenColor();
  // Hex and rgb values are already concrete. Token names (including
  // "$primary") resolve through the live theme so a merchant color
  // reaches every spinner without a rebuild.
  const resolvedColor =
    color.startsWith("#") || color.startsWith("rgb")
      ? color
      : getReactiveColor(color) ?? color;

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
