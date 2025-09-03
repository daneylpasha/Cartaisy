import {
  HeadingSMBold,
  LabelMD,
  ParagraphMD,
  ParagraphXS,
  TextMDSemiBold,
  TextSMRegular,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { Spacer } from "@/components/atoms/Spacer";
import { PrimaryButton } from "@/components/molecules/buttons";
import { t } from "@/translations";
import { router } from "expo-router";
import React, { useState } from "react";
import { getTokenValue, XStack, YStack } from "tamagui";
const Notification = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  return (
    <ScreenContainer>
      <YStack paddingHorizontal={"$md"}>
        <Spacer size={"$6xl"} />
        <HeadingSMBold textAlign="center">
          {t("notification.title")}
        </HeadingSMBold>
        <Spacer size={"$reg"} />
        <ParagraphMD textAlign="center">
          {t("notification.subtitle")}
        </ParagraphMD>
        <Spacer size={"$2xl"} />
        <YStack alignItems="center" position="relative">
          <AppImage name="notificationFrame" width={350} height={250} />
          <YStack
            width={289}
            height={94}
            position="absolute"
            top={130}
            left={27}
            right={0}
            bottom={0}
            marginHorizontal="auto"
            backgroundColor="$white"
            borderRadius={"$2xl"}
            padding={"$md"}
          >
            <XStack alignItems="center" justifyContent="space-between">
              <XStack>
                <AppImage name="bag" width={17} height={19} />
                <Spacer size={"$xxs"} />
                <LabelMD letterSpacing={0}>{t("common.companyName")}</LabelMD>
              </XStack>
              <TextSMRegular color={"$secondary"}>{"3s ago"}</TextSMRegular>
            </XStack>
            <ParagraphXS color={"$secondary"}>
              {t("notification.notificationExample")}
            </ParagraphXS>
          </YStack>
        </YStack>
        <Spacer size={"$xs-sm"} />
        <XStack alignItems="center" justifyContent="center">
          <AppImage
            name="errorIcon"
            tintColor={getTokenValue("$secondary")}
            width={16}
            height={16}
          />
          <Spacer size={"$xxs"} />
          <TextSMRegular color={"$secondary"}>
            {t("notification.changeSettings")}
          </TextSMRegular>
        </XStack>
        <Spacer size={"$2xl"} />
        <PrimaryButton
          label={t("common.notification")}
          onPress={() => router.push("/(tabs)")}
          icon={<AppImage name="check" size={20} />}
          isLoading={isEnabled}
        />
        <Spacer size={"$lg"} />
        <OpTouch onPress={() => router.push("/(tabs)")}>
          <TextMDSemiBold textAlign="center" color={"$primary"}>
            {t("common.nopeMaybeLater")}
          </TextMDSemiBold>
        </OpTouch>
      </YStack>
    </ScreenContainer>
  );
};

export default Notification;
