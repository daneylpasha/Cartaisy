import {
  useGetAddresses,
  useSetDefaultAddress,
} from "@/api/generated/addresses/addresses";
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
  addressId?: string; // Real API address ID
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
  const { data: addressesResponse, refetch: refetchAddresses } =
    useGetAddresses();

  // Mutation to set default address
  const { mutate: setDefaultAddress, isPending: isSettingDefault } =
    useSetDefaultAddress({
      mutation: {
        onSuccess: () => {
          console.log("[AllAddressList] Default address set successfully");
          refetchAddresses();
        },
        onError: (error: any) => {
          console.error(
            "[AllAddressList] Failed to set default address:",
            error
          );
        },
      },
    });

  // Refetch addresses when screen comes into focus (after adding new address)
  useFocusEffect(
    React.useCallback(() => {
      refetchAddresses();
    }, [refetchAddresses])
  );
  console.log(
    "[AllAddressList] RAW API RESPONSE:",
    JSON.stringify(addressesResponse?.data.addresses, null, 2)
  );

  // Store raw addresses to get real IDs
  const rawAddresses = addressesResponse?.data?.addresses || [];

  const addressData: AddressDataItem[] = rawAddresses.map((addr, index) => {
    console.log(
      `[AllAddressList] Mapping address ${index}, full object:`,
      JSON.stringify(addr, null, 2)
    );
    return {
      id: index,
      addressId: String(index), // Use array index as the address identifier
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
    };
  });

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

  const handleAddressSelect = (addressId: number) => {
    setSelectedAddress(addressId);

    // Check if we're coming from profile (not from checkout or personalInfo form)
    const returnTo = params.returnTo as string;
    const sessionId = params.sessionId as string;
    const isFromProfile = !returnTo && !sessionId;

    // If from profile, automatically set as default address using array index
    if (isFromProfile) {
      console.log(
        "[AllAddressList] Setting default address from profile, index:",
        addressId
      );
      setDefaultAddress({ index: addressId });
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
                              editIndex: item.id.toString(),
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
                paddingVertical="$md"
                borderRadius="$full"
                alignItems="center"
                justifyContent="center"
                borderWidth={1}
                borderColor="$primary"
              >
                <TextMDBold color="$primary">Add New Address</TextMDBold>
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
