import React from "react";
import { FlatList } from "react-native";
import { CollectionCard } from "../molecules/CollectionCard";
import { GRID_COLUMN_GAP, GRID_SIDE_PADDING } from "../molecules/ProductCard";

const collectionData = [
  { id: "1", image: "productForyou1" as const, name: "Video Games" },
  { id: "2", image: "productForyou2" as const, name: "Game Console" },
  { id: "3", image: "productForyou3" as const, name: "Electronics" },
  { id: "4", image: "productForyou4" as const, name: "Baby" },
];
const CollectionsCardGrid = () => {
  return (
    <FlatList
      data={collectionData}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={{
        paddingHorizontal: GRID_SIDE_PADDING,
      }}
      columnWrapperStyle={{
        gap: GRID_COLUMN_GAP,
        marginBottom: GRID_COLUMN_GAP,
      }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => <CollectionCard item={item} />}
    />
  );
};

export default CollectionsCardGrid;
