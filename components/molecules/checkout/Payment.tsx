import { useSaveStep2 } from "@/api/generated/checkout/checkout";
import { useListPaymentMethods } from "@/api/generated/payment-methods/payment-methods";
import Icons from "@/assets/Icons";
import { TextSMMedium, TextSMSemiBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Divider } from "@/components/atoms/Divider";
import { Loader } from "@/components/atoms/Loader";
import { OpTouch } from "@/components/atoms/OpTouch";
import { useCustomAlert } from "@/components/molecules/CustomAlert";
import { WalletPaymentButtons } from "@/components/molecules/checkout/WalletPaymentButtons";
import { t } from "@/translations";
import { router, useFocusEffect } from "expo-router";
import React, { forwardRef, useImperativeHandle, useState } from "react";
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

export type PaymentMethodType = "card" | "apple_pay" | "google_pay";

interface PaymentStepperProps {
  sessionId: string;
  onStepComplete: (walletPaymentMethodId?: string, paymentType?: PaymentMethodType) => void;
  onError?: () => void;
  orderTotal?: number; // Total amount for wallet pay display
}

export interface PaymentStepperRef {
  handleContinue: () => void;
  isLoading: boolean;
  selectedPaymentType: PaymentMethodType;
}

const PaymentStepper = forwardRef<PaymentStepperRef, PaymentStepperProps>(
  ({ sessionId, onStepComplete, onError, orderTotal = 0 }, ref) => {
    const [selectedPayment, setSelectedPayment] = useState<string>("");
    const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentMethodType>("card");
    const { showAlert, AlertComponent } = useCustomAlert();

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
          onError: () => {
            // Call onError callback to stop loader
            onError?.();
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

    // Handle wallet payment success
    const handleWalletPaymentSuccess = (paymentMethodId: string, paymentType: "apple_pay" | "google_pay") => {
      console.log("[Payment] Wallet payment successful:", paymentType, paymentMethodId);
      setSelectedPaymentType(paymentType);
      // For wallet payments, pass the payment method ID to the parent
      // The checkout flow will handle this differently than card payments
      onStepComplete(paymentMethodId, paymentType);
    };

    // Handle wallet payment error
    const handleWalletPaymentError = (error: string) => {
      console.error("[Payment] Wallet payment error:", error);
      showAlert({
        type: "error",
        title: "Payment Failed",
        message: error,
        buttons: [{ text: "OK" }],
      });
      onError?.();
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

        // Save payment method (card payment)
        console.log("[Payment] Saving payment method:", selectedPayment);
        setSelectedPaymentType("card");
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
          {/* Wallet Payment Options (Apple Pay / Google Pay) */}
          {orderTotal > 0 && (
            <WalletPaymentButtons
              amount={orderTotal}
              currency="USD"
              onPaymentSuccess={handleWalletPaymentSuccess}
              onPaymentError={handleWalletPaymentError}
              label="Cartaisy Order"
            />
          )}

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
        <AlertComponent />
      </YStack>
    );
  }
);

export default PaymentStepper;
