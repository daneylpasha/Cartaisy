import { ParagraphXS } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextLGBold } from "@/components/atoms/texts/TextLGBold";
import { TextXSRegular } from "@/components/atoms/texts/TextXSRegular";
import { SecondaryButton } from "@/components/molecules/buttons";
import { SCREEN_WIDTH, SHADOW_STYLES } from "@/constants/styles";
import React, { useRef, useState } from "react";
import { FlatList } from "react-native";
import { XStack, YStack } from "tamagui";

// API se Banner data aa raha hai - directly use karte hain
type BannerItem = {
  _id: string;
  imageUrl: string;
  title: string;
  subTitle: string;
  navigateTo?: string;
  position?: number;
  isActive?: boolean;
  label?: string;
  discount?: string;
  buttonText?: string;
};

type FeaturedPromotionsCarouselProps = {
  item?: BannerItem[];
};

export const FeaturedPromotionsCarousel = ({
  item,
}: FeaturedPromotionsCarouselProps) => {
  // ✅ If no data provided, hide component completely
  if (!item || item.length === 0) {
    return null;
  }

  const totalBanners = item.length;
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const carouselRef = useRef<FlatList>(null);

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.[0]?.index != null) setActiveCarouselIndex(viewableItems[0].index);
  }).current;

  React.useEffect(() => {
    if (item.length <= 1) return; // Don't auto-scroll if only one item

    const autoScrollInterval = setInterval(() => {
      setActiveCarouselIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= item.length) {
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
  }, [item.length]);

  return (
    <YStack position="relative">
      <FlatList
        ref={carouselRef}
        data={item || []}
        keyExtractor={(banner) => banner._id}
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
        renderItem={({ item: banner }) => (
          <XStack width={SCREEN_WIDTH}>
            <Spacer size={"$md"} />
            <OpTouch
              width={SCREEN_WIDTH - 32}
              style={{
                borderTopRightRadius: 16,
                borderTopLeftRadius: 16,

                // elevation:1,
                paddingVertical: 30,
              }}
            >
              <AppImage
                resizeMode={"cover"}
                source={banner.imageUrl}
                width={"100%"}
                height={199}
                style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
              />
              <YStack
                padding="$md"
                backgroundColor={"white"}
                borderBottomRightRadius={"$md"}
                borderBottomLeftRadius={"$md"}
                style={SHADOW_STYLES}
              >
                <TextXSRegular color="$icon">
                  Ends in {banner.label || "Limited Time"}
                </TextXSRegular>
                <Spacer size={"$xs-sm"} />

                {/* Main Heading */}
                <TextLGBold color="$darkgrey">{banner.title || ""}</TextLGBold>

                <Spacer size={"$xs-sm"} />
                {/* Description */}
                <ParagraphXS color="$secondary">
                  {banner.subTitle || ""}
                </ParagraphXS>

                <Spacer size={"$md"} />
                {/* Shop Now Button */}
                <SecondaryButton
                  paddingVertical={"xs-sm"}
                  paddingHorizontal={"reg"}
                  width={120}
                  borderColor="$lightgrey"
                  color="$secondary"
                  onPress={() => {}}
                  label={banner.buttonText || "Shop Now"}
                />
                <Spacer size={"$xl"} />
              </YStack>
            </OpTouch>
            <Spacer size={"$md"} />
          </XStack>
        )}
      />

      {/* Fixed Pagination Indicators outside carousel */}
      <XStack
        gap={"$sm-reg"}
        position="absolute"
        bottom={50}
        left={32}
        zIndex={10}
      >
        {Array.from({ length: totalBanners }, (_, dotIndex) => (
          <YStack
            key={dotIndex}
            width={"$1xl"}
            height={4}
            backgroundColor={dotIndex === activeCarouselIndex ? "$primary" : "$lightgrey"}
            borderRadius="$md"
          />
        ))}
      </XStack>
    </YStack>
  );
};
