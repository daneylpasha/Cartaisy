import { useFormattedAddresses } from "@/api/hooks/useAddresses";
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
import useAuthStore from "@/store/useAuthStore";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, useFocusEffect } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, FlatList, Platform, RefreshControl } from "react-native";
import { DynamicStatusBar } from "@/components/atoms";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, XStack, YStack } from "tamagui";

// Layout type from API to data key mapping
type LayoutType =
  | "carousel"
  | "promo_banners"
  | "callout_banners"
  | "category_grid"
  | "collection_displays"
  | "collection_showcases"
  | "category_collection_grid";

type LayoutItem = {
  type: LayoutType;
  position: number;
  isVisible: boolean;
};

const typeToDataKey: Record<LayoutType, string> = {
  carousel: "carousel",
  promo_banners: "promoBanners",
  callout_banners: "calloutBanners",
  category_grid: "categoryGrid",
  collection_displays: "collectionDisplays",
  collection_showcases: "collectionShowcases",
  category_collection_grid: "categoryCollectionGrid",
};

// Type for collection display items from API
type CollectionDisplayItem = {
  type: "large_row" | "small_grid" | "medium_row";
  order: number;
  collection: {
    id: string;
    title: string;
    products: any[];
  };
};

const HomeScreen = () => {
  const { top: TOP_INSET, bottom: BOTTOM_INSET } = useSafeAreaInsets();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [open, setOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Use authenticated addresses hook - only fetches when user is logged in
  const {
    addresses: rawAddresses,
    formattedAddresses: addressData,
    defaultAddressIndex,
    isAuthenticated,
    refetch: refetchAddresses,
    setDefault: setDefaultAddressMutation,
  } = useFormattedAddresses();

  // Refetch addresses when screen comes into focus (only if authenticated)
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        refetchAddresses();
      }
    }, [refetchAddresses, isAuthenticated])
  );

  // Wait for auth store to hydrate before fetching homescreen data
  const { _hasHydrated, token } = useAuthStore();
  const { data, isLoading, refetch, error } = useHomeScreenData(undefined, {
    query: {
      enabled: _hasHydrated, // Only fetch after auth store has loaded token from storage
    },
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Debug logging
  // useEffect(() => {
  //   console.log("[HomeScreen] _hasHydrated:", _hasHydrated);
  //   console.log("[HomeScreen] token exists:", !!token);
  //   console.log("[HomeScreen] isLoading:", isLoading);
  //   console.log("[HomeScreen] error:", error);
  //   console.log("[HomeScreen] data:", data);
  // }, [_hasHydrated, token, isLoading, error, data]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const homescreenData = data?.data;
  // console.log("HomeScreen Data:", homescreenData);

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
        setDefaultAddressMutation(addressId);
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

  // Render component based on layout type
  const renderComponentForType = (type: LayoutType): React.ReactNode => {
    switch (type) {
      case "carousel":
        return (
          <FeaturedPromotionsCarousel carousels={homescreenData?.carousel} />
        );
      case "promo_banners":
        return <PromoBannerCard promoBanners={homescreenData?.promoBanners} />;
      case "callout_banners":
        return (
          <CalloutBanners calloutBanners={homescreenData?.calloutBanners} />
        );
      case "category_grid":
        return <CollectionsGrid itemData={homescreenData?.categoryGrid} />;
      case "collection_displays":
        // Render collections in the order they appear in the API response (sorted by order field)
        return (
          <>
            {(
              homescreenData?.collectionDisplays as
                | CollectionDisplayItem[]
                | undefined
            )?.map((collection: CollectionDisplayItem, index: number) => {
              if (collection.type === "large_row") {
                return (
                  <ProductsHorizontalScroller
                    key={`collection-${collection.order ?? index}`}
                    collections={[collection]}
                  />
                );
              }
              if (collection.type === "small_grid") {
                return (
                  <ProductsGridScroller
                    key={`collection-${collection.order ?? index}`}
                    collection={[collection]}
                  />
                );
              }
              if (collection.type === "medium_row") {
                return (
                  <SalesHorizontalScroller
                    key={`collection-${collection.order ?? index}`}
                    collection={[collection]}
                  />
                );
              }
              return null;
            })}
          </>
        );
      case "collection_showcases":
        return (
          <>
            <CollectionsCardGrid
              collectionShowcases={homescreenData?.collectionShowcases}
            />
            <BrandsCollections
              brandsCollections={homescreenData?.collectionShowcases}
            />
          </>
        );
      case "category_collection_grid":
        return (
          <CategorySuggestions
            categoryCollectionGrid={homescreenData?.categoryCollectionGrid}
          />
        );
      default:
        return null;
    }
  };

  // Check if data exists and has items for a given layout type
  const hasDataForType = (type: LayoutType): boolean => {
    const dataKey = typeToDataKey[type];
    const data = homescreenData?.[dataKey as keyof typeof homescreenData];
    return Array.isArray(data) && data.length > 0;
  };

  // Build sections dynamically from layout array
  const sections = useMemo(() => {
    const layout = homescreenData?.layout as LayoutItem[] | undefined;

    // If no layout from API, use default order (fallback)
    if (!layout || layout.length === 0) {
      const defaultLayout: LayoutItem[] = [
        { type: "carousel", position: 0, isVisible: true },
        { type: "category_grid", position: 1, isVisible: true },
        { type: "callout_banners", position: 2, isVisible: true },
        { type: "collection_displays", position: 3, isVisible: true },
        { type: "category_collection_grid", position: 4, isVisible: true },
        { type: "promo_banners", position: 5, isVisible: true },
        { type: "collection_showcases", position: 6, isVisible: true },
      ];

      return defaultLayout
        .filter((item) => item.isVisible && hasDataForType(item.type))
        .map((item) => ({
          id: item.type,
          content: renderComponentForType(item.type),
        }));
    }

    // Filter visible sections with data (layout is already sorted by position)
    return layout
      .filter((item) => item.isVisible && hasDataForType(item.type))
      .map((item) => ({
        id: `${item.type}_${item.position}`,
        content: renderComponentForType(item.type),
      }));
  }, [homescreenData]);

  const renderItem = ({
    item,
    index,
  }: {
    item: { id: string; content: React.ReactNode };
    index: number;
  }) => {
    // First item needs top spacing to separate from header
    const isFirstItem = index === 0;

    return (
      <YStack>
        {isFirstItem && <Spacer size="$md" />}
        {item.content}
        <Spacer size="$lg" />
      </YStack>
    );
  };

  return (
    <>
      <YStack backgroundColor={"$primary"} height={TOP_INSET} />
      <DynamicStatusBar backgroundColor="#A82A50" />
      <HomeHeader
        topInset={TOP_INSET}
        rotateAnim={rotateAnim}
        onAddressPress={() => {
          // Refetch addresses when opening bottomsheet - only for authenticated users
          if (isAuthenticated) {
            refetchAddresses();
          }
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
              <YStack alignItems="center" justifyContent="center" height={400}>
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
