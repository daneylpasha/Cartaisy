import { CollectionDisplay } from "@/api/generated/cartaisyAPI.schemas";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { tokens } from "@/tamagui/token";
import React from "react";
import { FlatList } from "react-native";
import { Spacer, YStack } from "tamagui";
import { ProductCard } from "../../molecules/ProductCard";

type ProductsHorizontalScrollerProps = {
  collections?: CollectionDisplay[];
};

const ProductsHorizontalScroller = ({
  collections,
}: ProductsHorizontalScrollerProps) => {
  const targetCollection = collections?.find(
    (collectionItem) => collectionItem.type === "large_row"
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
        image="dealIcon"
        seeAllText="View All"
        color="primary"
        onPressSeeAll={() => {}}
      />
      <Spacer size={"$xl"} />
      <FlatList
        data={products}
        keyExtractor={(product, index) => `product-${product.id}-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: tokens.space.md,
          gap: tokens.space.md,
        }}
        renderItem={({ item: product }) => (
          <ProductCard product={product} context="in-line" />
        )}
      />
    </YStack>
  );
};

export default ProductsHorizontalScroller;
