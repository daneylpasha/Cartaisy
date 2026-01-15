import type { AppConfig } from "@/tamagui/config";
import { tokens } from "@/tamagui/token";
import React, { useRef, useCallback } from "react";
import {
  Animated,
  DimensionValue,
  GestureResponderEvent,
  Platform,
  Pressable,
  StyleProp,
  ViewStyle,
} from "react-native";
import { YStack } from "tamagui";

type PressableButtonProps = {
  onPress?: (event: GestureResponderEvent) => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  // Styling props
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
};

export const PressableButton = ({
  onPress,
  children,
  style,
  disabled = false,
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
  borderColor,
  borderWidth,
  width,
  height,
  shadowColor,
  shadowOffset,
  shadowOpacity,
  shadowRadius,
  flex,
}: PressableButtonProps) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Debounce to prevent double tap navigation
  const isProcessing = useRef(false);
  const DEBOUNCE_DELAY = 600; // ms

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

  const handlePressIn = () => {
    if (Platform.OS === "android") {
      Animated.timing(scaleValue, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (Platform.OS === "android") {
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (isProcessing.current) {
        return; // Ignore if already processing
      }

      isProcessing.current = true;
      handlePressOut();
      onPress?.(event);

      // Reset after delay
      setTimeout(() => {
        isProcessing.current = false;
      }, DEBOUNCE_DELAY);
    },
    [onPress]
  );

  // Android version - scale animation only
  if (Platform.OS === "android") {
    return (
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={{ color: "transparent" }}
        disabled={disabled}
      >
        <Animated.View
          style={[
            customStyle,
            {
              transform: [{ scale: scaleValue }],
            },
            style,
          ]}
        >
          {children}
        </Animated.View>
      </Pressable>
    );
  }

  // iOS version - just render children with styles, no Pressable
  return (
    <YStack style={[customStyle, style]} {...{ onPress: handlePress }}>
      {children}
    </YStack>
  );
};
