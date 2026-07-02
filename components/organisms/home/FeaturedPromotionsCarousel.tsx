import type { CarouselItem } from "@/api/types";
import { ParagraphXS } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { PressableButton } from "@/components/atoms/PressableButton";
import { Spacer } from "@/components/atoms/Spacer";
import { TextLGBold } from "@/components/atoms/texts/TextLGBold";
import { TextXSRegular } from "@/components/atoms/texts/TextXSRegular";
import { SecondaryButton } from "@/components/molecules/buttons";
import { SCREEN_WIDTH, SHADOW_STYLES } from "@/constants/styles";
import { tokens } from "@/tamagui/token";
import { extractNumericId } from "@/utils/extractNumericId";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { FlatList, Platform } from "react-native";
import { XStack, YStack } from "tamagui";

type FeaturedPromotionsCarouselProps = {
  carousels?: CarouselItem[];
};

export const FeaturedPromotionsCarousel = ({
  carousels,
}: FeaturedPromotionsCarouselProps) => {
  const activeCarousels =
    carousels?.filter((banner) => {
      if (!banner.endsAt) return true;
      return new Date(banner.endsAt) >= new Date();
    }) ?? [];

  const totalBanners = activeCarousels.length;
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const carouselRef = useRef<FlatList>(null);

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.[0]?.index != null)
      setActiveCarouselIndex(viewableItems[0].index);
  }).current;

  React.useEffect(() => {
    if (activeCarousels.length <= 1) return; // Don't auto-scroll if only one item

    const autoScrollInterval = setInterval(() => {
      setActiveCarouselIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= activeCarousels.length) {
          // Reset to first card when reaching the end
          setTimeout(() => {
            carouselRef.current?.scrollToIndex({ index: 0, animated: true });
          }, 100);
          return 0;
        } else {
          // Move to next card
          setTimeout(() => {
            carouselRef.current?.scrollToIndex({
              index: nextIndex,
              animated: true,
            });
          }, 100);
          return nextIndex;
        }
      });
    }, 4000);

    return () => clearInterval(autoScrollInterval);
  }, [activeCarousels.length]);

  if (activeCarousels.length === 0) {
    return null;
  }

  return (
    <YStack>
      <FlatList
        ref={carouselRef}
        data={activeCarousels}
        keyExtractor={(banner, index) =>
          `featured-${banner.collectionId}-${index}`
        }
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
          waitForInteraction: true,
          minimumViewTime: 300,
        }}
        renderItem={({ item: banner }) => {
          const handlePress = () => {
            if (banner.collectionId) {
              router.push({
                pathname: "/products",
                params: {
                  collectionId: extractNumericId(banner.collectionId),
                  categoryName: banner.title,
                },
              });
            }
          };

          const touchStyle = {
            borderTopRightRadius: 16,
            borderTopLeftRadius: 16,
            paddingVertical: 30,
          };

          const content = (
            <>
              <AppImage
                resizeMode={"cover"}
                source={banner.imageUrl}
                width={"100%"}
                height={199}
                style={{
                  borderTopLeftRadius: tokens.radius.md,
                  borderTopRightRadius: tokens.radius.md,
                }}
              />
              <YStack
                padding="$md"
                backgroundColor={"white"}
                borderBottomRightRadius={"$md"}
                borderBottomLeftRadius={"$md"}
                style={SHADOW_STYLES}
              >
                <TextXSRegular color="$icon">
                  Ends in{" "}
                  {banner.endsAt
                    ? new Date(banner.endsAt).toLocaleDateString()
                    : "Limited Time"}
                </TextXSRegular>
                <Spacer size={"$xs-sm"} />

                {/* Main Heading */}
                <TextLGBold color="$darkgrey">{banner.title || ""}</TextLGBold>

                <Spacer size={"$xs-sm"} />
                {/* Description */}
                <ParagraphXS color="$secondary">
                  {banner.subtitle || ""}
                </ParagraphXS>

                <Spacer size={"$md"} />
                {/* Shop Now Button */}
                <SecondaryButton
                  paddingVertical={"xs-sm"}
                  paddingHorizontal={"reg"}
                  width={120}
                  borderColor="$lightgrey"
                  color="$secondary"
                  onPress={handlePress}
                  label={banner.ctaText || "Shop Now"}
                />
                <Spacer size={"$xl"} />
              </YStack>
            </>
          );

          const Touchable = Platform.OS === "android" ? PressableButton : OpTouch;

          return (
            <XStack width={SCREEN_WIDTH}>
              <Spacer size={"$md"} />
              <Touchable
                width={SCREEN_WIDTH - 32}
                style={touchStyle}
                onPress={handlePress}
              >
                {content}
              </Touchable>
              <Spacer size={"$md"} />
            </XStack>
          );
        }}
      />

      {/* Pagination Indicators below carousel */}
      <XStack
        gap={"$sm-reg"}
        paddingHorizontal={"$md"}
        marginTop={"$xs"}
        marginBottom={"$sm"}
        justifyContent="center"
      >
        {Array.from({ length: totalBanners }, (_, dotIndex) => (
          <YStack
            key={`featured-dot-${dotIndex}`}
            width={"$1xl"}
            height={4}
            backgroundColor={
              dotIndex === activeCarouselIndex ? "$primary" : "$lightgrey"
            }
            borderRadius="$md"
          />
        ))}
      </XStack>
    </YStack>
  );
};
