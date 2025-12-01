import { tokens } from "@/tamagui/token";
import React from "react";
import { FlatList } from "react-native";
import { Spacer, YStack } from "tamagui";

import { CollectionDisplay } from "@/api/generated/cartaisyAPI.schemas";
import { extractNumericId } from "@/utils/extractNumericId";
import { router } from "expo-router";
import { ProductCard } from "../../molecules/ProductCard";
import { SectionHeader } from "../../molecules/SectionHeader";

type SalesHorizontalScrollerProps = {
  collection?: CollectionDisplay[];
};

const SalesHorizontalScroller = ({
  collection: collections,
}: SalesHorizontalScrollerProps) => {
  const targetCollection = collections?.find(
    (collectionItem) => collectionItem.type === "medium_row"
  );

  if (!targetCollection) {
    return null;
  }

  const { products, title } = targetCollection.collection;

  return (
    <YStack>
      <SectionHeader
        title={title}
        tintColor={"darkgrey"}
        image="flash"
        seeAllText="View All"
        color="primary"
        onPressSeeAll={() => {
          router.push({
            pathname: "/products",
            params: {
              categoryName: title,
              collectionId: extractNumericId(targetCollection?.collection.id),
            },
          });
        }}
      />
      <Spacer size={"$reg"} />
      <FlatList
        data={products}
        keyExtractor={(product, index) => `sales-${product.productId}-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: tokens.space.md,
          gap: tokens.space.md,
        }}
        renderItem={({ item: product }) => (
          <ProductCard
            product={product}
            context="grid"
            showProgressBar={true}
          />
        )}
      />
    </YStack>
  );
};

export default SalesHorizontalScroller;
