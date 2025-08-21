import {
  HeadingSMBold,
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
import { fonts } from "@/tamagui/fonts";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, StyleSheet, TextInput } from "react-native";
import CountryPicker, {
  Country,
  CountryCode,
} from "react-native-country-picker-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, XStack, YStack } from "tamagui";
import { SHADOW_STYLES } from "@/constants/styles";
const AddAddress = () => {
  const form = useForm();
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    callingCode: ["44"],
    cca2: "GB",
    currency: ["GBP"],
    flag: "flag-gb",
    name: "United Kingdom",
    region: "Europe",
    subregion: "Northern Europe",
  });

  const { bottom: bottomSafeAreaInset } = useSafeAreaInsets();

  const onSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
  };

  return (
    <YStack
      backgroundColor="$background"
      paddingBottom={bottomSafeAreaInset}
      flex={1}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        // contentContainerStyle={{ paddingBottom: bottomSafeAreaInset }}
        //   contentContainerStyle={{ flexGrow: 1 }}
      >
        <YStack padding={"$md"}>
          <HeadingSMBold>{"Add a new address"}</HeadingSMBold>
          <Spacer size={"$sm"} />
          <ParagraphMD>
            {"Please fill in the following details to continue"}
          </ParagraphMD>
        </YStack>
        <Spacer size={"$lg"} />
        <YStack paddingHorizontal={"$md"}>
          <TextSMSemiBold>{"Address Name"}</TextSMSemiBold>
          <Spacer size={"$sm"} />
          <Controller
            name="addressName"
            control={form.control}
            rules={{
              required: "Address Name is required",
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
                  paddingHorizontal={16}
                  onChangeText={field.onChange}
                  placeholder={"Lily 2, London"}
                  width={"90%"}
                  borderWidth={0}
                  icon={
                    <AppImage
                      tintColor={getTokenValue("$secondary")}
                      name="locationUnfilled"
                      width={14}
                      height={18}
                    />
                  }
                  error={fieldState.error?.message}
                />
                <AppImage name="warningIcon" width={16} height={16} />
              </XStack>
            )}
          />
          <Spacer size={"$reg"} />
          <TextSMSemiBold>{"Country"}</TextSMSemiBold>
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
          <TextSMSemiBold>{"Street Address"}</TextSMSemiBold>
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
                  error={fieldState.error?.message}
                />
                <OpTouch>
                  <AppImage name="editIcon" width={16} height={16} />
                </OpTouch>
              </XStack>
            )}
          />
          <Spacer size={"$reg"} />
          <TextSMSemiBold>{"Apartment/Suite"}</TextSMSemiBold>
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
                  error={fieldState.error?.message}
                />
                <OpTouch>
                  <AppImage name="editIcon" width={16} height={16} />
                </OpTouch>
              </XStack>
            )}
          />
          <Spacer size={"$reg"} />
          <XStack width={"100%"}>
            <YStack flex={1}>
              <TextSMSemiBold>{"State / Province"}</TextSMSemiBold>
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
                    error={fieldState.error?.message}
                  />
                )}
              />
            </YStack>
            <Spacer size={"$sm"} />
            <YStack flex={1}>
              <TextSMSemiBold>{"Postcode"}</TextSMSemiBold>
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
                    error={fieldState.error?.message}
                  />
                )}
              />
            </YStack>
          </XStack>
          <Spacer size={"$reg"} />
          <TextSMSemiBold>{"Delivery Instructions (Optional)"}</TextSMSemiBold>
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
              name="apartmentSuite"
              control={form.control}
              rules={{
                required: "Apartment Suite is required",
              }}
              render={({ field, fieldState }) => (
                <>
                  <TextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder={
                      "Please just put the package on the front door. Thanks a lot! 😊"
                    }
                    multiline={true}
                    numberOfLines={8}
                    textAlignVertical="top"
                    placeholderTextColor={getTokenValue("$textgrey")}
                    style={Styles.input}
                    //   error={fieldState.error?.message}
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
              <TextXSRegular color="$secondary">{"300/200"}</TextXSRegular>
              <AppImage name="noteIcon" width={12} height={12} />
            </XStack>
          </YStack>
          <Spacer size={"$lg"} />
        </YStack>
      </ScrollView>
      <YStack paddingHorizontal={"$md"}>
        <PrimaryButton
          label="Add Address"
          onPress={() => {}}
          width={"100%"}
          iconPosition="left"
          icon={
            <AppImage
              tintColor={getTokenValue("$white")}
              name="addIcon"
              width={16}
              height={16}
            />
          }
          isLoading={false}
        />
      </YStack>
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
