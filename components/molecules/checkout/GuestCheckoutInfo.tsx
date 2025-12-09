import {
  TextMDSemiBold,
  TextSMRegular,
  TextSMSemiBold,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { useCustomAlert } from "@/components/molecules/CustomAlert";
import { unifiedCartApi } from "@/api/endpoints";
import { router } from "expo-router";
import { isValidPhoneNumber } from "libphonenumber-js";
import React, {
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import CountryPicker, {
  Country,
  CountryCode,
} from "react-native-country-picker-modal";
import { getTokenValue, XStack, YStack } from "tamagui";

type GuestInfoForm = {
  email: string;
  fullName: string;
  phone: string;
};

interface GuestCheckoutInfoProps {
  onStepComplete?: (info: { email: string; fullName: string; phone: string }) => void;
  onError?: () => void;
}

export interface GuestCheckoutInfoRef {
  handleContinue: () => void;
  isValid: () => boolean;
}

const GuestCheckoutInfo = forwardRef<GuestCheckoutInfoRef, GuestCheckoutInfoProps>(
  ({ onStepComplete, onError }, ref) => {
    const { showAlert, AlertComponent } = useCustomAlert();
    const [isSaving, setIsSaving] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<Country>({
      callingCode: ["1"],
      cca2: "US",
      currency: ["USD"],
      flag: "flag-us",
      name: "United States",
      region: "Americas",
      subregion: "North America",
    });
    const [showCountryPicker, setShowCountryPicker] = useState(false);

    const {
      control,
      handleSubmit,
      formState: { errors },
    } = useForm<GuestInfoForm>({
      defaultValues: {
        email: "",
        fullName: "",
        phone: "",
      },
    });

    const onSubmit = async (data: GuestInfoForm) => {
      setIsSaving(true);
      try {
        const fullPhoneNumber = `+${selectedCountry.callingCode[0]}${data.phone}`;

        // Save guest checkout info to backend
        await unifiedCartApi.saveGuestCheckoutInfo({
          email: data.email,
          phone: fullPhoneNumber,
          fullName: data.fullName,
        });

        console.log("[GuestCheckoutInfo] Guest info saved successfully");

        // Call parent callback to move to next step
        onStepComplete?.({
          email: data.email,
          fullName: data.fullName,
          phone: fullPhoneNumber,
        });
      } catch (error: any) {
        console.error("[GuestCheckoutInfo] Error saving guest info:", error);
        onError?.();
        showAlert({
          type: "error",
          title: "Error",
          message:
            error?.response?.data?.message ||
            "Failed to save contact information. Please try again.",
          buttons: [{ text: "OK" }],
        });
      } finally {
        setIsSaving(false);
      }
    };

    const onFormError = (errors: any) => {
      console.log("[GuestCheckoutInfo] Form validation failed:", errors);
      onError?.();
    };

    const onSelectCountry = (country: Country) => {
      setSelectedCountry(country);
      setShowCountryPicker(false);
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      handleContinue: () => {
        if (isSaving) {
          console.log("[GuestCheckoutInfo] Already saving, please wait...");
          return;
        }
        handleSubmit(onSubmit, onFormError)();
      },
      isValid: () => {
        return true;
      },
    }));

    return (
      <YStack>
        {/* Header Section */}
        <YStack paddingHorizontal={"$md"} paddingTop={"$md"}>
          <TextMDSemiBold>Checkout as Guest</TextMDSemiBold>
          <Spacer size={"$xs"} />
          <TextSMRegular color="$secondary">
            Please provide your contact information to continue with your order.
          </TextSMRegular>
        </YStack>

        <Spacer size={"$xl"} />

        {/* Email Section */}
        <SectionHeader
          title="Email Address"
          tintColor={"darkgrey"}
          image="emailIcon"
        />
        <Spacer size={"$reg"} />
        <YStack paddingHorizontal={"$md"}>
          <Controller
            control={control}
            name="email"
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address",
              },
            }}
            render={({ field: { onChange, value }, fieldState }) => (
              <>
                <FormInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon={<AppImage name="emailIcon" size={16} />}
                  error={fieldState.error?.message}
                />
              </>
            )}
          />
        </YStack>

        <Spacer size={"$xl"} />

        {/* Full Name Section */}
        <SectionHeader
          title="Full Name"
          tintColor={"darkgrey"}
          image="userIcon"
        />
        <Spacer size={"$reg"} />
        <YStack paddingHorizontal={"$md"}>
          <Controller
            control={control}
            name="fullName"
            rules={{
              required: "Full name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters",
              },
            }}
            render={({ field: { onChange, value }, fieldState }) => (
              <>
                <FormInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                  icon={<AppImage name="userIcon" size={16} />}
                  error={fieldState.error?.message}
                />
              </>
            )}
          />
        </YStack>

        <Spacer size={"$xl"} />

        {/* Phone Number Section */}
        <SectionHeader
          title="Phone Number"
          tintColor={"darkgrey"}
          image="mobileIcon"
        />
        <Spacer size={"$reg"} />
        <YStack paddingHorizontal={"$md"}>
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
                    const fullPhoneNumber = `+${selectedCountry.callingCode[0]}${value}`;
                    if (!isValidPhoneNumber(fullPhoneNumber)) {
                      return "Invalid phone number for selected country";
                    }
                    return true;
                  } catch (error) {
                    return "Invalid phone number";
                  }
                },
              }}
              render={({ field: { onChange, value } }) => (
                <XStack alignItems="center">
                  <OpTouch onPress={() => setShowCountryPicker(true)}>
                    <XStack
                      alignItems="center"
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
                        const numericText = text.replace(/[^0-9]/g, "");
                        onChange(numericText);
                      }}
                      placeholder="Enter phone number"
                    />
                  </XStack>
                </XStack>
              )}
            />
          </YStack>
          {errors.phone && (
            <TextSMRegular color="$error">{errors.phone.message}</TextSMRegular>
          )}
        </YStack>

        <Spacer size={"$2xl"} />

        {/* Create Account Prompt */}
        <YStack
          paddingHorizontal={"$md"}
          paddingVertical={"$md"}
          backgroundColor="$background"
          marginHorizontal={"$md"}
          borderRadius={"$md"}
        >
          <TextSMSemiBold>Already have an account?</TextSMSemiBold>
          <Spacer size={"$xs"} />
          <TextSMRegular color="$secondary">
            Sign in to access your saved addresses and faster checkout.
          </TextSMRegular>
          <Spacer size={"$md"} />
          <OpTouch onPress={() => router.push("/(auth)/login")}>
            <TextSMSemiBold color="$primary">Sign In</TextSMSemiBold>
          </OpTouch>
        </YStack>

        <AlertComponent />
      </YStack>
    );
  }
);

export default GuestCheckoutInfo;
