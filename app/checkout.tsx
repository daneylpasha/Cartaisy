import { HeadingSMBold, ParagraphMD } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Spacer } from "@/components/atoms/Spacer";
import { PrimaryButton } from "@/components/molecules/buttons";
import { useReactiveTokenColor } from "@/hooks/useReactiveTokenColor";
import {
  BETA_CHECKOUT_ENTRY_ROUTE,
  legacyNativeCheckoutDisabledMessage,
} from "@/utils/checkoutFlowGate";
import { router } from "expo-router";
import React from "react";
import { getTokenValue, YStack } from "tamagui";

/**
 * Direct visits to the old native checkout route. There is no payment
 * step to mount: cart and Buy Now open Shopify-hosted checkout instead.
 */
const CheckoutScreen = () => {
  const getReactiveColor = useReactiveTokenColor();
  const primaryTint = getReactiveColor("primary");

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      padding="$lg"
      backgroundColor="$background"
    >
      <AppImage name="warningIcon" size={48} tintColor={primaryTint} />
      <Spacer size="$lg" />
      <HeadingSMBold textAlign="center">Checkout unavailable</HeadingSMBold>
      <Spacer size="$reg" />
      <ParagraphMD color="$textgrey" textAlign="center">
        {legacyNativeCheckoutDisabledMessage}
      </ParagraphMD>
      <Spacer size="$xl" />
      <PrimaryButton
        label="Go to Cart"
        onPress={() => router.replace(BETA_CHECKOUT_ENTRY_ROUTE)}
        icon={
          <AppImage
            name="cartIcon"
            tintColor={getTokenValue("$white")}
            size={16}
          />
        }
        iconPosition="left"
      />
    </YStack>
  );
};

export default CheckoutScreen;
