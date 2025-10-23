import {
  TextLGBold,
  TextMDBold,
  TextMDSemiBold,
  TextSMRegular,
  TextXSRegular,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextSMSemiBold } from "@/components/atoms/texts/TextSMSemiBold";
import { SectionHeader } from "@/components/molecules/SectionHeader";

import { SHADOW_STYLES } from "@/constants/styles";
import { t } from "@/translations";
import { router, useLocalSearchParams } from "expo-router";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, StyleSheet, TextInput } from "react-native";
import CountryPicker, {
  Country,
  CountryCode,
} from "react-native-country-picker-modal";

import { useGetAddresses } from "@/api/generated/addresses/addresses";
import { useGetShippingRates, useSaveShipping } from "@/api/generated/checkout/checkout";
import { BottomSheetModalWithFlatList } from "@/components/organisms/bottomSheet";
import { fonts } from "@/tamagui/fonts";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, XStack, YStack } from "tamagui";
import { AddressCard } from "../AddressCard";
import DeliveryOptionCard from "../DeliveryOptionCard";

type PhoneNumberForm = {
  phone: string;
  deliveryinstructions?: string;
};

interface ShippingProps {
  sessionId: string;
  onStepComplete?: () => void;
}

export interface ShippingRef {
  handleContinue: () => void;
  isValid: () => boolean;
}

const Shipping = forwardRef<ShippingRef, ShippingProps>(
  ({ sessionId, onStepComplete }, ref) => {
    const params = useLocalSearchParams();
    console.log("[Shipping] Component rendered with params:", params);

    const [selectedAddress, setSelectedAddress] = useState<number>(0);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
      null
    );
    const { bottom: BOTTOM_INSET } = useSafeAreaInsets();
    const { data: addressesResponse } = useGetAddresses();

    // Fetch shipping rates when address is selected
    // Note: addressId is the array index (0, 1, 2...) from the /addresses endpoint
    const shippingRatesParams = {
      sessionId,
      addressId: selectedAddressId ?? 0,
    };

    const { data: shippingRatesResponse, isLoading: isLoadingShippingRates } =
      useGetShippingRates(shippingRatesParams, {
        query: {
          enabled: !!sessionId && selectedAddressId !== null,
        },
      });

    // Save shipping mutation
    const { mutate: saveShippingInfo, isPending: isSavingShipping } = useSaveShipping({
      mutation: {
        onSuccess: (response) => {
          console.log("[Shipping] Saved successfully:", response);
          Alert.alert("Success", "Shipping information saved! Moving to payment step.");
          // Call parent callback to move to next step
          onStepComplete?.();
        },
        onError: (error: any) => {
          console.error("[Shipping] Save error:", error);
          Alert.alert(
            "Error",
            error?.response?.data?.error || "Failed to save shipping information"
          );
        },
      },
    });

    // Log shipping rates when data changes
    useEffect(() => {
      if (shippingRatesResponse) {
        console.log("[Shipping] Shipping rates fetched successfully:", {
          params: shippingRatesParams,
          rates: shippingRatesResponse.data.shippingRates,
        });
      }
    }, [shippingRatesResponse]);

    const addressData = (addressesResponse?.data?.addresses || []).map(
      (addr, index) => ({
        id: index, // Using index as ID since IAddress doesn't have id field
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
      })
    );

    // Handle address selection
    const handleAddressSelect = (addressIndex: number) => {
      console.log("[Shipping] Address selected:", { addressIndex, sessionId });
      setSelectedAddress(addressIndex);
      setSelectedAddressId(addressIndex);
      // Reset shipping selection when address changes
      setSelectedShippingHandle(null);
    };

    // Auto-select default or first address on mount
    useEffect(() => {
      // If params has selectedAddressId, use that
      if (params.selectedAddressId !== undefined) {
        const addressId = Number(params.selectedAddressId);
        console.log("[Shipping] Setting address from params:", addressId);
        handleAddressSelect(addressId);
      } else if (addressData.length > 0 && selectedAddressId === null) {
        // Otherwise, auto-select default or first address
        const defaultAddr =
          addressData.find((a) => a.isDefault) || addressData[0];
        handleAddressSelect(defaultAddr.id);
      }
    }, [addressData.length, params.selectedAddressId]);

    const form = useForm();
    const bottomSheetRef = useRef<BottomSheetModal>(null);

    // Address card item type
    type AddressDataItem = {
      id: number;
      name: string;
      address: string;
      shipping: string;
      isDefault: boolean;
    };

    // Convert shipping rates to delivery data format
    type DeliveryDataItem = {
      id: number;
      handle: string;
      title: string;
      estimateddays: string;
      image: "upsIcon";
      cost: string;
      price: number;
    };

    // Convert shipping rates to delivery data format
    const deliveryData: DeliveryDataItem[] = (
      shippingRatesResponse?.data?.shippingRates || []
    ).map((rate, index) => ({
      id: index + 1,
      handle: rate.handle,
      title: rate.title,
      estimateddays:
        rate.description ||
        rate.estimatedDelivery ||
        "Estimated Delivery: Not available",
      image: "upsIcon" as const,
      cost: `Cost: $${rate.price.toFixed(2)}`,
      price: rate.price,
    }));

    const [selectedDelivery, setSelectedDelivery] = useState<number>(0);
    const [selectedShippingHandle, setSelectedShippingHandle] = useState<
      string | null
    >(null);

    // Auto-select first shipping rate when data loads
    useEffect(() => {
      if (deliveryData.length > 0 && !selectedShippingHandle) {
        console.log("[Shipping] Shipping rates loaded:", deliveryData);
        const firstRate = deliveryData[0];
        setSelectedDelivery(firstRate.id);
        setSelectedShippingHandle(firstRate.handle);
        console.log("[Shipping] Auto-selected first rate:", firstRate);
      }
    }, [deliveryData.length]);

    const handleApply = () => {
      const selectedOption = deliveryData.find(
        (d: DeliveryDataItem) => d.id === selectedDelivery
      );
      if (selectedOption) {
        setSelectedShippingHandle(selectedOption.handle);
      }
      bottomSheetRef.current?.close();
    };

    // Get selected delivery details
    const selectedDeliveryOption = deliveryData.find(
      (d: DeliveryDataItem) => d.id === selectedDelivery
    );
    const [selectedCountry, setSelectedCountry] = useState<Country>({
      callingCode: ["44"],
      cca2: "GB",
      currency: ["GBP"],
      flag: "flag-gb",
      name: "United Kingdom",
      region: "Europe",
      subregion: "Northern Europe",
    });
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const {
      control,
      handleSubmit,
      formState: { errors },
    } = useForm<PhoneNumberForm>({
      defaultValues: {
        phone: "",
        deliveryinstructions: "",
      },
    });

    const onSubmit = (data: PhoneNumberForm) => {
      // Validate all required fields
      if (!selectedAddressId && selectedAddressId !== 0) {
        Alert.alert("Validation Error", "Please select a shipping address");
        return;
      }

      if (!selectedShippingHandle) {
        Alert.alert("Validation Error", "Please select a shipping method");
        return;
      }

      if (!data.phone) {
        Alert.alert("Validation Error", "Please enter your contact number");
        return;
      }

      const fullPhoneNumber = `+${selectedCountry.callingCode[0]}${data.phone}`;

      console.log("[Shipping] Submitting shipping info:", {
        sessionId,
        shippingAddressId: selectedAddressId,
        contactNumber: fullPhoneNumber,
        shippingRateHandle: selectedShippingHandle,
        deliveryInstructions: data.deliveryinstructions,
      });

      // Save shipping info
      saveShippingInfo({
        data: {
          sessionId,
          shippingAddressId: selectedAddressId,
          contactNumber: fullPhoneNumber,
          shippingRateHandle: selectedShippingHandle,
          deliveryInstructions: data.deliveryinstructions,
        },
      });
    };

    const onSelectCountry = (country: Country) => {
      setSelectedCountry(country);
      setShowCountryPicker(false);
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      handleContinue: () => {
        if (isSavingShipping) {
          console.log("[Shipping] Already saving, please wait...");
          return;
        }
        handleSubmit(onSubmit)();
      },
      isValid: () => {
        return !!(selectedAddressId && selectedShippingHandle);
      },
    }));
    // const addressData = [
    //   {
    //     id: 1,
    //     name: "Lily Vermillion",
    //     address: "18752 January Avenue, North Manhattan, New York, NY, 10013",
    //     shipping: "Shipping Available",
    //   },
    //   {
    //     id: 2,
    //     name: "JMarcus Gray",
    //     address: "456 Main St, Anytown, USA",
    //     shipping: "Shipping Available",
    //   },
    //   {
    //     id: 3,
    //     name: "John Doe",
    //     address: "123 Main St, Anytown, USA",
    //     shipping: "Shipping Available",
    //   },
    // ];
    return (
      <YStack>
        <SectionHeader
          title={t("checkout.sectionHeader.shippingaddress")}
          tintColor={"darkgrey"}
          image="mapPinIcon"
          seeAllText="View All"
          color="primary"
          onPressSeeAll={() => {
            router.push({
              pathname: "/allAddressList",
              params: {
                selectedAddressId: selectedAddressId?.toString(),
                sessionId: sessionId,
              },
            });
          }}
        />
        <Spacer size={"$reg"} />
        <YStack paddingHorizontal={"$md"}>
          <YStack
            paddingHorizontal="$md"
            backgroundColor={"$white"}
            borderWidth={1}
            borderColor={"$lightgrey"}
            borderRadius={"$3xl"}
            overflow="hidden"
          >
            {addressData.length === 0 ? (
              // Empty state - No addresses
              <YStack paddingVertical={"$2xl"} alignItems="center">
                <AppImage
                  name="locationUnfilled"
                  width={28}
                  height={28}
                  tintColor={getTokenValue("$lightgrey")}
                />
                <Spacer size={"$md"} />
                <TextMDSemiBold color="$secondary">
                  {"No addresses added yet"}
                </TextMDSemiBold>
                <Spacer size={"$xs"} />
                <TextSMRegular color="$textgrey" textAlign="center">
                  {"Add a delivery address to continue"}
                </TextSMRegular>
              </YStack>
            ) : (
              // Has addresses - Show only selected address
              <>
                <YStack paddingVertical={"$md"}>
                  {addressData
                    .filter((item) => item.id === selectedAddressId)
                    .map((item) => (
                      <AddressCard
                        key={item.id}
                        item={item}
                        selectedAddress={selectedAddress}
                        setSelectedAddress={handleAddressSelect}
                        defaultBg="$white"
                      />
                    ))}
                </YStack>
              </>
            )}
          </YStack>
        </YStack>
        <Spacer size={"$reg"} />
        <YStack paddingHorizontal={"$md"}>
          <OpTouch onPress={() => router.push("/addAddress")}>
            <YStack
              backgroundColor="$white"
              borderRadius="$3xl"
              borderWidth={1}
              borderColor="$lightgrey"
              borderStyle="dashed"
              padding="$md"
              alignItems="center"
              justifyContent="center"
            >
              <XStack alignItems="center">
                <AppImage
                  tintColor={getTokenValue("$primary")}
                  name="addIcon"
                  width={15}
                  height={15}
                />
                <Spacer size={"$sm"} />
                <TextSMSemiBold color="$primary">
                  {"Add New Address"}
                </TextSMSemiBold>
              </XStack>
            </YStack>
          </OpTouch>
        </YStack>
        <Spacer size={"$xl"} />
        <SectionHeader
          title={t("checkout.sectionHeader.deliveryinstructions")}
          tintColor={"darkgrey"}
          image="truck"
        />
        <Spacer size={"$reg"} />
        <YStack paddingHorizontal={"$md"}>
          <YStack
            style={{
              ...SHADOW_STYLES,
            }}
            backgroundColor="$white"
            borderRadius="$2xl"
            padding="$reg"
          >
            <Controller
              name="deliveryinstructions"
              control={form.control}
              rules={{
                required: "Delivery Instructions is required",
              }}
              render={({ field, fieldState }) => (
                <>
                  <TextInput
                    selectionColor={"black"}
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder={"Just leave them in front of the door..."}
                    multiline={true}
                    numberOfLines={8}
                    textAlignVertical="top"
                    placeholderTextColor={getTokenValue("$textgrey")}
                    style={Styles.input}
                  />
                  {fieldState.error?.message && (
                    <TextSMSemiBold color="$error">
                      {fieldState.error?.message}
                    </TextSMSemiBold>
                  )}
                </>
              )}
            />
            <Spacer size={"$sm"} />
            <XStack alignItems="center" justifyContent="space-between">
              <TextXSRegular color="$secondary">{"300/300"}</TextXSRegular>
              <AppImage name="noteIcon" width={12} height={12} />
            </XStack>
          </YStack>
        </YStack>
        <Spacer size={"$xl"} />
        <SectionHeader
          title={t("checkout.sectionHeader.mobilecontact")}
          tintColor={"darkgrey"}
          image="mobileIcon"
        />
        <Spacer size={"$reg"} />
        <YStack paddingHorizontal={"$md"}>
          <Spacer size={"$sm"} />
          <YStack
            borderRadius={"$3xl"}
            borderWidth={1}
            borderColor="$lightgrey"
            backgroundColor="$white"
            overflow="hidden"
          >
            <Controller
              control={control}
              name="phone"
              rules={{
                required: "Phone number is required",
                minLength: {
                  value: 10,
                  message: "Phone number too short",
                },
                // validate: validatePhoneNumber,
              }}
              render={({ field: { onChange, value } }) => (
                <XStack alignItems="center">
                  <OpTouch onPress={() => setShowCountryPicker(true)}>
                    <XStack
                      alignItems="center"
                      // borderWidth={1}
                      borderRightWidth={1}
                      borderRightColor="$lightgrey"
                      paddingHorizontal={"$reg"}
                      backgroundColor="$background"
                      paddingVertical={"$reg"}
                    >
                      <CountryPicker
                        countryCode={selectedCountry.cca2 as CountryCode}
                        withFilter
                        withFlag
                        withCallingCode
                        withEmoji
                        onSelect={onSelectCountry}
                        onClose={() => setShowCountryPicker(false)}
                        visible={showCountryPicker}
                        theme={{
                          flagSizeButton: 20,
                        }}
                      />
                      <Spacer size={"$xxs"} />
                      <AppImage
                        name="arrowDown"
                        width={14}
                        height={8}
                        tintColor={getTokenValue("$lightgrey")}
                      />
                    </XStack>
                  </OpTouch>
                  <XStack alignItems="center" paddingHorizontal={"$reg"}>
                    <TextMDSemiBold color="$secondary">
                      +{selectedCountry.callingCode[0]}
                    </TextMDSemiBold>
                    <FormInput
                      width={"68%"}
                      borderWidth={0}
                      paddingHorizontal={0}
                      value={value}
                      keyboardType="numeric"
                      onChangeText={(text) => {
                        // Only allow numbers
                        const numericText = text.replace(/[^0-9]/g, "");
                        onChange(numericText);
                      }}
                      placeholder={t("profile.phoneNumber.placeholder")}
                    />
                    <OpTouch onPress={() => setShowCountryPicker(true)}>
                      <AppImage name="arrowDown" width={14} height={8} />
                    </OpTouch>
                  </XStack>
                </XStack>
              )}
            />
          </YStack>
          {errors.phone && (
            <TextSMRegular color="$error">{errors.phone.message}</TextSMRegular>
          )}
        </YStack>
        <Spacer size={"$xl"} />
        <SectionHeader
          title={t("checkout.sectionHeader.shippingoptions")}
          tintColor={"darkgrey"}
          image="package"
          seeAllText="View All"
          color="primary"
          onPressSeeAll={() => bottomSheetRef.current?.present()}
        />
        <Spacer size={"$reg"} />
        <YStack paddingHorizontal={"$md"}>
          {selectedDeliveryOption ? (
            <YStack
              style={{ ...SHADOW_STYLES }}
              backgroundColor="$white"
              borderRadius="$2xl"
              padding="$reg"
            >
              <XStack>
                <XStack alignItems="center">
                  <YStack
                    backgroundColor={"$background"}
                    borderRadius={"$full"}
                    width={48}
                    height={48}
                    justifyContent="center"
                    alignItems="center"
                    marginTop={-10}
                  >
                    <AppImage name="upsIcon" width={43} height={43} />
                  </YStack>
                  <Spacer size={"$reg"} />
                  <YStack>
                    <TextMDBold>{selectedDeliveryOption.title}</TextMDBold>
                    <Spacer size={"$xs"} />
                    <TextSMRegular>
                      {selectedDeliveryOption.estimateddays}
                    </TextSMRegular>
                    <Spacer size={"$xs-sm"} />
                    <TextXSRegular color="$secondary">
                      {selectedDeliveryOption.cost}
                    </TextXSRegular>
                  </YStack>
                </XStack>
              </XStack>
            </YStack>
          ) : isLoadingShippingRates ? (
            <YStack
              style={{ ...SHADOW_STYLES }}
              backgroundColor="$white"
              borderRadius="$2xl"
              padding="$reg"
              justifyContent="center"
              alignItems="center"
              minHeight={80}
            >
              <TextSMRegular color="$secondary">
                Loading shipping options...
              </TextSMRegular>
            </YStack>
          ) : selectedAddressId === null ? (
            <YStack
              style={{ ...SHADOW_STYLES }}
              backgroundColor="$white"
              borderRadius="$2xl"
              padding="$reg"
              justifyContent="center"
              alignItems="center"
              minHeight={80}
            >
              <TextSMRegular color="$secondary">
                Please select a shipping address first
              </TextSMRegular>
            </YStack>
          ) : (
            <YStack
              style={{ ...SHADOW_STYLES }}
              backgroundColor="$white"
              borderRadius="$2xl"
              padding="$reg"
              justifyContent="center"
              alignItems="center"
              minHeight={80}
            >
              <TextSMRegular color="$secondary">
                No shipping options available for this address
              </TextSMRegular>
            </YStack>
          )}
        </YStack>
        <BottomSheetModalWithFlatList
          ref={bottomSheetRef}
          data={deliveryData}
          renderItem={({ item }: { item: DeliveryDataItem }) => (
            <DeliveryOptionCard
              selectedDelivery={selectedDelivery}
              setSelectedDelivery={setSelectedDelivery}
              item={item}
            />
          )}
          // keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <YStack paddingHorizontal={"$md"}>
              <XStack alignItems="center" justifyContent="space-between">
                <TextLGBold>{"Choose delivery options"}</TextLGBold>
                <OpTouch onPress={() => bottomSheetRef.current?.close()}>
                  <AppImage name="closeIcon" width={15} height={15} />
                </OpTouch>
              </XStack>
              <Spacer size={"$2xl"} />
            </YStack>
          }
          snapPoints={["60%"]}
          enableDynamicSizing={false}
          showFooter={true}
          showBackdrop={true}
          onPrimaryPress={handleApply}
          // onSecondaryPress={handleAddNewAddress}
          primaryButtonLabel="Apply"
          iconPosition="right"
          icon={"check"}
          //
          secondaryButtonLabel="Add New Address"
          contentContainerStyle={{
            gap: getTokenValue("$reg"),
            paddingBottom: getTokenValue("$reg"),
          }}
          style={{ flex: 1 }}
          ListFooterComponent={<Spacer size={48 + BOTTOM_INSET} />}
        />
      </YStack>
    );
  }
);

const Styles = StyleSheet.create({
  input: {
    fontSize: fonts.figtree.size[5],
    lineHeight: fonts.figtree.lineHeight[2],
    fontFamily: "Figtree-Regular",
    height: 172,
    width: "100%",
  },
});

export default Shipping;
export { type PhoneNumberForm };
