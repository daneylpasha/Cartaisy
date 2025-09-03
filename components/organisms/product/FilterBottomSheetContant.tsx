import { TextLGBold, TextMDSemiBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { PriceRangeSlider } from "@/components/molecules/PriceRangeSlider";
import { t } from "@/translations";
import { useState } from "react";
import { getTokenValue, XStack, YStack } from "tamagui";

type FilterState = {
  sort: string;
  categories: string[];
  priceRange: [number, number];
  colors: string[];
};

export const FilterBottomSheetContent = () => {
  const [filterState, setFilterState] = useState<FilterState>({
    sort: "",
    categories: [],
    priceRange: [0, 1000],
    colors: [],
  });

  const sortOptions = [
    { id: "latest", title: "Latest" },
    { id: "highest", title: "Highest discounts" },
    { id: "relevance", title: "Relevance" },
    { id: "low-high", title: "Price low to high" },
    { id: "high-low", title: "Price high to low" },
  ];

  const categories = [
    { id: "bottoms", title: "Bottoms", count: 3 },
    { id: "hats", title: "Hats", count: 2 },
    { id: "homeware", title: "Homeware", count: 0 },
    { id: "hoodies", title: "Hoodies", count: 1 },
    { id: "jackets", title: "Jackets", count: 14 },
    { id: "shoes", title: "Shoes", count: 10 },
    { id: "sweatshirts", title: "Sweatshirts", count: 4 },
    { id: "tshirts", title: "T-Shirts", count: 7 },
  ];

  const colors = [
    { id: "black", title: "Black", color: "#000000", count: 0 },
    { id: "blue", title: "Blue", color: "#0066FF", count: 8 },
    { id: "brown", title: "Brown", color: "#8B4513", count: 4 },
    { id: "gray", title: "Gray", color: "#808080", count: 1 },
    { id: "green", title: "Green", color: "#00AA00", count: 3 },
    { id: "pink", title: "Pink", color: "#FF1493", count: 1 },
    { id: "purple", title: "Purple", color: "#9966CC", count: 1 },
    { id: "red", title: "Red", color: "#FF0000", count: 7 },
  ];

  const toggleSort = (sortId: string) => {
    setFilterState((prev) => ({
      ...prev,
      sort: prev.sort === sortId ? "" : sortId,
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setFilterState((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const toggleColor = (colorId: string) => {
    setFilterState((prev) => ({
      ...prev,
      colors: prev.colors.includes(colorId)
        ? prev.colors.filter((id) => id !== colorId)
        : [...prev.colors, colorId],
    }));
  };

  const renderCheckbox = (isSelected: boolean) => (
    <YStack
      width={18}
      height={18}
      borderRadius={4}
      borderWidth={1}
      borderColor={isSelected ? "$primary" : "$lightgrey"}
      backgroundColor={isSelected ? "$primary" : "transparent"}
      alignItems="center"
      justifyContent="center"
    >
      {isSelected && (
        <AppImage
          name="check"
          width={10}
          height={10}
          tintColor={getTokenValue("$white")}
        />
      )}
    </YStack>
  );

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Content */}
      <YStack flex={1} paddingHorizontal="$md">
        {/* Sort Section */}
        <YStack paddingVertical="$md">
          <TextLGBold marginBottom="$md">{t("sortfilter.headOne")}</TextLGBold>
          {sortOptions.map((option) => (
            <OpTouch key={option.id} onPress={() => toggleSort(option.id)}>
              <XStack
                alignItems="center"
                marginBottom="$md"
                paddingVertical="$xs"
              >
                {renderCheckbox(filterState.sort === option.id)}
                <Spacer size="$md" />
                <TextMDSemiBold color="$secondary" fontSize={14}>
                  {option.title}
                </TextMDSemiBold>
              </XStack>
            </OpTouch>
          ))}
        </YStack>

        <Spacer size="$lg" />

        {/* Category Section */}
        <YStack>
          <TextLGBold marginBottom="$md">{t("sortfilter.headtwo")}</TextLGBold>
          {Array.from(
            { length: Math.ceil(categories.length / 2) },
            (_, rowIndex) => (
              <XStack
                key={rowIndex}
                justifyContent="space-between"
                marginBottom="$md"
              >
                {categories
                  .slice(rowIndex * 2, rowIndex * 2 + 2)
                  .map((category) => (
                    <OpTouch
                      key={category.id}
                      onPress={() => toggleCategory(category.id)}
                      flex={1}
                    >
                      <XStack
                        alignItems="center"
                        marginRight="$md"
                        paddingVertical="$xs"
                      >
                        {renderCheckbox(
                          filterState.categories.includes(category.id)
                        )}
                        <Spacer size="$md" />
                        <TextMDSemiBold
                          color="$secondary"
                          fontSize={14}
                          flex={1}
                        >
                          {category.title} ({category.count})
                        </TextMDSemiBold>
                      </XStack>
                    </OpTouch>
                  ))}
              </XStack>
            )
          )}
        </YStack>

        <Spacer size="$lg" />

        {/* Price Section */}
        <YStack>
          <TextLGBold marginBottom="$md">
            {t("sortfilter.headtthree")}
          </TextLGBold>
          <PriceRangeSlider
            minValue={0}
            maxValue={1000}
            initialMinValue={filterState.priceRange[0]}
            initialMaxValue={filterState.priceRange[1]}
            onValueChange={(min, max) => {
              setFilterState((prev) => ({
                ...prev,
                priceRange: [min, max],
              }));
            }}
          />
        </YStack>

        <Spacer size="$lg" />

        {/* Colors Section */}
        <YStack>
          <TextLGBold marginBottom="$md">
            {t("sortfilter.headfouth")}
          </TextLGBold>
          {Array.from(
            { length: Math.ceil(colors.length / 2) },
            (_, rowIndex) => (
              <XStack
                key={rowIndex}
                justifyContent="space-between"
                marginBottom="$md"
              >
                {colors.slice(rowIndex * 2, rowIndex * 2 + 2).map((color) => (
                  <OpTouch
                    key={color.id}
                    onPress={() => toggleColor(color.id)}
                    flex={1}
                  >
                    <XStack
                      alignItems="center"
                      marginRight="$md"
                      paddingVertical="$xs"
                    >
                      <YStack
                        width={20}
                        height={20}
                        borderRadius={10}
                        backgroundColor={color.color}
                        borderWidth={color.color === "#FFFFFF" ? 1 : 0}
                        borderColor="$lightgrey"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {filterState.colors.includes(color.id) && (
                          <AppImage
                            name="check"
                            width={8}
                            height={8}
                            tintColor={
                              color.color === "#FFFFFF" ||
                              color.color === "#FFFF00"
                                ? getTokenValue("$black")
                                : getTokenValue("$white")
                            }
                          />
                        )}
                      </YStack>
                      <Spacer size="$md" />
                      <TextMDSemiBold color="$secondary" fontSize={14} flex={1}>
                        {color.title} ({color.count})
                      </TextMDSemiBold>
                    </XStack>
                  </OpTouch>
                ))}
              </XStack>
            )
          )}
        </YStack>
      </YStack>
    </YStack>
  );
};
