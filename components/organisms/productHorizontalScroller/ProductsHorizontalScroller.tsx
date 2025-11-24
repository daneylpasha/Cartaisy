import { CollectionDisplay } from "@/api/generated/cartaisyAPI.schemas";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import useFavoritesStore from "@/store/useFavoritesStore";
import { tokens } from "@/tamagui/token";
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
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const targetCollection = collections?.find(
    (collectionItem) => collectionItem.type === "large_row"
  );

  if (!targetCollection) {
    return null;
  }

  const handleViewAll = () => {
    router.push({
      pathname: "/products",
      params: {
        categoryName: targetCollection?.collection.title,
        collectionId: targetCollection?.collection.id || "",
      },
    });
  };
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
      <Spacer size={"$xl"} />
      <FlatList
        data={targetCollection?.collection.products}
        keyExtractor={(product, index) =>
          `product-${product.productId}-${index}`
        }
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: tokens.space.md,
          gap: tokens.space.md,
        }}
        renderItem={({ item: product }) => (
          <ProductCard
            product={product}
            context="in-line"
            showFavoriteIcon={true}
            isFavorite={isFavorite(product.productId)}
          />
        )}
      />
    </YStack>
  );
};

export default ProductsHorizontalScroller;
