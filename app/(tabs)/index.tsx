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
import CollectionsCardGrid from "@/components/organisms/CollectionsCardGrid";
import {
  CalloutBanners,
  FeaturedPromotionsCarousel,
} from "@/components/organisms/home";
import BrandsCollections from "@/components/organisms/home/BrandsCollections";
import { PromoBannerCard } from "@/components/organisms/home/PromoBannerCard";
import ProductsHorizontalScroller from "@/components/organisms/productHorizontalScroller/ProductsHorizontalScroller";
import ProductsGridScroller from "@/components/organisms/ProductsGridScroller/ProductsGridScroller";
import SalesHorizontalScroller from "@/components/organisms/SalesHorizontalScroller/SalesHorizontalScroller";
import { t } from "@/translations";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { FlatList, Platform, RefreshControl, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, XStack, YStack } from "tamagui";
//

import { useHomeScreenData } from "@/api/hooks/useHomeScreenData";
import { AddressCard } from "@/components/molecules/AddressCard";
import { CollectionsGrid } from "@/components/molecules/home/CollectionsGrid";
import { BottomSheetModalWithFlatList } from "@/components/organisms/bottomSheet";
import PlaceHolder from "@/components/organisms/home/Placeholder";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

const HomeScreen = () => {
  const { top: TOP_INSET, bottom: BOTTOM_INSET } = useSafeAreaInsets();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [open, setOpen] = useState(false);
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

  const { data, isLoading, error, refetch } = useHomeScreenData();
  const [refreshing, setRefreshing] = useState(false);
  console.log("homeData ", data);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

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

  const sections = [
    {
      id: "featuredPromotionsCarousel",
      content: <FeaturedPromotionsCarousel item={data?.carousel} />,
    },
    {
      id: "collections",
      content: <CollectionsGrid itemData={data?.categoryGrid} />,
    },

    {
      id: "calloutBanners",
      content: <CalloutBanners calloutBanners={data?.calloutBanners} />,
    },
    {
      id: "productsHorizontalScroller",
      content: (
        <ProductsHorizontalScroller collection={data?.collectionDisplays} />
      ),
    },
    {
      id: "categories",
      content: (
        <CategorySuggestions
          categoryCollectionGrid={data?.categoryCollectionGrid}
        />
      ),
    },

    {
      id: "productsGridScroller",
      content: <ProductsGridScroller collection={data?.collectionDisplays} />,
    },
    {
      id: "promoBanner",
      content: <PromoBannerCard promoBanners={data?.promoBanners} />,
    },
    {
      id: "collectionsCardGrid",
      content: (
        <CollectionsCardGrid collectionShowcases={data?.collectionShowcases} />
      ),
    },
    {
      id: "brands",
      content: (
        <BrandsCollections brandsCollections={data?.collectionShowcases} />
      ),
    },
    {
      id: "SalesHorizontalScroller",
      content: (
        <SalesHorizontalScroller collection={data?.collectionDisplays} />
      ),
    },
  ];

  const renderItem = ({
    item,
  }: {
    item: { id: string; content: React.ReactNode };
  }) => {
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
      {Platform.OS === "android" && <StatusBar barStyle={"light-content"} />}

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
            padding={"$sm-reg"}
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
        {isLoading ? (
          <PlaceHolder />
        ) : (
          <FlatList
            data={sections}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={getTokenValue("$primary")}
                colors={[getTokenValue("$primary")]}
              />
            }
            ListFooterComponent={
              <Spacer size={Platform.OS === "ios" ? BOTTOM_INSET * 2 : 0} />
            }
          />
        )}
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
              <OpTouch
                onPress={() => {
                  bottomSheetModalRef.current?.close();
                  setOpen(false);
                }}
              >
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
