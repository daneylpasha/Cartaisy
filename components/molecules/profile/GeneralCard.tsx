import Icons from "@/assets/Icons";
import { TextSMSemiBold, PressableButton } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { ParagraphSM } from "@/components/atoms/texts/ParagraphSM";
import React from "react";
import { Platform } from "react-native";
import { getTokenValue, XStack, YStack } from "tamagui";

type GeneralCardProps = {
  id: number;
  image: keyof typeof Icons;
  title: string;
  subtitle?: string;
  onPress: () => void;
};

export const GeneralCard = ({
  image,
  title,
  subtitle,
  onPress,
}: GeneralCardProps) => {
  // Lighter shadow for cleaner look
  const lightShadow = Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
    },
    android: {
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
  });

  const cardContent = (
    <XStack
      paddingVertical={"$md"}
      paddingHorizontal={"$lg"}
      backgroundColor="$white"
      borderRadius={"$md"}
      height={subtitle ? 88 : 64}
      style={{ ...lightShadow }}
      alignItems="center"
      justifyContent="space-between"
    >
      <XStack alignItems="center">
        <YStack>
          <AppImage
            tintColor={getTokenValue(
              image == "trash" ? "$error" : "$primary"
            )}
            name={image}
            width={19}
            height={18}
          />
        </YStack>
        <Spacer size={"$reg"} />
        <YStack>
          <TextSMSemiBold>{title}</TextSMSemiBold>
          {/* <Spacer size={"$xs-sm"} /> */}
          {subtitle && (
            <ParagraphSM color="$secondary">{subtitle}</ParagraphSM>
          )}
        </YStack>
      </XStack>
      <AppImage
        name="caretRight"
        tintColor={getTokenValue("$secondary")}
        width={9}
        height={16}
      />
    </XStack>
  );

  // Android version with PressableButton
  if (Platform.OS === "android") {
    return (
      <PressableButton onPress={onPress}>
        {cardContent}
      </PressableButton>
    );
  }

  // iOS version with OpTouch
  return (
    <OpTouch onPress={onPress}>
      {cardContent}
    </OpTouch>
  );
};
