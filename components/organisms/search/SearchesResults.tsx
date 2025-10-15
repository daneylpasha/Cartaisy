import { Spacer } from "@/components/atoms/Spacer";
import { CategoriesSearches } from "@/components/molecules/search";
import {
  SearchSuggestionItem,
  SearchSuggestions,
} from "@/components/molecules/search/SearchSuggestions";
import { FlatList } from "react-native";
import { YStack } from "tamagui";

interface SearchResult {
  id: string | number;
  title: string;
  type: string;
  handle?: string;
  productData?: any;
}

export const SearchesResults = ({
  searchResults = [],
  searchQuery = "",
  onProductClick,
  categoryCollectionGrid,
  recentSearches = [],
  trendingSearches = [],
  onClearRecentSearches,
  onClearTrendingSearches,
  onSearchClick,
}: {
  searchResults: SearchResult[];
  searchQuery: string;
  onProductClick?: (product: SearchResult) => void;
  categoryCollectionGrid?: any[];
  recentSearches?: Array<{
    query: string;
    resultsCount?: number;
    searchedAt?: string;
  }>;
  trendingSearches?: Array<{
    query: string;
    searchCount?: number;
    avgResultsCount?: number;
  }>;
  onClearRecentSearches?: () => void;
  onClearTrendingSearches?: () => void;
  onSearchClick?: (query: string) => void;
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
    }));

  const trendingSearchesData = trendingSearches
    .filter((search) => search.query.trim().length >= 3)
    .map((search, index) => ({
      id: index + 1,
      title: search.query,
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
              onPick={(query) => onSearchClick?.(query)}
              onClearAll={() => onClearRecentSearches?.()}
              defaultIcon="recentIcon"
            />
            <Spacer size={"$xl"} />
          </>
        )}

        {trendingSearchesData.length > 0 && (
          <>
            <SearchSuggestions
              title="Trending Searches"
              data={trendingSearchesData}
              onPick={(query) => onSearchClick?.(query)}
              onClearAll={() => {}} // Don't allow clearing global trending searches
              defaultIcon="trendingIcon"
              hideClearAll={true} // Hide Clear All for trending
            />
            {/* <Spacer size={"$xl"} /> */}
          </>
        )}
      </YStack>

      <CategoriesSearches
        categories={CATEGORIES}
        onPick={() => {}}
        categoryCollectionGrid={categoryCollectionGrid}
      />
    </YStack>
  );
};
