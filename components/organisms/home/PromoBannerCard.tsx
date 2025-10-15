import { AppImage } from "@/components/atoms/AppImage";
import { TextMDBold } from "@/components/atoms/texts";
import { ParagraphSM } from "@/components/atoms/texts/ParagraphSM";
import { PrimaryButton } from "@/components/molecules/buttons";
import { SCREEN_WIDTH } from "@/constants/styles";
import { tokens } from "@/tamagui/token";
import { t } from "@/translations";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { getTokenValue, Spacer, XStack, YStack } from "tamagui";

import type { PromoBannerItem as ApiPromoBannerItem } from "@/api/generated/cartaisyAPI.schemas";

// Note: API uses ctaText instead of buttonText
type PromoBannerItem = ApiPromoBannerItem;

type PromoBannerCardProps = {
  promoBanners?: PromoBannerItem[];
};

export const PromoBannerCard = ({
  promoBanners: banners,
}: PromoBannerCardProps) => {
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

  console.log("bannerr..........", banners);
  const totalBanners = banners?.length || 0;

  if (!banners || banners.length === 0) {
    return null;
  }

  const renderBannerCard = (banner: PromoBannerItem) => (
    <XStack width={SCREEN_WIDTH} paddingHorizontal={"$md"}>
      <XStack
        flex={1}
        borderTopLeftRadius={"$2xl"}
        borderBottomLeftRadius={"$2xl"}
        justifyContent="space-between"
        backgroundColor={"$white"}
      >
        {/* Left Section */}
        <YStack padding={"$md"} width={"60%"}>
          <TextMDBold color="$darkgrey">
            {banner.title || t("home.promoBannerCard.title")}
          </TextMDBold>

          <Spacer size="$sm" />

          <ParagraphSM color="$textgrey">
            {banner.subtitle || t("home.promoBannerCard.subtitle")}
          </ParagraphSM>

          <Spacer size="$reg" />

          <PrimaryButton
            width={"80%"}
            label={banner.ctaText || t("home.promoBannerCard.buttonText")}
            paddingVertical="xs"
            icon={
              <AppImage
                name="arrowRight"
                tintColor={getTokenValue("$white")}
                width={16}
                height={16}
              />
            }
            onPress={() => {
              if (banner.collectionId) {
                router.push({
                  pathname: "/products",
                  params: {
                    collectionId: banner.collectionId,
                    categoryName: banner.title,
                  },
                });
              }
            }}
            isLoading={false}
          />
        </YStack>

        {/* Right Image */}
        <AppImage
          resizeMode="cover"
          style={Styles.ImageStyle}
          width={128}
          height={150}
          source={banner.image}
        />
      </XStack>
    </XStack>
  );

  const handleViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveCarouselIndex(viewableItems[0].index || 0);
    }
  };

  return (
    <YStack>
      <FlatList
        data={banners}
        keyExtractor={(banner, index) =>
          `promo-${banner.collectionId}-${index}`
        }
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
        renderItem={({ item: banner }) => renderBannerCard(banner)}
      />
      {totalBanners > 1 && (
        <XStack
          justifyContent="center"
          alignItems="center"
          gap="$reg"
          paddingTop="$md"
        >
          {banners?.map((banner, dotIndex) => (
            <YStack
              key={`promo-dot-${dotIndex}`}
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

const Styles = StyleSheet.create({
  ImageStyle: {
    borderTopRightRadius: tokens.radius["2xl"],
    borderBottomRightRadius: tokens.radius["2xl"],
  },
});
