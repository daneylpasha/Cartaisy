import {
  HeadingXSRegular,
  TextMDSemiBold,
  TextSMRegular,
  TextSMSemiBold,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { OpTouch } from "@/components/atoms/OpTouch";
import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { Spacer } from "@/components/atoms/Spacer";
import { PrimaryButton } from "@/components/molecules/buttons";
import { t } from "@/translations";
import { router } from "expo-router";
import { isValidPhoneNumber } from "libphonenumber-js";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import CountryPicker, {
  Country,
  CountryCode,
} from "react-native-country-picker-modal";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getTokenValue, XStack, YStack } from "tamagui";

type PhoneNumberForm = {
  phone: string;
};

const PhoneNumber = () => {
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
    // Alert.alert("Submitted!", `Phone: ${fullPhoneNumber}`);
    router.push("/notification");
  };

  const onSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
  };

  return (
    <ScreenContainer backgroundColor="background">
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
        <YStack paddingHorizontal={"$md"}>
          <Spacer size={"$2xl"} />
          <AppImage name="bag" width={46} height={52} />
          <Spacer size={"$xl"} />
          <HeadingXSRegular>{t("profile.phoneNumber.title")}</HeadingXSRegular>
          <Spacer size={"$7xl"} />
          <Spacer size={"$8xl"} />
          <TextSMSemiBold>{t("profile.phoneNumber.label")}</TextSMSemiBold>
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
                validate: (value) => {
                  if (!value) return "Phone number is required";

                  try {
                    // Create full phone number with country code
                    const fullPhoneNumber = `+${selectedCountry.callingCode[0]}${value}`;

                    // Validate using libphonenumber-js
                    if (!isValidPhoneNumber(fullPhoneNumber)) {
                      return `Invalid phone number  `;
                    }

                    return true;
                  } catch (error) {
                    return `Invalid phone number `;
                  }
                },
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

          <Spacer size={"$lg"} />
          <YStack alignItems="center" justifyContent="center">
            <AppImage name="phoneLogo" width={24} height={24} />
          </YStack>
          <Spacer size={"$md"} />
          <TextSMRegular textAlign="center" color={"$secondary"}>
            {t("profile.phoneNumber.identityMessage")}
          </TextSMRegular>
          <Spacer size={"$5xl"} />
          <YStack>
            <PrimaryButton
              label={t("common.continue")}
              onPress={handleSubmit(onSubmit)}
              isLoading={false}
              icon={<AppImage name="arrowRight" size={16} />}
            />
          </YStack>
        </YStack>
      </KeyboardAwareScrollView>
    </ScreenContainer>
  );
};

export default PhoneNumber;
