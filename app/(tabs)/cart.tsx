import {
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
import { FlatList, PanResponder, Platform } from "react-native";

import { useInitializeCheckout } from "@/api/generated/checkout/checkout";
import { useCartManager } from "@/api/hooks/useCartManager";
import { Divider } from "@/components/atoms/Divider";
import { OpTouch } from "@/components/atoms/OpTouch";
import { PrimaryButton } from "@/components/molecules/buttons";
import CartLineItem from "@/components/molecules/cart/CartLineItem";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import ErrorModal from "@/components/organisms/ErrorModal";
import useCartStore from "@/store/useCartStore";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
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
  const {
    updateQuantity: updateCartQuantity,
    removeItem: removeCartItem,
    syncCart,
  } = useCartManager();
  const totalQuantity = getTotalQuantity();
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [isInitializingCheckout, setIsInitializingCheckout] = useState(false);

  // Initialize checkout mutation
  const { mutate: initializeCheckoutMutation } = useInitializeCheckout();
  // Animation refs
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  // Sync cart when screen is focused to ensure lineItemIds are populated
  useFocusEffect(
    useCallback(() => {
      if (cartId && items.length > 0) {
        // Check if any item is missing lineItemId
        const needsSync = items.some((item) => !item.lineItemId);
        if (needsSync) {
          console.log("[Cart] Items missing lineItemId, syncing with API...");
          syncCart();
        }
      }
    }, [cartId, items, syncCart])
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

  // Handle open state change with animation delay
  const toggleCartSummary = () => {
    if (open) {
      // Start closing animation
      setOpen(false);
    } else {
      // Open immediately
      setOpen(true);
    }
  };
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

  // Render cart item
  const renderCartItem = ({ item }: { item: any }) => {
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
          currentPrice={item.price * item.quantity}
          originalPrice={
            item.compareAtPrice
              ? item.compareAtPrice * item.quantity
              : undefined
          }
          options={options}
          inStockCount={item.quantityAvailable}
          quantity={item.quantity}
          maxQuantity={item.quantityAvailable}
          isUpdating={updatingItemId === item.lineItemId}
          isRemoving={removingItemId === item.lineItemId}
          onPressItem={() => {
            // Navigate to PDP
            console.log("Cart item pressed:", {
              handle: item.handle,
              productId: item.productId,
            });

            const productIdNumber = item.productId?.split("/").pop(); // Extract ID from gid://shopify/Product/14817102528884

            if (item.handle) {
              router.push(`/products/${item.handle}` as any);
            } else if (productIdNumber) {
              router.push(`/products/${productIdNumber}` as any);
            } else {
              console.log("No handle or productId found for item");
            }
          }}
          onIncrease={async () => {
            // Check if can increase
            console.log("[Cart] Increase clicked for item:", {
              lineItemId: item.lineItemId,
              title: item.title,
            });
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
                setErrorModal({
                  visible: true,
                  title: "Error",
                  message: "Failed to update quantity. Please try again.",
                });
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
          }}
          onDecrease={async () => {
            if (!item.lineItemId) {
              setErrorModal({
                visible: true,
                title: "Error",
                message: "Cannot update cart item. Please try again.",
              });
              return;
            }

            // Decrease or remove if quantity is 1
            try {
              if (item.quantity > 1) {
                setUpdatingItemId(item.lineItemId);
                await updateCartQuantity(item.lineItemId, item.quantity - 1);
              } else {
                setRemovingItemId(item.lineItemId);
                await removeCartItem(item.lineItemId);
              }
            } catch (error) {
              setErrorModal({
                visible: true,
                title: "Error",
                message: "Failed to update cart. Please try again.",
              });
            } finally {
              setUpdatingItemId(null);
              setRemovingItemId(null);
            }
          }}
          onSaveForLater={() => {
            // Handle save for later (future feature)
          }}
          onRemove={async () => {
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
              setErrorModal({
                visible: true,
                title: "Error",
                message: "Failed to remove item. Please try again.",
              });
            } finally {
              setRemovingItemId(null);
            }
          }}
        />
      </YStack>
    );
  };

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
  const renderRecommendations = () => (
    <YStack>
      <Spacer size={"$xl"} />
      <SectionHeader
        title={t("home.sectionHeader.youMightAlsoLike")}
        image={"bulb"}
        tintColor={"darkgrey"}
        seeAllText="View All"
        color="primary"
        onPressSeeAll={() => {}}
      />

      <Spacer size={"$reg"} />
      {/* <FlatList
        data={products}
        renderItem={({ item }) => (
          console.log(item, "item in rec"),
          (
            <ProductCard
              product={item as any}
              context="grid"
              showProgressBar={false}
            />
          )
        )}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        horizontal
        contentContainerStyle={{
          paddingHorizontal: GRID_SIDE_PADDING,
          gap: GRID_COLUMN_GAP,
        }}
      /> */}
    </YStack>
  );

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

  return (
    <YStack flex={1} backgroundColor="$background">
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
                    {`$${originalTotal.toFixed(2)}`}
                  </TextSMRegular>
                </XStack>
              )}
              {savings > 0 && (
                <XStack paddingVertical={"$sm"} justifyContent="space-between">
                  <TextSMRegular color="$secondary">You save</TextSMRegular>
                  <TextSMSemiBold color="$green">
                    {`- $${savings.toFixed(2)}`}
                  </TextSMSemiBold>
                </XStack>
              )}
              <XStack paddingVertical={"$sm"} justifyContent="space-between">
                <TextSMSemiBold>
                  {`Subtotal (${items.length} ${
                    items.length === 1 ? "Item" : "Items"
                  })`}
                </TextSMSemiBold>
                <TextSMSemiBold>{`$${subtotal.toFixed(2)}`}</TextSMSemiBold>
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
                  <TextMDBold>{`$${grandTotal.toFixed(2)}`}</TextMDBold>
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
              onPress={() => {
                if (!cartId) {
                  setErrorModal({
                    visible: true,
                    title: "Error",
                    message: "Cart ID not found. Please try again.",
                  });
                  return;
                }

                setIsInitializingCheckout(true);
                initializeCheckoutMutation(
                  { data: { cartId } },
                  {
                    onSuccess: (response) => {
                      console.log("[Checkout] Init success:", response);
                      // Store sessionId in cart store or pass to checkout screen
                      router.push(
                        `/checkout?sessionId=${response.data.sessionId}`
                      );
                      setIsInitializingCheckout(false);
                    },
                    onError: (error: any) => {
                      console.error("[Checkout] Init error:", error);
                      setErrorModal({
                        visible: true,
                        title: "Checkout Error",
                        message:
                          error?.response?.data?.error?.message ||
                          "Failed to initialize checkout. Please try again.",
                      });
                      setIsInitializingCheckout(false);
                    },
                  }
                );
              }}
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
