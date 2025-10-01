import { useCollectionWithProducts } from "@/api/hooks/useProducts";
import React from "react";
import { FlatList } from "react-native";
import { Spacer, YStack } from "tamagui";
import { GRID_COLUMN_GAP, ProductCard } from "../../molecules/ProductCard";
import { SectionHeader } from "../../molecules/SectionHeader";
import Placeholder from "./Placeholder";

type CollectionDisplay = {
  _id: string;
  type: string;
  title: string;
  collectionId: string;
};

type ProductsGridScrollerProps = {
  collection?: CollectionDisplay[];
};

const numColumns = 2;
const ProductsGridScroller = ({
  collection: collections,
}: ProductsGridScrollerProps) => {
  const targetCollection = collections?.find(
    (collectionItem) => collectionItem.type === "small_grid"
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
        image="forYou"
        seeAllText="View All"
        color="primary"
        onPressSeeAll={() => {}}
      />
      <YStack paddingHorizontal="$md">
        <Spacer size={"$reg"} />
        <FlatList
          data={collectionData.products}
          keyExtractor={(product) => product.id.toString()}
          horizontal={false}
          numColumns={numColumns}
          showsHorizontalScrollIndicator={false}
          columnWrapperStyle={{
            columnGap: GRID_COLUMN_GAP,
          }}
          renderItem={({ item: product }) => (
            <ProductCard
              product={product}
              context="grid"
              showFavoriteIcon={true}
              isFavorite={true}
            />
          )}
        />
      </YStack>
    </YStack>
  );
};

export default ProductsGridScroller;
