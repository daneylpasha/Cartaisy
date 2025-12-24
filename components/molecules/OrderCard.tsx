import Icons from "@/assets/Icons";
import { tokens } from "@/tamagui/token";
import { formatPrice } from "@/utils/formatPrice";
import React from "react";
import { Spacer, XStack, YStack } from "tamagui";
import { TextLGBold, TextSMMedium, TextXSRegular } from "../atoms";
import { AppImage } from "../atoms/AppImage";
import { OpTouch } from "../atoms/OpTouch";

type OrderItemProps = {
  title: string;
  image?: keyof typeof Icons | string | null;
  currentPrice?: number;
  originalPrice?: number;
  price?: number;
  total?: number;
  quantity?: number;
  variantTitle?: string;
  currency?: string;
  onPress?: () => void;
};
const OrderCard = ({ item }: { item: OrderItemProps }) => {
  // Handle both old and new data structures
  const displayPrice = item.currentPrice ?? item.price ?? 0;
  const displayOriginalPrice = item.originalPrice ?? item.total ?? 0;
  const imageSource =
    typeof item.image === "string" && item.image?.startsWith("http")
      ? { uri: item.image }
      : item.image;

  return (
    <OpTouch onPress={item.onPress}>
      <XStack paddingHorizontal={"$md"} paddingTop={"$lg"}>
        <YStack
          overflow="hidden"
          borderWidth={1}
          borderColor="$lightgrey"
          backgroundColor="$white"
          borderRadius={tokens.radius.md}
          width={80}
          height={80}
        >
          <AppImage
            resizeMode="cover"
            source={imageSource as any}
            width={80}
            height={80}
          />
        </YStack>
        <Spacer size={"$md"} />
        <YStack flexShrink={1}>
          <TextSMMedium>{item.title}</TextSMMedium>
          {item.variantTitle !== "Default Title" && (
            <>
              <Spacer size={"$xs"} />
              <TextXSRegular color="$secondary">
                {item.variantTitle}
              </TextXSRegular>
            </>
          )}
          <Spacer size={"$sm"} />
          {/* Price Row */}
          <XStack alignItems="center">
            <TextLGBold>{formatPrice(displayPrice, item.currency)}</TextLGBold>
            {displayOriginalPrice > displayPrice && (
              <>
                <Spacer size={"$sm"} />
                <TextXSRegular
                  textDecorationLine="line-through"
                  color="$secondary"
                >
                  {formatPrice(displayOriginalPrice, item.currency)}
                </TextXSRegular>
              </>
            )}
          </XStack>
        </YStack>
      </XStack>
    </OpTouch>
  );
};

export default OrderCard;
