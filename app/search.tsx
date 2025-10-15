import {
  searchProducts,
  useClearSearchHistory,
  useGetPopularSearches,
  useGetRecentSearches,
  useGetSearchSuggestions,
} from "@/api/generated/search/search";

import { useHomeScreenData } from "@/api/hooks/useHomeScreenData";
import { AppImage } from "@/components/atoms/AppImage";
import { Loader } from "@/components/atoms/Loader";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextXSRegular } from "@/components/atoms/texts/TextXSRegular";
import ProductsGridScroller from "@/components/organisms/ProductsGridScroller/ProductsGridScroller";
import { SearchBar } from "@/components/organisms/SearchBar";
import { EmptySearches } from "@/components/organisms/search/EmptySearches";
import { SearchesResults } from "@/components/organisms/search/SearchesResults";
import { useDebounce } from "@/hooks/useDebounce";
import useCartStore from "@/store/useCartStore";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  FlatList,
  LayoutAnimation,
  Platform,
  RefreshControl,
  UIManager,
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

const Search = () => {
  const queryClient = useQueryClient();
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { getTotalQuantity } = useCartStore();
  const cartItemCount = getTotalQuantity();
  const {
    data: homeData,
    isLoading,
    refetch,
    isFetching,
    error,
  } = useHomeScreenData();

  // Debounce search query for API call (300ms delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // API Hooks - Only fetch when needed
  // 1. Recent Searches - When input focused and query < 3 chars
  const { data: recentSearchesData, refetch: refetchRecentSearches } =
    useGetRecentSearches(
      { limit: 5 },
      {
        query: {
          enabled: isInputFocused && searchQuery.length < 3,
        },
      }
    );

  // 2. Popular Searches - When input focused and query < 3 chars
  const { data: popularSearchesData } = useGetPopularSearches(
    { limit: 5 },
    {
      query: {
        enabled: isInputFocused && searchQuery.length < 3,
      },
    }
  );

  // Debug logs
  React.useEffect(() => {
    if (isInputFocused && searchQuery.length < 3) {
      console.log("📊 Recent Searches Data:", recentSearchesData);
      console.log("📊 Popular Searches Data:", popularSearchesData);
    }
  }, [isInputFocused, searchQuery, recentSearchesData, popularSearchesData]);

  // Invalidate recent searches when screen comes into focus
  // This ensures recent searches are updated when user returns from PDP
  useFocusEffect(
    useCallback(() => {
      console.log("🎯 Screen focused - invalidating recent searches cache");
      queryClient.invalidateQueries({ queryKey: ["/search/history"] });
    }, [queryClient])
  );

  /**
   * Track search by calling searchProducts API
   *
   * The backend automatically saves searches to history when searchProducts is called.
   * This function is called when:
   * 1. User presses Enter/Return with 3+ characters
   * 2. User clicks on a search suggestion
   * 3. User clicks on a recent/trending search term
   * 4. User clicks on a product from suggestions
   */
  const trackSearch = async (query: string) => {
    if (query.trim().length < 3) {
      console.log("⚠️ Not tracking search (too short):", query);
      return; // Don't track searches < 3 chars
    }

    try {
      console.log("🔍 Tracking search:", query);
      // Call searchProducts to trigger backend search tracking
      const result = await searchProducts({ q: query, limit: 1 });
      console.log("✅ Search tracked successfully:", result);

      // Invalidate recent searches cache to trigger refetch when query becomes enabled
      console.log("🔄 Invalidating recent searches cache...");
      await queryClient.invalidateQueries({ queryKey: ["/search/history"] });

      // Also try to refetch if the query is currently enabled
      refetchRecentSearches();
    } catch (error) {
      console.error("❌ Failed to track search:", error);
    }
  };

  // 3. Search Suggestions - When user types (minimum 3 characters)
  const { data: suggestionsData, isFetching: isFetchingSuggestions } =
    useGetSearchSuggestions(
      { q: debouncedSearchQuery, limit: 10 },
      {
        query: {
          enabled: debouncedSearchQuery.length >= 3,
        },
      }
    );

  // 4. Clear Search History mutation
  const { mutate: clearHistory } = useClearSearchHistory();

  // Handle clear history
  const handleClearHistory = () => {
    clearHistory(undefined, {
      onSuccess: () => {
        refetchRecentSearches();
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
        // Refresh home products
        console.log("📦 Refreshing home products");
        await refetch();
      } else if (shouldShowRecentAndTrending) {
        // Refresh recent & trending searches
        console.log("🔍 Refreshing recent & trending searches");
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["/search/history"] }),
          queryClient.invalidateQueries({ queryKey: ["/search/popular"] }),
        ]);
        await refetchRecentSearches();
      } else if (shouldShowSuggestions) {
        // Re-run current search suggestions
        console.log("🔎 Refreshing search suggestions");
        await queryClient.invalidateQueries({
          queryKey: ["/search/suggestions"],
        });
      }
    } catch (error) {
      console.error("❌ Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Convert API data to format expected by SearchesResults component
  const getSearchResultsData = () => {
    if (searchQuery.length === 0) {
      return [];
    }

    // Convert suggestions to SearchResult format
    const products = suggestionsData?.data?.products || [];
    console.log("🔍 [SEARCH] API Products:", JSON.stringify(products, null, 2));

    const mappedResults = products.map((product: any) => ({
      id: product.id,
      title: product.title,
      type: "product",
      handle: product.handle,
      productData: product,
    }));

    return mappedResults;
  };

  // Helper function to extract numeric ID from Shopify GID
  const extractNumericId = (gid: string): string => {
    // If it's already numeric or not a GID, return as is
    if (!gid.includes("gid://")) {
      return gid;
    }

    // Extract numeric ID from GID format
    // gid://shopify/Product/14802833637748 -> 14802833637748
    const parts = gid.split("/");
    return parts[parts.length - 1];
  };

  const handleProductClick = (product: any) => {
    const productToNavigate = product.productData || product;

    if (!productToNavigate.id) {
      console.error("❌ [ERROR] No product ID found:", productToNavigate);
      return;
    }

    // Track the search before navigating
    if (searchQuery.trim().length >= 3) {
      trackSearch(searchQuery.trim());
    }

    const numericId = extractNumericId(productToNavigate.id);

    router.push({
      pathname: "/products/[id]",
      params: {
        id: numericId,
      },
    });
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

    // State 3: Show suggestions when available
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
            recentSearches={recentSearchesData?.data?.searches || []}
            trendingSearches={popularSearchesData?.data?.searches || []}
            onClearRecentSearches={handleClearHistory}
            onClearTrendingSearches={() => {}}
            onSearchClick={(query) => {
              setSearchQuery(query);
              trackSearch(query); // Track when clicking recent/trending
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
            onProductClick={handleProductClick}
          />
        );

      case "emptyState":
        return <EmptySearches />;

      case "defaultContent":
        return (
          <YStack flex={1}>
            <Spacer size={"$reg"} />

            <ProductsGridScroller
              collection={homeData?.data?.collectionDisplays}
            />

            <Spacer size={bottomInset} />
          </YStack>
        );

      default:
        return null;
    }
  };

  return (
    <>
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
            onSubmit={trackSearch}
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
    </>
  );
};

export default Search;
