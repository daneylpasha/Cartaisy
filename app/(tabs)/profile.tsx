import {
  DynamicStatusBar,
  Loader,
  TextSMRegular,
  TextSMSemiBold,
  TextXLBold,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { Spacer } from "@/components/atoms/Spacer";
import { TextMDRegular } from "@/components/atoms/texts/TextMDRegular";
import { useCustomAlert } from "@/components/molecules/CustomAlert";
import { ActiveOrders } from "@/components/molecules/profile/ActiveOrders";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { ActiveListItem } from "@/components/organisms/profile/ActiveListItems";
import { DangerZoneListItem } from "@/components/organisms/profile/DangerZoneListItems";
import { GeneralListItems } from "@/components/organisms/profile/GeneralListItems";

import { useCustomerGetProfile } from "@/api/generated/customer-authentication/customer-authentication";
import { useAuthenticatedAddresses } from "@/api/hooks/useAddresses";
import { PaymentListItem } from "@/components/organisms/profile/PaymentListItems";
import { SecurityListItem } from "@/components/organisms/profile/SecurityListItems";
import { WishlistCarousel } from "@/components/organisms/profile/WishListCarousel";
import { SHADOW_STYLES } from "@/constants/styles";
import { useAuthGuard } from "@/contexts/AuthGuardContext";
import useAuthStore from "@/store/useAuthStore";
import useFavoritesStore from "@/store/useFavoritesStore";
import useUserStore from "@/store/useUserStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React from "react";
import { FlatList } from "react-native";
import { XStack, YStack } from "tamagui";

const ProfileScreen = () => {
  const { showAlert, AlertComponent } = useCustomAlert();
  const { showLoginModal } = useAuthGuard();

  // Get auth state to check if user is logged in
  const { isGuest, token, _hasHydrated } = useAuthStore();
  const isLoggedIn = !!token && !isGuest;

  // Get local user store data (set during signup)
  const localUser = useUserStore((state) => state.user);

  // Get user profile data from API (only fetch if logged in)
  const {
    data: profileApiData,
    isLoading: isLoadingProfile,
    refetch: refetchProfile,
  } = useCustomerGetProfile({
    query: {
      enabled: isLoggedIn, // Only fetch profile if user is logged in
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors
        if (
          error?.response?.status === 401 ||
          error?.response?.status === 500
        ) {
          return false;
        }
        return failureCount < 2;
      },
    },
  });
  const apiUser = (profileApiData as any)?.data?.user;

  // DEBUG: Check API response
  console.log(
    "[Profile] API Response:",
    JSON.stringify(profileApiData, null, 2)
  );
  console.log("[Profile] totalSpent:", apiUser?.totalSpent);
  console.log("[Profile] totalOrdersCount:", apiUser?.totalOrdersCount);

  // Combine API user with local user store (local store as fallback for freshly signed up users)
  const user = apiUser || localUser;

  // Get addresses to find default address (only fetches when authenticated)
  const { addresses } = useAuthenticatedAddresses();

  // Refetch profile when screen comes into focus (to get updated data after login/signup)
  useFocusEffect(
    React.useCallback(() => {
      if (isLoggedIn) {
        refetchProfile();
      }
    }, [isLoggedIn, refetchProfile])
  );

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

  // Extract user info - prioritize API data, fall back to local store, then show Guest User
  const rawUserName = isLoggedIn
    ? (user as any)?.name || user?.email?.split("@")[0] || "User"
    : "Guest User";

  // Capitalize first letter of each word in username
  const userName = rawUserName
    .split(" ")
    .map(
      (word: string) =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");

  // Use defaultAddress from profile, or find the default address from addresses list
  const defaultAddr = React.useMemo(() => {
    // First check if profile has defaultAddress
    const profileDefault = (user as any)?.defaultAddress;
    if (profileDefault && Object.keys(profileDefault).length > 0) {
      return profileDefault;
    }

    // Fallback: find address with isDefault: true from addresses list
    const defaultFromList = addresses.find(
      (addr: any) => addr.isDefault === true
    );
    if (defaultFromList) {
      return defaultFromList;
    }

    // If no default found, use the first address
    return addresses.length > 0 ? addresses[0] : null;
  }, [user, addresses]);

  const location = defaultAddr
    ? `${defaultAddr.city || ""}, ${defaultAddr.province || ""} ${
        defaultAddr.zip || ""
      }`.trim()
    : "No address added";

  const userSince = user?.createdAt
    ? new Date(user.createdAt).getFullYear().toString()
    : "2024";
  const totalSpent = user?.totalSpent || 0;
  const formattedTotalSpent = `$${totalSpent.toLocaleString()}`;

  // Check if wishlist has items
  const favoriteProductIds = useFavoritesStore(
    (state) => state.favoriteProductIds
  );
  const hasWishlistItems = favoriteProductIds.size > 0;
  // Build profile data based on login state
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
          {isLoggedIn && (
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
                <TextXLBold>{formattedTotalSpent}</TextXLBold>
              </YStack>
            </XStack>
          )}
        </YStack>
      ),
    },
    // Only show orders for logged in users
    ...(isLoggedIn
      ? [
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
        ]
      : []),
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
    // Only show General, Payment, Security, and Danger Zone for logged in users
    ...(isLoggedIn
      ? [
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
        ]
      : [
          // Guest user: show login prompt
          {
            id: "guestLoginPrompt",
            type: "guestLoginPrompt",
            content: (
              <>
                <Spacer size="$xl" />
                <YStack
                  paddingHorizontal="$md"
                  paddingVertical="$lg"
                  marginHorizontal="$md"
                  backgroundColor="$white"
                  borderRadius="$md"
                  alignItems="center"
                  style={{
                    ...SHADOW_STYLES,
                  }}
                >
                  <AppImage name="userIcon" width={48} height={48} />
                  <Spacer size="$md" />
                  <TextSMSemiBold>
                    Sign in to access your account
                  </TextSMSemiBold>
                  <Spacer size="$sm" />
                  <TextSMRegular color="$secondary" textAlign="center">
                    View orders, manage addresses, and more
                  </TextSMRegular>
                  <Spacer size="$lg" />
                  <OpTouch
                    backgroundColor="primary"
                    paddingHorizontal="xl"
                    paddingVertical="reg"
                    borderRadius="md"
                    onPress={showLoginModal}
                  >
                    <TextSMSemiBold color="$white">Sign In</TextSMSemiBold>
                  </OpTouch>
                </YStack>
                <Spacer size="$xl" />
              </>
            ),
          },
        ]),
  ];

  const renderItem = ({ item }: { item: any }) => {
    return (
      <YStack>
        {item.content}
        {item.id !== "wishlistCarousel"}
      </YStack>
    );
  };

  // Show loading state while auth store is hydrating
  if (!_hasHydrated) {
    return (
      <ScreenContainer backgroundColor="background">
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Loader size="large" />
        </YStack>
      </ScreenContainer>
    );
  }

  return (
    <>
      <DynamicStatusBar backgroundColor="#FFFFFF" />
      <AlertComponent />
      <ScreenContainer backgroundColor="background" disableBottomInset>
        <FlatList
          data={profileData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          // contentContainerStyle={{ paddingBottom: 20 }}
          ListFooterComponent={() => (
            <YStack alignItems="center" justifyContent="center">
              <AppImage name="cartaisyColorlogo" width={65} height={26} />
              <Spacer size={"$sm"} />
              <TextSMRegular color="$secondary">{`All rights reserved, 2028©`}</TextSMRegular>
              <Spacer size={"$md"} />
            </YStack>
          )}
        />
      </ScreenContainer>
    </>
  );
};

export default ProfileScreen;
