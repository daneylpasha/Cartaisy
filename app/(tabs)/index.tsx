import { ParagraphMD, TextLGBold, TextSMSemiBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { CategorySuggestions } from "@/components/molecules/CategorySuggestions";
import CollectionsCardGrid from "@/components/organisms/CollectionsCardGrid";
import {
  CalloutBanners,
  FeaturedPromotionsCarousel,
  HomeHeader,
} from "@/components/organisms/home";
import BrandsCollections from "@/components/organisms/home/BrandsCollections";
import PlaceHolder from "@/components/organisms/home/Placeholder";
import { PromoBannerCard } from "@/components/organisms/home/PromoBannerCard";
import ProductsHorizontalScroller from "@/components/organisms/productHorizontalScroller/ProductsHorizontalScroller";
import ProductsGridScroller from "@/components/organisms/ProductsGridScroller/ProductsGridScroller";
import SalesHorizontalScroller from "@/components/organisms/SalesHorizontalScroller/SalesHorizontalScroller";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, XStack, YStack } from "tamagui";
//

import {
  useGetAddresses,
  useGetDefaultAddress,
  useSetDefaultAddress,
} from "@/api/generated/addresses/addresses";
import { useHomeScreenData } from "@/api/hooks/useHomeScreenData";
import { AddressCard } from "@/components/molecules/AddressCard";
import { CollectionsGrid } from "@/components/molecules/home/CollectionsGrid";
import { BottomSheetModalWithFlatList } from "@/components/organisms/bottomSheet";
import useUserStore from "@/store/useUserStore";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

const HomeScreen = () => {
  const { top: TOP_INSET, bottom: BOTTOM_INSET } = useSafeAreaInsets();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [open, setOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Get user data from store
  const { user, setDefaultAddress } = useUserStore();
  const userName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.fullName ||
      "User"
    : "User";

  // Fetch addresses from API
  const {
    data: addressesResponse,
    isLoading: isLoadingAddresses,
    error: addressError,
    refetch: refetchAddresses,
  } = useGetAddresses();

  // Fetch default address on mount
  const { data: defaultAddressResponse } = useGetDefaultAddress();

  // Update user store when default address is fetched
  React.useEffect(() => {
    if (defaultAddressResponse?.data?.address) {
      setDefaultAddress(defaultAddressResponse.data.address);
    }
  }, [defaultAddressResponse, setDefaultAddress]);

  // Set default address mutation
  const { mutate: setDefaultAddressMutation, isPending: isSettingDefault } =
    useSetDefaultAddress({
      mutation: {
        onSuccess: (response, variables) => {
          // Find the address that was set as default
          const addresses = addressesResponse?.data?.addresses || [];
          const defaultAddress = addresses[variables.index];
          if (defaultAddress) {
            setDefaultAddress(defaultAddress);
          }
          // Refetch addresses to get updated list
          refetchAddresses();
        },
      },
    });

  // Refetch addresses when screen comes into focus (e.g., after adding new address)
  useFocusEffect(
    useCallback(() => {
      refetchAddresses();
    }, [refetchAddresses])
  );

  // Map API addresses to AddressCard format
  const addressData = (addressesResponse?.data?.addresses || []).map(
    (addr, index) => ({
      id: index,
      name: addr.label || userName,
      address: [
        addr.address1,
        addr.address2,
        addr.city,
        addr.province,
        addr.country,
        addr.zip,
      ]
        .filter(Boolean)
        .join(", "),
      shipping: "Shipping Available",
      isDefault: addr.isDefault || false,
    })
  );

  const { data, isLoading, refetch, error } = useHomeScreenData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const homescreenData = data?.data;
  console.log("HomeScreen Data:", homescreenData);

  const handleAddNewAddress = () => {
    setOpen(false);
    Animated.timing(rotateAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    bottomSheetModalRef.current?.close();
    setTimeout(() => router.push("/addAddress"), 300);
  };

  const handleApply = () => {
    if (selectedAddress !== null) {
      // Call API to set default address
      setDefaultAddressMutation({ index: selectedAddress });
    }
    setOpen(false);
    Animated.timing(rotateAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    bottomSheetModalRef.current?.close();
  };

  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);

  const sections = [
    {
      id: "featuredPromotionsCarousel",
      content: (
        <FeaturedPromotionsCarousel carousels={homescreenData?.carousel} />
      ),
    },
    {
      id: "collections",
      content: <CollectionsGrid itemData={homescreenData?.categoryGrid} />,
    },

    {
      id: "calloutBanners",
      content: (
        <CalloutBanners calloutBanners={homescreenData?.calloutBanners} />
      ),
    },
    {
      id: "productsHorizontalScroller",
      content: (
        <ProductsHorizontalScroller
          collections={homescreenData?.collectionDisplays}
        />
      ),
    },
    {
      id: "categories",
      content: (
        <CategorySuggestions
          categoryCollectionGrid={homescreenData?.categoryCollectionGrid}
        />
      ),
    },

    {
      id: "productsGridScroller",
      content: (
        <ProductsGridScroller collection={homescreenData?.collectionDisplays} />
      ),
    },
    {
      id: "promoBanner",
      content: <PromoBannerCard promoBanners={homescreenData?.promoBanners} />,
    },
    {
      id: "collectionsCardGrid",
      content: (
        <CollectionsCardGrid
          collectionShowcases={homescreenData?.collectionShowcases}
        />
      ),
    },
    {
      id: "brands",
      content: (
        <BrandsCollections
          brandsCollections={homescreenData?.collectionShowcases}
        />
      ),
    },
    {
      id: "SalesHorizontalScroller",
      content: (
        <SalesHorizontalScroller
          collection={homescreenData?.collectionDisplays}
        />
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
      {Platform.OS === "android" && (
        <StatusBar
          barStyle={"light-content"}
          backgroundColor={getTokenValue("$primary")}
        />
      )}
      <HomeHeader
        topInset={TOP_INSET}
        rotateAnim={rotateAnim}
        onAddressPress={() => {
          // Refetch addresses when opening bottomsheet
          refetchAddresses();
          bottomSheetModalRef.current?.present();
          setOpen(true);
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }}
      />

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
                refreshing={isRefreshing}
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
        onDismiss={() => {
          setOpen(false);
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }}
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
                  setOpen(false);
                  Animated.timing(rotateAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                  }).start();
                  bottomSheetModalRef.current?.close();
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
