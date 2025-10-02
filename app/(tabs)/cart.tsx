import {
  HeadingXSBold,
  ParagraphMD,
  TextMDBold,
  TextSMRegular,
  TextSMSemiBold,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Spacer } from "@/components/atoms/Spacer";
import {
  GRID_COLUMN_GAP,
  GRID_SIDE_PADDING,
  ProductCard,
} from "@/components/molecules/ProductCard";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { SHADOW_STYLES } from "@/constants/styles";
import { t } from "@/translations";
import { FlatList, PanResponder, Platform } from "react-native";

import Icons from "@/assets/Icons";
import { Divider } from "@/components/atoms/Divider";
import { OpTouch } from "@/components/atoms/OpTouch";
import { PrimaryButton } from "@/components/molecules/buttons";
import CartLineItem from "@/components/molecules/cart/CartLineItem";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, Text, XStack, YStack } from "tamagui";

type IconName = keyof typeof Icons;

type Product = {
  id: string;
  price: number;
  image: IconName[];
  title: string;
  currentPrice: number;
  originalPrice: number;
  discountPercent: number;
  progressValue: number;
  showProgressBar: boolean;
  ratingValue: number;
  totalReviewCount: number;
  wishlist: boolean;
  discountBadge: boolean;
};

const mockCartItems = [
  {
    id: "1",
    image: "product1" as IconName,
    title: "Adjustable Laptop Stand with Cooling Fans",
    currentPrice: 712.15,
    originalPrice: 814.25,
    couponsCount: 2,
    freeDelivery: true,
    options: [{ label: "Dark Blue" }, { label: "XL" }],
    inStockCount: 3,
    quantity: 1,
  },
  {
    id: "2",
    image: "product2" as IconName,
    title: "Adjustable Laptop Stand with Cooling Fans",
    currentPrice: 712.15,
    originalPrice: 814.25,
    couponsCount: 2,
    freeDelivery: true,
    options: [{ label: "Dark Blue" }, { label: "XL" }],
    inStockCount: 3,
    quantity: 1,
  },
  {
    id: "3",
    image: "product3" as IconName,
    title: "Adjustable Laptop Stand with Cooling Fans",
    currentPrice: 712.15,
    originalPrice: 814.25,
    couponsCount: 2,
    freeDelivery: true,
    options: [{ label: "Dark Blue" }, { label: "XL" }],
    inStockCount: 3,
    quantity: 1,
  },
  {
    id: "4",
    image: "product4" as IconName,
    title: "Adjustable Laptop Stand with Cooling Fans",
    currentPrice: 712.15,
    originalPrice: 814.25,
    couponsCount: 2,
    freeDelivery: true,
    options: [{ label: "Dark Blue" }, { label: "XL" }],
    inStockCount: 3,
    quantity: 1,
  },
];

const products: Product[] = [
  {
    id: "1",
    price: 100,
    image: ["product1", "product2", "product3", "product4", "product5"],
    title: "Bose QuietComfort Bluetooth Headphones - Chilled Lilac",
    currentPrice: 100,
    originalPrice: 100,
    discountPercent: 10,
    progressValue: 50,
    showProgressBar: true,
    ratingValue: 5,
    totalReviewCount: 10,
    wishlist: true,
    discountBadge: true,
  },
  {
    id: "2",
    price: 100,
    image: ["product2"],
    title: "Product2",
    currentPrice: 100,
    originalPrice: 100,
    discountPercent: 10,
    progressValue: 50,
    showProgressBar: true,
    ratingValue: 5,
    totalReviewCount: 10,
    wishlist: true,
    discountBadge: true,
  },
  {
    id: "3",
    price: 100,
    image: ["product3"],
    title: "Product3",
    currentPrice: 100,
    originalPrice: 100,
    discountPercent: 10,
    progressValue: 50,
    showProgressBar: true,
    ratingValue: 5,
    totalReviewCount: 10,
    wishlist: true,
    discountBadge: true,
  },
  {
    id: "4",
    price: 100,
    image: ["product4"],
    title: "Product4",
    currentPrice: 100,
    originalPrice: 100,
    discountPercent: 10,
    progressValue: 50,
    showProgressBar: true,
    ratingValue: 5,
    totalReviewCount: 10,
    wishlist: true,
    discountBadge: true,
  },
  {
    id: "5",
    price: 100,
    image: ["product5"],
    title: "Product5",
    currentPrice: 100,
    originalPrice: 100,
    discountPercent: 10,
    progressValue: 50,
    showProgressBar: true,
    ratingValue: 0,
    totalReviewCount: 10,
    wishlist: true,
    discountBadge: true,
  },
];

const CartScreen = () => {
  // State for cart items - replace with your actual cart state management
  const [cartItems, setCartItems] = useState(mockCartItems);
  const { bottom: BOTTOM_INSET, top: TOP_INSET } = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  // Animation refs
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  // Auto-open cart summary when items are added
  useEffect(() => {
    if (cartItems.length > 0) {
      setOpen(false);
    }
  }, [cartItems.length]);

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
  // Function to add item to cart
  const addToCart = (product: Product) => {
    const existingItem = cartItems.find((item) => item.id === product.id);

    if (existingItem) {
      // If item already exists, increase quantity
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // If item doesn't exist, add new item
      const newCartItem = {
        id: product.id,
        image: product.image[0] as IconName, // Take first image
        title: product.title,
        currentPrice: product.currentPrice,
        originalPrice: product.originalPrice,
        couponsCount: 0,
        freeDelivery: true,
        options: [],
        inStockCount: 10,
        quantity: 1,
      };

      setCartItems((prev) => [...prev, newCartItem]);
    }
  };

  // Render cart item
  const renderCartItem = ({ item }: { item: any }) => (
    <YStack>
      <CartLineItem
        key={item.id}
        image={item.image}
        title={item.title}
        currentPrice={item.currentPrice * item.quantity}
        originalPrice={item.originalPrice}
        couponsCount={item.couponsCount}
        freeDelivery={item.freeDelivery}
        options={item.options}
        inStockCount={item.inStockCount}
        quantity={item.quantity}
        onIncrease={() => {
          // Handle increase quantity
          setCartItems((prev) =>
            prev.map((cartItem) =>
              cartItem.id === item.id
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            )
          );
        }}
        onDecrease={() => {
          // Handle decrease quantity
          setCartItems((prev) =>
            prev.map((cartItem) =>
              cartItem.id === item.id && cartItem.quantity > 1
                ? { ...cartItem, quantity: cartItem.quantity - 1 }
                : cartItem
            )
          );
        }}
        onSaveForLater={() => {
          // Handle save for later
        }}
        onRemove={() => {
          // Handle remove item
          setCartItems((prev) =>
            prev.filter((cartItem) => cartItem.id !== item.id)
          );
        }}
      />
    </YStack>
  );

  // Render empty cart state
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
          addToCart(products[Math.floor(Math.random() * products.length)]);
        }}
      >
        <Text color="$secondary">{"Add Product"}</Text>
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
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard
            product={item as any}
            context="grid"
            showProgressBar={false}
          />
        )}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        horizontal
        contentContainerStyle={{
          paddingHorizontal: GRID_SIDE_PADDING,
          gap: GRID_COLUMN_GAP,
        }}
      />
    </YStack>
  );

  const totalAmount = cartItems.reduce(
    (acc, item) => acc + item.currentPrice * item.quantity,
    0
  );

  return (
    <YStack flex={1} backgroundColor="$background">
      <FlatList
        data={cartItems.length === 0 ? [] : cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyCart}
        ListFooterComponent={() => (
          <YStack>
            {renderRecommendations()}
            <Spacer size={"$3xl"} />
          </YStack>
        )}
        showsVerticalScrollIndicator={false}
      />
      {cartItems.length > 0 && (
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
              <XStack paddingVertical={"$sm"} justifyContent="space-between">
                <TextSMSemiBold>
                  Subtotal({cartItems.length} Items)
                </TextSMSemiBold>
                <TextSMSemiBold>${totalAmount}</TextSMSemiBold>
              </XStack>
              <XStack paddingVertical={"$sm"} justifyContent="space-between">
                <TextSMRegular color="$secondary">You save</TextSMRegular>
                <TextSMSemiBold color="$green">
                  - ${totalAmount * 0.1}
                </TextSMSemiBold>
              </XStack>
              <XStack paddingVertical={"$sm"} justifyContent="space-between">
                <TextSMRegular color="$secondary">Taxes</TextSMRegular>
                <TextSMSemiBold>Calculated at checkout</TextSMSemiBold>
              </XStack>
              {/* <Spacer size={"$sm"} /> */}
            </YStack>
          </Animated.View>
          <YStack paddingHorizontal={"$md"}>
            <Divider />
            <Spacer size={"$sm"} />
            <OpTouch onPress={toggleCartSummary}>
              <XStack justifyContent="space-between">
                <TextSMSemiBold>GrandTotal</TextSMSemiBold>
                <XStack alignItems="center">
                  <TextMDBold>${totalAmount + totalAmount * 0.1}</TextMDBold>
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
                router.push("/checkout");
              }}
              isLoading={false}
              label={`Proceed to Checkout (${cartItems.length})`}
            />
            <Spacer size={Platform.OS === "ios" ? "$md" : "$xs"} />
          </YStack>
        </>
      )}

      <Spacer size={Platform.OS === "ios" ? BOTTOM_INSET + 48 : 10} />
    </YStack>
  );
};

export default CartScreen;
