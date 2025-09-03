import {
  TextMDBold,
  TextMDSemiBold,
  TextSMRegular,
  TextXSRegular,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { Divider } from "@/components/atoms/Divider";
import { FormInput } from "@/components/atoms/FormInput";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextSMSemiBold } from "@/components/atoms/texts/TextSMSemiBold";
import { SectionHeader } from "@/components/molecules/SectionHeader";

import { SHADOW_STYLES } from "@/constants/styles";
import { t } from "@/translations";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, FlatList, StyleSheet, TextInput } from "react-native";
import CountryPicker, {
  Country,
  CountryCode,
} from "react-native-country-picker-modal";

import { DeliveryBottomSheetContent } from "@/components/organisms/checkout/DeliveryBottomSheet";
import { fonts } from "@/tamagui/fonts";
import { getTokenValue, XStack, YStack } from "tamagui";
import { AddressCard } from "../AddressCard";
import { BaseBottomSheetRef, BottomSheetModalWithView } from "../bottom-sheets";

type PhoneNumberForm = {
  phone: string;
};
const Shipping = () => {
  const [selectedAddress, setSelectedAddress] = useState<number>(0);
  const form = useForm();
  const bottomSheetRef = useRef<BaseBottomSheetRef>(null);
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
    },
  });

  const onSubmit = (data: PhoneNumberForm) => {
    const fullPhoneNumber = `+${selectedCountry.callingCode[0]}${data.phone}`;
    Alert.alert("Submitted!", `Phone: ${fullPhoneNumber}`);
    router.push("/(auth)/login");
  };

  const onSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
  };
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
  ];
  return (
    <YStack>
      <SectionHeader
        title={t("checkout.sectionHeader.shippingaddress")}
        tintColor={"darkgrey"}
        image="mapPinIcon"
        seeAllText="View All"
        color="primary"
        onPressSeeAll={() => {}}
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
          <FlatList
            data={addressData}
            keyExtractor={(item) => item.id.toString()}
            style={{
              paddingTop: 10,
            }}
            contentContainerStyle={{
              gap: getTokenValue("$reg"),
              paddingBottom: getTokenValue("$md"),
            }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            renderItem={({ item }) => (
              <AddressCard
                item={item}
                selectedAddress={selectedAddress}
                setSelectedAddress={setSelectedAddress}
                defaultBg="$white"
              />
            )}
          />
          <Divider />
          <Spacer size={"$sm"} />
          <YStack paddingTop="$md">
            <OpTouch onPress={() => router.push("/addAddress")}>
              <XStack alignItems="center" justifyContent="center">
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
            </OpTouch>
          </YStack>
          <Spacer size={"$md"} />
        </YStack>
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
            render={({ field: { onChange, value }, fieldState }) => (
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
                    width={"70%"}
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
        onPressSeeAll={() => bottomSheetRef.current?.handleOpenPress()}
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
                <TextMDBold>{"Standard Shipping"}</TextMDBold>
                <Spacer size={"$xs"} />
                <TextSMRegular>{"Estimated Delivery: 5-7 days"}</TextSMRegular>
                <Spacer size={"$xs-sm"} />
                <TextXSRegular color="$secondary">
                  {"Cost: $5 or free for orders over $50"}
                </TextXSRegular>
              </YStack>
            </XStack>
          </XStack>
        </YStack>
      </YStack>
      <BottomSheetModalWithView ref={bottomSheetRef}>
        <DeliveryBottomSheetContent bottomSheetRef={bottomSheetRef} />
      </BottomSheetModalWithView>
    </YStack>
  );
};

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
