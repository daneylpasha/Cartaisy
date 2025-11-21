import {
  ParagraphMD,
  TextLGBold,
  TextMDSemiBold,
  TextSMRegular,
  TextSMSemiBold,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Divider } from "@/components/atoms/Divider";
import { Loader } from "@/components/atoms/Loader";
import { OpTouch } from "@/components/atoms/OpTouch";
import { router } from "expo-router";
import React from "react";
import { getTokenValue, Spacer, XStack, YStack } from "tamagui";
import { PrimaryButton, SecondaryButton } from "../buttons";

// Order details interface
interface CompleteOrderDetails {
  orderNumber: string;
  email: string;
  phone: string;
  shippingAddress: {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  };
  payment: {
    cardBrand: string;
    last4: string;
  };
  shipping: {
    method: string;
  };
  dates: {
    estimatedDelivery?: string | null;
  };
  pricing: {
    totalPrice: number;
    currency: string;
  };
  discount: {
    amount: number;
  };
  products: any[];
}

interface CheckoutSuccessProps {
  orderDetails?: CompleteOrderDetails | null;
  showButtons?: boolean;
}

export const CheckoutSuccess: React.FC<CheckoutSuccessProps> = ({
  orderDetails,
  showButtons = true,
}) => {
  if (!orderDetails) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        minHeight={600}
      >
        <Loader size="large" color="$primary" />
      </YStack>
    );
  }

  const totalSavings = orderDetails.discount?.amount || 0;
  const productImages =
    orderDetails.products?.slice(0, 3).map((p: any) => p.image) || [];

  return (
    <YStack alignItems="center" paddingHorizontal="$md">
      <Spacer size={"$lg"} />
      {/* Success Icon */}
      <YStack
        width={48}
        height={48}
        borderRadius="$full"
        backgroundColor="$green"
        alignItems="center"
        justifyContent="center"
      >
        <AppImage
          name="check"
          width={19}
          height={14}
          tintColor={getTokenValue("$white")}
        />
      </YStack>
      <Spacer size={"$xl"} />

      {/* Product Images */}
      {productImages.length > 0 && (
        <>
          <XStack gap="$sm" alignItems="center">
            {productImages.map((image: any, index: number) => (
              <YStack
                key={`success-img-${index}`}
                borderRadius="$md"
                overflow="hidden"
                borderWidth={1}
                borderColor={"$lightgrey"}
                width={64}
                height={64}
              >
                {typeof image === "string" && image.startsWith("http") ? (
                  <AppImage
                    resizeMode="cover"
                    source={{ uri: image }}
                    width={64}
                    height={64}
                  />
                ) : (
                  <AppImage name={image as any} width={56} height={56} />
                )}
              </YStack>
            ))}
          </XStack>
          <Spacer size={"$md-lg"} />
        </>
      )}

      {/* Success Message */}
      <TextLGBold textAlign="center">Order Placed Successfully!</TextLGBold>
      <Spacer size={"$sm"} />
      {totalSavings > 0 && (
        <ParagraphMD color="$secondary" textAlign="center">
          {`You saved US$${totalSavings.toFixed(2)} on this order`}
        </ParagraphMD>
      )}
      <Spacer size={"$md-lg"} />

      {/* Order Summary */}
      <XStack alignItems="center">
        <TextSMSemiBold color="$primary">
          US${orderDetails.pricing.totalPrice.toFixed(2)}
        </TextSMSemiBold>
        <Spacer size={"$sm"} />
        <YStack
          width={4}
          height={4}
          borderRadius="$full"
          backgroundColor="$lightgrey"
        />
        <Spacer size={"$sm"} />
        <TextSMRegular color="$secondary">
          Order #{orderDetails.orderNumber}
        </TextSMRegular>
      </XStack>
      <Spacer size={"$xl"} />

      {/* Order Details Card */}
      <YStack
        width="100%"
        backgroundColor="$surface"
        borderRadius="$md"
        borderWidth={1}
        borderColor="$border"
        padding="$md"
      >
        <TextMDSemiBold>Order Details</TextMDSemiBold>
        <Spacer size={"$md"} />

        {/* Email & Phone */}
        <XStack alignItems="center" gap="$xs">
          <AppImage
            name="emailIcon"
            width={16}
            height={16}
            tintColor={getTokenValue("$icon")}
          />
          <TextSMRegular color="$secondary">{orderDetails.email}</TextSMRegular>
        </XStack>
        <Spacer size={"$sm"} />
        <XStack alignItems="center" gap="$xs">
          <AppImage
            name="phoneLogo"
            width={16}
            height={16}
            tintColor={getTokenValue("$icon")}
          />
          <TextSMRegular color="$secondary">{orderDetails.phone}</TextSMRegular>
        </XStack>

        <Spacer size={"$md"} />
        <Divider />
        <Spacer size={"$md"} />

        {/* Shipping Address */}
        <TextSMSemiBold>Delivery Address</TextSMSemiBold>
        <Spacer size={"$sm"} />
        <TextSMRegular color="$secondary">
          {orderDetails.shippingAddress.address1}
          {orderDetails.shippingAddress.address2
            ? `, ${orderDetails.shippingAddress.address2}`
            : ""}
        </TextSMRegular>
        <TextSMRegular color="$secondary">
          {orderDetails.shippingAddress.city},{" "}
          {orderDetails.shippingAddress.province}{" "}
          {orderDetails.shippingAddress.zip}
        </TextSMRegular>
        <TextSMRegular color="$secondary">
          {orderDetails.shippingAddress.country}
        </TextSMRegular>

        <Spacer size={"$md"} />
        <Divider />
        <Spacer size={"$md"} />

        {/* Payment Method */}
        <TextSMSemiBold>Payment Method</TextSMSemiBold>
        <Spacer size={"$sm"} />
        <XStack alignItems="center" gap="$sm">
          <AppImage
            name="wallet"
            width={20}
            height={20}
            tintColor={getTokenValue("$icon")}
          />
          <TextSMRegular color="$secondary">
            {orderDetails.payment.cardBrand?.toUpperCase()} ••••{" "}
            {orderDetails.payment.last4}
          </TextSMRegular>
        </XStack>

        <Spacer size={"$md"} />
        <Divider />
        <Spacer size={"$md"} />

        {/* Shipping Method */}
        <TextSMSemiBold>Shipping Method</TextSMSemiBold>
        <Spacer size={"$sm"} />
        <TextSMRegular color="$secondary">
          {orderDetails.shipping.method}
        </TextSMRegular>
      </YStack>

      <Spacer size={"$xl"} />

      {/* Action Buttons */}
      {showButtons && (
        <>
          <YStack width="100%">
            <PrimaryButton
              label="See My Orders"
              onPress={() => {
                router.replace("/orders");
              }}
            />
            <Spacer size={"$reg"} />
            <SecondaryButton
              label="Continue Shopping"
              onPress={() => {
                router.replace("/(tabs)");
              }}
            />
          </YStack>

          <Spacer size="$lg" />
        </>
      )}

      {/* Help Option */}
      <OpTouch onPress={() => {}}>
        <XStack alignItems="center" gap="$xs">
          <AppImage
            name="warningIcon"
            width={16}
            height={16}
            tintColor={getTokenValue("$primary")}
          />
          <TextMDSemiBold color="$primary">
            {"Need help with your order?"}
          </TextMDSemiBold>
        </XStack>
      </OpTouch>

      <Spacer size={"$xl"} />
    </YStack>
  );
};
