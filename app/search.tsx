import {
  useClearSearchHistory,
  useGetInitialSearchScreen,
  useGetSearchContext,
  useLogSearch,
  useSearch,
} from "@/api/generated/search/search";

import type {
  CollectionWithProducts,
  EnrichedProduct,
  Product,
} from "@/api/generated/cartaisyAPI.schemas";
import { useHomeScreenData } from "@/api/hooks/useHomeScreenData";
import { TextMDSemiBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Loader } from "@/components/atoms/Loader";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextXSRegular } from "@/components/atoms/texts/TextXSRegular";
import {
  GRID_COLUMN_GAP,
  ProductCard,
} from "@/components/molecules/ProductCard";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { SearchBar } from "@/components/organisms/SearchBar";
import { EmptySearches } from "@/components/organisms/search/EmptySearches";
import { SearchesResults } from "@/components/organisms/search/SearchesResults";
import { useDebounce } from "@/hooks/useDebounce";
import useCartStore from "@/store/useCartStore";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  RefreshControl,
  StyleSheet,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, XStack, YStack } from "tamagui";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * Transform EnrichedProduct to Product format for ProductCard
 * EnrichedProduct already matches Product format, so this is mostly a type cast with validation
 */
const transformEnrichedProduct = (
  product: EnrichedProduct | undefined
): Product | null => {
  if (!product) {
    console.warn("⚠️ transformEnrichedProduct: product is undefined");
    return null;
  }

  // EnrichedProduct already has the exact same structure as Product
  // Just ensure all fields are present
  return {
    productId: product.productId,
    title: product.title,
    description: product.description || "",
    images: product.images || [],
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    currency: product.currency,
    inStock: product.inStock,
    availableQuantity: product.availableQuantity,
    totalQuantity: product.totalQuantity,
    rating: product.rating,
    reviewsCount: product.reviewsCount,
    handle: product.handle || "",
    vendor: product.vendor || "",
    tags: product.tags || [],
  };
};

const Search = () => {
  const queryClient = useQueryClient();
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { getTotalQuantity } = useCartStore();
  const cartItemCount = getTotalQuantity();
  const { data: homeData } = useHomeScreenData();

  // Fetch initial search screen data (trending products and collections)
  const {
    data: initialSearchData,
    isLoading: isLoadingInitialData,
    refetch: refetchInitialData,
  } = useGetInitialSearchScreen(
    { limit: 10, timeframe: 7 },
    {
      query: {
        enabled: !isInputFocused && searchQuery.length === 0,
      },
    }
  );

  // Debug initial search data
  React.useEffect(() => {
    if (!isInputFocused && searchQuery.length === 0) {
      console.log(
        "📊 Initial Search Data:",
        JSON.stringify(initialSearchData, null, 2)
      );
      console.log(
        "📦 Trending Products:",
        initialSearchData?.data?.trendingProducts
      );
      console.log(
        "📦 Trending Products Length:",
        initialSearchData?.data?.trendingProducts?.length
      );
      console.log(
        "🗂️ Trending Collections:",
        initialSearchData?.data?.trendingCollections
      );
      console.log(
        "🗂️ Trending Collections Length:",
        initialSearchData?.data?.trendingCollections?.length
      );
    }
  }, [isInputFocused, searchQuery, initialSearchData]);

  // Debounce search query for API call (300ms delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // API Hook - Search Context (Recent + Trending Searches) - When input focused and query < 3 chars
  const {
    data: searchContextData,
    isLoading: searchContextLoading,
    refetch: refetchSearchContext,
  } = useGetSearchContext(
    { limit: 5 },
    {
      query: {
        enabled: isInputFocused && searchQuery.length < 3,
      },
    }
  );

  // Debug logs for search context
  React.useEffect(() => {
    if (isInputFocused && searchQuery.length < 3) {
      console.log(
        "📊 [CONTEXT] Recent Searches Count:",
        searchContextData?.data?.recentSearches?.length
      );
      console.log(
        "📊 [CONTEXT] Trending Searches Count:",
        searchContextData?.data?.trendingSearches?.length
      );
      console.log(
        "📊 [CONTEXT] Is Authenticated:",
        searchContextData?.data?.metadata?.isAuthenticated
      );
    }
  }, [isInputFocused, searchQuery, searchContextData]);

  // Invalidate search context when screen comes into focus
  // This ensures recent searches are updated when user returns from PDP
  useFocusEffect(
    useCallback(() => {
      console.log("🎯 Screen focused - invalidating search context cache");
      queryClient.invalidateQueries({ queryKey: ["/customer/search/context"] });
    }, [queryClient])
  );

  /**
   * Log text search when user types and submits search
   * This is called when user presses Enter/Return with 3+ characters
   */
  const logTextSearch = async (query: string) => {
    if (query.trim().length < 3) {
      console.log("⚠️ Not logging search (too short):", query);
      return;
    }

    try {
      console.log("🔍 [LOG SEARCH] Logging text search:", query);
      console.log(
        "🔍 [LOG SEARCH] Results count:",
        searchSuggestionsData?.data?.totalResults
      );

      logSearchMutation(
        {
          data: {
            query: query.trim(),
            searchType: "text",
            resultsCount: searchSuggestionsData?.data?.totalResults,
          },
        },
        {
          onSuccess: (response) => {
            console.log(
              "✅ [LOG SEARCH] Text search logged successfully:",
              response
            );
            console.log("✅ [LOG SEARCH] Search ID:", response.searchId);

            // Invalidate search context to refresh recent searches
            console.log("🔄 [LOG SEARCH] Invalidating search context cache...");
            queryClient.invalidateQueries({
              queryKey: ["/customer/search/context"],
            });

            // Force refetch if conditions are met
            if (isInputFocused && searchQuery.length < 3) {
              console.log("🔄 [LOG SEARCH] Force refetching search context...");
              refetchSearchContext();
            }
          },
          onError: (error) => {
            console.error("❌ [LOG SEARCH] Failed to log text search:", error);
            console.error(
              "❌ [LOG SEARCH] Error details:",
              JSON.stringify(error, null, 2)
            );
          },
        }
      );
    } catch (error) {
      console.error("❌ [LOG SEARCH] Catch block error:", error);
    }
  };

  // 3. Search - When user types (minimum 3 characters)
  // This returns both products AND collections
  const {
    data: searchSuggestionsData,
    isFetching: isFetchingSuggestions,
    error: suggestionsError,
  } = useSearch(
    {
      q: debouncedSearchQuery,
      limit: 20,
    },
    {
      query: {
        enabled: debouncedSearchQuery.length >= 3,
      },
    }
  );

  // Debug search suggestions (but don't log automatically)
  React.useEffect(() => {
    if (debouncedSearchQuery.length >= 3) {
      console.log("🔍 Debounced Query:", debouncedSearchQuery);

      if (searchSuggestionsData?.data) {
        console.log(
          "🔍 Products Count:",
          searchSuggestionsData.data.products?.length || 0
        );
        console.log(
          "🔍 Collections Count:",
          searchSuggestionsData.data.collections?.length || 0
        );
        console.log(
          "🔍 Total Results:",
          searchSuggestionsData.data.totalResults
        );
      }
    }

    if (suggestionsError) {
      console.error("❌ Search Suggestions Error:", suggestionsError);
    }
  }, [debouncedSearchQuery, searchSuggestionsData, suggestionsError]);

  // 4. Clear Search History mutation
  const { mutate: clearHistory } = useClearSearchHistory();

  // 5. Log Search mutation - For tracking product/collection clicks
  const { mutate: logSearchMutation } = useLogSearch();

  // Handle clear history
  const handleClearHistory = () => {
    clearHistory(undefined, {
      onSuccess: () => {
        refetchSearchContext();
      },
    });
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    LayoutAnimation.configureNext({
      duration: 200,
      create: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.opacity,
        springDamping: 0.7,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.7,
      },
      delete: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.opacity,
        springDamping: 0.7,
      },
    });
    setIsInputFocused(true);
  };

  // Handle search input blur
  const handleSearchBlur = () => {
    setTimeout(() => {
      LayoutAnimation.configureNext({
        duration: 200,
        create: {
          type: LayoutAnimation.Types.spring,
          property: LayoutAnimation.Properties.opacity,
          springDamping: 0.7,
        },
        update: {
          type: LayoutAnimation.Types.spring,
          springDamping: 0.7,
        },
        delete: {
          type: LayoutAnimation.Types.spring,
          property: LayoutAnimation.Properties.opacity,
          springDamping: 0.7,
        },
      });
      setIsInputFocused(false);
    }, 200);
  };

  // Handle cancel button press
  const handleCancel = () => {
    console.log("🚫 Cancel button pressed - should navigate back");
    LayoutAnimation.configureNext({
      duration: 200,
      create: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.opacity,
        springDamping: 0.7,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.7,
      },
      delete: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.opacity,
        springDamping: 0.7,
      },
    });
    setSearchQuery("");
    setIsInputFocused(false);
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log("🔄 Pull to refresh triggered");

    try {
      if (shouldShowDefaultContent) {
        // Refresh trending products and collections
        console.log("📦 Refreshing trending products and collections");
        await refetchInitialData();
      } else if (shouldShowRecentAndTrending) {
        // Refresh search context (recent & trending searches)
        console.log("🔍 Refreshing search context");
        await queryClient.invalidateQueries({
          queryKey: ["/customer/search/context"],
        });
        await refetchSearchContext();
      } else if (shouldShowSuggestions) {
        // Re-run current search products
        console.log("🔎 Refreshing search products");
        await queryClient.invalidateQueries({
          queryKey: ["/search/products"],
        });
      }
    } catch (error) {
      console.error("❌ Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Convert API data to format expected by SearchesResults component
  // Helper function to extract numeric ID from Shopify GID
  const extractNumericId = (gid: string | undefined): string => {
    if (!gid) {
      console.warn("⚠️ extractNumericId: gid is undefined");
      return "";
    }

    // If it's already numeric or not a GID, return as is
    if (!gid.includes("gid://")) {
      return gid;
    }

    // Extract numeric ID from GID format
    // gid://shopify/Product/14802833637748 -> 14802833637748
    const parts = gid.split("/");
    return parts[parts.length - 1];
  };

  const getSearchResultsData = () => {
    if (searchQuery.length === 0) {
      return [];
    }

    const results: any[] = [];

    // Get products and collections from search API
    // These are already enriched with full data (EnrichedProduct and CollectionWithProducts)
    const products = searchSuggestionsData?.data?.products || [];
    const collections = searchSuggestionsData?.data?.collections || [];

    // Add products - already in EnrichedProduct format
    products.forEach((enrichedProduct: EnrichedProduct) => {
      const product = transformEnrichedProduct(enrichedProduct);
      if (product) {
        results.push({
          id: extractNumericId(product.productId),
          title: product.title,
          type: "product" as const,
          handle: product.handle,
          productData: product,
        });
      }
    });

    // Add collections - already in CollectionWithProducts format
    collections.forEach((collection: CollectionWithProducts) => {
      results.push({
        id: extractNumericId(collection.id),
        title: collection.title,
        type: "collection" as const,
        handle: collection.handle,
        collectionData: collection,
      });
    });

    return results;
  };

  const handleSuggestionClick = async (suggestion: any) => {
    console.log("🖱️ Suggestion clicked:", suggestion);

    // Handle collection click
    if (suggestion.type === "collection" && suggestion.collectionData) {
      const collection = suggestion.collectionData;
      const numericCollectionId = extractNumericId(collection.id);

      // Log collection search
      logSearchMutation(
        {
          data: {
            query: collection.title,
            searchType: "collection",
            selectedCollectionId: numericCollectionId,
          },
        },
        {
          onSuccess: (response) => {
            console.log("✅ Collection search logged successfully:", response);
            queryClient.invalidateQueries({
              queryKey: ["/customer/search/context"],
            });
          },
          onError: (error) => {
            console.warn(
              "⚠️ Failed to log collection search (non-critical):",
              error
            );
          },
        }
      );

      // Navigate to PLP with numeric ID
      router.push({
        pathname: "/products",
        params: {
          collectionId: numericCollectionId,
          categoryName: collection.title,
        },
      });
    }
    // Handle product click
    else if (suggestion.type === "product") {
      const productToNavigate = suggestion.productData || suggestion;
      console.log("📦 Product suggestion clicked:", productToNavigate);

      // Get ID - EnrichedProduct uses 'productId'
      const productId = productToNavigate.productId || productToNavigate.id;

      if (!productId) {
        console.error("❌ [ERROR] No product ID found:", productToNavigate);
        return;
      }

      // Extract numeric ID from GID format
      const numericId = extractNumericId(productId);

      // Log the search with product selection
      // Use product title as the query so it appears in recent searches
      const productTitle = productToNavigate.title || searchQuery.trim();

      if (productTitle.length > 0) {
        logSearchMutation(
          {
            data: {
              query: productTitle,
              searchType: "product",
              selectedProductId: numericId,
              resultsCount: searchSuggestionsData?.data?.totalResults || 0,
            },
          },
          {
            onSuccess: (response) => {
              console.log("✅ Product search logged successfully:", response);
              queryClient.invalidateQueries({
                queryKey: ["/customer/search/context"],
              });
            },
            onError: (error) => {
              console.warn(
                "⚠️ Failed to log product search (non-critical):",
                error
              );
            },
          }
        );
      }

      // Navigate to PDP
      router.push({
        pathname: "/products/[id]",
        params: {
          id: numericId,
        },
      });
    }
  };

  // Determine which view to show
  const shouldShowRecentAndTrending = isInputFocused && searchQuery.length < 3; // Show when focused but < 3 chars
  const shouldShowSuggestions = searchQuery.length >= 3; // Minimum 3 characters
  const shouldShowDefaultContent = !isInputFocused && searchQuery.length === 0;

  // Get search results
  const searchResultsData = getSearchResultsData();
  const hasResults = searchResultsData.length > 0;

  // Create data for FlatList
  const getFlatListData = () => {
    const data = [];

    // State 1: Show Recent & Trending when focused, no query
    if (shouldShowRecentAndTrending) {
      data.push({ type: "recentAndTrending", id: "recentAndTrending" });
    }

    // State 2: Show loading when typing
    if (shouldShowSuggestions && isFetchingSuggestions) {
      data.push({ type: "searching", id: "searching" });
    }

    // State 3: Show search results when available
    if (shouldShowSuggestions && !isFetchingSuggestions && hasResults) {
      data.push({ type: "suggestions", id: "suggestions" });
    }

    // State 4: Show empty state when no results
    if (shouldShowSuggestions && !isFetchingSuggestions && !hasResults) {
      data.push({ type: "emptyState", id: "emptyState" });
    }

    // State 5: Show default content
    if (shouldShowDefaultContent) {
      data.push({ type: "defaultContent", id: "default" });
    }

    return data;
  };

  // Render item for FlatList
  const renderFlatListItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case "recentAndTrending":
        return (
          <SearchesResults
            searchResults={[]}
            searchQuery={searchQuery}
            categoryCollectionGrid={homeData?.data?.categoryCollectionGrid}
            searchContextLoading={searchContextLoading}
            recentSearches={
              searchContextData?.data?.recentSearches?.map((item) => ({
                query: item.query,
                searchedAt: item.searchedAt,
                type: item.type,
                product: item.product,
                collection: item.collection,
              })) || []
            }
            trendingSearches={
              searchContextData?.data?.trendingSearches?.map((item) => ({
                query: item.query,
                searchCount: item.recentCount,
                avgResultsCount: 0, // Not provided in enriched response
                type: item.type,
                product: item.product,
                collection: item.collection,
              })) || []
            }
            onClearRecentSearches={handleClearHistory}
            onClearTrendingSearches={() => {}}
            onSearchItemClick={(title, item) => {
              console.log("🔍 Search suggestion clicked:", { title, item });

              // If it's a collection type, navigate to PLP
              if (item.type === "collection" && item.collectionData) {
                console.log(
                  "📁 Collection type - navigating to PLP:",
                  item.collectionData
                );

                // Log collection search
                logSearchMutation(
                  {
                    data: {
                      query: title,
                      searchType: "collection",
                      selectedCollectionId: item.collectionData.id,
                    },
                  },
                  {
                    onSuccess: (response) => {
                      console.log(
                        "✅ Collection search logged successfully:",
                        response
                      );
                      queryClient.invalidateQueries({
                        queryKey: ["/customer/search/context"],
                      });
                    },
                    onError: (error) => {
                      console.warn(
                        "⚠️ Failed to log collection search (non-critical):",
                        error
                      );
                    },
                  }
                );

                // Navigate to ProductListingScreen
                router.push({
                  pathname: "/products",
                  params: {
                    collectionId: item.collectionData.id,
                    categoryName: item.collectionData.title,
                  },
                });
              } else if (item.type === "product" && item.productData) {
                // If it's a product type, navigate to PDP
                console.log(
                  "📦 Product type - navigating to PDP:",
                  item.productData
                );

                const numericId = item.productData.productId;

                // Log product search
                logSearchMutation(
                  {
                    data: {
                      query: title,
                      searchType: "product",
                      selectedProductId: numericId,
                    },
                  },
                  {
                    onSuccess: (response) => {
                      console.log(
                        "✅ Product search logged successfully:",
                        response
                      );
                      queryClient.invalidateQueries({
                        queryKey: ["/customer/search/context"],
                      });
                    },
                    onError: (error) => {
                      console.warn(
                        "⚠️ Failed to log product search (non-critical):",
                        error
                      );
                    },
                  }
                );

                // Navigate to Product Detail Page
                router.push({
                  pathname: "/products/[id]",
                  params: {
                    id: numericId,
                  },
                });
              } else {
                // For text searches, set the query to trigger search
                setSearchQuery(title);

                // Log the text search when clicking recent/trending search suggestions
                if (title.trim().length >= 3) {
                  logSearchMutation(
                    {
                      data: {
                        query: title.trim(),
                        searchType: "text",
                      },
                    },
                    {
                      onSuccess: (response) => {
                        console.log(
                          "✅ Text search logged successfully:",
                          response
                        );
                        queryClient.invalidateQueries({
                          queryKey: ["/customer/search/context"],
                        });
                      },
                      onError: (error) => {
                        console.warn(
                          "⚠️ Failed to log text search (non-critical):",
                          error
                        );
                      },
                    }
                  );
                }
              }
            }}
            onCollectionClick={(collectionId, collectionTitle) => {
              console.log("🔍 Collection suggestion clicked:", {
                collectionId,
                collectionTitle,
              });

              // Log the collection search when clicking a collection suggestion
              logSearchMutation(
                {
                  data: {
                    query: collectionTitle,
                    searchType: "collection",
                    selectedCollectionId: collectionId,
                  },
                },
                {
                  onSuccess: (response) => {
                    console.log(
                      "✅ Collection search logged successfully:",
                      response
                    );
                    // Invalidate search context to refresh recent searches
                    queryClient.invalidateQueries({
                      queryKey: ["/customer/search/context"],
                    });
                  },
                  onError: (error) => {
                    console.warn(
                      "⚠️ Failed to log collection search (non-critical):",
                      error
                    );
                    // Don't block user interaction - this is a tracking feature
                  },
                }
              );

              // Navigate to ProductListingScreen
              router.push({
                pathname: "/products",
                params: {
                  collectionId,
                  categoryName: collectionTitle,
                },
              });
            }}
          />
        );

      case "searching":
        const headerHeight = topInset + 60; // Top inset + search bar height
        const availableHeight = SCREEN_HEIGHT - headerHeight - bottomInset;

        return (
          <YStack
            height={availableHeight}
            justifyContent="center"
            alignItems="center"
          >
            <Loader size="small" />
          </YStack>
        );

      case "suggestions":
        return (
          <SearchesResults
            searchResults={searchResultsData}
            searchQuery={searchQuery}
            onProductClick={handleSuggestionClick}
          />
        );

      case "emptyState":
        return <EmptySearches />;

      case "defaultContent":
        if (isLoadingInitialData) {
          const headerHeight = topInset + 60;
          const availableHeight = SCREEN_HEIGHT - headerHeight - bottomInset;

          return (
            <YStack
              height={availableHeight}
              justifyContent="center"
              alignItems="center"
            >
              <Loader size="small" />
            </YStack>
          );
        }

        const trendingProducts = (
          initialSearchData?.data?.trendingProducts || []
        ).slice(0, 9); // Limit to 9 products (3 rows x 3 columns)
        const trendingCollections =
          initialSearchData?.data?.trendingCollections || [];

        return (
          <YStack flex={1}>
            <Spacer size={"$reg"} />

            {/* Trending Products Section */}
            {trendingProducts.length > 0 && (
              <YStack paddingVertical={"$md"}>
                <SectionHeader
                  title="Trending Products"
                  tintColor={"darkgrey"}
                  image="trendingIcon"
                  color="primary"
                />
                <Spacer size={"$sm"} />
                <YStack paddingHorizontal="$md">
                  <Spacer size={"$sm"} />
                  <FlatList
                    data={trendingProducts}
                    keyExtractor={(item, index) =>
                      `trending-product-${item.productId}-${index}`
                    }
                    horizontal={false}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    columnWrapperStyle={{
                      columnGap: GRID_COLUMN_GAP,
                    }}
                    renderItem={({ item }) => {
                      const product = transformEnrichedProduct(item);
                      if (!product) return null;

                      return (
                        <ProductCard
                          product={product}
                          context="grid"
                          showFavoriteIcon={true}
                        />
                      );
                    }}
                  />
                </YStack>
              </YStack>
            )}

            {/* Trending Collections Section */}
            {trendingCollections.length > 0 && (
              <YStack paddingVertical={"$md"}>
                <SectionHeader
                  title="Trending Collections"
                  tintColor={"darkgrey"}
                  image="trendingIcon"
                  color="primary"
                />
                <Spacer size={"$sm"} />
                <YStack paddingHorizontal="$md">
                  <Spacer size={"$sm"} />
                  <FlatList
                    data={trendingCollections}
                    keyExtractor={(item, index) =>
                      `trending-collection-${item.id}-${index}`
                    }
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                      <OpTouch
                        onPress={() =>
                          router.push({
                            pathname: "/products",
                            params: {
                              collectionId: item.id,
                              categoryName: item.title,
                            },
                          })
                        }
                      >
                        <YStack position="relative">
                          <Spacer size={"$md"} />
                          <TextMDSemiBold
                            fontSize={16}
                            position="absolute"
                            bottom={50}
                            left={"38%"}
                            // justifyContent="center"
                            // textAlign="center"
                            zIndex={100}
                            color={"$white"}
                          >
                            {item.title.toLocaleUpperCase()}
                          </TextMDSemiBold>
                          <Spacer size={"$md"} />
                          {item.image ? (
                            <View style={styles.imageContainer}>
                              <AppImage
                                resizeMode="cover"
                                source={item.image}
                                height={130}
                              />
                              <BlurView
                                intensity={20}
                                tint="dark"
                                style={styles.blurOverlay}
                              />
                            </View>
                          ) : (
                            <View style={styles.imageContainer}>
                              <AppImage
                                height={130}
                                resizeMode="cover"
                                name={"featuredPromotion1"}
                              />
                              <BlurView
                                intensity={20}
                                tint="dark"
                                style={styles.blurOverlay}
                              />
                            </View>
                          )}
                        </YStack>
                      </OpTouch>
                    )}
                  />
                </YStack>
              </YStack>
            )}

            <Spacer size={bottomInset} />
          </YStack>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <YStack height={topInset} backgroundColor="$primary" />
      <YStack paddingHorizontal={"$md"} height={60} backgroundColor="$primary">
        <XStack
          position="relative"
          justifyContent="space-between"
          alignItems="center"
        >
          <OpTouch
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            onPress={() => router.back()}
          >
            <YStack paddingVertical={"$sm"}>
              <AppImage
                name="arrowBack"
                width={9}
                height={16}
                tintColor={getTokenValue("$white")}
              />
            </YStack>
          </OpTouch>
          <SearchBar
            value={searchQuery}
            onSearch={(query) => setSearchQuery(query)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            onCancel={handleCancel}
            onSubmit={logTextSearch}
            width={isInputFocused ? "90%" : "80%"}
          />

          {!isInputFocused && (
            <OpTouch onPress={() => router.push("/cart")}>
              <AppImage
                name="cartIcon"
                size={24}
                tintColor={getTokenValue("$white")}
              />
              {cartItemCount > 0 && (
                <TextXSRegular
                  position="absolute"
                  top={-8}
                  right={-10}
                  borderRadius="$full"
                  paddingHorizontal={"$xs-sm"}
                  backgroundColor="$yellow"
                  color="$white"
                >
                  {cartItemCount}
                </TextXSRegular>
              )}
            </OpTouch>
          )}
        </XStack>
      </YStack>

      <FlatList
        data={getFlatListData()}
        renderItem={renderFlatListItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: bottomInset,
        }}
        refreshControl={
          // Only enable pull-to-refresh when NOT showing search suggestions
          !shouldShowSuggestions ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={getTokenValue("$primary")}
              colors={[getTokenValue("$primary")]}
            />
          ) : undefined
        }
      />
    </KeyboardAvoidingView>
  );
};

export default Search;
const styles = StyleSheet.create({
  blurView: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    borderRadius: 10,
    overflow: "hidden",
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
});
