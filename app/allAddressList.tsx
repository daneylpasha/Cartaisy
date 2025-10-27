import { useGetAddresses, useSetDefaultAddress } from "@/api/generated/addresses/addresses";
import { HeadingSMBold, ParagraphMD, TextMDBold, TextSMSemiBold } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { AddressCard } from "@/components/molecules/AddressCard";
import { PrimaryButton } from "@/components/molecules/buttons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  const { data: addressesResponse, refetch: refetchAddresses } = useGetAddresses();

  // Mutation to set default address
  const { mutate: setDefaultAddress, isPending: isSettingDefault } = useSetDefaultAddress({
    mutation: {
      onSuccess: () => {
        console.log("Default address set successfully");
        refetchAddresses();
      },
      onError: (error: any) => {
        console.error("Failed to set default address:", error);
      },
    },
  });
  console.log("[AllAddressList] RAW API RESPONSE:", JSON.stringify(addressesResponse?.data.addresses, null, 2));

  // Store raw addresses to get real IDs
  const rawAddresses = addressesResponse?.data?.addresses || [];

  const addressData: AddressDataItem[] = rawAddresses.map((addr, index) => {
    console.log(`[AllAddressList] Mapping address ${index}, full object:`, JSON.stringify(addr, null, 2));
    return {
      id: index,
      addressId: addr.id || addr._id, // Store the actual API address ID (try both id and _id)
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
    console.log("[AllAddressList] Address data:", addressData);

    // Get the selected address data
    const selectedAddressData = addressData.find((addr) => addr.id === selectedAddress);
    console.log("[AllAddressList] Selected address data:", selectedAddressData);

    // Get the raw address from API response
    const rawAddress = rawAddresses[selectedAddress];
    console.log("[AllAddressList] Raw address from API:", rawAddress);
    const realAddressId = rawAddress?.id || rawAddress?._id;
    console.log("[AllAddressList] Real address ID:", realAddressId);

    // Check if we came from checkout or profile
    const returnTo = params.returnTo as string;
    console.log("[AllAddressList] Return to:", returnTo);

    if (returnTo === "personalInfo") {
      // Use the address ID or fallback to index
      const addressIdToPass = realAddressId || String(selectedAddress);
      console.log("[AllAddressList] Returning to personal info with address ID:", addressIdToPass);

      // Store selected address in AsyncStorage temporarily
      const addressToStore = {
        id: addressIdToPass,
        text: selectedAddressData?.address || "",
      };

      console.log("[AllAddressList] About to store address data:", JSON.stringify(addressToStore));

      AsyncStorage.setItem("pendingSelectedAddress", JSON.stringify(addressToStore))
        .then(() => {
          console.log("[AllAddressList] ✅ Address successfully stored in AsyncStorage");
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

              // Check if we're coming from personalInfo (profile form)
              const returnTo = params.returnTo as string;
              const isFromProfile = returnTo === "personalInfo";

              return (
                <AddressCard
                  item={item}
                  selectedAddress={selectedAddress}
                  setSelectedAddress={handleAddressSelect}
                  defaultBg="$white"
                  // Only provide onEdit if NOT coming from profile form
                  onEdit={
                    !isFromProfile
                      ? () => {
                          console.log("[AllAddressList] Editing address:", fullAddress);
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
            <OpTouch
              onPress={() => router.push("/addAddress")}
            >
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

            <PrimaryButton
              label="Confirm Address"
              onPress={handleConfirm}
              isLoading={isSettingDefault}
            />
          </YStack>
        </>
      )}
    </YStack>
  );
};

export default SelectAddressScreen;
