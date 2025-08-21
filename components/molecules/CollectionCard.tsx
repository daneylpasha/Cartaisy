// components/molecules/CategoryCard.tsx

import Icons from "@/assets/Icons";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { GRID_CARD_WIDTH } from "@/components/molecules/ProductCard";
import { tokens } from "@/tamagui/token";
import { router } from "expo-router";
import { StyleSheet } from "react-native";
import { YStack } from "tamagui";
import { Spacer } from "../atoms/Spacer";
import { TextMDRegular } from "../atoms/texts/TextMDRegular";
type CategoryItem = {
  id: string;
  image: keyof typeof Icons;
  name: string;
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
          params: { categoryName: item.name },
        })
      }
    >
      <YStack borderRadius={"$2xl"}>
        <AppImage style={Styles.ImageStyle} name={item.image} />
        <Spacer size={"$sm"} />
        <TextMDRegular textAlign="center">{item.name}</TextMDRegular>
      </YStack>
    </OpTouch>
  );
};
const Styles = StyleSheet.create({
  ImageStyle: {
    borderRadius: tokens.radius["2xl"],
    borderWidth: 1,
    borderColor: tokens.color.grey,
    height: GRID_CARD_WIDTH,
    width: GRID_CARD_WIDTH,
  },
});
