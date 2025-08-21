import Icons from "@/assets/Icons";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { PlpOptions } from "@/components/molecules/plp/PlpOptions";
import { ProductCard } from "@/components/molecules/ProductCard";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { tokens } from "@/tamagui/token";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, Text, XStack, YStack } from "tamagui";

const sidePadding = tokens.space.md;
const columnGap = tokens.space.md;

const PlpScreen = () => {
  const { categoryName } = useLocalSearchParams<{ categoryName: string }>();
  const { bottom: BOTTOM_INSET, top: TOP_INSET } = useSafeAreaInsets();

  // Cart state management
  const [cartItems, setCartItems] = useState<any[]>([]);
  console.log(cartItems);

  // Function to add item to cart
  const addToCart = (product: any) => {
    const existingItem = cartItems.find((item) => item.id === product.id);

    if (existingItem) {
      // If item already exists, increase quantity
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        )
      );
    } else {
      // If item doesn't exist, add new item
      const newCartItem = {
        id: product.id,
        image: product.image,
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
  const products = [
    {
      id: "1",
      price: 100,
      image: "product1" as keyof typeof Icons,
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
      price: 200,
      image: "product2" as keyof typeof Icons,
      title: "Product2",
      currentPrice: 200,
      originalPrice: 200,
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
      price: 300,
      image: "product3" as keyof typeof Icons,
      title: "Product3",
      currentPrice: 300,
      originalPrice: 300,
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
      price: 400,
      image: "product4" as keyof typeof Icons,
      title: "Product4",
      currentPrice: 400,
      originalPrice: 400,
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
      price: 500,
      image: "product5" as keyof typeof Icons,
      title: "Product5",
      currentPrice: 500,
      originalPrice: 500,
      discountPercent: 10,
      progressValue: 50,
      showProgressBar: true,
      ratingValue: 5,
      totalReviewCount: 10,
      wishlist: true,
      discountBadge: true,
    },
  ];
  const renderItem = ({
    item,
  }: {
    item: {
      id: string;
      price: number;
      image: keyof typeof Icons;
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
  }) => {
    return (
      <YStack>
        <ProductCard product={item} context="grid" />

        <OpTouch onPress={() => addToCart(item)}>
          <XStack alignItems="center" gap={"$xs"}>
            <AppImage
              tintColor={getTokenValue("$primary")}
              name="cartIcon"
              width={20}
              height={20}
            />
            <Text color="$primary">Add to Cart</Text>
          </XStack>
        </OpTouch>
      </YStack>
    );
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <Spacer size={"$lg"} />
      <PlpOptions />
      <Spacer size={"$md"} />
      <SectionHeader
        title={categoryName}
        tintColor={"darkgrey"}
        image="forYou"
        seeAllText="See All"
        color="primary"
        onPressSeeAll={() => {}}
      />
      <Spacer size={"$md"} />
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        contentContainerStyle={{
          paddingHorizontal: sidePadding,
          backgroundColor: tokens.color.background,
          gap: tokens.space.md,
        }}
        columnWrapperStyle={{
          columnGap: columnGap,
        }}
      />
    </YStack>
  );
};
export default PlpScreen;
