import type { AppConfig } from "@/tamagui/config";
import { useReactiveTokenColor } from "@/hooks/useReactiveTokenColor";
import { tokens } from "@/tamagui/token";
import React, { useCallback, useRef } from "react";
import {
  DimensionValue,
  GestureResponderEvent,
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
  disabled?: boolean;
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
  disabled,
  iconPosition,
  onPress,
  ...props
}: OpTouchProps) => {
  const getReactiveColor = useReactiveTokenColor();

  // Debounce to prevent double tap navigation (especially on Android)
  const isProcessing = useRef(false);
  const DEBOUNCE_DELAY = 600; // ms

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (isProcessing.current) {
        return; // Ignore if already processing
      }

      isProcessing.current = true;
      onPress?.(event);

      // Reset after delay
      setTimeout(() => {
        isProcessing.current = false;
      }, DEBOUNCE_DELAY);
    },
    [onPress]
  );
  // Original static resolver, untouched — same exact expression as before
  // this fix, still used directly for "space"/"radius" (those never change
  // at runtime, so there's nothing to make reactive) and reused below via
  // ReturnType<> to give the "space"/"radius" overload branch the identical
  // type it always had, rather than hand-deriving an equivalent type
  // expression that risks silently widening past what DimensionValue/
  // ColorValue accept.
  function getStaticTokenValue(
    token: string | undefined,
    tokenType: "space" | "color" | "radius"
  ) {
    if (!token) return undefined;
    return tokens[tokenType][token as keyof (typeof tokens)[typeof tokenType]];
  }

  // Reactive for "color" (see hooks/useReactiveTokenColor.ts) so
  // backgroundColor/borderColor/shadowColor pick up a merchant's runtime
  // primary/secondary color with no rebuild — this was the root cause of
  // OpTouch's share of the runtime-branding reactivity gap (docs/STATUS.md),
  // including the 3 buttons that pass backgroundColor="primary" directly and
  // the 35 of ~38 PrimaryButton instances that inherit it via PrimaryButton's
  // own "primary" default. "space"/"radius" tokens never change at runtime,
  // so they still go through getStaticTokenValue above, unchanged.
  //
  // Overloaded (rather than one broad union return type) so each call site
  // below keeps the exact return type it had before this fix, instead of
  // every call site widening to the union of all three tokenTypes' possible
  // value shapes, which ViewStyle's DimensionValue/ColorValue fields don't
  // accept.
  function getTokenValue(
    token: string | undefined,
    tokenType: "color"
  ): string | undefined;
  function getTokenValue(
    token: string | undefined,
    tokenType: "space" | "radius"
  ): ReturnType<typeof getStaticTokenValue>;
  function getTokenValue(
    token: string | undefined,
    tokenType: "space" | "color" | "radius"
  ) {
    if (!token) return undefined;
    if (tokenType === "color") {
      return getReactiveColor(token);
    }
    return getStaticTokenValue(token, tokenType);
  }

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
      // activeOpacity={Platform.OS === "android" ? 1 : 0.7}
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
