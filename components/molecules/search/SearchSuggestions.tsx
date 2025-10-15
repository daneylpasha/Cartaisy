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
  hideClearAll?: boolean; // Hide Clear All button
};

const SearchSuggestionItem = ({
  item,
  defaultIcon,
  onPress,
}: {
  item: {
    id: number | string;
    title: string;
    image?: keyof typeof Icons | string;
    productData?: any;
  };
  defaultIcon?: keyof typeof Icons;
  onPress?: () => void;
}) => {
  // Get product image URL from productData if available
  const productImageUrl = item.productData?.featuredImage?.url;

  return (
    <OpTouch onPress={onPress}>
      <XStack paddingVertical={"$md"} alignItems="center" gap="$sm">
        {/* Product Image or Icon */}
        {productImageUrl ? (
          <AppImage
            source={productImageUrl}
            width={40}
            height={40}
            resizeMode="cover"
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

        {/* Product Title */}
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
      renderItem={({ item }) => (
        <OpTouch onPress={() => onPick(item.title)}>
          <XStack paddingVertical={"$md"} alignItems="center" gap="$sm">
            <AppImage
              name={
                (item.image as keyof typeof Icons) ||
                defaultIcon ||
                "searchIcon"
              }
              width={20}
              height={20}
            />

            <TextMDRegular flex={1} numberOfLines={2}>
              {item.title}
            </TextMDRegular>
          </XStack>
          <Divider />
        </OpTouch>
      )}
      keyExtractor={(item) => item.id.toString()}
    />
  </YStack>
);
export { SearchSuggestionItem };
