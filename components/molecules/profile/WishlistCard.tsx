import { TextSMSemiBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextLGBold } from "@/components/atoms/texts/TextLGBold";
import { TextMDRegular } from "@/components/atoms/texts/TextMDRegular";
import { router } from "expo-router";
import React from "react";
import { Platform, ViewStyle } from "react-native";
import { getTokenValue, XStack, YStack } from "tamagui";

export type WishlistItem = {
  id: string;
  title: string;
  subtitleLeft: string;
  subtitleRight: string;
  saleCount?: number;
};

export const SHADOW_STYLES: ViewStyle =
  Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 2 },
    },
    android: { elevation: 3 },
    default: {},
  }) || {};

type Props = { item: WishlistItem; onPress?: () => void };

export function WishlistCard({ item, onPress }: Props) {
  return (
    <OpTouch
      onPress={() =>
        router.push({
          pathname: "/wishlist",
          params: { id: item.id },
        })
      }
    >
      <YStack
        onPress={onPress}
        height={128}
        backgroundColor={"$white"}
        borderRadius={"$2xl"}
        padding={"$reg"}
        position="relative"
        style={{ ...SHADOW_STYLES }} // ✅ shadow only here
      >
        {/* Top Row */}
        <XStack>
          <YStack
            width={64}
            height={64}
            borderRadius={"$sm"}
            overflow="hidden"
            borderWidth={"$xxxs"}
            borderColor={"$lightgrey"}
          >
            <AppImage name="product1" width={64} height={64} />
          </YStack>
          <Spacer size={"$reg"} />
          <YStack flex={1}>
            <TextLGBold>{item.title}</TextLGBold>
            <Spacer size={"$xs-sm"} />
            <XStack alignItems="center">
              <TextMDRegular color="$secondary">
                {item.subtitleLeft}
              </TextMDRegular>
              <Spacer size={"$sm"} />
              <TextMDRegular color="$lightgrey">•</TextMDRegular>
              <Spacer size={"$sm"} />
              <TextMDRegular color="$secondary">
                {item.subtitleRight}
              </TextMDRegular>
            </XStack>
            <Spacer size={"$xs-sm"} />
            {typeof item.saleCount === "number" && item.saleCount > 0 && (
              <>
                <XStack alignItems="center" borderRadius={8} gap={6}>
                  <AppImage
                    tintColor={getTokenValue("$green")}
                    name="dealIcon"
                    width={16}
                    height={16}
                  />
                  <TextSMSemiBold color="$green">
                    {item.saleCount} items are on sale
                  </TextSMSemiBold>
                </XStack>
              </>
            )}
          </YStack>
          <YStack justifyContent="center">
            <AppImage
              tintColor={getTokenValue("$secondary")}
              name="caretRight"
              width={9}
              height={16}
            />
          </YStack>
        </XStack>
        
      </YStack>
    </OpTouch>
  );
}
