import { HeadingSMBold, TextXLBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Spacer } from "@/components/atoms/Spacer";
import { t } from "@/translations";
import { FlatList } from "react-native";

import Icons from "@/assets/Icons";
import { OpTouch } from "@/components/atoms/OpTouch";
import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { ParagraphSM } from "@/components/atoms/texts/ParagraphSM";
import { ProductCard } from "@/components/molecules/ProductCard";
import { tokens } from "@/tamagui/token";
import React, { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, YStack } from "tamagui";
type IconName = keyof typeof Icons;

type Product = {
  id: string;
  price: number;
  image: IconName[]; // ALWAYS array
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
const sidePadding = tokens.space.md;
const columnGap = tokens.space.md;
const WishlistScreen = () => {
  // State for cart items - replace with your actual cart state management
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const { bottom: BOTTOM_INSET, top: TOP_INSET } = useSafeAreaInsets();

  // Function to add item to cart
  const addToWishlist = (product: Product) => {
    const existingItem = wishlistItems.find((item) => item.id === product.id);

    if (existingItem) {
      // If item already exists, increase quantity
      setWishlistItems((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, wishlist: !item.wishlist } : item
        )
      );
    } else {
      // If item doesn't exist, add new item
      const newWishlistItem = {
        id: product.id,
        image: product.image[0] as IconName, // Take first image
        title: product.title,
        wishlist: true,
        discountBadge: false,
      };

      setWishlistItems((prev) => [
        ...prev,
        newWishlistItem as unknown as Product,
      ]);
    }
  };

  // Render cart item
  const renderWishlistItem = ({ item }: { item: any }) => (
    <YStack paddingHorizontal={"$md"}>
      <FlatList
        data={products}
        horizontal={false}
        numColumns={2}
        renderItem={({ item }) => (
          <ProductCard
            product={item as any}
            context="grid"
            showProgressBar={false}
            showFavoriteIcon={true}
            isFavorite={true}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: sidePadding,
          // gap: tokens.space.md,
        }}
        columnWrapperStyle={{
          columnGap: columnGap,
          paddingBottom: tokens.space.md,
        }}
      />
    </YStack>
  );

  // Render empty cart state
  const renderEmptyWishlist = () => (
    <YStack alignItems="center" justifyContent="center" flex={1}>
      <Spacer size={"$8xl"} />
      <YStack>
        <AppImage
          name="wishlistFrame"
          width={215}
          height={144}
          tintColor={tokens.color.primary}
        />
      </YStack>
      <Spacer size={"$lg"} />
      <TextXLBold>{t("wishlist.title")}</TextXLBold>
      <Spacer size={"$reg"} />
      <ParagraphSM color="$secondary">{t("wishlist.subtitle")}</ParagraphSM>
      <Spacer size={"$reg"} />
      <OpTouch
        onPress={() => {
          addToWishlist(products[Math.floor(Math.random() * products.length)]);
        }}
      >
        <Text color="$secondary">{"Add wishlist"}</Text>
      </OpTouch>
    </YStack>
  );

  return (
    <ScreenContainer backgroundColor="$background">
      <YStack
        justifyContent="center"
        alignItems="center"
        paddingHorizontal={"$md"}
      >
        <Spacer size={"$lg"} />
        <HeadingSMBold>{"My Wish List"}</HeadingSMBold>
        <Spacer size={"$lg"} />
      </YStack>
      <FlatList
        data={wishlistItems.length === 0 ? [] : wishlistItems}
        renderItem={renderWishlistItem}
        ItemSeparatorComponent={() => <Spacer size={"$lg"} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyWishlist}
        showsVerticalScrollIndicator={false}
      />
      <Spacer size={BOTTOM_INSET + 20} />
    </ScreenContainer>
  );
};

export default WishlistScreen;
