import React from "react";
import { ActivityIndicator, ActivityIndicatorProps } from "react-native";
import { getTokenValue } from "tamagui";

export interface LoaderProps {
  size?: ActivityIndicatorProps["size"];
  color?: string;
}

/**
 * Reusable Loader component
 * Wraps React Native's ActivityIndicator for consistent styling across the app
 *
 * @param size - "small" or "large" (default: "small")
 * @param color - Color token or hex value (default: "$primary")
 */
export const Loader = ({ size = "small", color = "$primary" }: LoaderProps) => {
  // If color starts with $, resolve it from tokens, otherwise use as-is
  const resolvedColor = color.startsWith("$") ? getTokenValue(color) : color;

  return <ActivityIndicator size={size} color={resolvedColor} />;
};
