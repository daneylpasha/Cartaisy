import { AppImage } from "@/components/atoms/AppImage";
import { Spacer } from "@/components/atoms/Spacer";
import { ParagraphSM } from "@/components/atoms/texts/ParagraphSM";
import { TextMDBold } from "@/components/atoms/texts/TextMDBold";
import { SecondaryButton } from "@/components/molecules/buttons";
import { t } from "@/translations";
import React from "react";
import { XStack, YStack } from "tamagui";

export const FreeShipping = () => {
  return (
    <YStack paddingHorizontal="$md">
      <XStack
        padding="$reg"
        backgroundColor={"$white"}
        borderRadius={16}
        justifyContent="center"
      >
        <AppImage name="truck" width={37} height={26} />
        <Spacer size={"$md"} />
        <YStack width={263}>
          <TextMDBold color="$darkgrey">
            {t("home.freeShippingCard.title")}
          </TextMDBold>
          <Spacer size={"$sm"} />
          <ParagraphSM color="$secondary">
            {t("home.freeShippingCard.subtitle")}
          </ParagraphSM>
          <Spacer size={"$reg"} />
          <SecondaryButton
            paddingVertical={"xs-sm"}
            paddingHorizontal={"reg"}
            width={180}
            borderColor="$lightgrey"
            color="$secondary"
            onPress={() => {}}
            label={t("home.freeShippingCard.buttonText")}
          />
        </YStack>
      </XStack>
    </YStack>
  );
};
