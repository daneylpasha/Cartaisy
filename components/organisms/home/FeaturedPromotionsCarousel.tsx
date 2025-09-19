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

type FeaturedPromotionItem = {
  id: number;
  image: string;
  title: string;
  description: string;
  discount: string;
  dealEnds: string;
};

type FeaturedPromotionsCarouselProps = {
  item: FeaturedPromotionItem[];
};

export const FeaturedPromotionsCarousel = ({
  item,
}: FeaturedPromotionsCarouselProps) => {
  const totalLength = item.length;
  const [indexx, setIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.[0]?.index != null) setIndex(viewableItems[0].index);
  }).current;
  React.useEffect(() => {
    if (item.length <= 1) return; // Don't auto-scroll if only one item

    const interval = setInterval(() => {
      setIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= item.length) {
          // Reset to first card when reaching the end
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: 0, animated: true });
          }, 100);
          return 0;
        } else {
          // Move to next card
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: nextIndex,
              animated: true,
            });
          }, 100);
          return nextIndex;
        }
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [item.length]);

  return (
    <YStack position="relative">
      <FlatList
        ref={flatListRef}
        data={item}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
          waitForInteraction: true,
          minimumViewTime: 300,
        }}
        renderItem={({ item }) => (
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
                name={item.image}
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
                  Ends in {item.dealEnds}
                </TextXSRegular>
                <Spacer size={"$xs-sm"} />

                {/* Main Heading */}
                <TextLGBold color="$darkgrey">
                  Sale: {item.title} {item.discount}OFF!
                </TextLGBold>

                <Spacer size={"$xs-sm"} />
                {/* Description */}
                <ParagraphXS color="$secondary">{item.description}</ParagraphXS>

                <Spacer size={"$md"} />
                {/* Shop Now Button */}
                <SecondaryButton
                  paddingVertical={"xs-sm"}
                  paddingHorizontal={"reg"}
                  width={120}
                  borderColor="$lightgrey"
                  color="$secondary"
                  onPress={() => {}}
                  label="Shop Now"
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
        {Array.from({ length: totalLength }, (_, index) => (
          <YStack
            key={index}
            width={"$1xl"}
            height={4}
            backgroundColor={index === indexx ? "$primary" : "$lightgrey"}
            borderRadius="$md"
          />
        ))}
      </XStack>
    </YStack>
  );
};
