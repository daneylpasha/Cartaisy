import {
  TextMDSemiBold,
  TextSMSemiBold,
  TextXSRegular,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextMDRegular } from "@/components/atoms/texts/TextMDRegular";
import useCartStore from "@/store/useCartStore";
import useUserStore from "@/store/useUserStore";
import { tokens } from "@/tamagui/token";
import { t } from "@/translations";
import { router } from "expo-router";
import React from "react";
import { Animated, Platform } from "react-native";
import { getTokenValue, XStack, YStack } from "tamagui";

type HomeHeaderProps = {
  topInset: number;
  rotateAnim: Animated.Value;
  onAddressPress: () => void;
};

export const HomeHeader = ({
  topInset,
  rotateAnim,
  onAddressPress,
}: HomeHeaderProps) => {
  const { items, getTotalQuantity } = useCartStore();
  const { defaultAddress } = useUserStore();
  const cartItemCount = getTotalQuantity();

  // Format default address for display
  const displayAddress = defaultAddress
    ? [
        defaultAddress.address1,
        defaultAddress.city,
        defaultAddress.province,
        defaultAddress.zip,
      ]
        .filter(Boolean)
        .join(", ")
    : "Add delivery address";

  return (
    <YStack
      paddingTop={Platform.OS === "android" ? 10 : 0}
      paddingHorizontal="$md"
      backgroundColor="$primary"
      paddingBottom={"$md"}
    >
      <XStack alignItems="center" paddingVertical={"$xs"} position="relative">
        <YStack position="absolute" left={0}>
          <TextMDSemiBold color="$white">{"Hello, Lily!"}</TextMDSemiBold>
        </YStack>
        <YStack
          position="absolute"
          left="50%"
          transform={[{ translateX: -25 }]}
        >
          <AppImage name="bagWhite" width={50} height={26} />
        </YStack>

        <YStack position="absolute" right={0}>
          <OpTouch onPress={() => router.push("/cart")}>
            <YStack position="relative">
              <AppImage name="cartIcon" size={24} />
              {cartItemCount > 0 && (
                <YStack
                  position="absolute"
                  backgroundColor="$yellow"
                  top={-8}
                  right={-10}
                  borderRadius="$full"
                  minWidth={20}
                  height={20}
                  justifyContent="center"
                  alignItems="center"
                  paddingHorizontal={"$xs"}
                >
                  <TextXSRegular color="$white" textAlign="center">
                    {String(cartItemCount)}
                  </TextXSRegular>
                </YStack>
              )}
            </YStack>
          </OpTouch>
        </YStack>
      </XStack>
      <Spacer size={"$md"} />

      {/* Search Bar */}
      <YStack
        backgroundColor="$white"
        borderRadius={tokens.radius.md}
        paddingVertical={"$sm"}
        paddingHorizontal={"$reg"}
        // padding={"$sm-reg"}
      >
        <OpTouch
          activeOpacity={0.9}
          onPress={() => router.push("/search")}
          hitSlop={10}
        >
          <XStack alignItems="center" gap={"$md"}>
            <AppImage
              name="searchIcon"
              width={18}
              height={18}
              tintColor="$secondary"
            />

            <TextMDRegular color="$textgrey">
              {`Search ${t("common.companyName")}`}
            </TextMDRegular>
          </XStack>
        </OpTouch>
      </YStack>
      <Spacer size={"$sm"} />

      {/* Address Selector */}
      <OpTouch
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={onAddressPress}
      >
        <XStack justifyContent="space-between" alignItems="center" gap="$sm">
          <XStack alignItems="center" gap={"$xs"} flex={1} flexShrink={1}>
            <AppImage
              tintColor={getTokenValue("$white")}
              name="locationIcon"
              width={13}
              height={17}
            />
            <Spacer size={"$sm"} />
            <TextSMSemiBold
              color="$white"
              numberOfLines={1}
              ellipsizeMode="tail"
              flexShrink={1}
            >
              {displayAddress}
            </TextSMSemiBold>
          </XStack>
          <Animated.View
            style={{
              transform: [
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "180deg"],
                  }),
                },
              ],
            }}
          >
            <AppImage
              tintColor={getTokenValue("$white")}
              name="arrowUp"
              width={13}
              height={7.5}
            />
          </Animated.View>
        </XStack>
      </OpTouch>
    </YStack>
  );
};
