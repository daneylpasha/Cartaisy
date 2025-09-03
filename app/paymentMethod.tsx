import {
  HeadingSMBold,
  LabelMD,
  ParagraphMD,
  TextLGBold,
  TextMDBold,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Spacer } from "@/components/atoms/Spacer";
import { SecondaryButton } from "@/components/molecules/buttons/SecondaryButton";
import { t } from "@/translations";
import { router } from "expo-router";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

const PaymentMethod = () => {
  const { bottom: bottomSafeAreaInset } = useSafeAreaInsets();

  return (
    <YStack
      backgroundColor="$background"
      // paddingBottom={bottomSafeAreaInset}
      flex={1}
    >
      <YStack>
        {/* Header */}
        <YStack padding={"$md"}>
          <HeadingSMBold>{t("paymentMethod.title")}</HeadingSMBold>
          <Spacer size="$reg" />
          <ParagraphMD color="$secondary">
            {t("paymentMethod.subtitle")}
          </ParagraphMD>
        </YStack>

        <Spacer size="$xl" />
        <YStack paddingHorizontal={"$md"}>
          <TextMDBold>{t("paymentMethod.cardtitle")}</TextMDBold>
          <Spacer size="$reg" />

          <YStack>
            <YStack position="relative" borderRadius="$xl" height={200}>
              <AppImage name="creditCard" height={200} resizeMode="contain" />

              {/* Contactless Payment Icon */}
              <YStack position="absolute" top={30} right={40}>
                <AppImage name="waveIcon" width={24} height={24} />
              </YStack>
              <YStack position="absolute" width={"80%"} bottom={20} left={40}>
                <XStack
                  justifyContent="space-between"
                  width={"70%"}
                  alignItems="center"
                >
                  <LabelMD color={"$secondary"} marginBottom={2}>
                    JANE DOE
                  </LabelMD>
                  <LabelMD color={"$secondary"} marginBottom={2}>
                    08/11
                  </LabelMD>
                </XStack>
                <XStack justifyContent="space-between" alignItems="center">
                  <TextLGBold>0087 1157 0587 6187</TextLGBold>
                  <YStack
                    width={48}
                    height={33}
                    borderWidth={0.7}
                    backgroundColor={"$white"}
                    borderColor={"$icon"}
                    borderRadius={"$md"}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <AppImage name="paymentIcon" width={31} height={18} />
                  </YStack>
                </XStack>
              </YStack>
            </YStack>
            <Spacer size={"$lg"} />
            {/* Add New Card Button */}
            <SecondaryButton
              label={t("paymentMethod.btn")}
              icon={<AppImage name="addIcon" width={16} height={16} />}
              onPress={() => {
                router.push("/addNewCardDetails");
              }}
              iconPosition="left"
            />
            <Spacer size={"$2xl"} />
          </YStack>

          <Spacer size={"$lg"} />
        </YStack>
      </YStack>
    </YStack>
  );
};

export default PaymentMethod;
