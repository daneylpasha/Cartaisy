import { Order } from "@/api/hooks/useOrders";
import { TextMDBold, TextSMRegular, TextXSRegular, PressableButton } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { SHADOW_STYLES } from "@/constants/styles";
import React from "react";
import { Platform } from "react-native";
import { YStack, XStack } from "tamagui";

type ActiveCardProps = {
  order?: Order;
  onPress?: () => void;
};

export const ActiveCard = ({ order, onPress }: ActiveCardProps) => {
  if (!order) return null;

  // Get line items
  const items = order.lineItems || [];
  const remainingCount = Math.max(0, items.length - 3);

  // Format order number
  const orderNumber = order.orderNumber?.slice(-6) || "N/A";

  // Format date
  const orderDate = new Date(
    order.placedAt || order.createdAt
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Get first item title
  const firstItemTitle = items[0]?.title || "Order Items";

  // Get image source
  const getImageSource = (image: string | null | undefined) => {
    if (!image) return undefined;
    if (typeof image === "string" && image.startsWith("http")) {
      return { uri: image };
    }
    return image;
  };

  if (Platform.OS === "android") {
    return (
      <PressableButton
        onPress={onPress}
        backgroundColor="white"
        borderRadius="lg"
        paddingHorizontal="md"
        paddingVertical="sm"
        width="100%"
        style={{ ...SHADOW_STYLES }}
      >
        {/* Top Row - Order Info */}
        <XStack
          justifyContent="space-between"
          alignItems="flex-start"
          width="100%"
          marginBottom={"$xs"}
        >
          <YStack flex={1}>
            <TextMDBold fontSize={15} color="$black">
              Order #{orderNumber}
            </TextMDBold>
            <TextXSRegular color="$secondary" marginTop={1} fontSize={12}>
              {orderDate}
            </TextXSRegular>
          </YStack>

          {/* Items Count Badge */}
          <YStack
            backgroundColor="$primarylight"
            paddingHorizontal={"$sm"}
            paddingVertical={3}
            borderRadius={"$full"}
            marginLeft={"$md"}
          >
            <TextXSRegular color="$primary" fontWeight="600" fontSize={11}>
              {items.length} {items.length === 1 ? "item" : "items"}
            </TextXSRegular>
          </YStack>
        </XStack>

        {/* Product Name */}
        <TextSMRegular
          color="$secondary"
          numberOfLines={1}
          marginBottom={"$xs"}
          fontSize={12}
        >
          {firstItemTitle}
        </TextSMRegular>

        {/* Images and Details Container */}
        <XStack alignItems="center" justifyContent="space-between" width="100%">
          {/* Images Container - Horizontal Overlapping */}
          <XStack
            height={60}
            alignItems="center"
            position="relative"
            width={130}
            minWidth={130}
          >
            {/* Single item - show full image */}
            {items.length === 1 ? (
              <YStack
                width={60}
                height={60}
                borderRadius={"$md"}
                overflow="hidden"
                backgroundColor="$lightgrey"
              >
                <AppImage
                  source={getImageSource(items[0]?.image)}
                  width={60}
                  height={60}
                  resizeMode="cover"
                />
              </YStack>
            ) : (
              // Multiple items - show overlapping stack
              <>
                {/* 1st Image */}
                {items[0] && (
                  <YStack
                    width={60}
                    height={60}
                    borderRadius={"$md"}
                    overflow="hidden"
                    backgroundColor="$lightgrey"
                    position="absolute"
                    left={0}
                    zIndex={3}
                  >
                    <AppImage
                      source={getImageSource(items[0]?.image)}
                      width={60}
                      height={60}
                      resizeMode="cover"
                    />
                  </YStack>
                )}

                {/* 2nd Image - overlap from right */}
                {items[1] && (
                  <YStack
                    width={60}
                    height={60}
                    borderRadius={"$md"}
                    overflow="hidden"
                    backgroundColor="$lightgrey"
                    position="absolute"
                    left={35}
                    zIndex={2}
                  >
                    <AppImage
                      source={getImageSource(items[1]?.image)}
                      width={60}
                      height={60}
                      resizeMode="cover"
                    />
                  </YStack>
                )}

                {/* 3rd Image */}
                {items[2] && (
                  <YStack
                    width={60}
                    height={60}
                    borderRadius={"$md"}
                    overflow="hidden"
                    backgroundColor="$lightgrey"
                    position="absolute"
                    left={70}
                    zIndex={1}
                  >
                    <AppImage
                      source={getImageSource(items[2]?.image)}
                      width={60}
                      height={60}
                      resizeMode="cover"
                    />
                  </YStack>
                )}

                {/* +N Badge if more items */}
                {remainingCount > 0 && (
                  <YStack
                    width={60}
                    height={60}
                    borderRadius={"$md"}
                    backgroundColor="$primary"
                    position="absolute"
                    right={-30}
                    bottom={0}
                    zIndex={0}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <TextSMRegular marginLeft={20} color="$white">
                      +{remainingCount}
                    </TextSMRegular>
                  </YStack>
                )}
              </>
            )}
          </XStack>

          {/* Arrow Icon */}
          <YStack marginLeft={"$md"}>
            <AppImage
              name="caretRight"
              width={16}
              height={16}
              tintColor="$secondary"
            />
          </YStack>
        </XStack>
      </PressableButton>
    );
  }

  // iOS version with OpTouch
  return (
    <OpTouch
      onPress={onPress}
      activeOpacity={0.7}
    >
      <YStack
        backgroundColor="$white"
        borderRadius={"$lg"}
        paddingHorizontal={"$md"}
        paddingVertical={"$sm"}
        width="100%"
        style={{ ...SHADOW_STYLES }}
      >
        {/* Top Row - Order Info */}
        <XStack
          justifyContent="space-between"
          alignItems="flex-start"
          width="100%"
          marginBottom={"$xs"}
        >
          <YStack flex={1}>
            <TextMDBold fontSize={15} color="$black">
              Order #{orderNumber}
            </TextMDBold>
            <TextXSRegular color="$secondary" marginTop={1} fontSize={12}>
              {orderDate}
            </TextXSRegular>
          </YStack>

          {/* Items Count Badge */}
          <YStack
            backgroundColor="$primarylight"
            paddingHorizontal={"$sm"}
            paddingVertical={3}
            borderRadius={"$full"}
            marginLeft={"$md"}
          >
            <TextXSRegular color="$primary" fontWeight="600" fontSize={11}>
              {items.length} {items.length === 1 ? "item" : "items"}
            </TextXSRegular>
          </YStack>
        </XStack>

        {/* Product Name */}
        <TextSMRegular
          color="$secondary"
          numberOfLines={1}
          marginBottom={"$xs"}
          fontSize={12}
        >
          {firstItemTitle}
        </TextSMRegular>

        {/* Images and Details Container */}
        <XStack alignItems="center" justifyContent="space-between" width="100%">
          {/* Images Container - Horizontal Overlapping */}
          <XStack
            height={60}
            alignItems="center"
            position="relative"
            width={130}
            minWidth={130}
          >
            {/* Single item - show full image */}
            {items.length === 1 ? (
              <YStack
                width={60}
                height={60}
                borderRadius={"$md"}
                overflow="hidden"
                backgroundColor="$lightgrey"
              >
                <AppImage
                  source={getImageSource(items[0]?.image)}
                  width={60}
                  height={60}
                  resizeMode="cover"
                />
              </YStack>
            ) : (
              // Multiple items - show overlapping stack
              <>
                {/* 1st Image */}
                {items[0] && (
                  <YStack
                    width={60}
                    height={60}
                    borderRadius={"$md"}
                    overflow="hidden"
                    backgroundColor="$lightgrey"
                    position="absolute"
                    left={0}
                    zIndex={3}
                  >
                    <AppImage
                      source={getImageSource(items[0]?.image)}
                      width={60}
                      height={60}
                      resizeMode="cover"
                    />
                  </YStack>
                )}

                {/* 2nd Image - overlap from right */}
                {items[1] && (
                  <YStack
                    width={60}
                    height={60}
                    borderRadius={"$md"}
                    overflow="hidden"
                    backgroundColor="$lightgrey"
                    position="absolute"
                    left={35}
                    zIndex={2}
                  >
                    <AppImage
                      source={getImageSource(items[1]?.image)}
                      width={60}
                      height={60}
                      resizeMode="cover"
                    />
                  </YStack>
                )}

                {/* 3rd Image */}
                {items[2] && (
                  <YStack
                    width={60}
                    height={60}
                    borderRadius={"$md"}
                    overflow="hidden"
                    backgroundColor="$lightgrey"
                    position="absolute"
                    left={70}
                    zIndex={1}
                  >
                    <AppImage
                      source={getImageSource(items[2]?.image)}
                      width={60}
                      height={60}
                      resizeMode="cover"
                    />
                  </YStack>
                )}

                {/* +N Badge if more items */}
                {remainingCount > 0 && (
                  <YStack
                    width={60}
                    height={60}
                    borderRadius={"$md"}
                    backgroundColor="$primary"
                    position="absolute"
                    right={-30}
                    bottom={0}
                    zIndex={0}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <TextSMRegular marginLeft={20} color="$white">
                      +{remainingCount}
                    </TextSMRegular>
                  </YStack>
                )}
              </>
            )}
          </XStack>

          {/* Arrow Icon */}
          <YStack marginLeft={"$md"}>
            <AppImage
              name="caretRight"
              width={16}
              height={16}
              tintColor="$secondary"
            />
          </YStack>
        </XStack>
      </YStack>
    </OpTouch>
  );
};
