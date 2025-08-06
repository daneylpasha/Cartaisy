import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { TextSMMedium } from "@/components/atoms/texts";
import { SCREEN_WIDTH } from "@/constants/styles";
import { tokens } from "@/tamagui/token";
import { FlatList } from "react-native";
import { Spacer, YStack } from "tamagui";

type CollectionsGridProps = {
  item: any;
};
const PADDING = 16;
const GAP = 12;
const COLUMNS = 4;

const ITEM_WIDTH = (SCREEN_WIDTH - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

export const CollectionsGrid = ({ item }: CollectionsGridProps) => {
  return (
    <FlatList
      data={item}
      keyExtractor={(item) => item.id.toString()}
      numColumns={4}
      columnWrapperStyle={{
        marginBottom: tokens.space.reg,
        gap: tokens.space.reg,
        paddingHorizontal: tokens.space.md,
      }}
      renderItem={({ item }) => (
        <OpTouch
          width={ITEM_WIDTH}
          alignItems="center"
          onPress={() => {
            console.log("pressed");
          }}
        >
          <YStack
            backgroundColor={"$white"}
            borderRadius={"$full"}
            alignItems="center"
            justifyContent="center"
            width={48}
            height={48}
            shadowColor="$black"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={3.84}
          >
            <AppImage name={item.image} width={17} height={22} />
          </YStack>
          <Spacer size={"$sm"} />
          <TextSMMedium numberOfLines={2} textAlign="center" color="$secondary">
            {item.name}
          </TextSMMedium>
        </OpTouch>
      )}
      showsHorizontalScrollIndicator={false}
    />
  );
};
