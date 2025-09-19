import Icons from "@/assets/Icons";
import { TextSMMedium, TextSMSemiBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Divider } from "@/components/atoms/Divider";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { SHADOW_STYLES } from "@/constants/styles";
import React from "react";
import { getTokenValue, XStack, YStack } from "tamagui";
import { ActiveCard } from "../profile/ActiveCard";
import { router } from "expo-router";

type itemProps = {
  item: {
    id: number;
    image: keyof typeof Icons;
    title: string;
    qty: number;
    shipping: string;
    total: number;
    progress: string;
    date: string;
    companyName: string;
  };
};
const OrderCard = ({ item }: itemProps) => {
  return (
    <OpTouch onPress={()=> router.push(`/ordersDetails`)} >
      <YStack
        style={{ ...SHADOW_STYLES }}
        backgroundColor={"$white"}
        borderRadius={"$2xl"}
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
              <AppImage name="upsIcon" size={26} />
            </YStack>
            <Spacer size={"$xs-sm"} />
            <YStack>
              <TextSMSemiBold>{item.companyName}</TextSMSemiBold>
              <Spacer size={"$xs"} />
              <XStack alignItems="center">
                <AppImage
                  tintColor={getTokenValue("$secondary")}
                  name="calendar"
                  width={14}
                  height={14}
                />
                <Spacer size={"$xs"} />
                <TextSMMedium color={"$secondary"}>{item.date}</TextSMMedium>
              </XStack>
            </YStack>
          </XStack>
          {/* <Spacer size={"$lg"} /> */}
          <XStack
            backgroundColor={
              item.progress === "In Progress"
                ? "$background"
                : item.progress === "Completed"
                ? "$green"
                : "$error"
            }
            borderRadius={"$3xl"}
            paddingHorizontal={"$sm"}
            paddingVertical={"$xs"}
            alignItems="center"
          >
            {item.progress === "In Progress" && (
              <AppImage name="hourGlass" width={8} height={9} />
            )}

            <Spacer size={"$xs"} />
            <TextSMMedium
              color={
                item.progress === "In Progress"
                  ? "$secondary"
                  : item.progress === "Completed"
                  ? "$white"
                  : "$white" // Pending (default)
              }
            >
              {item.progress}
            </TextSMMedium>
          </XStack>
          {/* <Spacer size={"$xs-sm"} /> */}
        </XStack>
        <Spacer size={"$reg"} />
        <Divider />
        <Spacer size={"$reg"} />
        <ActiveCard background="white" item={item} />
      </YStack>
    </OpTouch>
  );
};

export default OrderCard;
