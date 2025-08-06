import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { OpTouch } from "@/components/atoms/OpTouch";
import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { Spacer } from "@/components/atoms/Spacer";
import { HeadingXSBold } from "@/components/atoms/texts/HeadingXSBold";
import { ParagraphMD } from "@/components/atoms/texts/ParagraphMD";
import { TextSMRegular } from "@/components/atoms/texts/TextSMRegular";
import { TextSMSemiBold } from "@/components/atoms/texts/TextSMSemiBold";
import { PrimaryButton } from "@/components/molecules/buttons/PrimaryButton";
import { t } from "@/translations";
import { router } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { XStack, YStack } from "tamagui";

type ForgotPasswordForm = {
  email: string;
};

const ForgotPassword = () => {
  const form = useForm<ForgotPasswordForm>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    console.log(data);
    router.push("/(auth)/passwordResetSent");
  };

  return (
    <ScreenContainer backgroundColor={"background"}>
      <Spacer size={"$5xl"} />
      <YStack paddingHorizontal={"$md"} alignItems="center">
        <YStack
          backgroundColor="$primarylight"
          borderRadius={20}
          width={140}
          height={140}
          alignItems="center"
          justifyContent="center"
        >
          <AppImage
            tintColor={"$primary"}
            name={"lock"}
            width={75}
            height={98}
          />
        </YStack>

        <Spacer size={"$xl"} />
        <HeadingXSBold>{t("auth.forgotPassword.title")}</HeadingXSBold>
        <Spacer size={"$reg"} />
        <ParagraphMD color={"$secondary"} textAlign="center">
          {t("auth.forgotPassword.subtitle")}
        </ParagraphMD>
        <Spacer size={"$xl"} />

        <YStack width="100%">
          <TextSMSemiBold>{t("auth.forgotPassword.email")}</TextSMSemiBold>
          <Spacer size={"$sm"} />
          <Controller
            name="email"
            control={form.control}
            rules={{
              required: t("validation.emailRequired"),
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t("validation.emailInvalid"),
              },
            }}
            render={({ field, fieldState }) => (
              <FormInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder={t("auth.forgotPassword.emailPlaceholder")}
                icon={<AppImage name="emailIcon" size={16} />}
                error={fieldState.error?.message}
              />
            )}
          />
          <Spacer size={"$xl"} />
          <PrimaryButton
            onPress={form.handleSubmit(onSubmit)}
            isLoading={false}
            label={t("common.continue")}
          />
          <Spacer size={"$xl"} />
          <YStack alignItems="center">
            <TextSMRegular color={"$secondary"}>
              {t("auth.forgotPassword.dontRememberEmail")}
            </TextSMRegular>
            <XStack alignItems="center" gap={"$xs"}>
              <TextSMRegular color={"$secondary"}>
                {t("auth.forgotPassword.contactSupport")}
              </TextSMRegular>
              <OpTouch>
                <TextSMRegular
                  borderBottomWidth={1}
                  fontWeight={"700"}
                  color={"$primary"}
                >
                  {t("common.url.help")}
                </TextSMRegular>
              </OpTouch>
            </XStack>
          </YStack>
        </YStack>
      </YStack>
    </ScreenContainer>
  );
};

export default ForgotPassword;
