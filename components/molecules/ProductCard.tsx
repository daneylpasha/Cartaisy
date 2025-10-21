import { Product } from "@/api/generated/cartaisyAPI.schemas";
import {
  useAddFavorite,
  useRemoveFavorite,
} from "@/api/generated/favorites/favorites";
import { OpTouch } from "@/components/atoms/OpTouch";
import { SCREEN_WIDTH } from "@/constants/styles";
import useFavoritesStore from "@/store/useFavoritesStore";
import { tokens } from "@/tamagui/token";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
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
import { RatingStar } from "../organisms/home/RatingStar";

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

const INLINE_CARD_WIDTH = 240;

type ProductCardProps = {
  product: Product;
  isFavorite?: boolean;
  showFavoriteIcon?: boolean;
  context: "grid" | "in-line";
  showProgressBar?: boolean;
  onPress?: () => void;
};

export const ProductCard = ({
  product,
  isFavorite = false,
  showFavoriteIcon = false,
  context,
  showProgressBar = false,
  onPress,
}: ProductCardProps) => {
  const imageHeight = context === "grid" ? 163.5 : 240;
  const cardWidth = context === "grid" ? GRID_CARD_WIDTH : INLINE_CARD_WIDTH;

  // Use Zustand store for favorites
  const addFavoriteToStore = useFavoritesStore((state) => state.addFavorite);
  const removeFavoriteFromStore = useFavoritesStore((state) => state.removeFavorite);

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

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push({
        pathname: "/products/[id]",
        params: {
          id: product.productId,
          productData: JSON.stringify(product),
        },
      });
    }
  };

  const handleFavoritePress = (e?: any) => {
    // Stop event propagation to prevent opening product page
    e?.stopPropagation?.();

    const willBeFavorited = !isFavorited;

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
    <OpTouch onPress={handlePress}>
      <YStack width={cardWidth}>
        <YStack
          borderRadius={tokens.space.md}
          position="relative"
          overflow="hidden"
          borderWidth={1}
          borderColor="$lightgrey"
          backgroundColor="$white"
        >
          <AppImage
            resizeMode="cover"
            source={product?.images?.[0] || ""}
            width="100%"
            height={imageHeight}
          />

          {product.compareAtPrice && product.price < product.compareAtPrice ? (
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
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              onPress={handleFavoritePress}
            >
              <BlurView style={styles.blurView} intensity={16} tint="dark">
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
          <TextMDSemiBold numberOfLines={2}>
            {String(product.title || "")}
          </TextMDSemiBold>
          <Spacer size="$sm-reg" />

          {product.rating !== undefined ? (
            <XStack alignItems="center">
              <RatingStar rating={product.rating} />
              <Spacer size="$sm-reg" />
              <TextMDBold color="$secondary">
                {product.rating?.toFixed(1)}
              </TextMDBold>
              <Spacer size="$xs" />
              <TextXSRegular color="$icon">
                ({product.reviewsCount?.toLocaleString()})
              </TextXSRegular>
            </XStack>
          ) : null}

          {<Spacer size="$sm-reg" />}

          {product.price !== undefined ? (
            <XStack alignItems="center">
              <TextMDBold>${(product.price || 0).toFixed(2)}</TextMDBold>
              <Spacer size="$xs" />
              {product.compareAtPrice &&
              product.price !== product.compareAtPrice ? (
                <TextSMRegular color="$icon" textDecorationLine="line-through">
                  ${(product.compareAtPrice || 0).toFixed(2)}
                </TextSMRegular>
              ) : null}
            </XStack>
          ) : null}
        </YStack>

        {showProgressBar &&
        product.availableQuantity &&
        product.totalQuantity ? (
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
        ) : null}
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
