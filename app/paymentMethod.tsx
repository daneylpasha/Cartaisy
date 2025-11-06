import {
  useListPaymentMethods,
  useRemovePaymentMethod,
  useSetDefaultPaymentMethod,
} from "@/api/generated/payment-methods/payment-methods";
import {
  HeadingSMBold,
  LabelMD,
  ParagraphMD,
  TextLGBold,
  TextMDBold,
  TextSMSemiBold,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { SecondaryButton } from "@/components/molecules/buttons/SecondaryButton";
import { t } from "@/translations";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, XStack, YStack } from "tamagui";

const PaymentMethod = () => {
  const { bottom: bottomSafeAreaInset } = useSafeAreaInsets();

  // Fetch saved payment methods
  const {
    data: paymentMethodsResponse,
    isLoading,
    refetch,
  } = useListPaymentMethods();

  // Refetch payment methods when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log("[PaymentMethod] Screen focused, refetching cards...");
      refetch();
    }, [refetch])
  );

  // Remove payment method mutation
  const { mutate: removePaymentMethod } = useRemovePaymentMethod({
    mutation: {
      onSuccess: () => {
        console.log("[PaymentMethod] Card deleted successfully");
        refetch();
      },
      onError: (error: any) => {
        console.error("[PaymentMethod] Failed to delete card:", error);
        Alert.alert("Error", "Failed to delete card. Please try again.");
      },
    },
  });

  // Set default payment method mutation
  const { mutate: setDefaultPaymentMethod } = useSetDefaultPaymentMethod({
    mutation: {
      onSuccess: () => {
        console.log("[PaymentMethod] Default card updated");
        refetch();
      },
      onError: (error: any) => {
        console.error("[PaymentMethod] Failed to set default card:", error);
        Alert.alert("Error", "Failed to set default card. Please try again.");
      },
    },
  });

  const paymentMethods = paymentMethodsResponse?.data?.paymentMethods || [];
  const defaultCard = paymentMethods.find((pm) => pm.isDefault);

  const handleDeleteCard = (cardId: string) => {
    Alert.alert("Delete Card", "Are you sure you want to delete this card?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => removePaymentMethod({ paymentMethodId: cardId }),
      },
    ]);
  };

  const handleSetDefault = (cardId: string) => {
    setDefaultPaymentMethod({
      data: { paymentMethodId: cardId },
    });
  };

  return (
    <YStack backgroundColor="$background" flex={1}>
      <YStack flex={1}>
        {/* Header */}
        <YStack padding={"$md"}>
          <HeadingSMBold>{t("paymentMethod.title")}</HeadingSMBold>
          <Spacer size="$reg" />
          <ParagraphMD color="$secondary">
            {t("paymentMethod.subtitle")}
          </ParagraphMD>
        </YStack>

        <Spacer size="$xl" />
        <YStack paddingHorizontal={"$md"} flex={1}>
          <TextMDBold>{t("paymentMethod.cardtitle")}</TextMDBold>
          <Spacer size="$reg" />

          {isLoading ? (
            <YStack flex={1} justifyContent="center" alignItems="center">
              <ActivityIndicator
                size="large"
                color={getTokenValue("$primary")}
              />
            </YStack>
          ) : paymentMethods.length === 0 ? (
            <YStack>
              {/* Show decorative card even when empty */}
              <YStack position="relative" borderRadius="$xl" height={200}>
                <AppImage name="creditCard" height={200} resizeMode="contain" />
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
                      YOUR NAME
                    </LabelMD>
                    <LabelMD color={"$secondary"} marginBottom={2}>
                      MM/YY
                    </LabelMD>
                  </XStack>
                  <XStack justifyContent="space-between" alignItems="center">
                    <TextLGBold>•••• •••• •••• ••••</TextLGBold>
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
              <Spacer size="$lg" />
              {/* Empty state message */}
              <YStack alignItems="center" padding="$md">
                <TextMDBold>No Cards Added</TextMDBold>
                <Spacer size="$sm" />
                <ParagraphMD color="$secondary" textAlign="center">
                  Add your first card to start making purchases
                </ParagraphMD>
              </YStack>
            </YStack>
          ) : (
            <YStack>
              {/* Default Card Display */}
              {defaultCard && (
                <YStack>
                  <YStack position="relative" borderRadius="$xl" height={200}>
                    <AppImage
                      name="creditCard"
                      height={200}
                      resizeMode="contain"
                    />
                    <YStack position="absolute" top={30} right={40}>
                      <AppImage name="waveIcon" width={24} height={24} />
                    </YStack>
                    <YStack
                      position="absolute"
                      width={"80%"}
                      bottom={20}
                      left={40}
                    >
                      <XStack
                        justifyContent="space-between"
                        width={"70%"}
                        alignItems="center"
                      >
                        <LabelMD color={"$secondary"} marginBottom={2}>
                          {defaultCard.card?.brand?.toUpperCase() || "CARD"}
                        </LabelMD>
                        <LabelMD color={"$secondary"} marginBottom={2}>
                          {defaultCard.card?.exp_month
                            ?.toString()
                            .padStart(2, "0")}
                          /{defaultCard.card?.exp_year?.toString().slice(-2)}
                        </LabelMD>
                      </XStack>
                      <XStack
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <TextLGBold>
                          •••• •••• •••• {defaultCard.card?.last4}
                        </TextLGBold>
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
                </YStack>
              )}

              {/* All Cards List */}
              {paymentMethods.map((card) => (
                <YStack
                  key={card.id}
                  backgroundColor={card.isDefault ? "$primarylight" : "$white"}
                  borderWidth={card.isDefault ? 1 : 0}
                  borderColor={card.isDefault ? "$primary" : "$white"}
                  padding="$md"
                  borderRadius="$2xl"
                  marginBottom="$sm"
                >
                  <XStack justifyContent="space-between" alignItems="center">
                    <YStack flex={1}>
                      <XStack gap="$xs" alignItems="center">
                        <TextMDBold>
                          {card.card?.brand?.toUpperCase()} ••••{" "}
                          {card.card?.last4}
                        </TextMDBold>
                      </XStack>
                      <Spacer size="$xs" />
                      <ParagraphMD color="$secondary">
                        Expires{" "}
                        {card.card?.exp_month?.toString().padStart(2, "0")}/
                        {card.card?.exp_year}
                      </ParagraphMD>
                    </YStack>

                    <XStack gap="$sm">
                      {!card.isDefault && (
                        <OpTouch onPress={() => handleSetDefault(card.id)}>
                          <YStack
                            backgroundColor="$primarylight"
                            paddingHorizontal="$sm"
                            paddingVertical="$xs"
                            borderRadius="$md"
                          >
                            <TextSMSemiBold color="$primary">
                              Set Default
                            </TextSMSemiBold>
                          </YStack>
                        </OpTouch>
                      )}
                      {card.isDefault && (
                        <YStack
                          backgroundColor="$green"
                          paddingHorizontal="$xs"
                          alignItems="center"
                          justifyContent="center"
                          borderRadius="$md"
                        >
                          <TextSMSemiBold
                            textAlign="center"
                            fontSize={10}
                            color="$white"
                          >
                            DEFAULT
                          </TextSMSemiBold>
                        </YStack>
                      )}
                      <OpTouch onPress={() => handleDeleteCard(card.id)}>
                        <YStack
                          backgroundColor="$red"
                          paddingHorizontal="$sm"
                          paddingVertical="$xs"
                          borderRadius="$md"
                        >
                          <TextSMSemiBold color="$white">Delete</TextSMSemiBold>
                        </YStack>
                      </OpTouch>
                    </XStack>
                  </XStack>
                </YStack>
              ))}
            </YStack>
          )}

          <Spacer size={"$lg"} />
          {/* Add New Card Button */}
          <SecondaryButton
            label={t("paymentMethod.btn")}
            icon={
              <AppImage
                tintColor={getTokenValue("$primary")}
                name="addIcon"
                width={16}
                height={16}
              />
            }
            onPress={() => {
              router.push("/addNewCardDetails");
            }}
            iconPosition="left"
          />
          <Spacer size={"$2xl"} />
        </YStack>
      </YStack>
    </YStack>
  );
};

export default PaymentMethod;
