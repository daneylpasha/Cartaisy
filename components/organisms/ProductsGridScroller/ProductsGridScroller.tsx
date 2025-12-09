import { CollectionDisplay } from "@/api/generated/cartaisyAPI.schemas";
import useFavoritesStore from "@/store/useFavoritesStore";
import { extractNumericId } from "@/utils/extractNumericId";
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
  // Subscribe to both isFavorite function AND favoriteProductIds to trigger re-render when favorites change
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const favoriteProductIds = useFavoritesStore((state) => state.favoriteProductIds);
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
              categoryName: targetCollection?.collection.title,
              collectionId: extractNumericId(targetCollection?.collection.id),
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
          extraData={favoriteProductIds}
          columnWrapperStyle={{
            columnGap: GRID_COLUMN_GAP,
          }}
          renderItem={({ item: product }) => (
            <ProductCard
              product={product}
              context="grid"
              showFavoriteIcon={true}
              isFavorite={isFavorite(product.productId)}
            />
          )}
        />
      </YStack>
    </YStack>
  );
};

export default ProductsGridScroller;
