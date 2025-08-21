import Icons from "@/assets/Icons";
import { TextMDBold, TextSMMedium } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Divider } from "@/components/atoms/Divider";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextMDRegular } from "@/components/atoms/texts/TextMDRegular";
import { FlatList } from "react-native";
import { XStack, YStack } from "tamagui";

type Props = {
  title: string;
  data: { id: number; title: string; image?: keyof typeof Icons }[];
  onPick: (t: string) => void;
  onClearAll: () => void;
  defaultIcon?: keyof typeof Icons; // Optional default icon if item doesn't have image
};

const SearchSuggestionItem = ({
  item,
  defaultIcon,
}: {
  item: { id: number; title: string; image?: keyof typeof Icons };
  defaultIcon?: keyof typeof Icons;
}) => (
  <OpTouch>
    <XStack
      justifyContent="space-between"
      paddingVertical={"$md"}
      alignItems="center"
    >
      <TextMDRegular>{item.title}</TextMDRegular>
      <Spacer size={"$sm"} />
      <OpTouch onPress={() => console.log(item)}>
        <AppImage
          name={item.image || defaultIcon || "searchIcon"}
          width={16}
          height={16}
        />
      </OpTouch>
    </XStack>
    <Divider />
  </OpTouch>
);

export const SearchSuggestions = ({
  title,
  data,
  onPick,
  onClearAll,
  defaultIcon,
}: Props) => (
  <YStack>
    <XStack
      borderColor="$lightgrey"
      justifyContent="space-between"
      alignItems="center"
    >
      <TextMDBold>{title}</TextMDBold>

      <OpTouch onPress={onClearAll}>
        <TextSMMedium color="$primary">Clear All</TextSMMedium>
      </OpTouch>
    </XStack>
    <Spacer size={"$reg"} />
    <FlatList
      data={data}
      renderItem={({ item }) => (
        <SearchSuggestionItem item={item} defaultIcon={defaultIcon} />
      )}
      keyExtractor={(item) => item.id.toString()}
    />
  </YStack>
);
export { SearchSuggestionItem };
