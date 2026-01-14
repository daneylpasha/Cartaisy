import { HeadingSMBold, ParagraphLG } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { Spacer } from "@/components/atoms/Spacer";
import { PrimaryButton } from "@/components/molecules/buttons";
import { t } from "@/translations";
import { router } from "expo-router";
import React from "react";

import { Controller, useForm } from "react-hook-form";
import { getTokenValue, YStack } from "tamagui";
type ChPasswordForm = {
  currentPassword: string;
};
const ChangePassword = () => {
  const form = useForm<ChPasswordForm>({
    defaultValues: {
      currentPassword: "",
    },
  });

  const onSubmit = async (data: ChPasswordForm) => {
    // Navigate to new password screen with current password
    router.push({
      pathname: "/newPassword",
      params: {
        currentPassword: data.currentPassword,
        flow: "change",
      },
    });
  };

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
      <HeadingSMBold>{"Change Password"}</HeadingSMBold>
      <Spacer size={"$reg"} />
      <ParagraphLG color={"$secondary"}>
        {"Enter your current password"}
      </ParagraphLG>
      <Spacer size={"$xl"} />
      <Controller
        name="currentPassword"
        control={form.control}
        rules={{
          required: t("validation.passwordRequired"),
          minLength: {
            value: 6,
            message: t("validation.passwordMinLength"),
          },
        }}
        render={({ field, fieldState }) => (
          <FormInput
            value={field.value}
            onChangeText={field.onChange}
            placeholder={"••••••••••••"}
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
      <Spacer size={"$xl"} />
      <PrimaryButton
        label="Change password"
        onPress={form.handleSubmit(onSubmit)}
        icon={
          <AppImage
            name="lockIcon"
            tintColor={getTokenValue("$white")}
            size={15}
          />
        }
        isLoading={false}
      />
    </YStack>
  );
};

export default ChangePassword;
