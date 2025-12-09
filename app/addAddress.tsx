import {
  HeadingSMBold,
  HeadingXSRegular,
  ParagraphMD,
  TextSMSemiBold,
  TextXSRegular,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextMDRegular } from "@/components/atoms/texts/TextMDRegular";
import { TextMDSemiBold } from "@/components/atoms/texts/TextMDSemiBold";
import { PrimaryButton } from "@/components/molecules/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/molecules/buttons/SecondaryButton";
import { fonts } from "@/tamagui/fonts";

import {
  BaseBottomSheetRef,
  BottomSheetModalWithView,
} from "@/components/molecules/bottom-sheets";
import AlertModal from "@/components/organisms/AlertModal";
import { useAuthGuard } from "@/contexts/AuthGuardContext";
import { SHADOW_STYLES } from "@/constants/styles";
import { t } from "@/translations";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState, useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ScrollView, StyleSheet, TextInput } from "react-native";
import CountryPicker, {
  Country,
  CountryCode,
} from "react-native-country-picker-modal";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, XStack, YStack } from "tamagui";
import {
  getCustomerGetAddressesQueryKey,
  useCustomerAddAddress,
  useCustomerUpdateAddress,
  useCustomerDeleteAddress,
  useCustomerSetDefaultAddress,
} from "@/api/generated/customer-addresses/customer-addresses";
import { useAuthenticatedAddresses } from "@/api/hooks/useAddresses";
import type {
  CustomerAddAddressRequest,
  CustomerUpdateAddressRequest
} from "@/api/generated/cartaisyAPI.schemas";
import { useQueryClient } from "@tanstack/react-query";
import useUserStore from "@/store/useUserStore";

const AddAddress = () => {
  const params = useLocalSearchParams();

  // Auth guard for blocking guest access
  const { requireAuth, isAuthenticated } = useAuthGuard();

  // Block guest access - show login modal and redirect back
  useEffect(() => {
    if (!isAuthenticated) {
      // Show login modal
      requireAuth({
        type: "address",
        callback: () => {
          // After successful login, user can add address
        },
      });
      // Go back to previous screen
      router.back();
    }
  }, [isAuthenticated]);

  const editData = useMemo(() => {
    return params.editData ? JSON.parse(params.editData as string) : null;
  }, [params.editData]);

  const editAddressId = params.editAddressId as string | undefined;
  const isEditMode = !!editData && !!editAddressId;

  console.log("[AddAddress] Edit mode:", isEditMode);
  console.log("[AddAddress] Edit data:", editData);
  console.log("[AddAddress] Edit addressId from params:", editAddressId);
  console.log("[AddAddress] All params:", params);

  const defaultValues = useMemo(() => ({
    addressName: editData?.label || "",
    streetAddress: editData?.address1 || "",
    apartmentSuite: editData?.address2 || "",
    city: editData?.city || "",
    stateProvince: editData?.province || "",
    postCode: editData?.zip || "",
    description: editData?.deliveryInstructions || "",
  }), [editData]);

  const form = useForm({
    mode: "onChange",
    defaultValues,
  });
  const queryClient = useQueryClient();

  // Use authenticated addresses hook - only fetches when user is logged in
  const { addresses: existingAddresses } = useAuthenticatedAddresses();
  const { setDefaultAddress } = useUserStore();
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showLastAddressWarning, setShowLastAddressWarning] = useState(false);
  const desc = useWatch({ control: form.control, name: "description" });
  const descLen = (desc ?? "").length;

  // Set default address mutation
  const { mutate: setDefaultAddressAPI } = useCustomerSetDefaultAddress({
    mutation: {
      onSuccess: (response) => {
        console.log("[AddAddress] Default address set successfully:", response);
        // Refetch addresses to get updated default
        queryClient.invalidateQueries({ queryKey: getCustomerGetAddressesQueryKey() });
      },
      onError: (error) => {
        console.error("[AddAddress] Failed to set default address:", error);
      },
    },
  });

  // Add address mutation
  const { mutate: addAddressMutation, isPending: isAddPending } = useCustomerAddAddress({
    mutation: {
      onSuccess: (response) => {
        console.log("[AddAddress] Address added successfully:", response);

        const isFirstAddress = existingAddresses.length === 0;

        // If this is the first address, set it as default via API
        const newAddress = (response as any)?.data?.address;
        if (isFirstAddress && newAddress?._id) {
          console.log("[AddAddress] This is the first address, setting as default...");
          setDefaultAddressAPI({ addressId: newAddress._id });
        } else if ((response as any)?.data?.address?.isDefault) {
          // If the API already marked it as default, update the store
          setDefaultAddress((response as any).data.address);
        }

        // Invalidate addresses query to refetch updated list
        queryClient.invalidateQueries({ queryKey: getCustomerGetAddressesQueryKey() });
        router.back();
      },
      onError: (error) => {
        console.error("[AddAddress] Failed to add address:", error);
        // You can show a toast/alert here
      },
    },
  });

  // Update address mutation
  const { mutate: updateAddressMutation, isPending: isUpdatePending } = useCustomerUpdateAddress({
    mutation: {
      onSuccess: (response) => {
        console.log("[AddAddress] Address updated successfully:", response);

        // Invalidate addresses query to refetch updated list
        queryClient.invalidateQueries({ queryKey: getCustomerGetAddressesQueryKey() });
        router.back();
      },
      onError: (error) => {
        console.error("[AddAddress] Failed to update address:", error);
        // You can show a toast/alert here
      },
    },
  });

  // Delete address mutation
  const { mutate: deleteAddressMutation, isPending: isDeletePending } = useCustomerDeleteAddress({
    mutation: {
      onSuccess: (response) => {
        console.log("[AddAddress] Address deleted successfully:", response);

        // Invalidate addresses query to refetch updated list
        queryClient.invalidateQueries({ queryKey: getCustomerGetAddressesQueryKey() });
        router.back();
      },
      onError: (error: any) => {
        console.error("[AddAddress] Failed to delete address:", error);
        console.error("[AddAddress] Delete error response:", error?.response?.data);
        console.error("[AddAddress] Delete error status:", error?.response?.status);
        console.error("[AddAddress] Delete request URL:", error?.config?.url);
        // You can show a toast/alert here
      },
    },
  });

  const isPending = isAddPending || isUpdatePending || isDeletePending;

  const onSubmit = (data: any) => {
    console.log("[AddAddress] Form submitted with data:", data);

    if (isEditMode && editAddressId) {
      // Update existing address
      const updateData: CustomerUpdateAddressRequest = {
        label: data.addressName,
        address1: data.streetAddress,
        address2: data.apartmentSuite,
        city: data.city,
        province: data.stateProvince,
        country: selectedCountry.cca2,
        countryCode: selectedCountry.cca2,
        zip: data.postCode,
        deliveryInstructions: data.description,
        type: "both",
      };

      console.log("[AddAddress] Updating address with id:", editAddressId, "with data:", updateData);
      updateAddressMutation({ addressId: editAddressId, data: updateData });
    } else {
      // Add new address
      const isFirstAddress = existingAddresses.length === 0;

      const addressData: CustomerAddAddressRequest = {
        label: data.addressName,
        address1: data.streetAddress,
        address2: data.apartmentSuite,
        city: data.city,
        province: data.stateProvince,
        country: selectedCountry.cca2,
        countryCode: selectedCountry.cca2,
        zip: data.postCode,
        deliveryInstructions: data.description,
        isDefault: isFirstAddress,
        type: "both",
      };

      console.log("[AddAddress] Adding new address with data:", addressData);
      addAddressMutation({ data: addressData });
    }
  };

  const handleDelete = () => {
    console.log("[AddAddress] handleDelete called - editAddressId:", editAddressId, "isEditMode:", isEditMode);
    if (!isEditMode || !editAddressId) {
      console.log("[AddAddress] handleDelete returning early - missing editAddressId or not in edit mode");
      return;
    }

    // Check if this is the last address
    if (existingAddresses.length === 1) {
      setShowLastAddressWarning(true);
      return;
    }

    // Find the address being deleted by _id
    const addressIndex = existingAddresses.findIndex((addr: any) => addr._id === editAddressId);
    const addressToDelete = existingAddresses[addressIndex];

    // If deleting the default address, set the next one as default
    if (addressToDelete?.isDefault && existingAddresses.length > 1) {
      // Find the next address (prefer the one after, otherwise before)
      const nextIndex = addressIndex < existingAddresses.length - 1 ? addressIndex + 1 : addressIndex - 1;
      const nextAddress = existingAddresses[nextIndex];

      if (nextAddress?._id) {
        console.log("[AddAddress] Deleting default address, setting next address as default:", nextAddress._id);
        // First set the new default, then delete
        setDefaultAddressAPI({ addressId: nextAddress._id });
      }
    }

    // Delete the address using addressId
    console.log("[AddAddress] Deleting address with id:", editAddressId);
    deleteAddressMutation({ addressId: editAddressId });
  };

  const [selectedCountry, setSelectedCountry] = useState<Country>({
    callingCode: ["44"],
    cca2: "GB",
    currency: ["GBP"],
    flag: "flag-gb",
    name: "United Kingdom",
    region: "Europe",
    subregion: "Northern Europe",
  });
  const helpBottomSheetRef = useRef<BaseBottomSheetRef>(null);
  const { bottom: bottomSafeAreaInset } = useSafeAreaInsets();

  // Pre-fill form data when in edit mode
  useEffect(() => {
    console.log("[AddAddress] useEffect triggered - Edit mode:", isEditMode);

    if (isEditMode && editData) {
      console.log("[AddAddress] Pre-filling form with edit data:", editData);
      console.log("[AddAddress] Current form values before reset:", form.getValues());

      // Use reset to properly re-render all fields with new values
      form.reset(defaultValues, {
        keepDefaultValues: false,
        keepValues: false,
      });

      console.log("[AddAddress] Form values after reset:", form.getValues());

      // Set selected country based on edit data
      if (editData.countryCode) {
        // Try to find the country by code
        const countryCode = editData.countryCode.toUpperCase() as CountryCode;
        setSelectedCountry((prev) => ({
          ...prev,
          cca2: countryCode,
          name: editData.country || prev.name,
        }));
      }
    }
  }, [isEditMode, editData, defaultValues, form]);

  const onSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
  };

  return (
    <YStack backgroundColor="$background" flex={1}>
      <KeyboardAwareScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
        keyboardOpeningTime={0}
        keyboardDismissMode="interactive"
      >
        <YStack padding={"$md"}>
          <HeadingSMBold>
            {isEditMode ? "Edit Address" : t("addAddress.title")}
          </HeadingSMBold>
          <Spacer size={"$sm"} />
          <ParagraphMD>
            {isEditMode
              ? "Update your delivery address details"
              : t("addAddress.subtitle")}
          </ParagraphMD>
        </YStack>
        <Spacer size={"$lg"} />
        <YStack paddingHorizontal={"$md"}>
          <TextSMSemiBold>{t("addAddress.fieldfirst")}</TextSMSemiBold>
          <Spacer size={"$sm"} />
          <Controller
            name="addressName"
            control={form.control}
            rules={{
              required: "Address Name is required",
            }}
            render={({ field, fieldState }) => {
              console.log("[AddAddress] addressName field value:", field.value);
              return (
                <XStack
                  borderWidth={1}
                  borderColor="$lightgrey"
                  borderRadius="$full"
                  alignItems="center"
                  backgroundColor="$white"
                >
                  <FormInput
                    value={field.value}
                    paddingHorizontal={16}
                    onChangeText={field.onChange}
                    placeholder={"Lily 2, London"}
                    width={"90%"}
                    borderWidth={0}
                    editable={true}
                    icon={
                      <AppImage
                        tintColor={getTokenValue("$secondary")}
                        name="locationUnfilled"
                        width={14}
                        height={18}
                      />
                    }
                    // error={fieldState.error?.message}
                    onSubmitEditing={() => form.setFocus("streetAddress")}
                  />
                  <OpTouch
                    hitSlop={{ bottom: 10, top: 10, left: 10, right: 10 }}
                    onPress={() => helpBottomSheetRef.current?.handleOpenPress()}
                  >
                    <AppImage name="warningIcon" width={16} height={16} />
                  </OpTouch>
                </XStack>
              );
            }}
          />
          <Spacer size={"$reg"} />
          <TextSMSemiBold>{t("addAddress.fieldsecond")}</TextSMSemiBold>
          <Spacer size={"$sm"} />
          <OpTouch onPress={() => setShowCountryPicker(true)}>
            <XStack
              alignItems="center"
              borderWidth={1}
              borderColor="$lightgrey"
              borderRadius="$full"
              paddingHorizontal="$reg"
              backgroundColor="$white"
              paddingVertical="$reg"
            >
              <CountryPicker
                withFilter
                withFlag
                withEmoji
                countryCode={selectedCountry.cca2 as CountryCode}
                onSelect={onSelectCountry}
                onClose={() => setShowCountryPicker(false)}
                visible={showCountryPicker}
                theme={{
                  flagSizeButton: 20,
                }}
              />
              <TextMDRegular color="$textgrey">
                {String(selectedCountry?.name || "Select Country")}
              </TextMDRegular>
              <XStack
                alignItems="center"
                gap="$sm"
                paddingHorizontal="$sm"
                marginLeft={"auto"}
              >
                <TextMDSemiBold color="$secondary">
                  {selectedCountry?.cca2 || ""}
                </TextMDSemiBold>
                <AppImage
                  name="arrowDown"
                  width={14}
                  height={8}
                  tintColor={getTokenValue("$secondary")}
                />
              </XStack>
            </XStack>
          </OpTouch>
          <Spacer size={"$reg"} />
          <TextSMSemiBold>{t("addAddress.fieldthird")}</TextSMSemiBold>
          <Spacer size={"$sm"} />
          <Controller
            name="streetAddress"
            control={form.control}
            rules={{
              required: "Street Address is required",
            }}
            render={({ field, fieldState }) => (
              <XStack
                borderWidth={1}
                borderColor="$lightgrey"
                borderRadius="$full"
                alignItems="center"
                backgroundColor="$white"
              >
                <FormInput
                  value={field.value}
                  onChangeText={field.onChange}
                  paddingHorizontal={16}
                  placeholder={"E7158 Whitechapel High St"}
                  width={"90%"}
                  borderWidth={0}
                  icon={
                    <AppImage
                      tintColor={getTokenValue("$secondary")}
                      name="locationIconUnfilled"
                      width={14}
                      height={18}
                    />
                  }
                  // error={fieldState.error?.message}
                  onSubmitEditing={() => form.setFocus("apartmentSuite")}
                />
                {/* <OpTouch>
                  <AppImage name="editIcon" width={16} height={16} />
                </OpTouch> */}
              </XStack>
            )}
          />
          <Spacer size={"$reg"} />
          <TextSMSemiBold>{t("addAddress.fieldfourth")}</TextSMSemiBold>
          <Spacer size={"$sm"} />
          <Controller
            name="apartmentSuite"
            control={form.control}
            rules={{
              required: "Apartment Suite is required",
            }}
            render={({ field, fieldState }) => (
              <XStack
                borderWidth={1}
                borderColor="$lightgrey"
                borderRadius="$full"
                alignItems="center"
                backgroundColor="$white"
              >
                <FormInput
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder={"Suite B225 Intermediate"}
                  paddingHorizontal={16}
                  width={"90%"}
                  borderWidth={0}
                  icon={
                    <AppImage
                      tintColor={getTokenValue("$secondary")}
                      name="suitIcon"
                      width={19}
                      height={16}
                    />
                  }
                  // error={fieldState.error?.message}
                  onSubmitEditing={() => form.setFocus("stateProvince")}
                />
              </XStack>
            )}
          />
          <Spacer size={"$reg"} />
          <TextSMSemiBold>{"City"}</TextSMSemiBold>
          <Spacer size={"$sm"} />
          <Controller
            name="city"
            control={form.control}
            rules={{
              required: "City is required",
            }}
            render={({ field, fieldState }) => (
              <XStack
                borderWidth={1}
                borderColor="$lightgrey"
                borderRadius="$full"
                alignItems="center"
                backgroundColor="$white"
              >
                <FormInput
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder={"London"}
                  paddingHorizontal={16}
                  width={"90%"}
                  borderWidth={0}
                  icon={
                    <AppImage
                      tintColor={getTokenValue("$secondary")}
                      name="locationIconUnfilled"
                      width={14}
                      height={18}
                    />
                  }
                  // error={fieldState.error?.message}
                  onSubmitEditing={() => form.setFocus("stateProvince")}
                />
              </XStack>
            )}
          />
          <Spacer size={"$reg"} />
          <XStack width={"100%"}>
            <YStack flex={1}>
              <TextSMSemiBold>{t("addAddress.fieldfifth")}</TextSMSemiBold>
              <Spacer size={"$sm"} />
              <Controller
                name="stateProvince"
                control={form.control}
                rules={{
                  required: "State / Province is required",
                }}
                render={({ field, fieldState }) => (
                  <FormInput
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder={"London"}
                    //   width={"100%"}
                    borderWidth={1}
                    icon={
                      <AppImage
                        tintColor={getTokenValue("$secondary")}
                        name="flagIcon"
                        width={19}
                        height={16}
                      />
                    }
                    // error={fieldState.error?.message}
                    onSubmitEditing={() => form.setFocus("postCode")}
                  />
                )}
              />
            </YStack>
            <Spacer size={"$sm"} />
            <YStack flex={1}>
              <TextSMSemiBold>{t("addAddress.fieldsix")}</TextSMSemiBold>
              <Spacer size={"$sm"} />
              <Controller
                name="postCode"
                control={form.control}
                rules={{
                  required: "Postcode is required",
                }}
                render={({ field, fieldState }) => (
                  <FormInput
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder={"E1 6LT"}
                    //   width={"100%"}
                    borderWidth={1}
                    icon={
                      <AppImage
                        tintColor={getTokenValue("$secondary")}
                        name="postCodeIcon"
                        width={19}
                        height={16}
                      />
                    }
                    // error={fieldState.error?.message}
                    onSubmitEditing={() => form.setFocus("description")}
                  />
                )}
              />
            </YStack>
          </XStack>
          <Spacer size={"$reg"} />
          <TextSMSemiBold>{t("addAddress.fieldseven")}</TextSMSemiBold>
          <Spacer size={"$sm"} />
          <YStack
            style={{
              ...SHADOW_STYLES,
            }}
            backgroundColor="$white"
            borderRadius="$2xl"
            padding="$reg"
          >
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <TextInput
                    selectionColor={"black"}
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder={
                      "Please just put the package on the front door. Thanks a lot! 😊"
                    }
                    maxLength={300}
                    multiline={true}
                    numberOfLines={8}
                    textAlignVertical="top"
                    placeholderTextColor={getTokenValue("$textgrey")}
                    style={Styles.input}
                    //   error={fieldState.error?.message}
                  />
                </>
              )}
            />
            <Spacer size={"$sm"} />
            <XStack alignItems="center" justifyContent="space-between">
              <TextXSRegular color="$secondary">{`${descLen}/300`}</TextXSRegular>
              <AppImage name="noteIcon" width={12} height={12} />
            </XStack>
          </YStack>
          <Spacer size={"$lg"} />
        </YStack>
      </KeyboardAwareScrollView>
      <ScrollView showsVerticalScrollIndicator={false}></ScrollView>
      <YStack paddingHorizontal={"$md"}>
        {Object.keys(form.formState.errors).length > 0 && (
          <>
            <TextSMSemiBold color="$error">
              {Object.values(form.formState.errors)[0]?.message as string}
            </TextSMSemiBold>
            <Spacer size={"$sm"} />
          </>
        )}
        <PrimaryButton
          label={isEditMode ? "Update Address" : "Save Address"}
          onPress={() => {
            console.log(`[AddAddress] ${isEditMode ? "Update" : "Save"} Address button pressed`);
            console.log("[AddAddress] Form errors:", form.formState.errors);
            console.log("[AddAddress] Form values:", form.getValues());
            form.handleSubmit(onSubmit)();
          }}
          width={"100%"}
          iconPosition="left"
          isLoading={isPending && !isDeletePending}
        />
        {isEditMode && (
          <>
            <Spacer size={"$md"} />
            <SecondaryButton
              label="Delete Address"
              onPress={handleDelete}
              width={"100%"}
              borderColor="$error"
              color="$error"
              isLoading={isDeletePending}
            />
          </>
        )}
      </YStack>
      {/* paddingBottom={} */}
      <Spacer size={bottomSafeAreaInset} />
      <BottomSheetModalWithView snapPoints={["40%"]} ref={helpBottomSheetRef}>
        <YStack
          backgroundColor="$white"
          borderTopLeftRadius="$xl"
          borderTopRightRadius="$xl"
          paddingHorizontal="$md"
          // paddingVertical="$lg"
        >
          {/* Header */}
          <XStack
            alignItems="center"
            justifyContent="space-between"
            marginBottom="$md"
          >
            <HeadingXSRegular>Address Name Help</HeadingXSRegular>
            <OpTouch
              onPress={() => helpBottomSheetRef.current?.handleClosePress()}
            >
              <AppImage name="closeIcon" width={15} height={15} />
            </OpTouch>
          </XStack>

          {/* Content */}
          <YStack gap="$md">
            <ParagraphMD>
              Give your address a memorable name to easily identify it later.
            </ParagraphMD>

            <YStack gap="$sm">
              <TextSMSemiBold>Examples:</TextSMSemiBold>
              <YStack gap="$xs" paddingLeft="$md">
                <TextMDRegular color="$secondary">• Home</TextMDRegular>
                <TextMDRegular color="$secondary">• Office</TextMDRegular>
                <TextMDRegular color="$secondary">• Mom's House</TextMDRegular>
                <TextMDRegular color="$secondary">
                  • Downtown Apartment
                </TextMDRegular>
                <TextMDRegular color="$secondary">• Summer House</TextMDRegular>
              </YStack>
            </YStack>

            <ParagraphMD color="$textgrey">
              This name will help you quickly select the right address during
              checkout.
            </ParagraphMD>
          </YStack>
        </YStack>
      </BottomSheetModalWithView>

      <AlertModal
        visible={showLastAddressWarning}
        onCancel={() => setShowLastAddressWarning(false)}
      >
        <YStack
          backgroundColor="$background"
          padding="$lg"
          borderRadius="$lg"
          width="85%"
          gap="$md"
        >
          <HeadingSMBold color="$text">Cannot Delete Address</HeadingSMBold>
          <ParagraphMD color="$secondary">
            You must have at least one delivery address on your account. Add a new address before deleting this one.
          </ParagraphMD>
          <OpTouch onPress={() => setShowLastAddressWarning(false)}>
            <YStack
              backgroundColor="$primary"
              padding="$sm"
              borderRadius="$md"
              alignItems="center"
            >
              <TextSMSemiBold color="$white">Got it</TextSMSemiBold>
            </YStack>
          </OpTouch>
        </YStack>
      </AlertModal>
    </YStack>
  );
};

export default AddAddress;

const Styles = StyleSheet.create({
  input: {
    fontSize: fonts.figtree.size[5],
    lineHeight: fonts.figtree.lineHeight[2],
    fontFamily: "Figtree-Regular",
    height: 172,
    width: "100%",
  },
});
