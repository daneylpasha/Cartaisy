import { AppImage } from "@/components/atoms/AppImage";
import { Spacer } from "@/components/atoms/Spacer";
import { ParagraphSM } from "@/components/atoms/texts/ParagraphSM";
import { TextMDBold } from "@/components/atoms/texts/TextMDBold";
import { SecondaryButton } from "@/components/molecules/buttons";
import { SCREEN_WIDTH } from "@/constants/styles";
import { t } from "@/translations";

import React, { useState } from "react";
import { FlatList } from "react-native";
import { XStack, YStack } from "tamagui";

interface CalloutData {
  _id: string;
  imageUrl: string;
  title: string;
  subTitle: string;
  buttonText: string;
  action: {
    type: string;
    navigateTo: string;
  };
  position: number;
  isActive: boolean;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
}

type CalloutBannersProps = {
  calloutBanners?: CalloutData[];
};

export const CalloutBanners = ({ calloutBanners: banners }: CalloutBannersProps) => {
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

  const totalBanners = banners?.length || 0;

  if (!banners || banners.length === 0) {
    return null;
  }

  const handleViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveCarouselIndex(viewableItems[0].index || 0);
    }
  };

  return (
    <YStack>
      <FlatList
        data={banners || []}
        keyExtractor={(banner) => banner._id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
          waitForInteraction: true,
          minimumViewTime: 300,
        }}
        onViewableItemsChanged={handleViewableItemsChanged}
        renderItem={({ item: banner }) => (
          <XStack width={SCREEN_WIDTH}>
            <Spacer size={"$md"} />
            <XStack
              padding="$reg"
              width={SCREEN_WIDTH - 32}
              backgroundColor={"$white"}
              borderRadius={"$2xl"}
            >
              <AppImage source={banner?.imageUrl} width={37} height={26} />
              <Spacer size={"$md"} />
              <YStack flex={1}>
                <TextMDBold color="$darkgrey">
                  {banner?.title || t("home.freeShippingCard.title")}
                </TextMDBold>
                <Spacer size={"$sm"} />
                <ParagraphSM color="$secondary">
                  {banner?.subTitle || t("home.freeShippingCard.subtitle")}
                </ParagraphSM>
                <Spacer size={"$reg"} />
                <SecondaryButton
                  paddingVertical={"xs-sm"}
                  paddingHorizontal={"reg"}
                  width={180}
                  borderColor="$lightgrey"
                  color="$secondary"
                  onPress={() => {
                    if (banner?.action?.navigateTo) {
                      console.log("Navigate to:", banner?.action.navigateTo);
                    }
                  }}
                  label={
                    banner?.buttonText || t("home.freeShippingCard.buttonText")
                  }
                />
              </YStack>
            </XStack>
            <Spacer size={"$md"} />
          </XStack>
        )}
      />
      {totalBanners > 1 && (
        <XStack
          justifyContent="center"
          alignItems="center"
          gap="$reg"
          paddingTop="$md"
        >
          {banners?.map((banner: CalloutData, dotIndex: number) => (
            <YStack
              key={`${banner._id}-${dotIndex}`}
              borderRadius="$full"
              width={8}
              height={8}
              backgroundColor={
                activeCarouselIndex === dotIndex ? "$primary" : "$lightgrey"
              }
            />
          ))}
        </XStack>
      )}
    </YStack>
  );
};
