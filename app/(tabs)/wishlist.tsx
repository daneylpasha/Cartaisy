import { HeadingSMBold, TextXLBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Spacer } from "@/components/atoms/Spacer";
import { t } from "@/translations";
import { FlatList, LayoutAnimation, Platform, UIManager } from "react-native";

import { useGetDetailedFavorites } from "@/api/generated/favorites/favorites";
import { Loader } from "@/components/atoms/Loader";
import { OpTouch } from "@/components/atoms/OpTouch";
import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { ParagraphSM } from "@/components/atoms/texts/ParagraphSM";
import { ProductCard } from "@/components/molecules/ProductCard";
import useFavoritesStore from "@/store/useFavoritesStore";
import { tokens } from "@/tamagui/token";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { YStack } from "tamagui";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const sidePadding = tokens.space.md;
const columnGap = tokens.space.md;

// Memoized render item component to prevent re-renders
const WishlistItem = React.memo(
  ({
    item,
    isFavorite,
  }: {
    item: any;
    isFavorite: (id: string) => boolean;
  }) => (
    <ProductCard
      product={item}
      context="grid"
      showProgressBar={false}
      showFavoriteIcon={true}
      isFavorite={isFavorite(item.productId)}
    />
  )
);

const WishlistScreen = () => {
  const { bottom: BOTTOM_INSET } = useSafeAreaInsets();
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const favoriteProductIds = useFavoritesStore(
    (state) => state.favoriteProductIds
  );

  // Get detailed favorites with complete product data
  const { data: favoritesData, isLoading } = useGetDetailedFavorites(
    {
      page: 1,
      limit: 100,
    },
    {
      query: {
        refetchOnMount: "always", // Always refetch when component mounts
        staleTime: 0, // Always consider data stale for immediate updates
      },
    }
  );

  // Use detailed favorites API directly - backend returns complete product details
  // Transform the data to match Product schema (images as string array)
  // Also filter by zustand store for instant removal when unfavorited
  const favoriteProducts = React.useMemo(() => {
    const products = favoritesData?.data?.products || [];
    return products
      .filter((product: any) => {
        const productId = product.productId || product.id;
        // Only show products that are still in favoriteProductIds (zustand store)
        return favoriteProductIds.has(productId);
      })
      .map((product: any) => ({
        ...product,
        // Convert images from object array to string array
        images: Array.isArray(product.images)
          ? product.images.map((img: any) =>
              typeof img === 'string' ? img : img.url
            )
          : [],
        // Ensure productId exists
        productId: product.productId || product.id,
      }));
  }, [favoritesData, favoriteProductIds]);

  // Track previous count to detect removal (not initial load)
  const prevCountRef = React.useRef(favoriteProducts.length);

  // Animate layout when favoriteProducts change (when item is removed)
  useEffect(() => {
    const currentCount = favoriteProducts.length;
    const prevCount = prevCountRef.current;

    // Only animate if count decreased (item removed) and not initial load
    if (!isLoading && currentCount < prevCount && prevCount > 0) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }

    // Update ref for next comparison
    prevCountRef.current = currentCount;
  }, [favoriteProducts.length, isLoading]);

  // Memoized render function
  const renderItem = React.useCallback(
    ({ item }: { item: any }) => (
      <WishlistItem item={item} isFavorite={isFavorite} />
    ),
    [isFavorite]
  );

  // Memoized key extractor
  const keyExtractor = React.useCallback(
    (item: any, index: number) => `wishlist-${item.productId || item.id || index}`,
    []
  );

  // Render empty wishlist state
  const renderEmptyWishlist = () => (
    <YStack alignItems="center" justifyContent="center" flex={1}>
      <YStack>
        <AppImage
          name="wishlistFrame"
          width={215}
          height={144}
          tintColor={tokens.color.primary}
        />
      </YStack>
      <Spacer size={"$lg"} />
      <TextXLBold>{t("wishlist.title")}</TextXLBold>
      <Spacer size={"$reg"} />
      <ParagraphSM color="$secondary">{t("wishlist.subtitle")}</ParagraphSM>
      <Spacer size={"$reg"} />
      <OpTouch
        onPress={() => {
          router.push("/(tabs)");
        }}
      >
        <ParagraphSM color="$primary">{"Start Shopping"}</ParagraphSM>
      </OpTouch>
    </YStack>
  );

  // Show loading state
  if (isLoading) {
    return (
      <ScreenContainer backgroundColor="$background">
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Loader size="large" color="$primary" />
        </YStack>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer backgroundColor="$background">
      <YStack
        justifyContent="center"
        alignItems="center"
        paddingHorizontal={"$md"}
      >
        <Spacer size={"$lg"} />
        <HeadingSMBold>{"My Wishlist"}</HeadingSMBold>
        <Spacer size={"$lg"} />
      </YStack>

      {favoriteProducts.length === 0 ? (
        renderEmptyWishlist()
      ) : (
        <YStack paddingHorizontal={"$md"}>
          <FlatList
            data={favoriteProducts}
            horizontal={false}
            numColumns={2}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            extraData={favoriteProducts.length}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={Platform.OS === "android"}
            maxToRenderPerBatch={4}
            windowSize={5}
            initialNumToRender={6}
            updateCellsBatchingPeriod={50}
            contentContainerStyle={{
              paddingBottom: BOTTOM_INSET + 90,
            }}
            columnWrapperStyle={{
              columnGap: columnGap,
              paddingBottom: tokens.space.md,
            }}
          />
        </YStack>
      )}
    </ScreenContainer>
  );
};

export default WishlistScreen;
