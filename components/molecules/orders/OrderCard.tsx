import Icons from "@/assets/Icons";
import { TextSMMedium, TextSMSemiBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Divider } from "@/components/atoms/Divider";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { SHADOW_STYLES } from "@/constants/styles";
import { router } from "expo-router";
import React from "react";
import { getTokenValue, XStack, YStack } from "tamagui";
import { ActiveCard } from "../profile/ActiveCard";

type itemProps = {
  item: {
    id?: number | string;
    image?: keyof typeof Icons | string | null;
    title?: string;
    qty?: number;
    shipping?: string;
    total?: number;
    currentPrice?: number;
    progress?: string;
    date?: string;
    companyName?: string;
    quantity?: number;
    variantTitle?: string;
    onPress?: () => void;
  };
};
const OrderCard = ({ item }: itemProps) => {
  // Handle custom onPress or default navigation
  const handlePress = () => {
    if (item.onPress) {
      item.onPress();
    } else {
      router.push(`/ordersDetails`);
    }
  };

  // Fallback values for missing data
  const displayCompany = item.companyName || "Order";
  const displayDate = item.date || new Date().toLocaleDateString();
  const displayProgress = item.progress || "In Progress";
  const displayQty = item.qty ?? item.quantity ?? 0;
  const displayTotal = item.total ?? item.currentPrice ?? 0;

  return (
    <OpTouch onPress={handlePress}>
      <YStack
        style={{ ...SHADOW_STYLES }}
        backgroundColor={"$white"}
        borderRadius={"$md"}
      >
        <XStack
          padding={"$md"}
          justifyContent="space-between"
          alignItems="center"
        >
          <XStack>
            <YStack
              width={40}
              height={40}
              backgroundColor={"$white"}
              borderWidth={1}
              borderColor={"$lightgrey"}
              justifyContent="center"
              alignItems="center"
              borderRadius={"$full"}
            >
              <AppImage name="deliveryBox" size={26} />
            </YStack>
            <Spacer size={"$xs-sm"} />
            <YStack>
              <TextSMSemiBold>{displayCompany}</TextSMSemiBold>
              <Spacer size={"$xs"} />
              <XStack alignItems="center">
                <AppImage
                  tintColor={getTokenValue("$secondary")}
                  name="calendar"
                  width={14}
                  height={14}
                />
                <Spacer size={"$xs"} />
                <TextSMMedium color={"$secondary"}>{displayDate}</TextSMMedium>
              </XStack>
            </YStack>
          </XStack>
          {/* <Spacer size={"$lg"} /> */}
          <XStack
            backgroundColor={
              displayProgress === "In Progress"
                ? "$background"
                : displayProgress === "Completed"
                ? "$green"
                : displayProgress === "Cancelled"
                ? "$error"
                : "$error"
            }
            borderRadius={"$md"}
            paddingHorizontal={"$sm"}
            paddingVertical={"$xs"}
            alignItems="center"
          >
            {displayProgress === "In Progress" && (
              <AppImage name="hourGlass" width={8} height={9} />
            )}

            <Spacer size={"$xs"} />
            <TextSMMedium
              color={
                displayProgress === "In Progress"
                  ? "$secondary"
                  : displayProgress === "Completed"
                  ? "$white"
                  : displayProgress === "Cancelled"
                  ? "$white"
                  : "$white" // Pending (default)
              }
            >
              {displayProgress}
            </TextSMMedium>
          </XStack>
        </XStack>

        <Divider />
        <ActiveCard background="white" item={item} />
      </YStack>
    </OpTouch>
  );
};

export default OrderCard;
