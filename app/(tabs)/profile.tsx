import { TextSMRegular, TextSMSemiBold, TextXLBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { Spacer } from "@/components/atoms/Spacer";
import { TextMDRegular } from "@/components/atoms/texts/TextMDRegular";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { ActiveOrders } from "@/components/molecules/profile/ActiveOrders";
import { ActiveListItem } from "@/components/organisms/profile/ActiveListItems";
import { DangerZoneListItem } from "@/components/organisms/profile/DangerZoneListItems";
import { GeneralListItems } from "@/components/organisms/profile/GeneralListItems";

import { PaymentListItem } from "@/components/organisms/profile/PaymentListItems";
import { SecurityListItem } from "@/components/organisms/profile/SecurityListItems";
import { WishlistCarousel } from "@/components/organisms/profile/WishListCarousel";
import { SHADOW_STYLES } from "@/constants/styles";
import { t } from "@/translations";
import { router } from "expo-router";
import React from "react";
import { FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

const ProfileScreen = () => {
  const { bottom: BOTTOM_INSET } = useSafeAreaInsets();
  const profileData = [
    {
      id: "header",
      type: "header",
      content: (
        <YStack paddingHorizontal="$md">
          <Spacer size="$md" />
          <YStack justifyContent="center" alignItems="center">
            <TextXLBold>{"Lily Vermillon"}</TextXLBold>
            <Spacer size="$md" />
            <TextMDRegular color="$secondary">
              {"New York City, NY 10013"}
            </TextMDRegular>
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
              <TextXLBold>{"2018"}</TextXLBold>
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
              <TextXLBold>{"158"}</TextXLBold>
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
              borderRadius={"$2xl"}
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
    <ScreenContainer backgroundColor="background">
      <FlatList
        data={profileData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() => (
          <YStack alignItems="center" justifyContent="center">
            <AppImage name="bag" width={23} height={26} />
            <Spacer size={"$sm"} />
            <TextSMSemiBold>{`${t(
              "common.companyName"
            )} v3.1.8 bugfix9`}</TextSMSemiBold>
            <Spacer size={"$sm"} />
            <TextSMRegular color="$secondary">{`All rights reserved, 2028©`}</TextSMRegular>
            <Spacer size={"$md"} />
          </YStack>
        )}
      />
      <Spacer size={BOTTOM_INSET + 20} />
    </ScreenContainer>
  );
};

export default ProfileScreen;
