import { useGetDetailedFavorites } from "@/api/generated/favorites/favorites";
import type { RecordStringAny } from "@/api/generated/cartaisyAPI.schemas";
import { WishlistCard, type WishlistItem } from "@/components/molecules/profile/WishlistCard";
import { SCREEN_WIDTH } from "@/constants/styles";
import useFavoritesStore from "@/store/useFavoritesStore";
import React, { useRef, useState } from "react";
import { FlatList, ViewToken } from "react-native";
import { XStack, YStack } from "tamagui";

type Props = {
  horizontalPadding?: number; // page side padding
};

export function WishlistCarousel({ horizontalPadding = 16 }: Props) {
  // Get detailed favorites with complete product data
  const { data: favoritesData } = useGetDetailedFavorites(
    undefined,
    {
      query: {
        refetchOnMount: "always", // Always refetch when component mounts
        staleTime: 0, // Always consider data stale for immediate updates
      },
    }
  );

  // Get favoriteProductIds from store for client-side filtering
  const favoriteProductIds = useFavoritesStore((state) => state.favoriteProductIds);

  // Use detailed favorites API directly - transform data to match expected schema
  // Also filter by zustand store for instant removal when unfavorited
  const wishlistProducts = React.useMemo(() => {
    const products = favoritesData?.data?.products || [];
    return products
      .filter((product: RecordStringAny) => {
        const productId = product.productId || product.id;
        // Only show products that are still in favoriteProductIds (zustand store)
        return favoriteProductIds.has(String(productId));
      })
      .map((product: RecordStringAny) => ({
        ...product,
        // Convert images from object array to string array for ProductCard compatibility
        images: Array.isArray(product.images)
          ? product.images.map((img: any) =>
              typeof img === 'string' ? img : img?.url
            )
          : [],
        // Ensure productId exists
        productId: product.productId || product.id,
      }));
  }, [favoritesData, favoriteProductIds]);

  const pageWidth = SCREEN_WIDTH;
  const cardWidthOne = pageWidth - horizontalPadding * 2;

  const [activePage, setActivePage] = useState(0);
  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 60,
  }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      const idx = viewableItems?.[0]?.index;
      if (typeof idx === "number") setActivePage(idx);
    }
  ).current;

  // Show only first 4 products
  const displayProducts = wishlistProducts.slice(0, 4);

  return (
    <YStack>
      <YStack position="relative">
        <FlatList<RecordStringAny>
          data={displayProducts}
          keyExtractor={(item) => String(item.productId || item.id || Math.random())}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <XStack justifyContent="center" padding={"$reg"} width={pageWidth}>
              <YStack width={cardWidthOne}>
                <WishlistCard item={item as WishlistItem} />
              </YStack>
            </XStack>
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />

        {/* Absolutely positioned sticky dots */}
        <XStack alignSelf="center" gap={8}>
          {displayProducts.map((_, i) => (
            <YStack
              key={i}
              width={8}
              height={8}
              borderRadius={4}
              backgroundColor={i === activePage ? "$primary" : "$lightgrey"}
            />
          ))}
        </XStack>
      </YStack>
    </YStack>
  );
}
