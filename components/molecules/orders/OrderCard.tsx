import {
  TextLGBold,
  TextMDSemiBold,
  TextSMRegular,
  TextSMSemiBold,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Divider } from "@/components/atoms/Divider";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { SHADOW_STYLES } from "@/constants/styles";
import { formatPrice } from "@/utils/formatPrice";
import { router } from "expo-router";
import React from "react";
import { getTokenValue, XStack, YStack } from "tamagui";

type OrderCardProps = {
  item: {
    id?: string | number;
    orderNumber?: string;
    date?: string;
    status?: string;
    itemCount?: number;
    shipping?: string;
    totalPrice?: number;
    currency?: string;
    onPress?: () => void;
  };
};

const OrderCard = ({ item }: OrderCardProps) => {
  const handlePress = () => {
    if (item.onPress) {
      item.onPress();
    } else {
      router.push("/ordersDetails");
    }
  };

  // Fallback values
  const orderNumber = item.orderNumber || `Order #${item.id}`;
  const displayDate = item.date || new Date().toLocaleDateString();
  const displayStatus = item.status || "In Progress";
  const itemCount = item.itemCount || 0;
  const displayShipping = item.shipping || "Standard";
  const displayTotal = item.totalPrice || 0;

  // Status styling
  const getStatusColor = () => {
    switch (displayStatus) {
      case "Completed":
        return "$green";
      case "Cancelled":
        return "$error";
      case "In Progress":
        return "$background";
      default:
        return "$error";
    }
  };

  const getStatusTextColor = () => {
    return displayStatus === "In Progress" ? "$secondary" : "$white";
  };

  return (
    <YStack>
      <YStack
        style={{ ...SHADOW_STYLES }}
        backgroundColor={"$white"}
        borderRadius={"$lg"}
        overflow="hidden"
      >
        {/* Header Section */}
        <XStack
          padding={"$lg"}
          justifyContent="space-between"
          alignItems="center"
        >
          <YStack flex={1}>
            <TextMDSemiBold>{orderNumber}</TextMDSemiBold>
            <Spacer size={"$xs"} />
            <XStack alignItems="center">
              <AppImage
                name="calendar"
                width={14}
                height={14}
                tintColor={getTokenValue("$secondary")}
              />
              <Spacer size={"$xs"} />
              <TextSMRegular color={"$secondary"}>{displayDate}</TextSMRegular>
            </XStack>
          </YStack>
          <Spacer size={"$md"} />
          <XStack
            backgroundColor={getStatusColor()}
            borderRadius={"$md"}
            paddingHorizontal={"$sm"}
            paddingVertical={"$xs"}
            alignItems="center"
            justifyContent="center"
          >
            {displayStatus === "In Progress" && (
              <>
                <AppImage name="hourGlass" width={8} height={9} />
                <Spacer size={"$xs"} />
              </>
            )}
            <TextSMSemiBold color={getStatusTextColor()}>
              {displayStatus}
            </TextSMSemiBold>
          </XStack>
        </XStack>

        <Divider />

        {/* Order Details Section */}
        <YStack padding={"$lg"}>
          <XStack justifyContent="space-between">
            <YStack flex={1}>
              <TextSMRegular color="$secondary">
                {`${itemCount} ${itemCount === 1 ? "item" : "items"}`}
              </TextSMRegular>
              <Spacer size={"$xs"} />
              <TextSMRegular color="$secondary">
                {displayShipping} Shipping
              </TextSMRegular>
            </YStack>
            <YStack alignItems="flex-end">
              <TextSMRegular color="$secondary">Total</TextSMRegular>
              <Spacer size={"$xs"} />
              <TextLGBold>
                {formatPrice(displayTotal, item.currency)}
              </TextLGBold>
            </YStack>
          </XStack>

          <Spacer size={"$md"} />
          <OpTouch onPress={handlePress}>
            <XStack
              alignItems="center"
              justifyContent="center"
              paddingHorizontal={"$reg"}
              paddingVertical={"$sm"}
              backgroundColor="$primary"
              borderRadius={"$md"}
            >
              {/* <AppImage name="QrCode" width={11} height={11} />
                    <Spacer size={"$sm"} /> */}
              <TextSMSemiBold color="$white">Details</TextSMSemiBold>
            </XStack>
          </OpTouch>
        </YStack>
      </YStack>
      {/* <OpTouch>
      </OpTouch> */}
    </YStack>
  );
};

export default OrderCard;
