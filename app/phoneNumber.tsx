import authApi from "@/api/endpoints/auth";
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
import useAuthStore from "@/store/useAuthStore";
import useUserStore from "@/store/useUserStore";
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
  const { token } = useAuthStore();
  const { updateUser, setProfileData, updateProfileData } = useUserStore();
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
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneNumberForm>({
    defaultValues: {
      phone: "",
    },
  });

  const onSubmit = async (data: PhoneNumberForm) => {
    // Prepare phone data
    const phoneData = {
      phoneNumber: data.phone.trim(),
      countryCode: selectedCountry.callingCode[0],
      countryName: selectedCountry.name,
      countryISO: selectedCountry.cca2,
      fullPhoneNumber: `+${selectedCountry.callingCode[0]}${data.phone.trim()}`,
    };

    // Store phone data in Zustand
    Object.keys(phoneData).forEach((key) => {
      updateProfileData(key, phoneData[key as keyof typeof phoneData]);
    });

    if (token) {
      setIsLoading(true);

      try {
        const completeProfileData = {
          phoneNumber: phoneData.fullPhoneNumber,
        };
        const response = await authApi.completeProfile(
          completeProfileData,
          token
        );
        console.log("Complete Profile Response:", response);
        if (
          response.success ||
          response.status === "success" ||
          response.message?.includes("successfully")
        ) {
          if (response.data?.user) {
            updateUser(response.data.user);
          }
          setProfileData({});
          console.log("Profile completed successfully ");
          router.push("/notification");
        } else {
          console.error("Failed to complete profile:", response.message);
          console.error("API returned success = false, not navigating");
        }
      } catch (error: any) {
        console.error("Error completing profile:", error);
        console.error("Error details:", error.response?.data || error.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("❌ No token found! Cannot call API. Please login again.");
      // Don't navigate without token
      alert("Session expired. Please login again.");
    }
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
              isLoading={isLoading}
              icon={<AppImage name="arrowRight" size={16} />}
            />
          </YStack>
        </YStack>
      </KeyboardAwareScrollView>
    </ScreenContainer>
  );
};

export default PhoneNumber;
