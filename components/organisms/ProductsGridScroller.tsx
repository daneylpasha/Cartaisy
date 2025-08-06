import { tokens } from "@/tamagui/token";
import React from "react";
import { FlatList } from "react-native";
import { ProductCard } from "../molecules/ProductCard";

const sidePadding = tokens.space.md;
const columnGap = tokens.space.md;
const numColumns = 2;
const forYouData = [
  {
    id: "1",
    image: "productForyou1" as const,
    title:
      "Filtrete 20x20x1 AC Furnace Air Filter, MERV 5, MPR 300, Capture Unwanted Particles",
    currentPrice: 9.8,
    originalPrice: 150,
    ratingValue: 4,
    totalReviewCount: 33,
    discountPercent: 50,
    wishlist: false,
    discountBadge: false,
    onToggleWishlist: () => {},
  },
  {
    id: "2",
    image: "productForyou2" as const,
    title:
      "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    currentPrice: 11.8,
    originalPrice: 150,
    ratingValue: 2.5,
    totalReviewCount: 10,
    discountPercent: 30,
    wishlist: false,
    discountBadge: false,
    onToggleWishlist: () => {},
  },
  {
    id: "3",
    image: "productForyou3" as const,
    title:
      "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    currentPrice: 7.8,
    originalPrice: 150,
    discountPercent: 75,
    ratingValue: 1.5,
    totalReviewCount: 13,
    wishlist: false,
    discountBadge: false,
    onToggleWishlist: () => {},
  },
  {
    id: "4",
    image: "productForyou4" as const,
    title:
      "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    currentPrice: 7.8,
    originalPrice: 150,
    ratingValue: 1.5,
    discountPercent: 25,
    totalReviewCount: 13,
    wishlist: false,
    discountBadge: false,
    onToggleWishlist: () => {},
  },
  {
    id: "5",
    image: "productForyou5" as const,
    title:
      "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    currentPrice: 7.8,
    originalPrice: 150,
    ratingValue: 1.5,
    totalReviewCount: 13,
    discountPercent: 15,
    wishlist: false,
    discountBadge: false,
    onToggleWishlist: () => {},
  },
  {
    id: "6",
    image: "productForyou6" as const,
    title:
      "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    currentPrice: 7.8,
    originalPrice: 150,
    ratingValue: 1.5,
    totalReviewCount: 13,
    wishlist: false,
    discountBadge: false,
    discountPercent: 15,
    onToggleWishlist: () => {},
  },
];
const ProductsGridScroller = () => {
  return (
    <FlatList
      data={forYouData}
      keyExtractor={(item) => item.id.toString()}
      horizontal={false}
      numColumns={numColumns}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: sidePadding,
        // paddingBottom: tokens.space.md,
        // paddingBottom: layout === "vertical" ? 0 : tokens.space.md,
        gap: tokens.space.md,
      }}
      columnWrapperStyle={{
        columnGap: columnGap,
      }}
      renderItem={({ item }) => <ProductCard product={item} context="grid" />}
    />
  );
};

export default ProductsGridScroller;
