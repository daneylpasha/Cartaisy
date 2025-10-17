import { Spacer } from "@/components/atoms/Spacer";
import { PlpOptions } from "@/components/molecules/product/plp/PlpOptions";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

import {
  CollectionFacets,
  CollectionProduct,
  Product,
  ProductCollectionSortKey,
} from "@/api/generated/cartaisyAPI.schemas";
import { useGetCollectionProducts } from "@/api/generated/collections/collections";
import { HeadingXSBold, Loader, TextMDSemiBold } from "@/components/atoms";
import { Divider } from "@/components/atoms/Divider";
import { OpTouch } from "@/components/atoms/OpTouch";
import { PrimaryButton } from "@/components/molecules/buttons";
import { ProductCard } from "@/components/molecules/ProductCard";
import {
  FilterBottomSheetContent,
  FilterState,
} from "@/components/organisms/product/FilterBottomSheetContant";
import { tokens } from "@/tamagui/token";
import { t } from "@/translations";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, RefreshControl } from "react-native";
import { getTokenValue, Text, XStack, YStack } from "tamagui";

const sidePadding = tokens.space.md;
const columnGap = tokens.space.md;

const extractNumericId = (gid: string): string => {
  // If it's already numeric, return as is
  if (!gid.includes("gid://")) {
    return gid;
  }

  const parts = gid.split("/");
  return parts[parts.length - 1];
};

const mapCollectionProductToProduct = (
  collectionProduct: CollectionProduct
): Product => {
  return {
    productId: extractNumericId(collectionProduct.id),
    title: collectionProduct.title,
    description: collectionProduct.description,
    images: collectionProduct.images.map((img) => img.url),
    price: collectionProduct.minPrice,
    compareAtPrice: collectionProduct.compareAtPrice ?? undefined,
    currency: collectionProduct.currency,
    inStock: collectionProduct.availableForSale,
    availableQuantity: collectionProduct.totalInventory,
    totalQuantity: collectionProduct.totalInventory,
    rating: 0,
    reviewsCount: 0,
    handle: collectionProduct.handle,
    vendor: collectionProduct.vendor,
    tags: collectionProduct.tags,
  };
};

const PlpScreen = () => {
  const { categoryName, collectionId } = useLocalSearchParams<{
    categoryName: string;
    collectionId: string;
  }>();

  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    sort: "",
    categories: [],
    priceRange: [0, 1000],
    colors: [],
    vendors: [],
    tags: [],
  });

  const [pendingFilters, setPendingFilters] = useState<FilterState>({
    sort: "",
    categories: [],
    priceRange: [0, 1000],
    colors: [],
    vendors: [],
    tags: [],
  });

  // Pagination state
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Store initial facets (from first load without filters) - for filter modal
  const [initialFacets, setInitialFacets] = useState<
    CollectionFacets | undefined
  >(undefined);

  // Store initial price range separately to ensure it never changes
  const [initialPriceRange, setInitialPriceRange] = useState<
    { min: number; max: number } | undefined
  >(undefined);

  // Convert filter state to API params
  const getSortParams = () => {
    if (appliedFilters.sort === "PRICE_LOW_TO_HIGH") {
      return { sortKey: "PRICE" as const, reverse: false };
    } else if (appliedFilters.sort === "PRICE_HIGH_TO_LOW") {
      return { sortKey: "PRICE" as const, reverse: true };
    } else if (appliedFilters.sort) {
      return { sortKey: appliedFilters.sort as any, reverse: undefined };
    }
    return { sortKey: undefined, reverse: undefined };
  };

  const { sortKey, reverse } = getSortParams();

  // Build filters JSON string for API
  const buildFiltersParam = (): string | undefined => {
    const filters: any[] = [];

    if (appliedFilters.categories.length > 0) {
      filters.push({
        productType: appliedFilters.categories,
      });
    }

    // Add color filters
    if (appliedFilters.colors.length > 0) {
      filters.push({
        variantOption: {
          name: "Color",
          value: appliedFilters.colors,
        },
      });
    }

    // Add vendor filters
    if (appliedFilters.vendors && appliedFilters.vendors.length > 0) {
      filters.push({
        productVendor: appliedFilters.vendors,
      });
    }

    // Add tag filters
    if (appliedFilters.tags && appliedFilters.tags.length > 0) {
      filters.push({
        tag: appliedFilters.tags,
      });
    }

    // Add price range filter - only if valid numbers
    const minPrice = appliedFilters.priceRange[0];
    const maxPrice = appliedFilters.priceRange[1];

    if (
      !isNaN(minPrice) &&
      !isNaN(maxPrice) &&
      minPrice < maxPrice &&
      (minPrice > 0 || maxPrice < 10000)
    ) {
      filters.push({
        price: {
          min: minPrice,
          max: maxPrice,
        },
      });
    }

    return filters.length > 0 ? JSON.stringify(filters) : undefined;
  };

  const filtersParam = buildFiltersParam();

  // Fetch collection products
  const { data, isPending, error, isFetching, refetch } =
    useGetCollectionProducts(
      collectionId as string,
      {
        limit: 20,
        cursor,
        sortKey: sortKey as ProductCollectionSortKey,
        reverse,
        filters: filtersParam,
      },
      {
        query: {
          enabled: !!collectionId,
        },
      }
    );

  // Pull to refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setCursor(undefined); // Reset pagination
    // Don't clear products immediately - keep them visible during refresh
    refetch(); // Refetch data
  };

  // Track which collection the current products belong to
  const [currentCollectionId, setCurrentCollectionId] = useState(collectionId);

  // Reset products and cursor when filters or collection changes
  useEffect(() => {
    setCursor(undefined);
    setAllProducts([]);
  }, [appliedFilters, collectionId]);

  // Handle pagination: append new products or reset when filters change
  useEffect(() => {
    if (data?.data?.products) {
      const newProducts = data.data.products.map(mapCollectionProductToProduct);

      if (cursor) {
        // Append to existing products (pagination)
        setAllProducts((prev) => [...prev, ...newProducts]);
      } else {
        // Replace products (initial load or filter change)
        setAllProducts(newProducts);
        setCurrentCollectionId(collectionId);
      }

      // Stop refreshing indicator when data arrives
      setIsRefreshing(false);
    }
  }, [data, cursor, collectionId]);

  // Stop refreshing if fetch completes (success or error)
  useEffect(() => {
    if (!isFetching && isRefreshing) {
      setIsRefreshing(false);
    }
  }, [isFetching, isRefreshing]);

  // Store initial facets only on first load (no filters applied)
  useEffect(() => {
    if (data?.data?.facets && !initialFacets) {
      const hasNoFilters =
        appliedFilters.categories.length === 0 &&
        appliedFilters.colors.length === 0 &&
        appliedFilters.vendors?.length === 0 &&
        appliedFilters.tags?.length === 0 &&
        !appliedFilters.sort;

      if (hasNoFilters) {
        setInitialFacets(data.data.facets);

        if (data.data.facets.priceRange && !initialPriceRange) {
          setInitialPriceRange({
            min: data.data.facets.priceRange.min,
            max: data.data.facets.priceRange.max,
          });
        }
      }
    }
  }, [data?.data?.facets, initialFacets, appliedFilters, initialPriceRange]);

  useEffect(() => {
    setInitialFacets(undefined);
    setInitialPriceRange(undefined);
  }, [collectionId]);

  useEffect(() => {
    if (
      initialPriceRange &&
      !isNaN(initialPriceRange.min) &&
      !isNaN(initialPriceRange.max) &&
      pendingFilters.priceRange[1] === 1000
    ) {
      const min = Math.floor(initialPriceRange.min);
      const max = Math.ceil(initialPriceRange.max);

      if (min < max) {
        setPendingFilters((prev) => ({
          ...prev,
          priceRange: [min, max],
        }));
        // Also initialize applied filters with same range
        setAppliedFilters((prev) => ({
          ...prev,
          priceRange: [min, max],
        }));
      }
    }
  }, [initialPriceRange]);

  // Load more products
  const handleLoadMore = () => {
    if (
      data?.data?.pageInfo?.hasNextPage &&
      !isFetching &&
      data?.data?.pageInfo?.endCursor
    ) {
      setCursor(data.data.pageInfo.endCursor);
    }
  };

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
    />
  );
  const renderItem = ({ item }: { item: Product }) => {
    return (
      <YStack>
        <ProductCard product={item} context="grid" />
      </YStack>
    );
  };

  const renderFooter = () => {
    if (!isFetching || !data?.data?.pageInfo?.hasNextPage) return null;
    return (
      <YStack paddingVertical="$lg" alignItems="center">
        <Loader size="small" />
      </YStack>
    );
  };

  const renderEmpty = () => {
    // Don't show "No products found" during refresh or initial load
    if (isRefreshing || isPending || isFetching) {
      return null;
    }

    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        paddingVertical="$xl"
      >
        <Text fontSize={16} color="$secondary">
          No products found
        </Text>
      </YStack>
    );
  };

  // Show loader ONLY on initial load - not during refresh or pagination
  const shouldShowLoader =
    (isPending || (isFetching && allProducts.length === 0)) && !isRefreshing;

  if (shouldShowLoader) {
    return (
      <YStack
        flex={1}
        backgroundColor="$background"
        justifyContent="center"
        alignItems="center"
      >
        <Loader size="large" />
      </YStack>
    );
  }

  // Show error state
  if (error && allProducts.length === 0) {
    return (
      <YStack
        flex={1}
        backgroundColor="$background"
        justifyContent="center"
        alignItems="center"
        padding="$lg"
      >
        <Text fontSize={16} color="$error" textAlign="center">
          Failed to load products. Please try again.
        </Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <Spacer size={"$lg"} />
      <PlpOptions
        onPress={() => {
          bottomSheetRef.current?.present();
          setTimeout(() => {
            bottomSheetRef.current?.snapToIndex(0);
          }, 50);
        }}
      />

      <Spacer size={"$md"} />
      <FlatList
        data={allProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.productId}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={getTokenValue("$primary")}
            colors={[getTokenValue("$primary")]}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: sidePadding,
          backgroundColor: tokens.color.background,
          gap: tokens.space.lg,
          paddingBottom: tokens.space.xl,
          flexGrow: 1,
        }}
        columnWrapperStyle={{
          columnGap: columnGap,
        }}
      />
      <BottomSheetModal
        snapPoints={["50%", "90%"]}
        ref={bottomSheetRef}
        index={2}
        enablePanDownToClose={true}
        enableDismissOnClose={true}
        animateOnMount={true}
        maxDynamicContentSize={90}
        backgroundStyle={{ backgroundColor: tokens.color.background }}
        backdropComponent={renderBackdrop}
      >
        {/* Fixed Header */}
        <YStack
          alignItems="center"
          paddingVertical="$md"
          backgroundColor={tokens.color.background}
        >
          <HeadingXSBold>{t("sortfilter.title")}</HeadingXSBold>
        </YStack>

        <BottomSheetScrollView
          contentContainerStyle={{
            backgroundColor: tokens.color.background,
            paddingBottom: tokens.space.reg,
          }}
          showsVerticalScrollIndicator={false}
        >
          <FilterBottomSheetContent
            filterState={pendingFilters}
            onFilterChange={setPendingFilters}
            facets={
              initialFacets && initialPriceRange
                ? {
                    ...initialFacets,
                    priceRange: initialPriceRange, // Always use initial price range
                  }
                : initialFacets || data?.data?.facets
            }
          />
        </BottomSheetScrollView>
        <Divider />
        <YStack paddingHorizontal={"$md"}>
          <Spacer size={"$md"} />
          <PrimaryButton
            label={t("sortfilter.btn")}
            onPress={() => {
              // Apply pending filters to trigger API call
              setAppliedFilters(pendingFilters);
              setCursor(undefined); // Reset pagination when filters change
              bottomSheetRef.current?.dismiss();
            }}
            isLoading={false}
          />
          {/* Show Reset Filters button only when filters are applied */}
          {(pendingFilters.sort !== "" ||
            pendingFilters.categories.length > 0 ||
            pendingFilters.colors.length > 0 ||
            (pendingFilters.vendors && pendingFilters.vendors.length > 0) ||
            (pendingFilters.tags && pendingFilters.tags.length > 0)) && (
            <>
              <Spacer size={"$sm"} />
              <OpTouch
                onPress={() => {
                  // Reset all filters to default
                  const defaultFilters: FilterState = {
                    sort: "",
                    categories: [],
                    priceRange: initialPriceRange
                      ? [
                          Math.floor(initialPriceRange.min),
                          Math.ceil(initialPriceRange.max),
                        ]
                      : [0, 1000],
                    colors: [],
                    vendors: [],
                    tags: [],
                  };
                  setPendingFilters(defaultFilters);
                  setAppliedFilters(defaultFilters);
                  setCursor(undefined);
                  bottomSheetRef.current?.dismiss();
                }}
              >
                <XStack
                  justifyContent="center"
                  alignItems="center"
                  paddingVertical="$sm"
                >
                  <TextMDSemiBold color="$primary">
                    Reset Filters
                  </TextMDSemiBold>
                </XStack>
              </OpTouch>
            </>
          )}
          <Spacer size={"$md"} />
        </YStack>
      </BottomSheetModal>
      {/* <BottomSheetModalWithScrollView
        ref={bottomSheetRef}
        snapPoints={["100%"]}
        enablePanDownToClose={false}
        index={0}
        handleIndicatorStyle={{ display: "none" }}
        backgroundStyle={{ backgroundColor: tokens.color.background }}
        style={{ flex: 1 }}
        enableOverDrag={false}
        topInset={0}
        bottomInset={0}
        maxProportionOfWindowHeight={1.0}
      >
        <FilterBottomSheetContent />
      </BottomSheetModalWithScrollView> */}
    </YStack>
  );
};
export default PlpScreen;
