// components/molecules/ProductCard.tsx

import Icons from "@/assets/Icons";
import { OpTouch } from "@/components/atoms/OpTouch";
import { SCREEN_WIDTH } from "@/constants/styles";
import { tokens } from "@/tamagui/token";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { StyleSheet } from "react-native";
import { getTokenValue, XStack, YStack } from "tamagui";
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

// Constants for width calculations
const GRID_SIDE_PADDING = tokens.space.md;
const GRID_COLUMN_GAP = tokens.space.md;
const GRID_NUM_COLUMNS = 2;
const GRID_CARD_WIDTH =
  (SCREEN_WIDTH -
    GRID_SIDE_PADDING * 2 -
    GRID_COLUMN_GAP * (GRID_NUM_COLUMNS - 1)) /
  GRID_NUM_COLUMNS;

const INLINE_CARD_WIDTH = 240;

type Product = {
  id: string;
  title: string;
  image: keyof typeof Icons;
  currentPrice: number;
  originalPrice?: number;
  discountPercent?: number;
  progressValue?: number;
  showProgressBar?: boolean;
  ratingValue?: number;
  totalReviewCount?: number;
  wishlist?: boolean;
  discountBadge?: boolean;
  onToggleWishlist?: () => void;
  onPress?: () => void;
};

type ProductCardProps = {
  product: Product;
  isFavorite?: boolean;
  showFavoriteIcon?: boolean;
  context: "grid" | "in-line";
  showProgressBar?: boolean;
};

export const ProductCard = ({
  product,
  isFavorite = false,
  showFavoriteIcon = false,
  context,
  showProgressBar = false,
}: ProductCardProps) => {
  const imageHeight = context === "grid" ? 163.5 : 240;
  const cardWidth = context === "grid" ? GRID_CARD_WIDTH : INLINE_CARD_WIDTH;

  return (
    <OpTouch
      onPress={
        product.onPress || (() => router.push(`/products/${product.id}`))
      }
    >
      <YStack width={cardWidth}>
        <YStack
          borderRadius={tokens.space.md}
          position="relative"
          overflow="hidden"
          borderWidth={1}
          borderColor="$lightgrey"
          backgroundColor="$white"
        >
          <AppImage name={product.image} width="100%" height={imageHeight} />

          {!product.discountBadge && (
            <XStack
              position="absolute"
              top={12}
              left={12}
              width={76}
              height={26}
              backgroundColor="$error"
              borderRadius="$full"
              justifyContent="center"
              alignItems="center"
            >
              <AppImage
                name="discount"
                tintColor="$black"
                width={14}
                height={14}
              />
              <Spacer size="$xs-sm" />
              <TextSMMedium color="$white">
                -{product.discountPercent}%
              </TextSMMedium>
            </XStack>
          )}

          {/* Wishlist */}
          {showFavoriteIcon && (
            <OpTouch onPress={product.onToggleWishlist}>
              <BlurView style={styles.blurView} intensity={16} tint="dark">
                {isFavorite ? (
                  <AppImage
                    name="wishlistIcon"
                    tintColor={getTokenValue("$error")}
                    width={21}
                    height={18}
                  />
                ) : (
                  <AppImage
                    name="heart"
                    tintColor={getTokenValue("$white")}
                    width={21}
                    height={18}
                  />
                )}
              </BlurView>
            </OpTouch>
          )}
        </YStack>

        <YStack paddingVertical="$reg">
          <TextMDSemiBold numberOfLines={2}>{product.title}</TextMDSemiBold>
          <Spacer size="$sm-reg" />

          {product.ratingValue !== undefined && (
            <XStack alignItems="center">
              <RatingStar rating={product.ratingValue} />
              <Spacer size="$sm-reg" />
              <TextMDBold color="$secondary">
                {product.ratingValue.toFixed(1)}
                <Spacer size="$xs" />
                <TextXSRegular color="$icon">
                  ({product.totalReviewCount?.toLocaleString()})
                </TextXSRegular>
              </TextMDBold>
            </XStack>
          )}

          {<Spacer size="$sm-reg" />}

          {product.currentPrice !== undefined && (
            <XStack alignItems="center">
              <TextXLBold>${product.currentPrice.toFixed(2)}</TextXLBold>
              <Spacer size="$xs" />
              {product.originalPrice && (
                <TextSMRegular color="$icon" textDecorationLine="line-through">
                  ${product.originalPrice.toFixed(2)}
                </TextSMRegular>
              )}
            </XStack>
          )}
        </YStack>

        {!showProgressBar && product.progressValue ? (
          <XStack alignItems="center" gap="$sm">
            <YStack
              borderRadius="$full"
              width={80}
              height={8}
              backgroundColor="$grey"
            >
              <YStack
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                backgroundColor="$primary"
                height="100%"
                width={`${product.progressValue}%`}
                borderRadius="$full"
              />
            </YStack>
            <TextSMRegular color="$secondary">
              {product.progressValue}% Claimed
            </TextSMRegular>
          </XStack>
        ) : // <Spacer size="$reg" />
        null}
      </YStack>
    </OpTouch>
  );
};
export { GRID_CARD_WIDTH, GRID_COLUMN_GAP, GRID_SIDE_PADDING };

const styles = StyleSheet.create({
  blurView: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    overflow: "hidden",
  },
});
