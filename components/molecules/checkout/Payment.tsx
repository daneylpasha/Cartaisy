import { useListPaymentMethods } from "@/api/generated/payment-methods/payment-methods";
import Icons from "@/assets/Icons";
import { TextSMMedium, TextSMSemiBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Divider } from "@/components/atoms/Divider";
import { Loader } from "@/components/atoms/Loader";
import { OpTouch } from "@/components/atoms/OpTouch";
import { t } from "@/translations";
import { router, useFocusEffect } from "expo-router";
import React, { useState } from "react";
import { FlatList } from "react-native";
import { getTokenValue, Spacer, XStack, YStack } from "tamagui";
import { SectionHeader } from "../SectionHeader";

type PaymentProps = {
  id: number;
  type?: string;
  cardNumber: number;
  amount: number;
  image?: keyof typeof Icons;
};

const PaymentStepper = () => {
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const {
    data: paymentMethodsResponse,
    isLoading,
    refetch,
  } = useListPaymentMethods();

  useFocusEffect(
    React.useCallback(() => {
      console.log("[PaymentStepper] Screen focused, refetching cards...");
      refetch();
    }, [refetch])
  );
  const paymentMethods = paymentMethodsResponse?.data?.paymentMethods || [];

  // Auto-select default payment method on mount
  React.useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPayment) {
      const defaultCard = paymentMethods.find((pm) => pm.isDefault);
      if (defaultCard) {
        setSelectedPayment(defaultCard.id);
      } else {
        setSelectedPayment(paymentMethods[0].id);
      }
    }
  }, [paymentMethods, selectedPayment]);

  // const paymentMethods = [
  //   {
  //     id: 1,
  //     type: "VISA",

  //     cardNumber: 8812,
  //     amount: 380.17,
  //   },
  //   {
  //     id: 2,
  //     type: "Pay",
  //     image: "googleIcon" as const,
  //     cardNumber: 1558,
  //     amount: 220.55,
  //   },
  //   {
  //     id: 3,
  //     type: "Pay",
  //     image: "apple" as const,
  //     cardNumber: 1418,
  //     amount: 88.52,
  //   },
  // ];
  const getCardIcon = (brand: string) => {
    const brandLower = brand?.toLowerCase();
    switch (brandLower) {
      case "visa":
        return "visa";
      case "mastercard":
        return "paymentIcon";
      case "amex":
      case "american express":
      case "discover":
      default:
        return "paymentcard"; // Generic fallback for all other cards
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const cardBrand = item.card?.brand || "card";
    const last4 = item.card?.last4 || "••••";
    const cardIcon = getCardIcon(cardBrand);

    return (
      <OpTouch key={item.id} onPress={() => setSelectedPayment(item.id)}>
        <XStack
          alignItems="center"
          justifyContent="space-between"
          paddingVertical={"$xxs"}
        >
          <XStack alignItems="center">
            <XStack
              width={46}
              height={32}
              borderWidth={0.5}
              borderColor={"$grey"}
              borderRadius={"$sm"}
              alignItems="center"
              justifyContent="center"
              backgroundColor="$white"
            >
              <AppImage
                name={cardIcon as any}
                width={32}
                height={20}
                resizeMode="contain"
              />
            </XStack>
            <Spacer size={"$reg"} />
            <TextSMMedium color="$secondary">
              {`Ending in ••${last4}`}
            </TextSMMedium>
          </XStack>
          <XStack alignItems="center" gap="$sm">
            {item.isDefault && (
              <YStack
                backgroundColor="$green"
                paddingHorizontal="$xs"
                paddingVertical={2}
                borderRadius="$sm"
              >
                <TextSMSemiBold fontSize={10} color="$white">
                  DEFAULT
                </TextSMSemiBold>
              </YStack>
            )}

            <YStack
              width={20}
              height={20}
              borderWidth={1}
              borderColor={
                selectedPayment === item.id
                  ? getTokenValue("$primary")
                  : getTokenValue("$lightgrey")
              }
              borderRadius={"$full"}
              backgroundColor={
                selectedPayment === item.id ? "$primarylight" : "$white"
              }
              justifyContent="center"
              alignItems="center"
            >
              <YStack
                width={8}
                height={8}
                borderRadius={"$full"}
                borderColor={
                  selectedPayment === item.id
                    ? getTokenValue("$primary")
                    : getTokenValue("$lightgrey")
                }
                backgroundColor={
                  selectedPayment === item.id
                    ? getTokenValue("$primary")
                    : "transparent"
                }
              />
            </YStack>
          </XStack>
        </XStack>
      </OpTouch>
    );
  };
  return (
    <YStack>
      <Spacer size={"$xl"} />
      <SectionHeader
        title={t("checkout.sectionHeader.paymentMethod")}
        tintColor={"darkgrey"}
        image="paymentcard"
        seeAllText=""
        color="primary"
        onPressSeeAll={() => {}}
      />
      <Spacer size={"$reg"} />
      <YStack paddingHorizontal={"$md"}>
        <YStack
          backgroundColor={"$white"}
          borderWidth={1}
          borderColor={"$lightgrey"}
          borderRadius={"$2xl"}
          padding="$reg"
        >
          {isLoading ? (
            <YStack paddingVertical="$lg" alignItems="center">
              <Loader size="small" color="$primary" />
            </YStack>
          ) : paymentMethods.length === 0 ? (
            <YStack paddingVertical="$md" alignItems="center">
              <TextSMMedium color="$secondary">
                No payment methods added
              </TextSMMedium>
            </YStack>
          ) : (
            <>
              <FlatList
                data={paymentMethods}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <Spacer size={"$md"} />}
              />
              <Spacer size={"$md"} />
              <Divider />
            </>
          )}
          <Spacer size={"$md"} />
          <OpTouch onPress={() => router.push("/addNewCardDetails")}>
            <XStack alignItems="center" justifyContent="center">
              <AppImage
                tintColor={getTokenValue("$primary")}
                name="addIcon"
                width={15}
                height={15}
              />
              <Spacer size={"$sm"} />
              <TextSMSemiBold color="$primary">
                {"Add Payment Method"}
              </TextSMSemiBold>
            </XStack>
          </OpTouch>
        </YStack>
      </YStack>
    </YStack>
  );
};

export default PaymentStepper;
