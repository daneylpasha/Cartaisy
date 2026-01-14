import authApi from "@/api/endpoints/auth";
import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { HeadingXSBold } from "@/components/atoms/texts/HeadingXSBold";
import { ParagraphMD } from "@/components/atoms/texts/ParagraphMD";
import { TextSMRegular } from "@/components/atoms/texts/TextSMRegular";
import { TextSMSemiBold } from "@/components/atoms/texts/TextSMSemiBold";
import { PrimaryButton } from "@/components/molecules/buttons/PrimaryButton";
import { tokens } from "@/tamagui/token";
import { t } from "@/translations";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Linking } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { XStack, YStack } from "tamagui";
type ForgotPasswordForm = {
  email: string;
};

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<ForgotPasswordForm>({
    defaultValues: {
      email: "",
    },
  });

  const openSupportEmail = async () => {
    const to = "help@cartaisy.com";
    const subject = "Cartaisy Support";
    const body = "Assalam-o-Alaikum,\n\nMujhe madad chahiye regarding ...";

    const s = encodeURIComponent(subject);
    const b = encodeURIComponent(body);
    const mailto = `mailto:${to}?subject=${s}&body=${b}`;

    try {
      const can = await Linking.canOpenURL(mailto);
      if (can) {
        await Linking.openURL(mailto); // Apple Mail / default mail app
        return;
      }
    } catch {
      // ignore and try web fallback
    }

    // Fallback: Gmail web compose (Simulator/real device dono par)
    try {
      await Linking.openURL(
        `https://mail.google.com/mail/?view=cm&to=${to}&su=${s}&body=${b}`
      );
    } catch {
      Alert.alert("Couldn't open email", `Please email us at ${to}`);
    }
  };
  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword({ email: data.email });
      router.push({
        pathname: "/(auth)/passwordResetSent",
        params: { email: data.email, from: "forgot" },
      });
    } catch (error: any) {
      // For security, always navigate to success screen even on error
      // This prevents email enumeration attacks
      // Only show error for actual server/network errors
      if (error?.response?.status >= 500 || !error?.response) {
        Alert.alert(
          "Error",
          error?.response?.data?.message || "Something went wrong. Please try again."
        );
      } else {
        // Backend might return 404 for non-existent email, but we still show success
        router.push({
          pathname: "/(auth)/passwordResetSent",
          params: { email: data.email, from: "forgot" },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <YStack flex={1} backgroundColor={"$background"}>
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
        <Spacer size={"$4xl"} />
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
              tintColor={tokens.color.primary}
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
                  keyboardType="email-address"
                  onSubmitEditing={form.handleSubmit(onSubmit)}
                />
              )}
            />
            <Spacer size={"$xl"} />
            <PrimaryButton
              onPress={form.handleSubmit(onSubmit)}
              isLoading={isLoading}
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
                <OpTouch onPress={openSupportEmail}>
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
      </KeyboardAwareScrollView>
    </YStack>
  );
};

export default ForgotPassword;
