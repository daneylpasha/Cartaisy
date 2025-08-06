import { tokens } from "@/tamagui/token";
import React from "react";
import { FlatList } from "react-native";
import { ProductCard } from "../molecules/ProductCard";
const productData = [
  {
    id: "1",
    image: "product1" as const,
    title:
      "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    currentPrice: 100,
    originalPrice: 150,
    ratingValue: 4,
    totalReviewCount: 1000,
    discountPercent: 50,
    onToggleWishlist: () => {},
  },
  {
    id: "2",
    image: "product2" as const,
    title:
      "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    currentPrice: 100,
    originalPrice: 150,
    ratingValue: 4.5,
    totalReviewCount: 100,
    discountPercent: 30,
    onToggleWishlist: () => {},
  },
  {
    id: "3",
    image: "product3" as const,
    title:
      "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    currentPrice: 100,
    originalPrice: 150,
    ratingValue: 4.5,
    totalReviewCount: 100,
    onToggleWishlist: () => {},
  },
];

const ProductsHorizontalScroller = () => {
  return (
    <FlatList
      data={productData}
      keyExtractor={(item) => item.id.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: tokens.space.md,

        // paddingBottom: layout === "vertical" ? 0 : tokens.space.md,
        gap: tokens.space.md,
      }}
      renderItem={({ item }) => (
        <ProductCard product={item} context="in-line" />
      )}
    />
  );
};

export default ProductsHorizontalScroller;
