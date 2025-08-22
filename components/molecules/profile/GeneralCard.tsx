import Icons from "@/assets/Icons";
import { TextSMSemiBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { ParagraphSM } from "@/components/atoms/texts/ParagraphSM";
import { SHADOW_STYLES } from "@/constants/styles";
import React from "react";
import { getTokenValue, XStack, YStack } from "tamagui";
type GeneralCardProps = {
  id: number;
  image: keyof typeof Icons;
  title: string;
  subtitle?: string;
  onPress: () => void;
};

export const GeneralCard = ({
  id,
  image,
  title,
  subtitle,
  onPress,
}: GeneralCardProps) => {
  console.log(onPress, "Hello");
  return (
    <OpTouch onPress={onPress}>
      <XStack
        paddingVertical={"$reg"}
        paddingHorizontal={"$md"}
        backgroundColor="$white"
        borderRadius={"$2xl"}
        height={subtitle ? 80 : 56}
        style={{ ...SHADOW_STYLES }}
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
    </OpTouch>
  );
};
