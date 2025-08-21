import {
  HeadingSMBold,
  LabelMD,
  ParagraphMD,
  TextLGBold,
  TextMDBold,
  TextSMMedium,
  TextSMRegular,
  TextSMSemiBold,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Divider } from "@/components/atoms/Divider";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { SecondaryButton } from "@/components/molecules/buttons/SecondaryButton";

import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

const PaymentMethod = () => {
  const { bottom: bottomSafeAreaInset } = useSafeAreaInsets();

  const otherPaymentMethods = [
    {
      id: "klarna",
      name: "Klarna Account",
      icon: "piggyBank", // Using a placeholder icon
    },
    {
      id: "google",
      name: "Google Cloud Account",
      icon: "googleIcon", // Using a placeholder icon
    },
    {
      id: "apple",
      name: "Apple Pay Account",
      icon: "apple", // Using a placeholder icon
    },
  ];

  return (
    <YStack
      backgroundColor="$background"
      paddingBottom={bottomSafeAreaInset}
      flex={1}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack>
          {/* Header */}
          <YStack padding={"$md"}>
            <HeadingSMBold>Payment Methods</HeadingSMBold>
            <Spacer size="$reg" />
            <ParagraphMD color="$secondary">
              Here you can change payment methods
            </ParagraphMD>
          </YStack>

          <Spacer size="$xl" />
          <YStack paddingHorizontal={"$md"}>
            <TextMDBold>Card & Debit Cards</TextMDBold>
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
                label="Add new Credit/Debit Card"
                icon={<AppImage name="addIcon" width={16} height={16} />}
                onPress={() => {}}
                iconPosition="left"
              />
              <Spacer size={"$2xl"} />
            </YStack>
            <XStack alignItems="center" marginBottom="$md" gap="$sm">
              <AppImage name="shieldCheck" width={20} height={20} />
              <TextMDBold>Other Methods</TextMDBold>
            </XStack>
            <YStack
              backgroundColor={"$white"}
              borderRadius={"$2xl"}
              padding="$reg"
            >
              {otherPaymentMethods.map((method) => (
                <YStack key={method.id} borderRadius="$xl">
                  <OpTouch>
                    <XStack alignItems="center">
                      <YStack
                        borderRadius="$md"
                        width={46}
                        height={32}
                        borderWidth={0.5}
                        borderColor={"$icon"}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <AppImage
                          name={method.icon as any}
                          width={16}
                          height={16}
                        />
                      </YStack>
                      <Spacer size={"$reg"} />
                      <TextSMMedium>{method.name}</TextSMMedium>
                    </XStack>
                  </OpTouch>
                  <Spacer size={"$md"} />
                </YStack>
              ))}
              <YStack>
                <Spacer size={"$md"} />
                <Divider />
                <Spacer size={"$md"} />
                <OpTouch>
                  <XStack alignItems="center" justifyContent="center">
                    <AppImage name="addIcon" width={15} height={15} />
                    <Spacer size={"$sm"} />
                    <TextSMSemiBold color="$primary">
                      Link Other Method
                    </TextSMSemiBold>
                  </XStack>
                </OpTouch>
              </YStack>
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
};

export default PaymentMethod;
