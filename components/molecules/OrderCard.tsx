import Icons from "@/assets/Icons";
import { tokens } from "@/tamagui/token";
import React from "react";
import { Spacer, XStack, YStack } from "tamagui";
import { TextLGBold, TextSMMedium, TextXSRegular } from "../atoms";
import { AppImage } from "../atoms/AppImage";
import { OpTouch } from "../atoms/OpTouch";

type OrderItemProps = {
  title: string;
  image?: keyof typeof Icons;
  currentPrice: number;
  originalPrice: number;
  onPress?: () => void;
};
const OrderCard = ({ item }: { item: OrderItemProps }) => {
  return (
    <OpTouch onPress={item.onPress}>
      <XStack paddingHorizontal={"$md"} paddingTop={"$lg"}>
        <YStack
          overflow="hidden"
          borderWidth={1}
          borderColor="$lightgrey"
          backgroundColor="$white"
          borderRadius={tokens.space.sm}
          width={80}
          height={80}
        >
          <AppImage
            resizeMode="contain"
            name={item.image}
            width={80}
            height={80}
          />
        </YStack>
        <Spacer size={"$md"} />
        <YStack flexShrink={1}>
          <TextSMMedium>{item.title}</TextSMMedium>
          <Spacer size={"$sm"} />
          {/* Price Row */}
          <XStack alignItems="center">
            <TextLGBold>${item.currentPrice}</TextLGBold>
            <Spacer size={"$sm"} />
            <TextXSRegular textDecorationLine="line-through" color="$secondary">
              ${item.originalPrice}
            </TextXSRegular>
          </XStack>
        </YStack>
      </XStack>
    </OpTouch>
  );
};

export default OrderCard;
