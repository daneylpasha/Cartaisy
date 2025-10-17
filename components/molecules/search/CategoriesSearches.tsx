import { Spacer } from "@/components/atoms/Spacer";
import { YStack } from "tamagui";
import { CategorySuggestions } from "../CategorySuggestions";

type Props = {
  categories: string[];
  onPick: (c: string) => void;
  categoryCollectionGrid?: any[];
  onCollectionClick?: (collectionId: string, collectionTitle: string) => void;
};
export const CategoriesSearches = ({
  categories,
  onPick,
  categoryCollectionGrid,
  onCollectionClick,
}: Props) => (
  <YStack>
    <Spacer size={"$md"} />
    <CategorySuggestions
      categoryCollectionGrid={categoryCollectionGrid}
      onCollectionClick={onCollectionClick}
    />
  </YStack>
);
