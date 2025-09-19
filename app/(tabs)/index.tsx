import {
  ParagraphMD,
  TextLGBold,
  TextMDSemiBold,
  TextSMSemiBold,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextMDRegular } from "@/components/atoms/texts/TextMDRegular";
import { TextXSRegular } from "@/components/atoms/texts/TextXSRegular";
import { CategorySuggestions } from "@/components/molecules/CategorySuggestions";
import { CollectionsGrid } from "@/components/molecules/home/CollectionsGrid";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import CollectionsCardGrid from "@/components/organisms/CollectionsCardGrid";
import {
  FeaturedPromotionsCarousel,
  FreeShipping,
} from "@/components/organisms/home";
import BrandsCollections from "@/components/organisms/home/BrandsCollections";
import { PromoBannerCard } from "@/components/organisms/home/PromoBannerCard";
import ProductsGridScroller from "@/components/organisms/ProductsGridScroller";
import ProductsHorizontalScroller from "@/components/organisms/ProductsHorizontalScroller";
import SalesHorizontalScroller from "@/components/organisms/SalesHorizontalScroller";
import { t } from "@/translations";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { FlatList, Platform, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, XStack, YStack } from "tamagui";
//

import { AddressCard } from "@/components/molecules/AddressCard";
import { BottomSheetModalWithFlatList } from "@/components/organisms/bottomSheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
const HomeScreen = () => {
  const { top: TOP_INSET, bottom: BOTTOM_INSET } = useSafeAreaInsets();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [ open, setOpen ] = useState(false);
  const addressData = [
    {
      id: 1,
      name: "Lily Vermillion",
      address: "18752 January Avenue, North Manhattan, New York, NY, 10013",
      shipping: "Shipping Available",
    },
    {
      id: 2,
      name: "JMarcus Gray",
      address: "456 Main St, Anytown, USA",
      shipping: "Shipping Available",
    },
    {
      id: 3,
      name: "John Doe",
      address: "123 Main St, Anytown, USA",
      shipping: "Shipping Available",
    },
    {
      id: 4,
      name: "Sarah Johnson",
      address: "789 Oak Road, Seattle, WA, 98101",
      shipping: "Shipping Available",
    },
    {
      id: 5,
      name: "Michael Chen",
      address: "321 Pine Street, San Francisco, CA, 94105",
      shipping: "Shipping Available",
    },
    {
      id: 6,
      name: "Emma Wilson",
      address: "567 Maple Drive, Chicago, IL, 60601",
      shipping: "Shipping Available",
    },
    {
      id: 7,
      name: "Robert Taylor",
      address: "432 Elm Court, Boston, MA, 02108",
      shipping: "Shipping Available",
    },
  ];
  const handleAddNewAddress = () => {
    bottomSheetModalRef.current?.close();
    setOpen(false);
    router.push("/addAddress");
  };

  const handleApply = () => {
    bottomSheetModalRef.current?.close();
    setOpen(false);
  };

  const [selectedAddress, setSelectedAddress] = useState<number>(0);

  const collectionData = [
    {
      id: 1,
      name: "Beauty & Fashion",
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
      name: "Accessories",
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

 
  const sections = [
    {
      id: "featuredPromotions",
      content: <FeaturedPromotionsCarousel item={featuredPromotionsData} />,
    },
    {
      id: "collections",
      content: <CollectionsGrid item={collectionData} />,
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
            seeAllText="View All"
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
            seeAllText="View All"
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
            seeAllText="View All"
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
            seeAllText="View All"
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
            seeAllText="View All"
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
    // Special spacing for collections section
    const spacerSize = item.id === "featuredPromotions" ? "$xs" : "$xl";
    
    return (
      <YStack>
        {item.content}
        <Spacer size={spacerSize} />
      </YStack>
    );
  };

  return (
    <>
      <YStack backgroundColor={"$primary"} height={TOP_INSET} />
      {
        Platform.OS === "android" && <StatusBar barStyle={"light-content"}/>
      }
      
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
            <OpTouch onPress={() => router.push("/cart")}>
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
            // paddingHorizontal="$md"
            // height={50}
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
          onPress={() => {
            bottomSheetModalRef.current?.present();
            setOpen(true);
          }}
        >
          <XStack justifyContent="space-between" alignItems="center">
            <XStack alignItems="center" gap={"$xs"}>
              <AppImage
                tintColor={getTokenValue("$primarylight")}
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
                style={{
                      transform: [
                        {
                          rotate: open ? "180deg" : "0deg",
                        },
                      ],
                    }}
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
          // ListHeaderComponent={<Spacer size={"$xl"} />}
          ListFooterComponent={
            <Spacer size={Platform.OS === "ios" ? BOTTOM_INSET * 2 : 0} />
          }
        />
      </YStack>
      <BottomSheetModalWithFlatList
        ref={bottomSheetModalRef}
        data={addressData}
        renderItem={({ item }) => (
          <YStack paddingHorizontal="$md">
            <AddressCard
              item={item}
              selectedAddress={selectedAddress}
              setSelectedAddress={setSelectedAddress}
            />
          </YStack>
        )}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <YStack paddingHorizontal="$md">
            <XStack alignItems="center" justifyContent="space-between">
              <TextLGBold>{"Choose Delivery Address"}</TextLGBold>
              <OpTouch onPress={() => {
                bottomSheetModalRef.current?.close();
                setOpen(false);
              }}>
                <AppImage name="closeIcon" width={15} height={15} />
              </OpTouch>
            </XStack>
            <ParagraphMD color="$secondary">
              {
                "Select a delivery location to see product availability and delivery options."
              }
            </ParagraphMD>
            <Spacer size={"$2xl"} />
          </YStack>
        }
        snapPoints={["60%"]}
        enableDynamicSizing={false}
        showFooter={true}
        showBackdrop={true}
        onPrimaryPress={handleApply}
        onSecondaryPress={handleAddNewAddress}
        primaryButtonLabel="Apply"
        secondaryButtonLabel="Add New Address"
        contentContainerStyle={{
          gap: getTokenValue("$reg"),
          paddingBottom: getTokenValue("$reg"),
        }}
        style={{ flex: 1 }}
        ListFooterComponent={
          <YStack paddingTop="$md" paddingHorizontal="$md">
            <OpTouch>
              <XStack alignItems="center" justifyContent="center">
                <AppImage
                  tintColor={getTokenValue("$primary")}
                  name="locationUnfilled"
                  width={15}
                  height={15}
                />
                <Spacer size="$sm" />
                <TextSMSemiBold color="$primary">
                  {"Use my current location"}
                </TextSMSemiBold>
              </XStack>
            </OpTouch>
            <Spacer size={120 + BOTTOM_INSET} />
          </YStack>
        }
      />
    </>
  );
};

export default HomeScreen;
