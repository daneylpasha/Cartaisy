import {
  TextMDBold,
  TextSMMedium,
  TextSMRegular,
  TextXSRegular,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Divider } from "@/components/atoms/Divider";
import { Spacer } from "@/components/atoms/Spacer";
import { tokens } from "@/tamagui/token";
import React from "react";
import { XStack, YStack } from "tamagui";

type LineItem = {
  productId?: string;
  variantId?: string;
  title?: string;
  variantTitle?: string;
  image?: string | null;
  price?: number;
  quantity?: number;
  total?: number;
};

type OrderLineItemProps = {
  item: LineItem;
  isLast?: boolean;
};

const OrderLineItem = ({ item, isLast = false }: OrderLineItemProps) => {
  const imageSource =
    typeof item.image === "string" && item.image?.startsWith("http")
      ? { uri: item.image }
      : item.image;

  return (
    <YStack>
      <XStack paddingVertical={"$reg"} gap={"$md"}>
        {/* Product Image */}
        <YStack
          width={60}
          height={60}
          borderRadius={tokens.radius.md}
          overflow="hidden"
          borderWidth={1}
          borderColor="$lightgrey"
          justifyContent="center"
          alignItems="center"
          backgroundColor="$white"
          flexShrink={0}
        >
          {imageSource ? (
            <AppImage
              source={imageSource}
              width={60}
              height={60}
              resizeMode="cover"
            />
          ) : (
            <AppImage name="product1" size={60} />
          )}
        </YStack>

        {/* Product Info */}
        <YStack flex={1}>
          <TextMDBold numberOfLines={2}>{item.title || "Product"}</TextMDBold>
          <Spacer size={"$xs-sm"} />

          {/* Variant and Quantity */}
          <XStack alignItems="center">
            <TextXSRegular color="$secondary">
              {`Qty: ${item.quantity || 1}`}
            </TextXSRegular>
            {item.variantTitle && item.variantTitle !== "Default Title" && (
              <>
                <Spacer size={"$sm"} />
                <YStack
                  width={4}
                  height={4}
                  borderRadius="$full"
                  backgroundColor="$lightgrey"
                />
                <Spacer size={"$sm"} />
                <TextXSRegular color="$secondary" numberOfLines={1}>
                  {item.variantTitle}
                </TextXSRegular>
              </>
            )}
          </XStack>

          <Spacer size={"$sm"} />

          {/* Price */}
          <XStack alignItems="center">
            <TextSMMedium fontWeight="600">
              US${(item.total || item.price || 0).toFixed(2)}
            </TextSMMedium>
            {item.price && item.price !== item.total && (
              <>
                <Spacer size={"$sm"} />
                <TextXSRegular color="$secondary" textDecorationLine="line-through">
                  US${item.price.toFixed(2)}
                </TextXSRegular>
              </>
            )}
          </XStack>
        </YStack>
      </XStack>

      {!isLast && <Divider />}
    </YStack>
  );
};

export default OrderLineItem;
