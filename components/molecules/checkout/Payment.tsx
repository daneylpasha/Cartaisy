import { useSaveStep2 } from "@/api/generated/checkout/checkout";
import { useListPaymentMethods } from "@/api/generated/payment-methods/payment-methods";
import Icons from "@/assets/Icons";
import { TextSMMedium, TextSMSemiBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Divider } from "@/components/atoms/Divider";
import { Loader } from "@/components/atoms/Loader";
import { OpTouch } from "@/components/atoms/OpTouch";
import { useCustomAlert } from "@/components/molecules/CustomAlert";
import { t } from "@/translations";
import { isPlatformPaySupported } from "@stripe/stripe-react-native";
import { router, useFocusEffect } from "expo-router";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { FlatList, Platform } from "react-native";
import { getTokenValue, Spacer, XStack, YStack } from "tamagui";
import { SectionHeader } from "../SectionHeader";

type PaymentProps = {
  id: number;
  type?: string;
  cardNumber: number;
  amount: number;
  image?: keyof typeof Icons;
};

export type PaymentMethodType = "card" | "apple_pay" | "google_pay";

interface PaymentStepperProps {
  sessionId: string;
  onStepComplete: (walletPaymentMethodId?: string, paymentType?: PaymentMethodType) => void;
  onError?: (error?: unknown) => void;
}

export interface PaymentStepperRef {
  handleContinue: () => void;
  isLoading: boolean;
  selectedPaymentType: PaymentMethodType;
}

const PaymentStepper = forwardRef<PaymentStepperRef, PaymentStepperProps>(
  ({ sessionId, onStepComplete, onError }, ref) => {
    const [selectedPayment, setSelectedPayment] = useState<string>("");
    const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentMethodType>("card");
    const [isPlatformPayAvailable, setIsPlatformPayAvailable] = useState(false);
    const { showAlert, AlertComponent } = useCustomAlert();

    // Check platform pay availability
    useEffect(() => {
      const checkPlatformPay = async () => {
        try {
          const supported = await isPlatformPaySupported();
          console.log("[Payment] Platform pay supported:", supported);
          setIsPlatformPayAvailable(supported);
        } catch (error) {
          console.log("[Payment] Error checking platform pay:", error);
          setIsPlatformPayAvailable(false);
        }
      };
      checkPlatformPay();
    }, []);

    const {
      data: paymentMethodsResponse,
      isLoading,
      refetch,
    } = useListPaymentMethods();

    const { mutate: savePaymentStep, isPending: isSavingPayment } =
      useSaveStep2({
        mutation: {
          onSuccess: () => {
            console.log("[Payment] Payment method saved successfully");
            // Navigate to next step on success
            onStepComplete();
          },
          onError: (error) => {
            // Call onError callback to stop loader
            onError?.(error);
          },
        },
      });

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

    // Handle platform pay selection
    const handleSelectPlatformPay = () => {
      const platformPayType = Platform.OS === "ios" ? "apple_pay" : "google_pay";
      setSelectedPayment("platform_pay");
      setSelectedPaymentType(platformPayType);
      console.log("[Payment] Selected platform pay:", platformPayType);
    };

    // Handle card selection
    const handleSelectCard = (cardId: string) => {
      setSelectedPayment(cardId);
      setSelectedPaymentType("card");
      console.log("[Payment] Selected card:", cardId);
    };

    // Expose handleContinue method and loading state to parent via ref
    useImperativeHandle(ref, () => ({
      handleContinue: () => {
        // Validate payment method selection
        if (!selectedPayment) {
          showAlert({
            type: "warning",
            title: "Validation Error",
            message: "Please select a payment method",
            buttons: [{ text: "OK" }],
          });
          onError?.(); // Stop loader in parent
          return;
        }

        // If platform pay selected, just pass to next step (payment will happen on confirmation)
        if (selectedPayment === "platform_pay") {
          console.log("[Payment] Platform pay selected, moving to confirmation");
          onStepComplete(undefined, selectedPaymentType);
          return;
        }

        // Save payment method (card payment)
        console.log("[Payment] Saving payment method:", selectedPayment);
        savePaymentStep({
          data: {
            sessionId: sessionId,
            paymentMethodId: selectedPayment,
          },
        });
      },
      isLoading: isSavingPayment,
      selectedPaymentType,
    }));

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
          return "visaCard";
        case "mastercard":
          return "masterCard";
        case "amex":
        case "american express":
        case "american_express":
          return "amexCard";
        case "discover":
          return "discoverCard";
        case "unionpay":
          return "unionPayCard";
        default:
          return "masterCard"; // Generic fallback for all other cards
      }
    };

    const renderItem = ({ item }: { item: any }) => {
      const cardBrand = item.card?.brand || "card";
      const last4 = item.card?.last4 || "••••";
      const cardIcon = getCardIcon(cardBrand);

      return (
        <OpTouch key={item.id} onPress={() => handleSelectCard(item.id)}>
          <XStack
            alignItems="center"
            justifyContent="space-between"
            paddingVertical={"$xxs"}
            borderColor={"$primary"}
            backgroundColor={
              selectedPayment === item.id ? "$primarylight" : "$white"
            }
            borderWidth={selectedPayment === item.id ? 1 : 0}
            padding={"$reg"}
            borderRadius={"$md"}
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
                  backgroundColor="$primary"
                  paddingHorizontal="$sm"
                  paddingVertical={4}
                  borderRadius="$md"
                >
                  <TextSMSemiBold
                    fontSize={10}
                    color="$white"
                    letterSpacing={0.5}
                  >
                    DEFAULT
                  </TextSMSemiBold>
                </YStack>
              )}

              <YStack
                width={22}
                height={22}
                borderWidth={2}
                borderColor={
                  selectedPayment === item.id
                    ? getTokenValue("$primary")
                    : getTokenValue("$lightgrey")
                }
                borderRadius={"$full"}
                backgroundColor="$white"
                justifyContent="center"
                alignItems="center"
              >
                {selectedPayment === item.id && (
                  <YStack
                    width={8}
                    height={8}
                    borderRadius={"$full"}
                    backgroundColor="$primary"
                  />
                )}
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
          {/* Card Payment Options */}
          <YStack
            backgroundColor={"$white"}
            borderWidth={1}
            borderColor={"$lightgrey"}
            borderRadius={"$md"}
            padding="$reg"
          >
            {isLoading ? (
              <YStack paddingVertical="$lg" alignItems="center">
                <Loader size="small" color="$primary" />
              </YStack>
            ) : paymentMethods.length === 0 && !isPlatformPayAvailable ? (
              <YStack paddingVertical="$md" alignItems="center">
                <TextSMMedium color="$secondary">
                  No payment methods added
                </TextSMMedium>
              </YStack>
            ) : (
              <>
                {/* Platform Pay Option */}
                {isPlatformPayAvailable && (
                  <>
                    <OpTouch onPress={handleSelectPlatformPay}>
                      <XStack
                        alignItems="center"
                        justifyContent="space-between"
                        paddingVertical={"$xxs"}
                        borderColor={"$primary"}
                        backgroundColor={
                          selectedPayment === "platform_pay" ? "$primarylight" : "$white"
                        }
                        borderWidth={selectedPayment === "platform_pay" ? 1 : 0}
                        padding={"$reg"}
                        borderRadius={"$md"}
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
                              name={Platform.OS === "ios" ? "apple" : "googleIcon"}
                              width={24}
                              height={24}
                              resizeMode="contain"
                            />
                          </XStack>
                          <Spacer size={"$reg"} />
                          <TextSMMedium color="$secondary">
                            {Platform.OS === "ios" ? "Apple Pay" : "Google Pay"}
                          </TextSMMedium>
                        </XStack>
                        <YStack
                          width={22}
                          height={22}
                          borderWidth={2}
                          borderColor={
                            selectedPayment === "platform_pay"
                              ? getTokenValue("$primary")
                              : getTokenValue("$lightgrey")
                          }
                          borderRadius={"$full"}
                          backgroundColor="$white"
                          justifyContent="center"
                          alignItems="center"
                        >
                          {selectedPayment === "platform_pay" && (
                            <YStack
                              width={8}
                              height={8}
                              borderRadius={"$full"}
                              backgroundColor="$primary"
                            />
                          )}
                        </YStack>
                      </XStack>
                    </OpTouch>
                    {paymentMethods.length > 0 && <Spacer size={"$md"} />}
                  </>
                )}

                {/* Card Payment Options */}
                {paymentMethods.length > 0 && (
                  <>
                    <FlatList
                      data={paymentMethods}
                      keyExtractor={(item) => item.id.toString()}
                      showsVerticalScrollIndicator={false}
                      renderItem={renderItem}
                      ItemSeparatorComponent={() => <Spacer size={"$md"} />}
                    />
                    <Spacer size={"$md"} />
                  </>
                )}
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
        <AlertComponent />
      </YStack>
    );
  }
);

export default PaymentStepper;
