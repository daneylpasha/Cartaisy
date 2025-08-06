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
import { SectionHeader } from "@/components/molecules/SectionHeader";
import {
  FeaturedPromotionsCarousel,
  FreeShipping,
} from "@/components/organisms/home";

import Icons from "@/assets/Icons";

import CollectionsCardGrid from "@/components/organisms/CollectionsCardGrid";
import BrandsCollections from "@/components/organisms/home/BrandsCollections";
import { PromoBannerCard } from "@/components/organisms/home/PromoBannerCard";
import ProductsGridScroller from "@/components/organisms/ProductsGridScroller";
import ProductsHorizontalScroller from "@/components/organisms/ProductsHorizontalScroller";
import SalesHorizontalScroller from "@/components/organisms/SalesHorizontalScroller";
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
          <OpTouch></OpTouch>
          <YStack position="absolute" right={0}>
            <OpTouch>
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
            </OpTouch>
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
      <ProductsHorizontalScroller />
      <Spacer size={"$xl"} />
      <SectionHeader
        title={t("home.sectionHeader.categoriesYouMightLike")}
        tintColor={"darkgrey"}
        image="bulb"
        color="primary"
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
      <ProductsGridScroller />
      <Spacer size={"$xl"} />
      <PromoBannerCard />
      <Spacer size={"$xl"} />
      <SectionHeader
        title={t("home.sectionHeader.computersAndAccesories")}
        tintColor={"darkgrey"}
        image="computer"
        seeAllText="See All"
        color="primary"
        onPressSeeAll={() => {}}
      />
      <Spacer size={"$reg"} />
      <CollectionsCardGrid />
      <Spacer size={"$xl"} />
      <SectionHeader
        title={t("home.sectionHeader.brandsYouMightLike")}
        tintColor={"darkgrey"}
        image="emptyStar"
        seeAllText="See All"
        color="primary"
        onPressSeeAll={() => {}}
      />
      <Spacer size={"$md"} />
      <BrandsCollections />
      <Spacer size={"$xl"} />
      <SectionHeader
        title={t("home.sectionHeader.flashSale")}
        tintColor={"darkgrey"}
        image="flash"
        seeAllText="See All"
        color="primary"
        onPressSeeAll={() => {}}
      />
      <Spacer size={"$reg"} />
      <SalesHorizontalScroller />
      <Spacer size={"$xl"} />
      <Spacer size={BOTTOM_INSET * 2} />
    </ScrollView>
  );
};

export default HomeScreen;
