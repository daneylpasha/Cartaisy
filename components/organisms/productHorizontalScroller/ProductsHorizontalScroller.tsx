import { CollectionDisplay } from "@/api/generated/cartaisyAPI.schemas";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import useFavoritesStore from "@/store/useFavoritesStore";
import { tokens } from "@/tamagui/token";
import { extractNumericId } from "@/utils/extractNumericId";
import { router } from "expo-router";
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
  // Only subscribe to favoriteProductIds (avoid double subscription to isFavorite function)
  // Use the Set directly for better performance and pass it as extraData
  const favoriteProductIds = useFavoritesStore((state) => state.favoriteProductIds);
  const targetCollection = collections?.find(
    (collectionItem) => collectionItem.type === "large_row"
  );

  const handleViewAll = React.useCallback(() => {
    router.push({
      pathname: "/products",
      params: {
        categoryName: targetCollection?.collection.title,
        collectionId: extractNumericId(targetCollection?.collection.id),
      },
    });
  }, [targetCollection]);

  if (!targetCollection) {
    return null;
  }

  return (
    <YStack>
      <SectionHeader
        title={targetCollection?.collection.title || ""}
        tintColor={"darkgrey"}
        image="dealIcon"
        seeAllText="View All"
        color="primary"
        onPressSeeAll={handleViewAll}
      />
      <Spacer size={"$reg"} />
      <FlatList
        data={targetCollection?.collection.products}
        keyExtractor={(product, index) =>
          `product-${product.productId}-${index}`
        }
        horizontal
        showsHorizontalScrollIndicator={false}
        extraData={favoriteProductIds}
        contentContainerStyle={{
          paddingHorizontal: tokens.space.md,
          gap: tokens.space.md,
        }}
        renderItem={({ item: product }) => (
          <ProductCard
            product={product}
            context="in-line"
            showFavoriteIcon={true}
            isFavorite={favoriteProductIds.has(product.productId)}
          />
        )}
      />
    </YStack>
  );
};

export default ProductsHorizontalScroller;
