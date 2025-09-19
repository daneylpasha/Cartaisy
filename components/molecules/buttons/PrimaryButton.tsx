import { tokens } from "@/tamagui/token";
import React from "react";
import { ActivityIndicator, DimensionValue } from "react-native";
import { XStack } from "tamagui";
import { OpTouch } from "../../atoms/OpTouch";
import { TextMDSemiBold } from "../../atoms/texts";

type PrimaryButtonProps = {
  onPress: () => void;

  isLoading?: boolean;
  label: string;
  width?: DimensionValue;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  paddingVertical?: keyof typeof tokens.space;
  background?: keyof typeof tokens.color;
};

export const PrimaryButton = ({
  onPress,
  isLoading,
  label,
  background = "primary",
  width = "100%",
  icon,
  iconPosition = "right",
  paddingVertical = "reg",
}: PrimaryButtonProps) => {
  return (
    <OpTouch
      justifyContent="center"
      alignItems="center"
      backgroundColor={background}
      borderRadius={"full"}
      paddingVertical={paddingVertical}
      onPress={onPress}
      disabled={isLoading}
      width={width}
    >
      <XStack alignItems="center" justifyContent="center" gap="$sm-reg">
        {isLoading ? (
          <ActivityIndicator size={"small"} color={"white"} />
        ) : (
          <>
            {iconPosition === "left" && icon}
            <TextMDSemiBold color={"$white"}>{label}</TextMDSemiBold>
            {iconPosition === "right" && icon}
          </>
        )}
      </XStack>
    </OpTouch>
  );
};
