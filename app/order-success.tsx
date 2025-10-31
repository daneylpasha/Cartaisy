import { CheckoutSuccess } from "@/components/molecules/checkout/CheckoutSucess";
import { PrimaryButton, SecondaryButton } from "@/components/molecules/buttons";
import { Spacer } from "@/components/atoms/Spacer";
import { useLocalSearchParams, router } from "expo-router";
import React from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { YStack } from "tamagui";

const OrderSuccessScreen = () => {
  const params = useLocalSearchParams();
  const { bottom: bottomSafeAreaInset } = useSafeAreaInsets();

  // Parse order details from params
  const orderDetails = params.orderDetails
    ? JSON.parse(params.orderDetails as string)
    : null;

  const handleSeeOrders = () => {
    // Close modal first
    router.back();
    // Navigate to orders after 300ms delay
    setTimeout(() => {
      router.push("/orders");
    }, 300);
  };

  const handleContinueShopping = () => {
    // Just close modal - home is already visible behind
    router.back();
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <CheckoutSuccess orderDetails={orderDetails} showButtons={false} />
      </ScrollView>

      {/* Fixed Bottom CTA Buttons */}
      <YStack
        paddingHorizontal="$md"
        paddingBottom={bottomSafeAreaInset || "$md"}
        paddingTop="$md"
        backgroundColor="$background"
        borderTopWidth={1}
        borderTopColor="$border"
      >
        <PrimaryButton
          label="See My Orders"
          onPress={handleSeeOrders}
        />
        <Spacer size={"$reg"} />
        <SecondaryButton
          label="Continue Shopping"
          onPress={handleContinueShopping}
        />
      </YStack>
    </YStack>
  );
};

export default OrderSuccessScreen;
