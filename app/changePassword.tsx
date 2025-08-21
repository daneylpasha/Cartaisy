import { HeadingSMBold, ParagraphLG } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { Spacer } from "@/components/atoms/Spacer";
import { PrimaryButton } from "@/components/molecules/buttons";
import { t } from "@/translations";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { YStack } from "tamagui";
type ChPasswordForm = {
  password: string;
};
const ChangePassword = () => {
  const form = useForm<ChPasswordForm>({
    defaultValues: {
      password: "",
    },
  });

  return (
    <YStack
      //   justifyContent="center"
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
            placeholder={t("auth.login.passwordPlaceholder")}
            icon={<AppImage name="lockIcon" size={16} />}
            secureTextEntry
            error={fieldState.error?.message}
          />
        )}
      />
      <Spacer size={"$xl"} />
      <PrimaryButton
        isLoading={false}
        label="Change password"
        iconPosition="right"
        icon="lock"
      />
    </YStack>
  );
};

export default ChangePassword;
