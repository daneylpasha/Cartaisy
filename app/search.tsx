import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextXSRegular } from "@/components/atoms/texts/TextXSRegular";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import ProductsGridScroller from "@/components/organisms/ProductsGridScroller";
import ProductsHorizontalScroller from "@/components/organisms/ProductsHorizontalScroller";
import SalesHorizontalScroller from "@/components/organisms/SalesHorizontalScroller";
import { SearchBar } from "@/components/organisms/SearchBar";
import { EmptySearches } from "@/components/organisms/search/EmptySearches";
import { SearchesResults } from "@/components/organisms/search/SearchesResults";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, XStack, YStack } from "tamagui";

// Define the type for search results
interface SearchResult {
  id: number;
  title: string;
  type: string;
}

// Hardcoded search database - replace with your actual API data
const SEARCH_DATABASE = [
  { id: 1, title: "iPhone 15 Pro", type: "product" },
  { id: 2, title: "Nike Air Max", type: "product" },
  { id: 3, title: "Samsung Galaxy", type: "product" },
  { id: 4, title: "MacBook Pro", type: "product" },
  { id: 5, title: "Adidas Ultraboost", type: "product" },
  { id: 6, title: "Sony Headphones", type: "product" },
];

const Search = () => {
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearchResults, setHasSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Mock search function - replace this with your actual search logic
  const performSearch = (query: string) => {
    if (query.length === 0) {
      setSearchResults([]);
      setHasSearchResults(false);
      setIsSearching(false);
      return;
    }

    // Start searching
    setIsSearching(true);
    setHasSearchResults(false);

    // Simulate search delay (reduced from 2 seconds to 500ms)
    setTimeout(() => {
      setIsSearching(false);

      // Search through the database
      const searchTerm = query.toLowerCase();
      const foundResults = SEARCH_DATABASE.filter((item) =>
        item.title.toLowerCase().includes(searchTerm)
      );

      if (foundResults.length > 0) {
        // Show results for found items
        setSearchResults(foundResults);
        setHasSearchResults(true);
      } else {
        // Show empty state when no results found
        setSearchResults([]);
        setHasSearchResults(false);
      }
    }, 500); // Reduced to 500ms for better UX
  };

  // Update search results when query changes
  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery]);

  // Handle search input focus
  const handleSearchFocus = () => {
    setIsInputFocused(true);
  };

  // Handle search input blur
  const handleSearchBlur = () => {
    setTimeout(() => {
      setIsInputFocused(false);
    }, 200);
  };

  // Show search suggestions when input is focused
  const shouldShowSearchSuggestions =
    isInputFocused && searchQuery.length === 0;

  // Show searching state when typing
  const shouldShowSearching = searchQuery.length > 0 && isSearching;

  // Show search results or empty state when search is complete
  const shouldShowSearchResults = searchQuery.length > 0 && !isSearching;

  // Show default content when not searching and not focused
  const shouldShowDefaultContent =
    !shouldShowSearchResults && !shouldShowSearching && !isInputFocused;

  // Create data for FlatList based on current state
  const getFlatListData = () => {
    const data = [];

    // Add search suggestions when focused
    if (shouldShowSearchSuggestions) {
      data.push({ type: "searchSuggestions", id: "suggestions" });
    }

    // Add searching state
    if (shouldShowSearching) {
      data.push({ type: "searching", id: "searching" });
    }

    // Add search results or empty state
    if (shouldShowSearchResults) {
      if (hasSearchResults) {
        data.push({
          type: "searchResults",
          id: "results",
          results: searchResults,
        });
      } else {
        data.push({ type: "emptyState", id: "empty" });
      }
    }

    // Add default content
    if (shouldShowDefaultContent) {
      data.push({ type: "defaultContent", id: "default" });
    }

    return data;
  };

  // Render item for FlatList
  const renderFlatListItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case "searchSuggestions":
        return <SearchesResults searchResults={[]} searchQuery={searchQuery} />;

      case "searching":
        return (
          <YStack justifyContent="center" alignItems="center">
            <Spacer size={"$xl"} />
            <ActivityIndicator size="small" />
          </YStack>
        );

      case "searchResults":
        return (
          <SearchesResults
            searchResults={item.results}
            searchQuery={searchQuery}
          />
        );

      case "emptyState":
        return <EmptySearches />;

      case "defaultContent":
        return (
          <YStack>
            <Spacer size={"$md"} />
            <SectionHeader
              title={"All deals"}
              tintColor={"darkgrey"}
              image="dealIcon"
              seeAllText="View All"
              color="primary"
              onPressSeeAll={() => {}}
            />
            <Spacer size={"$reg"} />

            <ProductsHorizontalScroller />
            <Spacer size={"$md"} />
            <SectionHeader
              title={"All deals"}
              tintColor={"darkgrey"}
              image="dealIcon"
              seeAllText="View All"
              color="primary"
              onPressSeeAll={() => {}}
            />
            <Spacer size={"$reg"} />
            <YStack paddingHorizontal={"$md"}>
              <ProductsGridScroller />
            </YStack>
            <Spacer size={"$md"} />
            <SectionHeader
              title={"All deals"}
              tintColor={"darkgrey"}
              image="dealIcon"
              seeAllText="View All"
              color="primary"
              onPressSeeAll={() => {}}
            />
            <Spacer size={"$reg"} />
            <SalesHorizontalScroller />
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
          <OpTouch onPress={() => router.back()}>
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
            onSearch={(query) => setSearchQuery(query)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            width={"80%"}
          />

          <OpTouch onPress={() => router.push("/cart")}>
            <AppImage
              name="cartIcon"
              size={24}
              tintColor={getTokenValue("$white")}
            />
            <TextXSRegular
              position="absolute"
              top={-8}
              right={-10}
              borderRadius="$full"
              paddingHorizontal={"$xs-sm"}
              backgroundColor="$yellow"
              color="$white"
            >
              {"2"}
            </TextXSRegular>
          </OpTouch>
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
      />
    </>
  );
};

export default Search;
