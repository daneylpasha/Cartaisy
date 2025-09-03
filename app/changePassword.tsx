import { HeadingSMBold, ParagraphLG, TextSMMedium } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { Spacer } from "@/components/atoms/Spacer";
import { PrimaryButton } from "@/components/molecules/buttons";
import { t } from "@/translations";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";

import { Controller, useForm } from "react-hook-form";
import { getTokenValue, XStack, YStack } from "tamagui";
type ChPasswordForm = {
  password: string;
};
const ChangePassword = () => {
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const form = useForm<ChPasswordForm>({
    defaultValues: {
      password: "",
    },
  });

  const pwd = form.watch("password");

  useEffect(() => {
    if (errorBanner && pwd === "1234567") {
      setErrorBanner(null);
    }
  }, [pwd, errorBanner]);

  const onSubmit = async (data: ChPasswordForm) => {
    if (data.password === "1234567") {
      setErrorBanner(null);
      router.push("/newPassword");
    } else {
      setErrorBanner("ERROR: Password do not match!");
      setTimeout(() => setErrorBanner(null), 2500);
    }
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
        Enter your current password
      </ParagraphLG>
      <Spacer size={"$xl"} />
      <Controller
        name="password"
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
      <Spacer size={"$md"} />
      {errorBanner && (
        <YStack
          alignItems="center"
          width={"100%"}
          gap="$xs"
          borderWidth={1}
          borderColor="red"
          padding="$sm"
          borderRadius="$2xl"
          backgroundColor="#FFF1F2"
        >
          <XStack alignItems="center" justifyContent="center">
            <AppImage
              name="warningIcon"
              size={14}
              tintColor={getTokenValue("$error")}
            />
            <Spacer size={"$sm"} />
            <TextSMMedium textAlign="center">{errorBanner}</TextSMMedium>
          </XStack>
        </YStack>
      )}
      <Spacer size={"$md"} />
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
