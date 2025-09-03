import {
  WishlistCard,
  WishlistItem,
} from "@/components/molecules/profile/WishlistCard";
import { SCREEN_WIDTH } from "@/constants/styles";
import React, { useRef, useState } from "react";
import { FlatList, ViewToken } from "react-native";
import { XStack, YStack } from "tamagui";

type Props = {
  horizontalPadding?: number; // page side padding
};

export function WishlistCarousel({ horizontalPadding = 16 }: Props) {
  const data: WishlistItem[] = [
    {
      id: "1",
      title: "Wishlist #1",
      subtitleLeft: "Default",
      subtitleRight: "24 Items",
      saleCount: 3,
    },
    {
      id: "2",
      title: "Wishlist #2",
      subtitleLeft: "Default",
      subtitleRight: "12 Items",
      saleCount: 1,
    },
    {
      id: "3",
      title: "Wishlist #3",
      subtitleLeft: "Travel",
      subtitleRight: "9 Items",
      saleCount: 0,
    },
    {
      id: "4",
      title: "Wishlist #4",
      subtitleLeft: "Gifts",
      subtitleRight: "18 Items",
      saleCount: 5,
    },
  ];

  const pageWidth = SCREEN_WIDTH;
  const cardWidthOne = pageWidth - horizontalPadding * 2;

  const [activePage, setActivePage] = useState(0);
  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 60,
  }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      const idx = viewableItems?.[0]?.index;
      if (typeof idx === "number") setActivePage(idx);
    }
  ).current;

  return (
    <YStack>
      <YStack position="relative">
        <FlatList
          data={data}
          keyExtractor={(_, idx) => `page-${idx}`}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: page }) => (
            <XStack justifyContent="center" padding={"$reg"} width={pageWidth}>
              <YStack width={cardWidthOne}>
                <WishlistCard item={page} />
              </YStack>
            </XStack>
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
        
        {/* Absolutely positioned sticky dots */}
        <XStack 
          position="absolute" 
          bottom={30} 
          alignSelf="center" 
          gap={8}
          zIndex={10}

        >
          {data.map((_, i) => (
            <YStack
              key={i}
              width={8}
              height={8}
              borderRadius={4}
              backgroundColor={i === activePage ? "#6D4AFF" : "#D9D9E0"}
            />
          ))}
        </XStack>
      </YStack>
    </YStack>
  );
}
