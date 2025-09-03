import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextLGBold } from "@/components/atoms/texts/TextLGBold";
import { type BaseBottomSheetRef } from "@/components/molecules/bottom-sheets";
import { PrimaryButton } from "@/components/molecules/buttons";
import DeliveryOptionCard from "@/components/molecules/DeliveryOptionCard";
import { useState } from "react";
import { FlatList } from "react-native";
import { getTokenValue, XStack, YStack } from "tamagui";
const deliveryData = [
  {
    id: 1,
    title: "Standard Shipping",
    estimateddays: "Estimated Delivery: 5-7 days",
    image: "upsIcon",
    cost: "Cost: $5 or free for orders over $50",
  },
  {
    id: 2,
    title: "Standard Shipping",
    estimateddays: "Estimated Delivery: 5-7 days",
    image: "upsIcon",
    cost: "Cost: $5 or free for orders over $50",
  },
  {
    id: 3,
    title: "Standard Shipping",
    estimateddays: "Estimated Delivery: 5-7 days",
    image: "upsIcon",
    cost: "Cost: $5 or free for orders over $50",
  },
];

export const DeliveryBottomSheetContent = ({
  bottomSheetRef,
}: {
  bottomSheetRef: React.RefObject<BaseBottomSheetRef | null>;
}) => {
  const [selectedDelivery, setSelectedDelivery] = useState<number>(0);

  return (
    <YStack
      backgroundColor="$white"
      borderTopLeftRadius="$xl"
      borderTopRightRadius="$xl"
    >
      {/* Scrollable Content Section */}
      <YStack flex={1} height={300}>
        <FlatList
          data={deliveryData}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <YStack paddingHorizontal={"$md"}>
              <XStack alignItems="center" justifyContent="space-between">
                <TextLGBold>{"Choose delivery options"}</TextLGBold>
                <OpTouch
                  onPress={() => bottomSheetRef.current?.handleClosePress()}
                >
                  <AppImage name="closeIcon" width={15} height={15} />
                </OpTouch>
              </XStack>
              <Spacer size={"$2xl"} />
            </YStack>
          }
          contentContainerStyle={{
            gap: getTokenValue("$reg"),
            paddingBottom: getTokenValue("$2xl"),
          }}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          renderItem={({ item }) => (
            <DeliveryOptionCard
              selectedDelivery={selectedDelivery}
              setSelectedDelivery={setSelectedDelivery}
              item={item as any}
            />
          )}
        />
      </YStack>

      {/* Sticky Bottom Section */}
      <YStack backgroundColor="$white" paddingHorizontal="$md">
        <Spacer size={"$reg"} />
        <PrimaryButton
          onPress={() => bottomSheetRef.current?.handleClosePress()}
          icon={<AppImage name="check" width={15} height={15} />}
          label="Apply"
          isLoading={false}
        />
      </YStack>
    </YStack>
  );
};
