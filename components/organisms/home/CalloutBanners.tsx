import { AppImage } from "@/components/atoms/AppImage";
import { Spacer } from "@/components/atoms/Spacer";
import { ParagraphSM } from "@/components/atoms/texts/ParagraphSM";
import { TextMDBold } from "@/components/atoms/texts/TextMDBold";
import { SecondaryButton } from "@/components/molecules/buttons";
import { SCREEN_WIDTH } from "@/constants/styles";
import { t } from "@/translations";

import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList } from "react-native";
import { XStack, YStack } from "tamagui";

import type { CalloutBannerItem } from "@/api/generated/cartaisyAPI.schemas";
import { tokens } from "@/tamagui/token";

// Note: CalloutBannerItem still uses subTitle and buttonText (not changed in backend)
type CalloutData = CalloutBannerItem;

type CalloutBannersProps = {
  calloutBanners?: CalloutData[];
};

export const CalloutBanners = ({
  calloutBanners: banners,
}: CalloutBannersProps) => {
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

  const totalBanners = banners?.length || 0;

  if (!banners || banners.length === 0) {
    return null;
  }

  const handleViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveCarouselIndex(viewableItems[0].index || 0);
    }
  };

  const handleBannerPress = (banner: CalloutData) => {
    if (!banner?.action) return;

    const { action } = banner;

    // Handle collection type - navigate to PLP
    if (action.type === "collection" && action.collectionId) {
      router.push({
        pathname: "/products",
        params: {
          collectionId: action.collectionId.toString(),
          categoryName: banner?.title,
        },
      });
      return;
    }

    // Handle navigation type - navigate to specific screen
    if (action.type === "navigation" && action.navigateTo) {
      console.log("Navigate to:", action.navigateTo);
      return;
    }
  };

  return (
    <YStack>
      <FlatList
        data={banners || []}
        keyExtractor={(banner, index) => `callout-${banner.position ?? index}`}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
          waitForInteraction: true,
          minimumViewTime: 300,
        }}
        onViewableItemsChanged={handleViewableItemsChanged}
        renderItem={({ item: banner }) => (
          <XStack width={SCREEN_WIDTH}>
            <Spacer size={"$md"} />
            <XStack
              padding="$reg"
              width={SCREEN_WIDTH - 32}
              backgroundColor={"$white"}
              borderRadius={tokens.radius.md}
            >
              <AppImage source={banner?.imageUrl} width={37} height={26} />
              <Spacer size={"$md"} />
              <YStack flex={1}>
                <TextMDBold color="$darkgrey">
                  {banner?.title || t("home.freeShippingCard.title")}
                </TextMDBold>
                <Spacer size={"$sm"} />
                <ParagraphSM color="$secondary">
                  {banner?.subTitle || t("home.freeShippingCard.subtitle")}
                </ParagraphSM>
                <Spacer size={"$reg"} />
                <SecondaryButton
                  paddingVertical={"xs-sm"}
                  paddingHorizontal={"reg"}
                  width={180}
                  borderColor="$lightgrey"
                  color="$secondary"
                  onPress={() => handleBannerPress(banner)}
                  label={
                    banner?.buttonText || t("home.freeShippingCard.buttonText")
                  }
                />
              </YStack>
            </XStack>
            <Spacer size={"$md"} />
          </XStack>
        )}
      />
      {totalBanners > 1 && (
        <XStack
          justifyContent="center"
          alignItems="center"
          gap="$reg"
          paddingTop="$md"
        >
          {banners?.map((_banner: CalloutData, dotIndex: number) => (
            <YStack
              key={`callout-dot-${dotIndex}`}
              borderRadius="$full"
              width={8}
              height={8}
              backgroundColor={
                activeCarouselIndex === dotIndex ? "$primary" : "$lightgrey"
              }
            />
          ))}
        </XStack>
      )}
    </YStack>
  );
};
