import type { AppConfig } from "@/tamagui/config";
import { tokens } from "@/tamagui/token";
import React, { useRef, useCallback } from "react";
import {
  DimensionValue,
  GestureResponderEvent,
  Platform,
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";

type OpTouchProps = TouchableOpacityProps & {
  style?: StyleProp<ViewStyle>;
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  padding?: keyof AppConfig["tokens"]["space"];
  paddingHorizontal?: keyof AppConfig["tokens"]["space"];
  paddingVertical?: keyof AppConfig["tokens"]["space"];
  margin?: keyof AppConfig["tokens"]["space"];
  marginHorizontal?: keyof AppConfig["tokens"]["space"];
  marginVertical?: keyof AppConfig["tokens"]["space"];
  backgroundColor?: keyof AppConfig["tokens"]["color"];
  borderRadius?: keyof AppConfig["tokens"]["radius"];
  borderColor?: keyof AppConfig["tokens"]["color"];
  borderWidth?: number;
  width?: DimensionValue;
  height?: DimensionValue;
  shadowColor?: keyof AppConfig["tokens"]["color"];
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  flex?: number;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
};

const OpTouch = ({
  children,
  shadowColor,
  shadowOffset,
  shadowOpacity,
  shadowRadius,
  style,
  borderColor,
  borderWidth,
  justifyContent,
  alignItems,
  flexDirection,
  padding,
  paddingHorizontal,
  paddingVertical,
  margin,
  marginHorizontal,
  marginVertical,
  backgroundColor,
  borderRadius,
  width,
  height,
  flex,
  icon,
  iconPosition,
  onPress,
  ...props
}: OpTouchProps) => {
  // Debounce to prevent double tap navigation
  const lastPressTime = useRef(0);
  const DEBOUNCE_DELAY = 400; // ms

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      const now = Date.now();
      if (now - lastPressTime.current < DEBOUNCE_DELAY) {
        return; // Ignore rapid taps
      }
      lastPressTime.current = now;
      onPress?.(event);
    },
    [onPress]
  );
  const getTokenValue = (
    token: string | undefined,
    tokenType: "space" | "color" | "radius"
  ) => {
    if (!token) return undefined;
    return tokens[tokenType][token as keyof (typeof tokens)[typeof tokenType]];
  };

  const customStyle: ViewStyle = {
    justifyContent,
    alignItems,
    flexDirection,
    padding: getTokenValue(padding, "space"),
    paddingHorizontal: getTokenValue(paddingHorizontal, "space"),
    paddingVertical: getTokenValue(paddingVertical, "space"),
    margin: getTokenValue(margin, "space"),
    marginHorizontal: getTokenValue(marginHorizontal, "space"),
    marginVertical: getTokenValue(marginVertical, "space"),
    backgroundColor: getTokenValue(backgroundColor, "color"),
    borderRadius: getTokenValue(borderRadius, "radius"),
    width,
    height,
    flex,
    borderColor: getTokenValue(borderColor, "color"),
    borderWidth,
    shadowColor: getTokenValue(shadowColor, "color"),
    shadowOffset,
    shadowOpacity,
    shadowRadius,
  };

  return (
    <TouchableOpacity
      activeOpacity={Platform.OS === "android" ? 1 : 0.7}
      {...props}
      onPress={handlePress}
      style={[customStyle, style]}
    >
      {icon && iconPosition === "left" ? icon : null}
      {children}
      {icon && iconPosition === "right" ? icon : null}
    </TouchableOpacity>
  );
};

export { OpTouch };
export type { OpTouchProps };
