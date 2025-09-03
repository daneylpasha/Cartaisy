import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { OpTouch } from "@/components/atoms/OpTouch";
import { ScreenContainer } from "@/components/atoms/ScreenContainer";
import { Spacer } from "@/components/atoms/Spacer";
import {
  HeadingSMBold,
  ParagraphMD,
  TextMDMedium,
  TextMDSemiBold,
  TextSMSemiBold,
} from "@/components/atoms/texts";
import { PrimaryButton } from "@/components/molecules/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/molecules/buttons/SecondaryButton";
import { t } from "@/translations";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getTokenValue, XStack, YStack } from "tamagui";
type LoginForm = {
  email: string;
  password: string;
};

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const form = useForm<LoginForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

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

      // Success - navigate to main app
      console.log("Login successful:", data);
      router.push("/fullName");
      // router.push("/(tabs)");
    } catch (error) {
      Alert.alert("Error", "Login failed. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const googleLogin = async () => {
    console.log("Google Login");
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
        extraScrollHeight={20}
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
          <HeadingSMBold>{t("auth.login.title")}</HeadingSMBold>
          <Spacer size={"$2xl"} />

          <YStack width="100%">
            <TextSMSemiBold>{t("auth.login.email")}</TextSMSemiBold>
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
                  placeholder={t("auth.login.emailPlaceholder")}
                  icon={<AppImage name="emailIcon" size={16} />}
                  error={fieldState.error?.message}
                  keyboardType="email-address"
                  onSubmitEditing={() => form.setFocus("password")}
                />
              )}
            />
            <Spacer size={"$lg"} />
            <TextSMSemiBold>{t("auth.login.password")}</TextSMSemiBold>
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
                  placeholder={t("auth.login.passwordPlaceholder")}
                  icon={<AppImage name="lockIcon" size={16} />}
                  secureTextEntry
                  error={fieldState.error?.message}
                  onSubmitEditing={form.handleSubmit(onSubmit)}
                />
              )}
            />
          </YStack>
        </YStack>
        <Spacer size={"$md"} />
        <YStack paddingHorizontal={"$md"}>
          <XStack onPress={() => setIsChecked(!isChecked)} alignItems="center">
            {isChecked ? (
              <YStack
                alignItems="center"
                justifyContent="center"
                width={16}
                height={16}
                borderRadius={"$full"}
                backgroundColor={getTokenValue("$primary")}
              >
                <AppImage
                  tintColor={getTokenValue("$white")}
                  name={"check"}
                  width={8}
                  height={8}
                />
              </YStack>
            ) : (
              <YStack
                alignItems="center"
                justifyContent="center"
                width={getTokenValue("$md")}
                height={getTokenValue("$md")}
                borderRadius={"$full"}
                borderWidth={1}
              />
            )}
            <Spacer size={"$xs-sm"} />
            <TextMDMedium>{t("auth.login.rememberMe")}</TextMDMedium>
          </XStack>
          <Spacer size={"$lg"} />
          <PrimaryButton
            onPress={form.handleSubmit(onSubmit)}
            isLoading={isLoading}
            label={t("common.login")}
          />
          <Spacer size={"$reg"} />
          <SecondaryButton
            onPress={() => router.push("/(auth)/signUp")}
            label={t("auth.login.createNewAccount")}
          />

          <Spacer size={"$md"} />
          <XStack alignItems="center" gap={"$xs"}>
            <YStack
              alignItems="center"
              height={1}
              backgroundColor={"$lightgrey"}
              width={"42%"}
              gap={"$xs"}
            />
            <Spacer size={"$reg"} />
            <ParagraphMD>{t("common.or")}</ParagraphMD>
            <Spacer size={"$reg"} />
            <YStack
              alignItems="center"
              height={1}
              backgroundColor={"$lightgrey"}
              width={142}
              gap={"$xs"}
            />
          </XStack>

          <Spacer size={"$md"} />

          <OpTouch
            justifyContent="center"
            alignItems="center"
            backgroundColor={"white"}
            shadowColor={"black"}
            shadowOffset={{ width: 0, height: 8 }}
            shadowOpacity={0.05}
            shadowRadius={16}
            borderRadius={"full"}
            paddingHorizontal={"md"}
            paddingVertical={"reg"}
            disabled={isLoading}
            onPress={googleLogin}
          >
            <XStack alignItems="center">
              <AppImage name="googleIcon" size={23.5} />
              <Spacer size={"$reg"} />
              <TextMDSemiBold color={"$black"}>
                {t("auth.login.signInWithGoogle")}
              </TextMDSemiBold>
            </XStack>
          </OpTouch>
          <Spacer size={"$2xl"} />
          <OpTouch
            justifyContent="center"
            alignItems="center"
            disabled={isLoading}
            onPress={() => router.push("/(auth)/forgotPassword")}
          >
            <TextMDSemiBold
              borderBottomWidth={1}
              color={"$primary"}
              borderBottomColor={"$primary"}
            >
              {t("auth.login.forgotPassword")}
            </TextMDSemiBold>
          </OpTouch>
        </YStack>
        <Spacer size={"$lg"} />
      </KeyboardAwareScrollView>
    </ScreenContainer>
  );
};

export default Login;
