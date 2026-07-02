import type {
  CollectionWithProducts,
  EnrichedProduct,
} from "@/api/generated/cartaisyAPI.schemas";
import type { CategoryCollectionGridItem, Product } from "@/api/types";
import { Loader } from "@/components/atoms";
import { Spacer } from "@/components/atoms/Spacer";
import { CategoriesSearches } from "@/components/molecules/search";
import {
  SearchSuggestionItem,
  SearchSuggestionItemData,
  SearchSuggestions,
} from "@/components/molecules/search/SearchSuggestions";
import { FlatList } from "react-native";
import { YStack } from "tamagui";

export interface SearchResult {
  id: string | number;
  title: string;
  type: string;
  handle?: string;
  productData?: Product;
  collectionData?: CollectionWithProducts;
  searchContextLoading?: boolean;
}

export const SearchesResults = ({
  searchContextLoading,
  searchResults = [],
  searchQuery = "",
  onProductClick,
  categoryCollectionGrid,
  recentSearches = [],
  trendingSearches = [],
  onClearRecentSearches,
  onClearTrendingSearches,
  onSearchItemClick,
  onCollectionClick,
}: {
  searchResults: SearchResult[];
  searchQuery: string;
  searchContextLoading?: boolean;
  onProductClick?: (product: SearchResult) => void;
  categoryCollectionGrid?: CategoryCollectionGridItem[];
  recentSearches?: Array<{
    query: string;
    resultsCount?: number;
    searchedAt?: string;
    type?: string;
    product?: EnrichedProduct;
    collection?: CollectionWithProducts;
  }>;
  trendingSearches?: Array<{
    query: string;
    searchCount?: number;
    avgResultsCount?: number;
    type?: string;
    product?: EnrichedProduct;
    collection?: CollectionWithProducts;
  }>;
  onClearRecentSearches?: () => void;
  onClearTrendingSearches?: () => void;
  onSearchItemClick?: (title: string, item: SearchSuggestionItemData) => void;
  onCollectionClick?: (collectionId: string, collectionTitle: string) => void;
}) => {
  const CATEGORIES = [
    "Electronics",
    "Dress",
    "Headphones",
    "Health & Fitness",
    "Other",
  ];

  // If we have actual search results, show them
  if (searchResults.length > 0) {
    return (
      <YStack paddingHorizontal={"$md"}>
        <YStack>
          <FlatList
            data={searchResults}
            renderItem={({ item }) => {
              return (
                <SearchSuggestionItem
                  item={item}
                  onPress={() => onProductClick?.(item)}
                />
              );
            }}
            keyExtractor={(item) => String(item.id)}
          />
        </YStack>
      </YStack>
    );
  }

  // Show default content (Recent Searches, Trending Searches, Categories)
  // Convert API data to format expected by SearchSuggestions
  // Filter out searches with less than 3 characters
  const recentSearchesData = recentSearches
    .filter((search) => search.query.trim().length >= 3)
    .map((search, index) => ({
      id: index + 1,
      title: search.query,
      type: search.type,
      productData: search.product,
      collectionData: search.collection,
    }));

  const trendingSearchesData = trendingSearches
    .filter((search) => search.query.trim().length >= 3)
    .map((search, index) => ({
      id: index + 1,
      title: search.query,
      type: search.type,
      productData: search.product,
      collectionData: search.collection,
    }));

  return (
    <YStack>
      <YStack paddingHorizontal={"$md"}>
        <Spacer size={"$xl"} />

        {recentSearchesData.length > 0 && (
          <>
            <SearchSuggestions
              title="Recent Searches"
              data={recentSearchesData}
              onPick={(title, item) => onSearchItemClick?.(title, item)}
              onClearAll={() => onClearRecentSearches?.()}
              defaultIcon="recentIcon"
            />
            <Spacer size={"$xl"} />
          </>
        )}

        {searchContextLoading ? (
          <YStack
            justifyContent="center"
            alignItems="center"
            paddingVertical={"$lg"}
          >
            <Spacer size={"$md"} />
            <Loader />
          </YStack>
        ) : (
          trendingSearchesData.length > 0 && (
            <SearchSuggestions
              title="Trending Searches"
              data={trendingSearchesData}
              onPick={(title, item) => onSearchItemClick?.(title, item)}
              onClearAll={() => {}} // Don't allow clearing global trending searches
              defaultIcon="trendingIcon"
              hideClearAll={true} // Hide Clear All for trending
            />
          )
        )}
      </YStack>

      <CategoriesSearches
        categories={CATEGORIES}
        onPick={() => {}}
        categoryCollectionGrid={categoryCollectionGrid}
        onCollectionClick={onCollectionClick}
      />
    </YStack>
  );
};
