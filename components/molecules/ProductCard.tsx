// components/molecules/ProductCard.tsx

import Icons from "@/assets/Icons";
import { OpTouch } from "@/components/atoms/OpTouch";
import { tokens } from "@/tamagui/token";
import { FlatList } from "react-native";
import { XStack, YStack } from "tamagui";
import {
  TextMDBold,
  TextMDSemiBold,
  TextSMMedium,
  TextSMRegular,
  TextXLBold,
  TextXSRegular,
} from "../atoms";
import { AppImage } from "../atoms/AppImage";
import { Spacer } from "../atoms/Spacer";
import { RatingStar } from "../organisms/home/RatingStar";
type ProductCardItem = {
  id: number;
  image: keyof typeof Icons;
  title: string;
  width: number | string;
  height: number;

  showDiscountBadge?: boolean;
  discountPercent?: number;

  showWishlistButton?: boolean;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;

  showRating?: boolean;
  ratingValue?: number;
  totalReviewCount?: number;

  showPrice?: boolean;
  currentPrice?: number;
  originalPrice?: number;
  price?: number;

  isCategoryCard?: boolean;
};

type ProductCardProps = {
  item: ProductCardItem[];
  layout?: "horizontal" | "vertical";
  numColumns?: number;
  width?: number;
  height?: number;
  loading?: boolean;
  onEndReached?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
};

export const ProductCard = ({
  item,
  layout = "horizontal",
  numColumns = 2,
  width = 240,
  height = 240,
  onEndReached,
  onRefresh,
  refreshing = false,
}: ProductCardProps) => {
  return (
    <FlatList
      data={item}
      keyExtractor={(item) => item.id.toString()}
      horizontal={layout === "horizontal"}
      numColumns={layout === "vertical" ? numColumns : undefined}
      showsHorizontalScrollIndicator={false}
      onEndReached={onEndReached}
      onRefresh={onRefresh}
      refreshing={refreshing}
      contentContainerStyle={{
        // rowGap: tokens.space.md,
        paddingHorizontal: tokens.space.md,
        gap: layout === "horizontal" ? tokens.space.md : undefined,
        // columnGap: tokens.space.md,
      }}
      renderItem={({ item }) => (
        <OpTouch
          onPress={() => {
            console.log("pressed");
          }}
        >
          <YStack
            width={width}
            flex={layout === "vertical" ? 1 : undefined}
            margin={layout === "vertical" ? tokens.space.sm : undefined}
          >
            <YStack
              borderRadius={tokens.space.md}
              position="relative"
              overflow="hidden"
              borderWidth={1}
              borderColor="$lightgrey"
              backgroundColor="$white"
            >
              <AppImage
                name={item.image}
                width="100%"
                height={layout === "vertical" ? height : 240}
              />

              {item.discountPercent && (
                <XStack
                  position="absolute"
                  top={12}
                  left={12}
                  width={76}
                  height={26}
                  backgroundColor="$error"
                  borderRadius={"$full"}
                  justifyContent="center"
                  alignItems="center"
                >
                  <AppImage
                    name="discount"
                    tintColor="$black"
                    width={14}
                    height={14}
                  />
                  <Spacer size={"$xs-sm"} />
                  <TextSMMedium color="$white">
                    -{item.discountPercent}%
                  </TextSMMedium>
                </XStack>
              )}

              {/* {item.showDiscountBadge && item.discountPercent && (
              )} */}

              <YStack
                opacity={0.2}
                backgroundColor={"$black"}
                position="absolute"
                bottom={12}
                right={12}
                width={40}
                height={40}
                justifyContent="center"
                alignItems="center"
                borderRadius="$full"
              >
                <OpTouch onPress={item.onToggleWishlist}>
                  <AppImage
                    name="heart"
                    tintColor="$black"
                    width={21}
                    height={18}
                  />
                </OpTouch>
              </YStack>
            </YStack>
            <YStack paddingVertical="$reg">
              <TextMDSemiBold numberOfLines={2}>{item.title}</TextMDSemiBold>
              <Spacer size={"$sm-reg"} />
              {item.showRating && item.ratingValue !== undefined && (
                <XStack alignItems="center">
                  <RatingStar rating={item.ratingValue} />
                  <Spacer size={"$sm-reg"} />
                  <TextMDBold color="$secondary">
                    {item.ratingValue.toFixed(1)}
                    <Spacer size={"$xs"} />
                    <TextXSRegular color="$icon">
                      ({item.totalReviewCount?.toLocaleString()})
                    </TextXSRegular>
                  </TextMDBold>
                </XStack>
              )}
              <Spacer size={"$sm-reg"} />
              {item.showPrice && item.currentPrice !== undefined && (
                <XStack alignItems="center">
                  <TextXLBold>${item.currentPrice.toFixed(2)}</TextXLBold>
                  <Spacer size={"$xs"} />
                  {item.originalPrice && (
                    <TextSMRegular
                      color="$icon"
                      textDecorationLine="line-through"
                    >
                      ${item.originalPrice.toFixed(2)}
                    </TextSMRegular>
                  )}
                </XStack>
              )}
            </YStack>
          </YStack>
        </OpTouch>
      )}
    />
  );
};
