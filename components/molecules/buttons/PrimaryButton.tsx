import { tokens } from "@/tamagui/token";
import React from "react";
import { DimensionValue } from "react-native";
import { XStack } from "tamagui";
import { Loader } from "../../atoms/Loader";
import { OpTouch } from "../../atoms/OpTouch";
import { TextMDSemiBold } from "../../atoms/texts";

type PrimaryButtonProps = {
  onPress: () => void;

  isLoading?: boolean;
  disabled?: boolean;
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
  disabled = false,
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
      borderRadius={"md"}
      paddingVertical={paddingVertical}
      onPress={onPress}
      disabled={isLoading || disabled}
      opacity={isLoading || disabled ? 0.5 : 1}
      width={width}
    >
      <XStack alignItems="center" justifyContent="center" gap="$sm-reg">
        {isLoading ? (
          <Loader size="small" color="white" />
        ) : (
          <>
            {iconPosition === "left" ? icon : null}
            <TextMDSemiBold color={"$white"}>{label}</TextMDSemiBold>
            {iconPosition === "right" ? icon : null}
          </>
        )}
      </XStack>
    </OpTouch>
  );
};
