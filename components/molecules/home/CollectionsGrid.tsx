import { CategoryGridItem } from "@/api/generated/cartaisyAPI.schemas";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { PressableButton } from "@/components/atoms/PressableButton";
import { TextSMMedium } from "@/components/atoms/texts";
import { SCREEN_WIDTH, SHADOW_STYLES } from "@/constants/styles";
import { tokens } from "@/tamagui/token";
import { extractNumericId } from "@/utils/extractNumericId";
import { router } from "expo-router";
import { FlatList, Platform } from "react-native";
import { Spacer, YStack } from "tamagui";

type CollectionsGridProps = {
  itemData?: CategoryGridItem[];
};
const PADDING = 16;
const GAP = 12;
const COLUMNS = 4;

const ITEM_WIDTH = (SCREEN_WIDTH - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

export const CollectionsGrid = ({
  itemData: categories,
}: CollectionsGridProps) => {
  // ✅ If no data provided, hide component completely
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <FlatList
      data={categories}
      keyExtractor={(category, index) =>
        category.id?.toString() || `category-${index}`
      }
      numColumns={4}
      columnWrapperStyle={{
        marginBottom: tokens.space.reg,
        gap: tokens.space.reg,
        paddingHorizontal: tokens.space.md,
      }}
      renderItem={({ item: category }) => {
        const handlePress = () => {
          if (category.collectionId) {
            router.push({
              pathname: "/products",
              params: {
                collectionId: extractNumericId(category.collectionId),
                categoryName: category.title,
              },
            });
          }
        };

        const content = (
          <>
            <YStack
              backgroundColor={"$white"}
              borderRadius={"$full"}
              alignItems="center"
              justifyContent="center"
              width={"$3xl"}
              height={"$3xl"}
              style={SHADOW_STYLES}
            >
              <AppImage
                style={{ borderRadius: 50 }}
                source={category.imageUrl}
                width={17}
                height={22}
              />
            </YStack>
            <Spacer size={"$sm"} />
            <TextSMMedium numberOfLines={2} textAlign="center" color="$secondary">
              {category.title || ""}
            </TextSMMedium>
          </>
        );

        if (Platform.OS === "android") {
          return (
            <PressableButton
              width={ITEM_WIDTH}
              alignItems="center"
              onPress={handlePress}
            >
              {content}
            </PressableButton>
          );
        }

        return (
          <OpTouch
            width={ITEM_WIDTH}
            alignItems="center"
            onPress={handlePress}
          >
            {content}
          </OpTouch>
        );
      }}
      showsHorizontalScrollIndicator={false}
    />
  );
};
