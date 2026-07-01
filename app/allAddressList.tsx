import { useFormattedAddresses } from "@/api/hooks/useAddresses";
import {
  HeadingSMBold,
  ParagraphMD,
  TextMDBold,
  TextSMSemiBold,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { AddressCard } from "@/components/molecules/AddressCard";
import { PrimaryButton } from "@/components/molecules/buttons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, XStack, YStack } from "tamagui";

type AddressDataItem = {
  id: number;
  addressId: string; // Real API address ID
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
  const [isEditMode, setIsEditMode] = useState(false);

  // Use authenticated addresses hook - only fetches when user is logged in
  const {
    addresses: rawAddresses,
    formattedAddresses,
    isAuthenticated,
    refetch: refetchAddresses,
    setDefault: setDefaultAddressMutation,
    isSettingDefault,
  } = useFormattedAddresses();

  // Refetch addresses when screen comes into focus (only if authenticated)
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated) {
        refetchAddresses();
      }
    }, [refetchAddresses, isAuthenticated])
  );

  // Map to expected format
  const addressData: AddressDataItem[] = formattedAddresses.map((addr: any) => ({
    id: addr.id,
    addressId: addr.addressId,
    name: addr.name,
    address: addr.address,
    shipping: addr.shipping,
    isDefault: addr.isDefault,
  }));

  // Set selected address on mount or when default address changes
  useEffect(() => {
    if (currentSelectedId !== null) {
      setSelectedAddress(currentSelectedId);
    } else if (addressData.length > 0) {
      const defaultAddr = addressData.find((a) => a.isDefault);
      if (defaultAddr) {
        console.log(
          "[AllAddressList] Setting default address as selected:",
          defaultAddr.id
        );
        setSelectedAddress(defaultAddr.id);
      } else if (selectedAddress === 0 || selectedAddress === null) {
        // Only set first address if nothing is selected yet
        setSelectedAddress(addressData[0].id);
      }
    }
  }, [currentSelectedId, addressData.length, rawAddresses]);

  const handleAddressSelect = (addressIndex: number) => {
    setSelectedAddress(addressIndex);

    // Check if we're coming from profile (not from checkout or personalInfo form)
    const returnTo = params.returnTo as string;
    const sessionId = params.sessionId as string;
    const isFromProfile = !returnTo && !sessionId;

    // If from profile, automatically set as default address using MongoDB _id
    if (isFromProfile) {
      const selectedAddr = rawAddresses[addressIndex];
      const addressId = selectedAddr?._id;
      if (addressId) {
        console.log(
          "[AllAddressList] Setting default address from profile, addressId:",
          addressId
        );
        setDefaultAddressMutation(addressId);
      }
    }
  };

  const handleConfirm = () => {
    // Navigate back with selected address
    console.log("[AllAddressList] Confirming address:", selectedAddress);
    console.log("[AllAddressList] Address data:", addressData);

    // Get the selected address data
    const selectedAddressData = addressData.find(
      (addr) => addr.id === selectedAddress
    );
    console.log("[AllAddressList] Selected address data:", selectedAddressData);

    // Get the raw address from API response
    const rawAddress = rawAddresses[selectedAddress];
    console.log("[AllAddressList] Raw address from API:", rawAddress);

    // Check if we came from checkout or profile
    const returnTo = params.returnTo as string;
    console.log("[AllAddressList] Return to:", returnTo);

    if (returnTo === "personalInfo") {
      // Use array index as address identifier
      const addressIdToPass = String(selectedAddress);
      console.log(
        "[AllAddressList] Returning to personal info with address index:",
        addressIdToPass
      );

      // Store selected address in AsyncStorage temporarily
      const addressToStore = {
        id: addressIdToPass,
        text: selectedAddressData?.address || "",
      };

      AsyncStorage.setItem(
        "pendingSelectedAddress",
        JSON.stringify(addressToStore)
      )
        .then(() => {
          console.log(
            "[AllAddressList] ✅ Address successfully stored in AsyncStorage"
          );
          // Verify it was stored
          return AsyncStorage.getItem("pendingSelectedAddress");
        })
        .then((stored) => {
          console.log("[AllAddressList] ✅ Verified stored data:", stored);
          router.back();
        })
        .catch((error) => {
          console.error("[AllAddressList] ❌ Failed to store address:", error);
          router.back();
        });
    } else if (params.sessionId) {
      // Return to checkout with selected address
      router.push({
        pathname: "/checkout",
        params: {
          sessionId: params.sessionId as string,
          selectedAddressId: selectedAddress.toString(),
        },
      });
    } else {
      // Default: just go back
      router.back();
    }
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
          <XStack
            paddingHorizontal="$md"
            justifyContent="flex-end"
            marginBottom="$sm"
          >
            <OpTouch onPress={() => setIsEditMode(!isEditMode)}>
              <TextMDBold color="$primary">
                {isEditMode ? "Done" : "Edit"}
              </TextMDBold>
            </OpTouch>
          </XStack>
          <FlatList
            data={addressData}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: getTokenValue("$md"),
              gap: getTokenValue("$reg"),
              paddingBottom: getTokenValue("$3xl"),
            }}
            renderItem={({ item }: { item: AddressDataItem }) => {
              // Get the full address object from raw addresses
              const fullAddress = rawAddresses[item.id];

              return (
                <AddressCard
                  item={item}
                  selectedAddress={selectedAddress}
                  setSelectedAddress={handleAddressSelect}
                  defaultBg="$white"
                  // Show edit icon only when in edit mode
                  onEdit={
                    isEditMode
                      ? () => {
                          console.log(
                            "[AllAddressList] Editing address:",
                            fullAddress
                          );
                          router.push({
                            pathname: "/addAddress",
                            params: {
                              editData: JSON.stringify(fullAddress),
                              editAddressId: item.addressId,
                            },
                          });
                        }
                      : undefined
                  }
                />
              );
            }}
            ListFooterComponent={
              <>
                <Spacer size={100 + BOTTOM_INSET} />
              </>
            }
          />

          {/* Fixed bottom buttons */}
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
            gap="$sm"
          >
            <OpTouch onPress={() => router.push("/addAddress")}>
              <YStack
                backgroundColor="$white"
                paddingVertical="$reg"
                borderRadius="$md"
                alignItems="center"
                justifyContent="center"
                borderWidth={1}
                borderColor="$primary"
              >
                <TextMDBold color="$primary">{"Add New Address"}</TextMDBold>
              </YStack>
            </OpTouch>

            {/* Only show Confirm button if coming from checkout or personalInfo form */}
            {(params.returnTo === "personalInfo" || params.sessionId) && (
              <PrimaryButton
                label="Confirm Address"
                onPress={handleConfirm}
                isLoading={isSettingDefault}
              />
            )}
          </YStack>
        </>
      )}
    </YStack>
  );
};

export default SelectAddressScreen;
