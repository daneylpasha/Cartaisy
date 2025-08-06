// components/molecules/ProductCard.tsx

import Icons from "@/assets/Icons";
import { OpTouch } from "@/components/atoms/OpTouch";
import { SCREEN_WIDTH } from "@/constants/styles";
import { tokens } from "@/tamagui/token";
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
  context: "grid" | "in-line";
  showProgressBar?: boolean;
};

export const ProductCard = ({
  product,
  context,
  showProgressBar = false,
}: ProductCardProps) => {
  const imageHeight = context === "grid" ? 163.5 : 240;
  const cardWidth = context === "grid" ? GRID_CARD_WIDTH : INLINE_CARD_WIDTH;

  return (
    <OpTouch onPress={product.onPress || (() => console.log("pressed"))}>
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
          {!product.wishlist && (
            <YStack
              opacity={0.2}
              backgroundColor="$black"
              position="absolute"
              bottom={12}
              right={12}
              width={40}
              height={40}
              justifyContent="center"
              alignItems="center"
              borderRadius="$full"
            >
              <OpTouch onPress={product.onToggleWishlist}>
                <AppImage
                  name="heart"
                  tintColor="$black"
                  width={21}
                  height={18}
                />
              </OpTouch>
            </YStack>
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
        ) : (
          <Spacer size="$reg" />
        )}
      </YStack>
    </OpTouch>
  );
};
export { GRID_CARD_WIDTH, GRID_COLUMN_GAP, GRID_SIDE_PADDING };
