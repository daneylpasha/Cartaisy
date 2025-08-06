import React from "react";
import { ActivityIndicator, DimensionValue } from "react-native";
import { XStack } from "tamagui";
import { OpTouch } from "../../atoms/OpTouch";
import { TextMDSemiBold } from "../../atoms/texts";

type PrimaryButtonProps = {
  onPress: () => void;
  isLoading: boolean;
  label: string;
  width?: DimensionValue;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
};

export const PrimaryButton = ({
  onPress,
  isLoading,
  label,
  width = "100%",
  icon,
  iconPosition = "right",
}: PrimaryButtonProps) => {
  return (
    <OpTouch
      justifyContent="center"
      alignItems="center"
      backgroundColor={"primary"}
      borderRadius={"full"}
      paddingVertical={"reg"}
      onPress={onPress}
      disabled={isLoading}
      width={width}
    >
      <XStack alignItems="center" justifyContent="center" gap="$sm-reg">
        {iconPosition === "left" && icon}
        <TextMDSemiBold color={"$white"}>
          {isLoading ? (
            <ActivityIndicator size={"small"} color={"white"} />
          ) : (
            label
          )}
        </TextMDSemiBold>
        {iconPosition === "right" && icon}
      </XStack>
    </OpTouch>
  );
};
