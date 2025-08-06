import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { Spacer } from "@/components/atoms/Spacer";
import { HeadingXSBold } from "@/components/atoms/texts/HeadingXSBold";
import { ParagraphMD } from "@/components/atoms/texts/ParagraphMD";
import { TextSMRegular } from "@/components/atoms/texts/TextSMRegular";
import { PrimaryButton } from "@/components/molecules/buttons/PrimaryButton";
import { t } from "@/translations";
import { router } from "expo-router";
import React from "react";
import { XStack, YStack } from "tamagui";

const PasswordRestSent = () => {
  return (
    <ScreenContainer backgroundColor={"background"}>
      <Spacer size={"$6xl"} />
      <AppImage name="emailSent" height={250} />
      <Spacer size={"$xl"} />
      <YStack paddingHorizontal={"$md"} alignItems="center">
        <HeadingXSBold>{t("auth.passwordResetSent.title")}</HeadingXSBold>
        <Spacer size={"$sm"} />
        <ParagraphMD color={"$secondary"} textAlign="center">
          {t("auth.passwordResetSent.subtitle")}
        </ParagraphMD>
        <Spacer size={"$lg"} />
        <PrimaryButton
          isLoading={false}
          label={t("auth.passwordResetSent.openEmailApp")}
          onPress={() => router.push("/notification")}
        />
        <Spacer size={"$xl"} />
        <YStack alignItems="center">
          <TextSMRegular color={"$secondary"}>
            {t("auth.passwordResetSent.dontRememberEmail")}
          </TextSMRegular>
          <XStack alignItems="center" gap={"$xs"}>
            <TextSMRegular color={"$secondary"}>
              {t("auth.passwordResetSent.contactSupport")}
            </TextSMRegular>
            <OpTouch>
              <TextSMRegular
                borderBottomWidth={1}
                fontWeight={"700"}
                color={"$primary"}
              >
                {t("auth.passwordResetSent.supportEmail")}
              </TextSMRegular>
            </OpTouch>
          </XStack>
        </YStack>
      </YStack>
    </ScreenContainer>
  );
};

export default PasswordRestSent;
