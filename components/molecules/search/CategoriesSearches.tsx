import { Spacer } from "@/components/atoms/Spacer";
import { YStack } from "tamagui";
import { CategorySuggestions } from "../CategorySuggestions";

type Props = {
  categories: string[];
  onPick: (c: string) => void;
  categoryCollectionGrid?: any[];
};
export const CategoriesSearches = ({
  categories,
  onPick,
  categoryCollectionGrid,
}: Props) => (
  <YStack>
    <Spacer size={"$md"} />
    <CategorySuggestions categoryCollectionGrid={categoryCollectionGrid} />
  </YStack>
);
