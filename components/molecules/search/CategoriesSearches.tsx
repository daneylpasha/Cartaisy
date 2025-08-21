import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextMDBold } from "@/components/atoms/texts/TextMDBold";
import { TextSMMedium } from "@/components/atoms/texts/TextSMMedium";
import { XStack, YStack } from "tamagui";
import { CategorySuggestions } from "../CategorySuggestions";

type Props = { categories: string[]; onPick: (c: string) => void };
export const CategoriesSearches = ({ categories, onPick }: Props) => (
  <YStack paddingHorizontal={"$md"}>
    <XStack justifyContent="space-between" alignItems="center">
      <TextMDBold>{"Search By Category"}</TextMDBold>
      <OpTouch onPress={() => {}}>
        <TextSMMedium color="$primary">{"Clear All"}</TextSMMedium>
      </OpTouch>
    </XStack>
    <Spacer size={"$md"} />
    <CategorySuggestions />
  </YStack>
);
