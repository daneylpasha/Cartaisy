import { useCollectionWithProducts } from "@/api/hooks/useProducts";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { tokens } from "@/tamagui/token";
import React from "react";
import { FlatList } from "react-native";
import { Spacer, YStack } from "tamagui";
import { ProductCard } from "../../molecules/ProductCard";
import { Placeholder } from "./Placeholder";

type CollectionDisplay = {
  _id: string;
  type: string;
  title: string;
  collectionId: string;
};

type ProductsHorizontalScrollerProps = {
  collection?: CollectionDisplay[];
};

const ProductsHorizontalScroller = ({
  collection: collections,
}: ProductsHorizontalScrollerProps) => {
  const targetCollection = collections?.find(
    (collectionItem) => collectionItem.type === "large_row"
  );

  const { data: collectionData, isLoading } = useCollectionWithProducts(
    targetCollection?.collectionId
  );

  if (isLoading) {
    return <Placeholder />;
  }

  if (!targetCollection || !collectionData?.products) {
    return null;
  }

  return (
    <YStack>
      <SectionHeader
        title={collectionData.title || targetCollection.title}
        tintColor={"darkgrey"}
        image="dealIcon"
        seeAllText="View All"
        color="primary"
        onPressSeeAll={() => {}}
      />
      <Spacer size={"$xl"} />
      <FlatList
        data={collectionData.products}
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
