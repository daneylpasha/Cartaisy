// CartLineItem.tsx
import Icons from "@/assets/Icons";
import {
  Loader,
  TextLGBold,
  TextMDBold,
  TextSMBold,
  TextSMMedium,
  TextSMRegular,
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
  image: IconName | string; // Support both icon names and URLs
  title: string;
  currentPrice: number;
  originalPrice?: number;
  couponsCount?: number;
  freeDelivery?: boolean;
  options?: { label: string }[];
  inStockCount?: number;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onSaveForLater: () => void;
  onRemove: () => void;
  onPressItem?: () => void;
  maxQuantity?: number;
  isUpdating?: boolean; // Loading state for quantity updates
  isRemoving?: boolean; // Loading state for remove action
  brandName?: string; // Brand name from metafields
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
    maxQuantity,
    isUpdating = false,
    isRemoving = false,
    brandName,
  } = props;

  // Check if image is URL or icon name
  const isImageUrl =
    typeof image === "string" &&
    (image.startsWith("http://") || image.startsWith("https://"));

  // Check if at max quantity
  const isAtMaxQuantity = maxQuantity !== undefined && quantity >= maxQuantity;

  return (
    <YStack>
      <XStack paddingHorizontal={"$md"} paddingTop={"$lg"}>
        <OpTouch onPress={onPressItem} disabled={!onPressItem}>
          <YStack
            overflow="hidden"
            borderWidth={1}
            borderColor="$lightgrey"
            backgroundColor="$white"
            borderRadius={tokens.radius.md}
            width={80}
            height={80}
          >
            {isImageUrl && (
              <AppImage
                resizeMode="cover"
                source={{ uri: image }}
                width={80}
                height={80}
              />
            )}
          </YStack>
        </OpTouch>
        <Spacer size={"$md"} />
        <YStack flexShrink={1}>
          <OpTouch onPress={onPressItem} disabled={!onPressItem}>
            <TextSMMedium numberOfLines={1} color={"$secondary"}>
              {title}
            </TextSMMedium>

            {brandName && <TextSMBold color={"$icon"}>{brandName}</TextSMBold>}
          </OpTouch>
          <Spacer size={"$xs"} />
          {/* Price Row */}
          <XStack alignItems="center">
            <TextLGBold>US${currentPrice.toFixed(2)}</TextLGBold>
            {originalPrice && originalPrice !== currentPrice ? (
              <>
                <Spacer size="$xs" />
                <TextSMRegular color="$icon" textDecorationLine="line-through">
                  US${originalPrice.toFixed(2)}
                </TextSMRegular>
              </>
            ) : null}
          </XStack>

          {options && options.length > 0 && (
            <XStack alignItems="center" flexWrap="wrap" gap="$xs">
              {options.map((opt, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <TextSMRegular color={"$lightgrey"}>•</TextSMRegular>
                  )}
                  <TextSMRegular color="$secondary">{opt.label}</TextSMRegular>
                </React.Fragment>
              ))}
            </XStack>
          )}

          {inStockCount !== undefined && (
            <TextSMMedium color="$green">
              In Stock ({inStockCount})
            </TextSMMedium>
          )}
          <Spacer size={"$sm"} />
          <XStack>
            {/* Quantity stepper */}
            <XStack
              alignItems="center"
              borderWidth={1}
              borderColor="$lightgrey"
              borderRadius={"$md"}
              width={90}
              justifyContent="center"
              paddingHorizontal={"$reg"}
              paddingVertical={"$xs"}
            >
              {isUpdating ? (
                <YStack paddingVertical={"$xs"}>
                  <Loader
                    size="small"
                    color="$primary"
                    height={14}
                    width={14}
                  />
                </YStack>
              ) : (
                <>
                  <OpTouch
                    hitSlop={{ top: 10, right: 10, left: 10, bottom: 10 }}
                    onPress={onDecrease}
                    disabled={quantity <= 1}
                  >
                    <AppImage
                      tintColor={
                        quantity <= 1
                          ? getTokenValue("$icon")
                          : getTokenValue("$primary")
                      }
                      name={"minus"}
                      width={10}
                      height={10}
                    />
                  </OpTouch>
                  <Spacer size={"$reg"} />
                  <TextMDBold color="$secondary">{quantity}</TextMDBold>
                  <Spacer size={"$reg"} />
                  <OpTouch
                    hitSlop={{ top: 10, right: 10, left: 10, bottom: 10 }}
                    onPress={onIncrease}
                    disabled={isAtMaxQuantity}
                  >
                    <AppImage
                      tintColor={
                        isAtMaxQuantity
                          ? getTokenValue("$icon")
                          : getTokenValue("$primary")
                      }
                      name={"addIcon"}
                      width={10}
                      height={10}
                    />
                  </OpTouch>
                </>
              )}
            </XStack>
            <Spacer size={"$md"} />
            {/* Actions */}
            <XStack alignItems="center">
              <OpTouch onPress={onRemove} disabled={isRemoving}>
                <XStack alignItems="center">
                  {isRemoving ? (
                    <Loader size="small" color="$primary" />
                  ) : (
                    <>
                      <AppImage name={"trash"} width={14} height={15} />
                      <Spacer size={"$xs"} />
                      <TextSMMedium color="$secondary">{"Remove"}</TextSMMedium>
                    </>
                  )}
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
