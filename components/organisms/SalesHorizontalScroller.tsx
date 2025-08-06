import { tokens } from "@/tamagui/token";
import React from "react";
import { FlatList } from "react-native";
import { ProductCard } from "../molecules/ProductCard";
const productData = [
  {
    id: "1",
    image: "saleimg1" as const,
    title: "Vibrant life holiday bark-uterie board",
    currentPrice: 100,
    originalPrice: 150,
    progressValue: 30,
    ratingValue: 4,
    wishlist: true,
    discountBadge: true,
    showProgressBar: true,
    totalReviewCount: 1000,
    discountPercent: 50,
    onToggleWishlist: () => {},
  },
  {
    id: "2",
    image: "saleimg2" as const,
    title:
      "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    currentPrice: 100,
    originalPrice: 150,
    ratingValue: 4.5,
    progressValue: 50,
    wishlist: true,
    discountBadge: true,
    showProgressBar: true,
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
    wishlist: true,
    progressValue: 70,
    discountBadge: true,
    showProgressBar: true,
    totalReviewCount: 100,
    onToggleWishlist: () => {},
  },
];

const SalesHorizontalScroller = () => {
  return (
    <FlatList
      data={productData}
      keyExtractor={(item) => item.id.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: tokens.space.md,
        gap: tokens.space.md,
      }}
      renderItem={({ item }) => <ProductCard product={item} context="grid" />}
    />
  );
};

export default SalesHorizontalScroller;
