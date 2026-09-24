import { Product } from "@/api/types";
import { formatPrice } from "@/utils/formatPrice";
import {
  useAddFavorite,
  useRemoveFavorite,
} from "@/api/generated/favorites/favorites";
import { OpTouch } from "@/components/atoms/OpTouch";
import { SCREEN_WIDTH } from "@/constants/styles";
import { useAuthGuard } from "@/contexts/AuthGuardContext";
import useFavoritesStore from "@/store/useFavoritesStore";
import { tokens } from "@/tamagui/token";
import { useQueryClient } from "@tanstack/react-query";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useRef, useState, memo } from "react";
import { Animated, Platform, StyleSheet, UIManager } from "react-native";
import { getTokenValue, XStack, YStack } from "tamagui";

import {
  TextMDBold,
  TextMDSemiBold,
  TextSMMedium,
  TextSMRegular,
  TextXSRegular,
} from "../atoms";
import { AppImage } from "../atoms/AppImage";
import { Spacer } from "../atoms/Spacer";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Constants for width calculations
const GRID_SIDE_PADDING = tokens.space.md;
const GRID_COLUMN_GAP = tokens.space.md;
const GRID_NUM_COLUMNS = 2;
const GRID_CARD_WIDTH =
  (SCREEN_WIDTH -
    GRID_SIDE_PADDING * 2 -
    GRID_COLUMN_GAP * (GRID_NUM_COLUMNS - 1)) /
  GRID_NUM_COLUMNS;

const INLINE_CARD_WIDTH = 200;

// Browse imagery. Taller than the previous 163.5 / 200 / 140 frames so a
// product reads before its title, without changing the grid column math.
export const GRID_IMAGE_HEIGHT = 212;
export const INLINE_IMAGE_HEIGHT = 228;
export const SALES_IMAGE_HEIGHT = 168;

// Sales card width - shows ~2.5 cards with left padding
// Formula: (screenWidth - leftPadding) / 2.5 - gap adjustment
const SALES_CARD_WIDTH =
  (SCREEN_WIDTH - GRID_SIDE_PADDING) / 2.5 - GRID_COLUMN_GAP / 2;

type ProductCardProps = {
  product: Product;
  isFavorite?: boolean;
  showFavoriteIcon?: boolean;
  context: "grid" | "in-line" | "sales";
  showProgressBar?: boolean;
  onPress?: () => void;
};

const ProductCardComponent = ({
  product,
  isFavorite = false,
  showFavoriteIcon = false,
  context,
  showProgressBar = false,
  onPress,
}: ProductCardProps) => {
  const imageHeight =
    context === "grid"
      ? GRID_IMAGE_HEIGHT
      : context === "sales"
      ? SALES_IMAGE_HEIGHT
      : INLINE_IMAGE_HEIGHT;

  const pressScale = useRef(new Animated.Value(1)).current;
  const cardWidth =
    context === "grid"
      ? GRID_CARD_WIDTH
      : context === "sales"
      ? SALES_CARD_WIDTH
      : INLINE_CARD_WIDTH;

  // Auth guard for protected actions
  const { requireAuth } = useAuthGuard();

  // Use Zustand store for favorites
  const addFavoriteToStore = useFavoritesStore((state) => state.addFavorite);
  const removeFavoriteFromStore = useFavoritesStore(
    (state) => state.removeFavorite
  );

  // Query client for invalidation
  const queryClient = useQueryClient();

  // Local state for favorite - synced with prop
  const [isFavorited, setIsFavorited] = useState(isFavorite);

  // Sync local state with prop when it changes (important for Zustand updates)
  React.useEffect(() => {
    setIsFavorited(isFavorite);
  }, [isFavorite]);

  // Scale animation for heart
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Blink animation for heart (during API call)
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const blinkAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Start blinking animation
  const startBlinking = () => {
    // Stop any existing animation
    blinkAnimationRef.current?.stop();

    // Create looping blink animation
    blinkAnimationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.6,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    blinkAnimationRef.current.start();
  };

  // Stop blinking animation
  const stopBlinking = () => {
    blinkAnimationRef.current?.stop();
    blinkAnim.setValue(1);
  };

  // Add favorite mutation
  const { mutate: addFavoriteMutation } = useAddFavorite({
    mutation: {
      onMutate: () => {
        // Optimistic update: Add to Zustand store immediately
        addFavoriteToStore(product.productId);
      },
      onSuccess: () => {
        console.log("Successfully added to favorites");
        // Stop blinking animation on success
        stopBlinking();
        // Invalidate detailed favorites query to refetch wishlist
        queryClient.invalidateQueries({
          queryKey: ["/customer/favorites/detailed"],
        });
        // Zustand already updated in onMutate
      },
      onError: (error) => {
        console.error("Failed to add favorite:", error);
        // Revert optimistic update on error
        setIsFavorited(false);
        // Remove from Zustand store since API failed
        removeFavoriteFromStore(product.productId);
        // Stop blinking animation on error
        stopBlinking();
      },
    },
  });

  // Remove favorite mutation
  const { mutate: removeFavoriteMutation } = useRemoveFavorite({
    mutation: {
      onMutate: () => {
        // Optimistic update: Remove from Zustand store immediately
        removeFavoriteFromStore(product.productId);
      },
      onSuccess: () => {
        console.log("Successfully removed from favorites");
        // Stop blinking animation on success
        stopBlinking();
        // Invalidate detailed favorites query to refetch wishlist
        queryClient.invalidateQueries({
          queryKey: ["/customer/favorites/detailed"],
        });
        // Zustand already updated in onMutate
      },
      onError: (error) => {
        console.error("Failed to remove favorite:", error);
        // Revert optimistic update on error
        setIsFavorited(true);
        // Re-add to Zustand store since API failed
        addFavoriteToStore(product.productId);
        // Stop blinking animation on error
        stopBlinking();
      },
    },
  });

  // Return null if product doesn't have required fields. Keep this after hooks so
  // hook order remains stable across renders.
  if (!product?.productId || !product?.title || product?.price === undefined) {
    return null;
  }

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push({
        pathname: "/products/[id]",
        params: {
          id: product.productId,
        },
      });
    }
  };

  const handleFavoritePress = (e?: any) => {
    // Stop event propagation to prevent opening product page
    e?.stopPropagation?.();

    // Check if user is authenticated, show login modal if not
    const canProceed = requireAuth({
      type: "favorite",
      callback: () => {
        // This will be called after successful login
        performFavoriteAction(!isFavorited);
      },
    });

    if (!canProceed) return;

    performFavoriteAction(!isFavorited);
  };

  // Actual favorite action logic
  const performFavoriteAction = (willBeFavorited: boolean) => {
    // Heart pop animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Start blinking animation until API responds
    startBlinking();

    setIsFavorited(willBeFavorited);

    if (willBeFavorited) {
      // Add to favorites
      addFavoriteMutation({ data: { productId: product.productId } });
    } else {
      // Remove from favorites
      removeFavoriteMutation({ productId: product.productId });
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: pressScale }] }}>
    <OpTouch
      onPress={handlePress}
      activeOpacity={0.92}
      onPressIn={() => {
        Animated.timing(pressScale, {
          toValue: 0.98,
          duration: 120,
          useNativeDriver: true,
        }).start();
      }}
      onPressOut={() => {
        Animated.timing(pressScale, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }).start();
      }}
    >
      <YStack width={cardWidth}>
        <YStack
          borderRadius={tokens.radius["2xl"]}
          position="relative"
          overflow="hidden"
          borderWidth={1}
          borderColor="$grey"
          backgroundColor="$background"
        >
          <AppImage
            resizeMode="cover"
            source={product.images?.[0] || ""}
            width="100%"
            height={imageHeight}
          />

          {product.compareAtPrice &&
          product.price &&
          product.price < product.compareAtPrice ? (
            <XStack
              position="absolute"
              top={12}
              left={12}
              height={26}
              paddingHorizontal={10}
              backgroundColor="$error"
              borderRadius="$full"
              justifyContent="center"
              alignItems="center"
            >
              <AppImage
                name="discount"
                tintColor="$white"
                width={14}
                height={14}
              />
              <Spacer size="$xs-sm" />
              <TextSMMedium color="$white">
                -
                {Math.round(
                  ((product.compareAtPrice - product.price) /
                    product.compareAtPrice) *
                    100
                )}
                %
              </TextSMMedium>
            </XStack>
          ) : null}

          {/* Wishlist */}
          {showFavoriteIcon ? (
            <OpTouch
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              onPress={handleFavoritePress}
              style={styles.favoriteButton}
            >
              <BlurView style={styles.favoriteBlur} intensity={16} tint="dark">
                <Animated.View
                  style={{
                    transform: [{ scale: scaleAnim }],
                    opacity: blinkAnim,
                    width: 20,
                    height: 20,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <AppImage
                    name={isFavorited ? "wishlistIcon" : "heart"}
                    tintColor={
                      isFavorited
                        ? getTokenValue("$error")
                        : getTokenValue("$white")
                    }
                    width={isFavorited ? 22 : 20}
                    height={isFavorited ? 22 : 20}
                    resizeMode="contain"
                  />
                </Animated.View>
              </BlurView>
            </OpTouch>
          ) : null}
        </YStack>

        <YStack paddingVertical="$reg">
          {product.vendor ? (
            <>
              <TextXSRegular color="$textgrey" numberOfLines={1}>
                {product.vendor}
              </TextXSRegular>
              <Spacer size="$xs" />
            </>
          ) : null}
          <TextMDSemiBold
            color="$darkgrey"
            numberOfLines={2}
            minHeight={context === "grid" ? 44 : undefined}
          >
            {product.title ? String(product.title) : "Product"}
          </TextMDSemiBold>
          <Spacer size="$sm" />

          {/* <XStack alignItems="center">
            <RatingStar rating={product.rating || 0} />
            <Spacer size="$sm-reg" />
            <TextMDBold color="$secondary">
              {(product.rating || 0).toFixed(1)}
            </TextMDBold>
            <Spacer size="$xs" />
            <TextXSRegular color="$icon">
              ({(product.reviewsCount || 0).toLocaleString()})
            </TextXSRegular>
          </XStack>


          */}

          <XStack alignItems="center">
            <TextMDBold>
              {formatPrice(product.price, product.currency)}
            </TextMDBold>
            <Spacer size="$xs" />
            {product.compareAtPrice &&
            product.price &&
            product.price !== product.compareAtPrice ? (
              <TextSMRegular color="$icon" textDecorationLine="line-through">
                {formatPrice(product.compareAtPrice, product.currency)}
              </TextSMRegular>
            ) : null}
          </XStack>
        </YStack>
        <Spacer size="$sm-reg" />
        {/* {showProgressBar &&
        product.availableQuantity > 0 &&
        product.totalQuantity > 0 ? (
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
                width={`${
                  ((product.totalQuantity - product.availableQuantity) /
                    product.totalQuantity) *
                  100
                }%`}
                borderRadius="$full"
              />
            </YStack>
            <TextSMRegular color="$secondary">
              {Math.round(
                ((product.totalQuantity - product.availableQuantity) /
                  product.totalQuantity) *
                  100
              )}
              % Claimed
            </TextSMRegular>
          </XStack>
        ) : null} */}
      </YStack>
    </OpTouch>
    </Animated.View>
  );
};
// Memoize ProductCard to prevent unnecessary re-renders when parent re-renders with same props
export const ProductCard = memo(ProductCardComponent);

export {
  GRID_CARD_WIDTH,
  GRID_COLUMN_GAP,
  GRID_SIDE_PADDING,
  SALES_CARD_WIDTH,
};

const styles = StyleSheet.create({
  favoriteButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  favoriteBlur: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
