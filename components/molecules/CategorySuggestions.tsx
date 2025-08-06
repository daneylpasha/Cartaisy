import { SCREEN_WIDTH } from "@/constants/styles";
import { tokens } from "@/tamagui/token";
import React from "react";
import { FlatList, ImageBackground } from "react-native";
import { XStack } from "tamagui";
import { TextMDMedium } from "../atoms";
import { OpTouch } from "../atoms/OpTouch";

type CategorySuggestionsProps = {
  item: {
    id: number;
    image: any;
    title: string;
  }[];
};

const itemWidth = (SCREEN_WIDTH - 56) / 3; // 48 = 16px padding on each side + 16px gap between items

export const CategorySuggestions = ({ item }: CategorySuggestionsProps) => {
  return (
    <FlatList
      data={item}
      numColumns={3}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: tokens.space.md,
        gap: tokens.space.reg,
      }}
      columnWrapperStyle={{ gap: 12 }}
      renderItem={({ item }) => (
        <OpTouch>
          <ImageBackground
            source={item.image}
            resizeMode="contain"
            style={{
              width: itemWidth,
              height: 50,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <XStack
              justifyContent="center"
              alignItems="center"
              width="100%"
              height="100%"
              backgroundColor="rgba(0, 0, 0, 0.4)"
            >
              <TextMDMedium color="$white" fontSize={14} textAlign="center">
                {item.title}
              </TextMDMedium>
            </XStack>
          </ImageBackground>
        </OpTouch>
      )}
    />
  );
};
