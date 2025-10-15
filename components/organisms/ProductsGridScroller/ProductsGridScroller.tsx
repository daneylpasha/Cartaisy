import { CollectionDisplay } from "@/api/generated/cartaisyAPI.schemas";
import { router } from "expo-router";
import React from "react";
import { FlatList } from "react-native";
import { Spacer, YStack } from "tamagui";
import { GRID_COLUMN_GAP, ProductCard } from "../../molecules/ProductCard";
import { SectionHeader } from "../../molecules/SectionHeader";

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

  return (
    <YStack>
      <SectionHeader
        title={targetCollection?.collection.title || ""}
        tintColor={"darkgrey"}
        image="forYou"
        seeAllText="View All"
        color="primary"
        onPressSeeAll={() => {
          router.push({
            pathname: "/products",
            params: {
              title: targetCollection?.collection.title,
              collectionId: targetCollection?.collection.id || "",
            },
          });
        }}
      />
      <YStack paddingHorizontal="$md">
        <Spacer size={"$reg"} />
        <FlatList
          data={targetCollection?.collection.products}
          keyExtractor={(product, index) =>
            `grid-${product.productId}-${index}`
          }
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
