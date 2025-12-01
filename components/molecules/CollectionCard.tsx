// components/molecules/CategoryCard.tsx

import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { GRID_CARD_WIDTH } from "@/components/molecules/ProductCard";
import { tokens } from "@/tamagui/token";
import { extractNumericId } from "@/utils/extractNumericId";
import { router } from "expo-router";
import { StyleSheet } from "react-native";
import { YStack } from "tamagui";
import { Spacer } from "../atoms/Spacer";
import { TextMDRegular } from "../atoms/texts/TextMDRegular";
type CategoryItem = {
  collectionId: string;
  title: string;
  image: string;
};

type CategoryCardListProps = {
  item: CategoryItem;
  onPressItem?: (item: CategoryItem) => void;
};

export const CollectionCard = ({ item }: CategoryCardListProps) => {
  return (
    <OpTouch
      width={GRID_CARD_WIDTH}
      onPress={() =>
        router.push({
          pathname: "/products",
          params: {
            collectionId: extractNumericId(item.collectionId),
            categoryName: item.title,
          },
        })
      }
    >
      <YStack borderRadius={"$md"}>
        <AppImage
          resizeMode="cover"
          style={Styles.ImageStyle}
          source={item.image}
        />
        <Spacer size={"$sm"} />
        <TextMDRegular textAlign="center">{item.title}</TextMDRegular>
      </YStack>
    </OpTouch>
  );
};
const Styles = StyleSheet.create({
  ImageStyle: {
    borderRadius: tokens.radius["md"],
    borderWidth: 1,
    borderColor: tokens.color.grey,
    height: GRID_CARD_WIDTH,
    width: GRID_CARD_WIDTH,
  },
});
