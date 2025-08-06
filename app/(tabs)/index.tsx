import {
  ParagraphMD,
  TextMDSemiBold,
  TextSMSemiBold,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextXSRegular } from "@/components/atoms/texts/TextXSRegular";
import { CategorySuggestions } from "@/components/molecules/CategorySuggestions";
import { CollectionsGrid } from "@/components/molecules/home/CollectionsGrid";
import { ProductCard } from "@/components/molecules/ProductCard";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import {
  FeaturedPromotionsCarousel,
  FreeShipping,
} from "@/components/organisms/home";

import Icons from "@/assets/Icons";
import { SearchBar } from "@/components/organisms/SearchBar";
import { t } from "@/translations";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, ScrollView, XStack, YStack } from "tamagui";

const HomeScreen = () => {
  const collectionData = [
    {
      id: 1,
      name: "Beauty & Fasion",
      image: "collectionBeauty",
    },
    {
      id: 2,
      name: "Health & Fitness",
      image: "collectionFitness",
    },
    {
      id: 3,
      name: "Goods",
      image: "collectionGoods",
    },
    {
      id: 4,
      name: "Electronics",
      image: "collectionElectronics",
    },
    {
      id: 5,
      name: "Accesories",
      image: "collectionAccesories",
    },
    {
      id: 6,
      name: "Baby Care ",
      image: "collectionBaby",
    },
    {
      id: 7,
      name: "Books",
      image: "collectionBooks",
    },
    {
      id: 8,
      name: "Automotive",
      image: "collectionAutomotive",
    },
  ];
  const featuredPromotionsData = [
    {
      id: 1,
      image: "featuredPromotion1",
      title: "Summer Sale",
      description: "The deal or the year is finally here.",
      discount: "50%",
      dealEnds: "10:00:00",
    },
    {
      id: 2,
      image: "featuredPromotion1",
      title: "Summer Sale",
      description: "The deal or the year is finally here.",
      discount: "50%",
      dealEnds: "10:00:00",
    },
    {
      id: 3,
      image: "featuredPromotion1",
      title: "Summer Sale",
      description: "The deal or the year is finally here.",
      discount: "50%",
      dealEnds: "10:00:00",
    },
    {
      id: 4,
      image: "featuredPromotion1",
      title: "Summer Sale",
      description: "The deal or the year is finally here.",
      discount: "50%",
      dealEnds: "10:00:00",
    },
    {
      id: 5,
      image: "featuredPromotion1",
      title: "Summer Sale",
      description: "Get 50% off on all products",
      discount: "50%",
      dealEnds: "10:00:00",
    },
  ];
  const productData = [
    {
      id: 1,
      image: "product1",
      title:
        "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
      price: 100,
      originalPrice: 150,
      ratingValue: 4,
      totalReviewCount: 1000,
      showPrice: true,
      currentPrice: 100,
      // originalPrice: 150,
      discountPercent: 50,
      showRating: true,
      showWishlistButton: true,
      isWishlisted: false,
      onToggleWishlist: () => {},
    },
    {
      id: 2,
      image: "product2",
      title:
        "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
      price: 100,
      originalPrice: 150,
      ratingValue: 4.5,
      totalReviewCount: 100,
      showPrice: true,
      currentPrice: 100,
      // originalPrice: 150,
      discountPercent: 30,
      showRating: true,
      showWishlistButton: true,
      isWishlisted: false,
      onToggleWishlist: () => {},
    },
    {
      id: 3,
      image: "product3",
      title:
        "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
      price: 100,
      originalPrice: 150,
      ratingValue: 4.5,
      totalReviewCount: 100,
      showPrice: true,
      currentPrice: 100,
      // originalPrice: 150,
      showRating: true,
      showWishlistButton: true,
      isWishlisted: false,
      onToggleWishlist: () => {},
    },
  ];

  const categorySuggestionsData = [
    {
      id: 1,
      image: Icons.category1,
      title: "Personal Care",
    },
    {
      id: 2,
      image: Icons.category2,
      title: "Automotive",
    },
    {
      id: 3,
      image: Icons.category3,
      title: "Electronics",
    },
    {
      id: 4,
      image: Icons.category4,
      title: "Health & Fitness",
    },
    {
      id: 5,
      image: Icons.category2,
      title: "Health & Fitness",
    },
  ];
  const forYouData = [
    {
      id: 1,
      image: "productForyou1",
      title:
        "Filtrete 20x20x1 AC Furnace Air Filter, MERV 5, MPR 300, Capture Unwanted Particles",

      originalPrice: 150,
      ratingValue: 4,
      totalReviewCount: 33,
      showPrice: true,
      currentPrice: 9.8,
      // originalPrice: 150,
      discountPercent: 50,
      showRating: true,
      showWishlistButton: true,
      isWishlisted: false,
      onToggleWishlist: () => {},
    },
    {
      id: 2,
      image: "productForyou2",
      title:
        "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",

      originalPrice: 150,
      ratingValue: 2.5,
      totalReviewCount: 10,
      showPrice: true,
      currentPrice: 11.8,
      // originalPrice: 150,
      discountPercent: 30,
      showRating: true,
      showWishlistButton: true,
      isWishlisted: false,
      onToggleWishlist: () => {},
    },
    {
      id: 3,
      image: "productForyou3",
      title:
        "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",

      originalPrice: 150,
      ratingValue: 1.5,
      totalReviewCount: 13,
      showPrice: true,
      currentPrice: 7.8,
      // originalPrice: 150,
      showRating: true,
      showWishlistButton: true,
      isWishlisted: false,
      onToggleWishlist: () => {},
    },
    {
      id: 4,
      image: "productForyou4",
      title:
        "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",

      originalPrice: 150,
      ratingValue: 1.5,
      totalReviewCount: 13,
      showPrice: true,
      currentPrice: 7.8,
      // originalPrice: 150,
      showRating: true,
      showWishlistButton: true,
      isWishlisted: false,
      onToggleWishlist: () => {},
    },
    {
      id: 5,
      image: "productForyou5",
      title:
        "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",

      originalPrice: 150,
      ratingValue: 1.5,
      totalReviewCount: 13,
      showPrice: true,
      currentPrice: 7.8,
      // originalPrice: 150,
      showRating: true,
      showWishlistButton: true,
      isWishlisted: false,
      onToggleWishlist: () => {},
    },
    {
      id: 6,
      image: "productForyou6",
      title:
        "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",

      originalPrice: 150,
      ratingValue: 1.5,
      totalReviewCount: 13,
      showPrice: true,
      currentPrice: 7.8,
      // originalPrice: 150,
      showRating: true,
      showWishlistButton: true,
      isWishlisted: false,
      onToggleWishlist: () => {},
    },
  ];
  const { bottom: BOTTOM_INSET, top: TOP_INSET } = useSafeAreaInsets();

  return (
    <ScrollView
      backgroundColor={"$background"}
      showsVerticalScrollIndicator={false}
    >
      <YStack backgroundColor={"$primary"} height={TOP_INSET} />
      <YStack paddingHorizontal="$md" backgroundColor="$primary" height={140}>
        <XStack alignItems="center" height={40} position="relative">
          <YStack position="absolute" left={0}>
            <TextMDSemiBold color="$white">{"Hello, Lily!"}</TextMDSemiBold>
          </YStack>
          <YStack
            position="absolute"
            left="50%"
            transform={[{ translateX: -25 }]}
          >
            <AppImage name="bagWhite" width={50} height={26} />
          </YStack>
          <YStack position="absolute" right={0}>
            <AppImage name="cartIcon" size={24} />
            <TextXSRegular
              position="absolute"
              backgroundColor="$white"
              top={-8}
              right={-10}
              borderRadius="$full"
              paddingHorizontal={"$xs-sm"}
              color="$black"
            >
              2
            </TextXSRegular>
          </YStack>
        </XStack>
        <Spacer size={"$sm"} />

        <SearchBar onSearch={(query) => console.log("Search:", query)} />
        <Spacer size={"$sm"} />
        <OpTouch hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <XStack justifyContent="space-between" alignItems="center">
            <XStack alignItems="center" gap={"$xs"}>
              <AppImage
                tintColor={getTokenValue("$location")}
                name="locationIcon"
                width={13}
                height={17}
              />
              <Spacer size={"$sm"} />
              {/* <Spacer size={"$sm"} /> */}
              <TextSMSemiBold color="$white">
                {"1752 January Avenue, NY 10013"}
              </TextSMSemiBold>
            </XStack>
            <AppImage
              tintColor={getTokenValue("$white")}
              name="arrowUp"
              width={13}
              height={7.5}
            />
          </XStack>
        </OpTouch>
      </YStack>
      <Spacer size={"$xl"} />
      <CollectionsGrid item={collectionData} />
      <Spacer size={"$xl"} />
      <FeaturedPromotionsCarousel item={featuredPromotionsData} />
      <Spacer size={"$xl"} />
      <FreeShipping />
      <Spacer size={"$xl"} />
      <SectionHeader
        title={t("home.sectionHeader.dealOfTheDay")}
        tintColor={"darkgrey"}
        image="dealIcon"
        seeAllText="See All"
        color="primary"
        onPressSeeAll={() => {}}
      />
      <Spacer size={"$xl"} />
      <ProductCard item={productData} />
      <Spacer size={"$xl"} />
      <SectionHeader
        title={t("home.sectionHeader.categoriesYouMightLike")}
        tintColor={"darkgrey"}
        image="bulb"
        // seeAllText="See All"
        color="primary"
        // onPressSeeAll={() => {}}
      />
      <Spacer size={"$sm"} />
      <ParagraphMD paddingHorizontal="$md">
        {"Find the latest best deals by category"}
      </ParagraphMD>
      <Spacer size={"$reg"} />
      <CategorySuggestions item={categorySuggestionsData} />
      <Spacer size={"$xl"} />
      <SectionHeader
        title={t("home.sectionHeader.forYou")}
        tintColor={"darkgrey"}
        image="forYou"
        seeAllText="See All"
        color="primary"
        onPressSeeAll={() => {}}
      />
      <Spacer size={"$reg"} />
      <ProductCard
        item={forYouData}
        layout="vertical"
        width={163}
        height={163}
      />

      <Spacer size={BOTTOM_INSET * 2} />
    </ScrollView>
  );
};

export default HomeScreen;
