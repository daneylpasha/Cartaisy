import Icons from "@/assets/Icons";
import { TextMDBold, TextSMMedium } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Divider } from "@/components/atoms/Divider";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextMDRegular } from "@/components/atoms/texts/TextMDRegular";
import type { EnrichedProduct, CollectionWithProducts } from "@/api/generated/cartaisyAPI.schemas";
import type { Product } from "@/api/types";
import { FlatList } from "react-native";
import { XStack, YStack } from "tamagui";

export type SearchSuggestionItemData = {
  id: number | string;
  title: string;
  image?: keyof typeof Icons;
  type?: string;
  productData?: EnrichedProduct | Product;
  collectionData?: CollectionWithProducts;
};

type Props = {
  title: string;
  data: SearchSuggestionItemData[];
  onPick: (title: string, item: SearchSuggestionItemData) => void;
  onClearAll: () => void;
  defaultIcon?: keyof typeof Icons; // Optional default icon if item doesn't have image
  hideClearAll?: boolean; // Hide Clear All button
};

const SearchSuggestionItem = ({
  item,
  defaultIcon,
  onPress,
}: {
  item: SearchSuggestionItemData;
  defaultIcon?: keyof typeof Icons;
  onPress?: () => void;
}) => {
  // Get product or collection image URL
  // Product images are stored in the images array
  // Collection images are stored in the image property
  const productImageUrl = item.productData?.images?.[0];
  const collectionImageUrl = item.collectionData?.image;
  const imageUrl = productImageUrl || collectionImageUrl;

  return (
    <OpTouch onPress={onPress}>
      <XStack paddingVertical={"$md"} alignItems="center" gap="$sm">
        {/* Product/Collection Image or Icon */}
        {imageUrl ? (
          <AppImage
            source={imageUrl}
            width={40}
            height={40}
            resizeMode="cover"
            style={{ borderRadius: 8 }}
          />
        ) : (
          <AppImage
            name={
              (item.image as keyof typeof Icons) || defaultIcon || "searchIcon"
            }
            width={20}
            height={20}
          />
        )}

        {/* Title */}
        <TextMDRegular flex={1} numberOfLines={2}>
          {item.title}
        </TextMDRegular>
      </XStack>
      <Divider />
    </OpTouch>
  );
};

export const SearchSuggestions = ({
  title,
  data,
  onPick,
  onClearAll,
  defaultIcon,
  hideClearAll = false,
}: Props) => (
  <YStack>
    <XStack
      borderColor="$lightgrey"
      justifyContent="space-between"
      alignItems="center"
    >
      <TextMDBold>{title}</TextMDBold>

      {!hideClearAll && (
        <OpTouch onPress={onClearAll}>
          <TextSMMedium color="$primary">{"Clear All"}</TextSMMedium>
        </OpTouch>
      )}
    </XStack>
    <Spacer size={"$reg"} />
    <FlatList
      data={data}
      renderItem={({ item }) => {
        // Get product or collection image URL
        const productImageUrl = item.productData?.images?.[0];
        const collectionImageUrl = item.collectionData?.image;
        const imageUrl = productImageUrl || collectionImageUrl;

        return (
          <OpTouch onPress={() => onPick(item.title, item)}>
            <XStack paddingVertical={"$md"} alignItems="center" gap="$sm">
              {imageUrl ? (
                <AppImage
                  source={imageUrl}
                  width={40}
                  height={40}
                  resizeMode="cover"
                  style={{ borderRadius: 8 }}
                />
              ) : (
                <AppImage
                  name={
                    (item.image as keyof typeof Icons) ||
                    defaultIcon ||
                    "searchIcon"
                  }
                  width={20}
                  height={20}
                />
              )}

              <TextMDRegular flex={1} numberOfLines={2}>
                {item.title}
              </TextMDRegular>
            </XStack>
            <Divider />
          </OpTouch>
        );
      }}
      keyExtractor={(item) => item.id.toString()}
    />
  </YStack>
);
export { SearchSuggestionItem };
