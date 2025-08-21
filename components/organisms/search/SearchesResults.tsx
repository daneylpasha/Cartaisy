import { Spacer } from "@/components/atoms/Spacer";
import { CategoriesSearches } from "@/components/molecules/search";
import {
  SearchSuggestionItem,
  SearchSuggestions,
} from "@/components/molecules/search/SearchSuggestions";
import { FlatList } from "react-native";
import { YStack } from "tamagui";

interface SearchResult {
  id: number;
  title: string;
  type: string;
}

export const SearchesResults = ({
  searchResults = [],
  searchQuery = "",
}: {
  searchResults: SearchResult[];
  searchQuery: string;
}) => {
  const RECENTS = [
    {
      id: 1,
      title: "video games for ps4",
    },
    {
      id: 2,
      title: "cozy sweaters",
    },
    {
      id: 3,
      title: "organic skincare",
    },
    {
      id: 4,
      title: "gaming consoles",
    },
  ];

  const TRENDING = [
    {
      id: 1,
      title: "holiday gift",
    },
    {
      id: 2,
      title: "pet essentials",
    },
    {
      id: 3,
      title: "gaming accessories",
    },
    {
      id: 4,
      title: "personal jewelries",
    },
  ];

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
        <Spacer size={"$lg"} />
        <YStack>
          <FlatList
            data={searchResults}
            renderItem={({ item }) => <SearchSuggestionItem item={item} />}
          />
        </YStack>
      </YStack>
    );
  }

  // Show default content (Recent Searches, Trending Searches, Categories)
  return (
    <YStack>
      <YStack paddingHorizontal={"$md"}>
        <Spacer size={"$xl"} />

        <SearchSuggestions
          title="Recent Searches"
          data={RECENTS}
          onPick={() => {}}
          onClearAll={() => {}}
          defaultIcon="recentIcon"
        />

        <Spacer size={"$xl"} />

        <SearchSuggestions
          title="Trending Searches"
          data={TRENDING}
          onPick={() => {}}
          onClearAll={() => {}}
          defaultIcon="trendingIcon"
        />
      </YStack>
      <Spacer size={"$xl"} />
      <CategoriesSearches categories={CATEGORIES} onPick={() => {}} />
    </YStack>
  );
};
