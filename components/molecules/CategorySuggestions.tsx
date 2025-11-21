import { CategoryCollectionGridItem } from "@/api/generated/cartaisyAPI.schemas";
import { SCREEN_WIDTH } from "@/constants/styles";
import { tokens } from "@/tamagui/token";
import { router } from "expo-router";
import React from "react";
import { FlatList, ImageBackground, StyleSheet } from "react-native";
import { Spacer, XStack, YStack } from "tamagui";
import { ParagraphMD, TextMDMedium } from "../atoms";
import { OpTouch } from "../atoms/OpTouch";
import { SectionHeader } from "./SectionHeader";

type CategorySuggestionsProps = {
  categoryCollectionGrid?: CategoryCollectionGridItem[];
  onCollectionClick?: (collectionId: string, collectionTitle: string) => void;
};

const itemWidth = (SCREEN_WIDTH - 56) / 3;

export const CategorySuggestions = ({
  categoryCollectionGrid: gridItems,
  onCollectionClick,
}: CategorySuggestionsProps) => {
  if (!gridItems || gridItems.length === 0) {
    return null;
  }

  const primaryGridItem = gridItems[0];
  const sectionTitle = primaryGridItem?.title || "";
  const sectionSubtitle = primaryGridItem?.subtitle || "";
  const allCategoryCollections = gridItems.flatMap(
    (gridItem) => gridItem.collections
  );

  if (allCategoryCollections.length === 0) {
    return null;
  }

  return (
    <>
      <SectionHeader
        title={sectionTitle}
        tintColor={"darkgrey"}
        image="bulb"
        color="primary"
      />
      <Spacer size={"$sm"} />
      <ParagraphMD paddingHorizontal="$md">{sectionSubtitle}</ParagraphMD>
      <Spacer size={"$reg"} />
      <YStack paddingHorizontal="$md">
        <FlatList
          data={allCategoryCollections}
          keyExtractor={(collection, collectionIndex) =>
            `${collection.collectionId}-${collectionIndex}`
          }
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
          renderItem={({ item: categoryCollection }) => (
            <OpTouch
              width={itemWidth}
              onPress={() => {
                // Call the callback to log the collection click
                onCollectionClick?.(
                  categoryCollection.collectionId,
                  categoryCollection.title
                );

                router.push({
                  pathname: "/products",
                  params: {
                    collectionId: categoryCollection.collectionId,
                    categoryName: categoryCollection.title,
                  },
                });
              }}
            >
              <ImageBackground
                source={{ uri: categoryCollection.image }}
                resizeMode="cover"
                style={[styles.image, { marginBottom: tokens.space.sm }]}
              >
                <XStack
                  justifyContent="center"
                  alignItems="center"
                  width="100%"
                  height="100%"
                  backgroundColor="rgba(0, 0, 0, 0.4)"
                >
                  <TextMDMedium
                    color="$white"
                    fontSize={14}
                    fontWeight={600}
                    textAlign="center"
                  >
                    {categoryCollection.title}
                  </TextMDMedium>
                </XStack>
              </ImageBackground>
            </OpTouch>
          )}
        />
      </YStack>
    </>
  );
};

const styles = StyleSheet.create({
  image: {
    width: itemWidth,
    height: 50,
    borderRadius: tokens.radius.md,
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
