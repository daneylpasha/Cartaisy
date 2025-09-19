// CartLineItem.tsx
import Icons from "@/assets/Icons";
import {
  TextLGBold,
  TextMDBold,
  TextSMMedium,
  TextSMRegular,
  TextXSRegular,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Divider } from "@/components/atoms/Divider";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { tokens } from "@/tamagui/token";
import React from "react";
import { getTokenValue, XStack, YStack } from "tamagui";

type IconName = keyof typeof Icons;

export type CartLineItemProps = {
  image: IconName;
  title: string;
  currentPrice: number;
  originalPrice?: number;
  couponsCount?: number;
  freeDelivery?: boolean;
  options?: { label: string }[]; // e.g. [{label:'Dark Blue'}, {label:'XL'}]
  inStockCount?: number; // e.g. 3 -> "In Stock (3)"
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onSaveForLater: () => void;
  onRemove: () => void;
  onPressItem?: () => void;
};

export default function CartLineItem(props: CartLineItemProps) {
  const {
    image,
    title,
    currentPrice,
    originalPrice,
    couponsCount,
    freeDelivery,
    options = [],
    inStockCount,
    quantity,
    onIncrease,
    onDecrease,
    onSaveForLater,
    onRemove,
    onPressItem,
  } = props;

  return (
    <YStack>
      <XStack paddingHorizontal={"$md"} paddingTop={"$lg"}>
        <YStack
          overflow="hidden"
          borderWidth={1}
          borderColor="$lightgrey"
          backgroundColor="$white"
          borderRadius={tokens.space.md}
          width={80}
          height={80}
        >
          <AppImage resizeMode="contain" name={image} width={80} height={80} />
        </YStack>
        <Spacer size={"$md"} />
        <YStack flexShrink={1}>
          <TextSMMedium>{title}</TextSMMedium>
          <Spacer size={"$sm"} />
          {/* Price Row */}
          <XStack alignItems="center">
            <TextLGBold>${currentPrice.toFixed(2)}</TextLGBold>
            <Spacer size={"$sm"} />
            <TextXSRegular textDecorationLine="line-through" color="$secondary">
              ${originalPrice?.toFixed(2)}
            </TextXSRegular>
          </XStack>

          <XStack alignItems="center">
            <TextSMRegular color="$secondary">
              {couponsCount} Coupons
            </TextSMRegular>

            <TextSMRegular color={"$lightgrey"}>•</TextSMRegular>
            <TextSMRegular color="$secondary">Free Delivery</TextSMRegular>
          </XStack>

          <TextSMMedium color="$green">In Stock ({inStockCount})</TextSMMedium>
          <Spacer size={"$sm"} />
          <XStack>
            {/* Quantity stepper */}
            <XStack
              alignItems="center"
              borderWidth={1}
              borderColor="$lightgrey"
              borderRadius={"$full"}
              paddingHorizontal={"$sm"}
              paddingVertical={"$xs"}
            >
              <OpTouch onPress={onDecrease}>
                <AppImage
                  tintColor={getTokenValue("$primary")}
                  name={"minus"}
                  width={10}
                  height={10}
                />
              </OpTouch>
              <Spacer size={"$reg"} />
              <TextMDBold color="$secondary">{quantity}</TextMDBold>
              <Spacer size={"$reg"} />
              <OpTouch onPress={onIncrease}>
                <AppImage
                  tintColor={getTokenValue("$primary")}
                  name={"addIcon"}
                  width={10}
                  height={10}
                />
              </OpTouch>
            </XStack>
            <Spacer size={"$md"} />
            {/* Actions */}
            <XStack alignItems="center">
              <OpTouch onPress={onRemove}>
                <XStack alignItems="center">
                  <AppImage name={"trash"} width={14} height={15} />
                  <Spacer size={"$xs"} />
                  <TextSMMedium color="$secondary">{"Remove"}</TextSMMedium>
                </XStack>
              </OpTouch>
            </XStack>
          </XStack>
        </YStack>
      </XStack>
      <Spacer size={"$md"} />
      <Divider />
      <Spacer size={"$md"} />
    </YStack>
  );
}
