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

  const { products, id, title } = targetCollection.collection;
  const handleViewAll = () => {
    router.push({
      pathname: "/products",
      params: {
        collectionId: id,
        collectionTitle: title
      },
    });
  };
  return (
    <YStack>
      <SectionHeader
        title={title}
        tintColor={"darkgrey"}
        image="dealIcon"
        seeAllText="View All"
        color="primary"
        onPressSeeAll={handleViewAll}
      />
      <Spacer size={"$xl"} />
      <FlatList
        data={products}
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
