import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { Platform, StatusBar } from "react-native";

type DynamicStatusBarProps = {
  backgroundColor?: string;
};

/**
 * Determines if a color is light or dark based on luminance
 * Returns true if the color is light (should use dark status bar icons)
 */
const isLightColor = (color: string): boolean => {
  // Default to light if no color provided
  if (!color) return true;

  // Remove # if present
  const hex = color.replace("#", "");

  // Handle short hex (#FFF)
  const fullHex =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;

  // Parse RGB values
  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  // Calculate luminance (perceived brightness)
  // Using the formula: 0.299*R + 0.587*G + 0.114*B
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // If luminance > 0.5, it's a light color
  return luminance > 0.5;
};

/**
 * Sets the status bar style imperatively
 */
const setStatusBarStyle = (barStyle: "dark-content" | "light-content", backgroundColor: string) => {
  if (Platform.OS === "android") {
    // Use setTimeout to ensure this runs after any other status bar changes
    setTimeout(() => {
      StatusBar.setBarStyle(barStyle, true);
      StatusBar.setBackgroundColor(backgroundColor, true);
      StatusBar.setTranslucent(true);
    }, 50);
  } else {
    StatusBar.setBarStyle(barStyle, true);
  }
};

/**
 * DynamicStatusBar - Automatically sets status bar style based on background color
 *
 * Usage:
 * - White/light background: <DynamicStatusBar backgroundColor="#FFFFFF" /> → dark icons
 * - Dark/colored background: <DynamicStatusBar backgroundColor="#8B5CF6" /> → light icons
 */
export const DynamicStatusBar: React.FC<DynamicStatusBarProps> = ({
  backgroundColor = "#FFFFFF",
}) => {
  const isLight = isLightColor(backgroundColor);
  const barStyle = isLight ? "dark-content" : "light-content";

  // Set on mount
  useEffect(() => {
    setStatusBarStyle(barStyle, backgroundColor);
  }, [barStyle, backgroundColor]);

  // Set status bar on focus (for navigation)
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(barStyle, backgroundColor);
    }, [barStyle, backgroundColor])
  );

  // Also render StatusBar component for immediate effect on iOS
  if (Platform.OS === "ios") {
    return (
      <StatusBar barStyle={barStyle} />
    );
  }

  return null;
};

export default DynamicStatusBar;
