import { TextSMSemiBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { ParagraphMD } from "@/components/atoms/texts/ParagraphMD";
import { TextLGBold } from "@/components/atoms/texts/TextLGBold";
import { AddressCard } from "@/components/molecules/AddressCard";
import { type BaseBottomSheetRef } from "@/components/molecules/bottom-sheets";
import { PrimaryButton, SecondaryButton } from "@/components/molecules/buttons";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { getTokenValue, XStack, YStack } from "tamagui";
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

export const AddressBottomSheetContent = ({
  bottomSheetRef,
}: {
  bottomSheetRef: React.RefObject<BaseBottomSheetRef | null>;
}) => {
  const [selectedAddress, setSelectedAddress] = useState<number>(0);
  return (
    <YStack
      backgroundColor="$white"
      borderTopLeftRadius="$xl"
      borderTopRightRadius="$xl"
    >
      {/* Scrollable Content Section */}
      <YStack flex={1} height={300} paddingHorizontal="$md">
        <FlatList
          data={addressData}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <YStack>
              <XStack alignItems="center" justifyContent="space-between">
                <TextLGBold>{"Choose Delivery Address"}</TextLGBold>
                <OpTouch
                  onPress={() => bottomSheetRef.current?.handleClosePress()}
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
          contentContainerStyle={{
            gap: getTokenValue("$reg"),
            paddingBottom: getTokenValue("$2xl"),
          }}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          renderItem={({ item }) => (
            <AddressCard
              item={item}
              selectedAddress={selectedAddress}
              setSelectedAddress={setSelectedAddress}
            />
          )}
          ListFooterComponent={
            <YStack paddingTop="$md">
              <OpTouch>
                <XStack alignItems="center" justifyContent="center">
                  <AppImage
                    tintColor={getTokenValue("$primary")}
                    name="locationUnfilled"
                    width={15}
                    height={15}
                  />
                  <Spacer size={"$sm"} />
                  <TextSMSemiBold color="$primary">
                    {"Use my current location"}
                  </TextSMSemiBold>
                </XStack>
              </OpTouch>
            </YStack>
          }
        />
      </YStack>

      {/* Sticky Bottom Section */}
      <YStack
        backgroundColor="$white"
        paddingTop="$md"
        borderTopWidth={StyleSheet.hairlineWidth}
        borderTopColor={"$lightgrey"}
        paddingHorizontal="$md"
      >
        <SecondaryButton
          onPress={() => {
            router.push("/addAddress");
          }}
          label="Add New Address"
          // borderColor="$primary"
          iconPosition="left"
          icon={<AppImage name="addIcon" width={15} height={15} />}
        />
        <Spacer size={"$reg"} />
        <PrimaryButton
          onPress={() => {}}
          icon={<AppImage name="check" width={15} height={15} />}
          label="Apply"
          isLoading={false}
        />
      </YStack>
    </YStack>
  );
};
