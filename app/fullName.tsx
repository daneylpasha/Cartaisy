import authApi from "@/api/endpoints/auth";
import {
  HeadingXSRegular,
  TextSMRegular,
  TextSMSemiBold,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { Spacer } from "@/components/atoms/Spacer";
import { PrimaryButton } from "@/components/molecules/buttons";
import useAuthStore from "@/store/useAuthStore";
import useUserStore from "@/store/useUserStore";
import { t } from "@/translations";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { YStack } from "tamagui";
type FullnameForm = {
  fullname: string;
};

const Fullname = () => {
  const { token } = useAuthStore();
  const { updateProfileData, updateUser, profileData } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FullnameForm>({
    defaultValues: {
      fullname: profileData.fullName || "",
    },
  });

  const onSubmit = async (data: FullnameForm) => {
    // Store fullName in Zustand store first
    updateProfileData("fullName", data.fullname.trim());

    // If user has token, call API directly, otherwise just go to next screen
    if (token) {
      setIsLoading(true);
      try {
        // API expects field and value structure
        const completeProfileData = {
          fullName: data.fullname.trim(),
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
          // Update user data in store
          if (response.data?.user) {
            updateUser(response.data.user);
          }

          console.log(
            "Profile updated successfully with fullName - Navigating to phoneNumber"
          );
          router.push("/phoneNumber");
        } else {
          console.error("Failed to update profile:", response.message);
        }
      } catch (error: any) {
        console.error("Error updating profile:", error);
        console.error("Error details:", error.response?.data || error.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("❌ No token found! Cannot call API. Please login again.");
      // Don't navigate without token - user needs to complete registration properly
      alert("Session expired. Please login again.");
    }
  };

  return (
    <ScreenContainer backgroundColor={"$background"}>
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
          <HeadingXSRegular>{t("profile.fullName.title")}</HeadingXSRegular>
          <Spacer size={"$7xl"} />
          <Spacer size={"$8xl"} />
          <TextSMSemiBold>{t("profile.fullName.label")}</TextSMSemiBold>
          <Spacer size={"$sm"} />
          <Controller
            name="fullname"
            control={form.control}
            rules={{
              required: t("validation.fullNameRequired"),
            }}
            render={({ field, fieldState }) => (
              <FormInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder={t("profile.fullName.placeholder")}
                icon={<AppImage name="userIcon" size={16} />}
                error={fieldState.error?.message}
                onSubmitEditing={form.handleSubmit(onSubmit)}
              />
            )}
          />
          <Spacer size={"$lg"} />
          <YStack alignItems="center" justifyContent="center">
            <AppImage name="userIdentity" width={24} height={24} />
          </YStack>
          <Spacer size={"$md"} />
          <TextSMRegular textAlign="center" color={"$secondary"}>
            {t("profile.fullName.identityMessage")}
          </TextSMRegular>
          <Spacer size={"$5xl"} />
          <YStack>
            <PrimaryButton
              label={t("common.continue")}
              onPress={form.handleSubmit(onSubmit)}
              isLoading={isLoading}
              icon={<AppImage name="arrowRight" size={16} />}
            />
          </YStack>
        </YStack>
      </KeyboardAwareScrollView>
    </ScreenContainer>
  );
};

export default Fullname;
