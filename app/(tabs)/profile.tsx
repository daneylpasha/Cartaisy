import { TextSMRegular, TextSMSemiBold, TextXLBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { Spacer } from "@/components/atoms/Spacer";
import { TextMDRegular } from "@/components/atoms/texts/TextMDRegular";
import { useCustomAlert } from "@/components/molecules/CustomAlert";
import { ActiveOrders } from "@/components/molecules/profile/ActiveOrders";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { ActiveListItem } from "@/components/organisms/profile/ActiveListItems";
import { DangerZoneListItem } from "@/components/organisms/profile/DangerZoneListItems";
import { GeneralListItems } from "@/components/organisms/profile/GeneralListItems";

import { useGetProfile } from "@/api/generated/authentication/authentication";
import { PaymentListItem } from "@/components/organisms/profile/PaymentListItems";
import { SecurityListItem } from "@/components/organisms/profile/SecurityListItems";
import { WishlistCarousel } from "@/components/organisms/profile/WishListCarousel";
import { SHADOW_STYLES } from "@/constants/styles";
import useFavoritesStore from "@/store/useFavoritesStore";
import { t } from "@/translations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React from "react";
import { FlatList, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

const ProfileScreen = () => {
  const { bottom: BOTTOM_INSET } = useSafeAreaInsets();
  const { showAlert, AlertComponent } = useCustomAlert();

  // Get user profile data
  const { data: profileApiData, isLoading: isLoadingProfile } = useGetProfile();
  const user = profileApiData?.data?.user;

  // Check for success message from profile update
  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem("profileUpdateSuccess")
        .then((data) => {
          if (data === "true") {
            console.log("[Profile] Showing success alert");
            showAlert({
              type: "success",
              title: "Success",
              message: "Profile updated successfully!",
            });
            // Clear the flag
            AsyncStorage.removeItem("profileUpdateSuccess");
          }
        })
        .catch((error) => {
          console.error("[Profile] Failed to read success flag:", error);
        });
    }, [showAlert])
  );

  // Extract user info using updated schema fields
  const userName =
    (user as any)?.fullName || user?.email?.split("@")[0] || "Guest User";

  // Use defaultAddress field directly from API
  const defaultAddr = (user as any)?.defaultAddress;
  const location = defaultAddr
    ? `${defaultAddr.city || ""}, ${defaultAddr.province || ""} ${
        defaultAddr.zip || ""
      }`.trim()
    : "No address added";

  const userSince = user?.createdAt
    ? new Date(user.createdAt).getFullYear().toString()
    : "2024";
  const totalPurchases = user?.totalOrdersCount || 0;

  // Check if wishlist has items
  const favoriteProductIds = useFavoritesStore(
    (state) => state.favoriteProductIds
  );
  const hasWishlistItems = favoriteProductIds.size > 0;
  const profileData = [
    {
      id: "header",
      type: "header",
      content: (
        <YStack paddingHorizontal="$md">
          <Spacer size="$md" />
          <YStack justifyContent="center" alignItems="center">
            <TextXLBold>{userName}</TextXLBold>
            <Spacer size="$md" />
            <TextMDRegular color="$secondary">{location}</TextMDRegular>
            <Spacer size="$lg" />
          </YStack>
          <XStack justifyContent="center" alignItems="center">
            <YStack
              paddingHorizontal={"$md"}
              paddingVertical={"$reg"}
              alignItems="center"
              justifyContent="center"
              borderRightWidth={0.7}
              borderColor="$lightgrey"
            >
              <AppImage name="calendar" width={18} height={19} />
              <Spacer size="$reg" />
              <TextSMRegular color="$secondary">{"User Since"}</TextSMRegular>
              <TextXLBold>{userSince}</TextXLBold>
            </YStack>
            <YStack
              paddingHorizontal={"$md"}
              paddingVertical={"$reg"}
              alignItems="center"
              justifyContent="center"
            >
              <AppImage name="piggyBank" width={18} height={19} />
              <Spacer size="$reg" />
              <TextSMRegular color="$secondary">
                {"Total Purchase"}
              </TextSMRegular>
              <TextXLBold>{totalPurchases}</TextXLBold>
            </YStack>
          </XStack>
        </YStack>
      ),
    },
    {
      id: "purchases",
      type: "purchases",
      content: (
        <>
          <Spacer size="$lg" />
          <SectionHeader
            title="My Orders"
            showImage={false}
            color="primary"
            seeAllText="View All"
            onPressSeeAll={() => {
              router.push("/orders");
            }}
          />
          <YStack paddingHorizontal="$md">
            <Spacer size="$reg" />
            <YStack
              padding={"$reg"}
              backgroundColor="$white"
              borderRadius={"$md"}
              style={{
                ...SHADOW_STYLES,
              }}
            >
              <ActiveOrders activeOrders={3} />
              <Spacer size="$md" />
              <ActiveListItem />
            </YStack>
          </YStack>
        </>
      ),
    },
    // Conditionally include wishlist sections only if there are items
    ...(hasWishlistItems
      ? [
          {
            id: "wishlist",
            type: "wishlist",
            content: (
              <>
                <Spacer size="$xl" />
                <SectionHeader
                  title="My Wishlist"
                  image="heart"
                  tintColor="darkgrey"
                  showImage={false}
                  color="primary"
                  seeAllText="View All"
                  onPressSeeAll={() => {
                    router.push("/wishlist");
                  }}
                />
                <Spacer size="$reg" />
              </>
            ),
          },
          {
            id: "wishlistCarousel",
            type: "wishlistCarousel",
            content: <WishlistCarousel />,
          },
        ]
      : []),
    {
      id: "generalListItem",
      type: "generalListItem",
      content: (
        <>
          <Spacer size="$lg" />
          <SectionHeader title="General" showImage={false} />
          <Spacer size="$reg" />
          <GeneralListItems />
        </>
      ),
    },
    {
      id: "payment",
      type: "payment",
      content: (
        <>
          <Spacer size="$lg" />
          <SectionHeader title="Payment" showImage={false} />
          <Spacer size="$reg" />
          <PaymentListItem />
        </>
      ),
    },

    {
      id: "security",
      type: "security",
      content: (
        <>
          <Spacer size="$lg" />
          <SectionHeader title="Security" showImage={false} />
          <Spacer size="$reg" />
          <SecurityListItem />
        </>
      ),
    },
    {
      id: "dangerZone",
      type: "dangerZone",
      content: (
        <>
          <Spacer size="$lg" />
          <XStack paddingRight={"$md"} justifyContent="space-between">
            <SectionHeader title="Danger Zone" showImage={false} />
            <YStack paddingRight={"$reg"}>
              <AppImage name="danger" size={19} />
            </YStack>
          </XStack>
          <Spacer size="$reg" />
          <DangerZoneListItem />
          <Spacer size="$xl" />
        </>
      ),
    },
  ];

  const renderItem = ({ item }: { item: any }) => {
    return (
      <YStack>
        {item.content}
        {item.id !== "wishlistCarousel"}
      </YStack>
    );
  };

  return (
    <>
      <AlertComponent />
      <ScreenContainer backgroundColor="background">
        <FlatList
          data={profileData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => (
            <YStack alignItems="center" justifyContent="center">
              <AppImage name="bagSvg" width={23} height={26} />
              <Spacer size={"$sm"} />
              <TextSMSemiBold>{`${t(
                "common.companyName"
              )} v3.1.8 bugfix9`}</TextSMSemiBold>
              <Spacer size={"$sm"} />
              <TextSMRegular color="$secondary">{`All rights reserved, 2028©`}</TextSMRegular>
              {/* <Spacer size={"$md"} /> */}
            </YStack>
          )}
        />
        <Spacer size={Platform.OS === "ios" ? BOTTOM_INSET + 20 : 0} />
      </ScreenContainer>
    </>
  );
};

export default ProfileScreen;
