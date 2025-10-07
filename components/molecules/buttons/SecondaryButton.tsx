import { tokens } from "@/tamagui/token";
import React from "react";
import { ActivityIndicator, DimensionValue } from "react-native";
import { OpTouch, OpTouchProps } from "../../atoms/OpTouch";
import { TextMDSemiBold } from "../../atoms/texts";
import { XStack } from "tamagui";

type ColorToken = keyof typeof tokens.color;
type ColorTokenWithPrefix = ColorToken | `$${ColorToken}`;

type SecondaryButtonProps = Omit<OpTouchProps, "onPress" | "borderColor"> & {
  onPress: () => void;
  isLoading?: boolean;
  label: string;
  width?: DimensionValue;
  borderColor?: ColorTokenWithPrefix;
  color?: ColorTokenWithPrefix;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
};

export const SecondaryButton = ({
  onPress,
  isLoading = false,
  label,
  width = "100%",
  borderColor = "$primary",
  color = "$primary",
  icon,
  iconPosition = "right",
  ...containerStyle
}: SecondaryButtonProps) => {
  const getTokenValue = (token: ColorTokenWithPrefix | undefined) => {
    if (!token) return undefined;
    const cleanToken = token.startsWith("$") ? token.slice(1) : token;
    return tokens.color[cleanToken as keyof typeof tokens.color];
  };

  return (
    <OpTouch
      justifyContent="center"
      alignItems="center"
      backgroundColor={"white"}
      borderWidth={1}
      borderRadius={"full"}
      paddingHorizontal={"md"}
      paddingVertical={"reg"}
      disabled={isLoading}
      onPress={onPress}
      width={width}
      style={{
        borderColor: getTokenValue(borderColor),
      }}
      {...containerStyle}
    >
      <XStack alignItems="center" justifyContent="center" gap="$sm-reg">
        {iconPosition === "left" ? icon : null}
        <TextMDSemiBold color={color}>
          {isLoading ? (
            <ActivityIndicator size={"small"} color={color} />
          ) : (
            label
          )}
        </TextMDSemiBold>
        {iconPosition === "right" ? icon : null}
      </XStack>
    </OpTouch>
  );
};
