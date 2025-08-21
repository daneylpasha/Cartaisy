import Icons from "@/assets/Icons";
import { TextMDBold, TextSMRegular, TextSMSemiBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Divider } from "@/components/atoms/Divider";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import React from "react";
import { XStack, YStack } from "tamagui";

type ActiveCardProps = {
  item: {
    id: number;
    image: keyof typeof Icons;
    title: string;
    qty: number;
    shipping: string;
    total: number;
  };
};
export const ActiveCard = ({ item }: ActiveCardProps) => {
  return (
    <YStack
      padding={"$reg"}
      backgroundColor="$background"
      borderRadius={"$2xl"}
    >
      <XStack>
        <YStack
          width={48}
          height={48}
          borderRadius={"$md"}
          overflow="hidden"
          backgroundColor="$white"
          borderWidth={"$xxxs"}
          borderColor="$lightgrey"
        >
          <AppImage name={item.image} width={48} height={48} />
        </YStack>
        <Spacer size="$reg" />
        <YStack width={245}>
          <TextMDBold numberOfLines={2}>{item.title}</TextMDBold>
          <Spacer size="$xs-sm" />
          <XStack alignItems="center">
            <TextSMRegular color="$secondary">{`Qty: ${
              item.qty > 1 ? `${item.qty} items` : "1 item"
            }`}</TextSMRegular>
            <Spacer size="$sm" />
            <YStack
              width={4}
              height={4}
              borderRadius="$full"
              backgroundColor="$lightgrey"
            />
            <Spacer size="$sm" />
            <TextSMRegular color="$secondary">{item.shipping}</TextSMRegular>
          </XStack>
        </YStack>
      </XStack>
      <Spacer size="$reg" />
      <Divider />
      <Spacer size="$reg" />
      <XStack justifyContent="space-between" alignItems="center">
        <YStack>
          <TextSMRegular color="$secondary">{"Total cost"}</TextSMRegular>
          <Spacer size="$xs" />
          <TextMDBold>${item.total * item.qty}</TextMDBold>
        </YStack>
        <OpTouch onPress={() => {}}>
          <XStack
            alignItems="center"
            paddingHorizontal={"$reg"}
            paddingVertical={"$sm"}
            backgroundColor="$primary"
            borderRadius={"$full"}
          >
            <AppImage name="QrCode" width={11} height={11} />
            <Spacer size="$sm" />
            <TextSMSemiBold color="$white">{"Track"}</TextSMSemiBold>
          </XStack>
        </OpTouch>
      </XStack>
    </YStack>
  );
};
