import { useCollectionWithProducts } from "@/api/hooks/useProducts";
import { tokens } from "@/tamagui/token";
import React from "react";
import { FlatList } from "react-native";
import { Spacer, YStack } from "tamagui";

import { ProductCard } from "../../molecules/ProductCard";
import { SectionHeader } from "../../molecules/SectionHeader";
import Placeholder from "./Placeholder";

type CollectionDisplay = {
  _id: string;
  type: string;
  title: string;
  collectionId: string;
};

type SalesHorizontalScrollerProps = {
  collection?: CollectionDisplay[];
};

const SalesHorizontalScroller = ({
  collection: collections,
}: SalesHorizontalScrollerProps) => {
  const targetCollection = collections?.find(
    (collectionItem) => collectionItem.type === "medium_row"
  );

  const { data: collectionData, isLoading } = useCollectionWithProducts(
    targetCollection?.collectionId
  );

  if (!targetCollection) {
    return null;
  }

  if (isLoading) {
    return <Placeholder />;
  }

  if (!collectionData?.products) {
    return null;
  }

  return (
    <YStack>
      <SectionHeader
        title={collectionData.title || targetCollection.title}
        tintColor={"darkgrey"}
        image="flash"
        seeAllText="View All"
        color="primary"
        onPressSeeAll={() => null}
      />
      <Spacer size={"$reg"} />
      <FlatList
        data={collectionData.products}
        keyExtractor={(product) => product.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: tokens.space.md,
          gap: tokens.space.md,
        }}
        renderItem={({ item: product }) => (
          <ProductCard product={product} context="grid" />
        )}
      />
    </YStack>
  );
};

export default SalesHorizontalScroller;
