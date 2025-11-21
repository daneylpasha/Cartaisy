import { CollectionFacets } from "@/api/generated/cartaisyAPI.schemas";
import { TextLGBold, TextMDSemiBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { PriceRangeSlider } from "@/components/molecules/PriceRangeSlider";
import { t } from "@/translations";
import { getTokenValue, XStack, YStack } from "tamagui";

export type FilterState = {
  sort: string;
  categories: string[];
  priceRange: [number, number];
  colors: string[];
  vendors?: string[];
  tags?: string[];
};

type FilterBottomSheetContentProps = {
  filterState: FilterState;
  onFilterChange: (filterState: FilterState) => void;
  facets?: CollectionFacets;
};

export const FilterBottomSheetContent = ({
  filterState,
  onFilterChange,
  facets,
}: FilterBottomSheetContentProps) => {
  const sortOptions = [
    { id: "CREATED", title: "Latest" },
    { id: "DISCOUNT", title: "Highest discounts" },
    { id: "RELEVANCE", title: "Relevance" },
    { id: "PRICE_LOW_TO_HIGH", title: "Price low to high" },
    { id: "PRICE_HIGH_TO_LOW", title: "Price high to low" },
  ];

  // Use facets from API or fallback to empty
  const categories =
    facets?.categories?.map((cat) => ({
      id: cat.value,
      title: cat.label || cat.value,
      count: cat.count,
    })) || [];

  // Color mapping for hex values
  const colorHexMap: Record<string, string> = {
    black: "#000000",
    white: "#FFFFFF",
    blue: "#0066FF",
    red: "#FF0000",
    green: "#00AA00",
    yellow: "#FFFF00",
    pink: "#FF1493",
    purple: "#9966CC",
    brown: "#8B4513",
    gray: "#808080",
    grey: "#808080",
    orange: "#FF8C00",
    beige: "#F5F5DC",
    navy: "#000080",
  };

  const colors =
    facets?.colors?.map((color) => ({
      id: color.value, // Keep original case for API compatibility
      title: color.label || color.value,
      color: colorHexMap[color.value.toLowerCase()] || "#000000",
      count: color.count,
    })) || [];

  const vendors =
    facets?.vendors?.map((vendor) => ({
      id: vendor.value,
      title: vendor.label || vendor.value,
      count: vendor.count,
    })) || [];

  const toggleSort = (sortId: string) => {
    onFilterChange({
      ...filterState,
      sort: filterState.sort === sortId ? "" : sortId,
    });
  };

  const toggleCategory = (categoryId: string) => {
    onFilterChange({
      ...filterState,
      categories: filterState.categories.includes(categoryId)
        ? filterState.categories.filter((id) => id !== categoryId)
        : [...filterState.categories, categoryId],
    });
  };

  const toggleColor = (colorId: string) => {
    onFilterChange({
      ...filterState,
      colors: filterState.colors.includes(colorId)
        ? filterState.colors.filter((id) => id !== colorId)
        : [...filterState.colors, colorId],
    });
  };

  const toggleVendor = (vendorId: string) => {
    onFilterChange({
      ...filterState,
      vendors: filterState.vendors?.includes(vendorId)
        ? filterState.vendors.filter((id) => id !== vendorId)
        : [...(filterState.vendors || []), vendorId],
    });
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
          <XStack flexWrap="wrap">
            {sortOptions.map((option) => (
              <OpTouch key={option.id} onPress={() => toggleSort(option.id)}>
                <XStack
                  alignItems="center"
                  marginBottom="$md"
                  paddingVertical="$xs"
                  width={130}
                >
                  {renderCheckbox(filterState.sort === option.id)}
                  <Spacer size="$md" />
                  <TextMDSemiBold color="$secondary" fontSize={14}>
                    {option.title}
                  </TextMDSemiBold>
                </XStack>
              </OpTouch>
            ))}
          </XStack>
        </YStack>

        <Spacer size="$lg" />

        {/* Category Section */}
        {categories.length < 0 && (
          <YStack>
            <TextLGBold marginBottom="$md">
              {t("sortfilter.headtwo")}
            </TextLGBold>
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
            <Spacer size="$lg" />
          </YStack>
        )}

        {/* Price Section */}
        <YStack>
          <TextLGBold marginBottom="$md">
            {t("sortfilter.headtthree")}
          </TextLGBold>
          <PriceRangeSlider
            minValue={
              facets?.priceRange?.min !== undefined &&
              !isNaN(facets.priceRange.min)
                ? Math.floor(facets.priceRange.min)
                : 0
            }
            maxValue={
              facets?.priceRange?.max !== undefined &&
              !isNaN(facets.priceRange.max)
                ? Math.ceil(facets.priceRange.max)
                : 1000
            }
            initialMinValue={
              !isNaN(filterState.priceRange[0])
                ? filterState.priceRange[0]
                : facets?.priceRange?.min || 0
            }
            initialMaxValue={
              !isNaN(filterState.priceRange[1])
                ? filterState.priceRange[1]
                : facets?.priceRange?.max || 1000
            }
            onValueChange={(min, max) => {
              onFilterChange({
                ...filterState,
                priceRange: [min, max],
              });
            }}
          />
        </YStack>

        <Spacer size="$lg" />

        {/* Vendors Section - only show if vendors exist */}
        {vendors.length > 0 && (
          <>
            <YStack>
              <TextLGBold marginBottom="$md">Brands</TextLGBold>
              {Array.from(
                { length: Math.ceil(vendors.length / 2) },
                (_, rowIndex) => (
                  <XStack
                    key={rowIndex}
                    justifyContent="space-between"
                    marginBottom="$md"
                  >
                    {vendors
                      .slice(rowIndex * 2, rowIndex * 2 + 2)
                      .map((vendor) => (
                        <OpTouch
                          key={vendor.id}
                          onPress={() => toggleVendor(vendor.id)}
                          flex={1}
                        >
                          <XStack
                            alignItems="center"
                            marginRight="$md"
                            paddingVertical="$xs"
                          >
                            {renderCheckbox(
                              filterState.vendors?.includes(vendor.id) || false
                            )}
                            <Spacer size="$md" />
                            <TextMDSemiBold
                              color="$secondary"
                              fontSize={14}
                              flex={1}
                            >
                              {vendor.title} ({vendor.count})
                            </TextMDSemiBold>
                          </XStack>
                        </OpTouch>
                      ))}
                  </XStack>
                )
              )}
            </YStack>
            <Spacer size="$lg" />
          </>
        )}

        {/* Colors Section - only show if colors exist */}
        {colors.length > 0 && (
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
                        <TextMDSemiBold
                          color="$secondary"
                          fontSize={14}
                          flex={1}
                        >
                          {color.title} ({color.count})
                        </TextMDSemiBold>
                      </XStack>
                    </OpTouch>
                  ))}
                </XStack>
              )
            )}
          </YStack>
        )}
      </YStack>
    </YStack>
  );
};
