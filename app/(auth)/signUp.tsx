import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { OpTouch } from "@/components/atoms/OpTouch";
import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { Spacer } from "@/components/atoms/Spacer";
import { HeadingSMBold } from "@/components/atoms/texts/HeadingSMBold";
import { TextMDSemiBold } from "@/components/atoms/texts/TextMDSemiBold";
import { TextSMSemiBold } from "@/components/atoms/texts/TextSMSemiBold";
import { t } from "@/translations";
import { PrimaryButton } from "@/components/molecules/buttons/PrimaryButton";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { YStack } from "tamagui";
import PasswordStrengthBar from "./components/PasswordStrengthBar";

type SignUpForm = {
  email: string;
  password: string;
  confirmPassword: string;
};

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignUpForm>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignUpForm) => {
    setIsLoading(true);

    try {
      // Simulate API call
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      // Basic validation
      if (data.email === "" || data.password === "") {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        Alert.alert("Error", "Please enter a valid email address");
        return;
      }

      // Password validation
      if (data.password.length < 6) {
        Alert.alert("Error", "Password must be at least 6 characters long");
        return;
      }

      // Confirm password validation
      if (data.password !== data.confirmPassword) {
        Alert.alert("Error", "Passwords do not match");
        return;
      }

      // Success - navigate to main app
      console.log("Sign Up successful:", data);
      router.push("/(auth)/login");
    } catch (error) {
      Alert.alert("Error", "Sign Up failed. Please try again.");
      console.error("Sign Up error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer backgroundColor={"background"}>
      <KeyboardAwareScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardOpeningTime={0}
        keyboardDismissMode="interactive"
      >
        <Spacer size={"$xl"} />
        <YStack paddingHorizontal={"$md"} alignItems="center">
          <YStack
            shadowColor={"$primary"}
            shadowOffset={{ width: 0, height: 10 }}
            shadowOpacity={0.2}
            shadowRadius={4}
            backgroundColor="transparent"
          >
            <AppImage
              tintColor={"$primary"}
              name={"bag"}
              width={47}
              height={53}
            />
          </YStack>

          <Spacer size={"$lg"} />
          <HeadingSMBold>{t("auth.signup.title")}</HeadingSMBold>
          <Spacer size={"$2xl"} />

          <YStack width="100%">
            <TextSMSemiBold>{t("auth.signup.email")}</TextSMSemiBold>
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
                  placeholder={t("auth.signup.emailPlaceholder")}
                  icon={<AppImage name="emailIcon" size={16} />}
                  error={fieldState.error?.message}
                  keyboardType="email-address"
                  onSubmitEditing={() => form.setFocus("password")}
                />
              )}
            />
            <Spacer size={"$lg"} />
            <TextSMSemiBold>{t("auth.signup.password")}</TextSMSemiBold>
            <Spacer size={"$sm"} />
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
                  placeholder={t("auth.signup.passwordPlaceholder")}
                  icon={<AppImage name="lockIcon" size={16} />}
                  secureTextEntry
                  error={fieldState.error?.message}
                  onSubmitEditing={() => form.setFocus("confirmPassword")}
                />
              )}
            />
            <Spacer size={"$sm"} />
            <PasswordStrengthBar password={form.watch("password")} />
            <Spacer size={"$lg"} />
            <TextSMSemiBold>{t("auth.signup.confirmPassword")}</TextSMSemiBold>
            <Spacer size={"$sm"} />
            <Controller
              name="confirmPassword"
              control={form.control}
              rules={{
                required: t("validation.confirmPasswordRequired"),
                minLength: {
                  value: 6,
                  message: t("validation.confirmPasswordMinLength"),
                },
              }}
              render={({ field, fieldState }) => (
                <FormInput
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder={t("auth.signup.confirmPasswordPlaceholder")}
                  icon={<AppImage name="lockIcon" size={16} />}
                  secureTextEntry
                  error={fieldState.error?.message}
                  onSubmitEditing={form.handleSubmit(onSubmit)}
                />
              )}
            />
          </YStack>
        </YStack>
        <Spacer size={"$3xl"} />
        <YStack paddingHorizontal={"$md"}>
          <PrimaryButton
            onPress={form.handleSubmit(onSubmit)}
            isLoading={isLoading}
            label={t("common.createAccount")}
          />
        </YStack>
        <Spacer size={"$3xl"} />
        <OpTouch
          justifyContent="center"
          alignItems="center"
          disabled={isLoading}
          onPress={() => router.push("/(auth)/login")}
        >
          <TextMDSemiBold
            borderBottomWidth={1}
            color={"$primary"}
            borderBottomColor={"$primary"}
          >
            {t("auth.signup.alreadyHaveAccount")}
          </TextMDSemiBold>
        </OpTouch>
        <Spacer size={"$lg"} />
      </KeyboardAwareScrollView>
    </ScreenContainer>
  );
};

export default SignUp;
