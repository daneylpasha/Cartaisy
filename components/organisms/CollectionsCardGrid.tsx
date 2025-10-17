import { CollectionShowcaseItem } from "@/api/generated/cartaisyAPI.schemas";
import React from "react";
import { FlatList } from "react-native";
import { Spacer, YStack } from "tamagui";
import { CollectionCard } from "../molecules/CollectionCard";
import { GRID_COLUMN_GAP, GRID_SIDE_PADDING } from "../molecules/ProductCard";
import { SectionHeader } from "../molecules/SectionHeader";

type CollectionsCardGridProps = {
  collectionShowcases?: CollectionShowcaseItem[];
};

const CollectionsCardGrid = ({
  collectionShowcases: showcases,
}: CollectionsCardGridProps) => {
  // Filter collections by type 'grid' and get the first one
  const targetShowcase = showcases?.find(
    (showcase) => showcase.type === "grid"
  );

  // If no grid collection found, return null or fallback
  if (!targetShowcase) {
    return null;
  }

  return (
    <YStack>
      <SectionHeader
        title={targetShowcase.title}
        tintColor={"darkgrey"}
        image="computer"
        seeAllText="View All"
        color="primary"
        onPressSeeAll={() => {}}
      />
      <YStack paddingHorizontal="$md">
        <Spacer size={"$reg"} />
        <FlatList
          data={targetShowcase.collections}
          keyExtractor={(collection, index) =>
            `${collection.collectionId}-${index}`
          }
          numColumns={2}
          contentContainerStyle={{
            paddingHorizontal: GRID_SIDE_PADDING,
          }}
          columnWrapperStyle={{
            gap: GRID_COLUMN_GAP,
            marginBottom: GRID_COLUMN_GAP,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: collection }) => (
            <CollectionCard item={collection} />
          )}
        />
      </YStack>
    </YStack>
  );
};

export default CollectionsCardGrid;
