import {
  ParagraphMD,
  TextMDSemiBold,
  TextSMSemiBold,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextMDRegular } from "@/components/atoms/texts/TextMDRegular";
import { TextXSRegular } from "@/components/atoms/texts/TextXSRegular";
import {
  BottomSheetModalWithView,
  type BaseBottomSheetRef,
} from "@/components/molecules/bottom-sheets";
import { CategorySuggestions } from "@/components/molecules/CategorySuggestions";
import { CollectionsGrid } from "@/components/molecules/home/CollectionsGrid";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import CollectionsCardGrid from "@/components/organisms/CollectionsCardGrid";
import {
  FeaturedPromotionsCarousel,
  FreeShipping,
} from "@/components/organisms/home";
import { AddressBottomSheetContent } from "@/components/organisms/home/AddressBottomSheetContent";
import BrandsCollections from "@/components/organisms/home/BrandsCollections";
import { PromoBannerCard } from "@/components/organisms/home/PromoBannerCard";
import ProductsGridScroller from "@/components/organisms/ProductsGridScroller";
import ProductsHorizontalScroller from "@/components/organisms/ProductsHorizontalScroller";
import SalesHorizontalScroller from "@/components/organisms/SalesHorizontalScroller";
import { t } from "@/translations";
import { router } from "expo-router";
import React, { useRef } from "react";
import { FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, XStack, YStack } from "tamagui";

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

  const { bottom: BOTTOM_INSET, top: TOP_INSET } = useSafeAreaInsets();
  const bottomSheetRef = useRef<BaseBottomSheetRef>(null);

  // Define sections for FlatList
  const sections = [
    {
      id: "collections",
      content: <CollectionsGrid item={collectionData} />,
    },
    {
      id: "featuredPromotions",
      content: <FeaturedPromotionsCarousel item={featuredPromotionsData} />,
    },
    {
      id: "freeShipping",
      content: <FreeShipping />,
    },
    {
      id: "dealOfTheDay",
      content: (
        <YStack>
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
        </YStack>
      ),
    },
    {
      id: "categories",
      content: (
        <>
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
          <YStack paddingHorizontal="$md">
            <Spacer size={"$reg"} />
            <CategorySuggestions />
          </YStack>
        </>
      ),
    },
    {
      id: "forYou",
      content: (
        <>
          <SectionHeader
            title={t("home.sectionHeader.forYou")}
            tintColor={"darkgrey"}
            image="forYou"
            seeAllText="See All"
            color="primary"
            onPressSeeAll={() => {}}
          />
          <YStack paddingHorizontal="$md">
            <Spacer size={"$reg"} />
            <ProductsGridScroller />
          </YStack>
        </>
      ),
    },
    {
      id: "promoBanner",
      content: <PromoBannerCard />,
    },
    {
      id: "computersAndAccessories",
      content: (
        <>
          <SectionHeader
            title={t("home.sectionHeader.computersAndAccesories")}
            tintColor={"darkgrey"}
            image="computer"
            seeAllText="See All"
            color="primary"
            onPressSeeAll={() => {}}
          />
          <YStack paddingHorizontal="$md">
            <Spacer size={"$reg"} />
            <CollectionsCardGrid />
          </YStack>
        </>
      ),
    },
    {
      id: "brands",
      content: (
        <YStack>
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
        </YStack>
      ),
    },
    {
      id: "flashSale",
      content: (
        <YStack>
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
        </YStack>
      ),
    },
  ];

  const renderItem = ({
    item,
  }: {
    item: { id: string; content: React.ReactNode };
  }) => {
    return (
      <YStack>
        {item.content}
        <Spacer size={"$xl"} />
      </YStack>
    );
  };

  return (
    <>
      <YStack backgroundColor={"$primary"} height={TOP_INSET} />
      <YStack paddingHorizontal="$md" height={110} backgroundColor="$primary">
        <XStack alignItems="center" paddingVertical={"$xs"} position="relative">
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
            <OpTouch>
              <AppImage name="cartIcon" size={24} />
              <TextXSRegular
                position="absolute"
                backgroundColor="$yellow"
                color="$white"
                top={-8}
                right={-10}
                borderRadius="$full"
                paddingHorizontal={"$xs-sm"}
              >
                {"2"}
              </TextXSRegular>
            </OpTouch>
          </YStack>
        </XStack>
        <Spacer size={"$md"} />

        <OpTouch
          activeOpacity={0.9}
          onPress={() => router.push("/search")}
          hitSlop={10}
        >
          <XStack
            backgroundColor="$white"
            borderRadius="$full"
            paddingHorizontal="$md"
            height={50}
            padding={"$sm-reg"}
            // paddingVertical={"$reg"}
            alignItems="center"
            gap={"$md"}
          >
            <AppImage
              name="searchIcon"
              width={20}
              height={20}
              tintColor="$secondary"
            />

            <TextMDRegular color="$textgrey">
              {`Search ${t("common.companyName")}`}
            </TextMDRegular>
          </XStack>
        </OpTouch>
        <Spacer size={"$sm"} />

        <OpTouch
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => bottomSheetRef.current?.handleOpenPress()}
        >
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

      <YStack backgroundColor={"$background"} flex={1}>
        <FlatList
          data={sections}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<Spacer size={"$xl"} />}
          ListFooterComponent={<Spacer size={BOTTOM_INSET * 2} />}
        />
      </YStack>

      <BottomSheetModalWithView ref={bottomSheetRef}>
        <AddressBottomSheetContent bottomSheetRef={bottomSheetRef} />
      </BottomSheetModalWithView>
    </>
  );
};

export default HomeScreen;
