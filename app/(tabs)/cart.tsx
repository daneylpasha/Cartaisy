import {
  DynamicStatusBar,
  HeadingXSBold,
  ParagraphMD,
  TextMDBold,
  TextSMRegular,
  TextSMSemiBold,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Spacer } from "@/components/atoms/Spacer";
import { SHADOW_STYLES } from "@/constants/styles";
import { t } from "@/translations";
import {
  Animated,
  FlatList,
  Linking,
  PanResponder,
  Platform,
} from "react-native";

import { useCheckoutHandoff } from "@/api/generated/checkout/checkout";
import { useGetCartRecommendations } from "@/api/generated/recommendations/recommendations";
import { useCartManager } from "@/api/hooks/useCartManager";
import { Divider } from "@/components/atoms/Divider";
import { OpTouch } from "@/components/atoms/OpTouch";
import { PrimaryButton } from "@/components/molecules/buttons";
import CartLineItem from "@/components/molecules/cart/CartLineItem";
import { CatalogUnavailableState } from "@/components/molecules/CatalogUnavailableState";
import { ProductCard } from "@/components/molecules/ProductCard";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import ErrorModal from "@/components/organisms/ErrorModal";
import { useAuthGuard } from "@/contexts/AuthGuardContext";
import useCartStore from "@/store/useCartStore";
import useFavoritesStore from "@/store/useFavoritesStore";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { getCatalogUnavailableMessage } from "@/utils/catalogUnavailableError";
import { tokens } from "@/tamagui/token";
import { formatPrice } from "@/utils/formatPrice";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, Text, XStack, YStack } from "tamagui";

const CartScreen = () => {
  const { bottom: BOTTOM_INSET } = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: "", message: "" });

  const { items, getTotalPrice, getTotalQuantity, cartId } = useCartStore();
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const {
    updateQuantity: updateCartQuantity,
    removeItem: removeCartItem,
    syncCart,
  } = useCartManager();
  const totalQuantity = getTotalQuantity();
  const { requireAuth } = useAuthGuard();
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [isInitializingCheckout, setIsInitializingCheckout] = useState(false);
  const [cartUnavailableError, setCartUnavailableError] =
    useState<unknown>(null);

  const { mutate: checkoutHandoffMutation } = useCheckoutHandoff();

  // Fetch cart recommendations
  const { mutate: fetchRecommendations, data: recommendationsData } =
    useGetCartRecommendations();

  // Keep previous recommendations during refetch
  const [previousRecommendations, setPreviousRecommendations] = useState<any[]>(
    []
  );

  // Update previous recommendations when new data arrives
  useEffect(() => {
    if (
      recommendationsData?.data?.recommendedProducts &&
      recommendationsData.data.recommendedProducts.length > 0
    ) {
      setPreviousRecommendations(recommendationsData.data.recommendedProducts);
    }
  }, [recommendationsData]);

  // Extract shopify product IDs from cart items
  const shopifyProductIds = React.useMemo(() => {
    return items
      .map((item) => {
        const id = item.productId?.split("/").pop();
        return id || "";
      })
      .filter((id) => id !== "");
  }, [items]);
  const hasMissingLineItemId = React.useMemo(
    () => items.some((item) => !item.lineItemId),
    [items]
  );

  // Fetch recommendations when cart items change
  useEffect(() => {
    if (shopifyProductIds.length > 0) {
      console.log("[Cart] Fetching recommendations for:", shopifyProductIds);
      fetchRecommendations({
        data: {
          cartItems: shopifyProductIds,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopifyProductIds.length]); // Only refetch when cart items count changes
  // Animation refs
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  // Track sync attempts to prevent infinite loops and repeated tab-focus fetches
  const hasSyncedRef = useRef(false);
  const initialSyncCartIdRef = useRef<string | null>(null);

  // Sync cart when screen is focused to ensure lineItemIds are populated
  useFocusEffect(
    useCallback(() => {
      // Reset sync flag when screen loses focus
      return () => {
        hasSyncedRef.current = false;
      };
    }, [])
  );

  const handlePassiveCartSync = useCallback(async () => {
    try {
      const didSync = await syncCart();
      if (didSync) {
        setCartUnavailableError(null);
      }
    } catch (error) {
      const unavailableMessage = getCatalogUnavailableMessage(error);
      if (unavailableMessage) {
        setCartUnavailableError(error);
      }
    }
  }, [syncCart]);

  useFocusEffect(
    useCallback(() => {
      if (cartId && items.length > 0 && !hasSyncedRef.current) {
        const needsInitialSync = initialSyncCartIdRef.current !== cartId;
        const needsLineItemSync = hasMissingLineItemId;

        if (!needsInitialSync && !needsLineItemSync) {
          return;
        }

        console.log("[Cart] Syncing cart with API on focus...");
        hasSyncedRef.current = true; // Mark as synced BEFORE calling to prevent re-entry
        initialSyncCartIdRef.current = cartId;
        handlePassiveCartSync();
      }
    }, [cartId, handlePassiveCartSync, hasMissingLineItemId, items.length])
  );

  // Auto-open cart summary when items are added
  useEffect(() => {
    if (items.length > 0) {
      setOpen(false);
    }
  }, [items.length]);

  // Animate cart summary when open state changes
  useEffect(() => {
    if (open) {
      // Animate in
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [open, animatedHeight, animatedOpacity]);

  // Handle open state change with animation delay (memoized)
  const toggleCartSummary = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  // Memoize cart item event handlers
  const handleCartItemPress = useCallback((item: any) => {
    console.log("Cart item pressed:", {
      handle: item.handle,
      productId: item.productId,
    });

    const productIdNumber = item.productId?.split("/").pop();

    if (item.handle) {
      router.push(`/products/${item.handle}` as any);
    } else if (productIdNumber) {
      router.push(`/products/${productIdNumber}` as any);
    } else {
      console.log("No handle or productId found for item");
    }
  }, []);

  const handleIncreaseQuantity = useCallback(
    async (item: any) => {
      if (!item.lineItemId) {
        console.error("[Cart] No lineItemId found for item:", item);
        setErrorModal({
          visible: true,
          title: "Error",
          message: "Cannot update cart item. Please try again.",
        });
        return;
      }

      if (item.quantity < item.quantityAvailable) {
        try {
          setUpdatingItemId(item.lineItemId);
          await updateCartQuantity(item.lineItemId, item.quantity + 1);
        } catch (error) {
          const unavailableMessage = getCatalogUnavailableMessage(error);
          if (unavailableMessage) {
            setCartUnavailableError(error);
          } else {
            setErrorModal({
              visible: true,
              title: "Error",
              message: "Failed to update quantity. Please try again.",
            });
          }
        } finally {
          setUpdatingItemId(null);
        }
      } else {
        setErrorModal({
          visible: true,
          title: "Maximum Stock Reached",
          message: `Only ${item.quantityAvailable} items available in stock.`,
        });
      }
    },
    [updateCartQuantity]
  );

  const handleDecreaseQuantity = useCallback(
    async (item: any) => {
      if (!item.lineItemId) {
        setErrorModal({
          visible: true,
          title: "Error",
          message: "Cannot update cart item. Please try again.",
        });
        return;
      }

      try {
        if (item.quantity > 1) {
          setUpdatingItemId(item.lineItemId);
          await updateCartQuantity(item.lineItemId, item.quantity - 1);
        } else {
          setRemovingItemId(item.lineItemId);
          await removeCartItem(item.lineItemId);
        }
      } catch (error) {
        const unavailableMessage = getCatalogUnavailableMessage(error);
        if (unavailableMessage) {
          setCartUnavailableError(error);
        } else {
          setErrorModal({
            visible: true,
            title: "Error",
            message: "Failed to update cart. Please try again.",
          });
        }
      } finally {
        setUpdatingItemId(null);
        setRemovingItemId(null);
      }
    },
    [updateCartQuantity, removeCartItem]
  );

  const handleRemoveItem = useCallback(
    async (item: any) => {
      if (!item.lineItemId) {
        setErrorModal({
          visible: true,
          title: "Error",
          message: "Cannot remove item. Please try again.",
        });
        return;
      }

      try {
        setRemovingItemId(item.lineItemId);
        await removeCartItem(item.lineItemId);
      } catch (error) {
        const unavailableMessage = getCatalogUnavailableMessage(error);
        if (unavailableMessage) {
          setCartUnavailableError(error);
        } else {
          setErrorModal({
            visible: true,
            title: "Error",
            message: "Failed to remove item. Please try again.",
          });
        }
      } finally {
        setRemovingItemId(null);
      }
    },
    [removeCartItem]
  );

  const startCheckoutHandoff = useCallback(() => {
    const { cartId: latestCartId, items: latestItems } = useCartStore.getState();

    if (!latestCartId) {
      setErrorModal({
        visible: true,
        title: "Error",
        message: "Cart ID not found. Please try again.",
      });
      return;
    }

    console.log("[CHECKOUT] Requesting hosted checkout handoff with cartId:", latestCartId);
    console.log("[CHECKOUT] Cart items count:", latestItems.length);
    console.log(
      "[CHECKOUT] Cart items:",
      latestItems.map((i) => ({
        id: i.lineItemId,
        title: i.title,
        qty: i.quantity,
      }))
    );

    setIsInitializingCheckout(true);
    checkoutHandoffMutation(
      { data: { cartId: latestCartId } },
      {
        onSuccess: (response) => {
          const checkoutUrl = response.data.checkoutUrl;

          if (!checkoutUrl) {
            setErrorModal({
              visible: true,
              title: "Checkout Error",
              message: "Checkout URL not found. Please try again.",
            });
            setIsInitializingCheckout(false);
            return;
          }

          setIsInitializingCheckout(false);
          Linking.openURL(checkoutUrl)
            .catch((error) => {
              console.error("[Checkout] Failed to open checkout URL:", error);
              setErrorModal({
                visible: true,
                title: "Checkout Error",
                message: "Failed to open checkout. Please try again.",
              });
            });
        },
        onError: (error: any) => {
          console.error("[Checkout] Handoff error:", error);
          const unavailableMessage = getCatalogUnavailableMessage(error);
          if (unavailableMessage) {
            setCartUnavailableError(error);
          } else {
            setErrorModal({
              visible: true,
              title: "Checkout Error",
              message:
                error?.response?.data?.error?.message ||
                error?.response?.data?.message ||
                "Failed to initialize checkout. Please try again.",
            });
          }
          setIsInitializingCheckout(false);
        },
      }
    );
  }, [checkoutHandoffMutation]);

  const handleProceedToCheckout = useCallback(() => {
    const canProceed = requireAuth({
      type: "checkout",
      callback: startCheckoutHandoff,
    });

    if (canProceed) {
      startCheckoutHandoff();
    }
  }, [requireAuth, startCheckoutHandoff]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical swipes
        return (
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
          Math.abs(gestureState.dy) > 10
        );
      },
      onPanResponderMove: () => {},
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 30) {
          // Swipe down - close
          setOpen(false);
        } else if (gestureState.dy < -30) {
          // Swipe up - open
          setOpen(true);
        }
      },
    })
  ).current;

  // Render cart item (memoized to prevent re-creation on every render)
  const renderCartItem = useCallback(
    ({ item }: { item: any }) => {
      let brandName = undefined;
      if (item.metafields && Array.isArray(item.metafields)) {
        const brandMetafield = item.metafields.find((m: any) =>
          m.key?.toLowerCase().includes("brand")
        );
        if (brandMetafield) {
          brandName = brandMetafield.value;
          if (__DEV__) {
            console.log("[Cart] Brand extracted from metafields:", brandName);
          }
        }
      }

      // Parse variant options for display
      const options =
        item.selectedOptions?.map((opt: any) => ({
          label: opt.value,
        })) || [];

      return (
        <YStack>
          <CartLineItem
            key={item.variantId}
            image={item.image || ""}
            title={`${item.title}${
              item.variantTitle ? ` - ${item.variantTitle}` : ""
            }`}
            currentPrice={item.price}
            originalPrice={item.compareAtPrice ? item.compareAtPrice : undefined}
            currency={storeCurrency}
            options={options}
            inStockCount={item.quantityAvailable}
            quantity={item.quantity}
            maxQuantity={item.quantityAvailable}
            isUpdating={updatingItemId === item.lineItemId}
            isRemoving={removingItemId === item.lineItemId}
            brandName={brandName}
            onPressItem={() => handleCartItemPress(item)}
            onIncrease={() => handleIncreaseQuantity(item)}
            onDecrease={() => handleDecreaseQuantity(item)}
            onSaveForLater={() => {
              // Handle save for later (future feature)
            }}
            onRemove={() => handleRemoveItem(item)}
          />
        </YStack>
      );
    },
    [
      updatingItemId,
      removingItemId,
      handleCartItemPress,
      handleIncreaseQuantity,
      handleDecreaseQuantity,
      handleRemoveItem,
    ]
  );

  const renderEmptyCart = () => (
    <YStack alignItems="center" justifyContent="center" flex={1}>
      <Spacer size={"$2xl"} />
      <YStack
        backgroundColor="$white"
        borderRadius="$full"
        padding="$md"
        width={64}
        height={64}
        borderColor="$border"
        justifyContent="center"
        alignItems="center"
        {...SHADOW_STYLES}
      >
        <AppImage
          name="cartIcon"
          tintColor={getTokenValue("$black")}
          width={29}
          height={27}
        />
      </YStack>
      <Spacer size={"$lg"} />
      <HeadingXSBold>{t("cart.title")}</HeadingXSBold>
      <Spacer size={"$reg"} />
      <ParagraphMD color="$secondary">{t("cart.subtitle")}</ParagraphMD>
      <Spacer size={"$reg"} />
      <OpTouch
        onPress={() => {
          router.push("/");
        }}
      >
        <Text color="$primary">{"Start Shopping"}</Text>
      </OpTouch>
    </YStack>
  );

  // Render recommendations section
  const renderRecommendations = () => {
    // Don't show if cart is empty
    if (items.length === 0) {
      return null;
    }

    // Use current recommendations if available, otherwise show previous ones
    const currentRecommendations =
      recommendationsData?.data?.recommendedProducts || [];
    const displayRecommendations =
      currentRecommendations.length > 0
        ? currentRecommendations
        : previousRecommendations;

    // Don't show if no recommendations available at all
    if (displayRecommendations.length === 0) {
      console.log("[Cart] No recommendations available");
      return null;
    }

    return (
      <YStack>
        <Spacer size={"$xl"} />
        <SectionHeader
          title={t("home.sectionHeader.youMightAlsoLike")}
          image={"bulb"}
          tintColor={"darkgrey"}
        />
        <Spacer size={"$xl"} />
        <FlatList
          data={displayRecommendations}
          keyExtractor={(product, index) =>
            `recommended-${product._id}-${index}`
          }
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: tokens.space.md,
            gap: tokens.space.md,
          }}
          renderItem={({ item: product }) => (
            <ProductCard
              product={
                {
                  productId: product.shopifyProductId || product._id,
                  title: product.title,
                  handle: product.handle,
                  vendor: product.vendor,
                  price: product.price,
                  compareAtPrice: product.compareAtPrice,
                  images: product.images?.map((img: any) => img.url) || [],
                  rating: 0,
                  reviewCount: 0,
                  tags: product.tags || [],
                } as any
              }
              context="grid"
              showFavoriteIcon={true}
              isFavorite={isFavorite(product.shopifyProductId || product._id)}
            />
          )}
        />
      </YStack>
    );
  };

  // Calculate cart totals
  const subtotal = getTotalPrice(); // Current discounted prices
  const savings = items.reduce((acc, item) => {
    if (item.compareAtPrice) {
      return acc + (item.compareAtPrice - item.price) * item.quantity;
    }
    return acc;
  }, 0);
  const originalTotal = subtotal + savings; // Original total before discount
  const grandTotal = subtotal; // Final amount to pay (after discount)
  const storeCurrency = useStoreConfigStore((state) => state.currency);
  const cartCurrency = storeCurrency; // Always use store config currency

  if (cartUnavailableError) {
    return (
      <YStack flex={1} backgroundColor="$background">
        <DynamicStatusBar backgroundColor="#FFFFFF" />
        <CatalogUnavailableState
          error={cartUnavailableError}
          title="Cart unavailable"
          onRetry={() => {
            handlePassiveCartSync();
          }}
        />
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <DynamicStatusBar backgroundColor="#FFFFFF" />
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.variantId}
        ListEmptyComponent={renderEmptyCart}
        ListFooterComponent={() => (
          <YStack>
            {items.length > 0 ? renderRecommendations() : null}
            <Spacer size={"$3xl"} />
          </YStack>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        // Performance optimizations
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        initialNumToRender={8}
        windowSize={5}
        removeClippedSubviews={Platform.OS === "android"}
      />
      {items.length > 0 && (
        <>
          <Animated.View
            style={{
              opacity: animatedOpacity,
              maxHeight: animatedHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 200], // Adjust this value based on your content height
              }),
              overflow: "hidden",
            }}
          >
            <Divider />
            <YStack paddingHorizontal={"$md"}>
              <Spacer size={"$sm"} />
              <Animated.View {...panResponder.panHandlers}>
                <YStack
                  justifyContent="center"
                  alignItems="center"
                  width={40}
                  height={20}
                  alignSelf="center"
                  paddingVertical={8}
                >
                  <YStack
                    width={40}
                    height={4}
                    backgroundColor={"$icon"}
                    borderRadius={"$2xl"}
                  />
                </YStack>
              </Animated.View>
              <Spacer size={"$sm"} />
              {savings > 0 && (
                <XStack paddingVertical={"$sm"} justifyContent="space-between">
                  <TextSMRegular color="$secondary">
                    Original Total
                  </TextSMRegular>
                  <TextSMRegular
                    color="$secondary"
                    textDecorationLine="line-through"
                  >
                    {formatPrice(originalTotal, cartCurrency)}
                  </TextSMRegular>
                </XStack>
              )}
              {savings > 0 && (
                <XStack paddingVertical={"$sm"} justifyContent="space-between">
                  <TextSMRegular color="$secondary">You save</TextSMRegular>
                  <TextSMSemiBold color="$green">
                    {`- ${formatPrice(savings, cartCurrency)}`}
                  </TextSMSemiBold>
                </XStack>
              )}
              <XStack paddingVertical={"$sm"} justifyContent="space-between">
                <TextSMSemiBold>
                  {`Subtotal (${items.length} ${
                    items.length === 1 ? "Item" : "Items"
                  })`}
                </TextSMSemiBold>
                <TextSMSemiBold>{formatPrice(subtotal, cartCurrency)}</TextSMSemiBold>
              </XStack>
              <XStack paddingVertical={"$sm"} justifyContent="space-between">
                <TextSMRegular color="$secondary">Taxes</TextSMRegular>
                <TextSMSemiBold>{"Calculated at checkout"}</TextSMSemiBold>
              </XStack>
              {/* <Spacer size={"$sm"} /> */}
            </YStack>
          </Animated.View>
          <YStack paddingHorizontal={"$md"}>
            <Divider />
            <Spacer size={"$sm"} />
            <OpTouch onPress={toggleCartSummary}>
              <XStack justifyContent="space-between">
                <TextSMSemiBold>Grand Total</TextSMSemiBold>
                <XStack alignItems="center">
                  <TextMDBold>{formatPrice(grandTotal, cartCurrency)}</TextMDBold>
                  <Spacer size={"$xs"} />
                  <AppImage
                    name="caretRight"
                    width={14}
                    height={14}
                    style={{
                      transform: [
                        {
                          rotate: open ? "-90deg" : "90deg",
                        },
                      ],
                    }}
                  />
                </XStack>
              </XStack>
            </OpTouch>
            <Spacer size={"$md"} />
            <PrimaryButton
              onPress={handleProceedToCheckout}
              isLoading={isInitializingCheckout}
              label={`Proceed to Checkout (${totalQuantity})`}
            />
            <Spacer size={Platform.OS === "ios" ? "$md" : "$xs"} />
          </YStack>
        </>
      )}

      <Spacer size={Platform.OS === "ios" ? BOTTOM_INSET + 48 : 10} />
      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() =>
          setErrorModal({ visible: false, title: "", message: "" })
        }
      />
    </YStack>
  );
};

export default CartScreen;
