import { useGetAddresses } from "@/api/generated/addresses/addresses";
import { HeadingSMBold, ParagraphMD, TextSMSemiBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { AddressCard } from "@/components/molecules/AddressCard";
import { PrimaryButton } from "@/components/molecules/buttons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, XStack, YStack } from "tamagui";

type AddressDataItem = {
  id: number;
  name: string;
  address: string;
  shipping: string;
  isDefault: boolean;
};

const SelectAddressScreen = () => {
  const { bottom: BOTTOM_INSET } = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const currentSelectedId = params.selectedAddressId
    ? Number(params.selectedAddressId)
    : null;

  const [selectedAddress, setSelectedAddress] = useState<number>(
    currentSelectedId ?? 0
  );
  const { data: addressesResponse } = useGetAddresses();
  console.log(addressesResponse?.data.addresses, "addressesResponse");
  const addressData: AddressDataItem[] = (
    addressesResponse?.data?.addresses || []
  ).map((addr, index) => ({
    id: index,
    name: addr.label || "Address",
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

  // Set selected address on mount
  useEffect(() => {
    if (currentSelectedId !== null) {
      setSelectedAddress(currentSelectedId);
    } else if (addressData.length > 0) {
      const defaultAddr =
        addressData.find((a) => a.isDefault) || addressData[0];
      setSelectedAddress(defaultAddr.id);
    }
  }, [currentSelectedId, addressData.length]);

  const handleAddressSelect = (addressId: number) => {
    setSelectedAddress(addressId);
  };

  const handleConfirm = () => {
    // Navigate back with selected address
    console.log("[AllAddressList] Confirming address:", selectedAddress);
    router.push({
      pathname: "/checkout",
      params: {
        sessionId: params.sessionId as string,
        selectedAddressId: selectedAddress.toString(),
      },
    });
  };

  const renderEmptyState = () => (
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$xl">
      <AppImage
        name="locationUnfilled"
        width={48}
        height={48}
        tintColor={getTokenValue("$lightgrey")}
      />
      <Spacer size={"$lg"} />
      <HeadingSMBold>No Addresses</HeadingSMBold>
      <Spacer size={"$sm"} />
      <ParagraphMD color="$secondary" textAlign="center">
        You haven't added any addresses yet. Add your first address to continue.
      </ParagraphMD>
      <Spacer size={"$xl"} />
      <OpTouch onPress={() => router.push("/addAddress")}>
        <XStack alignItems="center">
          <AppImage
            tintColor={getTokenValue("$primary")}
            name="addIcon"
            width={16}
            height={16}
          />
          <Spacer size={"$xs"} />
          <TextSMSemiBold color="$primary">Add Address</TextSMSemiBold>
        </XStack>
      </OpTouch>
    </YStack>
  );

  return (
    <YStack flex={1} backgroundColor="$background">
      <YStack padding="$md">
        <HeadingSMBold>Select Shipping Address</HeadingSMBold>
        <Spacer size={"$xs"} />
        <ParagraphMD color="$secondary">
          Choose an address for delivery
        </ParagraphMD>
      </YStack>
      <Spacer size={"$reg"} />

      {addressData.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <FlatList
            data={addressData}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: getTokenValue("$md"),
              gap: getTokenValue("$reg"),
              paddingBottom: getTokenValue("$3xl"),
            }}
            renderItem={({ item }: { item: AddressDataItem }) => (
              <AddressCard
                item={item}
                selectedAddress={selectedAddress}
                setSelectedAddress={handleAddressSelect}
                defaultBg="$white"
              />
            )}
            ListFooterComponent={
              <>
                <Spacer size={100 + BOTTOM_INSET} />
              </>
            }
          />

          {/* Fixed bottom button */}
          <YStack
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            backgroundColor="$background"
            paddingHorizontal="$md"
            paddingTop="$md"
            paddingBottom={Platform.OS === "ios" ? BOTTOM_INSET : "$md"}
            borderTopWidth={1}
            borderTopColor="$lightgrey"
          >
            <PrimaryButton
              label="Confirm Address"
              onPress={handleConfirm}
              isLoading={false}
            />
          </YStack>
        </>
      )}
    </YStack>
  );
};

export default SelectAddressScreen;
