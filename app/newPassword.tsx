import authApi from "@/api/endpoints/auth";
import { HeadingSMBold, ParagraphLG, TextMDMedium } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { Spacer } from "@/components/atoms/Spacer";
import { PrimaryButton } from "@/components/molecules/buttons";
import { t, tArray } from "@/translations";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";

import { Controller, useForm } from "react-hook-form";
import { Alert, FlatList, ListRenderItem } from "react-native";
import { getTokenValue, XStack, YStack } from "tamagui";

type NewPasswordForm = {
  newPassword: string;
  confirmPassword: string;
};

const ListsItem = tArray("newpassword.Lists");

const NewPassword = () => {
  const params = useLocalSearchParams<{
    token?: string; // From email deep link (reset flow)
    currentPassword?: string; // From change password screen
    flow?: string; // "change" or "reset"
  }>();

  const [isLoading, setIsLoading] = useState(false);

  // Determine which flow we're in
  const isResetFlow = !!params.token;
  const isChangeFlow = params.flow === "change" || !!params.currentPassword;

  const form = useForm<NewPasswordForm>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: NewPasswordForm) => {
    // Validate passwords match
    if (data.newPassword !== data.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      if (isResetFlow && params.token) {
        // Reset password flow (from email link)
        await authApi.resetPassword({
          token: params.token,
          password: data.newPassword,
          confirmPassword: data.confirmPassword,
        });

        Alert.alert("Success", "Your password has been reset successfully!", [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/login"),
          },
        ]);
      } else if (isChangeFlow && params.currentPassword) {
        // Change password flow (from settings)
        const { axiosInstance } = await import("@/api/apiClient");
        await axiosInstance.post("/customer/auth/change-password", {
          currentPassword: params.currentPassword,
          newPassword: data.newPassword,
        });

        Alert.alert(
          "Success",
          "Your password has been changed successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                // Go back twice to return to profile/settings
                router.back();
                router.back();
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", "Invalid password flow. Please try again.");
        router.back();
      }
    } catch (error: any) {
      console.error("[NewPassword] Error:", error);

      const errorMessage =
        error?.response?.data?.message ||
        "Failed to update password. Please try again.";

      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderLists: ListRenderItem<string> = ({ item }) => (
    <XStack alignItems="center">
      <YStack
        alignItems="center"
        justifyContent="center"
        width={20}
        height={20}
        borderRadius={"$full"}
        backgroundColor={getTokenValue("$primary")}
      >
        <AppImage
          tintColor={getTokenValue("$white")}
          name={"check"}
          width={12}
          height={12}
        />
      </YStack>
      <Spacer size={"$sm"} />
      <TextMDMedium>{item}</TextMDMedium>
    </XStack>
  );

  return (
    <YStack
      alignItems="center"
      flex={1}
      backgroundColor={"$background"}
      paddingHorizontal={"$md"}
    >
      <Spacer size={"$3xl"} />
      <AppImage name="shieldFrame" width={106} height={141} />
      <Spacer size={"$xl"} />
      <HeadingSMBold>{t("newpassword.title")}</HeadingSMBold>
      <Spacer size={"$reg"} />
      <ParagraphLG color={"$secondary"}>{t("newpassword.subtitle")}</ParagraphLG>
      <Spacer size={"$xl"} />

      {/* New Password Field */}
      <Controller
        name="newPassword"
        control={form.control}
        rules={{
          required: t("validation.passwordRequired"),
          minLength: {
            value: 8,
            message: t("validation.passwordMinLength"),
          },
        }}
        render={({ field, fieldState }) => (
          <FormInput
            value={field.value}
            onChangeText={field.onChange}
            placeholder={"New password"}
            icon={
              <AppImage
                name="lockUnfilled"
                tintColor={getTokenValue("$icon")}
                size={16}
              />
            }
            secureTextEntry
            error={fieldState.error?.message}
            onSubmitEditing={() => form.setFocus("confirmPassword")}
          />
        )}
      />
      <Spacer size={"$md"} />

      {/* Confirm Password Field */}
      <Controller
        name="confirmPassword"
        control={form.control}
        rules={{
          required: "Please confirm your password",
          validate: (value) =>
            value === form.getValues("newPassword") || "Passwords do not match",
        }}
        render={({ field, fieldState }) => (
          <FormInput
            value={field.value}
            onChangeText={field.onChange}
            placeholder={"Confirm password"}
            icon={
              <AppImage
                name="lockUnfilled"
                tintColor={getTokenValue("$icon")}
                size={16}
              />
            }
            secureTextEntry
            error={fieldState.error?.message}
            onSubmitEditing={form.handleSubmit(onSubmit)}
          />
        )}
      />
      <Spacer size={"$md"} />

      <YStack width="100%">
        <FlatList
          data={ListsItem}
          renderItem={renderLists}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <Spacer size={"$sm"} />}
          style={{ flexGrow: 0 }}
        />
      </YStack>
      <Spacer size={"$xl"} />
      <YStack width="100%" paddingBottom={"$md"}>
        <PrimaryButton
          label={t("newpassword.title")}
          onPress={form.handleSubmit(onSubmit)}
          icon={
            <AppImage
              name="lockIcon"
              tintColor={getTokenValue("$white")}
              size={15}
            />
          }
          isLoading={isLoading}
        />
      </YStack>
    </YStack>
  );
};

export default NewPassword;
