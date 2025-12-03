import {
  useGetAddresses,
  useSetDefaultAddress,
} from "@/api/generated/addresses/addresses";
import { useHomeScreenData } from "@/api/hooks/useHomeScreenData";
import { ParagraphMD, TextLGBold, TextSMSemiBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { AddressCard } from "@/components/molecules/AddressCard";
import { CategorySuggestions } from "@/components/molecules/CategorySuggestions";
import { CollectionsGrid } from "@/components/molecules/home/CollectionsGrid";
import AlertModal from "@/components/organisms/AlertModal";
import { BottomSheetModalWithFlatList } from "@/components/organisms/bottomSheet";
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
import useUserStore from "@/store/useUserStore";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, XStack, YStack } from "tamagui";

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

  // Backend returns data as array directly, not { addresses: [...] }
  const rawAddresses = Array.isArray(addressesResponse?.data)
    ? addressesResponse.data
    : (addressesResponse?.data?.addresses || []);

  // Update user store when addresses are fetched - find the default one
  React.useEffect(() => {
    const defaultAddr = rawAddresses.find((addr: any) => addr.isDefault);
    if (defaultAddr) {
      setDefaultAddress(defaultAddr);
    }
  }, [addressesResponse, setDefaultAddress]);

  // Set default address mutation
  const { mutate: setDefaultAddressMutation, isPending: isSettingDefault } =
    useSetDefaultAddress({
      mutation: {
        onSuccess: (_response, variables) => {
          // Find the address that was set as default by addressId
          const defaultAddress = rawAddresses.find((addr: any) => addr._id === variables.addressId);
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
  const addressData = rawAddresses.map((addr: any, index: number) => ({
    id: index,
    addressId: addr._id || String(index), // Use MongoDB _id
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
  }));

  // Find the default address index
  const defaultAddressIndex = addressData.findIndex((addr) => addr.isDefault);

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
    // Check if user already has 5 addresses
    if (addressData.length >= 5) {
      setShowAddressLimitModal(true);
      return;
    }

    setOpen(false);
    Animated.timing(rotateAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    bottomSheetModalRef.current?.close();
    setTimeout(() => router.push("/addAddress"), 300);
  };

  const handleEditAddress = (index: number) => {
    const addressToEdit = rawAddresses[index];
    if (addressToEdit) {
      // First close the bottom sheet
      bottomSheetModalRef.current?.close();
      setOpen(false);
      setIsEditMode(false);

      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Wait for bottom sheet to fully close before navigating
      setTimeout(() => {
        router.push({
          pathname: "/addAddress",
          params: {
            editData: JSON.stringify(addressToEdit),
            editAddressId: addressToEdit._id || String(index),
          },
        });
      }, 200);
    }
  };

  const handleApply = () => {
    if (selectedAddress !== null) {
      // Call API to set default address using MongoDB _id
      const selectedAddr = rawAddresses[selectedAddress];
      const addressId = selectedAddr?._id;
      if (addressId) {
        setDefaultAddressMutation({ addressId });
      }
    }
    setOpen(false);
    setIsEditMode(false); // Reset edit mode
    Animated.timing(rotateAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    bottomSheetModalRef.current?.close();
  };

  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddressLimitModal, setShowAddressLimitModal] = useState(false);

  // Update selectedAddress when addresses refetch and default changes
  useEffect(() => {
    if (defaultAddressIndex !== -1 && selectedAddress !== defaultAddressIndex) {
      setSelectedAddress(defaultAddressIndex);
    }
  }, [defaultAddressIndex]);

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
          setIsEditMode(false); // Reset edit mode
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
              setSelectedAddress={isEditMode ? () => {} : setSelectedAddress}
              onEdit={isEditMode ? () => handleEditAddress(item.id) : undefined}
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
                  setIsEditMode(false);
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
            <Spacer size={"$xs"} />
            <ParagraphMD color="$secondary">
              {isEditMode
                ? "Tap on any address to edit it"
                : "Select a delivery location to see product availability and delivery options."}
            </ParagraphMD>
            <Spacer size={"$md"} />
            {addressData.length > 0 ? (
              <XStack alignItems="center" justifyContent="flex-end">
                <OpTouch
                  onPress={() => {
                    setIsEditMode(!isEditMode);
                  }}
                >
                  <TextSMSemiBold color="$primary">
                    {isEditMode ? "Done" : "Edit"}
                  </TextSMSemiBold>
                </OpTouch>
              </XStack>
            ) : (
              <YStack
                alignItems="center"
                justifyContent="center"
                paddingVertical="$xl"
              >
                <AppImage
                  name="locationUnfilled"
                  width={48}
                  height={48}
                  tintColor={getTokenValue("$lightgrey")}
                />
                <Spacer size={"$lg"} />
                <TextLGBold color="$secondary">Address Not Found</TextLGBold>
                <Spacer size={"$sm"} />
                <ParagraphMD
                  color="$textgrey"
                  textAlign="center"
                  paddingHorizontal="$lg"
                >
                  You haven't added any delivery address yet. Add your first
                  address to continue.
                </ParagraphMD>
              </YStack>
            )}
            <Spacer size={"$md"} />
          </YStack>
        }
        snapPoints={["90%"]}
        enableDynamicSizing={false}
        showFooter={!isEditMode}
        showBackdrop={true}
        onPrimaryPress={addressData.length > 0 ? handleApply : undefined}
        onSecondaryPress={handleAddNewAddress}
        primaryButtonLabel="Apply"
        secondaryButtonLabel="Add New Address"
        contentContainerStyle={{
          gap: getTokenValue("$reg"),
          paddingBottom: getTokenValue("$reg"),
        }}
        style={{ flex: 1 }}
        // ListFooterComponent={
        //   <YStack paddingTop="$md" paddingHorizontal="$md">
        //     <OpTouch>
        //       <XStack alignItems="center" justifyContent="center">
        //         <AppImage
        //           tintColor={getTokenValue("$primary")}
        //           name="locationUnfilled"
        //           width={15}
        //           height={15}
        //         />
        //         <Spacer size="$sm" />
        //         <TextSMSemiBold color="$primary">
        //           {"Use my current location"}
        //         </TextSMSemiBold>
        //       </XStack>
        //     </OpTouch>
        //     <Spacer size={120 + BOTTOM_INSET} />
        //   </YStack>
        // }
      />
      <AlertModal
        visible={showAddressLimitModal}
        onCancel={() => setShowAddressLimitModal(false)}
      >
        <YStack
          backgroundColor="$background"
          padding="$lg"
          borderRadius="$lg"
          width="85%"
          gap="$md"
        >
          <TextLGBold color="$text">Address Limit Reached</TextLGBold>
          <ParagraphMD color="$secondary">
            You can only add up to 5 addresses. Please delete an existing
            address to add a new one.
          </ParagraphMD>
          <OpTouch onPress={() => setShowAddressLimitModal(false)}>
            <YStack
              backgroundColor="$primary"
              padding="$sm"
              borderRadius="$md"
              alignItems="center"
            >
              <TextSMSemiBold color="$white">OK</TextSMSemiBold>
            </YStack>
          </OpTouch>
        </YStack>
      </AlertModal>
    </>
  );
};

export default HomeScreen;
