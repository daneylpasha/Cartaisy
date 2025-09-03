import Icons from "@/assets/Icons";
import { SCREEN_WIDTH } from "@/constants/styles";
import { tokens } from "@/tamagui/token";
import { BlurView } from "expo-blur";
import React from "react";
import { FlatList, ImageBackground, StyleSheet } from "react-native";
import { Spacer, XStack } from "tamagui";
import { TextMDMedium } from "../atoms";
import { OpTouch } from "../atoms/OpTouch";

const itemWidth = (SCREEN_WIDTH - 56) / 3;
const categorySuggestionsData = [
  {
    id: 1,
    image: Icons.category1,
    title: "Personal Care",
  },
  {
    id: 2,
    image: Icons.category2,
    title: "Automotive",
  },
  {
    id: 3,
    image: Icons.category3,
    title: "Electronics",
  },
  {
    id: 4,
    image: Icons.category4,
    title: "Health & Fitness",
  },
  {
    id: 5,
    image: Icons.category2,
    title: "Health & Fitness",
  },
];
export const CategorySuggestions = () => {
  return (
    <FlatList
      data={categorySuggestionsData}
      numColumns={3}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
      contentContainerStyle={{
        paddingHorizontal: tokens.space.md,
        paddingVertical: tokens.space.sm,
      }}
      ItemSeparatorComponent={() => <Spacer size={"$reg"} />}
      columnWrapperStyle={{
        gap: tokens.space.reg,
      }}
      renderItem={({ item, index }) => (
        <OpTouch>
          <ImageBackground
            source={item.image}
            resizeMode="cover"
            style={[styles.image, { marginBottom: tokens.space.sm }]}
          >
            {/* <BlurView style={styles.blurview} intensity={14} tint="dark">
              
            </BlurView> */}
            <XStack
              justifyContent="center"
              alignItems="center"
              width="100%"
              height="100%"
              backgroundColor="rgba(0, 0, 0, 0.4)"
            >
            <TextMDMedium color="$white" fontSize={14} fontWeight={600} textAlign="center">
                {item.title}
              </TextMDMedium>
            </XStack>
          </ImageBackground>
        </OpTouch>
      )}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: itemWidth,
    height: 50,
    borderRadius: 12,
    overflow: "hidden",
  },
  blurview: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
});
